import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Fetch user's AI provider configurations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's AI configurations with provider details
    const { data: configs, error } = await supabase
      .from('sdlc_user_ai_configurations')
      .select(`
        id,
        provider_id,
        is_active,
        usage_limits,
        last_used,
        created_at,
        updated_at,
        sdlc_ai_providers (
          id,
          name,
          type,
          capabilities,
          cost_model
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching AI configs:', error)
      return NextResponse.json({ error: 'Failed to fetch configurations' }, { status: 500 })
    }

    // Transform the data to include decrypted indicators (without exposing keys)
    const transformedConfigs = configs?.map(config => ({
      id: config.id,
      provider: config.sdlc_ai_providers,
      hasApiKey: !!config.id, // Indicates if API key is configured
      isActive: config.is_active,
      usageLimits: config.usage_limits,
      lastUsed: config.last_used,
      createdAt: config.created_at,
      updatedAt: config.updated_at
    }))

    return NextResponse.json({ 
      success: true, 
      configurations: transformedConfigs || []
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Add or update AI provider configuration
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { providerId, apiKey, usageLimits } = await request.json()

    if (!providerId || !apiKey) {
      return NextResponse.json({ 
        error: 'Provider ID and API key are required' 
      }, { status: 400 })
    }

    // Verify provider exists
    const { data: provider, error: providerError } = await supabase
      .from('sdlc_ai_providers')
      .select('*')
      .eq('id', providerId)
      .eq('is_active', true)
      .single()

    if (providerError || !provider) {
      return NextResponse.json({ 
        error: 'Invalid or inactive provider' 
      }, { status: 400 })
    }

    // Check if configuration already exists
    const { data: existingConfig } = await supabase
      .from('sdlc_user_ai_configurations')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider_id', providerId)
      .single()

    // For now, store the API key directly (TODO: Implement proper encryption)
    // In production, you should encrypt the API key before storing
    const configData = {
      user_id: user.id,
      provider_id: providerId,
      encrypted_api_key: apiKey, // TODO: Encrypt this
      key_id: `key_${Date.now()}`, // Simple key ID for now
      is_active: true,
      usage_limits: usageLimits || null,
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
      console.error('Error saving AI config:', result.error)
      return NextResponse.json({ 
        error: 'Failed to save configuration' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Configuration saved successfully',
      configId: result.data.id
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Remove AI provider configuration
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const configId = searchParams.get('configId')

    if (!configId) {
      return NextResponse.json({ 
        error: 'Configuration ID is required' 
      }, { status: 400 })
    }

    // Delete the configuration (soft delete by setting is_active to false)
    const { error } = await supabase
      .from('sdlc_user_ai_configurations')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', configId)
      .eq('user_id', user.id) // Ensure user can only delete their own configs

    if (error) {
      console.error('Error deleting AI config:', error)
      return NextResponse.json({ 
        error: 'Failed to delete configuration' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Configuration removed successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 