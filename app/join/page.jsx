import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function JoinPage() {
  const { userId } = await auth()

  const { data: memberships } = await supabaseAdmin
    .from('org_members')
    .select('id')
    .eq('user_id', userId)

  if (memberships?.length > 0) {
    redirect('/my-picks')
  }

  // Auto-join grand pool
  await supabaseAdmin.from('org_members').insert({
    org_id: process.env.NEXT_PUBLIC_GRAND_POOL_ORG_ID,
    user_id: userId,
  })

  redirect('/my-picks')
}