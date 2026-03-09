import { auth } from '@clerk/nextjs/server'
import { isSuperAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const tournament_id = searchParams.get('tournament_id')
  const { data } = await supabaseAdmin
    .from('golfer_salaries')
    .select('*')
    .eq('tournament_id', tournament_id)
    .order('salary', { ascending: false })
  return Response.json(data || [])
}

export async function POST(req) {
  const { userId } = await auth()
  if (!isSuperAdmin(userId)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('golfer_salaries')
    .upsert(body, { onConflict: 'tournament_id,golfer_espn_id' })
    .select()
  if (error) return Response.json({ error }, { status: 500 })
  return Response.json(data)
}