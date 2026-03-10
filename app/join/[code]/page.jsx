import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import JoinClient from '../JoinClient'

export default async function JoinPage() {
  const { userId } = await auth()

  // Check if already in any org
  const { data: memberships } = await supabaseAdmin
    .from('org_members')
    .select('id')
    .eq('user_id', userId)

  if (memberships?.length > 0) {
    redirect('/my-picks')
  }

  // New user — make sure they exist in users table
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()

  if (!existingUser) {
    // Insert basic user record if webhook hasn't fired yet
    await supabaseAdmin.from('users').insert({ id: userId })
  }

  return <JoinClient />
}