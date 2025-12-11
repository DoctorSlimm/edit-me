/**
 * Tree management utilities for the forestry management system
 *
 * This module provides:
 * - Tree model and validation
 * - Database operations for tree CRUD
 * - Duplicate detection based on geolocation
 */

import { createClient } from '@supabase/supabase-js';

export interface Tree {
  id: string;
  species: string;
  planting_date: string;
  latitude: number;
  longitude: number;
  health_status: 'healthy' | 'diseased' | 'dead';
  created_at: string;
  updated_at: string;
}

export interface TreeCreateInput {
  species: string;
  planting_date: string;
  latitude: number;
  longitude: number;
  health_status: 'healthy' | 'diseased' | 'dead';
}

// In-memory storage for trees when database is not connected
const demoTrees: Tree[] = [];

// Initialize Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn('Supabase credentials not configured. Using in-memory storage for demo.');
      return null;
    }

    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

/**
 * Validate tree input data
 */
export function validateTreeInput(input: Partial<TreeCreateInput>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.species || typeof input.species !== 'string' || input.species.trim() === '') {
    errors.push('Species is required and must be a non-empty string');
  }

  if (!input.planting_date || typeof input.planting_date !== 'string') {
    errors.push('Planting date is required and must be a valid ISO date string');
  } else {
    try {
      new Date(input.planting_date);
    } catch {
      errors.push('Planting date must be a valid ISO date string');
    }
  }

  if (typeof input.latitude !== 'number' || input.latitude < -90 || input.latitude > 90) {
    errors.push('Latitude must be a number between -90 and 90');
  }

  if (typeof input.longitude !== 'number' || input.longitude < -180 || input.longitude > 180) {
    errors.push('Longitude must be a number between -180 and 180');
  }

  if (!input.health_status || !['healthy', 'diseased', 'dead'].includes(input.health_status)) {
    errors.push('Health status must be one of: healthy, diseased, dead');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Create a new tree record
 */
export async function createTree(input: TreeCreateInput): Promise<Tree | null> {
  const client = getSupabaseClient();
  const validation = validateTreeInput(input);

  if (!validation.valid) {
    console.error('Invalid tree input:', validation.errors);
    return null;
  }

  if (!client) {
    // Use in-memory storage for demo
    const tree: Tree = {
      id: `tree_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      species: input.species,
      planting_date: input.planting_date,
      latitude: input.latitude,
      longitude: input.longitude,
      health_status: input.health_status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demoTrees.push(tree);
    return tree;
  }

  try {
    const { data, error } = await (client as any)
      .from('trees')
      .insert([
        {
          species: input.species,
          planting_date: input.planting_date,
          latitude: input.latitude,
          longitude: input.longitude,
          health_status: input.health_status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to create tree:', error);
      return null;
    }

    return data as Tree;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

/**
 * Get all trees
 */
export async function getTrees(): Promise<Tree[]> {
  const client = getSupabaseClient();

  if (!client) {
    return demoTrees;
  }

  try {
    const { data, error } = await client
      .from('trees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to retrieve trees:', error);
      return [];
    }

    return (data || []) as Tree[];
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

/**
 * Get a specific tree by ID
 */
export async function getTree(treeId: string): Promise<Tree | null> {
  const client = getSupabaseClient();

  if (!client) {
    return demoTrees.find((t) => t.id === treeId) || null;
  }

  try {
    const { data, error } = await client
      .from('trees')
      .select('*')
      .eq('id', treeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to retrieve tree:', error);
      return null;
    }

    return (data || null) as Tree | null;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

/**
 * Update a tree record
 */
export async function updateTree(
  treeId: string,
  updates: Partial<Omit<Tree, 'id' | 'created_at'>>
): Promise<Tree | null> {
  const client = getSupabaseClient();

  if (!client) {
    // Update in-memory storage
    const treeIndex = demoTrees.findIndex((t) => t.id === treeId);
    if (treeIndex === -1) return null;

    demoTrees[treeIndex] = {
      ...demoTrees[treeIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return demoTrees[treeIndex];
  }

  try {
    const { data, error } = await (client as any)
      .from('trees')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', treeId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update tree:', error);
      return null;
    }

    return (data || null) as Tree | null;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

/**
 * Delete a tree record
 */
export async function deleteTree(treeId: string): Promise<boolean> {
  const client = getSupabaseClient();

  if (!client) {
    const index = demoTrees.findIndex((t) => t.id === treeId);
    if (index === -1) return false;
    demoTrees.splice(index, 1);
    return true;
  }

  try {
    const { error } = await client.from('trees').delete().eq('id', treeId);

    if (error) {
      console.error('Failed to delete tree:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database error:', error);
    return false;
  }
}

/**
 * Check for duplicate trees within 5-meter radius
 */
export async function checkDuplicateTree(
  latitude: number,
  longitude: number,
  radius: number = 5
): Promise<Tree | null> {
  const trees = await getTrees();

  // Simple distance calculation (not exact, but good for demo)
  const metersPerDegree = 111320; // approximate conversion
  const radiusInDegrees = radius / metersPerDegree;

  const duplicate = trees.find((tree) => {
    const latDiff = Math.abs(tree.latitude - latitude);
    const lonDiff = Math.abs(tree.longitude - longitude);
    return latDiff < radiusInDegrees && lonDiff < radiusInDegrees;
  });

  return duplicate || null;
}

/**
 * Bulk import trees from array
 */
export async function bulkImportTrees(trees: TreeCreateInput[]): Promise<{
  successful: Tree[];
  failed: Array<{ input: TreeCreateInput; error: string }>;
}> {
  const successful: Tree[] = [];
  const failed: Array<{ input: TreeCreateInput; error: string }> = [];

  for (const tree of trees) {
    const created = await createTree(tree);
    if (created) {
      successful.push(created);
    } else {
      const validation = validateTreeInput(tree);
      failed.push({
        input: tree,
        error: validation.errors.join('; '),
      });
    }
  }

  return { successful, failed };
}
