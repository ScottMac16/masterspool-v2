'use client'

import { useState, useEffect } from 'react'
import styles from './pool-leaderboard.module.css'

function formatScore(score) {
  if (score === 0) return 'E'
  if (score > 0) return `+${score}`
  return `${score}`
}

function scoreClass(score, styles) {
  if (score < 0) return styles.under
  if (score > 0) return styles.over
  return styles.even
}

export default function PoolLeaderboard() {
  const [data, setData] = useState(null)
  const [activeTab, setActiveTab] = useState('grandpool')
  const [view, setView] = useState('list')
  const [expandedTeams, setExpandedTeams] = useState(new Set())

  function toggleTeam(id) {
    setExpandedTeams(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
  function fetchData() {
    fetch('/api/pool-leaderboard')
      .then(r => r.json())
      .then(setData)
  }
  fetchData()
  const interval = setInterval(fetchData, 60000)
  return () => clearInterval(interval)
}, [])

  if (!data) return <div className={styles.loading}>Loading...</div>

  const { scoredTeams, orgs } = data

  const grandPoolTeams = scoredTeams.filter(t => t.in_grand_pool)
  const activeTeams = activeTab === 'grandpool'
    ? grandPoolTeams
    : scoredTeams.filter(t => t.org_id === activeTab)

  const rankedTeams = activeTeams.map((t, i, arr) => {
    const rank = arr.findIndex(a => a.totalScore === t.totalScore) + 1
    return { ...t, rank }
  })

  const [activeRound, setActiveRound] = useState('live')

  // Update fetch to include round
  useEffect(() => {
    function fetchData() {
      const url = activeRound === 'live' 
        ? '/api/pool-leaderboard' 
        : `/api/pool-leaderboard?round=${activeRound}`
      fetch(url)
        .then(r => r.json())
        .then(setData)
    }
    fetchData()
    const interval = activeRound === 'live' ? setInterval(fetchData, 60000) : null
    return () => { if (interval) clearInterval(interval) }
  }, [activeRound])

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>POOL LEADERBOARD</h1>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${view === 'list' ? styles.activeView : ''}`}
            onClick={() => setView('list')}
            title="List view"
          >☰</button>
          <button
            className={`${styles.viewBtn} ${view === 'card' ? styles.activeView : ''}`}
            onClick={() => setView('card')}
            title="Card view"
          >⊞</button>
        </div>
      </div>
      <div className={styles.roundTabs}>
          {['live', 1, 2, 3, 4].map(r => (
            <button
              key={r}
              className={`${styles.roundTab} ${activeRound === r ? styles.activeRoundTab : ''}`}
              onClick={() => setActiveRound(r)}
            >
              {r === 'live' ? '🔴 Live' : `R${r}`}
            </button>
          ))}
        </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'grandpool' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('grandpool')}
        >
          🏆 Grand Pool
          <span className={styles.tabCount}>{grandPoolTeams.length}</span>
        </button>
        {orgs.map(org => (
          <button
            key={org.id}
            className={`${styles.tab} ${activeTab === org.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(org.id)}
          >
            {org.name}
            <span className={styles.tabCount}>
              {scoredTeams.filter(t => t.org_id === org.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className={styles.listView}>
          <div className={styles.listHeader}>
            <span className={styles.colPos}>POS</span>
            <span className={styles.colTeam}>TEAM NAME</span>
            <span className={styles.colStat}>TOTAL</span>
            <span className={styles.colStat}>TODAY</span>
            <span className={styles.colStat}>CUT</span>
            <span className={styles.colExpand}></span>
          </div>
          {rankedTeams.map(team => (
            <div key={team.id} className={styles.listItem}>
              <div className={styles.listRow} onClick={() => toggleTeam(team.id)}>
                <span className={styles.colPos}>{team.rank}</span>
                <span className={styles.colTeam}>{team.team_name}</span>
                <span className={`${styles.colStat} ${scoreClass(team.totalScore, styles)}`}>
                  {formatScore(team.totalScore)}
                </span>
                <span className={`${styles.colStat} ${scoreClass(team.todayScore, styles)}`}>
                  {formatScore(team.todayScore)}
                </span>
                <span className={styles.colStat}>{team.cutCount}</span>
                <span className={styles.colExpand}>{expandedTeams.has(team.id) ? '▼' : '▶'}</span>
              </div>

              {expandedTeams.has(team.id) && (
                <div className={styles.expandedGolfers}>
                  <div className={styles.cardGolferHeader}>
                    <span className={styles.cgPos}></span>
                    <span className={styles.cgName}></span>
                    <span className={styles.cgStat}>Total</span>
                    <span className={styles.cgStat}>Today</span>
                    <span className={styles.cgStat}>Thru</span>
                    <span className={styles.cgStat}>Pick %</span>
                  </div>
                  {team.golfers.map((g, i) => (
                    <div key={i} className={`${styles.cardGolferRow} ${g.missedCut ? styles.cutGolfer : ''}`}>
                      <span className={styles.cgPos}>{g.position}</span>
                      <span className={styles.cgName}>{g.name}</span>
                      <span className={`${styles.cgStat} ${scoreClass(g.score, styles)}`}>
                        {formatScore(g.score)}
                      </span>
                      <span className={`${styles.cgStat} ${scoreClass(g.today, styles)}`}>
                        {formatScore(g.today)}
                      </span>
                      <span className={styles.cgStat}>{g.thru}</span>
                      <span className={styles.cgStat}>{g.pickPct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Card View */}
      {view === 'card' && (
        <div className={styles.cardGrid}>
          {rankedTeams.map(team => (
            <div key={team.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardRank}>{team.rank}</span>
                <span className={styles.cardTeamName}>{team.team_name}</span>
                <span className={`${styles.cardTotal} ${scoreClass(team.totalScore, styles)}`}>
                  {formatScore(team.totalScore)}
                </span>
                <span className={`${styles.cardToday} ${scoreClass(team.todayScore, styles)}`}>
                  {formatScore(team.todayScore)}
                </span>
                <span className={styles.cardCuts}>{team.cutCount}</span>
              </div>
              <div className={styles.cardGolferHeader}>
                <span className={styles.cgPos}></span>
                <span className={styles.cgName}></span>
                <span className={styles.cgStat}>Total</span>
                <span className={styles.cgStat}>Today</span>
                <span className={styles.cgStat}>Thru</span>
                <span className={styles.cgStat}>Pick %</span>
              </div>
              {team.golfers.map((g, i) => (
                <div key={i} className={`${styles.cardGolferRow} ${g.missedCut ? styles.cutGolfer : ''}`}>
                  <span className={styles.cgPos}>{g.position}</span>
                  <span className={styles.cgName}>{g.name}</span>
                  <span className={`${styles.cgStat} ${scoreClass(g.score, styles)}`}>
                    {formatScore(g.score)}
                  </span>
                  <span className={`${styles.cgStat} ${scoreClass(g.today, styles)}`}>
                    {formatScore(g.today)}
                  </span>
                  <span className={styles.cgStat}>{g.thru}</span>
                  <span className={styles.cgStat}>{g.pickPct}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}