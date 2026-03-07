import { getLeaderboard } from '@/lib/golf-api'

export async function GET() {
  const leaderboard = await getLeaderboard()
  return Response.json(leaderboard)
}