/**
 * Integration tests for Halloween theme functionality in ThemeProvider
 * Tests that the theme switches correctly during Halloween season
 */

import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/app/providers/ThemeProvider';
import * as halloweenUtils from '@/lib/halloween-utils';

// Mock the halloween-utils
jest.mock('@/lib/halloween-utils', () => ({
  isHalloweenSeason: jest.fn(),
  getHalloweenActiveStatus: jest.fn(),
  setHalloweenActiveStatus: jest.fn(),
  clearHalloweenActiveStatus: jest.fn(),
  getDaysUntilHalloweenChange: jest.fn(),
}));

// Mock the theme library
jest.mock('@/lib/theme', () => ({
  getThemePreference: jest.fn(() => 'light'),
  setThemePreference: jest.fn(),
  applyTheme: jest.fn(),
  applyThemeInversion: jest.fn(),
  getBackgroundInversionPreference: jest.fn(() => false),
  setBackgroundInversionPreference: jest.fn(),
}));

// Mock color-utils
jest.mock('@/lib/color-utils', () => ({
  fetchColorPalettes: jest.fn(),
  fetchColorPalette: jest.fn(),
  applyColorVariantsToDOM: jest.fn(),
}));

import { fetchColorPalettes, applyColorVariantsToDOM } from '@/lib/color-utils';

describe('ThemeProvider - Halloween Theme Integration', () => {
  const mockColorPalettes = [
    {
      id: 1,
      name: 'red-variants',
      description: 'Red palette',
      variants: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'green-variants',
      description: 'Green palette',
      variants: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'halloween-variants',
      description: 'Halloween palette',
      variants: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (fetchColorPalettes as jest.Mock).mockResolvedValue(mockColorPalettes);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should apply Halloween palette when isHalloweenSeason returns true', async () => {
    (halloweenUtils.isHalloweenSeason as jest.Mock).mockReturnValue(true);
    (halloweenUtils.setHalloweenActiveStatus as jest.Mock).mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.halloweenActive).toBe(true);
    });

    expect(applyColorVariantsToDOM).toHaveBeenCalledWith(mockColorPalettes[2]); // Halloween palette
  });

  it('should apply default palette when isHalloweenSeason returns false', async () => {
    (halloweenUtils.isHalloweenSeason as jest.Mock).mockReturnValue(false);
    (halloweenUtils.setHalloweenActiveStatus as jest.Mock).mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.halloweenActive).toBe(false);
    });

    expect(applyColorVariantsToDOM).toHaveBeenCalledWith(mockColorPalettes[0]); // Default palette
  });

  it('should have halloweenActive property in context', async () => {
    (halloweenUtils.isHalloweenSeason as jest.Mock).mockReturnValue(false);
    (halloweenUtils.setHalloweenActiveStatus as jest.Mock).mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current).toHaveProperty('halloweenActive');
    });

    expect(typeof result.current.halloweenActive).toBe('boolean');
  });

  it('should set Halloween palette ID 3 when in Halloween season', async () => {
    (halloweenUtils.isHalloweenSeason as jest.Mock).mockReturnValue(true);
    (halloweenUtils.setHalloweenActiveStatus as jest.Mock).mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeColorPalette?.id).toBe(3);
    });
  });

  it('should fall back to default palette if Halloween palette not found', async () => {
    (halloweenUtils.isHalloweenSeason as jest.Mock).mockReturnValue(true);
    (halloweenUtils.setHalloweenActiveStatus as jest.Mock).mockImplementation(() => {});

    const palettesMissingHalloween = [
      mockColorPalettes[0],
      mockColorPalettes[1],
    ];

    (fetchColorPalettes as jest.Mock).mockResolvedValue(palettesMissingHalloween);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeColorPalette?.id).toBe(1);
    });
  });

  it('should check Halloween status on a regular interval', async () => {
    (halloweenUtils.isHalloweenSeason as jest.Mock).mockReturnValue(false);
    (halloweenUtils.setHalloweenActiveStatus as jest.Mock).mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    renderHook(() => useTheme(), { wrapper });

    // Initial check
    await waitFor(() => {
      expect(halloweenUtils.isHalloweenSeason).toHaveBeenCalled();
    });

    const initialCallCount = (halloweenUtils.isHalloweenSeason as jest.Mock).mock.calls.length;

    // Fast-forward time by 60 seconds
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    // Should check again
    expect((halloweenUtils.isHalloweenSeason as jest.Mock).mock.calls.length).toBeGreaterThan(initialCallCount);
  });

  it('should load all palettes on initialization', async () => {
    (halloweenUtils.isHalloweenSeason as jest.Mock).mockReturnValue(false);
    (halloweenUtils.setHalloweenActiveStatus as jest.Mock).mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.colorPalettes.length).toBe(3);
    });

    expect(result.current.colorPalettes).toContainEqual(mockColorPalettes[2]);
  });
});
