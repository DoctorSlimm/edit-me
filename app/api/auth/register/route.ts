/**
 * POST /api/auth/register
 * User registration endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, validateEmail, validatePasswordStrength, validateUsername, generateRandomString } from '@/lib/auth/crypto';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { createUser, createUserPreferences, storeRefreshToken } from '@/lib/auth/supabase';
import { setAuthCookies } from '@/lib/auth/cookies';
import { getClientIp, getUserAgent } from '@/lib/auth/middleware';
import type { RegisterRequest } from '@/lib/auth/types';

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();

    // Validate input
    const { email, password, username, fullName } = body;

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, username' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate username format
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid username', details: usernameValidation.errors },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Weak password', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in database
    const user = await createUser(email, username, passwordHash, fullName);

    // Create user preferences
    await createUserPreferences(user.id);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const tokenId = generateRandomString(32);
    const refreshToken = generateRefreshToken(user, tokenId);

    // Store refresh token hash
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    await storeRefreshToken(
      user.id,
      tokenId, // Using token ID as the hash for simplicity
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
        },
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes
      },
      { status: 201 }
    );

    // Set cookies
    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle specific error messages
    if (error.message === 'Email already exists') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    if (error.message === 'Username already exists') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
