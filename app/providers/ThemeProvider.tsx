'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getThemePreference, setThemePreference, applyThemeInversion } from '@/lib/theme';

interface ThemeContextType {
  backgroundInverted: boolean;
  toggleBackgroundInversion: (value: boolean) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [backgroundInverted, setBackgroundInverted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const inverted = getThemePreference();
    setBackgroundInverted(inverted);
    applyThemeInversion(inverted);
    setIsLoading(false);
  }, []);

  const toggleBackgroundInversion = async (value: boolean) => {
    try {
      setIsLoading(true);

      // Update state
      setBackgroundInverted(value);

      // Persist to localStorage
      setThemePreference(value);

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
      const previous = getThemePreference();
      setBackgroundInverted(previous);
      applyThemeInversion(previous);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeContext.Provider value={{ backgroundInverted, toggleBackgroundInversion, isLoading }}>
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
