import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

function isValidEmail(email: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

// Helper to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  // Use admin client to bypass RLS for this check
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single();
  if (error) return false;
  return data?.role === 'admin' || data?.role === 'super_admin';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    let user = null
    let userId = null
    let userEmail = null
    let userName = null
    let isUserAdmin = false

    // Try to get current user (if logged in)
    try {
      const { data, error } = await supabase.auth.getUser()
      if (!error && data?.user) {
        user = data.user
        userId = user.id
        userEmail = user.email
        userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'
        isUserAdmin = await isAdmin(userId)
      }
    } catch (e) {
      // Ignore error, allow anonymous
    }

    // Get body fields
    const body = await request.json()
    const {
      company, role, useCase, priority, referral,
      userEmail: bodyEmail,
      userName: bodyName
    } = body

    // If not logged in, use email from body
    if (!userId) {
      userEmail = bodyEmail
      userName = bodyName || (bodyEmail ? bodyEmail.split('@')[0] : 'Anonymous')
      if (!userEmail || !isValidEmail(userEmail)) {
        return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
      }
      // Use a synthetic user_id for anonymous users
      userId = `anon:${userEmail}`
    }

    // Use admin client if user is admin, otherwise regular client
    const dbClient = isUserAdmin ? createAdminClient() : supabase

    // Check if user is already on the waiting list
    const { data: existingEntry, error: selectError } = await dbClient
      .from('early_access_waitlist')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (selectError) {
      console.error('Error checking existing waitlist entry:', selectError)
      return NextResponse.json({ error: 'Database error while checking waitlist' }, { status: 500 })
    }

    if (existingEntry) {
      // Update existing entry
      const { error: updateError } = await dbClient
        .from('early_access_waitlist')
        .update({
          requested_features: [useCase || 'One-click early access opt-in'],
          priority_score: priority === 'high' ? 25 : priority === 'medium' ? 15 : 5,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error updating waitlist entry:', updateError)
        return NextResponse.json({ error: 'Failed to update waitlist entry' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        position: existingEntry.position,
        message: 'Waitlist entry updated successfully',
        isUpdate: true
      })
    }

    // Get next position
    const { data: lastPosition, error: positionError } = await dbClient
      .from('early_access_waitlist')
      .select('position')
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (positionError) {
      console.error('Error getting last position:', positionError)
      return NextResponse.json({ error: 'Database error while calculating position' }, { status: 500 })
    }

    const nextPosition = (lastPosition?.position || 0) + 1

    // Insert new waitlist entry
    const { error: insertError } = await dbClient
      .from('early_access_waitlist')
      .insert({
        user_id: userId,
        email: userEmail,
        requested_features: [useCase || 'One-click early access opt-in'],
        position: nextPosition,
        priority_score: priority === 'high' ? 25 : priority === 'medium' ? 15 : 5,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error inserting waitlist entry:', insertError)
      return NextResponse.json({ error: 'Failed to join waiting list' }, { status: 500 })
    }

    // Log the new signup
    console.log(`New early access waitlist signup: ${userEmail} (position ${nextPosition})`)

    return NextResponse.json({
      success: true,
      position: nextPosition,
      message: 'Successfully joined the waiting list',
      isUpdate: false
    })
  } catch (error) {
    console.error('Error in waitlist API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET handler can remain as is for logged-in users
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Use existing schema
    const { data: waitlistEntry, error: selectError } = await supabase
      .from('early_access_waitlist')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (selectError) {
      console.error('Error getting waitlist status:', selectError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    if (!waitlistEntry) {
      return NextResponse.json({ 
        onWaitlist: false,
        position: null,
        status: null
      })
    }
    
    return NextResponse.json({
      onWaitlist: true,
      position: waitlistEntry.position,
      status: waitlistEntry.invited_at ? 'invited' : 'waiting',
      data: waitlistEntry
    })
    
  } catch (error) {
    console.error('Error getting waitlist status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 