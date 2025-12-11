import { describe, it, expect, beforeEach } from '@jest/globals';
import * as counter from '@/app/lib/counter';

// Helper to reset counter state between tests
// We need to access the internal setCounter function for testing
import { setCounter } from '@/app/lib/counter';

describe('Counter Module', () => {
  beforeEach(() => {
    // Reset counter to 0 before each test
    setCounter(0);
  });

  describe('getCounter()', () => {
    it('should return the current counter value', () => {
      expect(counter.getCounter()).toBe(0);
    });

    it('should return updated value after operations', () => {
      counter.increment();
      expect(counter.getCounter()).toBe(1);
    });
  });

  describe('increment()', () => {
    it('should increment counter by 1', () => {
      const result = counter.increment();
      expect(result).toBe(1);
      expect(counter.getCounter()).toBe(1);
    });

    it('should increment multiple times', () => {
      counter.increment();
      counter.increment();
      counter.increment();
      expect(counter.getCounter()).toBe(3);
    });

    it('should return the new value', () => {
      const result = counter.increment();
      expect(result).toBe(1);
    });

    it('should throw error when exceeding MAX_SAFE_INTEGER', () => {
      // Set counter to near max safe integer
      setCounter(Number.MAX_SAFE_INTEGER);
      expect(() => counter.increment()).toThrow('Counter would exceed maximum safe integer value');
    });
  });

  describe('decrement()', () => {
    it('should decrement counter by 1', () => {
      setCounter(5);
      const result = counter.decrement();
      expect(result).toBe(4);
      expect(counter.getCounter()).toBe(4);
    });

    it('should decrement multiple times', () => {
      setCounter(5);
      counter.decrement();
      counter.decrement();
      expect(counter.getCounter()).toBe(3);
    });

    it('should return the new value', () => {
      setCounter(5);
      const result = counter.decrement();
      expect(result).toBe(4);
    });

    it('should throw error when counter is 0', () => {
      setCounter(0);
      expect(() => counter.decrement()).toThrow('Counter cannot go below 0');
    });

    it('should throw error when counter is already at minimum', () => {
      setCounter(1);
      counter.decrement();
      expect(() => counter.decrement()).toThrow('Counter cannot go below 0');
    });
  });

  describe('reset()', () => {
    it('should reset counter to 0', () => {
      setCounter(42);
      const result = counter.reset();
      expect(result).toBe(0);
      expect(counter.getCounter()).toBe(0);
    });

    it('should always return 0', () => {
      counter.increment();
      counter.increment();
      const result = counter.reset();
      expect(result).toBe(0);
    });

    it('should reset counter to 0 when already 0', () => {
      const result = counter.reset();
      expect(result).toBe(0);
    });
  });

  describe('setCounter()', () => {
    it('should set counter to specific value', () => {
      counter.setCounter(42);
      expect(counter.getCounter()).toBe(42);
    });

    it('should throw error for non-integer values', () => {
      expect(() => counter.setCounter(3.14)).toThrow('Counter value must be an integer');
      expect(() => counter.setCounter(NaN)).toThrow('Counter value must be an integer');
    });

    it('should throw error for negative values', () => {
      expect(() => counter.setCounter(-1)).toThrow('Counter value cannot be negative');
    });

    it('should throw error for values exceeding MAX_SAFE_INTEGER', () => {
      expect(() => counter.setCounter(Number.MAX_SAFE_INTEGER + 1)).toThrow(
        'Counter value exceeds maximum safe integer'
      );
    });

    it('should accept valid zero value', () => {
      counter.setCounter(0);
      expect(counter.getCounter()).toBe(0);
    });

    it('should accept maximum safe integer', () => {
      counter.setCounter(Number.MAX_SAFE_INTEGER);
      expect(counter.getCounter()).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('Counter Boundary Cases', () => {
    it('should handle large numbers correctly', () => {
      setCounter(1000000);
      counter.increment();
      expect(counter.getCounter()).toBe(1000001);
    });

    it('should maintain state across operations', () => {
      counter.increment();
      counter.increment();
      counter.decrement();
      counter.increment();
      expect(counter.getCounter()).toBe(2);
    });

    it('should reset to 0 between operations', () => {
      counter.increment();
      counter.increment();
      counter.reset();
      counter.increment();
      expect(counter.getCounter()).toBe(1);
    });
  });
});
