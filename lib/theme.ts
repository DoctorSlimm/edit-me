/**
 * Theme management utilities
 * Handles dark mode toggling with localStorage persistence
 */

export interface ApplicationThemeState {
  mode: 'light' | 'dark';
}

export interface UserThemePreference {
  userId?: string;
  mode: 'light' | 'dark';
}

export const THEME_STORAGE_KEY = 'user:theme:mode';
export const BACKGROUND_INVERSION_KEY = 'user:theme:background-inverted';

/**
 * Get the current theme mode from localStorage
 * Defaults to 'light'
 */
export function getThemePreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored === 'dark' ? 'dark' : 'light');
  } catch (error) {
    console.warn('Failed to read theme preference from localStorage:', error);
    return 'light';
  }
}

/**
 * Set the theme mode in localStorage
 */
export function setThemePreference(mode: 'light' | 'dark'): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (error) {
    console.warn('Failed to save theme preference to localStorage:', error);
  }
}

/**
 * Get the background inversion preference from localStorage
 * Defaults to false
 */
export function getBackgroundInversionPreference(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const stored = localStorage.getItem(BACKGROUND_INVERSION_KEY);
    return stored === 'true';
  } catch (error) {
    console.warn('Failed to read background inversion preference from localStorage:', error);
    return false;
  }
}

/**
 * Set the background inversion preference in localStorage
 */
export function setBackgroundInversionPreference(inverted: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(BACKGROUND_INVERSION_KEY, inverted ? 'true' : 'false');
  } catch (error) {
    console.warn('Failed to save background inversion preference to localStorage:', error);
  }
}

/**
 * Apply the theme to the document root via data attribute
 */
export function applyTheme(mode: 'light' | 'dark'): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.setAttribute('data-theme', mode);

  // Also update the class for CSS media query compatibility
  if (mode === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): 'light' | 'dark' {
  const mode = getThemePreference();
  applyTheme(mode);
  return mode;
}

/**
 * Toggle theme between light and dark
 */
export function toggleTheme(): 'light' | 'dark' {
  const current = getThemePreference();
  const next = current === 'light' ? 'dark' : 'light';
  setThemePreference(next);
  applyTheme(next);
  return next;
}

/**
 * Apply background inversion filter via CSS
 */
export function applyThemeInversion(inverted: boolean): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  if (inverted) {
    root.style.filter = 'invert(1)';
  } else {
    root.style.filter = 'none';
  }
}
