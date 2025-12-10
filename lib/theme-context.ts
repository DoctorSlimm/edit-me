import { createContext } from "react";

export interface ApplicationThemeState {
  backgroundInverted: boolean;
}

export interface ThemeContextType extends ApplicationThemeState {
  toggleBackgroundInversion: () => void;
  setBackgroundInverted: (inverted: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
