import { auth } from '@clerk/nextjs/server'
import { isSuperAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'
import { getLeaderboard } from '@/lib/golf-api'

function parseScore(score) {
  if (!score || score === 'E') return 0
  return parseInt(score.replace('+', '')) || 0
}

export async function POST(req) {
  const { userId } = await auth()
  if (!isSuperAdmin(userId)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { round } = await req.json()

  const { data: tournament } = await supabaseAdmin
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!tournament) return Response.json({ error: 'No tournament' }, { status: 404 })

  const espnGolfers = await getLeaderboard(tournament.espn_event_id)

  const scoreMap = {}
  let worstScore = -999
  espnGolfers.forEach(g => {
    const score = parseScore(g.score)
    const today = parseScore(g.today)
    scoreMap[g.id] = { score, today, thru: g.thru, status: g.status, position: g.position }
    if (g.status !== 'STATUS_CUT' && score > worstScore) worstScore = score
  })

  const missedCutScore = worstScore + 1
  const applyCutPenalty = round >= 3

  const { data: salaries } = await supabaseAdmin
    .from('golfer_salaries')
    .select('*')
    .eq('tournament_id', tournament.id)
    .order('salary', { ascending: false })

  const salaryList = salaries || []
  const salaryIndexMap = {}
  salaryList.forEach((s, i) => { salaryIndexMap[s.golfer_espn_id] = i })

  const { data: pools } = await supabaseAdmin
    .from('pools')
    .select('*, orgs(id, name)')
    .eq('tournament_id', tournament.id)

  const poolIds = pools?.map(p => p.id) || []
  const poolOrgMap = {}
  pools?.forEach(p => { poolOrgMap[p.id] = { id: p.orgs.id, name: p.orgs.name } })

  const { data: teams } = await supabaseAdmin
    .from('teams')
    .select('*, users(first_name, last_name)')
    .in('pool_id', poolIds)

  const pickCount = {}
  const totalTeams = teams?.length || 0
  teams?.forEach(team => {
    [1,2,3,4,5,6,7,8].forEach(i => {
      const g = team[`golfer_${i}`]
      if (g?.id) pickCount[g.id] = (pickCount[g.id] || 0) + 1
    })
  })

  const snapshots = teams?.map(team => {
    const golfers = [1,2,3,4,5,6,7,8].map(i => team[`golfer_${i}`]).filter(Boolean)
    const teamGolferIds = new Set(golfers.map(g => g.id))

    let totalScore = 0
    let todayScore = 0
    let cutCount = 0

    function findReplacement(golferEspnId) {
      const currentIndex = salaryIndexMap[golferEspnId] ?? -1
      for (let i = currentIndex + 1; i < salaryList.length; i++) {
        const candidate = salaryList[i]
        if (!teamGolferIds.has(candidate.golfer_espn_id) && scoreMap[candidate.golfer_espn_id]) {
          return candidate
        }
      }
      return null
    }

    const golferScores = golfers.map(g => {
      const espn = scoreMap[g.id]
      const pct = totalTeams > 0 ? ((pickCount[g.id] || 0) / totalTeams * 100).toFixed(1) : '0.0'

      if (!espn) {
        const replacement = findReplacement(g.id)
        if (replacement) {
          const repEspn = scoreMap[replacement.golfer_espn_id]
          totalScore += repEspn.score
          todayScore += repEspn.today
          return { id: replacement.golfer_espn_id, name: replacement.golfer_name, score: repEspn.score, today: repEspn.today, thru: repEspn.thru, missedCut: false, position: repEspn.position, pickPct: pct }
        }
        if (applyCutPenalty) { cutCount++; totalScore += missedCutScore; todayScore += missedCutScore }
        return { ...g, score: applyCutPenalty ? missedCutScore : 0, today: 0, thru: '—', missedCut: true, position: 'CUT', pickPct: pct }
      }

      if (espn.status === 'STATUS_WD' && !espn.thru) {
        const replacement = findReplacement(g.id)
        if (replacement) {
          const repEspn = scoreMap[replacement.golfer_espn_id]
          totalScore += repEspn.score
          todayScore += repEspn.today
          return { id: replacement.golfer_espn_id, name: replacement.golfer_name, score: repEspn.score, today: repEspn.today, thru: repEspn.thru, missedCut: false, position: repEspn.position, pickPct: pct }
        }
      }

      if (espn.status === 'STATUS_CUT') {
        if (applyCutPenalty) {
          cutCount++; totalScore += missedCutScore; todayScore += missedCutScore
          return { ...g, score: missedCutScore, today: missedCutScore, thru: '—', missedCut: true, position: 'CUT', pickPct: pct }
        } else {
          totalScore += espn.score; todayScore += espn.today
          return { ...g, score: espn.score, today: espn.today, thru: espn.thru, missedCut: false, position: espn.position, pickPct: pct }
        }
      }

      totalScore += espn.score
      todayScore += espn.today
      return { ...g, score: espn.score, today: espn.today, thru: espn.thru, missedCut: false, position: espn.position, pickPct: pct }
    })

    golferScores.sort((a, b) => {
      if (a.missedCut && !b.missedCut) return 1
      if (!a.missedCut && b.missedCut) return -1
      return a.score - b.score
    })

    const org = poolOrgMap[team.pool_id]

    return {
      tournament_id: tournament.id,
      round,
      team_id: team.id,
      team_name: team.team_name,
      user_id: team.user_id,
      total_score: totalScore,
      today_score: todayScore,
      cut_count: cutCount,
      in_grand_pool: team.in_grand_pool,
      org_id: org?.id,
      pool_id: team.pool_id,
      golfers: golferScores,
    }
  }) || []

  await supabaseAdmin
    .from('round_snapshots')
    .delete()
    .eq('tournament_id', tournament.id)
    .eq('round', round)

  const { error } = await supabaseAdmin
    .from('round_snapshots')
    .insert(snapshots)

  if (error) return Response.json({ error }, { status: 500 })

  return Response.json({ success: true, count: snapshots.length, round })
}