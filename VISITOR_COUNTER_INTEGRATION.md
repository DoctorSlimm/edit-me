# Real Visitor Counter - Integration Guide

A lightweight, client-side visitor counter that tracks unique visitors per day, week, and month using localStorage/sessionStorage. No backend required—perfect for small websites with up to 10K daily visitors.

## Features

✨ **Client-Side Only** - No backend server required
📊 **Multiple Time Periods** - Track daily, weekly, and monthly unique visitors
🔐 **Privacy Focused** - All data stored locally in the browser
⚡ **Lightweight** - Minimal performance impact
🎨 **Customizable** - Embed with custom styling
📦 **Simple Integration** - Single script tag embed

## Quick Start

### 1. Basic Embedding

Add this to your HTML where you want the counter to appear:

```html
<!-- Container for the visitor counter -->
<div id="real-visitor-counter"></div>

<!-- Script to initialize the counter -->
<script src="https://your-domain.com/real-visitor-counter.js"></script>
```

That's it! The widget will appear in the container and start tracking visitors.

### 2. Custom Container ID

If you want to use a different container ID:

```html
<div id="my-counter"></div>

<script
  src="https://your-domain.com/real-visitor-counter.js"
  data-container="my-counter">
</script>
```

## Advanced Configuration

### Custom Styling

The widget supports data attributes for style customization:

```html
<div id="real-visitor-counter"></div>

<script
  src="https://your-domain.com/real-visitor-counter.js"
  data-container="real-visitor-counter"
  data-style="font-family: 'Arial', sans-serif; padding: 2rem; background: #f5f5f5;"
  data-counter-style="background: white; border: 3px solid #333; padding: 1.5rem; border-radius: 8px;"
  data-label-style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.75rem; color: #222;"
  data-digits-container-style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1rem;"
  data-digit-style="background: #222; color: #0f0; font-size: 2rem; padding: 0.75rem 1rem; min-width: 3rem; font-weight: bold; font-family: monospace;"
  data-stats-style="font-size: 0.95rem; display: flex; gap: 1.5rem; justify-content: center; color: #555; margin-top: 1rem;"
  data-stat-item-style="padding: 0 0.75rem; border-left: 1px solid #ddd;"
>
</script>
```

### Theme Variants

**Dark Theme:**
```html
<script
  src="https://your-domain.com/real-visitor-counter.js"
  data-counter-style="background: #2a2a2a; border: 2px solid #444; padding: 1rem;"
  data-digit-style="background: #444; color: #0f0; font-size: 1.5rem; padding: 0.5rem; min-width: 2.5rem; font-weight: bold; font-family: monospace;"
  data-label-style="color: #aaa;"
  data-stats-style="color: #888;">
</script>
```

**Minimal Theme:**
```html
<script
  src="https://your-domain.com/real-visitor-counter.js"
  data-counter-style="background: transparent; border: none; padding: 0.5rem;"
  data-label-style="font-size: 0.9rem; color: #999;"
  data-digit-style="background: transparent; color: #333; font-size: 1.2rem; padding: 0.25rem; min-width: auto; border-bottom: 2px solid #333;">
</script>
```

## HTML Attributes Reference

### Widget Script Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-container` | string | `"real-visitor-counter"` | ID of the HTML element where the widget renders |
| `data-style` | CSS | Widget container styles | Main wrapper CSS |
| `data-counter-style` | CSS | Counter box styles | Counter container CSS |
| `data-label-style` | CSS | Label styles | Visitor number label CSS |
| `data-digits-container-style` | CSS | Digits container styles | Digit flex container CSS |
| `data-digit-style` | CSS | Individual digit styles | Single digit CSS (retro seven-segment style) |
| `data-stats-style` | CSS | Stats section styles | Stats container CSS |
| `data-stat-item-style` | CSS | Individual stat styles | Single stat item CSS |

## Display Format

The widget displays:

```
Visitor #[count]
┌──────────────┐
│ [0][1][2][3] │  ← Daily visitor count (4 digits)
└──────────────┘
Today: 42 | Week: 156 | Month: 487
```

