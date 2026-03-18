export const mockLeaderboard = [
  { id: '3470', name: 'Rory McIlroy', position: '1', score: '-11', today: '-4', thru: '18', status: 'STATUS_ACTIVE', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/3470.png', flag: 'https://a.espncdn.com/i/teamlogos/countries/500/irl.png' },
  { id: '388', name: 'Scottie Scheffler', position: 'T2', score: '-8', today: '-3', thru: '18', status: 'STATUS_ACTIVE', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/388.png', flag: 'https://a.espncdn.com/i/teamlogos/countries/500/usa.png' },
  { id: '3448', name: 'Jon Rahm', position: 'T2', score: '-8', today: '-2', thru: '18', status: 'STATUS_ACTIVE', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/3448.png', flag: 'https://a.espncdn.com/i/teamlogos/countries/500/esp.png' },
  { id: '1225', name: 'Tiger Woods', position: 'T4', score: '-5', today: '-1', thru: '18', status: 'STATUS_ACTIVE', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/1225.png', flag: 'https://a.espncdn.com/i/teamlogos/countries/500/usa.png' },
  { id: '780', name: 'Phil Mickelson', position: 'T4', score: '-5', today: '+1', thru: '18', status: 'STATUS_ACTIVE', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/780.png', flag: 'https://a.espncdn.com/i/teamlogos/countries/500/usa.png' },
  { id: '5467', name: 'Collin Morikawa', position: 'CUT', score: '+3', today: '+3', thru: '—', status: 'STATUS_CUT', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/5467.png', flag: 'https://a.espncdn.com/i/teamlogos/countries/500/usa.png' },
]

export const mockPoolData = {
  scoredTeams: [
    {
      id: '1',
      team_name: 'Fairway to Heaven',
      totalScore: -18,
      todayScore: -5,
      cutCount: 0,
      in_grand_pool: true,
      org_id: '00000000-0000-0000-0000-000000000001',
      org_name: 'SMAC Pool',
      golfers: [
        { id: '3470', name: 'Rory McIlroy', score: -11, today: -4, thru: '18', position: '1', missedCut: false, pickPct: '45.0' },
        { id: '388', name: 'Scottie Scheffler', score: -8, today: -3, thru: '18', position: 'T2', missedCut: false, pickPct: '60.0' },
        { id: '3448', name: 'Jon Rahm', score: -8, today: -2, thru: '18', position: 'T2', missedCut: false, pickPct: '30.0' },
        { id: '1225', name: 'Tiger Woods', score: -5, today: -1, thru: '18', position: 'T4', missedCut: false, pickPct: '20.0' },
        { id: '780', name: 'Phil Mickelson', score: -5, today: 1, thru: '18', position: 'T4', missedCut: false, pickPct: '15.0' },
        { id: '5467', name: 'Collin Morikawa', score: 4, today: 3, thru: '—', position: 'CUT', missedCut: true, pickPct: '25.0' },
        { id: '2', name: 'Xander Schauffele', score: -3, today: -2, thru: '18', position: 'T6', missedCut: false, pickPct: '35.0' },
        { id: '3', name: 'Viktor Hovland', score: -2, today: -1, thru: '18', position: 'T8', missedCut: false, pickPct: '10.0' },
      ]
    },
    {
      id: '2',
      team_name: 'Eagle Scouts',
      totalScore: -12,
      todayScore: -3,
      cutCount: 1,
      in_grand_pool: true,
      org_id: '00000000-0000-0000-0000-000000000001',
      org_name: 'SMAC Pool',
      golfers: [
        { id: '388', name: 'Scottie Scheffler', score: -8, today: -3, thru: '18', position: 'T2', missedCut: false, pickPct: '60.0' },
        { id: '3470', name: 'Rory McIlroy', score: -11, today: -4, thru: '18', position: '1', missedCut: false, pickPct: '45.0' },
        { id: '1225', name: 'Tiger Woods', score: -5, today: -1, thru: '18', position: 'T4', missedCut: false, pickPct: '20.0' },
        { id: '2', name: 'Xander Schauffele', score: -3, today: -2, thru: '18', position: 'T6', missedCut: false, pickPct: '35.0' },
        { id: '3', name: 'Viktor Hovland', score: -2, today: -1, thru: '18', position: 'T8', missedCut: false, pickPct: '10.0' },
        { id: '4', name: 'Justin Thomas', score: -1, today: 0, thru: '18', position: 'T10', missedCut: false, pickPct: '18.0' },
        { id: '5', name: 'Patrick Cantlay', score: 0, today: 1, thru: '18', position: 'T15', missedCut: false, pickPct: '12.0' },
        { id: '5467', name: 'Collin Morikawa', score: 4, today: 3, thru: '—', position: 'CUT', missedCut: true, pickPct: '25.0' },
      ]
    },
    {
      id: '3',
      team_name: 'Bogey Free',
      totalScore: -8,
      todayScore: -1,
      cutCount: 2,
      in_grand_pool: true,
      org_id: '00000000-0000-0000-0000-000000000001',
      org_name: 'SMAC Pool',
      golfers: [
        { id: '3470', name: 'Rory McIlroy', score: -11, today: -4, thru: '18', position: '1', missedCut: false, pickPct: '45.0' },
        { id: '3448', name: 'Jon Rahm', score: -8, today: -2, thru: '18', position: 'T2', missedCut: false, pickPct: '30.0' },
        { id: '780', name: 'Phil Mickelson', score: -5, today: 1, thru: '18', position: 'T4', missedCut: false, pickPct: '15.0' },
        { id: '4', name: 'Justin Thomas', score: -1, today: 0, thru: '18', position: 'T10', missedCut: false, pickPct: '18.0' },
        { id: '5', name: 'Patrick Cantlay', score: 0, today: 1, thru: '18', position: 'T15', missedCut: false, pickPct: '12.0' },
        { id: '6', name: 'Brooks Koepka', score: 1, today: 2, thru: '18', position: 'T20', missedCut: false, pickPct: '22.0' },
        { id: '5467', name: 'Collin Morikawa', score: 4, today: 3, thru: '—', position: 'CUT', missedCut: true, pickPct: '25.0' },
        { id: '7', name: 'Dustin Johnson', score: 4, today: 3, thru: '—', position: 'CUT', missedCut: true, pickPct: '8.0' },
      ]
    },
  ],
  orgs: [],
  tournament: { id: 'mock', name: 'Masters Tournament', year: 2026 },
  missedCutScore: 5,
}