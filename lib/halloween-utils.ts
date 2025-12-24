/**
 * Halloween Theme Utilities
 *
 * This module provides helper functions for managing the automatic
 * Halloween theme that activates October 1-31 and deactivates November 1st.
 */

/**
 * Check if the current date falls within the Halloween season (October)
 * @returns true if date is between October 1 and October 31, false otherwise
 */
export function isHalloweenSeason(): boolean {
  const now = new Date();
  const month = now.getMonth(); // 0-11, where 9 = October
  return month === 9; // October is month 9 (0-indexed)
}

/**
 * Get the Halloween active status as a boolean
 * Also checks localStorage for cached value to avoid re-computation
 * @returns true if Halloween theme should be active
 */
export function getHalloweenActiveStatus(): boolean {
  // Check localStorage for cached value
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('halloween:auto-active');
    if (cached !== null) {
      return cached === 'true';
    }
  }

  return isHalloweenSeason();
}

/**
 * Set the Halloween active status in localStorage
 * @param active - whether Halloween theme is active
 */
export function setHalloweenActiveStatus(active: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('halloween:auto-active', active ? 'true' : 'false');
  }
}

/**
 * Clear the Halloween active status from localStorage
 * Useful for testing or manual refresh
 */
export function clearHalloweenActiveStatus(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('halloween:auto-active');
  }
}

/**
 * Get days until the next Halloween season change
 * Returns positive number of days until next change (either to Halloween or from Halloween)
 * @returns number of days until next Halloween season change
 */
export function getDaysUntilHalloweenChange(): number {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  const currentYear = now.getFullYear();

  if (currentMonth === 9) {
    // Currently in October, calculate days until November 1st
    const halloweenEnd = new Date(currentYear, 10, 1); // November 1st
    const daysLeft = Math.ceil((halloweenEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  } else if (currentMonth < 9) {
    // Before October, calculate days until October 1st
    const halloweenStart = new Date(currentYear, 9, 1); // October 1st
    const daysUntil = Math.ceil((halloweenStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  } else {
    // After October, calculate days until next year's October 1st
    const nextYearHalloweenStart = new Date(currentYear + 1, 9, 1); // Next year October 1st
    const daysUntil = Math.ceil((nextYearHalloweenStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  }
}
