'use client'

import { useState } from 'react'
import styles from './picks.module.css'

export default function PicksClient({ tournament, orgs, salaries, existingTeams, userId }) {
  const [selectedOrg, setSelectedOrg] = useState(orgs[0]?.id || null)
  const [teamName, setTeamName] = useState('')
  const [picks, setPicks] = useState([])
  const [inGrandPool, setInGrandPool] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')

  const maxPicks = tournament.max_picks
  const salaryCap = tournament.salary_cap
  const totalSalary = picks.reduce((sum, p) => sum + p.salary, 0)
  const remaining = salaryCap - totalSalary
  const picksLocked = tournament.picks_locked

  function togglePick(golfer) {
    const already = picks.find(p => p.golfer_espn_id === golfer.golfer_espn_id)
    if (already) {
      setPicks(picks.filter(p => p.golfer_espn_id !== golfer.golfer_espn_id))
      return
    }
    if (picks.length >= maxPicks) return
    if (totalSalary + golfer.salary > salaryCap) return
    setPicks([...picks, golfer])
  }

  async function handleSubmit() {
    if (!teamName) return alert('Please enter a team name')
    if (picks.length !== maxPicks) return alert(`Please select exactly ${maxPicks} players`)
    if (!selectedOrg) return alert('Please select an org')

    setSaving(true)

    const res = await fetch('/api/picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: selectedOrg,
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
      setTeamName('')
      setPicks([])
      setInGrandPool(false)
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
          <h2 className={styles.leftTitle}>Available Players</h2>
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

      {/* Existing Teams */}
        {existingTeams.length > 0 && (
        <div className={styles.existingTeams}>
            <h3>Your Submitted Teams</h3>
            {existingTeams.map(team => (
            <div key={team.id} className={styles.teamCard}>
                <div className={styles.teamCardHeader}>
                <strong>{team.team_name}</strong>
                <div className={styles.teamMeta}>
                    <span>💰 ${team.total_salary?.toLocaleString()}</span>
                    {team.in_grand_pool && <span className={styles.grandPoolBadge}>🏆 Grand Pool</span>}
                </div>
                </div>
                <div className={styles.teamGolfers}>
                {[1,2,3,4,5,6,7,8].map(i => {
                    const g = team[`golfer_${i}`]
                    if (!g) return null
                    return (
                    <div key={i} className={styles.teamGolfer}>
                        <img
                        src={`https://a.espncdn.com/i/headshots/golf/players/full/${g.id}.png`}
                        className={styles.smallHeadshot}
                        />
                        <span>{g.name}</span>
                        <span className={styles.pickSalary}>${g.salary?.toLocaleString()}</span>
                    </div>
                    )
                })}
                </div>
            </div>
            ))}
        </div>
        )}

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
              style={{ width: `${Math.min((totalSalary / salaryCap) * 100, 100)}%`,
                background: remaining < 0 ? '#8b1a1a' : '#1a4731' }}
            />
          </div>
          <div className={styles.capCount}>{picks.length} / {maxPicks} players</div>
        </div>

        {/* Team Name */}
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

        {/* Org Selector */}
        {orgs.length > 0 && (
          <div className={styles.field}>
            <label>Pool</label>
            <select
              value={selectedOrg}
              onChange={e => setSelectedOrg(e.target.value)}
              className={styles.input}
              disabled={picksLocked}
            >
              {orgs.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Grand Pool */}
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

        {/* Selected Players */}
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
            {saving ? 'Saving...' : saved ? '✅ Team Saved!' : 'Submit Team'}
          </button>
        )}

        {orgs.length === 0 && (
          <p className={styles.noOrg}>You haven't joined a pool yet. Ask for an invite link!</p>
        )}
      </div>
    </div>
  )
}