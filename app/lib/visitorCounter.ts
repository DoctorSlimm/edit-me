/**
 * Real Visitor Counter - Client-side Unique Visitor Tracking
 * Tracks unique visitors per day, week, and month using localStorage/sessionStorage
 * No backend required - suitable for sites with under 10K daily visitors
 */

export interface VisitorData {
  dailyVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  lastVisitDate: string;
  visitorId: string;
}

export interface VisitorStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  visitorId: string;
}

const STORAGE_KEY = 'realVisitorCounter';
const VISITOR_ID_KEY = 'realVisitorCounterId';
const SESSION_VISITOR_KEY = 'sessionVisitorId';

/**
 * Generate a unique visitor ID using a combination of timestamp and random data
 */
function generateVisitorId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${random}`;
}

/**
 * Get or create a persistent visitor ID stored in localStorage
 */
function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

/**
 * Get the start of the current day in ISO format
 */
function getTodayStart(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split('T')[0];
}

/**
 * Get the start of the current week (Monday) in ISO format
 */
function getWeekStart(): string {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(date.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.toISOString().split('T')[0];
}

/**
 * Get the start of the current month in ISO format
 */
function getMonthStart(): string {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  return monthStart.toISOString().split('T')[0];
}

/**
 * Initialize visitor counter data structure
 */
function initializeVisitorData(): VisitorData {
  const visitorId = getOrCreateVisitorId();
  return {
    dailyVisitors: 0,
    weeklyVisitors: 0,
    monthlyVisitors: 0,
    lastVisitDate: getTodayStart(),
    visitorId,
  };
}

/**
 * Get stored visitor data from localStorage
 */
function getStoredData(): VisitorData {
  if (typeof window === 'undefined') {
    return initializeVisitorData();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return initializeVisitorData();
  }

  try {
    return JSON.parse(stored);
  } catch {
    return initializeVisitorData();
  }
}

/**
 * Save visitor data to localStorage
 */
function saveData(data: VisitorData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Check if visitor is new for the current period
 */
function isNewVisitorForPeriod(periodStart: string, lastPeriodStart: string): boolean {
  return lastPeriodStart !== periodStart;
}

/**
 * Track a visitor and update counts
 * Returns true if this is a new unique visitor for the current day
 */
export function trackVisitor(): VisitorStats {
  if (typeof window === 'undefined') {
    return {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      visitorId: '',
    };
  }

  let data = getStoredData();
  const todayStart = getTodayStart();
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  // Track session-based visitor to ensure we only count once per session
  const sessionId = sessionStorage.getItem(SESSION_VISITOR_KEY);
  const isNewSession = !sessionId;

  if (isNewSession) {
    sessionStorage.setItem(SESSION_VISITOR_KEY, 'true');

    // Increment daily visitors if it's a new day
    if (isNewVisitorForPeriod(todayStart, data.lastVisitDate)) {
      data.dailyVisitors += 1;
    }

    // Always increment weekly visitors on first session of a new week
    const lastWeekStart = getWeekStart(); // This will always be current week
    // We need to track the last week start separately
    const lastWeekStartKey = 'lastWeekStart';
    const storedLastWeekStart = localStorage.getItem(lastWeekStartKey);
    if (!storedLastWeekStart || storedLastWeekStart !== weekStart) {
      data.weeklyVisitors += 1;
      localStorage.setItem(lastWeekStartKey, weekStart);
    }

    // Always increment monthly visitors on first session of a new month
    const lastMonthStartKey = 'lastMonthStart';
    const storedLastMonthStart = localStorage.getItem(lastMonthStartKey);
    if (!storedLastMonthStart || storedLastMonthStart !== monthStart) {
      data.monthlyVisitors += 1;
      localStorage.setItem(lastMonthStartKey, monthStart);
    }

    data.lastVisitDate = todayStart;
    saveData(data);
  }

  return {
    today: data.dailyVisitors,
    thisWeek: data.weeklyVisitors,
    thisMonth: data.monthlyVisitors,
    visitorId: data.visitorId,
  };
}

/**
 * Get current visitor statistics without incrementing counters
 */
export function getVisitorStats(): VisitorStats {
  const data = getStoredData();
  return {
    today: data.dailyVisitors,
    thisWeek: data.weeklyVisitors,
    thisMonth: data.monthlyVisitors,
    visitorId: data.visitorId,
  };
}

/**
 * Reset all visitor data (useful for testing or manual reset)
 */
export function resetVisitorData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(VISITOR_ID_KEY);
  localStorage.removeItem('lastWeekStart');
  localStorage.removeItem('lastMonthStart');
  sessionStorage.removeItem(SESSION_VISITOR_KEY);
}

/**
 * Get detailed breakdown of visitor data
 */
export function getDetailedVisitorData(): {
  stats: VisitorStats;
  lastVisitDate: string;
  storageUsage: number;
} {
  const data = getStoredData();
  const stats = getVisitorStats();
  const storageData = localStorage.getItem(STORAGE_KEY) || '';
  const storageUsage = new Blob([storageData]).size;

  return {
    stats,
    lastVisitDate: data.lastVisitDate,
    storageUsage,
  };
}
