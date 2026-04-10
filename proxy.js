import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/join',
  '/api/tournament-status',
  '/api/golf',
  '/api/golf/(.*)',
  '/join(.*)',
])

async function getPicksLocked() {
  try {
    const { data } = await supabaseAdmin
      .from('tournaments')
      .select('picks_locked')
      .eq('active', true)
      .limit(1)
      .single()
    return data?.picks_locked ?? false
  } catch {
    return false
  }
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl

  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  const picksLocked = await getPicksLocked()

  // During picking phase — block leaderboard and pool-leaderboard API
  if (!picksLocked) {
    if (pathname.startsWith('/leaderboard')) {
      return NextResponse.redirect(new URL('/my-teams', request.url))
    }
    if (pathname.startsWith('/api/pool-leaderboard')) {
      return NextResponse.json({ error: 'Picks not locked yet' }, { status: 403 })
    }
  }

  // During tournament — block picks and teams
  if (picksLocked) {
    if (pathname.startsWith('/my-picks')) {
      return NextResponse.redirect(new URL('/leaderboard', request.url))
    }
    if (pathname.startsWith('/my-teams')) {
      return NextResponse.redirect(new URL('/leaderboard', request.url))
    }
    if (pathname.startsWith('/api/picks')) {
      return NextResponse.json({ error: 'Picks are locked' }, { status: 403 })
    }
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}