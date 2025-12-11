/**
 * POST /api/auth/logout
 * User logout endpoint - revokes refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken } from '@/lib/auth/jwt';
import { revokeRefreshToken } from '@/lib/auth/supabase';
import { clearAuthCookies } from '@/lib/auth/cookies';
import { getRefreshTokenFromCookies } from '@/lib/auth/cookies';

/**
 * POST /api/auth/logout
 * Revoke refresh token and clear cookies
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from body or cookies
    let refreshToken: string | null = null;

    try {
      const body = await request.json();
      refreshToken = body.refreshToken;
    } catch {
      // Body might be empty
    }

    if (!refreshToken) {
      refreshToken = getRefreshTokenFromCookies(request);
    }

    // Attempt to revoke the refresh token if we have it
    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);

      if (decoded && decoded.tokenId) {
        try {
          await revokeRefreshToken(decoded.tokenId);
        } catch (error) {
          console.error('Error revoking refresh token:', error);
          // Continue with logout even if revocation fails
        }
      }
    }

    // Clear cookies and return success
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    return clearAuthCookies(response);
  } catch (error) {
    console.error('Logout error:', error);

    // Even if there's an error, clear cookies
    const response = NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );

    return clearAuthCookies(response);
  }
}
