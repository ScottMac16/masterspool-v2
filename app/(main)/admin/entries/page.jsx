import { auth } from '@clerk/nextjs/server'
import { isSuperAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import EntriesClient from './EntriesClient'

export default async function EntriesPage() {
  const { userId } = await auth()
  const superAdmin = isSuperAdmin(userId)

  // Check if org admin
  const { data: adminOrg } = await supabaseAdmin
    .from('orgs')
    .select('*')
    .eq('admin_user_id', userId)
    .single()

  if (!superAdmin && !adminOrg) redirect('/')

  const { data: tournament } = await supabaseAdmin
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let orgs
  if (superAdmin) {
    const { data } = await supabaseAdmin.from('orgs').select('*').order('name')
    orgs = data
  } else {
    orgs = [adminOrg]
  }

  const { data: pools } = await supabaseAdmin
    .from('pools')
    .select('*')
    .eq('tournament_id', tournament?.id)

  const poolIds = pools?.map(p => p.id) || []

  const { data: teams } = await supabaseAdmin
    .from('teams')
    .select('*, users(first_name, last_name, email)')
    .in('pool_id', poolIds)
    .order('created_at', { ascending: false })

  const poolOrgMap = {}
  pools?.forEach(p => { poolOrgMap[p.id] = p.org_id })

  const orgNameMap = {}
  orgs?.forEach(o => { orgNameMap[o.id] = o.name })

  const teamsWithOrg = teams?.map(t => ({
    ...t,
    org_name: orgNameMap[poolOrgMap[t.pool_id]] || '—'
  })) || []

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
      isSuperAdmin={superAdmin}
    />
  )
}