import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  const { userId } = await auth()
  const orgId = process.env.NEXT_PUBLIC_GRAND_POOL_ORG_ID

  // Check if already a member
  const { data: existing } = await supabaseAdmin
    .from('org_members')
    .select('id')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single()

  if (existing) return Response.json({ success: true })

  const { error } = await supabaseAdmin
    .from('org_members')
    .insert({ org_id: orgId, user_id: userId })

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json({ success: true })
}
