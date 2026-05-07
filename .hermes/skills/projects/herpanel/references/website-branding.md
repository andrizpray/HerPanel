# HerPanel Website Branding Fix

Pattern for changing default Laravel name to custom panel name and adding favicon in Inertia.js + React stack.

## Problem
New Laravel + Inertia.js projects default to "Laravel" in browser tab title. Need to rebrand to "HerPanel".

## Solution

### 1. Update Application Name

**`config/app.php`:**
```php
'name' => env('APP_NAME', 'HerPanel'),
```

**`.env`:**
```
APP_NAME=HerPanel
```

### 2. Update Blade Template (`resources/views/app.blade.php`)

Replace the dynamic title with static branded title + emoji:
```html
<!-- OLD -->
<title inertia>{{ config('app.name', 'Laravel') }}</title>

<!-- NEW -->
<title inertia>HerPanel 🖥️</title>
```

Add SVG data URI favicon (no file needed):
```html
<!-- Favicon -->
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='4' fill='%236366f1'/><text x='16' y='24' font-size='20' fill='white' text-anchor='middle' font-family='Arial'>H</text></svg>" />
```

**Note:** `%23` encodes `#` in the data URI.

### 3. Clear Laravel Caches

```bash
cd /var/www/herpanel
php artisan config:clear
php artisan view:clear
```

### 4. Build & Push

```bash
npm run build
git add config/app.php .env resources/views/app.blade.php
git commit -m "fix: change website name to HerPanel, add favicon"
git push origin master
```

## Result
- Browser tab title: **HerPanel 🖥️**
- Favicon: Blue square (#6366f1) with white "H" letter
- No more "Laravel" visible anywhere in the UI

## Pitfall: Commit Message Special Characters

**Issue:** Running `git commit -m "message & more"` via the `terminal` tool fails with "Foreground command uses '&' backgrounding".

**Fix:** Avoid `&`, `|`, `>`, `>>` in commit messages when using the `terminal` tool. Use simple alphanumeric messages:
```bash
# ❌ DON'T
git commit -m "feat: add PHP & MySQL support"  # & causes error

# ✅ DO THIS
git commit -m "feat: add PHP and MySQL support"
```

**Context:** Encountered during Phase 20 push to GitHub.
