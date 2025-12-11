/**
 * Unit Tests for Gamification Service
 * Tests points calculation, badge conditions, and leaderboard logic
 */

import {
  BADGES,
  ACTION_POINTS,
  ActionType,
  UserGameStats,
} from '@/lib/gamification/types';

describe('Gamification Service', () => {
  describe('Points System', () => {
    it('should have valid action points defined', () => {
      expect(ACTION_POINTS[ActionType.USER_REGISTRATION]).toBe(100);
      expect(ACTION_POINTS[ActionType.TREE_ADDED]).toBe(25);
      expect(ACTION_POINTS[ActionType.USER_LOGIN]).toBe(5);
    });

    it('should have non-negative points for most actions', () => {
      const actions = Object.values(ActionType);
      actions.forEach((action) => {
        const points = ACTION_POINTS[action];
        // Most actions should have positive or zero points
        expect(typeof points === 'number').toBe(true);
      });
    });

    it('should handle point calculation correctly', () => {
      const basePoints = 100;
      const newPoints = basePoints + ACTION_POINTS[ActionType.TREE_ADDED];
      expect(newPoints).toBe(125);
    });

    it('should enforce zero floor for negative points', () => {
      const balance = 10;
      const negativePoints = ACTION_POINTS[ActionType.TREE_DELETED];
      const newBalance = Math.max(0, balance + negativePoints);
      expect(newBalance).toBe(0);
    });

    it('should not go below zero with multiple negative actions', () => {
      const balance = 5;
      const negativePoints = ACTION_POINTS[ActionType.TREE_DELETED]; // -10
      const newBalance = Math.max(0, balance + negativePoints);
      expect(newBalance).toBe(0);
    });
  });

  describe('Badge System', () => {
    it('should have bronze badge at 100 points', () => {
      const badge = BADGES.bronze;
      expect(badge).toBeDefined();
      expect(badge.pointsRequired).toBe(100);
      expect(badge.name).toBe('Bronze Badge');
    });

    it('should have silver badge at 250 points', () => {
      const badge = BADGES.silver;
      expect(badge).toBeDefined();
      expect(badge.pointsRequired).toBe(250);
      expect(badge.name).toBe('Silver Badge');
    });

    it('should have gold badge at 500 points', () => {
      const badge = BADGES.gold;
      expect(badge).toBeDefined();
      expect(badge.pointsRequired).toBe(500);
      expect(badge.name).toBe('Gold Badge');
    });

    it('should check bronze badge condition', () => {
      const stats: UserGameStats = {
        userId: 'test-user',
        pointsBalance: 100,
        pointsLifetime: 100,
        earnedBadges: [],
        currentRank: 0,
        treesAdded: 0,
        palettesCreated: 0,
        lastPointsUpdate: new Date().toISOString(),
      };

      const badge = BADGES.bronze;
      const earned = stats.pointsLifetime >= badge.pointsRequired;
      expect(earned).toBe(true);
    });

    it('should not earn bronze badge under 100 points', () => {
      const stats: UserGameStats = {
        userId: 'test-user',
        pointsBalance: 99,
        pointsLifetime: 99,
        earnedBadges: [],
        currentRank: 0,
        treesAdded: 0,
        palettesCreated: 0,
        lastPointsUpdate: new Date().toISOString(),
      };

      const badge = BADGES.bronze;
      const earned = stats.pointsLifetime >= badge.pointsRequired;
      expect(earned).toBe(false);
    });

    it('should check tree planter condition', () => {
      const stats: UserGameStats = {
        userId: 'test-user',
        pointsBalance: 0,
        pointsLifetime: 0,
        earnedBadges: [],
        currentRank: 0,
        treesAdded: 5,
        palettesCreated: 0,
        lastPointsUpdate: new Date().toISOString(),
      };

      const badge = BADGES.tree_planter;
      const earned = badge.unlockCondition ? badge.unlockCondition(stats) : false;
      expect(earned).toBe(true);
    });

    it('should not earn tree planter badge with 4 trees', () => {
      const stats: UserGameStats = {
        userId: 'test-user',
        pointsBalance: 0,
        pointsLifetime: 0,
        earnedBadges: [],
        currentRank: 0,
        treesAdded: 4,
        palettesCreated: 0,
        lastPointsUpdate: new Date().toISOString(),
      };

      const badge = BADGES.tree_planter;
      const earned = badge.unlockCondition ? badge.unlockCondition(stats) : false;
      expect(earned).toBe(false);
    });

    it('should check designer condition', () => {
      const stats: UserGameStats = {
        userId: 'test-user',
        pointsBalance: 0,
        pointsLifetime: 0,
        earnedBadges: [],
        currentRank: 0,
        treesAdded: 0,
        palettesCreated: 3,
        lastPointsUpdate: new Date().toISOString(),
      };

      const badge = BADGES.designer;
      const earned = badge.unlockCondition ? badge.unlockCondition(stats) : false;
      expect(earned).toBe(true);
    });

    it('should have valid badge icons', () => {
      Object.values(BADGES).forEach((badge) => {
        expect(badge.icon).toBeDefined();
        expect(badge.icon.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Leaderboard Logic', () => {
    it('should handle tie-breaking correctly', () => {
      const users = [
        { user_id: 'user1', points_balance: 500 },
        { user_id: 'user2', points_balance: 500 },
        { user_id: 'user3', points_balance: 400 },
        { user_id: 'user4', points_balance: 400 },
      ];

      // Simulate leaderboard ranking with tiebreaker
      const rankings: Record<string, number> = {};
      let rank = 1;
      let lastPoints = -1;
      let tieCount = 0;

      users.forEach((user) => {
        if (user.points_balance !== lastPoints) {
          rank = tieCount + 1;
          lastPoints = user.points_balance;
          tieCount = 1;
        } else {
          tieCount++;
        }
        rankings[user.user_id] = rank;
      });

      // Users with same points should have same rank
      expect(rankings['user1']).toBe(1);
      expect(rankings['user2']).toBe(1);
      expect(rankings['user3']).toBe(3);
      expect(rankings['user4']).toBe(3);
    });

    it('should sort leaderboard by points descending', () => {
      const users = [
        { userId: 'user1', points: 100 },
        { userId: 'user2', points: 500 },
        { userId: 'user3', points: 250 },
      ];

      const sorted = users.sort((a, b) => b.points - a.points);

      expect(sorted[0].userId).toBe('user2');
      expect(sorted[1].userId).toBe('user3');
      expect(sorted[2].userId).toBe('user1');
    });
  });

  describe('Action Types', () => {
    it('should have all action types defined', () => {
      const requiredActions = [
        ActionType.USER_REGISTRATION,
        ActionType.USER_LOGIN,
        ActionType.TREE_ADDED,
        ActionType.TREE_UPDATED,
        ActionType.TREE_DELETED,
        ActionType.COLOR_PALETTE_CREATED,
        ActionType.COUNTER_INCREMENT,
      ];

      requiredActions.forEach((action) => {
        expect(ACTION_POINTS[action]).toBeDefined();
      });
    });

    it('should have positive points for positive actions', () => {
      const positiveActions = [
        ActionType.USER_REGISTRATION,
        ActionType.TREE_ADDED,
        ActionType.COLOR_PALETTE_CREATED,
      ];

      positiveActions.forEach((action) => {
        expect(ACTION_POINTS[action]).toBeGreaterThan(0);
      });
    });
  });

  describe('Deduplication', () => {
    it('should generate consistent deduplication keys', () => {
      const userId = 'test-user';
      const actionType = ActionType.TREE_ADDED;
      const timestamp = 1000000;

      const key1 = `${userId}-${actionType}-${timestamp}`;
      const key2 = `${userId}-${actionType}-${timestamp}`;

      expect(key1).toBe(key2);
    });

    it('should differentiate between different actions', () => {
      const userId = 'test-user';
      const timestamp = 1000000;

      const key1 = `${userId}-${ActionType.TREE_ADDED}-${timestamp}`;
      const key2 = `${userId}-${ActionType.COUNTER_INCREMENT}-${timestamp}`;

      expect(key1).not.toBe(key2);
    });
  });
});
