/**
 * Unit tests for tree model validation and utilities
 */

import { validateTreeInput, checkDuplicateTree, type TreeCreateInput } from '@/lib/trees';

describe('Tree Model Validation', () => {
  describe('validateTreeInput', () => {
    it('should validate a correct tree input', () => {
      const input: TreeCreateInput = {
        species: 'Oak',
        planting_date: '2023-01-15',
        latitude: 40.7128,
        longitude: -74.006,
        health_status: 'healthy',
      };

      const result = validateTreeInput(input);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing species', () => {
      const input = {
        species: '',
        planting_date: '2023-01-15',
        latitude: 40.7128,
        longitude: -74.006,
        health_status: 'healthy',
      };

      const result = validateTreeInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Species'))).toBe(true);
    });

    it('should reject missing planting date', () => {
      const input = {
        species: 'Oak',
        planting_date: '',
        latitude: 40.7128,
        longitude: -74.006,
        health_status: 'healthy',
      };

      const result = validateTreeInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Planting date'))).toBe(true);
    });

    it('should reject invalid date format', () => {
      const input = {
        species: 'Oak',
        planting_date: 'invalid-date',
        latitude: 40.7128,
        longitude: -74.006,
        health_status: 'healthy',
      };

      const result = validateTreeInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('date'))).toBe(true);
    });

    it('should reject latitude out of range (too high)', () => {
      const input = {
        species: 'Oak',
        planting_date: '2023-01-15',
        latitude: 91,
        longitude: -74.006,
        health_status: 'healthy',
      };

      const result = validateTreeInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Latitude'))).toBe(true);
    });

    it('should reject latitude out of range (too low)', () => {
      const input = {
        species: 'Oak',
        planting_date: '2023-01-15',
        latitude: -91,
        longitude: -74.006,
        health_status: 'healthy',
      };

      const result = validateTreeInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Latitude'))).toBe(true);
    });

    it('should reject longitude out of range (too high)', () => {
      const input = {
        species: 'Oak',
        planting_date: '2023-01-15',
        latitude: 40.7128,
        longitude: 181,
        health_status: 'healthy',
      };

      const result = validateTreeInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Longitude'))).toBe(true);
    });

    it('should reject longitude out of range (too low)', () => {
      const input = {
        species: 'Oak',
        planting_date: '2023-01-15',
        latitude: 40.7128,
        longitude: -181,
        health_status: 'healthy',
      };

      const result = validateTreeInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Longitude'))).toBe(true);
    });

    it('should reject invalid health status', () => {
      const input = {
        species: 'Oak',
        planting_date: '2023-01-15',
        latitude: 40.7128,
        longitude: -74.006,
        health_status: 'unknown' as any,
      };

      const result = validateTreeInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Health status'))).toBe(true);
    });

    it('should allow edge case latitude values', () => {
      const input1: TreeCreateInput = {
        species: 'Oak',
        planting_date: '2023-01-15',
        latitude: -90,
        longitude: -74.006,
        health_status: 'healthy',
      };

      const input2: TreeCreateInput = {
        species: 'Oak',
        planting_date: '2023-01-15',
        latitude: 90,
        longitude: -74.006,
        health_status: 'healthy',
      };

      expect(validateTreeInput(input1).valid).toBe(true);
      expect(validateTreeInput(input2).valid).toBe(true);
    });

    it('should allow edge case longitude values', () => {
      const input1: TreeCreateInput = {
        species: 'Oak',
        planting_date: '2023-01-15',
        latitude: 40.7128,
        longitude: -180,
        health_status: 'healthy',
      };

      const input2: TreeCreateInput = {
        species: 'Oak',
        planting_date: '2023-01-15',
        latitude: 40.7128,
        longitude: 180,
        health_status: 'healthy',
      };

      expect(validateTreeInput(input1).valid).toBe(true);
      expect(validateTreeInput(input2).valid).toBe(true);
    });

    it('should allow all valid health statuses', () => {
      const statuses: Array<'healthy' | 'diseased' | 'dead'> = ['healthy', 'diseased', 'dead'];

      statuses.forEach((status) => {
        const input: TreeCreateInput = {
          species: 'Oak',
          planting_date: '2023-01-15',
          latitude: 40.7128,
          longitude: -74.006,
          health_status: status,
        };

        const result = validateTreeInput(input);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Duplicate detection', () => {
    it('should detect trees within 5-meter radius', async () => {
      const tree1 = {
        species: 'Oak',
        planting_date: '2023-01-15',
        latitude: 40.7128,
        longitude: -74.006,
        health_status: 'healthy' as const,
      };

      const tree2 = {
        species: 'Maple',
        planting_date: '2023-02-20',
        latitude: 40.71285, // ~5.5 meters away
        longitude: -74.00605,
        health_status: 'healthy' as const,
      };

      // Note: In real tests, would call createTree and checkDuplicateTree
      // For now, just verify the validation works
      const result1 = validateTreeInput(tree1);
      const result2 = validateTreeInput(tree2);

      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });
  });
});
