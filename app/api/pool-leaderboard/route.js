import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getLeaderboard } from '@/lib/golf-api'

function parseScore(score) {
  if (!score || score === 'E') return 0
  return parseInt(score.replace('+', '')) || 0
}

export async function GET() {
  const { userId } = await auth()

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

  // Get salary list sorted by salary descending
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

  const poolOrgMap = {}
  pools?.forEach(p => { poolOrgMap[p.id] = { id: p.orgs.id, name: p.orgs.name } })

  const scoredTeams = teams?.map(team => {
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

      // Golfer missing from ESPN entirely = pre-tournament WD
      if (!espn) {
        const replacement = findReplacement(g.id)
        if (replacement) {
          const repEspn = scoreMap[replacement.golfer_espn_id]
          const repPct = totalTeams > 0 ? ((pickCount[replacement.golfer_espn_id] || 0) / totalTeams * 100).toFixed(1) : '0.0'
          totalScore += repEspn.score
          todayScore += repEspn.today
          return {
            id: replacement.golfer_espn_id,
            name: replacement.golfer_name,
            score: repEspn.score,
            today: repEspn.today,
            thru: repEspn.thru,
            missedCut: false,
            position: repEspn.position,
            pickPct: repPct,
          }
        }
        // No replacement found
        cutCount++
        totalScore += missedCutScore
        todayScore += missedCutScore
        return { ...g, score: missedCutScore, today: missedCutScore, thru: '—', missedCut: true, position: 'CUT', pickPct: pct }
      }

      // STATUS_WD before teeing off
      if (espn.status === 'STATUS_WD' && !espn.thru) {
        const replacement = findReplacement(g.id)
        if (replacement) {
          const repEspn = scoreMap[replacement.golfer_espn_id]
          const repPct = totalTeams > 0 ? ((pickCount[replacement.golfer_espn_id] || 0) / totalTeams * 100).toFixed(1) : '0.0'
          totalScore += repEspn.score
          todayScore += repEspn.today
          return {
            id: replacement.golfer_espn_id,
            name: replacement.golfer_name,
            score: repEspn.score,
            today: repEspn.today,
            thru: repEspn.thru,
            missedCut: false,
            position: repEspn.position,
            pickPct: repPct,
          }
        }
      }

      // Missed cut
      if (espn.status === 'STATUS_CUT') {
        cutCount++
        totalScore += missedCutScore
        todayScore += missedCutScore
        return { ...g, score: missedCutScore, today: missedCutScore, thru: '—', missedCut: true, position: 'CUT', pickPct: pct }
      }

      totalScore += espn.score
      todayScore += espn.today
      return { ...g, score: espn.score, today: espn.today, thru: espn.thru, missedCut: false, position: espn.position, pickPct: pct }
    })

    const org = poolOrgMap[team.pool_id]

    return {
      id: team.id,
      team_name: team.team_name,
      user: team.users,
      totalScore,
      todayScore,
      cutCount,
      golfers: golferScores,
      in_grand_pool: team.in_grand_pool,
      org_id: org?.id,
      org_name: org?.name,
      paid: team.paid,
    }
  }) || []

  scoredTeams.sort((a, b) => a.totalScore - b.totalScore)

  let orgs = []
  if (userId) {
    const { data: userOrgs } = await supabaseAdmin
      .from('org_members')
      .select('orgs(id, name)')
      .eq('user_id', userId)
    orgs = userOrgs?.map(m => m.orgs).filter(o => o.id !== '00000000-0000-0000-0000-000000000001') || []
  }

  return Response.json({ scoredTeams, orgs, tournament, missedCutScore })
}