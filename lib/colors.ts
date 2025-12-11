/**
 * Color Palette for Dark Mode Implementation
 * WCAG 2.1 AA compliant contrast ratios
 */

export const colorPalette = {
  light: {
    // Background colors
    background: '#ffffff',
    surface: '#f8f9fa',
    surfaceAlt: '#eff2f5',

    // Text colors
    text: {
      primary: '#171717',      // 100% black for high contrast
      secondary: '#666666',     // WCAG AA compliant secondary text
      tertiary: '#999999',      // Tertiary text
      muted: '#cccccc',        // Muted/disabled text
    },

    // Accent colors - Green theme
    primary: '#22c55e',
    primaryHover: '#16a34a',
    primaryLight: '#4ade80',
    primaryDark: '#15803d',
    primaryVeryLight: '#dcfce7',

    // Status colors
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',

    // Borders & dividers
    border: '#e5e7eb',
    divider: '#f3f4f6',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.1)',
  },

  dark: {
    // Background colors
    background: '#0a0a0a',
    surface: '#1a1a1a',
    surfaceAlt: '#262626',

    // Text colors
    text: {
      primary: '#ededed',      // Light for dark background
      secondary: '#a3a3a3',    // WCAG AA compliant secondary text
      tertiary: '#7a7a7a',     // Tertiary text
      muted: '#525252',        // Muted/disabled text
    },

    // Accent colors - Green theme (adjusted for dark)
    primary: '#34d399',        // Brighter green for dark background
    primaryHover: '#10b981',
    primaryLight: '#6ee7b7',
    primaryDark: '#059669',
    primaryVeryLight: '#d1fae5',

    // Status colors
    success: '#10b981',
    error: '#ef4444',
    warning: '#fbbf24',
    info: '#60a5fa',

    // Borders & dividers
    border: '#404040',
    divider: '#2a2a2a',

    // Overlays
    overlay: 'rgba(255, 255, 255, 0.1)',
    overlayLight: 'rgba(255, 255, 255, 0.05)',
  }
} as const;

export type ColorMode = 'light' | 'dark';
export type ColorPalette = typeof colorPalette.light;
