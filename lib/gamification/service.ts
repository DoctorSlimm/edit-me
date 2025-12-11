/**
 * Gamification Service
 * Core business logic for points, badges, and leaderboard
 */

import { getSupabaseClient } from '@/lib/auth/supabase';
import {
  ActionType,
  ACTION_POINTS,
  BADGES,
  UserPoints,
  UserBadge,
  UserGameStats,
  LeaderboardEntry,
  BadgeCheckResponse,
  DEFAULT_CONFIG,
} from './types';

/**
 * Award points to a user for an action
 * Uses deduplication via unique key to prevent duplicate awards
 * Returns new balance and total earned
 */
export async function awardPoints(
  userId: string,
  actionType: ActionType | string,
  deduplicationKey?: string
): Promise<{ newBalance: number; totalEarned: number }> {
  const supabase = getSupabaseClient();
  const points = ACTION_POINTS[actionType as ActionType] || 0;

  if (points <= 0) {
    // For negative points, enforce zero floor
    const userPoints = await getUserPoints(userId);
    const newBalance = Math.max(0, (userPoints?.points_balance || 0) + points);
    return {
      newBalance,
      totalEarned: userPoints?.points_lifetime || 0,
    };
  }

  // Generate deduplication key if not provided
  const dedupKey =
    deduplicationKey || `${userId}-${actionType}-${Date.now()}`;

  try {
    // Ensure user_points record exists first
    await ensureUserPoints(userId);

    // Get current balance
    const currentPoints = await getUserPoints(userId);
    const newBalance = (currentPoints?.points_balance || 0) + Math.abs(points);
    const newLifetime = (currentPoints?.points_lifetime || 0) + Math.abs(points);

    // Insert point event (deduplication via unique constraint)
    const { error: eventError } = await supabase
      .from('point_events')
      .insert({
        user_id: userId,
        points_amount: Math.abs(points),
        action_type: actionType,
        deduplication_key: dedupKey,
      });

    if (eventError && eventError.code === '23505') {
      // Duplicate key - already awarded, return current balance
      const userPoints = await getUserPoints(userId);
      return {
        newBalance: userPoints?.points_balance || 0,
        totalEarned: userPoints?.points_lifetime || 0,
      };
    }

    if (eventError) {
      throw eventError;
    }

    // Update points
    const { data, error } = await supabase
      .from('user_points')
      .update({
        points_balance: newBalance,
        points_lifetime: newLifetime,
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      newBalance: data?.points_balance || newBalance,
      totalEarned: data?.points_lifetime || newLifetime,
    };
  } catch (error) {
    console.error('Error awarding points:', error);
    throw new Error('Failed to award points');
  }
}

/**
 * Get current user points
 */
export async function getUserPoints(userId: string): Promise<UserPoints | null> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching user points:', error);
    return null;
  }
}

/**
 * Ensure user_points record exists (create with defaults if not)
 */
