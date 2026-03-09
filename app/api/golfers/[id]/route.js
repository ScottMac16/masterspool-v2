import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req, { params }) {
  const { id } = await params

  const { data } = await supabaseAdmin
    .from('golfers')
    .select('id, name, headshot')
    .eq('id', id)
    .single()

  return Response.json(data || null)
}