'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/providers/ThemeProvider';

/**
 * ColorPaletteSwitcher Component
 *
 * Allows users to switch between available color palettes
 * Displays all available color palettes and the currently active one
 * Supports dynamic color variant loading without page refresh
 */
export function ColorPaletteSwitcher() {
  const { colorPalettes, activeColorPalette, setActiveColorPalette, colorsLoading } = useTheme();
  const [error, setError] = useState<string | null>(null);

  const handlePaletteChange = async (paletteId: number) => {
    try {
      setError(null);
      await setActiveColorPalette(paletteId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change color palette';
      setError(message);
      console.error('Error changing palette:', err);
    }
  };

  if (colorPalettes.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: 'var(--background)',
        border: '2px solid var(--foreground)',
        borderRadius: '8px',
        padding: '16px',
        maxWidth: '250px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>Color Palettes</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {colorPalettes.map((palette) => (
          <button
            key={palette.id}
            onClick={() => handlePaletteChange(palette.id)}
            disabled={colorsLoading}
            style={{
              padding: '8px 12px',
              border:
                activeColorPalette?.id === palette.id
                  ? '2px solid var(--color-standard)'
                  : '1px solid var(--foreground)',
              backgroundColor:
                activeColorPalette?.id === palette.id
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'transparent',
              color: 'var(--foreground)',
              borderRadius: '4px',
              cursor: colorsLoading ? 'not-allowed' : 'pointer',
              opacity: colorsLoading ? 0.6 : 1,
              textAlign: 'left',
              fontSize: '14px',
            }}
            title={palette.description || ''}
          >
            <div style={{ fontWeight: activeColorPalette?.id === palette.id ? 'bold' : 'normal' }}>
              {palette.name}
            </div>
            {palette.variants && (
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginTop: '4px',
                }}
              >
                {palette.variants.slice(0, 3).map((variant) => (
                  <div
                    key={variant.id}
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: variant.hex_value,
                      borderRadius: '3px',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                    }}
                    title={`${variant.name} - ${variant.tonal_level}`}
                  />
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: 'var(--color-error-state)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            maxHeight: '60px',
            overflow: 'auto',
          }}
        >
          {error}
        </div>
      )}

      {colorsLoading && (
        <div
          style={{
            marginTop: '12px',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--foreground)',
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
}
