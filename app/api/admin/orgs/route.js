import { auth } from '@clerk/nextjs/server'
import { isSuperAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('orgs')
    .select('*')
    .order('created_at', { ascending: false })
  return Response.json(data || [])
}

export async function POST(req) {
  const { userId } = await auth()
  if (!isSuperAdmin(userId)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('orgs')
    .insert({ ...body, admin_user_id: userId })
    .select()
    .single()

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json(data)
}