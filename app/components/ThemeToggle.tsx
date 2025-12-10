'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/providers/ThemeProvider';

export default function ThemeToggle() {
  const { backgroundInverted, toggleBackgroundInversion, isLoading } = useTheme();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      await toggleBackgroundInversion(e.target.checked);
    } catch (err) {
      setError('Failed to update theme preference');
      console.error('Theme toggle error:', err);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <label htmlFor="theme-toggle" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
          Background Inversion
        </label>
        <input
          id="theme-toggle"
          type="checkbox"
          checked={backgroundInverted}
          onChange={handleToggle}
          disabled={isLoading}
          className="w-4 h-4 cursor-pointer"
          aria-label="Toggle background inversion"
        />
      </div>
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
