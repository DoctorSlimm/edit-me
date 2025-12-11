'use client';

import { useEffect, useState } from 'react';
import { trackPageView, getVisitorCount, TrackVisitorResponse } from '@/lib/serverVisitorTracker';

export default function ServerVisitorCounter() {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trackAndDisplay = async () => {
      try {
        // Track the page view
        const response: TrackVisitorResponse = await trackPageView('homepage');

        if (response.success) {
          setVisitorCount(response.count);
        } else {
          setError(response.error || 'Failed to track visitor');
          // Try to get current count even if tracking failed
          const countResponse = await getVisitorCount('homepage');
          if (countResponse.success) {
            setVisitorCount(countResponse.count);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error in ServerVisitorCounter:', err);
      } finally {
        setIsLoading(false);
      }
    };

    trackAndDisplay();
  }, []);

  const formatNumber = (num: number) => {
    return String(Math.min(num, 9999)).padStart(4, '0');
  };

  const displayDigits = formatNumber(visitorCount).split('');

  if (isLoading) {
    return (
      <div className="bg-red-800 border-4 border-yellow-300 p-6 mb-8 max-w-2xl w-full">
        <div className="bg-black p-4 border-2 border-red-400 mb-4">
          <p className="text-red-400 text-center text-xl font-bold mb-2">
            🎅 TOTAL VISITORS 🎅
          </p>
          <div className="flex justify-center gap-2">
            {[0, 0, 0, 0].map((num, i) => (
              <div
                key={i}
                className="bg-red-600 border-2 border-yellow-300 px-4 py-2 text-3xl text-yellow-300 font-bold font-mono"
              >
                0
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-yellow-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-green-800 border-4 border-yellow-300 p-6 mb-8 max-w-2xl w-full">
      <div className="bg-black p-4 border-2 border-green-400 mb-4">
        <p className="text-green-400 text-center text-xl font-bold mb-2">
          ✨ TOTAL PAGE VIEWS ✨
        </p>
        <div className="flex justify-center gap-2">
          {displayDigits.map((digit, i) => (
            <div
              key={i}
              className="bg-green-600 border-2 border-yellow-300 px-4 py-2 text-3xl text-yellow-300 font-bold font-mono transition-all duration-300"
            >
              {digit}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-yellow-300 space-y-2">
        <p className="text-xl">🎄 Server-Side Counter 🎄</p>
        <p className="text-lg">Total page views: <span className="font-bold">{visitorCount}</span></p>
        {error && (
          <p className="text-red-300 text-sm mt-2">⚠️ {error}</p>
        )}
        <div className="mt-4 pt-4 border-t border-yellow-300 border-opacity-50 text-sm">
          <p>Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}
