/**
 * Cookie Management for Authentication
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Cookie configuration
 */
const cookieConfig = {
  maxAge: 900, // 15 minutes for access token
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const refreshCookieConfig = {
  maxAge: 604800, // 7 days for refresh token
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * Set authentication cookies in response
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): NextResponse {
  response.cookies.set('accessToken', accessToken, cookieConfig);
  response.cookies.set('refreshToken', refreshToken, refreshCookieConfig);

  return response;
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');

  return response;
}

/**
 * Get access token from cookies
 */
export function getAccessTokenFromCookies(request: NextRequest): string | null {
  const token = request.cookies.get('accessToken')?.value;
  return token || null;
}

/**
 * Get refresh token from cookies
 */
export function getRefreshTokenFromCookies(request: NextRequest): string | null {
  const token = request.cookies.get('refreshToken')?.value;
  return token || null;
}

/**
 * Set individual cookie (for manual control)
 */
export function setAuthCookie(
  response: NextResponse,
  name: 'accessToken' | 'refreshToken',
  value: string
): NextResponse {
  const config = name === 'accessToken' ? cookieConfig : refreshCookieConfig;
  response.cookies.set(name, value, config);
  return response;
}

/**
 * Delete individual cookie
 */
export function deleteAuthCookie(response: NextResponse, name: 'accessToken' | 'refreshToken'): NextResponse {
  response.cookies.delete(name);
  return response;
}
