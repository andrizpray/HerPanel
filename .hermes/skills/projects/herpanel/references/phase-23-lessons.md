# Phase 23 SSL Certificate Management & HerPanel Workflow Lessons

## Core Workflow Preferences (User: "jangan dipaksakan")
- Work **one feature at a time**, read full files before editing, verify each step carefully
- Prioritize quality over speed, test thoroughly before moving to next step
- Always push to GitHub after every update/fix batch
- If regressions occur (e.g., blank pages), revert to last stable commit immediately and skip problematic phases temporarily

## Common Pitfalls from Phase 23 Prep
1. **Duplicate DB Columns**: Always check existing table schema before creating migrations. In Phase 23 prep, `ssl_status` already existed in `domains` table from prior work, causing migration failure. Use:
   ```bash
   php artisan tinker --execute="echo implode(', ', Schema::getColumnListing('domains'));"
   ```

2. **Git Operation Permissions**: `storage/` and `bootstrap/cache/` are owned by www-data. Git reset/clean fails with permission denied. Fix temporarily:
   ```bash
   sudo chown -R $USER:$USER /var/www/herpanel/storage /var/www/herpanel/bootstrap/cache
   # Perform git operations
   sudo chown -R www-data:www-data /var/www/herpanel/storage /var/www/herpanel/bootstrap/cache
   ```

3. **Log File Permissions**: `storage/logs/laravel.log` must be writable by www-data. Fix:
   ```bash
   sudo chown www-data:www-data /var/www/herpanel/storage/logs/laravel.log
   sudo chmod 664 /var/www/herpanel/storage/logs/laravel.log
   ```

4. **Phase 22 Status**: File Manager phase is currently reverted (commit `34b7092`) due to blank page regressions. Skip until fixes are validated.

## Phase 23 Current Progress
- Rolled back to commit before File Manager update
- Added `ssl_enabled` to Domain model fillable/casts
- SSL UI already exists in Domains/Index.jsx (modal, status badges, request button)
- Next step: Replace simulated `checkSsl` method with real Certbot integration
