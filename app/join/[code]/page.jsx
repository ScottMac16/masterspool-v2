import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import styles from './join.module.css'

export default async function JoinPage({ params }) {
  const { code } = await params
  const { userId } = await auth()

  // Find the org by join code
  const { data: org } = await supabaseAdmin
    .from('orgs')
    .select('*')
    .eq('join_code', code)
    .single()

  if (!org) {
    return (
      <div className={styles.container}>
        <h1 className={styles.error}>Invalid invite link</h1>
        <p>This invite link is invalid or has expired.</p>
      </div>
    )
  }

  // Check if already a member
  const { data: existing } = await supabaseAdmin
    .from('org_members')
    .select('id')
    .eq('org_id', org.id)
    .eq('user_id', userId)
    .single()

  if (existing) {
    redirect('/my-picks')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>🏌️</div>
        <h1 className={styles.title}>You're invited!</h1>
        <p className={styles.orgName}>{org.name}</p>
        <p className={styles.subtitle}>Join this pool and start making your picks</p>
        <form action={async () => {
          'use server'
          await supabaseAdmin.from('org_members').insert({
            org_id: org.id,
            user_id: userId,
          })
          redirect('/my-picks')
        }}>
          <button type="submit" className={styles.joinBtn}>
            Join Pool →
          </button>
        </form>
      </div>
    </div>
  )
}