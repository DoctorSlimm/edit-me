/**
 * POST /api/auth/login
 * User login endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateRandomString } from '@/lib/auth/crypto';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { getUserByEmail, updateUserLastLogin, storeRefreshToken } from '@/lib/auth/supabase';
import { setAuthCookies } from '@/lib/auth/cookies';
import { getClientIp, getUserAgent } from '@/lib/auth/middleware';
import type { Credentials } from '@/lib/auth/types';

/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 */
export async function POST(request: NextRequest) {
  try {
    const body: Credentials = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await getUserByEmail(email);

    if (!user) {
      // Don't reveal whether email exists for security
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login time
    await updateUserLastLogin(user.id);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const tokenId = generateRandomString(32);
    const refreshToken = generateRefreshToken(user, tokenId);

    // Store refresh token
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    await storeRefreshToken(
      user.id,
      tokenId,
      tokenExpiresAt,
      getUserAgent(request),
      getClientIp(request)
    );

    // Create response
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.full_name,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          lastLoginAt: new Date().toISOString(),
        },
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes
      },
      { status: 200 }
    );

    // Set cookies
    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
