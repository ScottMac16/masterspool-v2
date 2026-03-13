'use client'

import { useState } from 'react'
import GolfLeaderboard from './GolfLeaderboard'
import PoolLeaderboard from './PoolLeaderboard'
import styles from './combined.module.css'

export default function LeaderboardPage() {
  const [activePanel, setActivePanel] = useState(0)

  return (
    <div className={styles.container}>
      {/* Mobile tab switcher */}
      <div className={styles.mobileTabs}>
        <button
          className={`${styles.mobileTab} ${activePanel === 0 ? styles.activeMobileTab : ''}`}
          onClick={() => setActivePanel(0)}
        >
          PGA Leaderboard
        </button>
        <button
          className={`${styles.mobileTab} ${activePanel === 1 ? styles.activeMobileTab : ''}`}
          onClick={() => setActivePanel(1)}
        >
          Pool Leaderboard
        </button>
      </div>

      {/* Swipe container */}
      <div className={styles.swipeContainer}
        
      >
        <div className={styles.panel}>
          <GolfLeaderboard />
        </div>
        <div className={styles.panel}>
          <PoolLeaderboard />
        </div>
      </div>
    </div>
  )
}