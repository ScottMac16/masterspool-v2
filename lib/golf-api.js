const ESPN_BASE = 'https://site.web.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga'

function parsePosition(pos) {
  if (!pos) return 999
  if (pos === 'CUT' || pos === 'WD' || pos === 'DQ') return 1000
  return parseInt(pos.replace('T', '')) || 999
}

export async function getTournamentInfo(eventId) {
  const res = await fetch(`${ESPN_BASE}&event=${eventId}`, { cache: 'no-store' })
  const data = await res.json()
  const event = data?.events?.[0]
  if (!event) return null

  return {
    espn_event_id: eventId,
    name: event.name,
    start_date: event.date,
    year: new Date(event.date).getFullYear(),
  }
}

export async function getLeaderboard(eventId) {
  const url = eventId ? `${ESPN_BASE}&event=${eventId}` : ESPN_BASE
  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json()

  const competition = data?.events?.[0]?.competitions?.[0]
  const competitors = competition?.competitors
  const status = competition?.status?.type?.detail || ''

  if (!competitors) return { leaderboard: [], status }

  return {
    leaderboard: competitors
      .map((c) => ({
        id: c.id,
        name: c.athlete?.displayName,
        country: c.athlete?.flag?.alt,
        position: c.status?.displayValue === 'WD' || c.status?.displayValue === 'DQ' || c.status?.displayValue === 'CUT'
          ? c.status?.displayValue
          : c.status?.position?.displayName || '-',
        score: c.statistics[0]?.displayValue,
        today: c.status?.todayDetail?.replace(/\(.*\)/, '').trim()
          || c.linescores?.[c.linescores.length - 1]?.displayValue
          || 'E',
        thru: c.status?.displayThru,
        status: c.status?.type?.name,
        displayValue: c.status?.displayValue,
        headshot: c.athlete?.headshot?.href,
        flag: c.athlete?.flag?.href,
      }))
      .sort((a, b) => parsePosition(a.position) - parsePosition(b.position)),
    status
  }
}

export async function getCourseHoles(eventId) {
  const url = `https://site.web.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga&event=${eventId}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  const data = await res.json()
  const holes = data?.events?.[0]?.courses?.[0]?.holes || []
  const parMap = {}
  holes.forEach(h => { parMap[h.number] = h.shotsToPar })
  return parMap
}