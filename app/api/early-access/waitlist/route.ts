import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { company, role, useCase, priority, referral, userEmail, userName } = await request.json()
    
    // Check if user is already on the waiting list - handle no rows case
    const { data: existingEntry, error: selectError } = await supabase
      .from('early_access_waitlist')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (selectError) {
      console.error('Error checking existing waitlist entry:', selectError)
      return NextResponse.json({ error: 'Database error while checking waitlist' }, { status: 500 })
    }
    
    if (existingEntry) {
      // Update existing entry - map to existing schema
      const { error: updateError } = await supabase
        .from('early_access_waitlist')
        .update({
          requested_features: [useCase || 'One-click early access opt-in'],
          priority_score: priority === 'high' ? 25 : priority === 'medium' ? 15 : 5,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      
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
    
    // Get next position - the existing schema uses position field
    const { data: lastPosition, error: positionError } = await supabase
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
    
    // Insert new waitlist entry using existing schema
    const { error: insertError } = await supabase
      .from('early_access_waitlist')
      .insert({
        user_id: user.id,
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

// Get waiting list status for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
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