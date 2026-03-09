import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  let allGolfers = []
  let from = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('golfers')
      .select('id, name, headshot')
      .order('name')
      .range(from, from + pageSize - 1)

    if (error || !data || data.length === 0) break
    allGolfers = [...allGolfers, ...data]
    if (data.length < pageSize) break
    from += pageSize
  }

  return Response.json(allGolfers)
}