'use client'

import { useState, useEffect } from 'react'
import styles from './leaderboard.module.css'

function scoreClass(score, styles) {
  if (!score || score === 'E') return styles.scoreEven
  if (score.startsWith('-')) return styles.scoreUnder
  return styles.scoreOver
}

export default function GolfLeaderboard() {
  const [golfers, setGolfers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/golf')
      .then(r => r.json())
      .then(setGolfers)
  }, [])

  const filtered = golfers.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase())
  )

  const active = filtered.filter(g => g.status !== 'STATUS_CUT')
  const cut = filtered.filter(g => g.status === 'STATUS_CUT')

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Leaderboard</h1>
        <div className={styles.searchBox}>
          <span>🔍</span>
          <input
            placeholder="Search Player"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      <div className={styles.columnHeaders}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span>TOTAL</span>
        <span>TODAY</span>
        <span>THRU</span>
        <span></span>
      </div>

      {active.map((g) => (
        <div key={g.id} className={styles.row}>
          <span className={styles.position}>{g.position}</span>
          <img className={styles.headshot} src={g.headshot} alt={g.name} />
          <img className={styles.flag} src={g.flag} alt={g.country} />
          <span className={styles.name}>{g.name}</span>
          <span className={`${styles.score} ${scoreClass(g.score, styles)}`}>{g.score}</span>
          <span className={styles.today}>{g.today}</span>
          <span className={styles.thru}>{g.thru}</span>
          <span></span>
        </div>
      ))}

      {cut.length > 0 && (
        <>
          <div className={styles.row} style={{ background: '#8b1a1a', borderRadius: '8px', marginTop: '8px' }}>
            <span></span><span></span><span></span>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}>— CUT —</span>
            <span></span><span></span><span></span><span></span>
          </div>
          {cut.map((g) => (
            <div key={g.id} className={`${styles.row} ${styles.cutRow}`}>
              <span className={styles.position}>{g.position}</span>
              <img className={styles.headshot} src={g.headshot} alt={g.name} />
              <img className={styles.flag} src={g.flag} alt={g.country} />
              <span className={styles.name}>{g.name}</span>
              <span className={styles.score}>{g.score}</span>
              <span className={styles.today}>{g.today}</span>
              <span className={styles.thru}>{g.thru}</span>
              <span></span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}