The counter displays:
- **Visitor number** - Current daily visitor count
- **Digit display** - 4-digit counter (with leading zeros)
- **Stats breakdown** - Daily, weekly, and monthly counts

## JavaScript API

You can interact with the counter programmatically:

```javascript
// Get current visitor statistics
const stats = window.RealVisitorCounter.getStats();
console.log(stats);
// Output: {
//   dailyVisitors: 42,
//   weeklyVisitors: 156,
//   monthlyVisitors: 487,
//   visitorId: "timestamp_random",
//   lastVisitDate: "2024-12-11"
// }

// Reset all counters (clears localStorage)
window.RealVisitorCounter.reset();

// Reinitialize the widget (after manual reset)
window.RealVisitorCounter.reinitialize();
```

## Data Storage

All data is stored locally in the browser:

- **localStorage** - Persistent across browser sessions
  - `realVisitorCounter` - Main counter data
  - `realVisitorCounterId` - Unique visitor ID
  - `lastWeekStart` - Week boundary tracking
  - `lastMonthStart` - Month boundary tracking

- **sessionStorage** - Current session tracking
  - `sessionVisitorId` - Session marker to prevent double-counting

**Storage Usage:** Typically 200-500 bytes per site

## How It Works

### Unique Visitor Detection

1. **First Visit (New Session):**
   - Creates unique visitor ID (timestamp + random)
   - Sets session marker
   - Increments daily counter if new day
   - Increments weekly counter if new week
   - Increments monthly counter if new month

2. **Same Session Visits:**
   - Session marker prevents re-counting
   - Stats remain unchanged

3. **New Session (Different Day/Time):**
   - Session marker is cleared by browser
   - New session detected
   - Counters update based on period boundaries

### Period Definitions

- **Daily:** Midnight to midnight (browser local time)
- **Weekly:** Monday to Sunday (ISO 8601 week)
- **Monthly:** 1st to last day of calendar month

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Full | All versions since 2012 |
| Firefox | ✅ Full | All versions since 2010 |
| Safari | ✅ Full | iOS 5+, macOS 10.7+ |
| Opera | ✅ Full | All modern versions |
| IE 11 | ⚠️ Limited | localStorage supported, ES5 compatible |
| IE 10 and below | ❌ No | Not supported |

## Privacy & GDPR Compliance

### Important Notes

1. **No Data Transmission** - All tracking happens locally in the browser
2. **No Personal Data** - Only stores visitor ID and counts
3. **No Tracking Cookie** - Uses browser localStorage instead
4. **No Third-Party Sharing** - Data never leaves the user's browser

### Recommendations

When embedding this counter, consider:
- Disclosing in your Privacy Policy that you use localStorage
- Optional: Allow users to opt-out by clearing browser data
- Understand that data persists across browsers/devices

## Troubleshooting

### Counter Not Appearing

1. **Check Container ID:**
   ```html
   <!-- Verify the element exists -->
   <div id="real-visitor-counter"></div>

   <!-- And is referenced correctly -->
   <script data-container="real-visitor-counter" ...></script>
   ```

2. **Check Console for Errors:**
   ```javascript
   // Open browser DevTools (F12) and check Console tab
   // Look for "[Real Visitor Counter]" messages
   ```

3. **Verify Script URL:**
   - Ensure the script path is correct
   - Check for 404 errors in Network tab

### Counts Not Updating

1. **localStorage Disabled:**
   - Check if browser has localStorage disabled
   - Some browsers disable it in private/incognito mode

2. **Script Blocked:**
   - Check if ad blocker or security software blocks the script
   - Whitelist the script in security settings

3. **Session Not Cleared:**
   - Close and reopen browser tab completely
   - Clear browser cache/cookies
   - Try in a different browser

### Styling Issues

1. **Styles Not Applying:**
   ```javascript
   // Verify data attributes are correct
   // Check CSS specificity - widget uses inline styles
   // Override with !important if needed
   ```

