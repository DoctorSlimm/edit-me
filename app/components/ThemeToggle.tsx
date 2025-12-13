'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { RetroButton } from './RetroButton';

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
      className="retro-panel"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 50,
        minWidth: '200px',
        fontFamily: 'var(--font-90s-sans)',
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          background: 'linear-gradient(90deg, #000080 0%, #1084d7 100%)',
          color: 'white',
          padding: '2px 4px',
          marginBottom: '0.5rem',
          fontSize: '11px',
          fontWeight: 'bold',
          marginTop: '-4px',
          marginLeft: '-4px',
          marginRight: '-4px',
        }}
      >
        Theme Settings
      </div>

      <div style={{ padding: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <label
            htmlFor="theme-toggle"
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#000000',
              cursor: 'pointer',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>{mode === 'light' ? '☀️' : '🌙'}</span>
            <span>{mode === 'light' ? 'Light' : 'Dark'}</span>
          </label>
        </div>

        <RetroButton
          id="theme-toggle"
          onClick={handleToggle}
          disabled={isLoading}
          aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          style={{ width: '100%' }}
        >
          {isLoading ? 'Switching...' : 'Toggle Theme'}
        </RetroButton>

        {error && (
          <p
            style={{
              fontSize: '10px',
              color: '#EF4444',
              marginTop: '0.5rem',
              marginBottom: '0',
            }}
          >
            ⚠️ {error}
          </p>
        )}
      </div>
    </div>
  );
}
