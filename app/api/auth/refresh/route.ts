/**
 * POST /api/auth/refresh
 * Token refresh endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { getUserById, getRefreshToken, revokeRefreshToken, storeRefreshToken } from '@/lib/auth/supabase';
import { setAuthCookies } from '@/lib/auth/cookies';
import { getRefreshTokenFromCookies } from '@/lib/auth/cookies';
import { getClientIp, getUserAgent } from '@/lib/auth/middleware';
import { generateRandomString } from '@/lib/auth/crypto';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
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

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Missing refresh token' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Ensure tokenId exists for refresh tokens
    if (!decoded.tokenId) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Check if refresh token exists and is not revoked
    const storedToken = await getRefreshToken(decoded.tokenId);

    if (!storedToken) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    if (storedToken.revoked_at) {
      return NextResponse.json(
        { error: 'Refresh token has been revoked' },
        { status: 401 }
      );
    }

    // Check if refresh token is expired
    const expiresAt = new Date(storedToken.expires_at).getTime();
    if (expiresAt < Date.now()) {
      return NextResponse.json(
        { error: 'Refresh token has expired' },
        { status: 401 }
      );
    }

    // Get user
    const user = await getUserById(decoded.sub);

    if (!user || !user.is_active) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // Revoke old refresh token
    await revokeRefreshToken(decoded.tokenId);

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newTokenId = generateRandomString(32);
    const newRefreshToken = generateRefreshToken(user, newTokenId);

    // Store new refresh token
    const newTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await storeRefreshToken(
      user.id,
      newTokenId,
      newTokenExpiresAt,
      getUserAgent(request),
      getClientIp(request)
    );

    // Create response
    const response = NextResponse.json(
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900, // 15 minutes
      },
      { status: 200 }
    );

    // Set new cookies
    return setAuthCookies(response, newAccessToken, newRefreshToken);
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
