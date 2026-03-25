'use client'

import { mockPoolData } from '@/lib/mock-data'
import { useState, useEffect } from 'react'
import { Trophy, List, LayoutGrid, ChevronDown, ChevronRight } from 'lucide-react'
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
  const [error, setError] = useState(false)

  function toggleTeam(id) {
    setExpandedTeams(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
  let retries = 0

  async function fetchData() {
    try {
      const res = await fetch('/api/pool-leaderboard')
      const d = await res.json()
      if (d && d.scoredTeams) {
        setData(d)
        setError(false)
        retries = 0 // reset retries on success
      } else if (retries < 3) {
        retries++
        setTimeout(fetchData, 2000)
      } else {
        setData(mockPoolData)
      }
    } catch (e) {
      if (retries < 3) {
        retries++
        setTimeout(fetchData, 2000)
      } else {
        setData(mockPoolData)
      }
    }
  }

  fetchData()
  const interval = setInterval(fetchData, 60000)

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      retries = 0
      fetchData()
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)

  return () => {
    clearInterval(interval)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}, [])

  if (error) return (
    <div className={styles.loading} onClick={() => { setError(false); setData(null) }}>
      Failed to load. Tap to retry.
    </div>
  )

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

  return (
    <div className={styles.wrapper}>

      {/* Header */}
      <div className={styles.header}>
          <h1 className={styles.title}>POOL LEADERBOARD</h1>
          <div className={styles.headerTop}>

            
     
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${view === 'list' ? styles.activeView : ''}`}
                onClick={() => setView('list')}
                title="List view"
              ><List size={16} /></button>
              <button
                className={`${styles.viewBtn} ${view === 'card' ? styles.activeView : ''}`}
                onClick={() => setView('card')}
                title="Card view"
              ><LayoutGrid size={16} /></button>
            </div>
          </div>

          <div className={styles.headerBottom}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'grandpool' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('grandpool')}
              >
                <Trophy size={14} /> SMAC Pool
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
          </div>
      </div>

      {/* Org Tabs */}
     

      {/* List View */}
      {view === 'list' && (
        <div className={styles.listView}>
          <div className={styles.listHeader}>
            <span className={styles.colTeam}>POS</span>
            <span className={styles.colTeam}>TEAM NAME</span>
            <span>TOTAL</span>
            <span>TODAY</span>
            <span>CUT</span>
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
                <span className={styles.colExpand}>{expandedTeams.has(team.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
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