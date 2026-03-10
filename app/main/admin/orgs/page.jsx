'use client'

import { useState, useEffect } from 'react'
import styles from './orgs.module.css'

function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function OrgsPage() {
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '' })
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    fetch('/api/admin/orgs')
      .then(r => r.json())
      .then(setOrgs)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/orgs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        join_code: generateJoinCode(),
      }),
    })
    const data = await res.json()
    setOrgs(prev => [data, ...prev])
    setForm({ name: '' })
    setLoading(false)
  }

  function copyCode(code) {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className={styles.container}>
      <a href="/admin" className={styles.back}>← Back to Admin</a>
      <h1 className={styles.title}>🏢 Orgs</h1>

      <div className={styles.card}>
        <h2>Create Org</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Org Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ name: e.target.value })}
              placeholder="e.g. Acme Corp Golf Pool"
              required
            />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Creating...' : 'Create Org'}
          </button>
        </form>
      </div>

      <div className={styles.list}>
        <h2>Existing Orgs</h2>
        {orgs.length === 0 && <p className={styles.empty}>No orgs yet</p>}
        {orgs.map(org => (
          <div key={org.id} className={styles.orgRow}>
            <div>
              <strong>{org.name}</strong>
              <span className={styles.meta}>Join Code: <code>{org.join_code}</code></span>
            </div>
            <button
              className={styles.copyBtn}
              onClick={() => copyCode(org.join_code)}
            >
              {copied === org.join_code ? '✅ Copied!' : '🔗 Copy Invite Link'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}