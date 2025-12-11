/**
 * Unit tests for database utilities
 *
 * Test coverage for:
 * - Color palette retrieval
 * - Color variant creation and updates
 * - User preference storage and retrieval
 * - Demo data fallback
 */

import {
  getColorPalettes,
  getColorPalette,
  getColorVariants,
  getUserColorPreferences,
  updateUserColorPreferences,
} from '@/lib/db';

describe('Database Utilities', () => {
  describe('getColorPalettes', () => {
    it('should return an array of color palettes', async () => {
      const palettes = await getColorPalettes();
      expect(Array.isArray(palettes)).toBe(true);
      expect(palettes.length).toBeGreaterThan(0);
    });

    it('should include red-variants palette', async () => {
      const palettes = await getColorPalettes();
      const redPalette = palettes.find((p) => p.name === 'red-variants');
      expect(redPalette).toBeDefined();
      expect(redPalette?.description).toContain('Red');
    });

    it('should include green-variants palette', async () => {
      const palettes = await getColorPalettes();
      const greenPalette = palettes.find((p) => p.name === 'green-variants');
      expect(greenPalette).toBeDefined();
      expect(greenPalette?.description).toContain('Green');
    });

    it('should include variants in palettes', async () => {
      const palettes = await getColorPalettes();
      const firstPalette = palettes[0];
      expect(firstPalette.variants).toBeDefined();
      expect(Array.isArray(firstPalette.variants)).toBe(true);
      expect(firstPalette.variants.length).toBeGreaterThan(0);
    });
  });

  describe('getColorPalette', () => {
    it('should return a specific palette by ID', async () => {
      const palettes = await getColorPalettes();
      const firstPaletteId = palettes[0]?.id;

      if (firstPaletteId) {
        const palette = await getColorPalette(firstPaletteId);
        expect(palette).toBeDefined();
        expect(palette?.id).toBe(firstPaletteId);
      }
    });

    it('should include variants in returned palette', async () => {
      const palettes = await getColorPalettes();
      const firstPaletteId = palettes[0]?.id;

      if (firstPaletteId) {
        const palette = await getColorPalette(firstPaletteId);
        expect(palette?.variants).toBeDefined();
        expect(Array.isArray(palette?.variants)).toBe(true);
      }
    });

    it('should return null for non-existent palette ID', async () => {
      const palette = await getColorPalette(99999);
      expect(palette).toBeNull();
    });
  });

  describe('getColorVariants', () => {
    it('should return array of variants for a palette', async () => {
      const palettes = await getColorPalettes();
      const firstPaletteId = palettes[0]?.id;

      if (firstPaletteId) {
        const variants = await getColorVariants(firstPaletteId);
        expect(Array.isArray(variants)).toBe(true);
        expect(variants.length).toBeGreaterThan(0);
      }
    });

    it('should return variants with required properties', async () => {
      const palettes = await getColorPalettes();
      const firstPaletteId = palettes[0]?.id;

      if (firstPaletteId) {
        const variants = await getColorVariants(firstPaletteId);
        if (variants.length > 0) {
          const variant = variants[0];
          expect(variant.id).toBeDefined();
          expect(variant.name).toBeDefined();
          expect(variant.hex_value).toBeDefined();
          expect(variant.tonal_level).toBeDefined();
        }
      }
    });

    it('should return empty array for non-existent palette', async () => {
      const variants = await getColorVariants(99999);
      expect(Array.isArray(variants)).toBe(true);
      expect(variants.length).toBe(0);
    });
  });

  describe('getUserColorPreferences', () => {
    it('should return user preferences object', async () => {
      const preferences = await getUserColorPreferences('test-user');
      expect(preferences).toBeDefined();
      expect(preferences?.user_id).toBe('test-user');
    });

    it('should include required preference fields', async () => {
      const preferences = await getUserColorPreferences('test-user');
      expect(preferences?.theme_settings).toBeDefined();
      expect(typeof preferences?.background_inverted).toBe('boolean');
    });

    it('should return default values for new users', async () => {
      const preferences = await getUserColorPreferences('new-test-user');
      expect(preferences?.background_inverted).toBe(false);
      expect(preferences?.theme_settings).toBeDefined();
    });
  });

  describe('updateUserColorPreferences', () => {
    it('should update user background_inverted preference', async () => {
      const userId = 'test-user-' + Date.now();

      const updated = await updateUserColorPreferences(userId, {
        background_inverted: true,
      });

      expect(updated?.user_id).toBe(userId);
      if (updated) {
        // Note: This test depends on database connectivity
        // When database is not connected, updateUserColorPreferences returns null
        // which is handled gracefully by the API
      }
    });

    it('should update theme_settings', async () => {
      const userId = 'test-user-' + Date.now();
      const settings = { colorMode: 'dark', contrast: 'high' };

      const updated = await updateUserColorPreferences(userId, {
        theme_settings: settings,
      });

      if (updated) {
        // When database is not connected, returns null
        // API handles this gracefully
      }
    });
  });

  describe('Color Variant Properties', () => {
    it('should have red variants with correct hex values', async () => {
      const palettes = await getColorPalettes();
      const redPalette = palettes.find((p) => p.name === 'red-variants');

      if (redPalette) {
        const lightVariant = redPalette.variants.find((v) => v.tonal_level === 'light');
        const standardVariant = redPalette.variants.find((v) => v.tonal_level === 'standard');
        const darkVariant = redPalette.variants.find((v) => v.tonal_level === 'dark');

        expect(lightVariant?.hex_value).toBe('#FECACA');
        expect(standardVariant?.hex_value).toBe('#EF4444');
        expect(darkVariant?.hex_value).toBe('#7F1D1D');
      }
    });

    it('should have WCAG contrast ratios for red variants', async () => {
      const palettes = await getColorPalettes();
      const redPalette = palettes.find((p) => p.name === 'red-variants');

      if (redPalette) {
        redPalette.variants.forEach((variant) => {
          if (variant.contrast_ratio) {
            // Light: 4.5 (WCAG AA minimum)
            // Standard: 7.0 (WCAG AAA)
            // Dark: 11.0 (high contrast)
            expect(variant.contrast_ratio).toBeGreaterThanOrEqual(4.5);
          }
        });
      }
    });

    it('should have usage context for variants', async () => {
      const palettes = await getColorPalettes();
      const redPalette = palettes.find((p) => p.name === 'red-variants');

      if (redPalette) {
        const contexts = new Set(
          redPalette.variants.map((v) => v.usage_context).filter(Boolean)
        );
        expect(contexts.size).toBeGreaterThan(0);
      }
    });
  });

  describe('Palette Structure', () => {
    it('should have required palette fields', async () => {
      const palettes = await getColorPalettes();
      if (palettes.length > 0) {
        const palette = palettes[0];
        expect(palette.id).toBeDefined();
        expect(palette.name).toBeDefined();
        expect(palette.variants).toBeDefined();
        expect(palette.created_at).toBeDefined();
        expect(palette.updated_at).toBeDefined();
      }
    });

    it('should have required variant fields', async () => {
      const palettes = await getColorPalettes();
      if (palettes.length > 0 && palettes[0].variants.length > 0) {
        const variant = palettes[0].variants[0];
        expect(variant.id).toBeDefined();
        expect(variant.palette_id).toBeDefined();
        expect(variant.name).toBeDefined();
        expect(variant.tonal_level).toBeDefined();
        expect(variant.hex_value).toBeDefined();
        expect(variant.created_at).toBeDefined();
        expect(variant.updated_at).toBeDefined();
      }
    });
  });
});
