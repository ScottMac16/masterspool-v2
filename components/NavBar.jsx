'use client'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './NavBar.module.css'

export default function NavBar() {
  const { user } = useUser()
  const isSuperAdmin = user?.id === process.env.NEXT_PUBLIC_SUPER_ADMIN_ID
  const [isOrgAdmin, setIsOrgAdmin] = useState(false)

  useEffect(() => {
    if (!user || isSuperAdmin) return
    async function checkOrgAdmin() {
      const res = await fetch('/api/admin/check-org-admin')
      const data = await res.json()
      setIsOrgAdmin(data.isOrgAdmin)
    }
    checkOrgAdmin()
  }, [user])

  const showAdmin = isSuperAdmin || isOrgAdmin

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Link href="/leaderboard" className={styles.logo}>SM Masters Pool</Link>
      </div>
      <div className={styles.right}>
        <Link href="/leaderboard" className={styles.link}>Leaderboard</Link>
        <Link href="/my-picks" className={styles.link}>My Picks</Link>
        <Link href="/my-teams" className={styles.link}>My Teams</Link>
        {showAdmin && (
          <Link href="/admin" className={styles.adminLink}>Admin</Link>
        )}
        <SignOutButton>
          <button className={styles.signOut}>Sign Out</button>
        </SignOutButton>
      </div>
    </nav>
  )
}