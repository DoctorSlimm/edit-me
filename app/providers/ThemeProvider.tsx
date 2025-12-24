'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getThemePreference,
  setThemePreference,
  applyTheme,
  applyThemeInversion,
  getBackgroundInversionPreference,
  setBackgroundInversionPreference
} from '@/lib/theme';
import {
  fetchColorPalettes,
  fetchColorPalette,
  applyColorVariantsToDOM,
} from '@/lib/color-utils';
import {
  isHalloweenSeason,
  getHalloweenActiveStatus,
  setHalloweenActiveStatus,
} from '@/lib/halloween-utils';

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

  // Halloween theme
  halloweenActive: boolean;

  // Loading state
  isLoading: boolean;
  colorsLoading: boolean;
}

const defaultThemeContext: ThemeContextType = {
  mode: 'light',
  toggleTheme: async () => {},
  backgroundInverted: false,
  toggleBackgroundInversion: async () => {},
  colorPalettes: [],
  activeColorPalette: null,
  setActiveColorPalette: async () => {},
  halloweenActive: false,
  isLoading: true,
  colorsLoading: false,
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Theme mode state
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // Background inversion state
  const [backgroundInverted, setBackgroundInverted] = useState(false);

  // Color theming state
  const [colorPalettes, setColorPalettes] = useState<ColorPalette[]>([]);
  const [activeColorPalette, setActiveColorPaletteState] = useState<ColorPalette | null>(null);

  // Halloween theme state
  const [halloweenActive, setHalloweenActive] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [colorsLoading, setColorsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    // Mark as mounted on client-side only
    setIsMounted(true);

    const initializeTheme = async () => {
      try {
        setIsLoading(true);

        // Load theme mode preference
        const savedMode = getThemePreference();
        setMode(savedMode);
        applyTheme(savedMode);

        // Load background inversion preference
        const inverted = getBackgroundInversionPreference();
        setBackgroundInverted(inverted);
        applyThemeInversion(inverted);

        // Load color palettes
        setColorsLoading(true);
        const palettes = await fetchColorPalettes();
        setColorPalettes(palettes);

        // Check if Halloween theme should be active
        const isHalloween = isHalloweenSeason();
        setHalloweenActive(isHalloween);
        setHalloweenActiveStatus(isHalloween);

        // Apply Halloween palette if active, otherwise load default palette
        if (isHalloween && palettes.length >= 3) {
          // Palette ID 3 is the Halloween palette
          const halloweenPalette = palettes.find((p) => p.id === 3);
          if (halloweenPalette) {
            setActiveColorPaletteState(halloweenPalette);
            applyColorVariantsToDOM(halloweenPalette);
          } else {
            // Fallback to default if Halloween palette not found
            const defaultPalette = palettes[0];
            setActiveColorPaletteState(defaultPalette);
            applyColorVariantsToDOM(defaultPalette);
          }
        } else if (palettes.length > 0) {
          // Load default palette (red variants) when not in Halloween season
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

    // Set up interval to check for date changes (for Halloween transitions)
    const dateCheckInterval = setInterval(() => {
      const currentHalloweenStatus = isHalloweenSeason();
      setHalloweenActive((prevStatus) => {
        if (prevStatus !== currentHalloweenStatus) {
          // Date has crossed into/out of Halloween season, might need to refresh
          console.log(
            currentHalloweenStatus
              ? 'Entering Halloween season'
              : 'Exiting Halloween season'
          );
        }
        return currentHalloweenStatus;
      });
    }, 60000); // Check every minute

    return () => clearInterval(dateCheckInterval);
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

      // Persist to localStorage
      setBackgroundInversionPreference(value);

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
      const previous = getBackgroundInversionPreference();
      setBackgroundInverted(previous);
      applyThemeInversion(previous);
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

  // Only render providers on client-side to avoid hydration issues during static generation
  if (!isMounted) {
    return <>{children}</>;
  }

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
        halloweenActive,
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
  return context;
}
