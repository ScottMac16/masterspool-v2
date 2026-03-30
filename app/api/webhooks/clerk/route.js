import { Webhook } from 'svix'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  console.log('🔔 Webhook received!')
  
  const secret = process.env.CLERK_WEBHOOK_SECRET
  console.log('Secret exists:', !!secret)

  const headers = {
    'svix-id': req.headers.get('svix-id'),
    'svix-timestamp': req.headers.get('svix-timestamp'),
    'svix-signature': req.headers.get('svix-signature'),
  }

  const body = await req.text()

  let event
  try {
    const wh = new Webhook(secret)
    event = wh.verify(body, headers)
    console.log('✅ Event type:', event.type)
  } catch (err) {
    console.log('❌ Webhook error:', err.message)
    return new Response('Invalid webhook signature', { status: 400 })
  }

  const { id, email_addresses, first_name, last_name, image_url } = event.data
  const email = email_addresses?.[0]?.email_address

  if (event.type === 'user.created') {
  const { error } = await supabaseAdmin.from('users').upsert({
    id,
    email,
    first_name,
    last_name,
    image_url,
  })
  console.log('Supabase error:', error)

    // Auto-join SMAC Pool
    const { error: orgError } = await supabaseAdmin
      .from('org_members')
      .upsert({
        org_id: '00000000-0000-0000-0000-000000000001',
        user_id: id,
      }, { onConflict: 'org_id,user_id' })
    console.log('Org member error:', orgError)
  }

  if (event.type === 'user.updated') {
    const { error } = await supabaseAdmin.from('users').upsert({
      id,
      email,
      first_name,
      last_name,
      image_url,
    })
    console.log('Supabase error:', error)
  }

  if (event.type === 'user.deleted') {
    await supabaseAdmin.from('users').delete().eq('id', id)
  }

  return new Response('OK', { status: 200 })
}