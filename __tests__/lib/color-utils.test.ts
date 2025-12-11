/**
 * Unit tests for color utilities
 *
 * Test coverage for:
 * - Color variant retrieval and caching
 * - Hex color validation and conversion
 * - Brightness calculation and contrast
 * - WCAG compliance validation
 */

import {
  getHexBrightness,
  isLightColor,
  getContrastingTextColor,
  formatColorForCSS,
  validateWCAGContrast,
  isValidHexColor,
  hexToRgb,
  rgbToHex,
  getColorVariant,
  getColorVariantsForName,
} from '@/lib/color-utils';

describe('Color Utilities', () => {
  // Sample color palette for testing
  const mockPalette = {
    id: 1,
    name: 'red-variants',
    description: 'Red color variants',
    variants: [
      {
        id: 1,
        palette_id: 1,
        name: 'red',
        tonal_level: 'light' as const,
        hex_value: '#FECACA',
        description: 'Light red',
        usage_context: 'error-background',
        contrast_ratio: 4.5,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 2,
        palette_id: 1,
        name: 'red',
        tonal_level: 'standard' as const,
        hex_value: '#EF4444',
        description: 'Standard red',
        usage_context: 'error-state',
        contrast_ratio: 7.0,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 3,
        palette_id: 1,
        name: 'red',
        tonal_level: 'dark' as const,
        hex_value: '#7F1D1D',
        description: 'Dark red',
        usage_context: 'destructive',
        contrast_ratio: 11.0,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  describe('getHexBrightness', () => {
    it('should calculate brightness for light colors (white)', () => {
      const brightness = getHexBrightness('#FFFFFF');
      expect(brightness).toBe(255);
    });

    it('should calculate brightness for dark colors (black)', () => {
      const brightness = getHexBrightness('#000000');
      expect(brightness).toBe(0);
    });

    it('should calculate brightness for mid-range colors', () => {
      const brightness = getHexBrightness('#808080');
      expect(brightness).toBeGreaterThan(100);
      expect(brightness).toBeLessThan(150);
    });

    it('should calculate correct brightness for red', () => {
      const brightness = getHexBrightness('#FF0000');
      expect(brightness).toBeGreaterThan(70);
      expect(brightness).toBeLessThan(85);
    });
  });

  describe('isLightColor', () => {
    it('should identify white as light color', () => {
      expect(isLightColor('#FFFFFF')).toBe(true);
    });

    it('should identify black as dark color', () => {
      expect(isLightColor('#000000')).toBe(false);
    });

    it('should identify light red as light color', () => {
      expect(isLightColor('#FECACA')).toBe(true);
    });

    it('should identify dark red as dark color', () => {
      expect(isLightColor('#7F1D1D')).toBe(false);
    });
  });

  describe('getContrastingTextColor', () => {
    it('should return black text for light background', () => {
      expect(getContrastingTextColor('#FFFFFF')).toBe('#000000');
    });

    it('should return white text for dark background', () => {
      expect(getContrastingTextColor('#000000')).toBe('#FFFFFF');
    });

    it('should return black text for light red', () => {
      expect(getContrastingTextColor('#FECACA')).toBe('#000000');
    });

    it('should return white text for dark red', () => {
      expect(getContrastingTextColor('#7F1D1D')).toBe('#FFFFFF');
    });
  });

  describe('isValidHexColor', () => {
    it('should validate correct hex colors', () => {
      expect(isValidHexColor('#FF0000')).toBe(true);
      expect(isValidHexColor('#00FF00')).toBe(true);
      expect(isValidHexColor('#0000FF')).toBe(true);
      expect(isValidHexColor('#FFFFFF')).toBe(true);
      expect(isValidHexColor('#000000')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(isValidHexColor('FF0000')).toBe(false); // Missing #
      expect(isValidHexColor('#FF00')).toBe(false); // Too short
      expect(isValidHexColor('#FF0000FF')).toBe(false); // Too long
      expect(isValidHexColor('#GGGGGG')).toBe(false); // Invalid characters
      expect(isValidHexColor('red')).toBe(false); // Not hex
    });
  });

  describe('hexToRgb', () => {
    it('should convert white to RGB', () => {
      const rgb = hexToRgb('#FFFFFF');
      expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert black to RGB', () => {
      const rgb = hexToRgb('#000000');
      expect(rgb).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should convert red to RGB', () => {
      const rgb = hexToRgb('#FF0000');
      expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should return null for invalid hex', () => {
      const rgb = hexToRgb('#GGGGGG');
      expect(rgb).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('should convert white to hex', () => {
      expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
    });

    it('should convert black to hex', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
    });

    it('should convert red to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#FF0000');
    });

    it('should handle lowercase letters in hex output', () => {
      const result = rgbToHex(239, 68, 68);
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });
  });

  describe('getColorVariant', () => {
    it('should retrieve light variant', () => {
      const variant = getColorVariant(mockPalette, 'red', 'light');
      expect(variant).toBeDefined();
      expect(variant?.hex_value).toBe('#FECACA');
      expect(variant?.tonal_level).toBe('light');
    });

    it('should retrieve standard variant by default', () => {
      const variant = getColorVariant(mockPalette, 'red');
      expect(variant).toBeDefined();
      expect(variant?.hex_value).toBe('#EF4444');
      expect(variant?.tonal_level).toBe('standard');
    });

    it('should retrieve dark variant', () => {
      const variant = getColorVariant(mockPalette, 'red', 'dark');
      expect(variant).toBeDefined();
      expect(variant?.hex_value).toBe('#7F1D1D');
      expect(variant?.tonal_level).toBe('dark');
    });

    it('should return undefined for non-existent variant', () => {
      const variant = getColorVariant(mockPalette, 'blue', 'standard');
      expect(variant).toBeUndefined();
    });
  });

  describe('getColorVariantsForName', () => {
    it('should retrieve all tonal variants for a color', () => {
      const variants = getColorVariantsForName(mockPalette, 'red');
      expect(variants.light).toBeDefined();
      expect(variants.standard).toBeDefined();
      expect(variants.dark).toBeDefined();
    });

    it('should have correct hex values for red variants', () => {
      const variants = getColorVariantsForName(mockPalette, 'red');
      expect(variants.light?.hex_value).toBe('#FECACA');
      expect(variants.standard?.hex_value).toBe('#EF4444');
      expect(variants.dark?.hex_value).toBe('#7F1D1D');
    });

    it('should return undefined for non-existent color', () => {
      const variants = getColorVariantsForName(mockPalette, 'blue');
      expect(variants.light).toBeUndefined();
      expect(variants.standard).toBeUndefined();
      expect(variants.dark).toBeUndefined();
    });
  });

  describe('validateWCAGContrast', () => {
    it('should validate WCAG AA compliance (4.5:1)', () => {
      expect(validateWCAGContrast(4.5)).toBe(true);
      expect(validateWCAGContrast(5.0)).toBe(true);
      expect(validateWCAGContrast(7.0)).toBe(true);
    });

    it('should reject insufficient contrast', () => {
      expect(validateWCAGContrast(4.0)).toBe(false);
      expect(validateWCAGContrast(3.5)).toBe(false);
      expect(validateWCAGContrast(1.0)).toBe(false);
    });

    it('should assume valid if contrast ratio not specified', () => {
      expect(validateWCAGContrast(undefined)).toBe(true);
    });
  });

  describe('formatColorForCSS', () => {
    it('should return hex value for valid variant', () => {
      const variant = getColorVariant(mockPalette, 'red', 'standard');
      expect(formatColorForCSS(variant)).toBe('#EF4444');
    });

    it('should return inherit for undefined variant', () => {
      expect(formatColorForCSS(undefined)).toBe('inherit');
    });
  });
});
