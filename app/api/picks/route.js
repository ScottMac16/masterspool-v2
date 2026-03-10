import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  const { userId } = await auth()
  const body = await req.json()
  const { org_id, tournament_id, team_name, in_grand_pool, picks } = body

  // Get or create pool
  let { data: pool } = await supabaseAdmin
    .from('pools')
    .select('id')
    .eq('org_id', org_id)
    .eq('tournament_id', tournament_id)
    .single()

  if (!pool) {
    const { data: newPool } = await supabaseAdmin
      .from('pools')
      .insert({ org_id, tournament_id })
      .select()
      .single()
    pool = newPool
  }

  const totalSalary = picks.reduce((sum, p) => sum + p.salary, 0)

  const golferCols = {}
  picks.forEach((p, i) => {
    golferCols[`golfer_${i + 1}`] = {
      id: p.golfer_espn_id,
      name: p.golfer_name,
      salary: p.salary,
    }
  })

  const { data: team, error } = await supabaseAdmin
    .from('teams')
    .insert({
      pool_id: pool.id,
      user_id: userId,
      team_name,
      in_grand_pool,
      total_salary: totalSalary,
      ...golferCols,
    })
    .select()
    .single()

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json({ success: true, team })
}

export async function PUT(req) {
  const { userId } = await auth()
  const body = await req.json()
  const { team_id, team_name, in_grand_pool, picks } = body

  const totalSalary = picks.reduce((sum, p) => sum + p.salary, 0)

  const golferCols = {}
  picks.forEach((p, i) => {
    golferCols[`golfer_${i + 1}`] = {
      id: p.golfer_espn_id,
      name: p.golfer_name,
      salary: p.salary,
    }
  })

  const { data: team, error } = await supabaseAdmin
    .from('teams')
    .update({
      team_name,
      in_grand_pool,
      total_salary: totalSalary,
      ...golferCols,
    })
    .eq('id', team_id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json({ success: true, team })
}