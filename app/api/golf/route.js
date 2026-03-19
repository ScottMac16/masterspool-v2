export const dynamic = 'force-dynamic'

import { getLeaderboard } from '@/lib/golf-api'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: tournament } = await supabaseAdmin
    .from('tournaments')
    .select('espn_event_id')
    .eq('active', true)
    .limit(1)
    .single()

  const leaderboard = await getLeaderboard(tournament?.espn_event_id)
  return Response.json(leaderboard)
}