/**
 * GET /api/colors/preferences
 * Retrieve user's color preferences (from in-memory storage, session-only)
 *
 * Success Response: 200
 * UserColorPreferences
 *
 * PUT /api/colors/preferences
 * Update user's color preferences (stored in memory, session-only, no database access)
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
 *
 * Error Responses:
 * - 400: Invalid field types or no fields provided
 * - 500: Failed to update storage
 */

import { NextRequest, NextResponse } from 'next/server';

// For demo purposes: use a generic user ID
// In production, this would be retrieved from session/auth
const USER_ID = 'demo-user';

/**
 * In-memory storage for user color preferences (session-only, cleared on server restart)
 * Key: userId, Value: UserColorPreferences object
 */
const colorPreferencesStore = new Map<string, any>();

/**
 * User color preferences interface
 */
interface UserColorPreferences {
  user_id: string;
  preferred_palette_id?: number;
  theme_settings: Record<string, unknown>;
  background_inverted: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Initialize default preferences for a user
 */
function getDefaultPreferences(userId: string): UserColorPreferences {
  return {
    user_id: userId,
    preferred_palette_id: 1,
    theme_settings: {},
    background_inverted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    // Retrieve preferences from in-memory store
    let preferences = colorPreferencesStore.get(USER_ID);

    if (!preferences) {
      // Return default preferences if not yet set
      preferences = getDefaultPreferences(USER_ID);
      colorPreferencesStore.set(USER_ID, preferences);
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

    // Validate input - check field types
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

    // Build updates object
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

    // Ensure at least one field was provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    try {
      // Get current preferences or initialize
      let preferences = colorPreferencesStore.get(USER_ID);
      if (!preferences) {
        preferences = getDefaultPreferences(USER_ID);
      }

      // Apply updates
      const updatedPreferences: UserColorPreferences = {
        ...preferences,
        ...updates,
        user_id: USER_ID,
        updated_at: new Date().toISOString(),
      };

      // Store in memory
      colorPreferencesStore.set(USER_ID, updatedPreferences);

      return NextResponse.json(updatedPreferences, { status: 200 });
    } catch (storageError) {
      console.error('Failed to update storage:', storageError);
      return NextResponse.json(
        { error: 'Failed to update user preferences' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to update user color preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update user color preferences' },
      { status: 500 }
    );
  }
}
