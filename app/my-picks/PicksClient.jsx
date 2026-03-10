'use client'

import { useState } from 'react'
import styles from './picks.module.css'

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
 

  const initialPicks = editTeam
    ? [1,2,3,4,5,6,7,8]
        .map(i => editTeam[`golfer_${i}`])
        .filter(Boolean)
        .map(g => ({
          golfer_espn_id: g.id,
          golfer_name: g.name,
          salary: g.salary,
        }))
    : []

  const [picks, setPicks] = useState(initialPicks)

  const maxPicks = tournament.max_picks
  const salaryCap = tournament.salary_cap
  const totalSalary = picks.reduce((sum, p) => sum + p.salary, 0)
  const remaining = salaryCap - totalSalary
  const picksLocked = tournament.picks_locked
  const isGrandPoolOnly = orgs.length === 1 && orgs[0]?.id === '00000000-0000-0000-0000-000000000001'

  function togglePick(golfer) {
    const already = picks.find(p => p.golfer_espn_id === golfer.golfer_espn_id)
    if (already) {
      setPicks(picks.filter(p => p.golfer_espn_id !== golfer.golfer_espn_id))
      return
    }
    if (picks.length >= maxPicks) return
    if (totalSalary + golfer.salary > salaryCap) return
    setPicks(prev => [...prev, golfer].sort((a, b) => b.salary - a.salary))
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
        picks: picks.map(p => ({
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
        setPicks([])
        setInGrandPool(false)
      }
    }

    setSaving(false)
  }

  const filtered = salaries.filter(g =>
    g.golfer_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.page}>

      {/* LEFT — Golfer List */}
      <div className={styles.left}>
        <div className={styles.leftHeader}>
          <h2 className={styles.leftTitle}>
            {editTeamId ? `Editing: ${editTeam.team_name}` : 'Available Players'}
          </h2>
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
            const isPicked = picks.find(p => p.golfer_espn_id === g.golfer_espn_id)
            const cantAfford = !isPicked && totalSalary + g.salary > salaryCap
            const full = !isPicked && picks.length >= maxPicks

            return (
              <div
                key={g.golfer_espn_id}
                className={`${styles.golferRow} 
                  ${isPicked ? styles.picked : ''} 
                  ${cantAfford || full ? styles.disabled : ''}`}
                onClick={() => !cantAfford && !full ? togglePick(g) : null}
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
                  {isPicked && <span className={styles.checkmark}>✓</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT — Team Builder */}
      <div className={styles.right}>
        <div className={styles.capBar}>
          <div className={styles.capInfo}>
            <span>Salary Cap</span>
            <strong className={remaining < 0 ? styles.over : ''}>${remaining.toLocaleString()} remaining</strong>
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
        </div>

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
              <label htmlFor="grandpool">Enter Grand Pool</label>
            </div>
          )}

        <div className={styles.selectedList}>
          <h3>Your Picks</h3>
          {picks.length === 0 && (
            <p className={styles.empty}>Select {maxPicks} players from the left</p>
          )}
          {picks.map((p, i) => (
            <div key={p.golfer_espn_id} className={styles.selectedRow}>
              <span className={styles.pickNum}>{i + 1}</span>
              <img
                src={`https://a.espncdn.com/i/headshots/golf/players/full/${p.golfer_espn_id}.png`}
                className={styles.smallHeadshot}
              />
              <span className={styles.pickName}>{p.golfer_name}</span>
              <span className={styles.pickSalary}>${p.salary.toLocaleString()}</span>
              <button
                className={styles.removeBtn}
                onClick={() => togglePick(p)}
                disabled={picksLocked}
              >✕</button>
            </div>
          ))}
        </div>

        {picksLocked ? (
          <div className={styles.locked}>🔒 Picks are locked</div>
        ) : (
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={saving || picks.length !== maxPicks || !teamName}
          >
            {saving ? 'Saving...' : saved ? '✅ Saved!' : editTeamId ? 'Update Team' : 'Submit Team'}
          </button>
        )}

        {orgs.length === 0 && (
          <p className={styles.noOrg}>You haven't joined a pool yet. Ask for an invite link!</p>
        )}
      </div>
    </div>
  )
}