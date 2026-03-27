'use client'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DeleteTeamButton({ teamId }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    await fetch('/api/teams/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: teamId }),
    })
    router.refresh()
    setDeleting(false)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleDelete} disabled={deleting} style={{ background: '#8b1a1a', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>
          {deleting ? 'Deleting...' : 'Confirm Delete'}
        </button>
        <button onClick={() => setConfirming(false)} style={{ background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{ background: 'transparent', border: '1px solid #8b1a1a', color: '#8b1a1a', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
    >
      <Trash2 size={14} /> Delete
    </button>
  )
}