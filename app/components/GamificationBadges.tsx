'use client';

/**
 * GamificationBadges Component
 * Display earned badges for the current user
 */

import React, { useEffect, useState } from 'react';
import { BADGES } from '@/lib/gamification/types';

interface GamificationBadgesProps {
  badges?: string[];
  size?: 'sm' | 'md' | 'lg';
  showNames?: boolean;
}

export function GamificationBadges({
  badges = [],
  size = 'md',
  showNames = true,
}: GamificationBadgesProps) {
  const sizeClasses = {
    sm: 'text-lg w-8 h-8',
    md: 'text-3xl w-10 h-10',
    lg: 'text-5xl w-14 h-14',
  };

  const badgeNameSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (!badges || badges.length === 0) {
    return (
      <div className="text-gray-400 text-sm">
        No badges earned yet. Keep earning points!
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {badges.map((badgeId) => {
        const badge = BADGES[badgeId];
        if (!badge) return null;

        return (
          <div
            key={badgeId}
            className="flex flex-col items-center gap-1"
            title={badge.description}
          >
            <div
              className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-full border-2 border-yellow-300 shadow-md hover:shadow-lg transition-shadow`}
            >
              {badge.icon}
            </div>
            {showNames && (
              <p className={`${badgeNameSizeClasses[size]} font-semibold text-center whitespace-nowrap`}>
                {badge.name}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
