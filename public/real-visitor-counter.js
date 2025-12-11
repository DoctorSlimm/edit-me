/**
 * Real Visitor Counter - Embeddable Widget Script
 * Tracks unique visitors per day, week, and month using client-side storage
 * Usage: <script src="https://your-domain.com/real-visitor-counter.js"></script>
 * Then add container: <div id="real-visitor-counter"></div>
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'realVisitorCounter';
  const VISITOR_ID_KEY = 'realVisitorCounterId';
  const SESSION_VISITOR_KEY = 'sessionVisitorId';
  const CONFIG_KEY = 'realVisitorCounterConfig';

  /**
   * Generate a unique visitor ID
   */
  function generateVisitorId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return timestamp + '_' + random;
  }

  /**
   * Get or create persistent visitor ID
   */
  function getOrCreateVisitorId() {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
  }

  /**
   * Get today's date in ISO format
   */
  function getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  }

  /**
   * Get this week's start date (Monday)
   */
  function getWeekStart() {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(date.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString().split('T')[0];
  }

  /**
   * Get this month's start date
   */
  function getMonthStart() {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return monthStart.toISOString().split('T')[0];
  }

  /**
   * Initialize visitor data structure
   */
  function initializeVisitorData() {
    const visitorId = getOrCreateVisitorId();
    return {
      dailyVisitors: 0,
      weeklyVisitors: 0,
      monthlyVisitors: 0,
      lastVisitDate: getTodayStart(),
      visitorId: visitorId,
    };
  }

  /**
   * Get stored visitor data
   */
  function getStoredData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return initializeVisitorData();
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      return initializeVisitorData();
    }
  }

  /**
   * Save visitor data
   */
  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Track visitor and update counts
   */
  function trackVisitor() {
    let data = getStoredData();
    const todayStart = getTodayStart();
    const weekStart = getWeekStart();
    const monthStart = getMonthStart();

    const sessionId = sessionStorage.getItem(SESSION_VISITOR_KEY);
    const isNewSession = !sessionId;

    if (isNewSession) {
      sessionStorage.setItem(SESSION_VISITOR_KEY, 'true');

      if (data.lastVisitDate !== todayStart) {
        data.dailyVisitors += 1;
      }

      const lastWeekStartKey = 'lastWeekStart';
      const storedLastWeekStart = localStorage.getItem(lastWeekStartKey);
      if (!storedLastWeekStart || storedLastWeekStart !== weekStart) {
        data.weeklyVisitors += 1;
        localStorage.setItem(lastWeekStartKey, weekStart);
      }

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
   * Create and inject widget HTML
   */
  function createWidget(stats, config) {
    const container = document.getElementById(config.containerId);
    if (!container) {
      console.warn('[Real Visitor Counter] Container element not found: #' + config.containerId);
      return;
    }

    const displayNumber = String(Math.min(stats.today, 9999)).padStart(4, '0');
    const digits = displayNumber.split('');

    let html = '';
    html += '<div id="real-visitor-counter-widget" style="' + config.style + '">';
    html += '  <div style="' + config.counterStyle + '">';
    html += '    <div style="' + config.labelStyle + '">';
    html += '      Visitor #' + stats.today;
    html += '    </div>';
    html += '    <div style="' + config.digitsContainerStyle + '">';

    digits.forEach(function(digit) {
      html += '      <span style="' + config.digitStyle + '">' + digit + '</span>';
    });

    html += '    </div>';
    html += '    <div style="' + config.statsStyle + '">';
    html += '      <span style="' + config.statItemStyle + '">Today: ' + stats.today + '</span>';
    html += '      <span style="' + config.statItemStyle + '">Week: ' + stats.thisWeek + '</span>';
    html += '      <span style="' + config.statItemStyle + '">Month: ' + stats.thisMonth + '</span>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    container.innerHTML = html;
  }

  /**
   * Get configuration from data attributes or defaults
   */
  function getConfig() {
    const script = document.currentScript || document.scripts[document.scripts.length - 1];
    const config = {
      containerId: script.getAttribute('data-container') || 'real-visitor-counter',
      style: script.getAttribute('data-style') || 'font-family: monospace; padding: 1rem;',
      counterStyle: script.getAttribute('data-counter-style') || 'background: #f0f0f0; border: 2px solid #333; padding: 1rem; text-align: center;',
      labelStyle: script.getAttribute('data-label-style') || 'font-size: 0.9rem; margin-bottom: 0.5rem; color: #666;',
      digitsContainerStyle: script.getAttribute('data-digits-container-style') || 'display: flex; gap: 0.25rem; justify-content: center; margin-bottom: 0.5rem;',
      digitStyle: script.getAttribute('data-digit-style') || 'background: #333; color: #0f0; font-size: 1.5rem; padding: 0.5rem; min-width: 2.5rem; font-weight: bold;',
      statsStyle: script.getAttribute('data-stats-style') || 'font-size: 0.8rem; display: flex; gap: 1rem; justify-content: center; color: #666;',
      statItemStyle: script.getAttribute('data-stat-item-style') || 'padding: 0 0.5rem;',
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    return config;
  }

  /**
   * Initialize and render the widget
   */
  function init() {
    try {
      const stats = trackVisitor();
      const config = getConfig();
      createWidget(stats, config);
    } catch (error) {
      console.error('[Real Visitor Counter] Error initializing widget:', error);
    }
  }

  /**
   * Run initialization when DOM is ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /**
   * Public API
   */
  window.RealVisitorCounter = {
    getStats: function() {
      return getStoredData();
    },
    reset: function() {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(VISITOR_ID_KEY);
      localStorage.removeItem('lastWeekStart');
      localStorage.removeItem('lastMonthStart');
      sessionStorage.removeItem(SESSION_VISITOR_KEY);
    },
    reinitialize: function() {
      init();
    }
  };
})();
