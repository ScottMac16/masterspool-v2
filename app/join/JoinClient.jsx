'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flag, Trophy } from 'lucide-react'
import styles from './join.module.css'

export default function JoinClient() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleJoinWithCode() {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    router.push(`/join/${code.trim().toUpperCase()}`)
  }

  async function handleGrandPoolOnly() {
    setLoading(true)
    const res = await fetch('/api/join-grand-pool', { method: 'POST' })
    if (res.ok) {
      router.push('/my-picks')
    } else {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}><Flag size={40} /></div>
        <h1 className={styles.title}>Welcome to the Pool!</h1>
        <p className={styles.subtitle}>Have an invite code? Enter it below. Otherwise you can jump straight into the SMAC Pool.</p>

        <div className={styles.codeSection}>
          <input
            className={styles.codeInput}
            placeholder="Enter invite code"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoinWithCode()}
          />
          <button
            className={styles.joinBtn}
            onClick={handleJoinWithCode}
            disabled={loading || !code.trim()}
          >
            Join Pool →
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          className={styles.grandPoolBtn}
          onClick={handleGrandPoolOnly}
          disabled={loading}
        >
          <Trophy size={16} style={{marginRight: 6, verticalAlign: 'middle'}} /> Skip — just enter the SMAC Pool
        </button>
      </div>
    </div>
  )
}