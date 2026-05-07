---
name: herpanel
title: HerPanel — Custom Hosting cPanel
description: Project conventions, architecture decisions, and pitfalls for HerPanel (custom hosting cPanel).
---

# HerPanel

## Common Pitfalls

### Ziggy Route Mismatch
Blank pages with `Ziggy error: route 'X' is not in the route list` in browser console indicate Laravel route names don't match React `route()` calls (Ziggy uses Laravel route names). Always align route names between `routes/web.php` and React files. This is a frequent issue when adding new features.

Additional lessons from Phase23-24 debugging: See `references/pitfalls-additional.md`.
- Phase 25-30 lessons: See [references/phase25-30-lessons.md](references/phase25-30-lessons.md).
### Ziggy Workflow
After route changes: `php artisan ziggy:generate --url=https://drizdev.space && npm run build`

### Phase 25: SSL & Delete Best Practices
See `references/phase25-ssl-delete.md` for SSL generation pitfalls, delete confirmation best practice, and user workflow preference.

### Phase 26: Subdomain Management ✅
See `references/phase26-subdomain.md` for features, architecture decisions, and patch tool pitfalls.
Additional session-specific pitfalls from 2026-05-07: `references/phase26-session-20260507.md` (missing controller imports, Inertia import, JSX corruption, mobile UI modals).

### Phase 23: Email Management ✅
See `references/email-setup.md` for Postfix/Dovecot setup, and `references/phase23-25-alignment.md` for Phase 23/25 alignment.
Features: Email Accounts (CRUD), Email Aliases/Forwarding, Email Quota, Email Filters & Spam Settings, Webmail Access (Roundcube).
Key learnings: Simplified password handling (plain text), Dovecot PLAIN scheme, Maildir delivery, Roundcube config fixes (imap_host, session_storage, debug code removal).
Status (2026-05-08): Email system fully functional — SMTP (Postfix) sends/receives, IMAP (Dovecot) login works, Roundcube webmail accessible, emails delivered to Maildir.

### Phase 27: Error Pages Custom ✅
See `references/phase27-error-pages.md` for features, architecture decisions, and testing results.
For testing workflows when browser auto-launch fails, see `references/testing-browser-failures.md`.
Key learnings: Controller imports in `routes/web.php`, Inertia facade imports, test route cleanup, file corruption recovery with `git restore`.

