export const dynamic = 'force-dynamic'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('tournaments')
    .select('picks_locked')
    .eq('active', true)
    .limit(1)
    .single()

  return Response.json({ picks_locked: data?.picks_locked ?? false })
}