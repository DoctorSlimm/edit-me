/**
 * GET /api/colors/preferences
 * Retrieve user's color preferences
 *
 * Success Response: 200
 * UserColorPreferences
 *
 * PUT /api/colors/preferences
 * Update user's color preferences
 *
 * Request Body:
 * {
 *   preferred_palette_id?: number,
 *   theme_settings?: Record<string, unknown>,
 *   background_inverted?: boolean
 * }
 *
 * Success Response: 200
 * UserColorPreferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserColorPreferences, updateUserColorPreferences } from '@/lib/db';

// For demo purposes: use a generic user ID
// In production, this would be retrieved from session/auth
const USER_ID = 'demo-user';

export async function GET(request: NextRequest) {
  try {
    const preferences = await getUserColorPreferences(USER_ID);

    if (!preferences) {
      return NextResponse.json(
        { error: 'Failed to retrieve user preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json(preferences, { status: 200 });
  } catch (error) {
    console.error('Failed to retrieve user color preferences:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user color preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { preferred_palette_id, theme_settings, background_inverted } = body;

    // Validate input
    if (preferred_palette_id !== undefined && typeof preferred_palette_id !== 'number') {
      return NextResponse.json(
        { error: 'preferred_palette_id must be a number' },
        { status: 400 }
      );
    }

    if (theme_settings !== undefined && typeof theme_settings !== 'object') {
      return NextResponse.json(
        { error: 'theme_settings must be an object' },
        { status: 400 }
      );
    }

    if (background_inverted !== undefined && typeof background_inverted !== 'boolean') {
      return NextResponse.json(
        { error: 'background_inverted must be a boolean' },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (preferred_palette_id !== undefined) {
      updates.preferred_palette_id = preferred_palette_id;
    }

    if (theme_settings !== undefined) {
      updates.theme_settings = theme_settings;
    }

    if (background_inverted !== undefined) {
      updates.background_inverted = background_inverted;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    const preferences = await updateUserColorPreferences(USER_ID, updates);

    if (!preferences) {
      return NextResponse.json(
        { error: 'Failed to update user preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json(preferences, { status: 200 });
  } catch (error) {
    console.error('Failed to update user color preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update user color preferences' },
      { status: 500 }
    );
  }
}
