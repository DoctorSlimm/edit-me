'use client';

import { useEffect, useState } from 'react';
import { trackVisitor, getVisitorStats, VisitorStats } from '@/app/lib/visitorCounter';

export default function VisitorCounter() {
  const [stats, setStats] = useState<VisitorStats>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    visitorId: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Track visitor on component mount
    const visitorStats = trackVisitor();
    setStats(visitorStats);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-black p-4 border-2 border-red-400 mb-4">
        <p className="text-red-400 text-center text-xl font-bold mb-2">
          🎅 VISITOR COUNTER 🎅
        </p>
        <div className="flex justify-center gap-2">
          {[0, 0, 0, 0].map((num, i) => (
            <div key={i} className="bg-red-600 border-2 border-yellow-300 px-4 py-2 text-3xl text-yellow-300 font-bold">
              {num}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Format number to 4 digits with leading zeros
  const formatNumber = (num: number) => {
    return String(Math.min(num, 9999)).padStart(4, '0');
  };

  const displayDigits = formatNumber(stats.today).split('');

  return (
    <div className="bg-red-800 border-4 border-yellow-300 p-6 mb-8 max-w-2xl w-full">
      <div className="bg-black p-4 border-2 border-red-400 mb-4">
        <p className="text-red-400 text-center text-xl font-bold mb-2">
          🎅 VISITOR COUNTER 🎅
        </p>
        <div className="flex justify-center gap-2">
          {displayDigits.map((digit, i) => (
            <div
              key={i}
              className="bg-red-600 border-2 border-yellow-300 px-4 py-2 text-3xl text-yellow-300 font-bold font-mono transition-all duration-300"
            >
              {digit}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-yellow-300 space-y-2">
        <p className="text-xl">🔔 Ho Ho Ho! 🔔</p>
        <p className="text-lg">You are visitor #{stats.today}!</p>
        <div className="mt-4 pt-4 border-t border-yellow-300 border-opacity-50 space-y-1 text-sm">
          <p>📅 Today: <span className="font-bold">{stats.today}</span></p>
          <p>📆 This Week: <span className="font-bold">{stats.thisWeek}</span></p>
          <p>🗓️ This Month: <span className="font-bold">{stats.thisMonth}</span></p>
        </div>
      </div>
    </div>
  );
}