export async function ensureUserPoints(userId: string): Promise<UserPoints> {
  const supabase = getSupabaseClient();

  // First try to get existing record
  const existing = await getUserPoints(userId);
  if (existing) {
    return existing;
  }

  // Create new record with defaults
  const { data, error } = await supabase
    .from('user_points')
    .insert({
      user_id: userId,
      points_balance: 0,
      points_lifetime: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user points:', error);
    throw new Error('Failed to initialize user points');
  }

  return data;
}

/**
 * Check and award badges based on user's points
 * Returns list of newly earned badges
 */
export async function checkAndAwardBadges(
  userId: string
): Promise<BadgeCheckResponse> {
  const supabase = getSupabaseClient();

  try {
    // Get current user stats
    const stats = await getUserGameStats(userId);
    const earnedBadges: string[] = [];
    const newBadges: string[] = [];

    // Check each badge condition
    for (const [, badge] of Object.entries(BADGES)) {
      // Check if badge should be earned
      const meetsCondition = badge.unlockCondition
        ? badge.unlockCondition(stats)
        : stats.pointsLifetime >= badge.pointsRequired;

      if (meetsCondition) {
        earnedBadges.push(badge.id);

        // Check if already earned
        const { data: existing } = await supabase
          .from('user_badges')
          .select('id')
          .eq('user_id', userId)
          .eq('badge_id', badge.id)
          .single();

        if (!existing) {
          // Award new badge
          const { error } = await supabase.from('user_badges').insert({
            user_id: userId,
            badge_id: badge.id,
          });

          if (!error) {
            newBadges.push(badge.id);
          }
        }
      }
    }

    return {
      earnedBadges,
      newBadges,
    };
  } catch (error) {
    console.error('Error checking badges:', error);
    return {
      earnedBadges: [],
      newBadges: [],
      error: 'Failed to check badges',
    };
  }
}

/**
 * Get user's earned badges
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

/**
 * Get aggregated user game stats
 */
export async function getUserGameStats(userId: string): Promise<UserGameStats> {
  const supabase = getSupabaseClient();

  try {
    // Get points
    const points = await getUserPoints(userId);

    // Get badges
    const badges = await getUserBadges(userId);

    // Get leaderboard rank
    let rank = 0;
    const { data: ranking } = await supabase
      .from('user_leaderboard_ranking')
      .select('current_rank')
      .eq('user_id', userId)
      .eq('ranking_period', 'alltime')
      .single();

    if (ranking) {
      rank = ranking.current_rank;
    }

    // Get point events to calculate specific action counts
    const { data: events } = await supabase
      .from('point_events')
      .select('action_type')
      .eq('user_id', userId);

    const treesAdded = (events || []).filter(
      (e) => e.action_type === ActionType.TREE_ADDED
    ).length;

    const palettesCreated = (events || []).filter(
      (e) => e.action_type === ActionType.COLOR_PALETTE_CREATED
    ).length;

    return {
      userId,
      pointsBalance: points?.points_balance || 0,
      pointsLifetime: points?.points_lifetime || 0,
      earnedBadges: badges.map((b) => b.badge_id),
      currentRank: rank,
      treesAdded,
      palettesCreated,
      lastPointsUpdate: points?.last_updated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching user game stats:', error);
    return {
      userId,
      pointsBalance: 0,
      pointsLifetime: 0,
      earnedBadges: [],
      currentRank: 0,
      treesAdded: 0,
      palettesCreated: 0,
      lastPointsUpdate: new Date().toISOString(),
    };
  }
}

/**
 * Get top N users for leaderboard
 * Results are cached in memory for leaderboardCacheMinutes
 */
const leaderboardCache: Record<
  string,
  { data: LeaderboardEntry[]; timestamp: number }
> = {};

export async function getLeaderboard(
  period: 'weekly' | 'alltime' = 'alltime',
  limit: number = DEFAULT_CONFIG.leaderboardLimit
): Promise<LeaderboardEntry[]> {
  const cacheKey = `leaderboard-${period}`;
  const cacheExpiry = DEFAULT_CONFIG.leaderboardCacheMinutes * 60 * 1000;

  // Check cache
  if (leaderboardCache[cacheKey]) {
    const { data, timestamp } = leaderboardCache[cacheKey];
    if (Date.now() - timestamp < cacheExpiry) {
      return data.slice(0, limit);
    }
  }

  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('user_leaderboard_ranking')
      .select(
        `
        current_rank,
        user_id,
        users(username)
      `
      )
      .eq('ranking_period', period)
      .order('current_rank', { ascending: true })
      .limit(limit + 1); // Fetch one extra to ensure we have enough

    if (error) {
      throw error;
    }

    // Map to leaderboard entries and get points
    const entries: LeaderboardEntry[] = [];
    for (const row of data || []) {
      const points = await getUserPoints(row.user_id);
      entries.push({
        rank: row.current_rank,
        userId: row.user_id,
        username: (row.users as any)?.username || 'Unknown',
        pointsBalance: points?.points_balance || 0,
      });
    }

    // Cache results
    leaderboardCache[cacheKey] = {
      data: entries,
      timestamp: Date.now(),
    };

    return entries.slice(0, limit);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Recalculate and update leaderboard rankings
 * Should be called periodically (every 30 seconds or on-demand)
 */
export async function updateLeaderboardRankings(
  period: 'weekly' | 'alltime' = 'alltime'
): Promise<void> {
  const supabase = getSupabaseClient();

  try {
    // Query all users with their points
    const { data: users, error: usersError } = await supabase
      .from('user_points')
      .select('user_id, points_balance')
      .order('points_balance', { ascending: false });

    if (usersError) {
      throw usersError;
    }

    // Update rankings
    let rank = 1;
    let lastPoints = -1;
    let tieCount = 0;

    for (const user of users || []) {
      // Handle ties: if same points, keep same rank and increment counter
      if (user.points_balance !== lastPoints) {
        rank = tieCount + 1;
        lastPoints = user.points_balance;
        tieCount = 1;
      } else {
        tieCount++;
      }

      await supabase
        .from('user_leaderboard_ranking')
        .upsert(
          {
            user_id: user.user_id,
            current_rank: rank,
            ranking_period: period,
            points_snapshot: user.points_balance,
            rank_updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,ranking_period' }
        );
    }

    // Clear cache
    delete leaderboardCache[`leaderboard-${period}`];
  } catch (error) {
    console.error('Error updating leaderboard rankings:', error);
    throw new Error('Failed to update leaderboard');
  }
}

/**
 * Get badge definition by ID
 */
export function getBadgeDefinition(badgeId: string) {
  return BADGES[badgeId] || null;
}
