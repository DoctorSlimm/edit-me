'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getThemePreference, setThemePreference, applyTheme, applyThemeInversion } from '@/lib/theme';
import {
  fetchColorPalettes,
  fetchColorPalette,
  applyColorVariantsToDOM,
} from '@/lib/color-utils';

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

interface ThemeContextType {
  // Theme mode
  mode: 'light' | 'dark';
  toggleTheme: () => Promise<void>;

  // Background inversion
  backgroundInverted: boolean;
  toggleBackgroundInversion: (value: boolean) => Promise<void>;

  // Color theming
  colorPalettes: ColorPalette[];
  activeColorPalette: ColorPalette | null;
  setActiveColorPalette: (paletteId: number) => Promise<void>;

  // Loading state
  isLoading: boolean;
  colorsLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Theme mode state
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // Background inversion state
  const [backgroundInverted, setBackgroundInverted] = useState(false);

  // Color theming state
  const [colorPalettes, setColorPalettes] = useState<ColorPalette[]>([]);
  const [activeColorPalette, setActiveColorPaletteState] = useState<ColorPalette | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [colorsLoading, setColorsLoading] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        setIsLoading(true);

        // Load theme mode preference
        const savedMode = getThemePreference();
        setMode(savedMode);
        applyTheme(savedMode);

        // Load background inversion preference (default to false)
        const inverted = false;
        setBackgroundInverted(inverted);
        applyThemeInversion(inverted);

        // Load color palettes
        setColorsLoading(true);
        const palettes = await fetchColorPalettes();
        setColorPalettes(palettes);

        // Load default palette (red variants)
        if (palettes.length > 0) {
          const defaultPalette = palettes[0];
          setActiveColorPaletteState(defaultPalette);
          applyColorVariantsToDOM(defaultPalette);
        }
      } catch (error) {
        console.error('Failed to initialize theme:', error);
      } finally {
        setIsLoading(false);
        setColorsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      setIsLoading(true);

      // Calculate next mode
      const nextMode: 'light' | 'dark' = mode === 'light' ? 'dark' : 'light';

      // Update state
      setMode(nextMode);

      // Persist to localStorage
      setThemePreference(nextMode);

      // Apply the theme
      applyTheme(nextMode);

      // Try to sync with API if authenticated
      try {
        await fetch('/api/theme-preference', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mode: nextMode }),
        });
      } catch (apiError) {
        console.warn('Failed to sync theme preference with API:', apiError);
        // Continue anyway - localStorage is our fallback
      }
    } catch (error) {
      console.error('Failed to update theme preference:', error);
      // Rollback on error
      const previous = getThemePreference();
      setMode(previous);
      applyTheme(previous);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBackgroundInversion = async (value: boolean) => {
    try {
      setIsLoading(true);

      // Update state
      setBackgroundInverted(value);

      // Apply the filter
      applyThemeInversion(value);

      // Try to sync with API if authenticated
      try {
        await fetch('/api/theme-preference', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ backgroundInverted: value }),
        });
      } catch (apiError) {
        console.warn('Failed to sync theme preference with API:', apiError);
        // Continue anyway - localStorage is our fallback
      }
    } catch (error) {
      console.error('Failed to update theme preference:', error);
      // Rollback on error
      setBackgroundInverted(!value);
      applyThemeInversion(!value);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveColorPalette = async (paletteId: number) => {
    try {
      setColorsLoading(true);

      // Fetch the palette if not already loaded
      let palette: ColorPalette | null = null;

      const cached = colorPalettes.find((p) => p.id === paletteId);
      if (cached) {
        palette = cached;
      } else {
        palette = await fetchColorPalette(paletteId);
      }

      if (!palette) {
        throw new Error(`Palette with ID ${paletteId} not found`);
      }

      // Apply to DOM
      applyColorVariantsToDOM(palette);
      setActiveColorPaletteState(palette);

      // Persist to API
      try {
        await fetch('/api/colors/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preferred_palette_id: paletteId,
          }),
        });
      } catch (apiError) {
        console.warn('Failed to sync color preference with API:', apiError);
        // Continue anyway - state is updated on client
      }
    } catch (error) {
      console.error('Failed to set active color palette:', error);
      throw error;
    } finally {
      setColorsLoading(false);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleTheme,
        backgroundInverted,
        toggleBackgroundInversion,
        colorPalettes,
        activeColorPalette,
        setActiveColorPalette,
        isLoading,
        colorsLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
