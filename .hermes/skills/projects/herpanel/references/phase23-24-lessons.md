# Phase 23-24 Debugging Lessons

## Post-Git Reset Cleanup
After `git reset --hard <commit>` to revert:
- Remove untracked leftovers: `git clean -fd`
- Drop rolled-back migration tables via PHP PDO (avoids shell escaping for special characters in DB passwords):
  ```php
  php -r "$pdo = new PDO('mysql:host=127.0.0.1;dbname=DB_NAME', 'DB_USER', 'DB_PASS'); $pdo->exec('DROP TABLE IF EXISTS table_name');"
  ```
- Clear PHP opcache: `php -r "opcache_reset();"` or restart PHP-FPM
- Clear Laravel caches: `php artisan optimize:clear`

## Ziggy Workflow
After route changes, regenerate Ziggy and rebuild assets:
- `php artisan ziggy:generate --url=https://drizdev.space`
- `npm run build`
