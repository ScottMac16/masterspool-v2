import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ isOrgAdmin: false })

  const { data } = await supabaseAdmin
    .from('orgs')
    .select('id')
    .eq('admin_user_id', userId)
    .limit(1)

  return Response.json({ isOrgAdmin: data?.length > 0 })
}