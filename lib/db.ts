/**
 * Database utility functions for color variants and user preferences
 *
 * This module provides:
 * - PostgreSQL connection management
 * - Color variant storage and retrieval
 * - User preference persistence
 * - Audit logging for changes
 */

import { createClient } from '@supabase/supabase-js';

interface ColorVariant {
  id: number;
  palette_id: number;
  name: string;
  tonal_level: 'light' | 'standard' | 'dark';
  hex_value: string;
  description?: string;
  usage_context?: string;
  contrast_ratio?: number;
  created_at: string;
  updated_at: string;
}

interface ColorPalette {
  id: number;
  name: string;
  description?: string;
  variants: ColorVariant[];
  created_at: string;
  updated_at: string;
}

interface UserColorPreferences {
  user_id: string;
  preferred_palette_id?: number;
  theme_settings: Record<string, unknown>;
  background_inverted: boolean;
  created_at: string;
  updated_at: string;
}

// Initialize Supabase client for demo purposes
// In production with PostgreSQL, replace with: const pg = require('pg');
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      // Return null if not configured - API will handle gracefully
      console.warn('Supabase credentials not configured. Using in-memory storage for demo.');
      return null;
    }

    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

/**
 * Retrieve all color palettes with their variants
 */
export async function getColorPalettes(): Promise<ColorPalette[]> {
  const client = getSupabaseClient();

  if (!client) {
    // Return demo data if not connected to database
    return getDemoPalettes();
  }

  try {
    const { data, error } = await client
      .from('color_palettes')
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at,
        color_variants (
          id,
          palette_id,
          name,
          tonal_level,
          hex_value,
          description,
          usage_context,
          contrast_ratio,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to retrieve color palettes:', error);
      return getDemoPalettes();
    }

    return (data || []).map((palette: any) => ({
      ...palette,
      variants: palette.color_variants || [],
    })) as ColorPalette[];
  } catch (error) {
    console.error('Database error:', error);
    return getDemoPalettes();
  }
}

/**
 * Retrieve a specific color palette by ID
 */
export async function getColorPalette(paletteId: number): Promise<ColorPalette | null> {
  const client = getSupabaseClient();

  if (!client) {
    const palettes = getDemoPalettes();
    return palettes.find((p) => p.id === paletteId) || null;
  }

  try {
    const { data, error } = await client
      .from('color_palettes')
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at,
        color_variants (
          id,
          palette_id,
          name,
          tonal_level,
          hex_value,
          description,
          usage_context,
          contrast_ratio,
          created_at,
          updated_at
        )
      `)
      .eq('id', paletteId)
      .single();

    if (error) {
      console.error('Failed to retrieve color palette:', error);
      return null;
    }

    if (!data) return null;

    const palette: ColorPalette = {
      id: (data as any).id,
      name: (data as any).name,
      description: (data as any).description,
      variants: ((data as any).color_variants || []) as ColorVariant[],
      created_at: (data as any).created_at,
      updated_at: (data as any).updated_at,
    };

    return palette;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

/**
 * Retrieve color variants for a specific palette
 */
export async function getColorVariants(paletteId: number): Promise<ColorVariant[]> {
  const client = getSupabaseClient();

  if (!client) {
    const palettes = getDemoPalettes();
    const palette = palettes.find((p) => p.id === paletteId);
    return palette?.variants || [];
  }

  try {
    const { data, error } = await client
      .from('color_variants')
      .select('*')
      .eq('palette_id', paletteId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Failed to retrieve color variants:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

/**
 * Retrieve user color preferences
 */
export async function getUserColorPreferences(userId: string): Promise<UserColorPreferences | null> {
  const client = getSupabaseClient();

  // Demo: Return default preferences if not connected
  if (!client) {
    return {
      user_id: userId,
      theme_settings: {},
      background_inverted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  try {
    const { data, error } = await client
      .from('user_color_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Failed to retrieve user preferences:', error);
      return null;
    }

    if (!data) {
      return {
        user_id: userId,
        theme_settings: {},
        background_inverted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return data as UserColorPreferences;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

/**
 * Update user color preferences
 */
export async function updateUserColorPreferences(
  userId: string,
  preferences: Partial<Omit<UserColorPreferences, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserColorPreferences | null> {
  const client = getSupabaseClient();

  if (!client) {
    console.warn('Cannot persist user preferences without database connection');
    return null;
  }

  try {
    const { data, error } = await (client
      .from('user_color_preferences') as any)
      .upsert(
        {
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Failed to update user preferences:', error);
      return null;
    }

    return data as UserColorPreferences;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

/**
 * Demo data for color palettes when database is not connected
 */
function getDemoPalettes(): ColorPalette[] {
  const now = new Date().toISOString();

  return [
    {
      id: 1,
      name: 'red-variants',
      description: 'Red color variants for error states, warnings, and destructive actions',
      created_at: now,
      updated_at: now,
      variants: [
        {
          id: 1,
          palette_id: 1,
          name: 'red',
          tonal_level: 'light',
          hex_value: '#FECACA',
          description: 'Light red for subtle backgrounds or hover states',
          usage_context: 'error-background',
          contrast_ratio: 4.5,
          created_at: now,
          updated_at: now,
        },
        {
          id: 2,
          palette_id: 1,
          name: 'red',
          tonal_level: 'standard',
          hex_value: '#EF4444',
          description: 'Standard red for primary error messages and warnings',
          usage_context: 'error-state',
          contrast_ratio: 7.0,
          created_at: now,
          updated_at: now,
        },
        {
          id: 3,
          palette_id: 1,
          name: 'red',
          tonal_level: 'dark',
          hex_value: '#7F1D1D',
          description: 'Dark red for destructive actions and critical alerts',
          usage_context: 'destructive',
          contrast_ratio: 11.0,
          created_at: now,
          updated_at: now,
        },
      ],
    },
    {
      id: 2,
      name: 'green-variants',
      description: 'Green color variants for success states and primary branding',
      created_at: now,
      updated_at: now,
      variants: [
        {
          id: 4,
          palette_id: 2,
          name: 'green',
          tonal_level: 'light',
          hex_value: '#DCFCE7',
          description: 'Light green for success backgrounds',
          usage_context: 'success-background',
          contrast_ratio: 4.0,
          created_at: now,
          updated_at: now,
        },
        {
          id: 5,
          palette_id: 2,
          name: 'green',
          tonal_level: 'standard',
          hex_value: '#22C55E',
          description: 'Standard green for primary branding and success states',
          usage_context: 'success-state',
          contrast_ratio: 8.0,
          created_at: now,
          updated_at: now,
        },
        {
          id: 6,
          palette_id: 2,
          name: 'green',
          tonal_level: 'dark',
          hex_value: '#15803D',
          description: 'Dark green for emphasis and dark mode accents',
          usage_context: 'success-emphasis',
          contrast_ratio: 10.0,
          created_at: now,
          updated_at: now,
        },
      ],
    },
  ];
}
