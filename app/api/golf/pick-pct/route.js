import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: tournament } = await supabaseAdmin
    .from('tournaments')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!tournament) return Response.json({})

  const { data: pools } = await supabaseAdmin
    .from('pools')
    .select('id')
    .eq('tournament_id', tournament.id)

  const poolIds = pools?.map(p => p.id) || []

  const { data: teams } = await supabaseAdmin
    .from('teams')
    .select('golfer_1,golfer_2,golfer_3,golfer_4,golfer_5,golfer_6,golfer_7,golfer_8')
    .in('pool_id', poolIds)

  const pickCount = {}
  const totalTeams = teams?.length || 0

  teams?.forEach(team => {
    [1,2,3,4,5,6,7,8].forEach(i => {
      const g = team[`golfer_${i}`]
      if (g?.id) pickCount[g.id] = (pickCount[g.id] || 0) + 1
    })
  })

  const pickPct = {}
  Object.entries(pickCount).forEach(([id, count]) => {
    pickPct[id] = totalTeams > 0 ? ((count / totalTeams) * 100).toFixed(1) : '0.0'
  })

  return Response.json({ pickPct, totalTeams })
}