'use client';

import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

/**
 * Protected Route Component
 * Wraps components that require authentication
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
