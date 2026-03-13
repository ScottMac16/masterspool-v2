'use client'

import { useState } from 'react'
import styles from './admin.module.css'

export default function SnapshotTrigger() {
  const [round, setRound] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function triggerSnapshot() {
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/admin/trigger-snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round }),
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div className={styles.card}>
      <h2>📸 Round Snapshot</h2>
      <p>Save current scores as end-of-round snapshot</p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[1, 2, 3, 4].map(r => (
          <button
            key={r}
            onClick={() => setRound(r)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '2px solid #1a4731',
              background: round === r ? '#1a4731' : 'white',
              color: round === r ? 'white' : '#1a4731',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            R{r}
          </button>
        ))}
      </div>
      <button
        className={styles.btn}
        onClick={triggerSnapshot}
        disabled={loading}
      >
        {loading ? 'Saving...' : `Save Round ${round} Snapshot`}
      </button>
      {result && (
        <p style={{ marginTop: '8px', fontSize: '0.85rem', color: result.error ? 'red' : 'green' }}>
          {result.error ? `Error: ${result.error}` : `✅ Saved ${result.count} teams for Round ${result.round}`}
        </p>
      )}
    </div>
  )
}