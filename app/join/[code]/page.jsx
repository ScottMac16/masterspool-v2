import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import styles from '../join.module.css'

export default async function JoinCodePage({ params }) {
  const { code } = await params
  const { userId } = await auth()

  const { data: org } = await supabaseAdmin
    .from('orgs')
    .select('*')
    .eq('join_code', code)
    .single()

  if (!org) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.icon}>❌</div>
          <h1 className={styles.title}>Invalid invite link</h1>
          <p className={styles.subtitle}>This invite link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  const { data: existing } = await supabaseAdmin
    .from('org_members')
    .select('id')
    .eq('org_id', org.id)
    .eq('user_id', userId)
    .single()

  if (existing) redirect('/my-picks')

  await supabaseAdmin.from('org_members').insert({
    org_id: org.id,
    user_id: userId,
  })
  
  console.log('JoinCodePage hit! code:', code, 'userId:', userId)
  redirect('/my-picks')
}
