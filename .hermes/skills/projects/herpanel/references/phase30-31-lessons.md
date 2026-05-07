# Phase 30-31 Lessons

## Phase 30: Redirect Manager — Critical Findings

### Missing Frontend Files Issue
**Problem:** Phase 30 was marked complete (commit 2a697c6) but `resources/js/Pages/Redirects/` folder didn't exist in filesystem. Claims of completion must be verified by checking file existence, not just commit messages.

**Lesson:** Always verify frontend files exist after "completion":
```bash
ls -la resources/js/Pages/FeatureName/
```

### @inertiajs/react v2 Import Pattern (HerPanel Specific)
HerPanel uses **@inertiajs/react v2.x**, NOT v1 packages.

**✅ Correct (v2 pattern):**
```jsx
import { router, useForm } from '@inertiajs/react';

// Delete:
router.delete(route('...'));

// Form:
const { data, setData, post, processing, errors } = useForm({...});
```

**❌ Wrong (v1 pattern — will fail build):**
```jsx
import { Inertia } from '@inertiajs/inertia'; // ❌
import { useForm } from '@inertiajs/inertia-react'; // ❌

Inertia.delete(...); // ❌
```

**Build error if wrong:**
```
Error: [vite]: Rolldown failed to resolve import "@inertiajs/inertia"
```

### Layout Import Issue
HerPanel **does not use** `@/Shared/Layout`. Remove Layout imports from new components. Use bare `<div>` wrappers instead.

---

## Phase 31: Mobile Modal Fix

### Problem
Mobile action modals break when buttons increase (DNS, SSL, Redirects, Delete). Modal overflows viewport, buttons inaccessible.

### Fix Pattern
Add scrollability to bottom-sheet modals:
```jsx
<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:hidden">
  <div className="bg-hpBg2 border-t border-hpBorder rounded-t-xl w-full p-5 space-y-3 max-h-[80vh] overflow-y-auto">
    {/* buttons here */}
  </div>
</div>
```

Key classes: `max-h-[80vh] overflow-y-auto`

### Adding New Mobile Actions
1. Add handler function:
```jsx
const handleMobileFeature = () => {
    setShowMobileActions(false);
    router.visit(route('feature.index', mobileActionDomain.id));
};
```

2. Add button in modal (before Delete button):
```jsx
<button
    onClick={handleMobileFeature}
    className="w-full py-3 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-[12px] font-medium hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2"
>
    🔄 Feature Name
</button>
```

---

## PHP Parse Error: Incomplete Methods

### Problem
Empty method stubs cause parse errors:
```php
public function hotlinkProtection()
}  // ❌ Missing { body }
```

### Fix
Remove incomplete stubs before committing. Always run:
```bash
php -l app/Models/Domain.php
```

---

## Build Verification Steps (HerPanel)
After any frontend changes:
```bash
cd /var/www/herpanel
php artisan ziggy:generate --url=https://drizdev.space
npm run build
```

If build fails, check:
1. Import paths (@inertiajs/react v2 pattern)
2. Missing Layout imports
3. JSX syntax errors (unterminated regex often means JSX parse error)
