import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import PicksClient from './PicksClient'
import { redirect } from 'next/navigation'

export default async function MyPicksPage() {
  const { userId } = await auth()

  // Get the active tournament
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
const { data: salaries, error: salariesError } = await supabaseAdmin
  .from('golfer_salaries')
  .select('*')
  .eq('tournament_id', tournament.id)
  .order('salary', { ascending: false })


  // Get user's existing teams for this tournament
  const { data: existingTeams } = await supabaseAdmin
    .from('teams')
    .select('*, picks(*)')
    .eq('user_id', userId)
    .in('pool_id', memberships?.length > 0 ? (
      await supabaseAdmin
        .from('pools')
        .select('id')
        .eq('tournament_id', tournament.id)
        .then(r => r.data?.map(p => p.id) || [])
    ) : ['none'])

  const orgs = memberships?.map(m => m.orgs) || []



  return (
    <PicksClient
      tournament={tournament}
      orgs={orgs}
      salaries={salaries || []}
      existingTeams={existingTeams || []}
      userId={userId}
    />
  )
}