/**
 * Authentication Type Definitions
 * Core types and interfaces for JWT authentication system
 */

/**
 * User object returned from database
 */
export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

/**
 * JWT Token Payload
 */
export interface JWTPayload {
  sub: string; // user.id
  email: string;
  username: string;
  iat: number; // issued at
  exp: number; // expiration
  aud: string; // audience
  iss: string; // issuer
  type?: 'access' | 'refresh';
}

/**
 * Refresh Token Payload
 */
export interface RefreshTokenPayload extends JWTPayload {
  type: 'refresh';
  tokenId: string; // references refresh_tokens.id
}

/**
 * Login/Register Credentials
 */
export interface Credentials {
  email: string;
  password: string;
}

/**
 * Register Request
 */
export interface RegisterRequest extends Credentials {
  username: string;
  fullName?: string;
}

/**
 * Authentication Response
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

/**
 * Token Pair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Authentication Context
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

/**
 * Decoded Token (after verification)
 */
export interface DecodedToken {
  sub: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  type?: 'access' | 'refresh';
  tokenId?: string; // For refresh tokens
}

/**
 * API Error Response
 */
export interface ApiError {
  error: string;
  message?: string;
  statusCode: number;
}

/**
 * Password validation result
 */
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * User Preferences
 */
export interface UserPreferences {
  id: string;
  user_id: string;
  background_inverted: boolean;
  theme_mode: 'light' | 'dark';
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}
