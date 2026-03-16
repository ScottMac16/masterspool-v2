'use client'

import { useState, useEffect } from 'react'
import { Trophy, Check, Lock, CircleDot } from 'lucide-react'
import styles from './tournaments.module.css'

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({
    espn_event_id: '',
    salary_cap: 80000,
    max_picks: 8,
  })

  useEffect(() => {
    fetch('/api/admin/tournaments')
      .then(r => r.json())
      .then(setTournaments)
  }, [])

  async function handlePreview() {
    if (!form.espn_event_id) return
    setPreviewing(true)
    const res = await fetch(`/api/admin/tournaments/preview?event_id=${form.espn_event_id}`)
    const data = await res.json()
    setPreview(data)
    setPreviewing(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!preview) return
    setLoading(true)
    const res = await fetch('/api/admin/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        name: preview.name,
        start_date: preview.start_date,
        year: preview.year,
      }),
    })
    const data = await res.json()
    setTournaments(prev => [data, ...prev])
    setForm({ espn_event_id: '', salary_cap: 80000, max_picks: 8 })
    setPreview(null)
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <a href="/admin" className={styles.back}>← Back to Admin</a>
      <h1 className={styles.title}><Trophy size={24} /> Tournaments</h1>

      <div className={styles.card}>
        <h2>Create Tournament</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>ESPN Event ID</label>
            <div className={styles.previewRow}>
              <input
                value={form.espn_event_id}
                onChange={e => { setForm({ ...form, espn_event_id: e.target.value }); setPreview(null) }}
                placeholder="e.g. 401811936"
                required
              />
              <button type="button" className={styles.previewBtn} onClick={handlePreview} disabled={previewing}>
                {previewing ? 'Loading...' : 'Lookup'}
              </button>
            </div>
          </div>

          {preview && (
            <div className={styles.preview}>
              <strong><Check size={14} /> {preview.name}</strong>
              <span>{preview.year} · Starts: {new Date(preview.start_date).toLocaleDateString()}</span>
            </div>
          )}

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Salary Cap ($)</label>
              <input
                type="number"
                value={form.salary_cap}
                onChange={e => setForm({ ...form, salary_cap: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Max Picks</label>
              <input
                type="number"
                value={form.max_picks}
                onChange={e => setForm({ ...form, max_picks: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.btn} disabled={loading || !preview}>
            {loading ? 'Creating...' : 'Create Tournament'}
          </button>
        </form>
      </div>

      <div className={styles.list}>
        <h2>Existing Tournaments</h2>
        {tournaments.length === 0 && <p className={styles.empty}>No tournaments yet</p>}
        {tournaments.map(t => (
          <div key={t.id} className={styles.tournamentRow}>
            <div>
              <strong>{t.name}</strong>
              <span className={styles.meta}>
                {t.year} · Cap: ${t.salary_cap?.toLocaleString()} · Max Picks: {t.max_picks} · ESPN ID: {t.espn_event_id}
              </span>
            </div>
            <span className={t.picks_locked ? styles.locked : styles.open}>
              {t.picks_locked ? <><Lock size={14} /> Locked</> : <><CircleDot size={14} /> Open</>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}