/**
 * Test Suite for ThemeProvider Integration
 *
 * Tests:
 * - Theme mode persistence (localStorage)
 * - Background inversion persistence
 * - Color palette loading and application
 * - Theme toggle functionality
 * - API sync with fallback
 * - Halloween theme activation
 * - Loading states
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/app/providers/ThemeProvider';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that uses the theme context
function TestComponent() {
  const {
    mode,
    toggleTheme,
    backgroundInverted,
    toggleBackgroundInversion,
    colorPalettes,
    activeColorPalette,
    setActiveColorPalette,
    halloweenActive,
    isLoading,
    colorsLoading,
  } = useTheme();

  return (
    <div>
      <div data-testid="theme-mode">{mode}</div>
      <div data-testid="background-inverted">{backgroundInverted ? 'true' : 'false'}</div>
      <div data-testid="halloween-active">{halloweenActive ? 'true' : 'false'}</div>
      <div data-testid="is-loading">{isLoading ? 'true' : 'false'}</div>
      <div data-testid="colors-loading">{colorsLoading ? 'true' : 'false'}</div>
      <div data-testid="active-palette">{activeColorPalette?.name || 'none'}</div>
      <div data-testid="palette-count">{colorPalettes.length}</div>

      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button
        data-testid="toggle-background"
        onClick={() => toggleBackgroundInversion(!backgroundInverted)}
      >
        Toggle Background
      </button>
      {colorPalettes.length > 0 && (
        <button
          data-testid="set-palette"
          onClick={() => setActiveColorPalette(colorPalettes[0].id)}
        >
          Set Palette
        </button>
      )}
    </div>
  );
}

describe('ThemeProvider Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('Theme Mode Persistence', () => {
    test('should load light mode by default', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ palettes: [] }),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      });
    });

    test('should load saved theme from localStorage', async () => {
      localStorage.setItem('user:theme:mode', 'dark');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ palettes: [] }),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      });
    });

    test('should persist theme changes to localStorage', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ palettes: [] }),
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = await screen.findByTestId('toggle-theme');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(localStorage.getItem('user:theme:mode')).toBe('dark');
      });
    });
  });

  describe('Background Inversion Persistence', () => {
    test('should load background inversion from localStorage', async () => {
      localStorage.setItem('user:theme:background-inverted', 'true');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ palettes: [] }),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('background-inverted')).toHaveTextContent('true');
      });
    });

    test('should persist background inversion changes', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ palettes: [] }),
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = await screen.findByTestId('toggle-background');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(localStorage.getItem('user:theme:background-inverted')).toBe('true');
      });
    });
  });

  describe('Color Palette Loading', () => {
    test('should load color palettes from API', async () => {
      const mockPalettes = [
        {
          id: 1,
          name: 'Red Palette',
          variants: [
            { id: 1, palette_id: 1, name: 'red', tonal_level: 'light', hex_value: '#FFC5C5', created_at: '', updated_at: '' },
          ],
          created_at: '',
          updated_at: '',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ palettes: mockPalettes }),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('palette-count')).toHaveTextContent('1');
      });
    });

    test('should handle API failure gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('palette-count')).toHaveTextContent('0');
      });
    });
  });

  describe('API Sync', () => {
    test('should call API when theme is toggled', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ palettes: [] }),
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = await screen.findByTestId('toggle-theme');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/theme-preference',
          expect.objectContaining({
            method: 'PUT',
            body: expect.stringContaining('dark'),
          })
        );
      });
    });

    test('should continue when API sync fails (graceful fallback)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ palettes: [] }),
      });

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = await screen.findByTestId('toggle-theme');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        // Theme should still change even if API fails
        expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      });
    });
  });

  describe('Loading States', () => {
    test('should show loading state initially', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ palettes: [] }),
        }), 100))
      );

      const { rerender } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should show loading state
      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
    });

    test('should show colors loading state during palette fetch', async () => {
      const mockPalettes = [
        {
          id: 1,
          name: 'Red Palette',
          variants: [],
          created_at: '',
          updated_at: '',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ palettes: mockPalettes }),
      });

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({}),
        }), 50))
      );

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const setPaletteButton = await screen.findByTestId('set-palette');
      fireEvent.click(setPaletteButton);

      await waitFor(() => {
        expect(screen.getByTestId('colors-loading')).toHaveTextContent('false');
      });
    });
  });

  describe('Halloween Theme', () => {
    test('should detect if Halloween season is active', async () => {
      // Mock the date as October 31st
      const mockDate = new Date('2024-10-31');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ palettes: [] }),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('halloween-active')).toHaveTextContent('true');
      });

      jest.useRealTimers();
    });

    test('should not activate Halloween in non-October months', async () => {
      // Mock the date as December 25th
      const mockDate = new Date('2024-12-25');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ palettes: [] }),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('halloween-active')).toHaveTextContent('false');
      });

      jest.useRealTimers();
    });
  });

  describe('useTheme Hook', () => {
    test('should provide theme context through hook', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ palettes: [] }),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme-mode')).toBeInTheDocument();
      });
    });
  });
});
