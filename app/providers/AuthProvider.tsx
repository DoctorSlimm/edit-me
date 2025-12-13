'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterRequest } from '@/lib/auth/types';

const AUTH_TOKEN_KEY = 'auth:accessToken';
const REFRESH_TOKEN_KEY = 'auth:refreshToken';

const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  accessToken: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshToken: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    // Mark as mounted on client-side only
    setIsMounted(true);

    const initializeAuth = async () => {
      try {
        // Check for existing session
        const storedToken = typeof window !== 'undefined'
          ? localStorage.getItem(AUTH_TOKEN_KEY)
          : null;

        if (storedToken) {
          // Try to fetch current user info with stored token
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setAccessToken(storedToken);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            if (typeof window !== 'undefined') {
              localStorage.removeItem(AUTH_TOKEN_KEY);
              localStorage.removeItem(REFRESH_TOKEN_KEY);
            }
            setUser(null);
            setAccessToken(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        setUser(null);
        setAccessToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const { user: userData, accessToken: token, refreshToken } = data;

      // Store tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      setUser(userData);
      setAccessToken(token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const responseData = await response.json();
      const { user: userData, accessToken: token, refreshToken } = responseData;

      // Store tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      setUser(userData);
      setAccessToken(token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }).catch(() => {
        // Ignore errors from logout endpoint
      });

      // Clear local state
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }

      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const storedRefreshToken = typeof window !== 'undefined'
        ? localStorage.getItem(REFRESH_TOKEN_KEY)
        : null;

      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!response.ok) {
        // Refresh failed, clear auth state
        if (typeof window !== 'undefined') {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
        setUser(null);
        setAccessToken(null);
        setIsAuthenticated(false);
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const { accessToken: newToken, refreshToken: newRefreshToken } = data;

      // Store new tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
        if (newRefreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }
      }

      setAccessToken(newToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  };

  // Only render auth context on client-side to avoid hydration issues during static generation
  if (!isMounted) {
    return <>{children}</>;
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    accessToken,
    login,
    register,
    logout,
    refreshToken: refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
