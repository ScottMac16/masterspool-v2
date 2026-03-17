import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req, { params }) {
  const { id } = await params

  const { data: tournament } = await supabaseAdmin
    .from('tournaments')
    .select('espn_event_id')
    .eq('active', true)
    .limit(1)
    .single()

  const eventId = tournament?.espn_event_id
  const url = `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${id}/linescores?lang=en&region=us`

  const res = await fetch(url, { next: { revalidate: 60 } })
  const data = await res.json()

  return Response.json(data)
}