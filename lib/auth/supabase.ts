/**
 * Supabase Database Client
 * Server-side client for database operations
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Create Supabase client with service role key
 * This should only be used on the server side
 */
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabase;
}

/**
 * Get the supabase client instance
 * Cached to avoid creating multiple instances
 */
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
}

/**
 * Query user by email
 */
export async function getUserByEmail(email: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows returned" - that's okay
    console.error('Error fetching user by email:', error);
    throw new Error('Failed to fetch user');
  }

  return data || null;
}

/**
 * Query user by username
 */
export async function getUserByUsername(username: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user by username:', error);
    throw new Error('Failed to fetch user');
  }

  return data || null;
}

/**
 * Query user by ID
 */
export async function getUserById(id: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user by ID:', error);
    throw new Error('Failed to fetch user');
  }

  return data || null;
}

/**
 * Create a new user
 */
export async function createUser(email: string, username: string, passwordHash: string, fullName?: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password_hash: passwordHash,
      full_name: fullName || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') {
      // Unique constraint violation
      if (error.message.includes('email')) {
        throw new Error('Email already exists');
      }
      if (error.message.includes('username')) {
        throw new Error('Username already exists');
      }
    }
    throw new Error('Failed to create user');
  }

  return data;
}

/**
 * Update user's last login timestamp
 */
export async function updateUserLastLogin(userId: string) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('users')
    .update({
      last_login_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating last login:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Create user preferences record
 */
export async function createUserPreferences(userId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_preferences')
    .insert({
      user_id: userId,
      background_inverted: false,
      theme_mode: 'light',
      notifications_enabled: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user preferences:', error);
    throw new Error('Failed to create user preferences');
  }

  return data;
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user preferences:', error);
    throw new Error('Failed to fetch preferences');
  }

  return data || null;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(userId: string, updates: Record<string, any>) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_preferences')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user preferences:', error);
    throw new Error('Failed to update preferences');
  }

  return data;
}

/**
 * Store refresh token hash in database
 */
export async function storeRefreshToken(userId: string, tokenHash: string, expiresAt: string, userAgent?: string, ipAddress?: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('refresh_tokens')
    .insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      user_agent: userAgent || null,
      ip_address: ipAddress || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error storing refresh token:', error);
    throw new Error('Failed to store refresh token');
  }

  return data;
}

/**
 * Get refresh token by ID
 */
export async function getRefreshToken(tokenId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('refresh_tokens')
    .select('*')
    .eq('id', tokenId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching refresh token:', error);
    throw new Error('Failed to fetch refresh token');
  }

  return data || null;
}

/**
 * Revoke refresh token
 */
export async function revokeRefreshToken(tokenId: string) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('refresh_tokens')
    .update({
      revoked_at: new Date().toISOString(),
    })
    .eq('id', tokenId);

  if (error) {
    console.error('Error revoking refresh token:', error);
    throw new Error('Failed to revoke refresh token');
  }
}

/**
 * Clean up expired refresh tokens (optional maintenance)
 */
export async function cleanupExpiredTokens() {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('refresh_tokens')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Error cleaning up expired tokens:', error);
    // Don't throw - this is maintenance
  }
}
