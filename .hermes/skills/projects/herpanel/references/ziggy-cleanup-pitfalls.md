# Ziggy Route Error: `route 'X' is not in the route list`
## Symptom (2026-05-06 Session)
Browser shows blank page. F12 Console shows:
```
Error: Ziggy error: route 'emails.index' is not in the route list.
Component Stack: undefined
```

## Root Cause
Partial cleanup when removing a feature. In this case:
- Phase 24 Email feature was removed (controllers, models, routes in `web.php`)
- BUT `AuthenticatedLayout.jsx` still had references in TWO places:
  1. `navSections` array: `{ name: 'Emails', route: 'emails.index', ... }`
  2. `getPageTitle()` function: `'emails.index': 'Email Accounts', ...`

## Fix Applied
1. **Find all references** before removing feature:
   ```bash
   cd /var/www/herpanel
   grep -r "emails" --include="*.jsx" --include="*.js" resources/
   ```

2. **Patch `AuthenticatedLayout.jsx`** - remove from BOTH places:
   - `navSections` array (sidebar menu)
   - `getPageTitle()` function (page title mapper)

3. **Rebuild assets**:
   ```bash
   cd /var/www/herpanel && npm run build
   php artisan optimize:clear
   sudo systemctl restart php8.3-fpm && sudo nginx -s reload
   ```

## Prevention Checklist
When removing ANY feature, check ALL these locations:
- [ ] `routes/web.php` - Remove `use Controller;` + route definitions
- [ ] `resources/js/Layouts/AuthenticatedLayout.jsx` - TWO places:
  - [ ] `navSections` array (sidebar)
  - [ ] `getPageTitle()` function
- [ ] `resources/js/Pages/<Feature>/` - Delete entire folder
- [ ] `app/Http/Controllers/` - Delete controller
- [ ] `app/Models/` - Delete model
- [ ] Run `npm run build` after cleanup

## Test After Cleanup
```bash
# Should return empty
grep -r "feature.index" resources/ public/build/ 2>/dev/null

# Browser test
# Hard refresh: Ctrl+Shift+R
# Check F12 Console for Ziggy errors
```

## Related
- Main skill: `herpanel` (Feature Removal Checklist)
- Session: 2026-05-06, Phase 24 cleanup failure → fixed
