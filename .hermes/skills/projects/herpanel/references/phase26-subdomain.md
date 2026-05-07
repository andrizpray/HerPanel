# Phase 26: Subdomain Management

## Features
- Subdomain CRUD (index, store, destroy)
- Auto-create DNS A record (IP: 43.134.37.14) when subdomain is created
- Auto-delete linked DNS A record when subdomain is deleted

## Architecture Decision
Used separate `resources/js/Pages/Domains/Subdomains.jsx` page instead of a modal in `Index.jsx` to avoid patch tool corruption. Regex edits on files with repeated similar lines (like `Domains/Index.jsx`) caused file corruption in previous attempts.

## Workflow
Followed standard HerPanel phase sequence:
1. Migration → `php artisan migrate`
2. Model (fillable, casts, relationships)
3. Controller (CRUD methods)
4. Routes (nested under domains)
5. Frontend (separate React page)
6. `npm run build`
7. Commit → push to master

## Patch Tool Pitfall
When editing files with repeated similar lines (e.g., React components like `Domains/Index.jsx`), the `patch` tool may corrupt content due to regex match errors. Workaround:
1. For complex edits, use `execute_code` or terminal directly instead of `patch`.
2. For new UI components, create separate files instead of modifying existing files with modals to avoid regex conflicts.
