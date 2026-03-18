'use client'

import { useState, useEffect } from 'react'
import styles from './leaderboard.module.css'
import { Search } from 'lucide-react'
import { mockLeaderboard } from '@/lib/mock-data'


function scoreClass(score, styles) {
  if (!score || score === 'E') return styles.scoreEven
  if (score.startsWith('-')) return styles.scoreUnder
  return styles.scoreOver
}

function holeScoreClass(scoreType) {
  if (!scoreType) return ''
  switch (scoreType) {
    case 'EAGLE': return styles.eagle
    case 'BIRDIE': return styles.birdie
    case 'BOGEY': return styles.bogey
    case 'DOUBLE_BOGEY': return styles.doubleBogey
    case 'TRIPLE_BOGEY': return styles.tripleBogey
    default: return ''
  }
}


export default function GolfLeaderboard() {
  const [golfers, setGolfers] = useState([])
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [scorecards, setScorecards] = useState({})
  const [activeRound, setActiveRound] = useState({})
  const [loadingId, setLoadingId] = useState(null)

  const [pickPct, setPickPct] = useState({})

  useEffect(() => {
    fetch('/api/golf/pick-pct')
      .then(r => r.json())
      .then(d => { if (d.pickPct) setPickPct(d.pickPct) })
  }, [])

  useEffect(() => {
    function fetchData() {
      fetch('/api/golf')
        .then(r => r.json())
        .then(d => setGolfers(Array.isArray(d) && d.length ? d : mockLeaderboard))
        .catch(() => setGolfers(mockLeaderboard))
    }
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  async function togglePlayer(id) {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (!scorecards[id]) {
      setLoadingId(id)
      const res = await fetch(`/api/golf/player/${id}`)
      const data = await res.json()
      const rounds = (data.items || []).filter(r => r.linescores?.length > 0)
      setScorecards(prev => ({ ...prev, [id]: rounds }))
      setActiveRound(prev => ({ ...prev, [id]: rounds.length - 1 }))
      setLoadingId(null)
    }
  }

  const filtered = golfers.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase())
  )

  const active = filtered.filter(g => g.status !== 'STATUS_CUT' && g.status !== 'STATUS_WD')
  const cut = filtered.filter(g => g.status === 'STATUS_CUT' || g.status === 'STATUS_WD')

  function renderScorecard(golferId) {
    const rounds = scorecards[golferId]
    if (!rounds || rounds.length === 0) return <div className={styles.noData}>No scorecard available</div>

    const roundIndex = activeRound[golferId] ?? rounds.length - 1
    const round = rounds[roundIndex]
    if (!round) return null

    // Sort holes by period 1-18
    const holes = [...(round.linescores || [])].sort((a, b) => a.period - b.period)
    const front = holes.filter(h => h.period <= 9)
    const back = holes.filter(h => h.period >= 10)

    const frontPar = front.reduce((s, h) => s + h.par, 0)
    const backPar = back.reduce((s, h) => s + h.par, 0)
    const frontScore = front.reduce((s, h) => s + h.value, 0)
    const backScore = back.reduce((s, h) => s + h.value, 0)

    return (
      <div className={styles.scorecard}>
        {/* Round tabs */}
        <div className={styles.roundTabs}>
          {rounds.map((r, i) => (
            <button
              key={i}
              className={`${styles.roundTab} ${(activeRound[golferId] ?? rounds.length - 1) === i ? styles.activeRoundTab : ''}`}
              onClick={e => { e.stopPropagation(); setActiveRound(prev => ({ ...prev, [golferId]: i })) }}
            >
              R{r.period}
            </button>
          ))}
        </div>

        <div className={styles.scorecardTable}>
          {/* Header row */}
          <div className={styles.scRow + ' ' + styles.scHeader}>
            <span className={styles.scLabel}>HOLE</span>
            {front.map(h => <span key={h.period} className={styles.scCell}>{h.period}</span>)}
            <span className={styles.scOut}>OUT</span>
            {back.map(h => <span key={h.period} className={styles.scCell}>{h.period}</span>)}
            <span className={styles.scIn}>IN</span>
            <span className={styles.scTotal}>TOT</span>
          </div>
          {/* Par row */}
          <div className={styles.scRow + ' ' + styles.scParRow}>
            <span className={styles.scLabel}>PAR</span>
            {front.map(h => <span key={h.period} className={styles.scCell}>{h.par}</span>)}
            <span className={styles.scOut}>{frontPar}</span>
            {back.map(h => <span key={h.period} className={styles.scCell}>{h.par}</span>)}
            <span className={styles.scIn}>{backPar}</span>
            <span className={styles.scTotal}>{frontPar + backPar}</span>
          </div>
          {/* Score row */}
          <div className={styles.scRow + ' ' + styles.scScoreRow}>
            <span className={styles.scLabel}>SCORE</span>
            {front.map(h => (
              <span key={h.period} className={`${styles.scCell} ${styles.scScore} ${holeScoreClass(h.scoreType?.name, styles)}`}>
                {h.value}
              </span>
            ))}
            <span className={styles.scOut}>{frontScore}</span>
            {back.map(h => (
              <span key={h.period} className={`${styles.scCell} ${styles.scScore} ${holeScoreClass(h.scoreType?.name, styles)}`}>
                {h.value}
              </span>
            ))}
            <span className={styles.scIn}>{backScore}</span>
            <span className={styles.scTotal}>{frontScore + backScore}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.searchHeader}>
            <h1 className={styles.title}>Leaderboard</h1>
            <div className={styles.searchBox}>
              <span><Search size={10}/></span>
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
          <span>TOTAL</span>
          <span>TODAY</span>
          <span>THRU</span>
          <span></span>
        </div>
      </div>

      
      <div className={styles.leaderboardList}>
        {active.map((g) => (
          <div key={g.id}>
            <div
              className={styles.row}
              style={{ cursor: 'pointer' }}
              onClick={() => togglePlayer(g.id)}
            >
              <span className={styles.position}>{g.position}</span>
              <div className={styles.headshot} >
                <img className={styles.headshot} src={g.headshot} alt={g.name} />
                <img className={styles.flag} src={g.flag} alt={g.country} />
              </div>
              
              <span className={styles.name}>{g.name}</span>
              <span className={`${styles.score} ${scoreClass(g.score, styles)}`}>{g.score}</span>
              <span className={styles.today}>{g.today}</span>
              <span className={styles.thru}>{g.thru}</span>
              {/* {pickPct[g.id] ? (
                <span className={styles.pickPct}>{pickPct[g.id]}%</span>
              ) : (
                <span className={styles.pickPct}>—</span>
              )} */}
              <span style={{ color: '#aaa', fontSize: '0.7rem' }}>{expandedId === g.id ? '▲' : '▼'}</span>
            </div>
            {expandedId === g.id && (
              <div className={styles.scorecardWrap}>
                {loadingId === g.id
                  ? <div className={styles.loadingScore}>Loading...</div>
                  : renderScorecard(g.id)
                }
              </div>
            )}
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
              <div key={g.id}>
                <div
                  className={`${styles.row} ${styles.cutRow}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => togglePlayer(g.id)}
                >
                  <span className={styles.position}>{g.position}</span>
                  <img className={styles.headshot} src={g.headshot} alt={g.name} />
                  <img className={styles.flag} src={g.flag} alt={g.country} />
                  <span className={styles.name}>{g.name}</span>
                  <span className={styles.score}>{g.score}</span>
                  <span className={styles.today}>{g.today}</span>
                  <span className={styles.thru}>{g.thru}</span>
                  {pickPct[g.id] ? (
                    <span className={styles.pickPct}>{pickPct[g.id]}%</span>
                  ) : (
                    <span className={styles.pickPct}>—</span>
                  )}
                  <span style={{ color: '#aaa', fontSize: '0.7rem' }}>{expandedId === g.id ? '▲' : '▼'}</span>
                </div>
                {expandedId === g.id && (
                  <div className={styles.scorecardWrap}>
                    {loadingId === g.id
                      ? <div className={styles.loadingScore}>Loading...</div>
                      : renderScorecard(g.id)
                    }
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}