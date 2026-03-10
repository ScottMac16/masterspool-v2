import { auth } from '@clerk/nextjs/server'
import { isSuperAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(req) {
  const { userId } = await auth()
  if (!isSuperAdmin(userId)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { team_id, paid } = await req.json()

  const { error } = await supabaseAdmin
    .from('teams')
    .update({ paid })
    .eq('id', team_id)

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json({ success: true })
}