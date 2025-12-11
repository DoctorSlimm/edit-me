'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/providers/ThemeProvider';

export default function ThemeToggle() {
  const { mode, toggleTheme, isLoading } = useTheme();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    try {
      setError(null);
      await toggleTheme();
    } catch (err) {
      setError('Failed to update theme preference');
      console.error('Theme toggle error:', err);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 50,
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '1rem',
        border: `1px solid var(--border-color)`,
        fontFamily: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <label
          htmlFor="theme-toggle"
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>{mode === 'light' ? '☀️' : '🌙'}</span>
          <span>{mode === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
        </label>
        <button
          id="theme-toggle"
          onClick={handleToggle}
          disabled={isLoading}
          aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          style={{
            width: '3rem',
            height: '1.5rem',
            backgroundColor: mode === 'dark' ? 'var(--color-primary)' : 'var(--border-color)',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            position: 'relative',
            transition: 'all 0.3s ease',
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '0.25rem',
              left: mode === 'dark' ? '1.5rem' : '0.25rem',
              width: '1rem',
              height: '1rem',
              backgroundColor: 'white',
              borderRadius: '50%',
              transition: 'left 0.3s ease',
            }}
          />
        </button>
      </div>
      {error && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-error)',
            marginTop: '0.5rem',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