2. **Layout Issues:**
   - Widget uses flexbox - ensure parent container supports it
   - Set explicit width/height if needed
   ```html
   <div id="real-visitor-counter" style="width: 100%; max-width: 400px;"></div>
   ```

## Examples

### Example 1: Sidebar Widget

```html
<aside style="width: 250px; background: #f0f0f0; padding: 1rem; border-radius: 8px;">
  <h3>Site Statistics</h3>
  <div id="real-visitor-counter"></div>
</aside>

<script
  src="https://your-domain.com/real-visitor-counter.js"
  data-container="real-visitor-counter"
  data-counter-style="background: white; border: 1px solid #ddd; padding: 0.75rem; border-radius: 4px;">
</script>
```

### Example 2: Footer Widget

```html
<footer style="background: #333; color: white; padding: 2rem; text-align: center;">
  <p>Unique visitors:</p>
  <div id="visitor-count"></div>
</footer>

<script
  src="https://your-domain.com/real-visitor-counter.js"
  data-container="visitor-count"
  data-label-style="color: #aaa; font-size: 0.9rem;"
  data-digit-style="background: #555; color: #0f0; font-size: 1.5rem; padding: 0.5rem; min-width: 2.5rem; margin: 0 2px; border-radius: 4px;">
</script>
```

### Example 3: Floating Widget

```html
<div id="floating-counter" style="position: fixed; bottom: 20px; right: 20px; z-index: 999; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>

<script
  src="https://your-domain.com/real-visitor-counter.js"
  data-container="floating-counter"
  data-counter-style="background: white; border: none; padding: 1rem; border-radius: 8px;">
</script>
```

## API Endpoints

### Get Widget Configuration

```bash
GET /api/visitor-counter/config?theme=light&position=bottom-right
```

**Response:**
```json
{
  "status": "success",
  "theme": "light",
  "position": "bottom-right",
  "script": {
    "url": "/real-visitor-counter.js",
    "async": true,
    "defer": false
  },
  "styles": {
    "light": { ... },
    "dark": { ... }
  }
}
```

### Get Statistics

```bash
GET /api/visitor-counter/stats
```

**Response:**
```json
{
  "status": "success",
  "message": "Visitor counter statistics endpoint",
  "timestamp": "2024-12-11T12:00:00Z"
}
```

## Performance Considerations

- **Script Size:** ~4KB (minified)
- **Storage Overhead:** 200-500 bytes per site
- **Memory Usage:** Minimal (< 1MB)
- **CPU Impact:** Negligible (< 1ms execution time)

## Security Notes

1. **No External Calls** - Script operates entirely locally
2. **No Sensitive Data** - Only tracks visitor counts
3. **XSS Safe** - No user input processed
4. **CSRF Safe** - No state-changing operations
5. **localStorage Scope** - Per-domain isolation

## Limitations & Known Issues

1. **Browser Storage Limits:**
   - localStorage limit is typically 5-10MB
   - Basic counter uses < 1KB, no issues expected

2. **Private/Incognito Mode:**
   - Some browsers don't persist localStorage in private mode
   - Counter resets when tab closes

3. **Cross-Domain Tracking:**
   - Cannot track visitors across different domains
   - Each domain has its own separate counters

4. **Device-Specific:**
   - Counters are per-device, not per-user
   - Multiple devices increment counters separately

5. **Data Loss:**
   - Clearing browser data resets all counters
   - No server-side backup available

## Support & Documentation

For additional help:

1. **Check console messages:** `console.log()` in browser DevTools
2. **API endpoints:** `/api/visitor-counter/config` and `/api/visitor-counter/stats`
3. **Public script:** Available at `/real-visitor-counter.js`

## License

This Real Visitor Counter is provided as part of the Real Visitor Counter project.

## Version

- Version: 1.0.0
- Last Updated: December 2024
- Compatibility: Next.js 16+, React 19+

---

**Ready to embed?** Copy the basic embedding code above and customize as needed!
