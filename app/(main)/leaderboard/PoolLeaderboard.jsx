'use client'

// import { mockPoolData } from '@/lib/mock-data'
import { useState, useEffect } from 'react'
import { Trophy, List, LayoutGrid, ChevronDown, ChevronRight, Search, Star, User } from 'lucide-react'
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
  const [teamSearch, setTeamSearch] = useState('')
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false)
  const [showMyTeamsOnly, setShowMyTeamsOnly] = useState(false)
  const [favourites, setFavourites] = useState(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const saved = localStorage.getItem('pool-favourites')
      return new Set(saved ? JSON.parse(saved) : [])
    } catch { return new Set() }
  })

  function toggleFavourite(e, id) {
    e.stopPropagation()
    setFavourites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('pool-favourites', JSON.stringify([...next]))
      return next
    })
  }

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
          retries = 0
        } else if (retries < 3) {
          retries++
          setTimeout(fetchData, 2000)
        } else {
          setError(true)
        }
      } catch (e) {
        if (retries < 3) {
          retries++
          setTimeout(fetchData, 2000)
        } else {
          setError(true)
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

  // Set default tab based on whether user is in grand pool
  useEffect(() => {
    if (!data) return
    const { scoredTeams, orgs, currentUserId } = data
    const inGrandPool = scoredTeams.some(t => t.user_id === currentUserId && t.in_grand_pool && t.paid_grand_pool)
    if (!inGrandPool && orgs.length > 0) {
      setActiveTab(orgs[0]?.id)
    }
  }, [data])

  if (error) return (
    <div className={styles.loading} onClick={() => { setError(false); setData(null) }}>
      Failed to load. Tap to retry.
    </div>
  )

  if (!data) return <div className={styles.loading}>Loading...</div>

  if (data && !data.scoredTeams) return (
  <div className={styles.loading}>
    <p>Please sign in to view pool standings.</p>
    <a href="/sign-in" style={{ color: '#c9a84c', marginTop: '8px', display: 'block' }}>Sign In →</a>
  </div>
)

  const { scoredTeams, orgs, currentUserId } = data

  const grandPoolTeams = scoredTeams.filter(t => t.in_grand_pool && t.paid_grand_pool)
  const userInGrandPool = scoredTeams.some(t => t.user_id === currentUserId && t.in_grand_pool && t.paid_grand_pool)
  const visibleOrgs = orgs.filter(org => scoredTeams.some(t => t.org_id === org.id && t.paid))
  const showTabs = userInGrandPool && visibleOrgs.length > 0

  const activeTeams = activeTab === 'grandpool'
    ? grandPoolTeams
    : scoredTeams.filter(t => t.org_id === activeTab && t.paid)

  const rankedTeams = activeTeams.map((t, i, arr) => {
    const rank = arr.findIndex(a => a.totalScore === t.totalScore) + 1
    return { ...t, rank }
  })

  const filteredTeams = rankedTeams.filter(t => {
    if (teamSearch && !t.team_name.toLowerCase().includes(teamSearch.toLowerCase())) return false
    if (showFavouritesOnly && !favourites.has(t.id)) return false
    if (showMyTeamsOnly && t.user_id !== currentUserId) return false
    return true
  })

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>

          {showTabs && (
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'grandpool' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('grandpool')}
              >
                <Trophy size={14} /> SMAC Pool
                <span className={styles.tabCount}>{grandPoolTeams.length}</span>
              </button>
              {visibleOrgs.map(org => (
                <button
                  key={org.id}
                  className={`${styles.tab} ${activeTab === org.id ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(org.id)}
                >
                  {org.name}
                  <span className={styles.tabCount}>
                    {scoredTeams.filter(t => t.org_id === org.id && t.paid).length}
                  </span>
                </button>
              ))}
            </div>
          )}

          
        <h1 className={styles.title}>POOL LEADERBOARD</h1>

 

        <div className={styles.headerTop}>
          <div className={styles.searchBox}>
            <Search size={14} />
            <input
              placeholder="Search teams..."
              value={teamSearch}
              onChange={e => setTeamSearch(e.target.value)}
            />
            {teamSearch && (
              <button className={styles.clearBtn} onClick={() => setTeamSearch('')}>✕</button>
            )}
          </div>
          <div className={styles.headerButtons}>
            {currentUserId ? (
                <>
                  <button
                    className={`${styles.viewBtn} ${showMyTeamsOnly ? styles.activeView : ''}`}
                    onClick={() => setShowMyTeamsOnly(v => !v)}
                    title="Show my teams only"
                  >
                    <User size={14} color={showMyTeamsOnly ? '#c9a84c' : 'white'} />
                  </button>
                  <button
                    className={`${styles.viewBtn} ${showFavouritesOnly ? styles.activeView : ''}`}
                    onClick={() => setShowFavouritesOnly(v => !v)}
                    title="Show favourites only"
                  >
                    <Star size={14} fill={showFavouritesOnly ? '#c9a84c' : 'none'} color={showFavouritesOnly ? '#c9a84c' : 'white'} />
                  </button>
                </>
              ) : (
                <a href="/sign-in" className={styles.signInBanner}>
                  Sign in to track your team
                </a>
              )}
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
        </div>

        <div className={styles.headerBottom}>
          {teamSearch && (
            <div className={styles.filterPill}>
              Filter Search: {teamSearch.toUpperCase()}
              <button onClick={() => setTeamSearch('')}>✕</button>
            </div>
          )}

        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className={styles.listView}>
          <div className={styles.listHeader}>
            <span className={styles.colPos}>POS</span>
            <span className={styles.colTeam}>TEAM NAME</span>
            <span>TOTAL</span>
            <span>TODAY</span>
            <span>CUT</span>
            <span className={styles.colExpand}></span>
          </div>
          {filteredTeams.map(team => (
            <div key={team.id} className={styles.listItem}>
              <div
                  className={`${styles.listRow} ${team.user_id === currentUserId ? styles.myTeamRow : ''} ${favourites.has(team.id) ? styles.favouriteRow : ''}`}
                  onClick={() => toggleTeam(team.id)}
                >
                <span className={styles.colPos}>{team.rank}</span>
                <span className={styles.colTeam}>
                  {team.team_name}
                </span>
                <span className={styles.totScore}>
                  {formatScore(team.totalScore)}
                </span>
                <span className={styles.colStat}>
                  {formatScore(team.todayScore)}
                </span>
                <span className={styles.colStat}>{team.cutCount}</span>
                <span className={styles.colExpand}>
                  {expandedTeams.has(team.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              </div>

              {expandedTeams.has(team.id) && (
                <div className={styles.expandedGolfers}>
                  <div className={styles.cardGolferHeader}>
                    <span className={styles.cgPos}>
                      <button
                        className={styles.starBtn}
                        onClick={e => toggleFavourite(e, team.id)}
                        title={favourites.has(team.id) ? 'Remove from favourites' : 'Add to favourites'}
                      >
                        <Star size={12} fill={favourites.has(team.id) ? '#c9a84c' : 'none'} color={favourites.has(team.id) ? '#c9a84c' : '#aaa'} />
                      </button>

                    </span>
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
                      <span className={styles.totScore}>
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
          {filteredTeams.map(team => (
            <div key={team.id} className={`${styles.card} ${team.user_id === currentUserId ? styles.myTeamCard : ''} ${favourites.has(team.id) ? styles.favouriteCard : ''}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardRank}>{team.rank}</span>
                <span className={styles.cardTeamName}>
                  {team.team_name}
                </span>
                <span className={`${styles.cardTotal} ${scoreClass(team.totalScore, styles)}`}>
                  {formatScore(team.totalScore)}
                </span>
                <span className={`${styles.cardToday} ${scoreClass(team.todayScore, styles)}`}>
                  {formatScore(team.todayScore)}
                </span>
                <span className={styles.cardCuts}>{team.cutCount}</span>
              </div>
              <div className={styles.cardGolferHeader}>
                <span className={styles.cgPos}>
                  <button
                    className={styles.starBtn}
                    onClick={e => toggleFavourite(e, team.id)}
                    title={favourites.has(team.id) ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <Star size={14} fill={favourites.has(team.id) ? '#c9a84c' : 'none'} color={favourites.has(team.id) ? '#c9a84c' : '#aaa'} />
                  </button>
                </span>
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