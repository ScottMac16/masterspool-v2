'use client'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './NavBar.module.css'

export default function NavBar() {
  const { user } = useUser()
  const isSuperAdmin = user?.id === process.env.NEXT_PUBLIC_SUPER_ADMIN_ID
  const [isOrgAdmin, setIsOrgAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [picksLocked, setPicksLocked] = useState(null)

  useEffect(() => {
    fetch('/api/tournament-status')
      .then(r => r.json())
      .then(d => setPicksLocked(d.picks_locked))
      .catch(() => {})
  }, [])

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
        <Link href="/leaderboard" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <svg className={styles.logoSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 237.3 153.3">
            <path d="M65.6,103l-6,6h-9.1l-4.2-5.5.7-5.1-9.9,10.6h-8.7l-5.7-7.5.4-28.4,10.7,5.7-.2,20.3,3.5,4,8.9-8.7v-26.4l-3.1-3.1-8.7,8.7-11.8-6.9v-28l-2.2-2.2-6.2-.4,11.3-10.2,7.8,8.9v5.5l14.2-14.4,9.3,8.7v8.2l-10.5,9.8v-13.3l-3.5-2.4-9.1,8-.2,23.1,13.8-13.6s8.7,8,9.6,11.3c.9,3.3,1.1,33.5,1.1,33.5,0,0,.9,4.2,7.8,4Z"/>
            <polygon points="129.4 104.3 124.4 109 114.2 109 110.3 104.3 110.3 38.9 107.6 36.5 105.2 36.5 99.8 42 99.4 102 102.5 104 108.5 104.7 103.7 109 93.1 109 88.7 103.6 88.7 39.4 84.6 35.7 78.3 41.8 78.3 100.9 80.9 104.3 86.9 104.7 82.4 109 71.8 109 67.8 104.3 67.8 39.6 65.6 35.8 59.6 35.8 69.8 25.4 78.5 36.5 89.4 25.4 99.8 37.4 111.2 25.4 120.9 36.3 121.6 101.6 123.8 104.3 129.4 104.3"/>
            <path d="M170,104l-3.1-2,.4-64.7-12.3-12-10.9,11.1-8.7-11.1-10.2,10.5h6l2.2,3.8v64.7l4,4.7h10.5l4.6-4.3-6-.4-2.7-3.3v-28.8l12.3-13v44.5l4.4,5.4h10.6l4.8-4.3-6-.7ZM156.3,53.8l-12.3,12v-24l6.3-6.1,6,3.7v14.5Z"/>
            <polygon points="220.7 104.7 215.9 109 205.3 109 200.9 103.6 200.9 101.3 192.7 109 182.2 109 178.1 104.3 178.1 39.6 175.9 35.8 169.9 35.8 180.1 25.4 188.8 36.5 199.7 25.4 209.1 37.4 209.1 46 200.9 53.4 200.9 39.4 194.9 35.7 188.6 41.8 188.6 100.9 191.2 104.3 200.9 96.3 200.9 84.3 209.1 76.4 209.1 102 214.7 104 220.7 104.7"/>
            <g>
              <path d="M134.2,130.3c-.6-.7-.9-1.6-.9-2.9v-8.1c0-1.2.3-2.2.9-2.9.6-.7,1.5-1,2.7-1s2.1.3,2.7,1c.6.7.9,1.6.9,2.9v1.3h-2.3v-1.5c0-1-.4-1.5-1.3-1.5s-1.3.5-1.3,1.5v8.4c0,1,.4,1.5,1.3,1.5s1.3-.5,1.3-1.5v-3h-1.2v-2.2h3.5v5c0,1.2-.3,2.2-.9,2.9-.6.7-1.5,1-2.7,1s-2.1-.3-2.7-1Z"/>
              <path d="M145,130.3c-.6-.7-.9-1.6-.9-2.9v-8.1c0-1.2.3-2.2.9-2.9.6-.7,1.5-1,2.7-1s2.1.3,2.7,1c.6.7.9,1.6.9,2.9v8.1c0,1.2-.3,2.2-.9,2.9-.6.7-1.5,1-2.7,1s-2.1-.3-2.7-1ZM149,127.6v-8.4c0-1-.4-1.5-1.3-1.5s-1.3.5-1.3,1.5v8.4c0,1,.4,1.5,1.3,1.5s1.3-.5,1.3-1.5Z"/>
              <path d="M155.2,115.7h2.4v13.2h4v2.2h-6.4v-15.4Z"/>
              <path d="M164.9,115.7h6.4v2.2h-4v4.3h3.1v2.2h-3.1v6.7h-2.4v-15.4Z"/>
              <path d="M180.4,115.7h3.6c1.2,0,2.1.3,2.7,1,.6.6.9,1.6.9,2.8v1.5c0,1.2-.3,2.2-.9,2.8-.6.6-1.5,1-2.7,1h-1.1v6.3h-2.4v-15.4ZM184,122.6c.4,0,.7-.1.9-.3.2-.2.3-.6.3-1.1v-1.8c0-.5,0-.9-.3-1.1-.2-.2-.5-.3-.9-.3h-1.1v4.7h1.1Z"/>
              <path d="M191.8,130.3c-.6-.7-.9-1.6-.9-2.9v-8.1c0-1.2.3-2.2.9-2.9.6-.7,1.5-1,2.7-1s2.1.3,2.7,1c.6.7.9,1.6.9,2.9v8.1c0,1.2-.3,2.2-.9,2.9-.6.7-1.5,1-2.7,1s-2.1-.3-2.7-1ZM195.8,127.6v-8.4c0-1-.4-1.5-1.3-1.5s-1.3.5-1.3,1.5v8.4c0,1,.4,1.5,1.3,1.5s1.3-.5,1.3-1.5Z"/>
              <path d="M202.8,130.3c-.6-.7-.9-1.6-.9-2.9v-8.1c0-1.2.3-2.2.9-2.9.6-.7,1.5-1,2.7-1s2.1.3,2.7,1c.6.7.9,1.6.9,2.9v8.1c0,1.2-.3,2.2-.9,2.9-.6.7-1.5,1-2.7,1s-2.1-.3-2.7-1ZM206.8,127.6v-8.4c0-1-.4-1.5-1.3-1.5s-1.3.5-1.3,1.5v8.4c0,1,.4,1.5,1.3,1.5s1.3-.5,1.3-1.5Z"/>
              <path d="M213,115.7h2.4v13.2h4v2.2h-6.4v-15.4Z"/>
            </g>
            <rect x="20" y="115.5" width="105.3" height="15.6"/>
          </svg>
        </Link>
      </div>

      {/* Desktop nav */}
      <div className={styles.right}>
        {picksLocked && (
          <Link href="/leaderboard" className={styles.link}>Leaderboard</Link>
        )}
        {!picksLocked && (
          <>
            <Link href="/my-picks" className={styles.link}>My Picks</Link>
            <Link href="/my-teams" className={styles.link}>My Teams</Link>
          </>
        )}
        {showAdmin && (
          <Link href="/admin" className={styles.adminLink}>Admin</Link>
        )}
        <SignOutButton>
          <button className={styles.signOut}>Sign Out</button>
        </SignOutButton>
      </div>

      {/* Mobile hamburger */}
      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
      </button>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {picksLocked && (
            <Link href="/leaderboard" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Leaderboard</Link>
          )}
          {!picksLocked && (
            <>
              <Link href="/my-picks" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Picks</Link>
              <Link href="/my-teams" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Teams</Link>
            </>
          )}
          {showAdmin && (
            <Link href="/admin" className={styles.mobileAdminLink} onClick={() => setMenuOpen(false)}>Admin</Link>
          )}
          <SignOutButton>
            <button className={styles.mobileSignOut} onClick={() => setMenuOpen(false)}>Sign Out</button>
          </SignOutButton>
        </div>
      )}
    </nav>
  )
}