'use client'

import { useState, useEffect } from 'react'
import styles from './leaderboard.module.css'
import { Search, Star, ChevronDown, ChevronRight, ChevronLeft} from 'lucide-react'
import { FaCanadianMapleLeaf } from "react-icons/fa6";
import { mockLeaderboard, mockScorecard } from '@/lib/mock-data'

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

export default function GolfLeaderboard({ minimized, onToggle }) {
  const [golfers, setGolfers] = useState([])
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [scorecards, setScorecards] = useState({})
  const [activeRound, setActiveRound] = useState({})
  const [loadingId, setLoadingId] = useState(null)
  const [pickPct, setPickPct] = useState({})
  const [parMaps, setParMaps] = useState({})
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const saved = localStorage.getItem('golf-favorites')
      return new Set(saved ? JSON.parse(saved) : [])
    } catch { return new Set() }
  })
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showCanadiansOnly, setShowCanadiansOnly] = useState(false)


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

      // Refetch immediately when tab becomes visible again
      function handleVisibilityChange() {
        if (document.visibilityState === 'visible') fetchData()
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        clearInterval(interval)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }, [])

async function togglePlayer(id) {
  if (minimized) return
      if (expandedId === id) {
        setExpandedId(null)
        return
      }
      setExpandedId(id)
      if (!scorecards[id]) {
        setLoadingId(id)
        try {
          const res = await fetch(`/api/golf/player/${id}`)
          const data = await res.json()
          const rounds = (data.items || []).filter(r => r.linescores?.length > 0)
          if (rounds.length > 0) {
            setScorecards(prev => ({ ...prev, [id]: rounds }))
            setParMaps(prev => ({ ...prev, [id]: data.parMap || {} }))
            setActiveRound(prev => ({ ...prev, [id]: rounds.length - 1 }))
          } else {
            // fallback to mock
            const rounds = mockScorecard.items.filter(r => r.linescores?.length > 0)
            setScorecards(prev => ({ ...prev, [id]: rounds }))
            setParMaps(prev => ({ ...prev, [id]: mockScorecard.parMap }))
            setActiveRound(prev => ({ ...prev, [id]: rounds.length - 1 }))
          }
        } catch {
          const rounds = mockScorecard.items.filter(r => r.linescores?.length > 0)
          setScorecards(prev => ({ ...prev, [id]: rounds }))
          setParMaps(prev => ({ ...prev, [id]: mockScorecard.parMap }))
          setActiveRound(prev => ({ ...prev, [id]: rounds.length - 1 }))
        }
        setLoadingId(null)
      }
    }


  
  function toggleFavorite(id) {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('golf-favorites', JSON.stringify([...next]))
      return next
    })
  }


  const filtered = golfers.filter(g => {
    if (!g.name?.toLowerCase().includes(search.toLowerCase())) return false
    if (showFavoritesOnly && !favorites.has(g.id)) return false
    if (showCanadiansOnly && !g.country?.toLowerCase().includes('canada')) return false
    return true
  })

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
      <div className={styles.scorecardTopRow}>

        <div className={styles.scTopRowLeftSide}>
         <button
          className={styles.favStarBtn}
          onClick={e => { e.stopPropagation(); toggleFavorite(golferId) }}
          title={favorites.has(golferId) ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Star size={16} fill={favorites.has(golferId) ? '#c9a84c' : 'none'} color={favorites.has(golferId) ? '#c9a84c' : '#aaa'} />
        </button>
        

          <div className={styles.roundTabs}>
            <span>ROUND</span>
            {rounds.map((r, i) => (
              <button
                key={i}
                className={`${styles.roundTab} ${(activeRound[golferId] ?? rounds.length - 1) === i ? styles.activeRoundTab : ''}`}
                onClick={e => { e.stopPropagation(); setActiveRound(prev => ({ ...prev, [golferId]: i })) }}
              >
                {r.period}
              </button>
            ))}
          </div>

        </div>


        <div className={styles.scTopRowRightSide}>
           picked
           <div className={styles.pickPct}>
            {(parseFloat(pickPct[golferId]) || 0).toFixed(2)}% 
          </div>
          
          </div>
       
      </div>

      <div className={styles.scorecardTable}>

        <div className = {styles.frontNine + ' ' + styles.scNineHoles}>
          <div className={styles.scRow + ' ' + styles.scHeader}>
            <span className={styles.scLabelHole}>HOLE</span>
            {front.map(h => <span key={h.period} className={styles.scCell}>{h.period}</span>)}
            <span className={styles.scOut}>OUT</span>
          </div>

          <div className={styles.scRow + ' ' + styles.scParRow}>
          <span className={styles.scLabel}>PAR</span>
          {front.map(h => <span key={h.period} className={styles.scCell}>{h.par}</span>)}
          <span className={styles.scOut}>{frontPar}</span>
        </div>

        <div className={styles.scRow + ' ' + styles.scScoreRow}>
          <span className={styles.scLabel}>SCORE</span>
          {front.map(h => (
            <span key={h.period} className={`${styles.scCell} ${h.value !== null ? styles.scScore : ''} ${holeScoreClass(h.scoreType?.name)}`}>
              {h.value !== null ? h.value : ''}
            </span>
          ))}
          <span className={styles.scOut}>{frontPlayed ? frontScore : ''}</span>
          </div>

      </div>

        <div className = {styles.backNine + ' ' + styles.scNineHoles}>
         <div className={styles.scRow + ' ' + styles.scHeader}>
          <span className={styles.scLabelHole}>HOLE</span>
          {back.map(h => <span key={h.period} className={styles.scCell}>{h.period}</span>)}
          <span className={styles.scIn}>IN</span>
         </div>

        <div className={styles.scRow + ' ' + styles.scParRow}>
          <span className={styles.scLabel}>PAR</span>
          {back.map(h => <span key={h.period} className={styles.scCell}>{h.par}</span>)}
          <span className={styles.scIn}>{backPar}</span>
        </div>


        <div className={styles.scRow + ' ' + styles.scScoreRow}>
          <span className={styles.scLabel}>SCORE</span>
          {back.map(h => (
            <span key={h.period} className={`${styles.scCell} ${h.value !== null ? styles.scScore : ''} ${holeScoreClass(h.scoreType?.name)}`}>
              {h.value !== null ? h.value : ''}
            </span>
          ))}
          <span className={styles.scIn}>{backPlayed ? backScore : ''}</span>
        </div>

        </div>






      </div>
    </div>
  )
}

  return (
    <div className={`${styles.wrapper} ${minimized ? styles.minimized : ''}`}>
            <button className={styles.minimizeBtn} onClick={onToggle}>
        {minimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
      <div className={styles.header}>
        
        <div className={styles.searchHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 className={styles.title}>Leaderboard</h1>
          </div>
          <div>
   
            
          <div className={styles.searchRow}>
            <div className={styles.searchBox}>
              <span><Search size={14}/></span>
              <input
                placeholder="Search Player..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
              )}
            </div>
          </div>

            <button
              className={`${styles.filterBtn} ${showFavoritesOnly ? styles.filterBtnActive : ''}`}
              onClick={() => setShowFavoritesOnly(v => !v)}
              title="Show favourites only"
            >
              <Star size={14} fill={showFavoritesOnly ? '#ffffff' : 'none'} color={showFavoritesOnly ? 'white' : 'white'} />
            </button>
               <button
              className={`${styles.filterBtn} ${showCanadiansOnly ? styles.filterBtnActive : ''}`}
              onClick={() => setShowCanadiansOnly(v => !v)}
              title="Show Canadians only"
            >
             <FaCanadianMapleLeaf 
                size={14} 
                fill={showCanadiansOnly ? '#ffffff' : 'none'}
                style={{ 
                  stroke: 'white', 
                  strokeWidth: '25px'
                }} 
              />
            </button>
          </div>
        </div>
        <div className={styles.columnHeaders}>
          <span></span>
          <span></span>
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
                  onClick={() => togglePlayer(g.id)}
                  style={{
                    border: favorites.has(g.id) ? '1px solid #c9a84c' : '1px solid transparent',
                    cursor: 'pointer'
                  }}
                >
              <span className={styles.position}>{g.position}</span>
              <div className={styles.headshotWrap}>
                  <img 
                    className={styles.headshot} 
                    src={g.headshot || '/placeholder-golfer.png'}
                    alt={g.name}
                    onError={e => { e.target.onerror = null; e.target.src = '/placeholder-golfer.png' }}
                  />
                <img className={styles.flag} src={g.flag} alt={g.country} />
              </div>
              <span className={styles.name}>{g.name}</span>
              <span className={`${styles.score} ${scoreClass(g.score, styles)}`}>{g.score}</span>
              <span className={styles.today}>{g.today}</span>
              <span className={styles.thru}>{g.thru}</span>
              <span className={styles.expandBtn} style={{ color: '#c9a84c', fontSize: '0.7rem' }}>{expandedId === g.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
              </div>
              {expandedId === g.id && (
                <div className={styles.scorecardWrap}
                    style={{
                    borderBottom: favorites.has(g.id) ? '1px solid #c9a84c' : '1px solid transparent',
                    borderLeft: favorites.has(g.id) ? '1px solid #c9a84c' : '1px solid transparent',
                    borderRight: favorites.has(g.id) ? '1px solid #c9a84c' : '1px solid transparent',
                    borderTop: '0px solid transparent'
                  }}
                
                >
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