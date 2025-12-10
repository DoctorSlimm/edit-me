"use client";

import { useContext } from "react";
import { ThemeContext, ThemeContextType } from "./theme-context";

// Default context value for SSR/build time
const defaultContextValue: ThemeContextType = {
  backgroundInverted: false,
  toggleBackgroundInversion: () => {},
  setBackgroundInverted: () => {},
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  // Return default value if context is undefined (during SSR/build)
  if (context === undefined) {
    return defaultContextValue;
  }
  return context;
}
