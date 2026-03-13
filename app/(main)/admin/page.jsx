import { auth } from '@clerk/nextjs/server'
import { isSuperAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import styles from './admin.module.css'
 <SnapshotTrigger />

export default async function AdminPage() {
  const { userId } = await auth()
  const superAdmin = isSuperAdmin(userId)

  if (!superAdmin) {
    const { data } = await supabaseAdmin
      .from('orgs')
      .select('id')
      .eq('admin_user_id', userId)
      .limit(1)

    if (!data?.length) redirect('/')
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{superAdmin ? 'Super Admin Panel' : 'Admin Panel'}</h1>
      <div className={styles.grid}>

        {superAdmin && (
          <>
            <div className={styles.card}>
              <h2>🏆 Tournaments</h2>
              <p>Create and manage tournaments</p>
              <a href="/admin/tournaments" className={styles.btn}>Manage</a>
            </div>
            <div className={styles.card}>
              <h2>🏢 Orgs</h2>
              <p>Create orgs and generate join codes</p>
              <a href="/admin/orgs" className={styles.btn}>Manage</a>
            </div>
            <div className={styles.card}>
              <h2>💰 Salaries</h2>
              <p>Set golfer salaries per tournament</p>
              <a href="/admin/salaries" className={styles.btn}>Manage</a>
            </div>
             <SnapshotTrigger />
          </>
        )}

        <div className={styles.card}>
          <h2>📋 Entries</h2>
          <p>View all entries and track payments</p>
          <a href="/admin/entries" className={styles.btn}>Manage</a>
        </div>

      </div>
    </div>
  )
}