'use client'

import { useState } from 'react'
import { Pencil, X, Lock, CheckCircle } from 'lucide-react'
import styles from './picks.module.css'

function sortSlots(slots) {
  return [...slots].sort((a, b) => {
    if (!a) return 1
    if (!b) return -1
    return b.salary - a.salary
  })
}

export default function PicksClient({ tournament, orgs, salaries, existingTeams, userId, editTeam }) {
  const [selectedOrg, setSelectedOrg] = useState(orgs[0]?.id || null)
  const [teamName, setTeamName] = useState(editTeam?.team_name || '')
  const [inGrandPool, setInGrandPool] = useState(
    editTeam?.in_grand_pool || (orgs.length === 1 && orgs[0]?.id === '00000000-0000-0000-0000-000000000001')
  )
  const [editTeamId] = useState(editTeam?.id || null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')
  const [activeSlot, setActiveSlot] = useState(null)
  const [mobileView, setMobileView] = useState('slots')

  const initialPicks = editTeam
    ? [1,2,3,4,5,6,7,8]
        .map(i => editTeam[`golfer_${i}`])
        .filter(Boolean)
        .map(g => ({ golfer_espn_id: g.id, golfer_name: g.name, salary: g.salary }))
    : []

  const [slots, setSlots] = useState(() => {
    const arr = Array(8).fill(null)
    initialPicks.forEach((p, i) => { arr[i] = p })
    return arr
  })

  const maxPicks = tournament.max_picks
  const salaryCap = tournament.salary_cap
  const picks = slots.filter(Boolean)
  const totalSalary = picks.reduce((sum, p) => sum + p.salary, 0)
  const remaining = salaryCap - totalSalary
  const picksLocked = tournament.picks_locked
  const isGrandPoolOnly = orgs.length === 1 && orgs[0]?.id === '00000000-0000-0000-0000-000000000001'
  const pickedIds = new Set(slots.filter(Boolean).map(p => p.golfer_espn_id))

  function handleSlotClick(index) {
    if (picksLocked) return
    setActiveSlot(index)
    setSearch('')
    setMobileView('players')
  }

  function handleRemove(index) {
    if (picksLocked) return
    const newSlots = [...slots]
    newSlots[index] = null
    setSlots(sortSlots(newSlots))
  }

  function handlePickPlayer(golfer) {
    const newSlots = [...slots]
    newSlots[activeSlot] = golfer
    setSlots(sortSlots(newSlots))
    setActiveSlot(null)
    setMobileView('slots')
  }

  function handleDesktopPick(golfer) {
    const newSlots = [...slots]
    const nextEmpty = newSlots.findIndex(s => s === null)
    if (nextEmpty === -1) return
    newSlots[nextEmpty] = golfer
    setSlots(sortSlots(newSlots))
  }

  function cancelPick() {
    setActiveSlot(null)
    setMobileView('slots')
  }

  async function handleSubmit() {
    if (!teamName) return alert('Please enter a team name')
    if (picks.length !== maxPicks) return alert(`Please select exactly ${maxPicks} players`)

    const orgId = selectedOrg || orgs[0]?.id
    if (!orgId) return alert('Please join a pool first')

    setSaving(true)

    const res = await fetch('/api/picks', {
      method: editTeamId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_id: editTeamId,
        org_id: orgId,
        tournament_id: tournament.id,
        team_name: teamName,
        in_grand_pool: inGrandPool,
        picks: slots.filter(Boolean).map(p => ({
          golfer_espn_id: p.golfer_espn_id,
          golfer_name: p.golfer_name,
          salary: p.salary,
        }))
      }),
    })

    if (res.ok) {
      setSaved(true)
      if (!editTeamId) {
        setTeamName('')
        setSlots(Array(8).fill(null))
        setInGrandPool(false)
      }
    }

    setSaving(false)
  }

  const filtered = salaries.filter(g => {
    if (pickedIds.has(g.golfer_espn_id)) return false
    if (!g.golfer_name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const capBar = (
    <div className={styles.capBar}>
      <div className={styles.capInfo}>
        <span>Salary Cap</span>
        <strong className={remaining < 0 ? styles.over : ''}>
          ${remaining.toLocaleString()} remaining
        </strong>
      </div>
      <div className={styles.capTrack}>
        <div
          className={styles.capFill}
          style={{
            width: `${Math.min((totalSalary / salaryCap) * 100, 100)}%`,
            background: remaining < 0 ? '#8b1a1a' : '#1a4731'
          }}
        />
      </div>
      <div className={styles.capCount}>{picks.length} / {maxPicks} players</div>
      {picks.length < maxPicks && (
        <div className={styles.capAvg}>
          ${Math.floor(remaining / (maxPicks - picks.length)).toLocaleString()} avg per remaining pick
        </div>
      )}
    </div>
  )

  const slotPanel = (
    <div className={styles.right}>
      {capBar}

      <div className={styles.field}>
        <label>Team Name</label>
        <input
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          placeholder="e.g. Fairway to Heaven"
          className={styles.input}
          disabled={picksLocked}
        />
      </div>

      {orgs.length > 1 && (
        <div className={styles.field}>
          <label>Pool</label>
          <select
            value={selectedOrg}
            onChange={e => setSelectedOrg(e.target.value)}
            className={styles.input}
            disabled={picksLocked || !!editTeamId}
          >
            {orgs.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      )}

      {!isGrandPoolOnly && (
        <div className={styles.grandPool}>
          <input
            type="checkbox"
            id="grandpool"
            checked={inGrandPool}
            onChange={e => setInGrandPool(e.target.checked)}
            disabled={picksLocked}
          />
          <label htmlFor="grandpool">Enter SMAC Pool</label>
        </div>
      )}

      <div className={styles.slotList}>
        {slots.map((slot, i) => (
          <div
            key={i}
            className={`${styles.slot} ${slot ? styles.slotFilled : styles.slotEmpty} ${activeSlot === i ? styles.slotActive : ''}`}
          >
            {slot ? (
              <>
                <img
                  src={`https://a.espncdn.com/i/headshots/golf/players/full/${slot.golfer_espn_id}.png`}
                  className={styles.slotHeadshot}
                  alt={slot.golfer_name}
                />
                <span className={styles.slotName}>{slot.golfer_name}</span>
                <span className={styles.slotSalary}>${slot.salary.toLocaleString()}</span>
                {!picksLocked && (
                  <button className={styles.slotEdit} onClick={() => handleSlotClick(i)} title="Change player"><Pencil size={14} /></button>
                )}
                {!picksLocked && (
                  <button className={styles.slotRemove} onClick={() => handleRemove(i)} title="Remove"><X size={14} /></button>
                )}
              </>
            ) : (
              <button
                className={styles.slotAdd}
                onClick={() => handleSlotClick(i)}
                disabled={picksLocked}
              >
                <span className={styles.slotNum}>{i + 1}</span>
                <span className={styles.slotAddText}>+ Add Player</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {picksLocked ? (
        <div className={styles.locked}><Lock size={14} /> Picks are locked</div>
      ) : (
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={saving || picks.length !== maxPicks || !teamName}
        >
          {saving ? 'Saving...' : saved ? <><CheckCircle size={14} /> Saved!</> : editTeamId ? 'Update Team' : 'Submit Team'}
        </button>
      )}

      {orgs.length === 0 && (
        <p className={styles.noOrg}>You haven't joined a pool yet. Ask for an invite link!</p>
      )}
    </div>
  )

  const playerPanel = (
    <div className={styles.left}>
      <div className={styles.leftHeader}>
        <div className={styles.leftTitleRow}>
          <h2 className={styles.leftTitle}>
            {activeSlot !== null ? `Picking for slot ${activeSlot + 1}` : 'Available Players'}
          </h2>
          {activeSlot !== null && (
            <button className={styles.cancelBtn} onClick={cancelPick}><X size={14} /> Cancel</button>
          )}
        </div>
        <input
          className={styles.search}
          placeholder="Search player..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.golferList}>
        <div className={styles.golferHeader}>
          <span>Player</span>
          <span>Salary</span>
        </div>
        {filtered.map(g => {
          const slotSalary = activeSlot !== null && slots[activeSlot] ? slots[activeSlot].salary : 0
          const effectiveCost = (totalSalary - slotSalary + g.salary) > salaryCap

          return (
            <div
              key={g.golfer_espn_id}
              className={`${styles.golferRow} ${effectiveCost ? styles.disabled : ''}`}
              onClick={() => {
                if (effectiveCost) return
                if (activeSlot !== null) {
                  handlePickPlayer(g)
                } else {
                  handleDesktopPick(g)
                }
              }}
            >
              <div className={styles.golferInfo}>
                <img
                  src={`https://a.espncdn.com/i/headshots/golf/players/full/${g.golfer_espn_id}.png`}
                  alt={g.golfer_name}
                  className={styles.headshot}
                />
                <span className={styles.golferName}>{g.golfer_name}</span>
              </div>
              <div className={styles.golferRight}>
                <span className={styles.salary}>${g.salary.toLocaleString()}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      {/* Desktop: side by side */}
      <div className={styles.desktopLayout}>
        {playerPanel}
        {slotPanel}
      </div>

      {/* Mobile: single panel */}
      <div className={styles.mobileLayout}>
        {mobileView === 'players' ? playerPanel : slotPanel}
      </div>
    </div>
  )
}