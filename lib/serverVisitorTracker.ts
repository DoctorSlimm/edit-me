/**
 * Server-side Visitor Counter - Tracks total page views via API
 * Each page load increments the counter by 1 in the database
 * No unique visitor deduplication - counts every page load
 */

export interface TrackVisitorResponse {
  success: boolean;
  count: number;
  pageIdentifier: string;
  timestamp: string;
  error?: string;
}

export interface GetCountResponse {
  success: boolean;
  count: number;
  pageIdentifier: string;
  timestamp: string;
  error?: string;
}

/**
 * Track a page view on the server
 * Calls POST /api/visitors/track to increment the counter
 */
export async function trackPageView(pageIdentifier: string = 'homepage'): Promise<TrackVisitorResponse> {
  try {
    const response = await fetch('/api/visitors/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pageIdentifier,
        timestamp: new Date().toISOString(),
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as TrackVisitorResponse;
  } catch (error) {
    console.error('Error tracking page view:', error);
    return {
      success: false,
      count: 0,
      pageIdentifier,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get current visitor count from the server
 * Calls GET /api/visitors/count to retrieve the counter
 */
export async function getVisitorCount(pageIdentifier: string = 'homepage'): Promise<GetCountResponse> {
  try {
    const response = await fetch(`/api/visitors/count?pageIdentifier=${encodeURIComponent(pageIdentifier)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as GetCountResponse;
  } catch (error) {
    console.error('Error getting visitor count:', error);
    return {
      success: false,
      count: 0,
      pageIdentifier,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Initialize page tracking - call this on page load
 * Automatically tracks the page view and returns the updated count
 */
export async function initializePageTracking(pageIdentifier: string = 'homepage'): Promise<number> {
  // Track the page view
  const trackResponse = await trackPageView(pageIdentifier);

  if (trackResponse.success) {
    return trackResponse.count;
  }

  // If tracking failed, try to get the current count
  const countResponse = await getVisitorCount(pageIdentifier);
  return countResponse.success ? countResponse.count : 0;
}
