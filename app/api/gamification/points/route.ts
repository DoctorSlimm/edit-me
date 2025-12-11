/**
 * POST /api/gamification/points
 * Award points to a user for an action
 *
 * Payload: { user_id: string, points_amount: number, action_type: string }
 * Returns: { success: boolean, new_balance: number, total_earned: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { awardPoints } from '@/lib/gamification/service';
import { ACTION_POINTS, type ActionType } from '@/lib/gamification/types';

interface AwardPointsPayload {
  user_id?: string;
  action_type: ActionType | string;
  deduplication_key?: string;
}

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body: AwardPointsPayload = await request.json();

    // Validate action type
    if (!body.action_type) {
      return NextResponse.json(
        { error: 'action_type is required' },
        { status: 400 }
      );
    }

    // Validate action type is known
    const knownActions = Object.keys(ACTION_POINTS);
    if (!knownActions.includes(body.action_type)) {
      return NextResponse.json(
        {
          error: `Invalid action_type. Valid actions: ${knownActions.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Use authenticated user's ID (can't award points to other users)
    const userId = user.id;

    // Award points
    const { newBalance, totalEarned } = await awardPoints(
      userId,
      body.action_type,
      body.deduplication_key
    );

    return NextResponse.json(
      {
        success: true,
        new_balance: newBalance,
        total_earned: totalEarned,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to award points'
      },
      { status: 500 }
    );
  }
});
