# HerPanel Design System

Professional dark theme for cloud hosting panel, implemented May 2026.

## Design Philosophy

Inspired by **CloudPanel**, **Ploi**, and **RunCloud** — professional hosting panels that prioritize:
- **Trust & Reliability** — Clean, predictable interfaces
- **Clarity** — Information hierarchy, not decoration
- **Efficiency** — Minimal clicks, clear actions

Avoided: NexPanel/cyberpunk aesthetic (scanlines, neon glows, multiple accent colors) — too flashy for a server management tool.

---

## Color Palette

### Background Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `hpBg` | `#0f1117` | Page background, input backgrounds |
| `hpBg2` | `#1a1d27` | Cards, panels, sidebar, table rows |
| `hpBg3` | `#242836` | Hover states, elevated elements |
| `hpSurface` | `#1a1d27` | Alias for hpBg2 |

### Border Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `hpBorder` | `#2a2e3b` | Primary borders (cards, inputs, dividers) |
| `hpBorder2` | `#363b4d` | Secondary borders, hover accent |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `hpAccent` | `#6366f1` | Primary accent (indigo) — buttons, links, active states |
| `hpAccent2` | `#818cf8` | Lighter accent for hover/focus states |

### Status Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `hpSuccess` / `emerald-*` | `#22c55e` | Success, online, healthy |
| `hpWarn` / `amber-*` | `#f59e0b` | Warning, expiring, elevated usage |
| `hpDanger` / `red-*` | `#ef4444` | Error, offline, critical |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `hpText` | `#f1f5f9` | Primary text (near white) |
| `hpText2` | `#94a3b8` | Secondary text, descriptions |
| `hpText3` | `#64748b` | Tertiary text, labels, placeholders |

---

## Typography

### Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```

- **Inter** — Primary UI font (weights: 400, 500, 600, 700)
- **JetBrains Mono** — Monospace for code, paths, metrics, PIDs

### Font Sizes
| Size | Usage | Tailwind |
|------|-------|----------|
| 11px | Labels, tertiary info, badges | `text-[11px]` |
| 12px | Secondary text, form labels | `text-[12px]` |
| 13px | Body text, table cells | `text-[13px]` |
| 15px | Section headings | `text-[15px]` |
| 20-24px | Page titles | `text-xl`, `text-2xl` |

### Font Utilities
```css
.tabular-nums { font-variant-numeric: tabular-nums; }  /* Metrics */
.font-mono { font-family: 'JetBrains Mono', monospace; }  /* Code */
.tracking-wider { letter-spacing: 0.05em; }  /* Labels */
.uppercase { text-transform: uppercase; }  /* Section headers */
```

---

## Component Patterns

### Stats Card
```jsx
<div className="bg-hpBg2 border border-hpBorder rounded-lg p-5">
    <div className="text-[12px] text-hpText3 uppercase tracking-wider mb-3">
        {label}
    </div>
    <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-white tabular-nums">{value}</span>
        <span className="text-[13px] text-hpText3">{unit}</span>
    </div>
    <div className="mt-3 h-1.5 bg-hpBorder rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-hpAccent" style={{ width: `${percent}%` }} />
    </div>
    <div className="text-[11px] mt-2 text-hpText3">{subtext}</div>
</div>
```

### Status Badge
```jsx
<span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium
    ${status === 'live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status === 'live' ? 'bg-emerald-400' : 'bg-red-400'}`} />
    {status.toUpperCase()}
</span>
```

### Table Row with Hover
```jsx
<tr
    className={`transition-colors ${hoveredRow === id ? 'bg-hpAccent/3' : ''}`}
    onMouseEnter={() => setHoveredRow(id)}
    onMouseLeave={() => setHoveredRow(null)}
>
    {/* ... */}
</tr>
```

### Button Variants
```jsx
// Primary action
<button className="bg-hpAccent text-white px-5 py-2 rounded-md text-[12px] font-medium hover:bg-hpAccent/90 transition-colors">
    Action
</button>

// Secondary/Cancel
<button className="bg-hpBg border border-hpBorder text-hpText2 px-5 py-2 rounded-md text-[12px] font-medium hover:border-hpBorder2 transition-colors">
    Cancel
</button>

// Danger
<button className="bg-red-500/5 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-md text-[11px] hover:bg-red-500/10 transition-colors">
    Delete
</button>
```

### Panel with Header
```jsx
<div className="bg-hpBg2 border border-hpBorder rounded-lg overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-hpBorder">
        <span className="text-[13px] text-white font-medium">{title}</span>
        <button className="...">{action}</button>
    </div>
    {/* Content */}
</div>
```

---

## Layout Structure

### Sidebar (240px fixed)
- Logo + app name
- Server status card
- Navigation sections (Overview / Services / System)
- User card + logout

### Topbar (52px fixed)
- Breadcrumb: `HerPanel / Page Title`
- Clock (WIB)
- Notification icon

### Main Content
- `ml-[240px] pt-[52px]` — offset for sidebar + topbar
- `p-6` padding around content

---

## Tailwind Config

```javascript
colors: {
    hpBg: '#0f1117',
    hpBg2: '#1a1d27',
    hpBg3: '#242836',
    hpSurface: '#1a1d27',
    hpBorder: '#2a2e3b',
    hpBorder2: '#363b4d',
    hpAccent: '#6366f1',
    hpAccent2: '#818cf8',
    hpWarn: '#f59e0b',
    hpDanger: '#ef4444',
    hpSuccess: '#22c55e',
    hpText: '#f1f5f9',
    hpText2: '#94a3b8',
    hpText3: '#64748b',
},
fontFamily: {
    sans: ['Inter', ...defaultTheme.fontFamily.sans],
    mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
},
```

---

## Animation

```css
@keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-up {
    animation: fadeUp 0.3s ease both;
}
```

Usage: `style={{ animation: mounted ? 'fadeUp 0.3s ease both' : 'none' }}`

---

## Pitfalls

1. **Don't use `nex-*` classes** — Old NexPanel palette, replaced by `hp-*`
2. **No scanlines or neon glow** — Removed in Phase 1 redesign
3. **Single accent color** — Indigo only, status colors for semantic meaning
4. **Inter font required** — Don't fall back to system fonts
5. **Dark mode is default** — No light mode support needed
