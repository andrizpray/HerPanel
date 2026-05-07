# HerPanel Phase 25-30 Lessons
## Workflow & Pitfalls (Phase 25: SSL Auto-Gen, Phase 26: Subdomain, Phase 27: Error Pages, Phase 28: MIME Types, Phase 29: Hotlink, Phase 30: Redirect Manager)

### Domain Model Relationship Edits
When adding relationships to `app/Models/Domain.php` (e.g., `mimeTypes()`, `hotlinkProtection()`, `redirectRules()`), use `execute_code` with Python file I/O instead of the `patch` tool to avoid duplicate match errors from repeated relationship additions.

### routes/web.php Edits
- Use `execute_code` or `sed` to add imports/routes
- If the file becomes corrupted (duplicate routes, line number issues), reset with `git checkout -- routes/web.php` before re-editing
- All domain-specific routes must use the `/domains/{domainId}/` prefix (e.g., `domains/{domainId}/redirects/*`) to avoid 404 errors

### Frontend Structure
- Feature components must be placed under `resources/js/Pages/Domains/` to match existing project structure
- Add both desktop and mobile buttons to `Domains/Index.jsx` that match the existing UI style (e.g., Redirects button added alongside Error Pages, MIME Types, Hotlink Protection buttons)

### Commit Workflow
Commit and push all phase changes to the `master` branch on GitHub immediately after completion, per user preference.