'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function JoinCodePage() {
  const router = useRouter()
  const { code } = useParams()

  useEffect(() => {
    async function join() {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/my-picks')
      } else {
        router.push('/join?error=invalid')
      }
    }
    join()
  }, [code])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f0e8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🏌️</div>
        <p style={{ color: '#1a4731', fontWeight: '600' }}>Joining pool...</p>
      </div>
    </div>
  )
}