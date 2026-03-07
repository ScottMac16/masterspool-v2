import { getTournamentInfo } from '@/lib/golf-api'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get('event_id')
  console.log('Looking up event ID:', eventId)
  if (!eventId) return Response.json({ error: 'No event ID' }, { status: 400 })
  const info = await getTournamentInfo(eventId)
  console.log('Tournament info:', info)
  if (!info) return Response.json({ error: 'Tournament not found' }, { status: 404 })
  return Response.json(info)
}