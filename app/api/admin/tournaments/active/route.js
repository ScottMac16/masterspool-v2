import { auth } from '@clerk/nextjs/server'
import { isSuperAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  const { userId } = await auth()
  if (!isSuperAdmin(userId)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { tournament_id } = await req.json()

  // Deactivate all
  await supabaseAdmin
    .from('tournaments')
    .update({ active: false })
    .neq('id', tournament_id)

  // Activate selected
  const { data, error } = await supabaseAdmin
    .from('tournaments')
    .update({ active: true })
    .eq('id', tournament_id)
    .select()
    .single()

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json(data)
}