import { supabaseAdmin } from '@/lib/supabase'
import { getCourseHoles } from '@/lib/golf-api'

export async function GET(req, { params }) {
  const { id } = await params

  const { data: tournament } = await supabaseAdmin
    .from('tournaments')
    .select('espn_event_id')
    .eq('active', true)
    .limit(1)
    .single()

  const eventId = tournament?.espn_event_id

  const [linescoresRes, parMap] = await Promise.all([
    fetch(`https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${id}/linescores?lang=en&region=us`, { cache: 'no-store' }),
    getCourseHoles(eventId)
  ])

  const data = await linescoresRes.json()

  return Response.json({ ...data, parMap })
}