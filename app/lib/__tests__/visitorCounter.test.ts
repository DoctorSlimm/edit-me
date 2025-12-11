/**
 * Tests for the Real Visitor Counter module
 * Tests visitor tracking logic for daily, weekly, and monthly counts
 */

import {
  trackVisitor,
  getVisitorStats,
  resetVisitorData,
  getDetailedVisitorData,
  VisitorStats,
} from '../visitorCounter';

describe('Visitor Counter', () => {
  beforeEach(() => {
    // Reset all storage before each test
    resetVisitorData();
    // Clear localStorage and sessionStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  });

  describe('Initial Tracking', () => {
    test('should track first visitor correctly', () => {
      const stats = trackVisitor();

      expect(stats).toBeDefined();
      expect(stats.today).toBeGreaterThanOrEqual(0);
      expect(stats.thisWeek).toBeGreaterThanOrEqual(0);
      expect(stats.thisMonth).toBeGreaterThanOrEqual(0);
      expect(stats.visitorId).toBeDefined();
      expect(typeof stats.visitorId).toBe('string');
      expect(stats.visitorId.length).toBeGreaterThan(0);
    });

    test('should have daily count of 1 after first visit', () => {
      const stats = trackVisitor();
      expect(stats.today).toBe(1);
    });

    test('should have weekly count of 1 after first visit', () => {
      const stats = trackVisitor();
      expect(stats.thisWeek).toBe(1);
    });

    test('should have monthly count of 1 after first visit', () => {
      const stats = trackVisitor();
      expect(stats.thisMonth).toBe(1);
    });
  });

  describe('Session Tracking', () => {
    test('should not increment count on same session', () => {
      const firstVisit = trackVisitor();
      const secondVisit = trackVisitor();

      expect(firstVisit.today).toBe(secondVisit.today);
      expect(firstVisit.thisWeek).toBe(secondVisit.thisWeek);
      expect(firstVisit.thisMonth).toBe(secondVisit.thisMonth);
    });

    test('should return same visitor ID for same session', () => {
      const stats1 = trackVisitor();
      const stats2 = trackVisitor();

      expect(stats1.visitorId).toBe(stats2.visitorId);
    });
  });

  describe('Stats Retrieval', () => {
    test('should return current stats without incrementing', () => {
      trackVisitor(); // First visit - increments count
      const stats1 = getVisitorStats(); // Just retrieves

      expect(stats1.today).toBe(1);

      const stats2 = getVisitorStats(); // Should be same
      expect(stats2.today).toBe(stats1.today);
    });

    test('should return visitor ID', () => {
      const stats = getVisitorStats();
      expect(stats.visitorId).toBeDefined();
      expect(typeof stats.visitorId).toBe('string');
    });
  });

  describe('Detailed Data Retrieval', () => {
    test('should return detailed visitor data', () => {
      trackVisitor();
      const detailed = getDetailedVisitorData();

      expect(detailed).toBeDefined();
      expect(detailed.stats).toBeDefined();
      expect(detailed.lastVisitDate).toBeDefined();
      expect(detailed.storageUsage).toBeGreaterThanOrEqual(0);
    });

    test('should have valid last visit date', () => {
      trackVisitor();
      const detailed = getDetailedVisitorData();

      // Should be in ISO date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      expect(dateRegex.test(detailed.lastVisitDate)).toBe(true);
    });

    test('should calculate reasonable storage usage', () => {
      trackVisitor();
      const detailed = getDetailedVisitorData();

      // Storage usage should be more than 0 but reasonable (less than 1KB for basic data)
      expect(detailed.storageUsage).toBeGreaterThan(0);
      expect(detailed.storageUsage).toBeLessThan(1000);
    });
  });

  describe('Reset Functionality', () => {
    test('should reset visitor data', () => {
      trackVisitor();
      const beforeReset = getVisitorStats();
      expect(beforeReset.today).toBeGreaterThan(0);

      resetVisitorData();
      const afterReset = getVisitorStats();

      expect(afterReset.today).toBe(0);
      expect(afterReset.thisWeek).toBe(0);
      expect(afterReset.thisMonth).toBe(0);
    });

    test('should generate new visitor ID after reset', () => {
      const stats1 = trackVisitor();
      const id1 = stats1.visitorId;

      resetVisitorData();
      const stats2 = trackVisitor();
      const id2 = stats2.visitorId;

      expect(id1).not.toBe(id2);
    });
  });

  describe('Data Persistence', () => {
    test('should persist visitor ID across function calls', () => {
      const stats1 = trackVisitor();
      const id1 = stats1.visitorId;

      const stats2 = getVisitorStats();
      const id2 = stats2.visitorId;

      expect(id1).toBe(id2);
    });

    test('should maintain count across multiple stat retrievals', () => {
      trackVisitor();

      const stats1 = getVisitorStats();
      const stats2 = getVisitorStats();
      const stats3 = getVisitorStats();

      expect(stats1.today).toBe(stats2.today);
      expect(stats2.today).toBe(stats3.today);
    });
  });

  describe('Edge Cases', () => {
    test('should handle multiple rapid visits in same session', () => {
      const visits = [];
      for (let i = 0; i < 5; i++) {
        visits.push(trackVisitor());
      }

      // All visits should have same count since they're in the same session
      const finalCount = visits[visits.length - 1].today;
      visits.forEach(visit => {
        expect(visit.today).toBe(finalCount);
      });
    });

    test('should format visitor counts correctly', () => {
      const stats = trackVisitor();

      // All counts should be non-negative integers
      expect(Number.isInteger(stats.today)).toBe(true);
      expect(Number.isInteger(stats.thisWeek)).toBe(true);
      expect(Number.isInteger(stats.thisMonth)).toBe(true);

      expect(stats.today).toBeGreaterThanOrEqual(0);
      expect(stats.thisWeek).toBeGreaterThanOrEqual(0);
      expect(stats.thisMonth).toBeGreaterThanOrEqual(0);
    });

    test('should maintain visitor hierarchy (month >= week >= day)', () => {
      trackVisitor();
      const stats = getVisitorStats();

      expect(stats.thisMonth).toBeGreaterThanOrEqual(stats.thisWeek);
      expect(stats.thisWeek).toBeGreaterThanOrEqual(stats.today);
    });
  });

  describe('Consistency Checks', () => {
    test('should have consistent stats after multiple operations', () => {
      const stats1 = trackVisitor();
      const stats2 = getVisitorStats();
      const stats3 = getVisitorStats();

      expect(stats1).toEqual(stats2);
      expect(stats2).toEqual(stats3);
    });

    test('should not lose data during stat retrieval', () => {
      trackVisitor();
      const statsBeforeRetrieval = getVisitorStats();

      // Retrieve multiple times
      for (let i = 0; i < 10; i++) {
        getVisitorStats();
      }

      const statsAfterRetrieval = getVisitorStats();
      expect(statsBeforeRetrieval).toEqual(statsAfterRetrieval);
    });
  });
});
