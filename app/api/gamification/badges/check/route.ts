/**
 * POST /api/gamification/badges/check
 * Check and award badges for a user based on current stats
 *
 * Payload: { user_id?: string } (optional, uses authenticated user by default)
 * Returns: { earned_badges: string[], new_badges: string[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { checkAndAwardBadges } from '@/lib/gamification/service';

interface CheckBadgesPayload {
  user_id?: string;
}

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    // Use authenticated user's ID
    const userId = user.id;

    // Check and award badges
    const result = await checkAndAwardBadges(userId);

    if (result.error) {
      return NextResponse.json(
        {
          error: result.error,
          earned_badges: [],
          new_badges: [],
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        earned_badges: result.earnedBadges,
        new_badges: result.newBadges,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking badges:', error);
    return NextResponse.json(
      {
        error: 'Failed to check badges',
        earned_badges: [],
        new_badges: [],
      },
      { status: 500 }
    );
  }
});
