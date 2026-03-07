import { auth } from '@clerk/nextjs/server'
import { isSuperAdmin } from '@/lib/admin'
import { redirect } from 'next/navigation'
import styles from './admin.module.css'

export default async function AdminPage() {
  const { userId } = await auth()
  if (!isSuperAdmin(userId)) redirect('/')

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Super Admin Panel</h1>
      <div className={styles.grid}>

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

      </div>
    </div>
  )
}