'use client'

import { useUser, SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import styles from './NavBar.module.css'

export default function NavBar() {
  const { user } = useUser()
  const isAdmin = user?.id === process.env.NEXT_PUBLIC_SUPER_ADMIN_ID

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Link href="/leaderboard" className={styles.logo}>⛳ Masters Pool</Link>
      </div>
      <div className={styles.right}>
        <Link href="/leaderboard" className={styles.link}>Leaderboard</Link>
        <Link href="/my-picks" className={styles.link}>My Picks</Link>
        {isAdmin && (
          <Link href="/admin" className={styles.adminLink}>Admin ⚙️</Link>
        )}
        <SignOutButton>
          <button className={styles.signOut}>Sign Out</button>
        </SignOutButton>
      </div>
    </nav>
  )
}