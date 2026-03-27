import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(req) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { team_id } = await req.json()

  // Make sure the team belongs to the user
  const { data: team } = await supabaseAdmin
    .from('teams')
    .select('user_id')
    .eq('id', team_id)
    .single()

  if (!team || team.user_id !== userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabaseAdmin
    .from('teams')
    .delete()
    .eq('id', team_id)

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json({ success: true })
}