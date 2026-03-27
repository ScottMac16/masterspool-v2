import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import DeleteTeamButton from './DeleteTeamButton'
import { MapPin, Trophy, CheckCircle, Clock, DollarSign } from 'lucide-react'
import styles from './my-teams.module.css'

export default async function MyTeamsPage() {
  const { userId } = await auth()

  const { data: tournament } = await supabaseAdmin
    .from('tournaments')
    .select('*')
    .eq('active', true)
    .limit(1)
    .single()

  if (tournament?.picks_locked) {
    redirect('/leaderboard')
  }
    
  // Get all pools for this tournament
  const { data: pools } = await supabaseAdmin
    .from('pools')
    .select('id, orgs(name)')
    .eq('tournament_id', tournament?.id)

  const poolIds = pools?.map(p => p.id) || []

  // Get user's teams
  const { data: teams } = await supabaseAdmin
    .from('teams')
    .select('*')
    .eq('user_id', userId)
    .in('pool_id', poolIds.length > 0 ? poolIds : ['none'])
    .order('created_at', { ascending: false })

  // Build pool lookup
  const poolMap = {}
  pools?.forEach(p => { poolMap[p.id] = p.orgs?.name })

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Teams</h1>
      {tournament && (
        <p className={styles.tournament}><MapPin size={14} /> {tournament.name} {tournament.year}</p>
      )}

      {teams?.length === 0 && (
        <div className={styles.empty}>
          <p>You haven't submitted any teams yet.</p>
          <a href="/my-picks" className={styles.btn}>Make Picks →</a>
        </div>
      )}

      <div className={styles.teamGrid}>
        {teams?.map(team => (
          <div key={team.id} className={styles.teamCard}>
           <div className={styles.teamHeader}>
            <div>
              <h2 className={styles.teamName}>{team.team_name}</h2>
              <span className={styles.poolName}>{poolMap[team.pool_id]}</span>
            </div>
            <div className={styles.badges}>
              {team.in_grand_pool && (
                <span className={styles.grandPoolBadge}><Trophy size={14} /> SMAC Pool</span>
              )}
              {team.paid ? (
                  <span className={styles.paidBadge}><CheckCircle size={14} /> Paid</span>
                ) : (
                  <span className={styles.notPaidBadge}><Clock size={14} /> Not Paid</span>
                )}
              <span className={styles.salary}>
                <DollarSign size={14} />{team.total_salary?.toLocaleString()}
              </span>
            </div>
          </div>

            <div className={styles.golferGrid}>
              {[1,2,3,4,5,6,7,8].map(i => {
                const g = team[`golfer_${i}`]
                if (!g) return null
                return (
                  <div key={i} className={styles.golferRow}>
                    <span className={styles.golferNum}>{i}</span>
                    <img
                      src={`https://a.espncdn.com/i/headshots/golf/players/full/${g.id}.png`}
                      alt={g.name}
                      className={styles.headshot}
                    />
                    <span className={styles.golferName}>{g.name}</span>
                    <span className={styles.golferSalary}>${g.salary?.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>

            {!tournament?.picks_locked && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <a href={`/my-picks?edit=${team.id}`} className={styles.editBtn}>
                  Edit Team
                </a>
                <DeleteTeamButton teamId={team.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}