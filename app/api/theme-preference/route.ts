import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes (in production, this would be a database)
const userPreferences = new Map<string, boolean>();

/**
 * GET /api/theme-preference
 * Retrieve user's theme preference
 */
export async function GET(request: NextRequest) {
  try {
    // For this demo, we'll use a generic user ID
    // In production, this would be retrieved from session/auth
    const userId = 'demo-user';

    const preference = userPreferences.get(userId) ?? false;

    return NextResponse.json({ backgroundInverted: preference });
  } catch (error) {
    console.error('Failed to retrieve theme preference:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve theme preference' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/theme-preference
 * Update user's theme preference
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { backgroundInverted } = body;

    if (typeof backgroundInverted !== 'boolean') {
      return NextResponse.json(
        { error: 'backgroundInverted must be a boolean' },
        { status: 400 }
      );
    }

    // For this demo, we'll use a generic user ID
    // In production, this would be retrieved from session/auth
    const userId = 'demo-user';

    // Store the preference
    userPreferences.set(userId, backgroundInverted);

    return NextResponse.json(
      { backgroundInverted },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update theme preference:', error);
    return NextResponse.json(
      { error: 'Failed to update theme preference' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/{userId}/preferences
 * Alternative endpoint for updating user preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { backgroundInversionEnabled } = body;

    if (typeof backgroundInversionEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'backgroundInversionEnabled must be a boolean' },
        { status: 400 }
      );
    }

    const userId = 'demo-user';
    userPreferences.set(userId, backgroundInversionEnabled);

    return NextResponse.json(
      { backgroundInversionEnabled },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
