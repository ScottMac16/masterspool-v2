'use client'

import { useState, useEffect, useRef } from 'react'
import { DollarSign, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import styles from './salaries.module.css'

export default function SalariesPage() {
  const [tournaments, setTournaments] = useState([])
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [espnGolfers, setEspnGolfers] = useState([])
  const [matched, setMatched] = useState([])
  const [unmatched, setUnmatched] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    fetch('/api/admin/tournaments')
      .then(r => r.json())
      .then(setTournaments)

    // Load full ESPN golfer database on mount
    fetch('/api/golfers')
      .then(r => r.json())
      .then(setEspnGolfers)
  }, [])

  async function handleSelectTournament(tournament) {
    setSelectedTournament(tournament)
    setMatched([])
    setUnmatched([])
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleCSV(e) {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (ev) => {
    const lines = ev.target.result.trim().split('\n').slice(1)

    const rows = lines.map(line => {
      const cols = line.split(',')
      const name = cols[3]?.trim().replace(/\r/g, '')  // strip carriage returns
      const salary = parseInt(cols[7]?.trim()) || 0
      return { name, salary }
    }).filter(r => r.name && r.salary > 0)

    // Build a lookup map from ESPN golfers — lowercase for case-insensitive match
    const nameMap = {}
    espnGolfers.forEach(g => {
      nameMap[g.name.toLowerCase()] = g
    })

    const matchedList = []
    const unmatchedList = []

    rows.forEach(row => {
      const espnPlayer = nameMap[row.name.toLowerCase().trim()]
      if (espnPlayer) {
        matchedList.push({
          csv_name: row.name,
          salary: row.salary,
          espn_id: espnPlayer.id,
          espn_name: espnPlayer.name,
          headshot: espnPlayer.headshot,
        })
      } else {
        unmatchedList.push({
          csv_name: row.name,
          salary: row.salary,
          espn_id: '',
          resolved_name: '',
          resolved_headshot: '',
          manual_name: '',
          manual_headshot: '',
          status: 'pending',
        })
      }
    })

    setMatched(matchedList)
    setUnmatched(unmatchedList)
  }
  reader.readAsText(file)

}

 async function handleIdLookup(espnId, index) {
  if (!espnId) return

  const res = await fetch(`/api/golfers/${espnId}`)
  const data = await res.json()
  
  console.log('Lookup result:', espnId, data)

  const updated = [...unmatched]
  if (data?.name) {
    updated[index].espn_id = espnId
    updated[index].resolved_name = data.name
    updated[index].resolved_headshot = data.headshot
    updated[index].status = 'found'
  } else {
    updated[index].espn_id = espnId
    updated[index].status = 'notfound'
  }
  setUnmatched(updated)
}

  async function handleSave() {
    setSaving(true)

    // 1. Add any new amateurs to the golfers table first
    const newGolfers = unmatched
      .filter(u => u.status === 'notfound' && u.espn_id && u.manual_name)
      .map(u => ({
        id: u.espn_id,
        name: u.manual_name,
        headshot: u.manual_headshot || `https://a.espncdn.com/i/headshots/golf/players/full/${u.espn_id}.png`,
      }))

    if (newGolfers.length > 0) {
      await fetch('/api/admin/golfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGolfers),
      })
    }

    // 2. Save all salaries
    const allEntries = [
      ...matched.map(m => ({
        tournament_id: selectedTournament.id,
        golfer_espn_id: m.espn_id,
        golfer_name: m.espn_name,
        salary: m.salary,
      })),
      ...unmatched
        .filter(u => u.status === 'found')
        .map(u => ({
          tournament_id: selectedTournament.id,
          golfer_espn_id: u.espn_id,
          golfer_name: u.resolved_name,
          salary: u.salary,
        })),
      ...unmatched
        .filter(u => u.status === 'notfound' && u.espn_id && u.manual_name)
        .map(u => ({
          tournament_id: selectedTournament.id,
          golfer_espn_id: u.espn_id,
          golfer_name: u.manual_name,
          salary: u.salary,
        })),
    ]
    console.log('Unmatched statuses:', unmatched.map(u => ({ name: u.csv_name, status: u.status, espn_id: u.espn_id })))
    console.log('All entries to save:', allEntries)
    await fetch('/api/admin/salaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allEntries),
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const readyToSave = matched.length > 0 || unmatched.some(u => u.status === 'found' || (u.status === 'notfound' && u.manual_name))

  return (
    <div className={styles.container}>
      <a href="/admin" className={styles.back}>← Back to Admin</a>
      <h1 className={styles.title}><DollarSign size={24} /> Golfer Salaries</h1>

      {/* Step 1: Select Tournament */}
      <div className={styles.card}>
        <h2>1. Select Tournament</h2>
        <div className={styles.tournamentList}>
          {tournaments.map(t => (
            <button
              key={t.id}
              className={`${styles.tournamentBtn} ${selectedTournament?.id === t.id ? styles.active : ''}`}
              onClick={() => handleSelectTournament(t)}
            >
              {t.name} ({t.year})
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Upload CSV */}
      {selectedTournament && (
        <div className={styles.card}>
          <h2>2. Upload FanDuel CSV</h2>
          <p className={styles.hint}>Export from fanduel.com/research/pga → CSV</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleCSV}
            className={styles.fileInput}
          />
        </div>
      )}

      {/* Matched */}
      {matched.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}><CheckCircle size={16} /> Matched ({matched.length})</h2>
          <div className={styles.golferList}>
            <div className={styles.matchedHeader}>
              <span>ESPN Player</span>
              <span>FanDuel Name</span>
              <span>Salary</span>
            </div>
            {matched.map((m, i) => (
              <div key={i} className={styles.golferRow}>
                <div className={styles.golferInfo}>
                  <img src={m.headshot} alt={m.espn_name} className={styles.headshot} />
                  <span>{m.espn_name}</span>
                </div>
                <span className={styles.csvName}>{m.csv_name}</span>
                <span className={styles.salary}>${m.salary.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unmatched */}
      {unmatched.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}><XCircle size={16} /> Unmatched ({unmatched.length})</h2>
          <div className={styles.golferList}>
            <div className={styles.unmatchedHeader}>
              <span>FanDuel Name</span>
              <span>Salary</span>
              <span>ESPN ID</span>
              <span>Result</span>
            </div>
            {unmatched.map((u, i) => (
              <div key={i} className={styles.unmatchedRow}>
                <span>{u.csv_name}</span>
                <span className={styles.salary}>${u.salary.toLocaleString()}</span>
                <input
                  type="text"
                  className={styles.idInput}
                  placeholder="ESPN ID"
                  value={u.espn_id}
                  onChange={e => {
                    const updated = [...unmatched]
                    updated[i].espn_id = e.target.value
                    updated[i].status = 'pending'
                    setUnmatched(updated)
                  }}
                  onBlur={e => handleIdLookup(e.target.value, i)}
                />
                <div className={styles.result}>
                  {u.status === 'found' && (
                    <div className={styles.foundResult}>
                      <img src={u.resolved_headshot} className={styles.headshot} />
                      <span className={styles.foundName}><CheckCircle size={14} /> {u.resolved_name}</span>
                    </div>
                  )}
                  {u.status === 'notfound' && (
                    <div className={styles.notFoundResult}>
                      <span className={styles.notFoundLabel}><AlertTriangle size={14} /> Amateur — enter details:</span>
                      <input
                        type="text"
                        className={styles.idInput}
                        placeholder="Full name"
                        value={u.manual_name}
                        onChange={e => {
                          const updated = [...unmatched]
                          updated[i].manual_name = e.target.value
                          setUnmatched(updated)
                        }}
                      />
                      <input
                        type="text"
                        className={styles.idInput}
                        placeholder="Headshot URL (optional)"
                        value={u.manual_headshot}
                        onChange={e => {
                          const updated = [...unmatched]
                          updated[i].manual_headshot = e.target.value
                          setUnmatched(updated)
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save */}
      {readyToSave && (
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? <><CheckCircle size={14} /> Saved!</> : 'Save Salaries'}
        </button>
      )}
    </div>
  )
}