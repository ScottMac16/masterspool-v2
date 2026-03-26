'use client'

import { useState } from 'react'
import { ClipboardList, MapPin, Trophy } from 'lucide-react'
import styles from './entries.module.css'

export default function EntriesClient({ tournament, orgs, teamsByOrg, allTeams, isSuperAdmin }) {
  const [activeOrg, setActiveOrg] = useState(() =>
    isSuperAdmin ? 'all' : orgs[0]?.id || 'all'
  )
  const [paidMap, setPaidMap] = useState(() => {
    const map = {}
    allTeams.forEach(t => { map[t.id] = { paid: t.paid, paid_grand_pool: t.paid_grand_pool } })
    return map
  })

  async function togglePaid(teamId, field, value) {
    setPaidMap(prev => ({ ...prev, [teamId]: { ...prev[teamId], [field]: value } }))
    await fetch('/api/admin/entries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: teamId, [field]: value }),
    })
  }

  const grandPoolTeams = allTeams.filter(t => t.in_grand_pool)
  const activeTeams = activeOrg === 'grandpool'
    ? grandPoolTeams
    : activeOrg === 'all'
    ? allTeams
    : teamsByOrg[activeOrg] || []

  const totalPaid = Object.values(paidMap).filter(m => m.paid).length
  const totalGrandPaid = Object.values(paidMap).filter(m => m.paid_grand_pool).length

  return (
    <div className={styles.container}>
      <a href="/admin" className={styles.back}>← Back to Admin</a>
      <div className={styles.titleRow}>
        <h1 className={styles.title}><ClipboardList size={24} /> Entries</h1>
        <div className={styles.stats}>
          <span className={styles.stat}>{allTeams.length} total teams</span>
          <span className={styles.statPaid}>{totalPaid} org paid</span>
          <span className={styles.statGrand}>{grandPoolTeams.length} SMAC Pool · {totalGrandPaid} paid</span>
        </div>
      </div>

      {tournament && (
        <p className={styles.tournament}><MapPin size={14} /> {tournament.name} {tournament.year}</p>
      )}

      <div className={styles.tabs}>
        {isSuperAdmin && (
          <>
            {/* <button
              className={`${styles.tab} ${activeOrg === 'all' ? styles.activeTab : ''}`}
              onClick={() => setActiveOrg('all')}
            >
              All <span className={styles.tabCount}>{allTeams.length}</span>
            </button> */}
            <button
              className={`${styles.tab} ${styles.grandTab} ${activeOrg === 'grandpool' ? styles.activeTab : ''}`}
              onClick={() => setActiveOrg('grandpool')}
            >
              <Trophy size={14} /> SMAC Pool <span className={styles.tabCount}>{grandPoolTeams.length}</span>
            </button>
          </>
        )}
        {orgs
          .filter(org => org.id !== '00000000-0000-0000-0000-000000000001')
          .map(org => (
            <button
              key={org.id}
              className={`${styles.tab} ${activeOrg === org.id ? styles.activeTab : ''}`}
              onClick={() => setActiveOrg(org.id)}
            >
              {org.name}
              <span className={styles.tabCount}>{teamsByOrg[org.id]?.length || 0}</span>
            </button>
          ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Team Name</th>
              <th>Name</th>
              <th>Email</th>
              <th>Org</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            {activeTeams.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>No entries yet</td>
              </tr>
            )}
            {activeTeams.map((team, i) => (
              <tr key={team.id}>
                <td className={styles.num}>{i + 1}</td>
                <td className={styles.teamName}>{team.team_name}</td>
                <td>{team.users?.first_name} {team.users?.last_name}</td>
                <td className={styles.email}>{team.users?.email}</td>
                <td className={styles.orgName}>{team.org_name}</td>
                <td className={styles.center}>
                  {activeOrg === 'grandpool' ? (
                    team.in_grand_pool ? (
                      <input
                        type="checkbox"
                        checked={paidMap[team.id]?.paid_grand_pool || false}
                        onChange={e => togglePaid(team.id, 'paid_grand_pool', e.target.checked)}
                        className={styles.checkbox}
                      />
                    ) : <span style={{ color: '#aaa', fontSize: '0.7rem' }}>N/A</span>
                  ) : (
                    <input
                      type="checkbox"
                      checked={paidMap[team.id]?.paid || false}
                      onChange={e => togglePaid(team.id, 'paid', e.target.checked)}
                      className={styles.checkbox}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}