'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { RetroButton } from './RetroButton';

/**
 * ColorPaletteSwitcher Component - 90s Retro Styled
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
      className="retro-panel"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        zIndex: 999,
        maxWidth: '280px',
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
        Color Palettes
      </div>

      <div style={{ padding: '8px' }}>
        {/* Palette Selection Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
          {colorPalettes.map((palette) => (
            <button
              key={palette.id}
              onClick={() => handlePaletteChange(palette.id)}
              disabled={colorsLoading}
              style={{
                padding: '6px 8px',
                textAlign: 'left',
                fontSize: '11px',
                fontFamily: 'var(--font-90s-sans)',
                fontWeight: activeColorPalette?.id === palette.id ? 'bold' : 'normal',
                backgroundColor: activeColorPalette?.id === palette.id ? '#0000FF' : 'var(--retro-light-gray)',
                color: activeColorPalette?.id === palette.id ? 'white' : 'black',
                border: '2px solid',
                borderColor: activeColorPalette?.id === palette.id
                  ? '#0000FF #FFFFFF #FFFFFF #0000FF'
                  : 'var(--retro-light-gray) var(--retro-black) var(--retro-black) var(--retro-light-gray)',
                boxShadow: activeColorPalette?.id === palette.id
                  ? 'inset 1px 1px 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 rgba(0, 0, 0, 0.8)'
                  : 'inset 1px 1px 0 rgba(255, 255, 255, 1), inset -1px -1px 0 rgba(128, 128, 128, 1)',
                cursor: colorsLoading ? 'not-allowed' : 'pointer',
                opacity: colorsLoading ? 0.6 : 1,
                transition: 'all 50ms',
              }}
              title={palette.description || ''}
            >
              <div style={{ marginBottom: palette.variants ? '4px' : '0' }}>
                🎨 {palette.name}
              </div>
              {palette.variants && (
                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                    flexWrap: 'wrap',
                  }}
                >
                  {palette.variants.slice(0, 4).map((variant) => (
                    <div
                      key={variant.id}
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: variant.hex_value,
                        border: '1px solid #000000',
                      }}
                      title={`${variant.name} - ${variant.hex_value}`}
                    />
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="retro-panel sunken"
            style={{
              marginTop: '8px',
              marginBottom: '0',
              padding: '4px',
              backgroundColor: '#FFE7E7',
              fontSize: '10px',
              color: '#EF4444',
              fontWeight: 'bold',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {colorsLoading && (
          <div
            style={{
              marginTop: '8px',
              textAlign: 'center',
              fontSize: '10px',
              color: '#666666',
              fontStyle: 'italic',
            }}
          >
            ⏳ Loading...
          </div>
        )}
      </div>
    </div>
  );
}
