/**
 * Gamification System Types
 * Type definitions for points, badges, and leaderboard data structures
 */

/**
 * Predefined action types that award points
 */
export enum ActionType {
  // User account actions
  USER_REGISTRATION = 'user_registration',
  USER_LOGIN = 'user_login',

  // Content actions
  TREE_ADDED = 'tree_added',
  TREE_UPDATED = 'tree_updated',
  TREE_DELETED = 'tree_deleted',

  // Engagement actions
  COLOR_PALETTE_CREATED = 'color_palette_created',
  COLOR_PREFERENCE_SET = 'color_preference_set',

  // Counter/activity actions
  COUNTER_INCREMENT = 'counter_increment',
  COUNTER_DECREMENT = 'counter_decrement',
}

/**
 * Points configuration for each action type
 */
export const ACTION_POINTS: Record<ActionType, number> = {
  [ActionType.USER_REGISTRATION]: 100,
  [ActionType.USER_LOGIN]: 5,
  [ActionType.TREE_ADDED]: 25,
  [ActionType.TREE_UPDATED]: 15,
  [ActionType.TREE_DELETED]: -10, // Negative points (enforced as zero floor)
  [ActionType.COLOR_PALETTE_CREATED]: 20,
  [ActionType.COLOR_PREFERENCE_SET]: 10,
  [ActionType.COUNTER_INCREMENT]: 1,
  [ActionType.COUNTER_DECREMENT]: 1,
};

/**
 * Badge definitions with unlock criteria
 */
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
  pointsRequired: number;
  unlockCondition?: (userStats: UserGameStats) => boolean;
}

/**
 * Available badges in the system
 */
export const BADGES: Record<string, BadgeDefinition> = {
  bronze: {
    id: 'bronze',
    name: 'Bronze Badge',
    description: 'Earn 100 points',
    icon: '🥉',
    pointsRequired: 100,
  },
  silver: {
    id: 'silver',
    name: 'Silver Badge',
    description: 'Earn 250 points',
    icon: '🥈',
    pointsRequired: 250,
  },
  gold: {
    id: 'gold',
    name: 'Gold Badge',
    description: 'Earn 500 points',
    icon: '🥇',
    pointsRequired: 500,
  },
  tree_planter: {
    id: 'tree_planter',
    name: 'Tree Planter',
    description: 'Add 5 trees',
    icon: '🌳',
    pointsRequired: 0,
    unlockCondition: (stats) => stats.treesAdded >= 5,
  },
  designer: {
    id: 'designer',
    name: 'Designer',
    description: 'Create 3 color palettes',
    icon: '🎨',
    pointsRequired: 0,
    unlockCondition: (stats) => stats.palettesCreated >= 3,
  },
};

/**
 * User points record from database
 */
export interface UserPoints {
  id: string;
  user_id: string;
  points_balance: number;
  points_lifetime: number;
  last_updated: string;
  created_at: string;
}

/**
 * User badge earned record
 */
export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_date: string;
  is_active: boolean;
}

/**
 * Leaderboard ranking record
 */
export interface UserLeaderboardRanking {
  id: string;
  user_id: string;
  current_rank: number;
  rank_updated_at: string;
  ranking_period: 'weekly' | 'alltime';
  points_snapshot: number;
}

/**
 * Point event audit log
 */
export interface PointEvent {
  id: string;
  user_id: string;
  points_amount: number;
  action_type: ActionType | string;
  created_at: string;
  deduplication_key?: string;
}

/**
 * User gamification profile (aggregated stats)
 */
export interface UserGameStats {
  userId: string;
  pointsBalance: number;
  pointsLifetime: number;
  earnedBadges: string[];
  currentRank: number;
  treesAdded: number;
  palettesCreated: number;
  lastPointsUpdate: string;
}

/**
 * Leaderboard entry for public display
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  pointsBalance: number;
}

/**
 * Response type for points award endpoint
 */
export interface PointsAwardResponse {
  success: boolean;
  newBalance: number;
  totalEarned: number;
  error?: string;
}

/**
 * Response type for badge check endpoint
 */
export interface BadgeCheckResponse {
  earnedBadges: string[];
  newBadges: string[];
  error?: string;
}

/**
 * Response type for user profile endpoint
 */
export interface UserProfileResponse {
  pointsBalance: number;
  pointsLifetime: number;
  badges: string[];
  rank: number;
  rankPeriod: string;
}

/**
 * Response type for leaderboard endpoint
 */
export interface LeaderboardResponse {
  period: 'weekly' | 'alltime';
  rankings: LeaderboardEntry[];
  lastUpdated: string;
}

/**
 * Configuration for gamification system
 */
export interface GamificationConfig {
  maxDailyPoints: number;
  leaderboardCacheMinutes: number;
  leaderboardLimit: number;
  pointsBatchFlushSeconds: number;
  enableFeatureFlag: boolean;
}

export const DEFAULT_CONFIG: GamificationConfig = {
  maxDailyPoints: 10000,
  leaderboardCacheMinutes: 5,
  leaderboardLimit: 100,
  pointsBatchFlushSeconds: 2,
  enableFeatureFlag: true,
};
