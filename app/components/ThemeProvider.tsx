"use client";

import React, { useState, useEffect, ReactNode, useCallback } from "react";
import { ThemeContext, ThemeContextType, ApplicationThemeState } from "@/lib/theme-context";

const STORAGE_KEY = "user:theme:backgroundInverted";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ApplicationThemeState>({
    backgroundInverted: false,
  });
  const [isHydrated, setIsHydrated] = useState(false);

  const applyTheme = useCallback((inverted: boolean) => {
    if (typeof document === "undefined") return;
    const htmlElement = document.documentElement;
    if (inverted) {
      htmlElement.style.filter = "invert(1)";
    } else {
      htmlElement.style.filter = "none";
    }
  }, []);

  // Load persisted theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const backgroundInverted = stored === "true";
        setTheme({ backgroundInverted });
        applyTheme(backgroundInverted);
      } else {
        // Default to non-inverted for new users
        applyTheme(false);
      }
    } catch (error) {
      // If localStorage is unavailable, silently fall back to default
      console.warn("localStorage unavailable, using default theme");
      applyTheme(false);
    }
    setIsHydrated(true);
  }, [applyTheme]);

  const toggleBackgroundInversion = useCallback(() => {
    setTheme((prev) => {
      const newInverted = !prev.backgroundInverted;
      persistTheme(newInverted);
      applyTheme(newInverted);
      return { backgroundInverted: newInverted };
    });
  }, [applyTheme]);

  const setBackgroundInverted = useCallback((inverted: boolean) => {
    setTheme({ backgroundInverted: inverted });
    persistTheme(inverted);
    applyTheme(inverted);
  }, [applyTheme]);

  const persistTheme = (inverted: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, inverted.toString());
    } catch (error) {
      // If localStorage is unavailable, silently fail but keep in-memory state
      console.warn("Failed to persist theme preference to localStorage");
    }
  };

  const value: ThemeContextType = {
    backgroundInverted: theme.backgroundInverted,
    toggleBackgroundInversion,
    setBackgroundInverted,
  };

  // Only render context provider after hydration to avoid SSR issues
  if (!isHydrated) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
