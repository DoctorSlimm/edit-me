/**
 * JWT Token Generation and Validation
 */

import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import type { JWTPayload, DecodedToken, User, RefreshTokenPayload } from './types';

/**
 * Get JWT secret from environment
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET environment variable must be set and at least 32 characters long');
  }
  return secret;
}

/**
 * Get JWT algorithm from environment
 */
function getJWTAlgorithm(): string {
  return process.env.JWT_ALGORITHM || 'HS256';
}

/**
 * Get token expiry times from environment
 */
function getTokenExpiries() {
  return {
    accessToken: parseInt(process.env.AUTH_ACCESS_TOKEN_EXPIRY || '900', 10), // 15 minutes
    refreshToken: parseInt(process.env.AUTH_REFRESH_TOKEN_EXPIRY || '604800', 10), // 7 days
  };
}

/**
 * Generate an access token (short-lived)
 * @param user - User object
 * @returns string - JWT token
 */
export function generateAccessToken(user: User): string {
  const secret = getJWTSecret();
  const algorithm = getJWTAlgorithm() as 'HS256' | 'RS256';
  const expiresIn = getTokenExpiries().accessToken;

  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    username: user.username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresIn,
    aud: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    iss: 'auth-service',
    type: 'access',
  };

  const options: SignOptions = {
    algorithm,
    expiresIn,
  };

  try {
    const token = jwt.sign(payload, secret, options);
    return token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
}

/**
 * Generate a refresh token (long-lived)
 * @param user - User object
 * @param tokenId - Refresh token ID (for revocation tracking)
 * @returns string - JWT token
 */
export function generateRefreshToken(user: User, tokenId: string): string {
  const secret = getJWTSecret();
  const algorithm = getJWTAlgorithm() as 'HS256' | 'RS256';
  const expiresIn = getTokenExpiries().refreshToken;

  const payload: RefreshTokenPayload = {
    sub: user.id,
    email: user.email,
    username: user.username,
    type: 'refresh',
    tokenId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresIn,
    aud: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    iss: 'auth-service',
  };

  const options: SignOptions = {
    algorithm,
    expiresIn,
  };

  try {
    const token = jwt.sign(payload, secret, options);
    return token;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * Verify and decode a JWT token
 * @param token - The JWT token to verify
 * @returns DecodedToken | null - Decoded token or null if invalid
 */
export function verifyToken(token: string): DecodedToken | null {
  const secret = getJWTSecret();
  const algorithm = getJWTAlgorithm() as 'HS256' | 'RS256';

  const options: VerifyOptions = {
    algorithms: [algorithm],
    audience: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    issuer: 'auth-service',
  };

  try {
    const decoded = jwt.verify(token, secret, options) as DecodedToken;
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      console.warn('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.warn('Invalid token:', error.message);
    } else {
      console.warn('Token verification error:', error.message);
    }
    return null;
  }
}

/**
 * Verify only an access token
 * Checks that token type is 'access'
 * @param token - The JWT token to verify
 * @returns DecodedToken | null - Decoded token or null if invalid
 */
export function verifyAccessToken(token: string): DecodedToken | null {
  const decoded = verifyToken(token);

  if (!decoded) {
    return null;
  }

  // Verify this is an access token
  if (decoded.type && decoded.type !== 'access') {
    console.warn('Token is not an access token');
    return null;
  }

  return decoded;
}

/**
 * Verify only a refresh token
 * Checks that token type is 'refresh'
 * @param token - The JWT token to verify
 * @returns DecodedToken | null - Decoded token or null if invalid
 */
export function verifyRefreshToken(token: string): DecodedToken | null {
  const decoded = verifyToken(token);

  if (!decoded) {
    return null;
  }

  // Verify this is a refresh token
  if (decoded.type !== 'refresh') {
    console.warn('Token is not a refresh token');
    return null;
  }

  return decoded;
}

/**
 * Extract token from Authorization header
 * Expected format: "Bearer <token>"
 * @param authHeader - The Authorization header value
 * @returns string | null - The token or null if invalid format
 */
export function extractTokenFromHeader(authHeader: string | null | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Check if a token is expired
 * @param token - The JWT token
 * @returns boolean - True if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = jwt.decode(token) as any;

  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Get remaining time until token expiry
 * @param token - The JWT token
 * @returns number - Seconds remaining, or 0 if expired
 */
export function getTokenExpiryTime(token: string): number {
  const decoded = jwt.decode(token) as any;

  if (!decoded || !decoded.exp) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const remaining = decoded.exp - currentTime;

  return Math.max(0, remaining);
}

/**
 * Should token be refreshed?
 * Returns true if token will expire within 60 seconds
 * @param token - The JWT token
 * @returns boolean - True if token should be refreshed soon
 */
export function shouldRefreshToken(token: string): boolean {
  const timeRemaining = getTokenExpiryTime(token);
  return timeRemaining < 60; // 60 seconds buffer
}
