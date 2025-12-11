'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getThemePreference, setThemePreference, applyTheme } from '@/lib/theme';

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedMode = getThemePreference();
    setMode(savedMode);
    applyTheme(savedMode);
    setIsLoading(false);
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

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, isLoading }}>
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
