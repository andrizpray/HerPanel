# HerPanel Mobile UI/UX Patterns

## Mobile Detection
Use `useState` with window width check and resize listener to toggle mobile-specific behavior:
```jsx
const [isMobile, setIsMobile] = useState(false);
useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 768);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

## Domain Table Action Buttons
Always wrap action buttons in a `flex flex-wrap` container to prevent overflow on narrow mobile screens:
```jsx
<div className="flex flex-wrap items-center justify-end gap-2">
  {/* DNS, SSL, Delete buttons */}
</div>
```

## DNS Form Responsive Layout
DNS form grids in modals must use `grid-cols-1 sm:grid-cols-2` to stack vertically on mobile (stacks at <640px, 2 columns at ≥640px):
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
  {/* Type, Name form fields */}
</div>
```

## Mobile Domain Actions Modal
For mobile-only domain management actions:
- Trigger: Click domain name (only on mobile via `isMobile` check)
- Style: Fixed bottom sheet, hidden on desktop with `md:hidden`
```jsx
{showMobileActions && mobileActionDomain && (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:hidden" onClick={() => setShowMobileActions(false)}>
    <div className="bg-hpBg2 border-t border-hpBorder rounded-t-xl w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
      <button onClick={handleMobileDns}>🌐 DNS Records</button>
      <button onClick={handleMobileSsl}>🔒 SSL Certificate</button>
      <button onClick={handleMobileDelete}>🗑️ Delete Domain</button>
      <button onClick={() => setShowMobileActions(false)}>Cancel</button>
    </div>
  </div>
)}
```

## Pitfalls
- Never use `flex` without `flex-wrap` for table row action buttons on mobile
- DNS forms without responsive grid will overflow on mobile screens
- Mobile modals must use `md:hidden` to avoid rendering on desktop
