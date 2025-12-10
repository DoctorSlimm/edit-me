/**
 * Theme inversion utilities and types
 */

export interface ApplicationThemeState {
  backgroundInverted: boolean;
}

export interface UserThemePreference {
  userId: string;
  backgroundInverted: boolean;
}

export const THEME_STORAGE_KEY = 'user:theme:backgroundInverted';

/**
 * Get the current theme preference from localStorage
 */
export function getThemePreference(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored ? JSON.parse(stored) : false;
  } catch (error) {
    console.warn('Failed to read theme preference from localStorage:', error);
    return false;
  }
}

/**
 * Set the theme preference in localStorage
 */
export function setThemePreference(inverted: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(inverted));
  } catch (error) {
    console.warn('Failed to save theme preference to localStorage:', error);
  }
}

/**
 * Apply the background inversion filter to the document root
 */
export function applyThemeInversion(inverted: boolean): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  if (inverted) {
    root.style.filter = 'invert(1)';
  } else {
    root.style.filter = '';
  }
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): boolean {
  const inverted = getThemePreference();
  applyThemeInversion(inverted);
  return inverted;
}
