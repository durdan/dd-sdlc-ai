import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()

  // Total diagrams generated
  const { count: totalDiagrams } = await supabase
    .from('project_generations')
    .select('id', { count: 'exact', head: true })
    .eq('project_type', 'diagram')

  // Unique users (logged-in)
  const { data: userRows } = await supabase
    .from('project_generations')
    .select('user_id')
    .eq('project_type', 'diagram')

  const userIds = (userRows || []).map(r => r.user_id).filter(Boolean)
  const uniqueUsers = new Set(userIds).size
  const anonymousCount = (userRows || []).filter(r => !r.user_id).length

  // Recent generations
  const { data: recent } = await supabase
    .from('project_generations')
    .select('id, user_id, metadata, created_at')
    .eq('project_type', 'diagram')
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({
    totalDiagrams: totalDiagrams || 0,
    uniqueUsers,
    anonymousCount,
    recent: recent || []
  })
} 