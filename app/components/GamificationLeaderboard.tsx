'use client';

/**
 * GamificationLeaderboard Component
 * Display top users ranked by points
 */

import React, { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '@/lib/gamification/types';

interface GamificationLeaderboardProps {
  period?: 'weekly' | 'alltime';
  limit?: number;
  showRank?: boolean;
}

export function GamificationLeaderboard({
  period = 'alltime',
  limit = 50,
  showRank = true,
}: GamificationLeaderboardProps) {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/gamification/leaderboard?period=${period}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }

        const data = await response.json();
        setRankings(data.rankings || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period, limit]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        No rankings available yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-300">
            {showRank && <th className="text-left py-3 px-4 font-bold">#</th>}
            <th className="text-left py-3 px-4 font-bold">Player</th>
            <th className="text-right py-3 px-4 font-bold">Points</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((entry, index) => (
            <tr
              key={entry.userId}
              className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                index === 0 ? 'bg-yellow-50' : index === 1 ? 'bg-gray-50' : ''
              }`}
            >
              {showRank && (
                <td className="py-3 px-4 font-bold text-gray-700">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && entry.rank}
                </td>
              )}
              <td className="py-3 px-4">
                <div className="font-semibold text-gray-900">
                  {entry.username}
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 px-3 py-1 rounded-full font-semibold">
                  ⭐ {entry.pointsBalance.toLocaleString()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
