/**
 * Color utility functions for frontend color theming
 *
 * This module provides:
 * - Color variant retrieval and caching
 * - CSS variable application
 * - Color contrast validation
 * - Client-side color preference management
 */

interface ColorVariant {
  id: number;
  palette_id: number;
  name: string;
  tonal_level: 'light' | 'standard' | 'dark';
  hex_value: string;
  description?: string;
  usage_context?: string;
  contrast_ratio?: number;
  created_at: string;
  updated_at: string;
}

interface ColorPalette {
  id: number;
  name: string;
  description?: string;
  variants: ColorVariant[];
  created_at: string;
  updated_at: string;
}

// Cache for color palettes
let colorPaletteCache: Map<number, ColorPalette> | null = null;
let allPalettesCache: ColorPalette[] = [];
let paletteCacheInitialized = false;

/**
 * Fetch all color palettes from API
 * Results are cached in memory
 */
export async function fetchColorPalettes(): Promise<ColorPalette[]> {
  if (paletteCacheInitialized && allPalettesCache.length > 0) {
    return allPalettesCache;
  }

  try {
    const response = await fetch('/api/colors/palettes');

    if (!response.ok) {
      throw new Error(`Failed to fetch palettes: ${response.statusText}`);
    }

    const data = await response.json();
    allPalettesCache = data.palettes || [];
    paletteCacheInitialized = true;
    return allPalettesCache;
  } catch (error) {
    console.error('Error fetching color palettes:', error);
    paletteCacheInitialized = true;
    return [];
  }
}

/**
 * Fetch a specific color palette by ID
 */
export async function fetchColorPalette(paletteId: number): Promise<ColorPalette | null> {
  if (colorPaletteCache?.has(paletteId)) {
    return colorPaletteCache.get(paletteId) || null;
  }

  try {
    const response = await fetch(`/api/colors/palettes/${paletteId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch palette: ${response.statusText}`);
    }

    const data = await response.json();

    if (!colorPaletteCache) {
      colorPaletteCache = new Map();
    }
    colorPaletteCache.set(paletteId, data);

    return data;
  } catch (error) {
    console.error('Error fetching color palette:', error);
    return null;
  }
}

/**
 * Get color variant by name and tonal level
 */
export function getColorVariant(
  palette: ColorPalette,
  variantName: string,
  tonalLevel: 'light' | 'standard' | 'dark' = 'standard'
): ColorVariant | undefined {
  return palette.variants.find(
    (v) => v.name === variantName && v.tonal_level === tonalLevel
  );
}

/**
 * Apply color variants as CSS custom properties to the document root
 * This enables dynamic color theming without redeployment
 */
export function applyColorVariantsToDOM(palette: ColorPalette): void {
  const root = document.documentElement;

  palette.variants.forEach((variant) => {
    // Create CSS variable name from palette name, variant name, and tonal level
    // Examples: --color-red-light, --color-red-standard, --color-red-dark
    const variableName = `--color-${variant.name}-${variant.tonal_level}`;
    root.style.setProperty(variableName, variant.hex_value);

    // Also apply to usage context if available
    // Example: --color-error-background, --color-error-state
    if (variant.usage_context) {
      const contextVariableName = `--color-${variant.usage_context}`;
      root.style.setProperty(contextVariableName, variant.hex_value);
    }
  });
}

/**
 * Get all color variants for a specific color name across all tonal levels
 */
export function getColorVariantsForName(
  palette: ColorPalette,
  colorName: string
): Record<'light' | 'standard' | 'dark', ColorVariant | undefined> {
  return {
    light: getColorVariant(palette, colorName, 'light'),
    standard: getColorVariant(palette, colorName, 'standard'),
    dark: getColorVariant(palette, colorName, 'dark'),
  };
}

/**
 * Calculate hex color brightness (0-255)
 * Used for determining text color contrast
 */
export function getHexBrightness(hex: string): number {
  const rgb = parseInt(hex.replace('#', ''), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  // Relative luminance formula from WCAG
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/**
 * Determine if a color is "light" or "dark" based on brightness
 * Useful for choosing contrasting text color
 */
export function isLightColor(hex: string): boolean {
  return getHexBrightness(hex) > 128;
}

/**
 * Get appropriate text color (white or black) for contrast on background
 */
export function getContrastingTextColor(backgroundHex: string): '#000000' | '#FFFFFF' {
  return isLightColor(backgroundHex) ? '#000000' : '#FFFFFF';
}

/**
 * Format color variant for CSS usage
 */
export function formatColorForCSS(variant: ColorVariant | undefined): string {
  if (!variant) {
    return 'inherit';
  }
  return variant.hex_value;
}

/**
 * Validate WCAG AA color contrast compliance
 * Returns true if contrast ratio >= 4.5 (minimum for normal text)
 */
export function validateWCAGContrast(contrastRatio?: number): boolean {
  if (contrastRatio === undefined) {
    return true; // Assume valid if not specified
  }
  return contrastRatio >= 4.5;
}

/**
 * Clear cached palettes (useful for testing or manual refresh)
 */
export function clearColorPaletteCache(): void {
  colorPaletteCache = null;
  allPalettesCache = [];
  paletteCacheInitialized = false;
}

/**
 * Get CSS variable name for a color variant
 */
export function getColorVariableNameCSS(colorName: string, tonalLevel: string): string {
  return `var(--color-${colorName}-${tonalLevel})`;
}

/**
 * Serialize color palette to JSON for storage
 */
export function serializeColorPalette(palette: ColorPalette): string {
  return JSON.stringify(palette);
}

/**
 * Deserialize color palette from JSON
 */
export function deserializeColorPalette(json: string): ColorPalette | null {
  try {
    return JSON.parse(json) as ColorPalette;
  } catch (error) {
    console.error('Failed to deserialize color palette:', error);
    return null;
  }
}

/**
 * Check if a hex color is valid
 */
export function isValidHexColor(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!isValidHexColor(hex)) {
    return null;
  }

  const rgb = parseInt(hex.replace('#', ''), 16);
  return {
    r: (rgb >> 16) & 255,
    g: (rgb >> 8) & 255,
    b: rgb & 255,
  };
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }).join('')}`.toUpperCase();
}
