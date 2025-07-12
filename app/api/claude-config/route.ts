import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get Claude provider configuration for this user
    const { data: config, error } = await supabase
      .from('sdlc_user_ai_configurations')
      .select(`
        id,
        encrypted_api_key,
        is_active,
        usage_limits,
        last_used,
        created_at,
        updated_at,
        sdlc_ai_providers!inner (
          id,
          name,
          type,
          capabilities,
          cost_model
        )
      `)
      .eq('user_id', user.id)
      .eq('sdlc_ai_providers.type', 'anthropic')
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching Claude config:', error)
      return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 })
    }

    if (!config) {
      return NextResponse.json({ 
        connected: false,
        message: 'No Claude configuration found'
      })
    }

    return NextResponse.json({ 
      connected: true,
      provider: config.sdlc_ai_providers,
      hasApiKey: !!config.encrypted_api_key,
      usageLimits: config.usage_limits,
      lastUsed: config.last_used
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { apiKey, model, usageLimits } = await request.json()

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({ 
        error: 'API key is required' 
      }, { status: 400 })
    }

    if (!apiKey.startsWith('sk-ant-')) {
      return NextResponse.json({ 
        error: 'Invalid Claude API key format. Keys should start with "sk-ant-"'
      }, { status: 400 })
    }

    // Get Claude provider
    const { data: provider, error: providerError } = await supabase
      .from('sdlc_ai_providers')
      .select('*')
      .eq('type', 'anthropic')
      .eq('is_active', true)
      .single()

    if (providerError || !provider) {
      console.error('Claude provider not found:', providerError)
      return NextResponse.json({ 
        error: 'Claude provider not available' 
      }, { status: 500 })
    }

    // Test the API key by making a simple request directly
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const anthropic = new Anthropic({
        apiKey: apiKey.trim(),
      })

      // Test with a minimal request
      await anthropic.messages.create({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ]
      })
    } catch (apiError: any) {
      console.error('Claude API test error:', apiError)
      
      let errorMessage = 'Invalid API key or connection failed'
      
      if (apiError.status === 401) {
        errorMessage = 'Invalid API key. Please check your Anthropic Console for the correct key.'
      } else if (apiError.status === 403) {
        errorMessage = 'API key does not have permission to use Claude. Please check your billing and usage limits.'
      } else if (apiError.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a moment.'
      } else if (apiError.message) {
        errorMessage = apiError.message
      }

      return NextResponse.json({ 
        error: errorMessage
      }, { status: 400 })
    }

    // Check if configuration already exists
    const { data: existingConfig } = await supabase
      .from('sdlc_user_ai_configurations')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider_id', provider.id)
      .single()

    // Prepare configuration data
    const configData = {
      user_id: user.id,
      provider_id: provider.id,
      encrypted_api_key: apiKey.trim(), // TODO: Implement proper encryption
      key_id: `claude_key_${Date.now()}`,
      is_active: true,
      usage_limits: {
        model: model || 'claude-3-5-sonnet-20241022',
        ...usageLimits
      },
      updated_at: new Date().toISOString()
    }

    let result
    if (existingConfig) {
      // Update existing configuration
      const { data, error } = await supabase
        .from('sdlc_user_ai_configurations')
        .update(configData)
        .eq('id', existingConfig.id)
        .select()
        .single()
      
      result = { data, error }
    } else {
      // Create new configuration
      const { data, error } = await supabase
        .from('sdlc_user_ai_configurations')
        .insert({
          ...configData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      result = { data, error }
    }

    if (result.error) {
      console.error('Error saving Claude config:', result.error)
      return NextResponse.json({ 
        error: 'Failed to save configuration' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Claude configuration saved successfully',
      connected: true,
      model: model || 'claude-3-5-sonnet-20241022'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get Claude provider
    const { data: provider, error: providerError } = await supabase
      .from('sdlc_ai_providers')
      .select('id')
      .eq('type', 'anthropic')
      .eq('is_active', true)
      .single()

    if (providerError || !provider) {
      console.error('Claude provider not found:', providerError)
      return NextResponse.json({ 
        error: 'Claude provider not available' 
      }, { status: 500 })
    }

    // Deactivate Claude configuration for this user
    const { error } = await supabase
      .from('sdlc_user_ai_configurations')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('provider_id', provider.id)

    if (error) {
      console.error('Error deactivating Claude config:', error)
      return NextResponse.json({ error: 'Failed to remove Claude configuration' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Claude configuration removed successfully'
    })

  } catch (error) {
    console.error('Error in Claude config DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 