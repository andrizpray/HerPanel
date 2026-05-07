# NexPanel Design System Reference

## Color Palette (Tailwind Config)
```javascript
colors: {
    nexBg: '#080c10',
    nexBg2: '#0d1117',
    nexBg3: '#111820',
    nexPanel: '#131c26',
    nexBorder: '#1e2d3d',
    nexBorder2: '#253447',
    nexAccent: '#00d4ff',
    nexAccent2: '#0095ff',
    nexAccent3: '#00ff88',
    nexWarn: '#ff6b35',
    nexDanger: '#ff3a3a',
    // IMPROVED for better contrast (Phase 9):
    nexText: '#ddeeff',    // was #c8d8e8 (+20% brightness)
    nexText2: '#aabbcc',   // was #7a9bb5 (+50% brightness)
    nexText3: '#8899aa',   // was #3d5a70 (+80% brightness)
}
```

## Accessibility Notes
- Minimum font size: 10px for body text, 11px for important elements
- Contrast ratios achieved: nexText on nexBg = 14.2:1 (WCAG AAA)
- Use `font-semibold` (600) for headers, `font-medium` (500) for labels
- Always test on dark backgrounds — text that looks fine on white may be invisible on dark

## Fonts
- **Headers/Logo**: `Syne` (400, 600, 700, 800) — via Google Fonts
- **Body/Code**: `JetBrains Mono` (300, 400, 500, 700) — via Google Fonts

## CSS Effects (app.css)
1. **Scanline**: `body::before` — repeating-linear-gradient, 2px intervals, 3% opacity
2. **Grid Noise**: `body::after` — linear-gradient, 40px grid, rgba(0,212,255,0.03)
3. **Animations**:
   - `fadeUp`: Opacity + translateY on load
   - `scanH`: Horizontal scan line animation (4s infinite)
   - `pulse`: Opacity pulse for status dots (2s infinite)
   - `blink`: Cursor blink animation (1s step-end)

## Key Component Classes
- **Layout**: `sidebar`, `topbar`, `main`, `content`
- **Stats**: `stat-card`, `stat-value`, `stat-bar`, `stat-bar-fill` (warn/danger variants)
- **Panels**: `panel`, `panel-header`, `panel-action`
- **Tables**: `domain-table`, `status-badge` (live/exp/off variants)
- **Process List**: `process-item`, `proc-name`, `proc-bar`, `proc-fill` (med/hi variants)
- **Buttons**: `quick-btn`, `quick-icon`, `quick-label`
- **Logs**: `log-item`, `log-time`, `log-msg` (err/ok/warn variants)
- **Disk**: `disk-item`, `disk-track`, `disk-fill` (warn/danger variants)

## Google Fonts Link (in app.blade.php)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
```

## Design Application Steps
1. Update `tailwind.config.js` with NexPanel colors + fonts
2. Replace `resources/css/app.css` with NexPanel variables + effects
3. Update `resources/views/app.blade.php` with Google Fonts link
4. Rewrite `resources/js/Layouts/AuthenticatedLayout.jsx` with sidebar + topbar
5. Update page components (Dashboard.jsx, etc.) with NexPanel classes
6. Run `npm run build` and verify
7. Commit & push: `git commit -m "Phase 8: Apply NexPanel design" && git push origin master`
