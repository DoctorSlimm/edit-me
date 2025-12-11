'use client';

/**
 * GamificationPoints Component
 * Display user's current points and rank
 */

import React, { useEffect, useState } from 'react';

interface UserProfile {
  points_balance: number;
  points_lifetime: number;
  badges: string[];
  rank: number;
  last_update: string;
}

interface GamificationPointsProps {
  refreshInterval?: number;
}

export function GamificationPoints({
  refreshInterval = 30000, // 30 seconds
}: GamificationPointsProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/gamification/user/profile');

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          setProfile(null);
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    // Set up auto-refresh
    if (refreshInterval > 0) {
      const interval = setInterval(fetchProfile, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  if (!profile) {
    return null;
  }

  if (loading && !profile) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-pulse h-5 w-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Points Display */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
        <div className="text-3xl">⭐</div>
        <div className="flex-1">
          <div className="text-sm text-gray-600">Points</div>
          <div className="text-2xl font-bold text-blue-900">
            {profile.points_balance.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            Lifetime: {profile.points_lifetime.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Rank Display */}
      {profile.rank > 0 && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="text-3xl">📈</div>
          <div className="flex-1">
            <div className="text-sm text-gray-600">Leaderboard Rank</div>
            <div className="text-2xl font-bold text-purple-900">
              #{profile.rank}
            </div>
          </div>
        </div>
      )}

      {/* Badges Count */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
        <div className="text-3xl">🏆</div>
        <div className="flex-1">
          <div className="text-sm text-gray-600">Badges Earned</div>
          <div className="text-2xl font-bold text-yellow-900">
            {profile.badges.length}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
