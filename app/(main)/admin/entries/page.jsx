import { auth } from '@clerk/nextjs/server'
import { isSuperAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import EntriesClient from './EntriesClient'

export default async function EntriesPage() {
  const { userId } = await auth()
  if (!isSuperAdmin(userId)) redirect('/')

  const { data: tournament } = await supabaseAdmin
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: orgs } = await supabaseAdmin
    .from('orgs')
    .select('*')
    .order('name')

  const { data: pools } = await supabaseAdmin
    .from('pools')
    .select('*')
    .eq('tournament_id', tournament?.id)

  const poolIds = pools?.map(p => p.id) || []

const { data: teams, error: teamsError } = await supabaseAdmin
  .from('teams')
  .select('*, users(first_name, last_name, email)')
  .in('pool_id', poolIds)
  .order('created_at', { ascending: false })

console.log('Teams error:', teamsError)

  // Build pool → org map
  const poolOrgMap = {}
  pools?.forEach(p => { poolOrgMap[p.id] = p.org_id })

  // Build org name map
  const orgNameMap = {}
  orgs?.forEach(o => { orgNameMap[o.id] = o.name })

  // Add org_name to each team
  const teamsWithOrg = teams?.map(t => ({
    ...t,
    org_name: orgNameMap[poolOrgMap[t.pool_id]] || '—'
  })) || []

  // Group by org
  const teamsByOrg = {}
  orgs?.forEach(org => { teamsByOrg[org.id] = [] })
  teamsWithOrg.forEach(team => {
    const orgId = poolOrgMap[team.pool_id]
    if (orgId && teamsByOrg[orgId]) {
      teamsByOrg[orgId].push(team)
    }
  })

  

  return (
    <EntriesClient
      tournament={tournament}
      orgs={orgs || []}
      teamsByOrg={teamsByOrg}
      allTeams={teamsWithOrg}
    />
  )
}