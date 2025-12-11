/**
 * GET /api/gamification/user/profile
 * Get user's gamification profile
 *
 * Returns: { points_balance, points_lifetime, badges, rank }
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getUserGameStats } from '@/lib/gamification/service';

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const userId = user.id;

    // Get user game stats
    const stats = await getUserGameStats(userId);

    return NextResponse.json(
      {
        points_balance: stats.pointsBalance,
        points_lifetime: stats.pointsLifetime,
        badges: stats.earnedBadges,
        rank: stats.currentRank,
        last_update: stats.lastPointsUpdate,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
});
