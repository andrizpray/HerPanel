# Debugging Blank Dashboard in HerPanel

## Step-by-Step Path (order matters)
1. **Check Laravel Logs**  
   Run `tail -100 storage/logs/laravel.log | grep -A 5 -B 5 "ERROR|Exception|Fatal"` to find PHP errors (common: missing class from deleted files like `EmailAccount.php`).
2. **Verify React Entry Point**  
   Check `resources/js/app.jsx` to ensure Inertia setup (`createInertiaApp`, `resolvePageComponent`) is correct.
3. **Inspect Target Page Component**  
   Check the page component (e.g., `resources/js/Pages/Dashboard.jsx`) for broken imports (e.g., `socket.io-client`, `node_exporter`) that may throw JS errors.
4. **Confirm Built Assets Exist**  
   Run `ls -la public/build/assets/` to ensure Vite build output is present (e.g., `app-*.js`, `Dashboard-*.js`).
5. **Fix File Permissions**  
   Run:
   ```bash
   sudo chown -R www-data:www-data storage bootstrap/cache
   sudo chmod -R 775 storage bootstrap/cache
   ```
6. **Clear Laravel Cache**  
   Run `php artisan optimize:clear && php artisan route:clear`.
7. **Rebuild Composer Autoload (Critical)**  
   After deleting models/controllers, run `composer dump-autoload --no-scripts --optimize` to remove stale class references.
8. **Verify Ziggy Routes**  
   Run `curl -s https://<your-domain> | grep Ziggy` to confirm route definitions are loaded.
9. **Isolate JS Errors**  
   Simplify the page component (remove optional dependencies like monitoring tools) and rebuild: `npm run build`.
10. **Restart Services**  
    Run `sudo systemctl restart php8.3-fpm && sudo nginx -s reload`.

## Common Pitfalls
- **Stale Composer Autoload**: Deleting a model/controller does not automatically remove its reference from `vendor/composer/autoload_classmap.php`; always run `composer dump-autoload --no-scripts --optimize`.
- **Monitoring Dependencies**: Dashboard.jsx with `socket.io-client` or `node_exporter` imports will throw errors if those services are not running, leading to blank screens.
- **Browser Cache**: Always hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) or use incognito mode after rebuilding assets.
