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
  const [parMaps, setParMaps] = useState({})

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
      setParMaps(prev => ({ ...prev, [id]: data.parMap || {} }))
      setActiveRound(prev => ({ ...prev, [id]: rounds.length - 1 }))
      setLoadingId(null)
    }
  }

  const filtered = golfers.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase())
  )

  const isCut = (g) => g.status === 'STATUS_CUT' || g.status === 'STATUS_WD'

  function renderScorecard(golferId) {
  const rounds = scorecards[golferId]
  if (!rounds || rounds.length === 0) return <div className={styles.noData}>No scorecard available</div>

  const roundIndex = activeRound[golferId] ?? rounds.length - 1
  const round = rounds[roundIndex]
  if (!round) return null

  const parMap = parMaps[golferId] || {}

  // Build played holes map
  const playedHoles = {}
  ;(round.linescores || []).forEach(h => { playedHoles[h.period] = h })

  // Always show all 18 holes
  const allHoles = Array.from({ length: 18 }, (_, i) => {
    const num = i + 1
    const played = playedHoles[num]
    return {
      period: num,
      par: parMap[num] || 4,
      value: played?.value ?? null,
      scoreType: played?.scoreType ?? null,
    }
  })

  const front = allHoles.slice(0, 9)
  const back = allHoles.slice(9, 18)

  const frontPar = front.reduce((s, h) => s + h.par, 0)
  const backPar = back.reduce((s, h) => s + h.par, 0)
  const frontScore = front.reduce((s, h) => s + (h.value ?? 0), 0)
  const backScore = back.reduce((s, h) => s + (h.value ?? 0), 0)
  const frontPlayed = front.some(h => h.value !== null)
  const backPlayed = back.some(h => h.value !== null)

  return (
    <div className={styles.scorecard}>
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
        <div className={styles.scRow + ' ' + styles.scHeader}>
          <span className={styles.scLabel}>HOLE</span>
          {front.map(h => <span key={h.period} className={styles.scCell}>{h.period}</span>)}
          <span className={styles.scOut}>OUT</span>
          {back.map(h => <span key={h.period} className={styles.scCell}>{h.period}</span>)}
          <span className={styles.scIn}>IN</span>
          <span className={styles.scTotal}>TOT</span>
        </div>

        <div className={styles.scRow + ' ' + styles.scParRow}>
          <span className={styles.scLabel}>PAR</span>
          {front.map(h => <span key={h.period} className={styles.scCell}>{h.par}</span>)}
          <span className={styles.scOut}>{frontPar}</span>
          {back.map(h => <span key={h.period} className={styles.scCell}>{h.par}</span>)}
          <span className={styles.scIn}>{backPar}</span>
          <span className={styles.scTotal}>{frontPar + backPar}</span>
        </div>

        <div className={styles.scRow + ' ' + styles.scScoreRow}>
          <span className={styles.scLabel}>SCORE</span>
          {front.map(h => (
            <span key={h.period} className={`${styles.scCell} ${h.value !== null ? styles.scScore : ''} ${holeScoreClass(h.scoreType?.name)}`}>
              {h.value !== null ? h.value : ''}
            </span>
          ))}
          <span className={styles.scOut}>{frontPlayed ? frontScore : ''}</span>
          {back.map(h => (
            <span key={h.period} className={`${styles.scCell} ${h.value !== null ? styles.scScore : ''} ${holeScoreClass(h.scoreType?.name)}`}>
              {h.value !== null ? h.value : ''}
            </span>
          ))}
          <span className={styles.scIn}>{backPlayed ? backScore : ''}</span>
          <span className={styles.scTotal}>{frontPlayed ? frontScore + backScore : ''}</span>
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
        {filtered.map((g) => (
          <div key={g.id}>
            <div
              className={`${styles.row} ${isCut(g) ? styles.cutRow : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => togglePlayer(g.id)}
            >
              <span className={styles.position}>{g.position}</span>
              <div className={styles.headshotWrap}>
                <img className={styles.headshot} src={g.headshot} alt={g.name} />
                <img className={styles.flag} src={g.flag} alt={g.country} />
              </div>
              <span className={styles.name}>{g.name}</span>
              <span className={`${styles.score} ${scoreClass(g.score, styles)}`}>{g.score}</span>
              <span className={styles.today}>{g.today}</span>
              <span className={styles.thru}>{g.thru}</span>
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
      </div>
    </div>
  )
}