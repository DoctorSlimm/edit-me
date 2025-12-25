'use client';

import dynamic from 'next/dynamic';

// Dynamic imports for client-side theme components
const ThemeToggle = dynamic(() => import('./components/ThemeToggle'), {
  ssr: false,
});

const ColorPaletteSwitcher = dynamic(
  () => import('./components/ColorPaletteSwitcher').then(mod => ({ default: mod.ColorPaletteSwitcher })),
  {
    ssr: false,
  }
);

/**
 * UIComponents - Client component wrapper for theme UI elements
 * Renders ThemeToggle and ColorPaletteSwitcher components
 */
export function UIComponents() {
  return (
    <>
      <ThemeToggle />
      <ColorPaletteSwitcher />
    </>
  );
}
