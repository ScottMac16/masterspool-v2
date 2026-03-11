import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  const { userId } = await auth()
  const { code } = await req.json()

  console.log('Join API hit - code:', code, 'userId:', userId)

  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: org } = await supabaseAdmin
    .from('orgs')
    .select('*')
    .eq('join_code', code)
    .single()

  console.log('Org found:', org)

  if (!org) return Response.json({ error: 'Invalid code' }, { status: 404 })

  const { data: existing } = await supabaseAdmin
    .from('org_members')
    .select('id')
    .eq('org_id', org.id)
    .eq('user_id', userId)
    .single()

  if (existing) return Response.json({ success: true })

  const { error } = await supabaseAdmin
    .from('org_members')
    .insert({ org_id: org.id, user_id: userId })

  console.log('Insert error:', error)

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json({ success: true })
}