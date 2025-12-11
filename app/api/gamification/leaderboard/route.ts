/**
 * GET /api/gamification/leaderboard
 * Get public leaderboard
 *
 * Query params:
 * - period: 'weekly' | 'alltime' (default: 'alltime')
 * - limit: number (default: 100, max: 500)
 *
 * Returns: { period, rankings: [{ rank, user_id, username, points_balance }], last_updated }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, updateLeaderboardRankings } from '@/lib/gamification/service';

interface LeaderboardQuery {
  period?: 'weekly' | 'alltime';
  limit?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || 'alltime') as 'weekly' | 'alltime';
    const limitParam = parseInt(searchParams.get('limit') || '100', 10);
    const limit = Math.min(Math.max(1, limitParam), 500); // Clamp between 1 and 500

    // Validate period
    if (!['weekly', 'alltime'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be "weekly" or "alltime"' },
        { status: 400 }
      );
    }

    // Get leaderboard data (cached for 5 minutes)
    const rankings = await getLeaderboard(period, limit);

    return NextResponse.json(
      {
        period,
        rankings,
        last_updated: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification/leaderboard
 * Manually trigger leaderboard update (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const period = body.period || 'alltime';

    // Validate period
    if (!['weekly', 'alltime'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be "weekly" or "alltime"' },
        { status: 400 }
      );
    }

    // Update rankings
    await updateLeaderboardRankings(period);

    return NextResponse.json(
      { success: true, message: 'Leaderboard updated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to update leaderboard' },
      { status: 500 }
    );
  }
}
