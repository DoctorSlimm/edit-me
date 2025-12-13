'use client';

import React from 'react';

interface RetroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/**
 * RetroButton - 90s styled button component with beveled 3D effect
 * Features:
 * - MS Sans Serif typography
 * - Beveled inset box-shadow (light top/left, dark bottom/right)
 * - Color variants (default, primary/blue, success/green, danger/red)
 * - Pressed state with inverted bevels
 * - Disabled state with reduced opacity
 */
export function RetroButton({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}: RetroButtonProps) {
  const baseClass = 'retro-button';
  const variantClass = variant !== 'default' ? variant : '';
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-lg px-4 py-2' : '';

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default RetroButton;
