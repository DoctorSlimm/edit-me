/**
 * Unit tests for Halloween theme utilities
 * Tests date boundary conditions and status management
 */

import {
  isHalloweenSeason,
  getHalloweenActiveStatus,
  setHalloweenActiveStatus,
  clearHalloweenActiveStatus,
  getDaysUntilHalloweenChange,
} from '@/lib/halloween-utils';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('halloween-utils', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('isHalloweenSeason', () => {
    it('should return true during October (month 9)', () => {
      // Mock a date in October
      const originalDate = Date;
      const mockDate = new Date('2024-10-15');

      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const result = isHalloweenSeason();
      expect(result).toBe(true);

      global.Date = originalDate;
    });

    it('should return false on September 30 (before Halloween)', () => {
      const originalDate = Date;
      const mockDate = new Date('2024-09-30');

      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const result = isHalloweenSeason();
      expect(result).toBe(false);

      global.Date = originalDate;
    });

    it('should return false on November 1 (after Halloween)', () => {
      const originalDate = Date;
      const mockDate = new Date('2024-11-01');

      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const result = isHalloweenSeason();
      expect(result).toBe(false);

      global.Date = originalDate;
    });

    it('should return true on October 1 (start of Halloween)', () => {
      const originalDate = Date;
      const mockDate = new Date('2024-10-01');

      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const result = isHalloweenSeason();
      expect(result).toBe(true);

      global.Date = originalDate;
    });

    it('should return true on October 31 (end of Halloween)', () => {
      const originalDate = Date;
      const mockDate = new Date('2024-10-31');

      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const result = isHalloweenSeason();
      expect(result).toBe(true);

      global.Date = originalDate;
    });
  });

  describe('getHalloweenActiveStatus', () => {
    it('should return cached localStorage value if available', () => {
      localStorage.setItem('halloween:auto-active', 'true');
      const result = getHalloweenActiveStatus();
      expect(result).toBe(true);
    });

    it('should return false from localStorage if cached', () => {
      localStorage.setItem('halloween:auto-active', 'false');
      const result = getHalloweenActiveStatus();
      expect(result).toBe(false);
    });

    it('should fall back to isHalloweenSeason if no cache', () => {
      const originalDate = Date;
      const mockDate = new Date('2024-10-15');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      localStorage.clear();
      const result = getHalloweenActiveStatus();
      expect(result).toBe(true);

      global.Date = originalDate;
    });
  });

  describe('setHalloweenActiveStatus', () => {
    it('should set localStorage value to true', () => {
      setHalloweenActiveStatus(true);
      expect(localStorage.getItem('halloween:auto-active')).toBe('true');
    });

    it('should set localStorage value to false', () => {
      setHalloweenActiveStatus(false);
      expect(localStorage.getItem('halloween:auto-active')).toBe('false');
    });
  });

  describe('clearHalloweenActiveStatus', () => {
    it('should remove localStorage entry', () => {
      localStorage.setItem('halloween:auto-active', 'true');
      clearHalloweenActiveStatus();
      expect(localStorage.getItem('halloween:auto-active')).toBe(null);
    });
  });

  describe('getDaysUntilHalloweenChange', () => {
    it('should return positive days until November 1 during October', () => {
      const originalDate = Date;
      const mockDate = new Date('2024-10-15');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const daysUntilChange = getDaysUntilHalloweenChange();
      // October 15 to November 1 is 17 days
      expect(daysUntilChange).toBeGreaterThan(0);
      expect(daysUntilChange).toBeLessThanOrEqual(17);

      global.Date = originalDate;
    });

    it('should return positive days until October 1 during September', () => {
      const originalDate = Date;
      const mockDate = new Date('2024-09-15');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const daysUntilChange = getDaysUntilHalloweenChange();
      // September 15 to October 1 is 16 days
      expect(daysUntilChange).toBeGreaterThan(0);

      global.Date = originalDate;
    });

    it('should return positive days until next October 1 during December', () => {
      const originalDate = Date;
      const mockDate = new Date('2024-12-15');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const daysUntilChange = getDaysUntilHalloweenChange();
      // December 15, 2024 to October 1, 2025 is 289 days
      expect(daysUntilChange).toBeGreaterThan(0);

      global.Date = originalDate;
    });

    it('should return small positive number on October 31', () => {
      const originalDate = Date;
      const mockDate = new Date('2024-10-31');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const daysUntilChange = getDaysUntilHalloweenChange();
      // October 31 to November 1 is 1 day
      expect(daysUntilChange).toBe(1);

      global.Date = originalDate;
    });
  });
});
