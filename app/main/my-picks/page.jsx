import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import PicksClient from './PicksClient'
import { redirect } from 'next/navigation'

export default async function MyPicksPage({ searchParams }) {
  const { userId } = await auth()
  const { edit } = await searchParams

  // Get latest tournament
  const { data: tournament } = await supabaseAdmin
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!tournament) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>No active tournament</h1>
        <p>Check back soon!</p>
      </div>
    )
  }

  // Get orgs the user belongs to
  const { data: memberships } = await supabaseAdmin
    .from('org_members')
    .select('org_id, orgs(id, name)')
    .eq('user_id', userId)

  // Get golfers with salaries for this tournament
  const { data: salaries } = await supabaseAdmin
    .from('golfer_salaries')
    .select('*')
    .eq('tournament_id', tournament.id)
    .order('salary', { ascending: false })

  // Get pools for this tournament
  const { data: pools } = await supabaseAdmin
    .from('pools')
    .select('id')
    .eq('tournament_id', tournament.id)

  const poolIds = pools?.map(p => p.id) || []

  // Get user's existing teams
  const { data: existingTeams } = await supabaseAdmin
    .from('teams')
    .select('*')
    .eq('user_id', userId)
    .in('pool_id', poolIds.length > 0 ? poolIds : ['none'])
    .order('created_at', { ascending: false })

  // If editing, load that team
  let editTeam = null
  if (edit) {
    editTeam = existingTeams?.find(t => t.id === edit) || null
  }

  const orgs = memberships?.map(m => m.orgs) || []

  console.log('Orgs:', orgs)
console.log('Memberships:', memberships)
console.log('userId:', userId)

  return (
    <PicksClient
      tournament={tournament}
      orgs={orgs}
      salaries={salaries || []}
      existingTeams={existingTeams || []}
      userId={userId}
      editTeam={editTeam}
    />
  )
}