# Phase 28: MIME Types Manager — Session Notes (2026-05-07)

## Completed Features
- Migration: `create_mime_types_table` (domain_id, extension, mime_type, is_active, unique(domain_id, extension))
- Model: `MimeType` (fillable, casts, belongsTo Domain)
- Domain model: added `mimeTypes()` relationship
- Controller: `MimeTypeController` (resource methods: index, create, store, edit, update, destroy)
- Routes: 6 routes under `domains/{domainId}/mime-types` (inside auth middleware group)
- Frontend: `MimeTypes/Index.jsx`, `Create.jsx`, `Edit.jsx` (matching existing UI style)
- Integration: "MIME Types" button added to Domains/Index.jsx (desktop & mobile)
- Commit: `2af8ec6` (initial), `bb4a943` (fix duplicate routes)

## Key Pitfalls Encountered
### 1. `routes/web.php` Corruption
- Avoid using `patch` tool on `routes/web.php` (false "Found X matches" errors, malformed line numbers)
- Duplicate import statements cause `Cannot use ... because name already in use` parse errors
- Appending routes to end of file (after `require __DIR__.'/auth.php';`) creates invalid routes outside auth middleware group, leading to 404 errors
- Duplicate route entries (e.g., both `domains/{domainId}/mime-types` and `{domainId}/mime-types`) appear in `route:list` and cause conflicts

### 2. Recovery Workflow for Corrupted `routes/web.php`
1. Reset file: `git checkout -- routes/web.php`
2. Add controller import with `sed`: `sed -i '/use App\\Http\\Controllers\\SubdomainController;/a use App\\Http\\Controllers\\MimeTypeController;' routes/web.php`
3. Add routes inside auth middleware group using Python I/O (execute_code) to avoid patch tool errors
4. Verify no duplicate imports: `grep -n "MimeTypeController" routes/web.php`
5. Clean up duplicate/orphaned routes: Remove any routes outside the main auth group (after `require __DIR__.'/auth.php';`)

### 3. Post-Edit Verification
- Run `php artisan route:clear` and `php artisan optimize:clear` after editing `routes/web.php`
- Verify routes: `php artisan route:list --path=mime` (expect 6 routes, no duplicates)
- Test route accessibility: `curl -s -o /dev/null -w "%{http_code}" https://drizdev.space/domains/2/mime-types` (expect 302 redirect to login)

## Test Results
- Backend (tinker): Create/Read/Delete MIME type works ✅
- Route test: 302 (auth redirect) = valid route ✅
- Frontend assets: All 3 MimeTypes components included in build ✅
- Commit & push: Both commits pushed to GitHub ✅

## HerPanel User Workflow Preferences (Embedded from Memory)
- **Communication**: Use Bahasa Indonesia, concise responses, consolidate messages (no spamming multiple replies). Confirm completion with "Sudah" or "Kabarin klo selesai".
- **Git Workflow**: Push to GitHub after every update/fix batch; commit messages follow "Phase X: Feature Name" format.
- **Development Pace**: Incremental, careful steps; verify each task completion. If repeated errors occur, user may request rollback to last working commit ("kembali ke versi sebelum error").
- **File Editing**: For complex files (routes, long JSX), use Python file I/O or `git checkout -- <file>` if corrupted; avoid patch tool for `routes/web.php` (known false "Found X matches" bug).
- **Model Preference**: Maintain `tencent/hy3-preview:free` via OpenRouter.