### routes/web.php Patching Failure
Follow this slow, incremental process (aligned with user's "jangan dipaksakan" preference):
1. **Database First**: Create migration → run `php artisan migrate` immediately
2. **Model**: Create Eloquent model with `$fillable`, `$casts`, relationships
3. **Controller**: Create basic CRUD methods (index, store, destroy first)
4. **Routes**: Add to `routes/web.php` (follow pitfall above for patching)
5. **Frontend**: Create React page in `resources/js/Pages/FeatureName/`
6. **Build**: `npm run build` to compile assets
7. **Test**: Verify in browser
8. **Commit/Push**: Git commit + push to GitHub (user expects this after every batch)
3. *

### New Feature Development Workflow
When adding new features (e.g., Firewall Management), follow this user-preferred workflow:
1. Start with light, non-breaking tasks first (e.g., database migrations, model creation) before touching controllers, routes, or frontend code
2. Work slowly, verify each step (e.g., check migration runs successfully, model has correct fillable/relationships) before proceeding
3. Align with "jangan dipaksakan" rule: prioritize quality over speed, stop rushing through multiple tasks, rollback to last working commit if repeated errors occur
4. Ensure no existing routes/controllers are broken when adding new ones (check `routes/web.php` for conflicts)
5. Git push to GitHub after every batch of updates/fixes, as per user preference
4. **MySQL Special Characters**: Use PHP PDO for DB commands if passwords contain special characters (e.g., `!`) to avoid shell escaping issues.
5. **Stale Controller References After Reset**: After `git reset --hard` to a previous commit, `routes/web.php` may still contain `use` statements and route definitions for controllers that were introduced after the target commit. These references cause `BindingResolutionException` or `Target class does not exist` errors. Always verify and fix:
   ```bash
   git diff <commit> -- routes/web.php
   # If stale references exist:
   git checkout <commit> -- routes/web.php
   # Delete untracked controller files:
   git clean -fd
   ```

**Full Fix Workflow**:
1. **Align Route Names**: Ensure Laravel route names in `routes/web.php` exactly match React's `route('name')` calls. Search React files for existing route expectations first, or update React files to match new Laravel route names.
2. **Update All React Components**: Check `Pages/<Feature>/*.jsx`, `Layouts/AuthenticatedLayout.jsx` for all `route()` usage — missing or mismatched names here are the root cause.
3. **Clean Stale Ziggy File**: Delete auto-generated `resources/js/ziggy.js` (may contain old routes/URLs): `rm -f resources/js/ziggy.js`.
4. **Regenerate Ziggy**: Run `php artisan ziggy:generate --url=https://your-domain` (use correct HTTPS domain, e.g., `https://drizdev.space`).
5. **Clear Laravel Caches**: `php artisan optimize:clear` to remove stale route/config cache.
6. **Clear Build Cache**: `rm -rf public/build` to remove old JS assets.
7. **Rebuild Assets**: `npm run build` to generate new JS with updated Ziggy routes.
8. **Browser Cache**: Instruct user to **hard refresh** (Ctrl+Shift+R / Cmd+Shift+R) or test in incognito mode — stale browser JS cache is the most common cause of repeated Ziggy errors after fixes.

**Note**: `resources/js/ziggy.js` is auto-generated by Ziggy; never manually edit it. Always regenerate after route changes.
- **Domain Field Name**: The `Domain` model uses `domain_name` as the database column for the domain string, not `domain`. When accessing a related domain's name (e.g., from `EmailAccount.domain`), always use `domain.domain_name`, not `domain.domain`. This is a frequent cause of empty table columns or undefined property errors.
- **Phase 23 & Workflow Lessons**: See [references/phase-23-lessons.md](references/phase-23-lessons.md) for user workflow preferences ("jangan dipaksakan"), migration pitfalls, permission fixes, and Phase 23 progress.\n- **Domain Field Name**: The `Domain` model uses `domain_name` as the database column for the domain string, not `domain`. When accessing a related domain's name (e.g., from `EmailAccount.domain`), always use `domain.domain_name`, not `domain.domain`. This is a frequent cause of empty table columns.\n- **Email Management**: See [references/email-setup.md](references/email-setup.md) for Postfix/Dovecot setup, common pitfalls (missing `postfix-mysql`, incorrect mailbox queries, Dovecot password scheme mismatches), and testing procedures.\n- **Unused Files with Stale Configs**: Files like `resources/js/ziggy.js` with old URLs (e.g., port 8083) can conflict with current setup and cause blank pages or JS errors. Always check `git status` for untracked files after updates. Remove unused files: `rm -f resources/js/ziggy.js`.

## Mobile UX Patterns
For list pages with item-specific actions (e.g., Domains, Emails, Users), follow the established mobile interaction pattern from the Domains page:
1. **Detect Mobile**: Use `isMobile` state initialized to `window.innerWidth < 768`, with a `resize` event listener to update on window size changes.
2. **Clickable Items**: On mobile, make list item identifiers (domain name, email address, user name) clickable buttons that open a bottom sheet action modal.
3. **Hide Desktop Actions**: Use Tailwind's `hidden md:table-cell` (for table columns) or similar to hide desktop action buttons on mobile.
4. **Bottom Sheet Modal**: Use a fixed inset-0 container with `items-end` to anchor the modal to the bottom of the screen, matching the Domains page's style: `bg-hpBg2`, `border-t border-hpBorder`, `rounded-t-xl`, with a dark overlay backdrop.
5. **Users Pages Update (2026-05-06)**: `Users/Index.jsx` now follows this pattern (commit `34b7092`), using mobile card view and bottom-sheet action modal.

## Workflow Guidelines
- When implementing a feature similar to an existing page (e.g., mobile actions for Emails matching Domains), first review the existing page's implementation to follow established patterns and ensure UI consistency across the panel.
- Commit and push all fixes/features to `origin/master` immediately after completion, as per user expectation.

- **Nginx reverse proxy**: Prometheus (9090) & node_exporter (9100) only listen on 127.0.0.1, must use Nginx `proxy_pass` to `127.0.0.1:port` not `$server_addr`
- **Dashboard disk metrics**: Use `node_filesystem_size_bytes` with `mountpoint="/"` filter, NOT `node_disk_total_bytes` (metric doesn't exist in node_exporter)
- **Field name mismatches**: Database uses `domain_name` (not `domain`). React components often use `domain.domain` — must use `domain.domain_name`. Controllers also had `$domain->domain` bug → fix to `$domain->domain_name`
- **Permission denied pattern**: `storage/logs/laravel.log` & `bootstrap/cache` often owned by `www-data` (PHP-FPM user). Fix steps:
  1. Check PHP-FPM user: `grep -E "^user|^group" /etc/php/8.3/fpm/pool.d/www.conf`
  2. Chown ownership: `sudo chown -R www-data:www-data /var/www/herpanel/storage /var/www/herpanel/bootstrap/cache`
  3. Set permissions: `sudo find /var/www/herpanel/storage -type d -exec chmod 775 {} \;` and `sudo find /var/www/herpanel/storage -type f -exec chmod 664 {} \;`
  4. Remove old log: `sudo rm -f /var/www/herpanel/storage/logs/laravel.log`
  5. Test write: `sudo -u www-data touch /var/www/herpanel/storage/logs/laravel.log && echo "Write OK"`
  6. Restart services: `sudo systemctl restart php8.3-fpm nginx`
- **Email form validation**: Create Email form sends prefix-only (e.g., "info"), NOT full email. Controller must: (1) validate as `string|max:64` NOT `email`, (2) concatenate `$prefix . '@' . $domain->domain_name`, (3) check uniqueness of full email manually
- **Domain ownership**: When creating test data, ensure `user_id` matches logged-in user (Auth::id()). Query `Domain::where('user_id', auth()->id())` returns empty if data has wrong user_id
  - Backend: Use `$domain->domain_name`, never `$domain->domain`
  - Frontend: Use `domain.domain_name` in selects/display, never `domain.domain`
- **User ownership verification**: All queries for domains, email accounts, and databases must filter by `user_id = Auth::id()`. Mismatched ownership (e.g., records owned by user_id=2 when logged in as user_id=1) causes empty data even when records exist.
- **Inertia prop alignment**: Frontend components must reference exact field names from Inertia props. Field name mismatches (like `domain` vs `domain_name`) or typos (e.g., controller passes `backups` but React receives `backpus`) cause empty dropdowns, missing data, or blank pages. Always verify prop names match exactly between `Inertia::render()` and React component parameters.
- **Controller Use Statements**: Avoid adding `use` statements for controllers already referenced via `ControllerClass::class` in `routes/web.php`. Redundant `use` statements can cause `Cannot use [Controller] as [Controller] because the name is already in use` fatal errors. Laravel resolves `ControllerClass::class` to the full namespace automatically.
- **Queue Workers**: HerPanel uses Laravel queues (database driver) for backup jobs. Always ensure `herpanel-queue` PM2 process is running (`pm2 list`). If backups stay `pending`, check queue worker logs: `pm2 logs herpanel-queue`.
- **Inertia Page Title Suffix "- Laravel"**: If page titles still show "- Laravel" after setting `APP_NAME=HerPanel` in `config/app.php` and `.env`:
  1. Check `.env`: Ensure `VITE_APP_NAME="HerPanel"` (not literal `${APP_NAME}` which Vite does not parse as a variable)
  2. Check `resources/js/app.jsx`: Update fallback from `import.meta.env.VITE_APP_NAME || 'Laravel'` to `|| 'HerPanel'`
  3. Run `npm run build` to apply changes, clear Laravel view cache: `php artisan view:clear`
  4. **Gitignore Note**: `.env` and `public/build/` are gitignored for HerPanel — do not attempt to commit these files.
- **Favicon Unsupported SVG**: Browsers may throw "Unsupported document type '.svg'" for inline SVG favicons. Fix by converting SVG to PNG using `rsvg-convert`:
  ```bash
  rsvg-convert -w 32 -h 32 favicon.svg -o favicon.png
  rm favicon.svg
  cp favicon.png public/favicon.png
  cp favicon.png public/favicon.ico
  ```
  Update `resources/views/app.blade.php` to use `<link rel="icon" href="{{ asset('favicon.png') }}">` instead of inline SVG data URIs.

## Mobile UX Patterns
- **Symptom**: 403 error when accessing controller methods that call `$this->authorize()`, or `Call to undefined method authorize()`.
- **Root Cause**:
  1. Base Controller (`app/Http/Controllers/Controller.php`) missing `AuthorizesRequests` trait.
  2. No policy registered for the model, so `authorize()` defaults to denying access.
- **Fix**:
  1. Update base Controller to include required traits:
     ```php
     abstract class Controller
     {
         use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
     }
     ```
  2. If no policy exists, replace `authorize()` calls with manual ownership checks:
     ```php
     if ($model->user_id !== Auth::id()) {
         abort(403, 'Unauthorized');
     }
     ```

### Missing `use` Statement in web.php
- **Symptom**: `Illuminate\Contracts\Container\BindingResolutionException: Target class [EmailController] does not exist.`
- **Root Cause**: New controller used in `routes/web.php` without corresponding `use` statement at top of file.
- **Fix**: Always add `use` statement for new controllers:
  ```php
  use App\Http\Controllers\EmailController;
  use App\Http\Controllers\DatabaseManagementController;
  // etc.
  ```
- **Prevention**: After adding new routes with controller classes, verify `use` statements exist before testing.

### Route Syntax: Comma Between Class and Method
- **Issue**: Routes defined as `[Class::class, 'method']` require a comma between class reference and method string.
- **Correct Syntax**:
  ```php
  Route::get('/emails', [EmailController::class, 'index'])->name('emails.index');
  ```
- **Wrong Syntax** (missing comma causes parse errors):
  ```php
  Route::get('/emails', [EmailController::class 'index'])->name('emails.index');
  ```
- **Note**: The comma (`,`) between `Class::class` and `'method'` is mandatory.

### Dark Mode Text Contrast
- **Issue**: `text-hpText3` (color: #64748b) has insufficient contrast on dark backgrounds (`hpBg: #0f1117`).
- **Fix**: Use `text-slate-400` for secondary text in login/guest pages for better readability.

### Monitoring Page Blank State
- **Issue**: Monitoring page shows nothing when Prometheus/node_exporter is unreachable.
- **Fix**: Add conditional error states in `resources/js/Pages/Monitoring/Index.jsx` to display connection failure messages and retry buttons instead of blank pages.

### Git Workflow
- **User Preference**: Commit and push all changes to GitHub after every batch of fixes/updates. Use concise, descriptive commit messages. — Custom Hosting cPanel

## Project Identity
- **Name:** HerPanel
- **Repo:** https://github.com/andrizpray/HerPanel
- **Main Domain (SSL):** https://drizdev.space (server 43.134.37.14)
- **IP Access (Redirect):** http://43.134.37.14:8083 → redirects to HTTPS
- **Webmail:** https://drizdev.space/roundcube/
- **Directory:** /var/www/herpanel
- **Database:** herpanel_cpanel
- **Tech Stack:** Laravel 13 + Inertia.js + React + Node.js (PM2, port 3001) + MySQL + Redis + Nginx
- **⚠️ Project Boundary:** DO NOT use `eatrade-journal.site` domain in HerPanel — that belongs to JTC project. Remove any eatrade-journal.site references from HerPanel DB/configs.

## Workflow Conventions
- **Git:** Commit and push to `master` branch (`git push origin master`) after every batch of updates/fixes, per user preference
- **Testing:** Always verify Nginx config with `sudo nginx -t` before reloading, clear Laravel cache after route/.env changes
- **UX:** Redirect root `/` to `/login` immediately (avoid showing default Laravel welcome page)
- **Gmail:** herpanel.dev@gmail.com, App Password (16-char, no spaces): tpusyswvjkamnk
- **SMTP Gmail:** MAIL_HOST=smtp.gmail.com, MAIL_PORT=587, MAIL_ENCRYPTION=tls, MAIL_FROM_ADDRESS=herpanel.dev@gmail.com

## Architecture Decision (User Confirmed)
- **Deployment:** Host-based (NO Docker, NO separate VPS)
- **Server:** Same as JTC (43.134.37.14)
- **Routing:** Nginx server block → `/api` to Laravel, `/` to React, `/socket.io/` to Node.js (PM2, port 3001) for WebSocket monitoring
- **Isolation:** MySQL instance separate from JTC, Redis for sessions/cache

## Tech Stack

HerPanel uses: Laravel 13 + Inertia.js + React + Node.js (PM2) + MySQL + Redis + Nginx.

### Project Conventions
- All code updates, fixes, and features must be committed and pushed to `origin/master` immediately after implementation (user preference: expects git push after every update/fix batch).
- Work one feature at a time, verify each step thoroughly ("jangan dipaksakan" directive: quality over speed, no rushing multiple tasks).
- Use concise responses, avoid spamming multiple messages — consolidate updates into one.

#### UI Conventions
All pages must follow consistent responsive patterns (match Domains/Databases pages):
1. **Search/create layouts**: Use `flex-col sm:flex-row gap-3` for stacking on mobile, horizontal on desktop (≥640px).
2. **Tables**: Wrap in `overflow-x-auto` with `min-w-[640px]` for horizontal scrolling on mobile.
3. **Mobile-specific elements**: Hide desktop-only action buttons on mobile with `hidden md:table-cell`.
4. **Mobile actions**: Clickable name to open bottom-sheet modal (like Domains page) for mobile action options.

### Known Issues
1. **Monitoring Menu**: Not displaying any content (reported 2026-05-06). Debug steps:
   - Verify PM2 `herpanel-monitoring` process is running: `pm2 list`
   - Check reverse proxy endpoints return 200: `/prometheus/`, `/node-exporter/`, `/socket.io/`
   - Check browser console for JS errors, verify Socket.IO connection
2. **Login Import Text**: Import information text on login page not visible (reported 2026-05-06). Debug steps:
   - Inspect `resources/js/Pages/Auth/Login.jsx` for text rendering
   - Check Tailwind text color/opacity classes (ensure contrast with dark mode background)
   - Verify no CSS hiding rules (e.g., `hidden`, `opacity-0`) applied to the text
3. **Database Create Redirect**: Form submit does not redirect to `/databases` after successful creation (ongoing). Added `/test-redirect` route to verify basic Inertia redirect; test with incognito mode, check browser console/network tab for POST `/databases` status.

## Design Principles
- Retain HerPanel's own professional UI/UX (CloudPanel-inspired, dark mode) when benchmarking against other hosting panels (e.g., aaPanel). Do not adopt external UI/UX conventions unless explicitly requested.

## Git Workflow
- Push all commits to GitHub (origin master) immediately after every update/fix batch, per user preference.
- **Force push**: Only use `git push origin master --force` with explicit user approval. Used to revert problematic commits (e.g., Phase 22 revert).
- For SSL setup, email system config, responsive design patterns, and detailed workflows, see [references/ssl-email-responsive-workflows.md](references/ssl-email-responsive-workflows.md)

## References\
- `references/aapanel-feature-comparison.md`: Feature gap analysis vs aaPanel, including design note to retain HerPanel's UI. (Confirmed)\
- `references/mobile-ui-patterns.md`: Mobile-specific UI/UX patterns, responsive design conventions, mobile detection, domain action modal patterns, and responsive form layouts.\
- `references/common-pitfalls.md`: Frequent errors, fixes, and workflow guidelines for HerPanel development.\
- `references/ssl-email-responsive-workflows.md`: SSL setup, email system config, and responsive design patterns.\
- `references/roundcube-setup.md`: Roundcube Webmail installation, configuration, Nginx integration, and troubleshooting.\
- `references/website-branding.md`: Pattern for changing Laravel default name to HerPanel + adding SVG favicon in Inertia stack.\
- `references/file-manager-implementation.md`: Per-domain file manager implementation (Phase 22) with controller, routes, React UI patterns.\
- `references/laravel13-queue-ssl-patterns.md`: Laravel 13 Queue job traits (`Queueable` not `Dispatchable`), SSL Certbot queue job pattern, ACME Nginx config, sudoers setup.\
- `references/blank-screen-debugging.md`: React ErrorBoundary pattern, build artifact cleanliness, browser tool limitations in containers, simplified component debugging approach. **Updated 2026-05-06 with Ziggy route error pattern.**\
- `references/blank-screen-debugging.md`: Updated with Ziggy route error fix pattern (2026-05-06).\\

## Completed Phases

### Phase 1: Infrastructure Setup ✅
1. Directory `/var/www/herpanel` created
2. Dependencies: PHP 8.3, Composer, Node.js v22, npm, MySQL 8.0, Redis (installed), Nginx
3. Laravel 13.4.0 + Breeze + Inertia.js + React installed
4. Database `herpanel_cpanel` + user `herpanel_user` created
5. `.env` configured (DB + Redis)
6. Migrations run
7. Dark mode Tailwind activated (`darkMode: 'class'`)
8. Git init, commit, push to GitHub

### Phase 2: Authentication System ✅
1. **Role Field:** Migration + User model + default 'user'
2. **CheckRole Middleware:** Role-based route protection (admin/reseller/user)
3. **Middleware Registered:** `$middleware->alias()` in `bootstrap/app.php`
4. **Dark Theme Applied:**
   - `app.blade.php` — html class="dark", body dark classes
   - `GuestLayout.jsx` — dark:bg-gray-900, dark:text-gray-400
   - `Login.jsx` — dark mode text colors
   - `AuthenticatedLayout.jsx` — dark:bg-gray-800, dark:text-gray-200/400
5. **Build Assets:** ✅ Success (npm run build)
6. **Git:** Committed & pushed

### Phase 3: Domain Management ✅
1. **Migration:** `create_domains_table` (user_id, domain_name, status, unique domain_name constraint)
2. **Model:** `Domain.php` with `belongsTo(User)` relation, fillable: user_id/domain_name/status
3. **Controller:** `DomainController.php` (index/create/store/destroy) with Inertia responses
4. **Routes:** Added to `web.php` (domains index/create/store/destroy)
5. **React Pages:**
6. **DNS Record Edit Feature (commit 047562d)**:
   - Frontend (Domains/Index.jsx): Added `editingRecord` state, `handleDnsEdit` function, dynamic submit/cancel buttons, edit button per DNS record
   - Backend: Added `dnsUpdate` method to `DomainController.php` with validation for type/name/content/ttl/priority
   - Routes: Added PUT route `domains/{domainId}/dns/{recordId}` for DNS updates
   - **Pitfall**: Always pair controller method with matching route; missing either causes 404 on edit. Run `npm run build` before committing, push immediately after commit per user workflow.
   - `Domains/Index.jsx` — Domain list with delete button + flash messages
   - `Domains/Create.jsx` — Add domain form with validation
6. **Navigation:** Added "Domains" link to `AuthenticatedLayout.jsx` sidebar
7. **Build:** `npm run build` ✅ Success
8. **Git:** Committed & pushed (commit afcb322)

### Phase4: File Manager ✅
1. **Controller:** `FileManagerController.php` (index/upload/mkdir/delete) using `Storage` facade
2. **Routes:** Added to `web.php` (file-manager index/upload/mkdir/delete)
3. **React Page:** `FileManager/Index.jsx` — File browser with breadcrumbs, upload, folder create, delete
4. **Storage:** `php artisan storage:link` (sandbox: `storage/app/filemanager`)
5. **Navigation:** Added "File Manager" link to `AuthenticatedLayout.jsx` sidebar
6. **Build:** `npm run build` ✅ Success
7. **Git:** Committed & pushed (commit 74161e9)

### Phase 4: Database Management ✅ (Updated May 2026 — phpMyAdmin Integration)
1. **Install phpMyAdmin:** `sudo apt-get install phpmyadmin` (select dbconfig-common, set password)
2. **Nginx Config for phpMyAdmin:**
   - Add location block `/phpmyadmin` with alias `/usr/share/phpmyadmin`
   - Nested location `~ \.php$` with fastcgi_pass to `unix:/run/php/php8.3-fpm.sock`
   - Test: `sudo nginx -t` then `sudo systemctl reload nginx`
   - Access: `http://43.134.37.14:8083/phpmyadmin/`
3. **Database Model:** `app/Models/Database.php`
   - Fields: `db_name`, `db_user`, `db_password` (encrypted via Laravel `encrypt()`), `character_set`, `collation`
   - Fillable: all fields except id/timestamps
   - Hidden: `db_password`
   - Relationship: `belongsTo(User)`
4. **Migration:** `create_databases_table.php`
   - `foreignId('user_id')->constrained()`
   - Unique constraint: `['user_id', 'db_name']`
5. **Controller:** `DatabaseManagementController.php`
   - `index()`: List databases for logged-in user
   - `create()`: Show create form
   - `store()`: Create MySQL database + user, grant privileges, flush privileges, save encrypted password to HerPanel DB
   - `edit()`: Show change password form
   - `update()`: Change database user password via `ALTER USER '{$user}'@'localhost' IDENTIFIED BY '{$password}'`
   - `destroy()`: Drop user first, then database, delete HerPanel record
   - `phpMyAdmin()`: Redirect to phpMyAdmin with DB name parameter
6. **React Components:**
   - `Databases/Index.jsx`: Grid list with actions (Change Password, phpMyAdmin, Delete)
   - `Databases/Create.jsx`: Form for DB name, user, password (min 8 chars), charset/collation
   - `Databases/Edit.jsx`: Password change form
   - `Databases/PhpMyAdminRedirect.jsx`: Credentials info + link to phpMyAdmin
7. **Routes:**
   - Resource routes: `databases.index/create/store/edit/update/destroy`
   - Additional: `databases.phpmyadmin` (GET)
8. **Build:** `npm run build` ✅ Success
9. **Git:** Committed & pushed (commit 8925570)

### Phase5: Email Management ✅ (May 2026)
1. **Install Mail Server:** `sudo DEBIAN_FRONTEND=noninteractive apt-get install -y postfix dovecot-core dovecot-imapd dovecot-pop3d dovecot-mysql`
2. **Migration:** `create_email_accounts_table.php`
   - Fields: `user_id`, `domain_id`, `email` (unique), `password` (encrypted), `quota_mb` (default 1024), `is_active`
   - Foreign keys: `user_id` → `users`, `domain_id` → `domains`
3. **Model:** `EmailAccount.php`
   - Fillable: user_id, domain_id, email, password, quota_mb, is_active
   - Relationships: `belongsTo(User)`, `belongsTo(Domain)`
   - Mutators: `setPasswordAttribute()` encrypts, `getDecryptedPasswordAttribute()` decrypts
4. **Controller:** `EmailController.php`
   - `index()`: List email accounts with domain relation
   - `create()`: Show form with domain dropdown
   - `store()`: Create account, validate domain ownership, save encrypted password
   - `edit()`: Show change password form
   - `update()`: Change password
   - `destroy()`: Delete account
5. **React Components:**
   - `Emails/Index.jsx`: Table list with status badges, quota display, search filter
   - `Emails/Create.jsx`: Form with domain selector, email prefix input, password, quota
   - `Emails/Edit.jsx`: Password change form
6. **Routes:** Added to `web.php` inside `Route::middleware('auth')->group()`
   - `emails.index/create/store/edit/update/destroy`
7. **Navigation:** Added "Emails" to sidebar (Services section, icon ✉, color sky-400)
8. **Build:** `npm run build` ✅ Success
9. **Git:** Committed & pushed (commit 02352ff, 106e685, 990fc49)
10. **❌ TODO Phase 5 (NOT YET DONE):**
    - ❌ **Postfix + Dovecot MySQL integration** (email accounts NOT functional for sending/receiving)
    - ❌ Email forwarding/aliases
    - ❌ Autoresponders
    - ❌ Email filters/spam settings

**Pitfall Fixed:** Missing `use App\Http\Controllers\EmailController;` in `web.php` caused "Target class [EmailController] does not exist". Always add `use` statements for new controllers.

### Phase6: Realtime Monitoring ✅
1. **Monitoring Server:** `monitoring/monitoring-server.js` (Node.js + Socket.io + systeminformation)
2. **NPM Dependencies:** Installed in `/var/www/herpanel/monitoring/` (socket.io, systeminformation, express)
3. **Package Config:** `monitoring/package.json` with start script: "start": "node monitoring-server.js"
4. **Laravel Controller:** `MonitoringController.php` — Pass `monitoringServerUrl` to Inertia view
5. **Environment:** Added `MONITORING_SERVER_URL=http://43.134.37.14:3001` to `.env`
6. **Nginx Reverse Proxy:** Added to `herpanel-ip` config:
   - `/prometheus/` → `http://127.0.0.1:9090/`
   - `/node-exporter/` → `http://127.0.0.1:9100/`
   - `/socket.io/` → `http://127.0.0.1:3001` (WebSocket upgrade)
7. **Routes:** Added `/monitoring` (auth protected) to `web.php`
8. **React Page:** `Monitoring/Index.jsx`:
   - Realtime CPU stats (usage %, model, cores) via WebSocket (2s interval)
   - RAM stats (used/total GB, percentage bar)
   - Disk usage (size, used, available, percentage per mount)
   - OS info (distro, platform, uptime)
   - Network stats (RX/TX bytes per interface)
   - Connection status indicator (green/red dot)
9. **PM2 Setup:** 
   - `npm install -g pm2`
   - `cd /var/www/herpanel/monitoring && pm2 start npm --name "herpanel-monitoring" -- start`
   - `pm2 save && pm2 startup` (auto-start on reboot)
10. **Navigation:** Added "Monitoring" link to `AuthenticatedLayout.jsx` sidebar
11. **Build:** `npm run build` ✅ Success (installed socket.io-client with `--legacy-peer-deps`)
12. **Git:** Committed & pushed (commit 51731d8, then b480cf0 after removing node_modules)
13. **✅ Latest Version (2026-05-07):** Monitoring page fix applied — PM2 `herpanel-monitoring` running, Nginx reverse proxy configured correctly, frontend connects via `window.location.origin` path `/socket.io/`. Blank page issue resolved.
- **Pitfall Fixed:** Added `monitoring/.gitignore` to exclude `node_modules/`, `*.log`, `package-lock.json`
- **Default Route Pitfall:** Laravel's default `/` route shows welcome page; always redirect to `/login` in `routes/web.php` for cPanel UX
- **File Manager Behavior:** Only enforces 10MB size limit, no file type restrictions (`.html` and all other types are allowed)
- **DNS Propagation Delay:** Use port-based Nginx setup (mirror `trading-monitor`) if DNS for `panel.eatrade-journal.site` is not propagated yet

### Phase7: Deployment (Nginx Setup) ✅ Completed (2026-05-07)
1. **Nginx Server Block**: Created `/etc/nginx/sites-available/herpanel` (HTTP only, listen 80)
2. **Fixed .env**: Changed `DB_CONNECTION=sqlite` to `mysql` with correct `herpanel_cpanel` credentials
3. **DNS Workaround (Port Setup)**: Mirror `trading-monitor` for DNS-delayed access:
   - Use free port (e.g., 8083, avoid 8080/8081/8082 already in use)
   - Create `/etc/nginx/sites-available/herpanel-ip` with `listen 8083; server_name _;`
   - Update `.env` APP_URL to `http://43.134.37.14:8083`
   - Test with `sudo nginx -t && sudo systemctl reload nginx`
4. **WebSocket Proxy**: Add to Nginx config for monitoring:
   ```nginx
   location /socket.io/ {
       proxy_pass http://127.0.0.1:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
   }
   ```
5. **Route Fix**: Redirect `/` to `/login` in `routes/web.php` (default Laravel welcome page is not useful for cPanel)
6. **Quick User Creation**: For testing, use `php artisan tinker` to create accounts:
   ```bash
   php artisan tinker --execute="App\Models\User::create(['name' => 'Admin', 'email' => 'admin@herpanel.com', 'password' => bcrypt('admin123'), 'role' => 'admin']);"
   ```
7. **Migrations**: Ran `php artisan migrate:fresh --force` to rebuild all tables
8. **Cache Clear**: Cleared Laravel config/cache/route cache
9. **Permissions**: Set `storage` and `bootstrap/cache` to `www-data:www-data`
10. **Nginx Test**: `sudo nginx -t` passed
11. **WebSocket Proxy**: Added `/socket.io/` proxy to port 3001 for monitoring realtime
12. **PM2 Status**: `herpanel-monitoring` process running (port 3001)
13. **IP-Based Access**: Created `/etc/nginx/sites-available/herpanel-ip` (listen 8083, `server_name _;`) mirroring `trading-monitor` setup
14. **Enabled IP Site**: Symlinked to `/etc/nginx/sites-enabled/herpanel-ip`, reloaded Nginx
15. **Updated APP_URL**: Set `APP_URL=http://43.134.37.14:8083` in `.env` for IP access
16. **Active Interim Access**: Port 8083 live, accessible via `http://43.134.37.14:8083` (no DNS needed)
17. **SSL Setup**: ✅ `drizdev.space` SSL active (Certbot, expires 2026-08-04)
18. **✅ DNS Cleanup (2026-05-07)**: Removed `panel.eatrade-journal.site` DNS A record (dig returns empty)
19. **✅ Browser Testing (2026-05-07)**: `https://drizdev.space` tested via curl - HTTPS working, redirects to `/login` correctly, SSL active
20. **✅ Nginx Config Cleanup (2026-05-07)**: Removed stale `eatrade-journal` symlink from `sites-enabled/`, fixed SSL cert path to use `drizdev.space` certificates
21. **Main Access**: ✅ `https://drizdev.space` (production), `http://43.134.37.14:8083` (IP fallback)

## Completely Unworked Features ❌

Fitur-fitur berikut **belum dikerjakan sama sekali** (berdasarkan standar hosting panel seperti cPanel/aaPanel/CloudPanel):

### 1. FTP Management ❌
   - FTP user accounts
   - FTP sessions management
   - FTP quota/limits

### 2. Softaculous / App Installer ❌
   - WordPress installer
   - Joomla, Drupal, Magento, etc.
   - One-click app deployment

### 3. Metrics & Analytics ❌
   - Bandwidth usage per domain
   - Visitors statistics
   - Detailed error logs viewer
   - Access/error log analysis

### 4. Advanced SSL Management ❌
   - Paid SSL certificate upload (not just Let's Encrypt)
   - CSR generator
   - Private key management
   - SSL expiration notifications

### 5. Git Deployment ❌
   - Auto-deploy dari GitHub/GitLab
   - Webhook integration
   - Deployment scripts

### 6. Advanced Multi-User / Reseller ❌
   - Reseller packages (resource limits)
   - Per-user disk/bandwidth quotas
   - Reseller billing integration
   - White-label options

### 7. Advanced PHP Management ❌
   - php.ini editor
   - PHP extensions management (enable/disable)
   - PHP configuration presets
   - OPcache management

### 8. API Access ❌
   - REST API untuk reseller/integration
   - API key management
   - Rate limiting

### 9. Notification System ❌
   - Email notifications (SSL expire, backup done, etc.)
   - Telegram/Discord webhook notifications
   - Custom notification rules

### 10. Backup Restore ❌
   - Restore dari backup file (baru create/download)
   - Scheduled backup with retention
   - Remote backup (S3, Google Drive, etc.)

### 11. Node.js / Python / Ruby Apps ❌
   - App deployment selain PHP
   - Custom runtime versions
   - App process management (PM2 for user apps)

### 12. SSL Auto-Apply for ALL Domains ❌
   - Auto-generate SSL saat add domain baru
   - Bulk SSL renewal
   - Wildcard certificate support

---

## Standard Feature Implementation Workflow
 
1. **Database Layer**: Create migration + model (with fillable attributes, relationships to User). Run `php artisan migrate`.
2. **Controller**: Create controller with Inertia responses for React pages, auth checks via `auth()->id()`.
3. **Routes**: Add to `routes/web.php` inside `Route::middleware('auth')->group()` with named routes.
4. **React Pages**: Create in `resources/js/Pages/<Feature>/` (Index for lists, Create for forms). Use Inertia `useForm`, `Link`, `router`. Apply dark mode Tailwind classes.
5. **Navigation**: Update `resources/js/Layouts/AuthenticatedLayout.jsx` to add NavLink. **Warning**: Read full file before patching to avoid overwrite issues from partial reads.
6. **Build**: Run `cd /var/www/herpanel && npm run build` (fix all build errors first).
7. **Git**: Commit with descriptive message, then push to master (per user preference: push every batch):
   ```bash
   git add . && git commit -m "Phase X: Feature Name - details" && git push origin master
   ```
8. **Design Application** (when user provides design reference):
   - Save design reference file (`.html`/`.txt`/`.md`) in project
   - Update `tailwind.config.js` with custom colors/fonts
   - Update `resources/css/app.css` with CSS variables and effects
   - Update `resources/views/app.blade.php` with Google Fonts/required meta
   - Rewrite `AuthenticatedLayout.jsx` and page components with new design classes
   - Run `npm run build`, commit & push
9. **One Feature at a Time**: Follow "jangan dipaksakan" rule: complete all steps for one feature before starting the next.

### Monitoring Architecture

### Dual Monitoring Sources
HerPanel uses two monitoring sources:
1. **Custom Socket.IO Server** (port 3001) - Real-time via WebSocket
2. **Prometheus + node_exporter** (ports 9090 + 9100) - Historical metrics

### ⚠ Critical: Localhost-Only Services Require Nginx Reverse Proxy
Prometheus (9090) and node_exporter (9100) are bound to `127.0.0.1` only for security. The browser client **cannot** access these directly via `43.134.37.14:9090`. All access must go through Nginx reverse proxy paths on port 8083.

**Nginx proxy routes (in `/etc/nginx/sites-available/herpanel-ip`):**
- `/prometheus/` → `http://127.0.0.1:9090/`
- `/node-exporter/` → `http://127.0.0.1:9100/`
- `/socket.io/` → `http://127.0.0.1:3001` (WebSocket upgrade)

**Frontend connection pattern (Monitoring/Index.jsx):**
- Socket.IO: `io(window.location.origin, { path: '/socket.io/' })` — connects via same-origin Nginx proxy
- node_exporter metrics: `fetch(window.location.origin + '/node-exporter/metrics')` — fetches via Nginx proxy
- Never use direct `http://IP:PORT` URLs in frontend code for localhost-bound services

### Prometheus + node_exporter (Pre-installed)
- **Prometheus**: `127.0.0.1:9090` (user `prometh+`)
- **node_exporter**: `127.0.0.1:9100` (user `nobody`)
- **Config**: `/etc/prometheus/prometheus.yml`
- **Scrape Jobs**: `node` (for node_exporter), `trading-monitor` (for custom monitoring)
- **Security**: Both bound to `127.0.0.1` only — use Nginx reverse proxy for browser access

### Directory Structure
```
/var/www/herpanel/monitoring/
├── monitoring-server.js    # Node.js + Socket.io + systeminformation
├── package.json            # Dependencies + start script
├── .gitignore             # Excludes node_modules/, *.log, package-lock.json
└── node_modules/          # (gitignored)
```

### Monitoring Server (monitoring-server.js)
- **Express + Socket.io**: HTTP server with WebSocket on port 3001
- **systeminformation**: Fetches CPU, RAM, Disk, Network, OS data
- **Realtime Push**: Sends stats every 2 seconds to connected clients
- **CORS**: Configured to allow all origins (restrict in production)

### Stats Payload Structure
```javascript
{
  cpu: { usage: %, cores, model },
  memory: { total, used, free: GB, usagePercent: % },
  disk: [{ filesystem, size, used, available, usePercent, mount }],
  os: { platform, distro, release, uptime },
  network: [{ interface, rx_bytes, tx_bytes: MB }],
  timestamp: ISO string
}
```

### PM2 Process Management
```bash
# Install PM2 globally
npm install -g pm2

# Start monitoring server
cd /var/www/herpanel/monitoring
pm2 start npm --name "herpanel-monitoring" -- start

# Save process list & enable startup
pm2 save
pm2 startup  # Follow the systemd instructions it outputs
```

### Laravel Integration
- **Controller**: `MonitoringController.php` passes `monitoringServerUrl` and `prometheusUrl` to Inertia view
- **Environment**: `MONITORING_SERVER_URL=http://43.134.37.14:8083` and `PROMETHEUS_URL=http://43.134.37.14:8083/prometheus` in `.env`
- **Frontend ignores these props**: Monitoring/Index.jsx uses `window.location.origin` + Nginx proxy paths instead (more reliable than hardcoded env URLs)
- **Install client**: `cd /var/www/herpanel && npm install socket.io-client --save --legacy-peer-deps`

### React Page Features (Monitoring/Index.jsx)
- Connection status: Prometheus (node_exporter) + Socket.IO indicators
- Auto-refresh toggle (5s/10s/30s/60s intervals)
- Manual refresh button
- CPU, Memory, Disk, Uptime stat cards
- Network traffic panel (RX/TX)
- System info panel (OS, Platform, Kernel, Architecture)
- Live metrics stream grid

## Deployment (Phase 7)
### Nginx Configuration
- Server block: `/etc/nginx/sites-available/herpanel`
- Listen: Port 80 (HTTP only, pending SSL)
- Root: `/var/www/herpanel/public`
- PHP-FPM socket: `/run/php/php8.3-fpm.sock`
- WebSocket proxy: `/socket.io/` → `http://127.0.0.1:3001` (for monitoring realtime)

#### IP-Based Access (DNS Workaround)
When DNS propagation is delayed, set up a dedicated Nginx server block on a free port (e.g., 8083) mirroring `trading-monitor` (port 8080, `server_name _;`):
- **Nginx Config**: `/etc/nginx/sites-available/herpanel-ip` (listen 8083, `server_name _;`)
- **Template**: See `templates/nginx-herpanel-ip.conf` for full config
- **Access URL**: `http://43.134.37.14:8083` (no DNS required)
- **Setup Steps**:
  ```bash
  # Create Nginx config (use template)
  sudo cp ~/.hermes/skills/projects/herpanel/templates/nginx-herpanel-ip.conf /etc/nginx/sites-available/herpanel-ip
  sudo ln -sf /etc/nginx/sites-available/herpanel-ip /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl reload nginx
  # Update Laravel APP_URL
  cd /var/www/herpanel
  sed -i 's|APP_URL=.*|APP_URL=http://43.134.37.14:8083|' .env
  php artisan optimize:clear
  ```
- **Verify**: `curl -I http://127.0.0.1:8083` returns HTTP 200 OK

### DNS Setup (Pending)
Add A record at registrar/DNS provider:
```
Type: A
Name: panel
Value: 43.134.37.14
TTL: 300 or Auto
```
Wait 5-60 minutes for propagation.

### SSL Certbot (After DNS Propagates)
```bash
sudo certbot --nginx -d panel.eatrade-journal.site
```
Certbot will automatically modify Nginx config to enable HTTPS (port 443) and redirect HTTP to HTTPS.

### Browser Testing (After SSL)
1. Visit `https://panel.eatrade-journal.site`
2. Register new user → Login → Dashboard
3. Test all MVP features: Domains, File Manager, Databases, Monitoring
4. Verify WebSocket monitoring works (realtime stats update)

## Pitfalls
- See [references/blank-dashboard-debug.md](references/blank-dashboard-debug.md) for steps to debug blank dashboard/page issues.
 & Lessons

### PHP `use` Statement Duplication
**Issue**: Adding the same `use` statement twice in `web.php` causes fatal error: `Cannot use [Class] as [Class] because the name is already in use`.
**Root Cause**: Patching `web.php` without checking existing `use` statements, or multiple patches adding the same line.
**Symptom**: `PHP Fatal error: Cannot use App\\Http\\Controllers\\BackupController as BackupController because the name is already in use in /var/www/herpanel/routes/web.php`
**Fix**:
1. Always check existing `use` statements before patching: `grep "use App\\\\Http" routes/web.php`
2. Remove duplicates by reading the full file and filtering unique `use` lines:
```python
lines = content.split('\n')
seen = set()
new_lines = []
for line in lines:
    stripped = line.strip()
    if stripped.startswith('use ') and stripped in seen:
        continue
    if stripped.startswith('use '):
        seen.add(stripped)
    new_lines.append(line)
```
3. Verify with `php -l routes/web.php` after patching.
**Prevention**: When adding new controllers, check if `use` statement already exists. Prefer using `ControllerClass::class` without `use` statement — Laravel resolves the full namespace automatically.

### PHP Version Installation on Ubuntu 24.04 (Noble)
**Issue**: `apt install php8.1` or `php8.2` fails with "Unable to locate package" on Ubuntu 24.04.
**Root Cause**: Default Ubuntu Noble repositories only include PHP 8.3.
**Fix**: Add Ondřej Surý PPA before installing older versions:
```bash
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update
sudo apt install -y php8.1-fpm php8.2-fpm php8.1-mysql php8.2-mysql # etc.
```
**Context**: Encountered during Phase 20 implementation. Required for multi-PHP support.

### Git Commit Special Characters (`&`)
**Issue**: Running `git commit -m "message & more"` via the `terminal` tool fails with "Foreground command uses '&' backgrounding".
**Root Cause**: The `terminal` tool interprets `&` as a shell background operator, even inside quoted strings.
**Fix**: Avoid `&`, `|`, `>`, `>>` in commit messages when using the `terminal` tool. Use simple alphanumeric messages or use `git commit` without special characters.
**Context**: Encountered during Phase 20 push to GitHub.

### node_exporter Disk Metrics Correction
**Issue**: When patching PHP files to add new `use` statements (e.g., `use Illuminate\Support\Facades\Response;`), the patch can introduce double backslashes (`\\`) in ALL existing `use` statements.
**Symptom**: `ParseError: syntax error, unexpected fully qualified name "\Http", expecting "{"` in FileManagerController.php
**Root Cause**: The patch replacement logic escapes backslashes, turning `use X\Y;` into `use X\\Y;`.
**Fix**: After patching PHP `use` statements, immediately verify with `php -l file.php`. If error, restore with `git checkout -- file.php` and manually edit the file instead of patching.
**Prevention**: When adding `use` statements, manually write the whole block or edit file directly instead of using `patch` with backslash-containing strings.

### node_exporter Disk Metrics Correction
**Issue**: Disk usage shows 0% or "N/A" on Dashboard/Monitoring pages.
**Wrong Metrics** (DO NOT USE):
- `node_disk_total_bytes` — **DOES NOT EXIST** in node_exporter
- `node_disk_free_bytes` — **DOES NOT EXIST** in node_exporter
**Correct Metrics**:
- `node_filesystem_size_bytes` — Total filesystem size
- `node_filesystem_free_bytes` — Free space available
**Filtering Required**:
```javascript
// CORRECT — filter for root mountpoint, exclude tmpfs
if (line.startsWith('node_filesystem_size_bytes') && line.includes('mountpoint="/"') && !line.includes('fstype="tmpfs"')) {
    metrics.diskTotal = parseFloat(line.split(' ')[1]);
}
```
**Context**: Fixed in Phase 13 for Dashboard.jsx and Monitoring/Index.jsx.

### File Wipe Risk with execute_code + write_file
**Issue**: Using `execute_code` to read a file, then `write_file` to write back can accidentally wipe the file to empty if the content object is misparsed.
**Example**: `read_file()` returns a dict `{"content": "..."}`, but script treated it as the content itself, causing `write_file()` to receive empty/None.
**Fix**: If file gets wiped, restore immediately: `git checkout -- filename`.
**Prevention**: After using `execute_code` to modify files, verify file size with `head -10 filename` before committing. Prefer using `patch` or manual edits over `execute_code` + `write_file` for critical files.

### npm Peer Dependency Conflict
**Error:** `npm ERR! ERESOLVE unable to resolve dependency tree` (vite@8 vs @vitejs/plugin-react@4)
**Fix:** Use `npm install --legacy-peer-deps` instead of `npm install`
**Context:** Breeze React stack on Laravel 13 with Vite 8.x

### .env DB_CONNECTION Misconfiguration
**Issue**: Initial `.env` had `DB_CONNECTION=sqlite`, causing Laravel to use SQLite instead of the dedicated MySQL database `herpanel_cpanel`.
**Fix**: Update `.env` to `DB_CONNECTION=mysql` and set correct MySQL credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=herpanel_cpanel
DB_USERNAME=herpanel_user
DB_PASSWORD=your_password
```
**Context**: Fixed in Phase 7 deployment prep.

### Memory Management
**Issue:** Memory limit (2,200 chars) reached quickly with long entries.
**Solution:**
- Create skills for detailed info (e.g., `jtc-email-smtp`, `domain-dns-setup`)
- Keep memory entries short with skill references
- Remove outdated/less-used entries (e.g., XMpanel, Terminal tool note)

### Role Migration Pattern
**Correct way to add role field:**
1. `php artisan make:migration add_role_to_users_table --table=users`
2. In migration: `$table->string('role')->default('user')->after('password');`
3. In User model: add 'role' to `#[Fillable]` attribute
4. Run `php artisan migrate --force`

### Gmail App Password for Project
**Setup:**
1. Enable 2FA on Gmail → Generate App Password (16 chars)
2. Save in memory with SMTP config
3. Use in Laravel `.env`: MAIL_PASSWORD=apppassword (no spaces)

### Partial File Read Overwrite Risk
**Issue**: When editing `AuthenticatedLayout.jsx` (or other large files) with offset/limit pagination, patches may overwrite sibling agent changes or miss context.
**Fix**: Always read the full file with `read_file` (no offset/limit) before patching.

### Database Direct Operations
**Context**: HerPanel creates/drops MySQL databases directly via `DB::statement()`.
**Pattern**:
- Validate db name with regex: `regex:/^[a-zA-Z0-9_]+$/`
- Auto-prefix db names: `user_{auth()->id()}_` to avoid conflicts
- Wrap in try/catch to handle MySQL errors

### File Manager Sandboxing
**Rule**: Restrict all file operations to `storage/app/filemanager` via `$basePath = 'filemanager'` in controller.
**Setup**: Run `php artisan storage:link` to create public symlink for file access.

### Monitoring node_modules in Git
**Issue**: When creating `monitoring/` directory with `npm install`, the `node_modules/` gets committed if no `.gitignore` exists.
**Fix**: Create `monitoring/.gitignore` before first commit:
```text
node_modules/
*.log
npm-debug.log*
package-lock.json
```
**Recovery**: If already committed, run:
```bash
cd /var/www/herpanel
git rm -r --cached monitoring/node_modules
git commit -m "Remove monitoring/node_modules from tracking"
```

### HTML Design File Handling
**Issue**: When user sends `.html` design files, the `read_file` tool returns "Unsupported document type '.html'" (only supports .txt, .md, .json, .yaml, etc.)
**Fix**: 
1. Ask user to **paste the HTML code directly** into chat (as text)
2. Or save the file with `.txt`/`.md` extension first: `resources/views/nexpanel-reference.txt`
3. For design references, save as `.html` in project but document in `references/nexpanel-design.md`
**Context**: Occurred in Phase 8 when user sent NexPanel HTML design file.

### DNS Propagation Delays
**Issue**: DNS A record changes can take 5-60+ minutes to propagate globally.
**Workaround**: Use IP-based access (port 8083) as interim solution (see Deployment > IP-Based Access).
**Check Propagation**:
```bash
dig @8.8.8.8 panel.eatrade-journal.site +short
# Should return 43.134.37.14 when propagated
```

### Local Nginx Testing Without Host Header
**Issue**: Accessing Nginx via `curl http://127.0.0.1` (no Host header) serves the default server block (e.g., pos-system) instead of HerPanel.
**Fix**:
1. Use Host header: `curl -I http://127.0.0.1 -H "Host: panel.eatrade-journal.site"`
2. Use dedicated IP port: `curl -I http://127.0.0.1:8083`

### Storage Logs Permission Error
**Issue**: `UnexpectedValueException: stream or file "/var/www/herpanel/storage/logs/laravel.log" could not be opened in append mode: Permission denied`
**Fix**: `sudo chown -R www-data:www-data /var/www/herpanel/storage/logs`
**Context**: Occurs when www-data needs to write to logs directory

### Localhost-Bound Services Not Reachable from Browser
**Issue**: Monitoring page shows "Loading metrics..." forever with no data. Prometheus/node_exporter only bind to `127.0.0.1`, but `.env` has `PROMETHEUS_URL=http://43.134.37.14:9090` — browser cannot reach `43.134.37.14:9090`.
**Diagnosis**: Run `ss -tlnp | grep 9090` — if it shows `127.0.0.1:9090`, it's localhost-only.
**Fix**: Add Nginx reverse proxy locations and use `window.location.origin` + proxy path in frontend:
```nginx
# In /etc/nginx/sites-available/herpanel-ip
location /prometheus/ {
    proxy_pass http://127.0.0.1:9090/;
}
location /node-exporter/ {
    proxy_pass http://127.0.0.1:9100/;
}
```
```javascript
// In React — never use direct IP:port for localhost services
const url = window.location.origin + '/node-exporter/metrics';
const socket = io(window.location.origin, { path: '/socket.io/' });
```
**Rule**: Any service bound to `127.0.0.1` must be proxied through Nginx. Never put `http://PUBLIC_IP:LOCALHOST_PORT` in frontend code.

### Nginx Config: Avoid `sed` for Nested Location Blocks
**Issue**: Using `sed` to insert nested location blocks (e.g., adding `/phpmyadmin` location inside an existing server block) causes syntax errors — blocks get incorrectly nested.
**Symptom**: `nginx: [emerg] location "/phpmyadmin" is outside location "/node-exporter/"` or similar nesting errors.
**Fix**: Rewrite the entire Nginx config file instead of patching with `sed`:
```bash
sudo bash -c 'cat > /etc/nginx/sites-available/herpanel-ip << EOF
<full server block content>
EOF'
```
Always verify with `sudo nginx -t` before reloading.
**Context**: Occurred in May 2026 session when adding phpMyAdmin location to HerPanel Nginx config.

### Laravel Breeze Dark Mode Missing Classes
**Issue**: Login/Register/ForgotPassword pages have invisible text and inputs in dark mode. Breeze's default React components (`InputLabel`, `TextInput`, `PrimaryButton`, `Checkbox`) only include light-mode Tailwind classes.
**Fix**: Add `dark:*` classes to each component:
- `InputLabel.jsx`: Add `dark:text-gray-300` alongside `text-gray-700`
- `TextInput.jsx`: Add `dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-400`
- `PrimaryButton.jsx`: Use `bg-indigo-600` scheme with `dark:focus:ring-offset-gray-800`
- `Checkbox.jsx`: Add `dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-500`
**Context**: Occurs because `app.blade.php` sets `class="dark"` on `<html>`, activating all `dark:` variants, but Breeze components have none.

### MySQL Privilege Pitfall (Database Creation)
**Issue**: Creating separate MySQL users via `CREATE USER` + `GRANT` requires SUPER or GRANT OPTION privileges. Regular app users (like `herpanel_user`) typically don't have these.
**Symptom**: Form "stuck" on create, no database created, possibly MySQL error 1410 "You are not allowed to create a user with GRANT".
**Fix**: Simplify `store()` to only create databases, not users:
```php
// ❌ DON'T DO THIS (requires elevated privileges)
DB::statement("CREATE USER IF NOT EXISTS '{$user}'@'localhost' IDENTIFIED BY '{$password}'");
DB::statement("GRANT ALL PRIVILEGES ON `{$db}`.* TO '{$user}'@'localhost'");

// ✅ DO THIS INSTEAD
DB::statement("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET {$charSet} COLLATE {$collation}");
// Save credentials to HerPanel DB for display/phpMyAdmin access
Database::create([
    'user_id' => Auth::id(),
    'db_name' => $dbName,
    'db_user' => $dbUser,
    'db_password' => encrypt($dbPassword),
]);
```
**Context**: Fixed in May 2026 session after user reported "saat mencoba menambah database gagal stuck di form add database".

### Mobile Domain Table Action Buttons
**Issue**: Action buttons (DNS, SSL, Delete) in domain table rows overflow or are not visible on mobile devices (<768px width).
**Fix**: Wrap action buttons in a `flex flex-wrap` container to allow wrapping on narrow screens:
```jsx
<td className="px-5 py-3.5 border-b border-hpBorder/50 text-right">
    <div className="flex flex-wrap items-center justify-end gap-2">
        {/* DNS, SSL, Delete buttons */}
    </div>
</td>
```
**Context**: Fixed in May 2026 session to improve mobile usability for HerPanel Domains page.

### Mobile DNS Form Responsive Layout
**Issue**: DNS record form in modal stacks incorrectly or overflows on mobile devices.
**Fix**: Use responsive grid `grid-cols-1 sm:grid-cols-2` to stack vertically on mobile (stacks at <640px, 2 columns at ≥640px):
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
    {/* Type and Name form fields */}
</div>
```
**Context**: Fixed in May 2026 session for HerPanel Domains page DNS management modal.

### Mobile Domain Click Action
**User Requirement**: On mobile devices, clicking the domain name should open a bottom-sheet modal with DNS, SSL, and Delete action options (instead of using row action buttons).
**Implementation Pattern**:
1. Detect mobile via `useState` with `window.innerWidth < 768` and resize listener.
2. Add `onClick` handler to domain name cell that triggers mobile action modal only when `isMobile` is true.
3. Mobile action modal uses `md:hidden` to only render on mobile, with fixed bottom sheet styling:
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
**Context**: Added in May 2026 session per user request for better mobile UX.

### DNS Record Edit Feature Pitfall
**Issue**: DNS record edit functionality requires both frontend state management (`editingRecord`) and matching backend `dnsUpdate` method + PUT route. Missing any component causes edit to fail.
**Fix**: Ensure all three parts are implemented together:
1. Frontend: `editingRecord` state, `handleDnsEdit` function, dynamic submit/cancel buttons
2. Backend: `dnsUpdate` method in DomainController with validation
3. Routes: PUT route `domains/{domainId}/dns/{recordId}`
**Context**: Fixed in commit 047562d for HerPanel Domains page.

### Blank Page / Site Not Loading - Debugging Workflow\n**Symptom**: Browser shows blank page, no content, or infinite loading.\n**Common Root Causes**:\n1. **Unused files with stale configs**: e.g., `resources/js/ziggy.js` with old URLs (port 8083) conflicting with current setup\n   - **Fix**: Remove unused files: `rm -f resources/js/ziggy.js`\n2. **Build assets not accessible**: JS/CSS files return 404 or hang\n   - **Test**: `curl -s -o /dev/null -w "%{http_code}\n" https://drizdev.space/build/assets/app-xxx.js -k`\n   - **Fix**: Rebuild: `cd /var/www/herpanel && npm run build`\n3. **Permission denied**: `www-data` cannot write to `storage/` or `bootstrap/cache/`\n   - **Fix**: `sudo chown -R www-data:www-data /var/www/herpanel/storage /var/www/herpanel/bootstrap/cache`\n4. **Stale caches**: Old config/route cache pointing to deleted classes\n   - **Fix**: `php artisan optimize:clear`\n5. **Services not running**: PHP-FPM, Nginx, MySQL, Redis down\n   - **Test**: `systemctl status php8.3-fpm nginx mysql redis-server`\n\n**Debug Steps (in order)**:\n1. Check HTML output: `curl -s https://drizdev.space/login -k | head -20` (look for Inertia data-page)\n2. Check Laravel log: `tail -30 /var/www/herpanel/storage/logs/laravel.log`\n3. Check Nginx error log: `sudo tail -20 /var/log/nginx/herpanel_error.log`\n4. Check PHP-FPM log: `sudo tail -20 /var/log/php8.3-fpm.log`\n5. Check storage permissions: `ls -la /var/www/herpanel/storage/logs/`\n6. Check for unused/stale files: `git status` (look for untracked files like ziggy.js)\n7. Verify build assets accessible: `curl -I https://drizdev.space/build/assets/app-xxx.js -k`\n8. Clear all caches: `php artisan optimize:clear`\n9. Rebuild assets: `npm run build`\n10. Restart services: `sudo systemctl restart php8.3-fpm nginx`\n\n**Browser-Side Checks**:\n- Hard refresh: `Ctrl + F5` (Windows/Linux) or `Cmd + Shift + R` (Mac)\n- Check Console tab (F12) for JavaScript errors\n- Try Incognito/Private window\n\n**Context**: Blank page debugging session (2026-05-06). Found unused `ziggy.js` with stale URLs, removed it, rebuilt assets, cleared caches, and verified. Issue likely browser cache or client-side JS error.\n\n### Error 500 Universal Debugging Workflow\n**Symptom**: All pages return HTTP 500, Laravel log may not show new errors (error occurs before Laravel boots fully).\n**Common Root Causes**:\n1. Stale controller references in `routes/web.php` with deleted controller files (e.g., `TestController` removed from routes but file still exists, or vice versa)\n2. Incorrect Nginx site configs with `proxy_pass` to non-existent ports (e.g., port 8000 not running)\n   - **Real case (2026-05-06)**: Stale symlink `jurnal-trading` in `/etc/nginx/sites-enabled/` pointed to config with `proxy_pass http://127.0.0.1:8000`. Port 8000 not running → connection refused → 500.\n   - **Fix**: `sudo rm /etc/nginx/sites-enabled/jurnal-trading && sudo nginx -t && sudo systemctl reload nginx`\n3. `www-data` user cannot write to `storage/` or `bootstrap/cache/` (permission denied)\n   - **Real case (2026-05-06)**: `storage/` owned by `ubuntu:ubuntu`, PHP-FPM runs as `www-data` → cannot write session/cache/log → 500.\n   - **Fix**: `sudo chown -R www-data:www-data /var/www/herpanel/storage /var/www/herpanel/bootstrap/cache && sudo find /var/www/herpanel/storage -type d -exec chmod 775 {} \; && sudo find /var/www/herpanel/storage -type f -exec chmod 664 {} \;`\n4. Cached route/config pointing to deleted classes\n5. Leftover controller files (e.g., `TestController.php`) after removing routes

**Debug Steps**:
1. Check Nginx error log for upstream connection failures: `sudo tail -30 /var/log/nginx/error.log`
2. Check for stale controllers: `grep -r "TestController" routes/ app/Http/Controllers/ --include="*.php"` then delete leftover files
3. Check enabled Nginx site configs: `ls /etc/nginx/sites-enabled/` and verify no configs proxy to unused ports
4. Verify PHP-FPM is running: `systemctl status php8.3-fpm`
5. Test www-data write access: `sudo -u www-data test -w /var/www/herpanel/storage/ && echo "OK" || echo "FAIL"`
6. Clear all Laravel caches: `cd /var/www/herpanel && php artisan route:clear && php artisan config:clear && php artisan view:clear && php artisan cache:clear`
7. Fix permissions if needed: `sudo chown -R www-data:www-data /var/www/herpanel/storage /var/www/herpanel/bootstrap/cache && sudo find /var/www/herpanel/storage -type d -exec chmod 775 {} \; && sudo find /var/www/herpanel/storage -type f -exec chmod 664 {} \;`
8. Restart services: `sudo systemctl restart php8.3-fpm nginx`

**Context**: Fixed in 2026-05-06 session where stale `TestController` reference, `jurnal-trading` Nginx config proxying to port 8000, and bad permissions caused site-wide 500 errors.

#### Feature Removal Checklist (Avoid Partial Cleanup Errors)
When removing a feature (like Phase 24 Email), **must** check ALL these locations to avoid Ziggy route errors (`route 'X' is not in the route list`):
1. ✅ `routes/web.php` - Remove `use Controller;` statements AND route definitions
2. ✅ `resources/js/Layouts/AuthenticatedLayout.jsx` - Check TWO places:
   - `navSections` array (sidebar menu items with `route: 'feature.index'`)
   - `getPageTitle()` function (title mappings)
3. ✅ `resources/js/Pages/<Feature>/` - Delete entire folder
4. ✅ `app/Http/Controllers/` - Delete controller file
5. ✅ `app/Models/` - Delete model file
6. ✅ `resources/js/app.jsx` - Will auto-regenerate on `npm run build`
7. ✅ Run `npm run build` after cleanup to regenerate Ziggy routes
8. ✅ Test: `grep -r "feature.index" resources/ public/build/ 2>/dev/null` should return empty

**Real case (2026-05-06)**: Removed Phase 24 Email but forgot `emails.index` in `AuthenticatedLayout.jsx` → Ziggy error. Fixed by patching both `navSections` and `getPageTitle()`.

### React Error Boundary Pattern (Debugging Blank Screens)
When debugging blank screens, wrap the Inertia App with an Error Boundary to capture rendering errors instead of empty page:
```jsx
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('React Error:', error, errorInfo);
        this.setState({ errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'white', backgroundColor: '#1a1a1a' }}>
                    <h1 style={{ color: '#ef4444' }}>⚠️ Application Error</h1>
                    <pre style={{ backgroundColor: '#000', padding: '10px', borderRadius: '5px' }}>
                        {this.state.error?.toString()}
                    </pre>
                    {this.state.errorInfo && (
                        <>
                            <h3>Component Stack:</h3>
                            <pre style={{ backgroundColor: '#000', padding: '10px', borderRadius: '5px' }}>
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </>
                    )}
                    <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
// In createInertiaApp setup():
root.render(<ErrorBoundary><App {...props} /></ErrorBoundary>);
```
**Benefit**: Shows exact error instead of blank screen. Add to `resources/js/app.jsx`.

### Simplified Component Debugging
When a complex component (e.g., Dashboard.jsx with socket.io/node_exporter) causes blank screen:
1. Replace with minimal version first (just render static text like "Dashboard working!")
2. Test if page loads
3. Gradually add back features one by one
4. This isolates whether the blank screen is from component logic vs. routing/authentication

### Browser Tool Limitation in Containers
`browser_navigate` tool may fail in containers/VMs even with `--no-sandbox` flag:
- Chrome/Chromium requires installation: `sudo apt-get install -y chromium-browser`
- Even with wrapper (`chromium.orig --no-sandbox`), container restrictions may persist
- **Workaround**: Test via `curl` for server-side issues, ask user to test in their browser with F12 Console open
- **User testing**: Always instruct "Hard refresh (Ctrl+Shift+R), check F12 Console for errors, try Incognito mode"

## Blank Page Recovery (Site-Wide)
**Symptom**: All pages blank after deploying a new feature (e.g., File Manager Phase 22).
**Fix**: Revert to last known working commit:
```bash
cd /var/www/herpanel
git log --oneline -5  # Find last good commit hash
sudo chown -R ubuntu:ubuntu .  # Fix ownership before reset
git reset --hard <commit-hash>
git clean -fd  # Remove untracked files (e.g., controllers deleted in target commit)
# Verify routes/web.php matches target commit
git diff <commit-hash> -- routes/web.php
# If stale references remain, force checkout:
git checkout <commit-hash> -- routes/web.php
npm run build  # Rebuild assets
sudo chown -R www-data:www-data storage bootstrap/cache  # Fix permissions after reset
php artisan optimize:clear
git push origin master --force  # If needed (use cautiously)
```
**Important**: After fix, instruct user to **hard refresh** browser (Ctrl+Shift+R / Cmd+Shift+R) and check browser console for JS errors.
**Context**: Applied in 2026-05-06 session to revert Phase 22 File Manager changes that caused blank pages. Updated with cleanup steps after reset.

## User Preferences
- **"Jangan dipaksakan"** → Work carefully, one task at a time, verify each step
- **Concise responses** → Consolidate messages, don't spam multiple messages
- **Git push after updates** → Push to GitHub after every batch of changes
- **Host-based over Docker** → Simpler for MVP, avoid Docker complexity initially
- **React over Vue** → Stick to Inertia.js + React for MVP, add Vue later if needed
- **Bahasa Indonesia + slang** → Communicate in Bahasa Indonesia with slang ("bro", "lu", "gue")
- **Browser testing** → When user says "Coba lu lakukan test bro", try `browser_navigate` immediately. If fails, install chromium with `--no-sandbox`. Recognize container limitations.

### Phase 9: UI Redesign + Prometheus Monitoring ✅
1. **Interactive UI Improvements**:
   - Dynamic breadcrumb using `route().current()` mapping to page titles
   - Hover effects with gradient glow on navigation items
   - Color-coded icons per section (cyan=dashboard, emerald=monitoring, blue=domains, purple=databases, orange=filemanager)
   - Active indicator: pulsing dot on current nav item
   - Backdrop blur on topbar (`backdrop-blur-md`)
   - Logout button with hover state (red border/text on hover)
   - `hoveredItem` state for per-item hover effects

2. **AuthenticatedLayout Updates** (`resources/js/Layouts/AuthenticatedLayout.jsx`):
   - Added `useState` for `sidebarOpen` and `hoveredItem`
   - `getPageTitle()` function maps route names to display titles
   - Sidebar footer: user avatar, name, role, logout form
   - Navigation items: colored icons, gradient hover effect, active pulse dot
   - Removed placeholder `#` routes - all items now functional

3. **Page-Specific NexPanel Styling**:
   - **Dashboard**: Welcome banner with user name, interactive stat cards with lift effect, better table styling
   - **Domains/Index**: Stats bar (total/active/inactive), hover rows, action buttons (DNS, SSL, Delete)
   - **Domains/Create**: Two-column layout, info panels with tips
   - **Databases/Index**: Stats bar (count, active, storage estimate), purple color scheme
   - **Databases/Create**: Connection info panel, quick access links
   - **FileManager/Index**: Breadcrumb navigation, drag-drop upload zone, toolbar with folder create

4. **Prometheus + node_exporter Integration**:
   - **Discovery**: Both already installed on server at `/usr/local/bin/`
     - Prometheus: `127.0.0.1:9090` (user `prometh+`)
     - node_exporter: `127.0.0.1:9100` (user `nobody`)
   - **Config**: `/etc/prometheus/prometheus.yml` has `node` job scraping `127.0.0.1:9100`
   - **Environment**: Added `PROMETHEUS_URL=http://43.134.37.14:9090` to `.env`
   - **Controller**: `MonitoringController.php` passes `prometheusUrl` to view

5. **Frontend Metrics Parsing**:
   - Fetch raw metrics from `${prometheusUrl}/metrics`
   - Parse Prometheus text format line-by-line
   - Key metrics parsed:
     - `node_cpu_seconds_total` → CPU usage %
     - `node_memory_MemTotal_bytes`, `MemFree_bytes`, `MemAvailable_bytes`, `Cached_bytes`, `Buffers_bytes` → Memory used/percent
     - `node_load1`, `node_load5`, `node_load15` → Load averages
     - `node_boot_time_seconds` → System uptime
     - `node_network_receive_bytes_total`, `node_network_transmit_bytes_total` → Network RX/TX
   - Socket.IO fallback for custom `monitoring-server.js` stats

6. **Monitoring Page Features** (`Monitoring/Index.jsx`):
   - Connection status: Prometheus (node_exporter) + Socket.IO indicators
   - Auto-refresh toggle (5s/10s/30s/60s intervals)
   - Manual refresh button
   - CPU, Memory, Disk, Uptime stat cards
   - Network traffic panel (RX/TX)
   - System info panel (OS, Platform, Kernel, Architecture)
   - Live metrics stream grid

7. **Build & Deploy**: `npm run build` ✅ Success (1.38s), committed & pushed (commit 74ddddb)

**Pre-installed Services (server 43.134.37.14):**
```
prometheus    127.0.0.1:9090  (user: prometh+)
node_exporter 127.0.0.1:9100  (user: nobody)
```

### Phase1 Redesign: Professional Dark Theme ✅ (May 2026)
Complete UI overhaul replacing NexPanel cyberpunk aesthetic with professional hosting panel design.

**Changes:**
1. **Tailwind Config** — New `hp-*` color palette (hpBg, hpBg2, hpBg3, hpBorder, hpAccent, hpText)
2. **app.css** — Removed scanlines, neon glow, grid noise; clean CSS variables
3. **Font** — Switched from Syne to Inter (Google Fonts)
4. **AuthenticatedLayout** — Clean sidebar with nav sections, topbar with breadcrumb
5. **Dashboard** — Professional stats cards, domains/processes tables, disk usage
6. **Monitoring** — Connection status bar, live metrics stream, network stats
7. **Domains/Databases/FileManager** — Clean tables, status badges, info panels
8. **GuestLayout & Login** — Centered card, server info footer

**Design Philosophy:**
- Single accent color (indigo #6366f1)
- No decorative effects (scanlines, glows)
- Status colors only for semantic meaning
- Clean typography hierarchy

**Commit:** `5f74099` — "Phase 1: Professional dark theme redesign"

### Phase 10: Dashboard Real-Time Data Integration ✅ (May 2026)
Connected Dashboard to live monitoring data from node_exporter + Socket.IO.

**Implementation Pattern:**
```javascript
// Fetch node_exporter metrics via Nginx proxy
const fetchNodeExporterMetrics = async () => {
    const response = await fetch(window.location.origin + '/node-exporter/metrics');
    if (response.ok) {
        const text = await response.text();
        const metrics = parseNodeExporterMetrics(text);
        setStats(metrics);
    }
};

// Socket.IO for real-time updates
import('socket.io-client').then(({ io }) => {
    socket = io(window.location.origin, {
        path: '/socket.io/',
        reconnection: true,
        reconnectionAttempts: 5,
    });
    socket.on('stats', (data) => { setStats(prev => ({ ...prev, ...data })); });
});

// Parse node_exporter text format
const parseNodeExporterMetrics = (text) => {
    const lines = text.split('\n');
    lines.forEach(line => {
        if (line.startsWith('node_cpu_seconds_total')) { /* parse CPU */ }
        if (line.startsWith('node_memory_MemTotal_bytes')) { /* parse RAM */ }
        // ... parse disk, network, load, uptime
    });
    // Calculate percentages
    cpuUsage = (1 - cpuIdle / totalCpu) * 100;
    memoryUsagePercent = memoryUsed / memoryTotal * 100;
};
```

**Stats Displayed:**
- CPU Usage % (from node_cpu_seconds_total)
- Memory Usage % + GB (from node_memory_*)
- Disk Usage % + GB (from node_disk_*)
- Uptime (from node_boot_time_seconds)
- Load Average (from node_load1/5/15)
- Network RX/TX bytes (from node_network_*)

**Route Update:** `/dashboard` now passes `domains` from DB:
```php
Route::get('/dashboard', function () {
    $domains = \App\Models\Domain::where('user_id', auth()->id())->latest()->get();
    return Inertia::render('Dashboard', ['domains' => $domains]);
})->middleware(['auth', 'verified'])->name('dashboard');
```

**Auto-refresh:** Node_exporter metrics every 5 seconds via setInterval.

**Commits:** `bceab4b` — "Dashboard: Integrate real monitoring data"

### Phase 12: FileManager Enhancement ✅ (May 2026)
Added preview, rename, and permissions features to FileManager.

**Features Added:**
1. **Preview File** — Text (txt, log, json, etc.), Images (png, jpg, gif, webp), PDF (embedded iframe)
2. **Rename** — Modal form to rename files/folders with validation
3. **Permissions (CHMOD)** — View and update file/folder permissions (chmod)

**Backend Changes:**
- `FileManagerController.php` — Added `preview()`, `rename()`, `permissions()`, `updatePermissions()` methods
- Routes — `/file-manager/preview`, `/file-manager/rename`, `/file-manager/permissions`, `/file-manager/permissions/update`

**Frontend Changes:**
- `FileManager/Index.jsx` — Added modals for Preview, Rename, Permissions
- Buttons per row: Preview, Rename, Perms, Delete

**Commit:** `0eda434` — "feat(FileManager): add preview, rename, and permissions features"

**Pitfall Encountered:** Patch to add `use Response;` introduced double backslashes (`\\`) in ALL `use` statements, causing ParseError. Fixed by restoring file and manually correcting. See Pitfalls section.

---

### Phase 13: Monitoring Disk Usage Fix ✅ (May 2026)
Fixed disk usage not displaying on Dashboard and Monitoring pages.

**Root Cause:** Wrong node_exporter metrics being parsed:
- ❌ `node_disk_total_bytes` / `node_disk_free_bytes` — **DO NOT EXIST** in node_exporter
- ✅ `node_filesystem_size_bytes` / `node_filesystem_free_bytes` — **CORRECT metrics**

**Fix Applied:**
- `Dashboard.jsx` — Updated `fetchNodeExporterMetrics()` to parse `node_filesystem_*` metrics
- `Monitoring/Index.jsx` — Same fix applied
- Filter for root mountpoint: `line.includes('mountpoint="/"')` and exclude tmpfs

**Commit:** `77c778a` — "fix(monitoring): correct disk usage metrics parsing"

---

### Phase 7: SSL Deployment ✅ (May 2026)
1. **Domain**: `drizdev.space` (DNS A record → 43.134.37.14)
2. **Certbot**: Generated Let's Encrypt certificate (expires 2026-08-04)
   - Cert path: `/etc/letsencrypt/live/drizdev.space/`
   - Auto-renewal enabled
3. **Nginx Config**:
   - `herpanel-ssl` (port 443 HTTPS) with SSL certs, HTTP/2, security headers
   - `herpanel-ip` (port 8083) → redirect to HTTPS
4. **Access URLs**:
   - `https://drizdev.space` (HTTPS, port 443)
   - `http://43.134.37.14:8083` → redirect to HTTPS
5. **Backup**: Nginx configs backed up to `/var/www/herpanel/nginx-*.backup` and committed to GitHub
6. **Commit**: `a50b089` — "backup: add Nginx SSL configs for HerPanel HTTPS"

### Phase 14: Domain Management (DNS + SSL) ✅ (May 2026)
Implemented DNS records management and SSL certificate status tracking.

**Database Changes:**
- New table `dns_records` — Migration `2026_05_05_225940_create_dns_records_table.php`
  - Fields: `domain_id`, `type` (A/AAAA/CNAME/MX/TXT/NS), `name`, `content`, `ttl`, `priority`, `status`
- Added SSL fields to `domains` table — Migration `2026_05_05_230032_add_ssl_to_domains_table.php`
  - Fields: `ssl_status` (none/pending/active/expired), `ssl_issuer`, `ssl_valid_from`, `ssl_valid_to`

**Models:**
- `DnsRecord.php` — fillable: domain_id, type, name, content, ttl, priority, status; belongsTo(Domain)
- `Domain.php` — Updated with `dnsRecords()` relationship and SSL fields in fillable/casts

**Controller Methods (DomainController.php):**
- `dnsIndex($domainId)` — Return DNS records as JSON
- `dnsStore(Request, $domainId)` — Create new DNS record
- `dnsDestroy($domainId, $recordId)` — Delete DNS record
- `checkSsl($domainId)` — Initiate SSL check (status → pending)
- `updateSslStatus(Request, $domainId)` — Update SSL certificate details

**Routes Added:**
```
GET|POST /domains/{domainId}/dns
DELETE /domains/{domainId}/dns/{recordId}
POST /domains/{id}/ssl/check
POST /domains/{id}/ssl/update
```

**UI Changes (Domains/Index.jsx):**
- Stats bar: Added "With SSL" count
- Table columns: Added SSL status column with color-coded badges
- DNS Modal: Form to add DNS records (type selector, name, content, TTL, priority for MX)
- SSL Modal: Display SSL status, issuer, valid dates; button to request certificate
- Button per row: "DNS (N)" with count, "SSL" with status color

**Commit:** `9676808` — "feat(domains): add DNS records and SSL management"

---

### Phase 15: Roundcube Webmail ✅ (May 2026)
Installed webmail client for HerPanel users to read/send emails via browser.

**Installation Steps:**
1. **Download & Extract**: Roundcube 1.6.9 to `/var/www/roundcube`
   ```bash
   cd /tmp && curl -L -o roundcube.tar.gz "https://github.com/roundcube/roundcubemail/releases/download/1.6.9/roundcubemail-1.6.9-complete.tar.gz"
   tar -xzf roundcube.tar.gz && sudo mv roundcubemail-1.6.9 /var/www/roundcube
   ```
2. **Database Setup**:
   - DB: `roundcube`, User: `roundcube@127.0.0.1`, Password: `RoundcubePass2026!`
   - Import schema: `mysql -u herpanel_admin -p'HPadmin2026!' -h 127.0.0.1 roundcube < /var/www/roundcube/SQL/mysql.initial.sql`
3. **Configuration** (`/var/www/roundcube/config/config.inc.php`):
   - DB DSN: `mysql://roundcube:RoundcubePass2026!@127.0.0.1/roundcube`
   - IMAP host: `localhost:143`
   - SMTP host: `localhost:25` (Postfix local delivery)
   - Product name: `HerPanel Webmail`
   - DES key: Generate with `openssl rand -base64 18 | tr -dc 'A-Za-z0-9' | head -c 24`
4. **Nginx Integration**:
   - Snippet: `/etc/nginx/snippets/roundcube.conf` (alias `/var/www/roundcube`, PHP-FPM socket)
   - Included in `herpanel-ssl` config via `include /etc/nginx/snippets/roundcube.conf;`
   - Access URL: `https://drizdev.space/roundcube/`
5. **Permissions**:
   ```bash
   sudo chown -R www-data:www-data /var/www/roundcube/temp /var/www/roundcube/logs
   sudo chmod 755 /var/www/roundcube/temp /var/www/roundcube/logs
   ```
6. **Security**: Disabled installer by renaming `/var/www/roundcube/installer` to `installer.bak`

**Pitfalls:**
- **MySQL Password**: Use password from `.env` (`HPadmin2026!`), not the one in memory notes
- **Config File Permission**: Must `chown ubuntu:ubuntu` before patching `config.inc.php`
- **Nginx Alias**: Use `alias` directive for Roundcube subpath, not `root`
- **IMAP/SMTP Ports**: Verify Dovecot (143) and Postfix (25) are listening with `netstat -tlnp | grep -E ':(143|25)'`

**Testing:**
- Login with existing email account (e.g., `andriz@eatrade-journal.site`)
- Verify IMAP connection to localhost:143
- Test email composition (local delivery works; external relay pending)

---

### Phase 11: Responsive Design for All Devices ✅ (May 2026)
Made entire UI responsive for mobile/tablet/desktop.

**AuthenticatedLayout Responsive Pattern:**
```jsx
const [sidebarOpen, setSidebarOpen] = useState(true);
const [isMobile, setIsMobile] = useState(false);

// Detect mobile on mount + resize
useEffect(() => {
    const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
        if (window.innerWidth < 768) setSidebarOpen(false);
        else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
}, []);

// Sidebar: fixed position with transform for mobile toggle
<nav className={`
    fixed left-0 top-0 bottom-0 w-[240px] z-[100]
    transition-transform duration-300
    ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
`}>

// Mobile overlay
{isMobile && sidebarOpen && (
    <div className="fixed inset-0 bg-black/50 z-[99]" onClick={() => setSidebarOpen(false)} />
)}

// Main content adjusts margin based on screen
<main className={`min-h-screen ${isMobile ? 'ml-0' : 'ml-[240px]'} pt-[52px]`}>
```

**Grid Responsive Classes:**
```jsx
// Stats: 1 col (mobile) → 2 cols (tablet) → 4 cols (desktop)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// Main grid: 1 col → 2 cols
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Bottom grid: 1 col → 2 cols → 3 cols
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Topbar Adjustments:**
```jsx
<header className={`fixed top-0 right-0 h-[52px] z-[90]
    ${isMobile ? 'left-0' : 'left-[240px]'}
    px-4 md:px-6
`}>
    {/* Mobile menu button */}
    <button className="md:hidden">☰</button>
    
    {/* Clock hidden on mobile */}
    <div className="hidden sm:flex">{clock}</div>
</header>
```

**Table Responsive:** Wrap tables with `overflow-x-auto` on mobile.

**Commits:** 
- `24fdf2b` — "Make UI responsive for all devices"
- `f64615b` — "Make Domains and Databases pages responsive"

**Prometheus Metrics Parsing Pattern:**
```javascript
// Fetch from node_exporter
const response = await fetch(`${prometheusUrl}/metrics`);
const text = await response.text();
const lines = text.split('\n');

// Parse specific metrics
lines.forEach(line => {
    if (line.startsWith('node_cpu_seconds_total')) {
        // Extract mode="idle" and value
        const match = line.match(/mode="(\w+)".*?(\d+\.\d+)/);
        if (match && match[1] === 'idle') cpuIdle = parseFloat(match[2]);
    }
    if (line.startsWith('node_memory_MemTotal_bytes')) {
        memTotal = parseFloat(line.split(' ')[1]);
    }
    // ... etc
});

// Calculate CPU usage
const totalCpu = cpuIdle + cpuUser + cpuSystem;
cpuUsage = (1 - cpuIdle / totalCpu) * 100;
```

### Phase 8: NexPanel Design Application ✅ (Superseded by Phase 1 Redesign, May 2026)
> **Note:** The NexPanel cyberpunk design (scanlines, neon glow, multiple accents) was replaced in May 2026 Phase 1 redesign with a professional dark theme. This phase is kept for historical reference.
1. **Design Reference**: User provided NexPanel HTML/CSS design (dark futuristic theme with scanline/grid effects)
2. **Saved Reference**: `/var/www/herpanel/resources/views/nexpanel-reference.html`
3. **Tailwind Config Update** (`tailwind.config.js`):
   - Added NexPanel color palette: `nexBg`, `nexBg2`, `nexBg3`, `nexPanel`, `nexBorder`, `nexBorder2`, `nexAccent`, `nexAccent2`, `nexAccent3`, `nexWarn`, `nexDanger`, `nexText`, `nexText2`, `nexText3`
   - Added fonts: `Syne` (sans), `JetBrains Mono` (mono)
4. **CSS Variables & Effects** (`resources/css/app.css`):
   - CSS variables matching NexPanel palette
   - Scanline effect: `body::before` with repeating-linear-gradient
   - Grid noise background: `body::after` with linear-gradient
   - Animations: `fadeUp`, `scanH`, `pulse`, `blink`
   - Scrollbar styling
5. **Blade Template** (`resources/views/app.blade.php`):
   - Updated Google Fonts link to Syne + JetBrains Mono
   - Removed default body classes (let CSS handle styling)
6. **Sidebar + Topbar** (`resources/js/Layouts/AuthenticatedLayout.jsx`):
   - Complete rewrite with NexPanel design
   - Sidebar: logo badge, server status, nav sections (Overview/Services/System/Config), user info
   - Topbar: breadcrumb, live WIB clock (JS `setInterval` + UTC+7), notification buttons
   - Active nav item highlighting, hover effects
7. **Dashboard Page** (`resources/js/Pages/Dashboard.jsx`):
   - Stats grid: CPU, RAM, Disk I/O, Bandwidth with progress bars
   - Active Domains table with SSL status badges
   - Top Processes panel with CPU/memory bars
   - Quick Actions grid (6 buttons)
   - Disk Usage panels with progress bars
   - System Log panel with color-coded entries
8. **Build & Deploy**: `npm run build` ✅ Success, committed & pushed (commit 90a10ab)
9. **Access**: Test at `http://43.134.37.14:8083` after login (admin@herpanel.com / admin123)

**NexPanel Design Classes to Reuse**:
- Layout: `sidebar`, `topbar`, `main`, `content`, `page-header`, `page-title`, `page-sub`
- Cards: `stat-card`, `stat-value`, `stat-bar`, `stat-bar-fill`
- Panels: `panel`, `panel-header`, `panel-action`
- Tables: `domain-table`, `status-badge` (live/exp/off)
- Buttons: `quick-btn`, `quick-icon`, `quick-label`
- Effects: `scan-h` (animated top line), `pulse`, `cursor-blink`, `fade-up`

**Design Reference Files**:
- HTML Design Source: `/var/www/herpanel/resources/views/nexpanel-reference.html`
- Design System Reference: See `references/nexpanel-design.md` for full color palette, fonts, CSS effects, and component classes

## Design System (Phase 1 Redesign — May 2026)

HerPanel uses a **professional dark theme** inspired by CloudPanel, Ploi, and RunCloud. The design prioritizes trust, clarity, and usability over decorative effects.

### Color Palette (Tailwind `hp-*` tokens)
| Token | Hex | Usage |
|-------|-----|-------|
| `hpBg` | `#0f1117` | Main background |
| `hpBg2` | `#1a1d27` | Cards, panels, sidebar |
| `hpBg3` | `#242836` | Hover states, elevated surfaces |
| `hpSurface` | `#1a1d27` | Same as hpBg2 |
| `hpBorder` | `#2a2e3b` | Primary border color |
| `hpBorder2` | `#363b4d` | Secondary/hover borders |
| `hpAccent` | `#6366f1` | Primary accent (indigo) |
| `hpAccent2` | `#818cf8` | Accent hover/lighter variant |
| `hpWarn` | `#f59e0b` | Warning (amber) |
| `hpDanger` | `#ef4444` | Danger/error (red) |
| `hpSuccess` | `#22c55e` | Success (green) |
| `hpText` | `#f1f5f9` | Primary text (near white) |
| `hpText2` | `#94a3b8` | Secondary text (muted) |
| `hpText3` | `#64748b` | Tertiary text (subtle) |

### Typography
- **Primary Font:** Inter (Google Fonts) — clean, professional, excellent readability
- **Monospace Font:** JetBrains Mono — for code, paths, metrics
- **Font Sizes:** 11px (tertiary/labels), 12-13px (body), 15-16px (headings), 20-24px (titles)
- **Font Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Component Patterns
- **Stats Cards:** Value + unit + progress bar + subtext, clean borders
- **Tables:** `bg-hpBg/50` header row, hover states, status badges
- **Status Badges:** `bg-{color}/10 text-{color} border border-{color}/20` with dot indicator
- **Buttons:** Rounded corners (md), hover border color change, consistent padding
- **Forms:** `bg-hpBg border-hpBorder` inputs, focus states to `hpAccent`
- **Navigation:** Section labels (Overview/Services/System), active state with accent border-left

### Design Principles
1. **No decorative effects** — No scanlines, neon glows, or excessive shadows
2. **Single accent color** — Indigo (#6366f1) as primary, status colors only for meaning
3. **Subtle hover states** — Border color shifts, not dramatic transformations
4. **Consistent spacing** — 4px/8px/16px/24px rhythm
5. **Clear hierarchy** — Uppercase tracking-wider for labels, proper font weights

### Reference Files
- **Design System:** `references/design-system.md` — Full palette, typography, component examples (current)
- **Previous Design (NexPanel):** `references/nexpanel-design.md` — Archived for historical reference

See full plan: `.hermes/plans/2026-05-05_195700-custom-hosting-cpanel-architecture.md`

### Phase 16: Email Authentication (SPF/DKIM/DMARC + SumoPod Relay) ✅ (May 2026)
Configured email authentication and external relay to fix email deliverability for HerPanel.

**1. OpenDKIM Setup:**
- Install: `sudo apt install opendkim opendkim-tools -y`
- Generate keys for `drizdev.space` and `eatrade-journal.site`:
  ```bash
  sudo mkdir -p /etc/opendkim/keys/{drizdev.space,eatrade-journal.site}
  sudo opendkim-genkey -D /etc/opendkim/keys/drizdev.space/ -d drizdev.space -s mail
  sudo opendkim-genkey -D /etc/opendkim/keys/eatrade-journal.site/ -d eatrade-journal.site -s mail
  sudo chown -R opendkim:opendkim /etc/opendkim/keys
  ```
- **Key Config Files:**
  - `KeyTable`: Maps domains to private keys.
  - `SigningTable`: Maps email addresses to DKIM selectors.
  - `TrustedHosts`: Lists IPs/hosts allowed to sign.
- **Pitfall**: `RequireSignature false` is **not recognized** in newer OpenDKIM versions (causes start failure). Remove it.
- **Pitfall**: Avoid `refile:` prefix in `opendkim.conf` if unsure about version support; use direct file paths.

**2. DNS Records (Added at provider):**
| Domain | Type | Host | Value |
|--------|------|------|-------|
| Both | TXT | @ | `v=spf1 include:_spf.sumopod.com ~all` |
| Both | TXT | mail._domainkey | `v=DKIM1; h=sha256; k=rsa; p=...` (from `mail.txt`) |
| Both | TXT | _dmarc | `v=DMARC1; p=quarantine; rua=mailto:dmarc@domain` |

**3. Postfix Relay (SumoPod):**
- **Why**: Provider blocks port 25; SumoPod allows port 465 (SSL) with "Any Sender".
- **Config**:
  ```bash
  sudo postconf -e 'relayhost = [smtp.sumopod.com]:465'
  sudo postconf -e 'smtp_tls_security_level = encrypt'
  sudo postconf -e 'smtp_tls_wrappermode = yes'
  sudo postconf -e 'smtpd_milters = local:/run/opendkim/opendkim.sock'
  sudo postconf -e 'non_smtpd_milters = local:/run/opendkim/opendkim.sock'
  ```
- **Pitfall**: `postconf -e` can create **duplicate entries** in `main.cf`. Clear with `postconf -X <param>` before re-adding.
- **Pitfall**: Run `sudo postfix check` to catch unused parameter warnings (e.g., old `smtp_sasl_mechanisms`).

**4. Status:**
- Outgoing emails: Signed with DKIM + Relayed via SumoPod (bypasses port 25 block).
- Incoming/Local (Roundcube): Still uses localhost:25 (Postfix) and localhost:143 (Dovecot).

### Phase 17: SMTP Relay Verification ✅ (May 2026)
Verified SumoPod delivery with SPF/DMARC monitoring.
- **DMARC Policy**: Set to `p=none` for monitoring (alignment issues with SumoPod DKIM signing)
- **Email Headers**: SPF=PASS (IP 103.171.19.143), DKIM=PASS (mail-8.sumosender.com), DMARC=FAIL (alignment issue)
- **Recommendation**: Use `p=none` while troubleshooting DKIM alignment, or rely on SumoPod's signing

---

### Phase 18: Backup Management ✅ (May 2026)
Implemented backup management feature for user data protection.

**Database Layer:**
- Migration: `create_backups_table` (user_id, domain_id, backup_type, file_path, file_size, status)
- Model: `Backup.php` with relationships to User and Domain

**Controller:** `BackupController.php`
- `index()`: List backups with domain relation, pass domains for create form
- `store()`: Create backup record (status: pending), dispatch backup job
- `destroy()`: Delete backup record and associated file

**Routes:**
```php
Route::get('/backups', [BackupController::class, 'index'])->name('backups.index');
Route::post('/backups', [BackupController::class, 'store'])->name('backups.store');
Route::delete('/backups/{backup}', [BackupController::class, 'destroy'])->name('backups.destroy');
```

**React Page:** `Backups/Index.jsx`
- Stats bar (Total/Completed/Pending)
- Backup table with domain, type, size, status badges, date
- Create modal (domain selector, backup type: full/database/files)
- Delete button with confirmation
- Responsive design (mobile-friendly table, modals)

**Navigation:** Added "Backups" to Services section in AuthenticatedLayout (icon: 💾, color: text-indigo-400)

**Commit:** `2afea29` — "feat(backups): add backup management feature"

**Updates (May 2026 Session):**
- Implemented `app/Jobs/BackupJob.php` to process database/files backup asynchronously via Laravel queue (database driver)
- Updated `BackupController@store` to dispatch `BackupJob` after creating pending record
- Added download functionality: `BackupController@download`, route `backups/{backup}/download`, download button in React page
- Fixed critical typo: `backpus` → `backups` in `Backups/Index.jsx` (prop name mismatch caused blank page)
- Set up PM2 queue worker: `herpanel-queue` process running `php artisan queue:work --tries=3 --timeout=3600`
- New commits: `5936576` (fix typo), `0c2d925` (add backup job), `2684115` (add download)

---

### Phase 19: Cron Job Management ✅ (2026-05-06)
Implemented scheduled tasks interface for users to manage cron jobs.

**Database Layer:**
- Migration: `create_cron_jobs_table` (user_id, name, command, schedule, is_active, last_run_at)
- Model: `CronJob.php` with relationships to User

**Controller:** `CronJobController.php`
- `index()`: List cron jobs with stats (total/active/inactive)
- `create()`: Show create form
- `store()`: Create new cron job (validation: name, command, schedule)
- `edit()`: Show edit form
- `update()`: Update cron job
- `destroy()`: Delete cron job
- `toggleStatus()`: Toggle active/inactive status
- `runNow()`: Execute command via `exec()` immediately, update `last_run_at`

**Routes:**
```php
Route::get('/cron-jobs', [CronJobController::class, 'index'])->name('cron-jobs.index');
Route::get('/cron-jobs/create', [CronJobController::class, 'create'])->name('cron-jobs.create');
Route::post('/cron-jobs', [CronJobController::class, 'store'])->name('cron-jobs.store');
Route::get('/cron-jobs/{id}/edit', [CronJobController::class, 'edit'])->name('cron-jobs.edit');
Route::put('/cron-jobs/{id}', [CronJobController::class, 'update'])->name('cron-jobs.update');
Route::delete('/cron-jobs/{id}', [CronJobController::class, 'destroy'])->name('cron-jobs.destroy');
Route::post('/cron-jobs/{id}/toggle', [CronJobController::class, 'toggleStatus'])->name('cron-jobs.toggle');
Route::post('/cron-jobs/{id}/run', [CronJobController::class, 'runNow'])->name('cron-jobs.run');
```

**React Pages:** `CronJobs/Index.jsx`, `Create.jsx`, `Edit.jsx`
- Stats bar (Total/Active/Inactive)
- Table with command truncate, schedule display, status toggle button
- Predefined schedule options (every minute, hourly, daily, weekly, monthly)
- Actions: Run Now, Edit, Delete

**Navigation:** Added "Cron Jobs" to Services section in AuthenticatedLayout (icon: 🕐, color: text-yellow-400)

**Commit:** `775342c` — "feat(cron-jobs): implement Phase 19 Cron Job Management"

**Phase 19 Completed ✅ (2026-05-06):**
Automatic scheduling is now fully implemented:
1. **ProcessCronJobs Command**: `app/Console/Commands/ProcessCronJobs.php` runs due cron jobs (checks `is_active`, parses cron expression with `Cron\CronExpression`, executes command via `exec()`, updates `last_run_at`).
2. **Laravel Task Scheduler**: `routes/console.php` schedules `cron:process` to run every minute (`Schedule::command('cron:process')->everyMinute()`).
3. **System Cron**: Added system cron job: `* * * * * cd /var/www/herpanel && php artisan schedule:run >> /dev/null 2>&1` (verify with `crontab -l`).
4. **Commit**: `3e89ad8` — "feat: automate cron jobs and Nginx config management"

---

### Phase 20: PHP Version Management ✅ (2026-05-06)
Implemented per-domain PHP version switching (8.1, 8.2, 8.3).

**Database Layer:**
- Migration: `add_php_version_to_domains_table` (default: '8.3')
- Model: `Domain.php` — added `php_version` to fillable

**Backend:**
- `DomainController.php`:
  - `updatePhpVersion()`: Validates and updates `php_version` field.
  - `generateNginxConfig()`: Helper that generates Nginx config content dynamically based on selected PHP version (maps to `/run/php/php{version}-fpm.sock`).
- **Route**: `POST /domains/{id}/php-version`

**Frontend:**
- `Domains/Index.jsx`:
  - Added "PHP Version" column in the domains table.
  - Dropdown selector (`<select>`) per domain to switch between 8.1, 8.2, 8.3.
  - **Nginx Config Modal**: After changing PHP version, a modal appears displaying the generated Nginx config. Includes "Copy to Clipboard" button.
  - Logic: `handlePhpVersionChange()` sends POST request; controller returns `flash.nginx_config`.

**Infrastructure:**
- Installed PHP 8.1 and 8.2 alongside existing 8.3 using `ppa:ondrej/php` (see Pitfalls).
- PHP-FPM pools: `php8.1-fpm`, `php8.2-fpm`, `php8.3-fpm` all running.
- Sockets: `/run/php/php8.1-fpm.sock`, etc.

**Commit:** `00072d9` — "feat(phase-20): PHP Version Management"

**Phase 20 Completed ✅ (2026-05-06):**
Nginx config automation is now fully implemented:
1. **Auto-Write Config**: `DomainController@updatePhpVersion` writes generated Nginx config to `/etc/nginx/sites-available/{domain_name}` using `sudo /usr/bin/tee`.
2. **Auto-Symlink**: Creates symlink to `/etc/nginx/sites-enabled/{domain_name}` if not exists.
3. **Config Test**: Runs `sudo /usr/sbin/nginx -t` before applying; removes faulty config if test fails.
4. **Auto-Reload**: Runs `sudo /usr/bin/systemctl reload nginx` after valid config is written.
5. **Permissions**: Added sudoers entry: `www-data ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t, /usr/bin/systemctl reload nginx, /usr/bin/systemctl reload nginx.service` (file: `/etc/sudoers.d/herpanel-nginx`).
6. **Frontend**: Removed Nginx Config Modal (now automatic; user no longer needs to copy-paste config).
7. **Commit**: `3e89ad8` — "feat: automate cron jobs and Nginx config management"

---

### Phase 21: User Management ✅ (2026-05-06)
Implemented multi-user management with roles and active status.

**Database Layer:**
- Migration: `add_is_active_to_users_table` (adds `is_active` boolean, default true; `role` column already existed)
- Model: `User.php` — added `is_active` to fillable, casts `is_active` to boolean, methods `isAdmin()` and `isActive()`

**Middleware:**
- `AdminMiddleware.php` — checks `auth()->user()->isAdmin()`, registered as `admin` alias in `bootstrap/app.php`

**Controller:**
- `UserController.php` — resource CRUD, `toggleActive()` method to enable/disable users, prevents self-deletion

**Routes:**
- Resource routes `/users` with `auth` + `admin` middleware, `POST /users/{user}/toggle-active`

**React UI:**
- `Users/Index.jsx` — user list with role/status badges, edit/delete/toggle buttons. Updated to follow responsive mobile card + action modal pattern (matches Domains page): uses `isMobile` state, desktop table view, mobile card view with bottom-sheet action modal.
- `Users/Create.jsx` — responsive form for name, email, password, role, active status (toggle switch)
- `Users/Edit.jsx` — responsive form to edit user details (password optional, toggle switch for active status)

**Responsive Update (2026-05-06)**:
- Added mobile card view and action modal to `Users/Index.jsx` per established mobile UX pattern.
- Updated `Users/Create.jsx` and `Users/Edit.jsx` to use consistent responsive layouts and form components.
- Commit: `34b7092` — "fix(users): make Users pages responsive (mobile card view + actions modal)"

**Navigation:**
- Conditional "Administration" section (Users link) only visible to admin users in `AuthenticatedLayout.jsx`

**Commits:** 
- `f1d0657` — "feat(phase-21): User Management"
- `34b7092` — "fix(users): make Users pages responsive (mobile card view + actions modal)"

---

### Phase 22: File Manager (Per-Domain) ✅ (2026-05-06)

## Debugging Blank Dashboard/Inertia Pages
When the dashboard or other Inertia pages render blank without visible errors:
1. **Check email verification**: The `verified` middleware will redirect unverified users to login without feedback. Use `php artisan tinker` to set `email_verified_at` for the user:
   ```php
   $user = App\Models\User::where('email', 'user@herpanel.com')->first();
   $user->email_verified_at = now();
   $user->save();
   ```
2. **Isolate JS errors**: Simplify the target React component (e.g., Dashboard.jsx) by removing non-essential imports (socket.io-client, node_exporter fetch logic) and complex child components. Test with a minimal render first. Use the `templates/simplified-dashboard.jsx` template as a starting point.
3. **Rule out layout issues**: Render the page without parent layouts (e.g., AuthenticatedLayout) to check if the layout is causing the blank screen.
4. **Rebuild assets**: After modifying React components, always run `npm run build` and check for build errors. Verify built assets exist in `public/build/assets/`.
5. **Add debugging logs**: Include `console.log` in component `useEffect` hooks and add error boundaries in `app.jsx` to capture rendering errors.
6. **Check route responses**: Use `curl -I https://drizdev.space/dashboard` to confirm unauthenticated requests redirect to `/login` (HTTP 302).
Reimplemented File Manager with per-domain isolation after a blank page issue.

**Features:**
Phase 22: File Manager - per-domain file management (upload, mkdir, delete, download)
Phase 23/Phase 25: SSL Certificate Management - queue-based Certbot SSL issuance, ACME Nginx config, see `references/ssl-management.md`
- Storage path: `storage/app/domains/{domain_id}/`
- Controller: `FileManagerController.php` with per-domain logic
- Routes: `/domains/{domain}/file-manager` (index, upload, mkdir, delete, download)
- React UI: `FileManager/Index.jsx` (desktop table + breadcrumb, upload/mkdir forms)
- Commit: `e61cd0c` (force push to master per user approval)

**Implementation Notes:**
- Reverted earlier Phase 4 File Manager (global storage) due to blank page.
- Per-domain isolation prevents cross-domain file access.
- Uses Laravel Storage facade with `domains/{id}` prefix.

---

### Phase1 Redesign: Professional Dark Theme ✅ (May 2026)
- **Phase 20:** PHP Version Management (per-domain PHP version switching) ✅ Completed
- **Phase 21:** User Management (multi-user, roles & permissions) ✅ Completed
- **Phase 22:** File Manager (per-domain, upload/mkdir/delete/download) ✅ Completed
- **Phase 23 → Phase 25:** SSL Certificate Management / SSL Auto-Generation ✅ Completed (auto-issue SSL for user domains via Let's Encrypt, Certbot integration)
- **Phase 24:** Advanced Email Features (mailing lists, auto-responders, email filters)

See full plan: `.hermes/plans/2026-05-05_195700-custom-hosting-cpanel-architecture.md`
