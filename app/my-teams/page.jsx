import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import styles from './my-teams.module.css'

export default async function MyTeamsPage() {
  const { userId } = await auth()

  // Get latest tournament
  const { data: tournament } = await supabaseAdmin
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

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
        <p className={styles.tournament}>📍 {tournament.name} {tournament.year}</p>
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
                <span className={styles.poolName}>
                {team.in_grand_pool && (
                  <span>SM Masters Pool, </span>
                )}
                  {poolMap[team.pool_id]}</span>
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
              <a href={`/my-picks?edit=${team.id}`} className={styles.editBtn}>
                Edit Team
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}