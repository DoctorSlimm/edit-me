/**
 * Authentication Middleware
 * Utilities for protecting routes and extracting user context
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyAccessToken } from './jwt';
import type { DecodedToken, User } from './types';
import { getUserById } from './supabase';

/**
 * Extract token from request (Bearer token or cookie)
 */
export function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  const bearerToken = extractTokenFromHeader(authHeader);

  if (bearerToken) {
    return bearerToken;
  }

  // Try cookie fallback
  const cookieToken = request.cookies.get('accessToken')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Authenticate a request and return user context
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: User; token: DecodedToken } | null> {
  try {
    const token = extractToken(request);

    if (!token) {
      return null;
    }

    // Verify the token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return null;
    }

    // Fetch full user data
    const user = await getUserById(decoded.sub);

    if (!user || !user.is_active) {
      return null;
    }

    return { user, token: decoded };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Higher-order function to protect API routes
 * Returns 401 if not authenticated
 */
export function withAuth(
  handler: (request: NextRequest, auth: { user: User; token: DecodedToken }) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const auth = await authenticateRequest(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(request, auth);
  };
}

/**
 * Optional authentication wrapper
 * Doesn't fail if not authenticated, just passes null
 */
export function withOptionalAuth(
  handler: (request: NextRequest, auth: { user: User; token: DecodedToken } | null) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const auth = await authenticateRequest(request);
    return handler(request, auth);
  };
}

/**
 * Extract user from request without full authentication check
 * Useful for logging and audit trails
 */
export async function extractUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    const token = extractToken(request);

    if (!token) {
      return null;
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return null;
    }

    const user = await getUserById(decoded.sub);

    if (!user || !user.is_active) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error extracting user:', error);
    return null;
  }
}

/**
 * Get client IP address from request
 * Handles X-Forwarded-For headers for proxied requests
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');

  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first
    return forwarded.split(',')[0].trim();
  }

  // Try CF-Connecting-IP header (Cloudflare)
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to unknown
  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}
