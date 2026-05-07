# HerPanel Feature Development Workflow
*Captured from Phase 27 (Error Pages) and Phase 28 (MIME Types) sessions*

## Standard New Feature Sequence
1. **Migration**: `php artisan make:migration create_<table>_table` → add columns (foreign keys, unique constraints, defaults)
2. **Model**: `php artisan make:model <Model>` → fillable, casts, relationships to parent (Domain)
3. **Parent Model**: Add `hasMany` to Domain.php (e.g., `mimeTypes()`, `errorPages()`)
4. **Controller**: `php artisan make:controller <Controller> --resource` → implement CRUD with Inertia responses
5. **Routes**: Add to `routes/web.php`:
   - Import: `use App\Http\Controllers\<Controller>;`
   - Nested group: `Route::prefix('{domainId}/<feature>')->name('<feature>.')->group(...)`
   - *Patch tool fails?* Use `sed` for imports, terminal heredoc for routes
6. **Frontend**: Create `Index/Create/Edit.jsx` in `resources/js/Pages/Domains/<Feature>/`
7. **Integrate UI**: Add buttons to `Domains/Index.jsx` (desktop + mobile modal) matching existing style
8. **Build & Verify**: `npm run build` → `php artisan optimize:clear` → `php artisan route:list --path=<feature>`
9. **Commit & Push**: `git add -A && git commit -m "Phase X: Feature Name" && git push origin master`

## File Editing Workarounds (Patch Tool Failures)
When patch tool reports "Found X matches" or corrupts files:
- **Reset corrupted files**: `git checkout -- <file>` to revert to last committed state
- **routes/web.php**:
  - Add imports with: `sed -i '/use ExistingController;/a use NewController;' routes/web.php`
  - Append routes with terminal heredoc: `cat >> routes/web.php << 'EOF'\n...routes...\nEOF`
- **JSX/PHP files**: Use `execute_code` with Python file I/O first, fallback to terminal heredoc
- **Verify early**: Run `php artisan route:clear` or `npm run build` immediately after edits

## Style Consistency Notes
- Buttons: Match existing style (e.g., `rounded-md bg-<color>-500/5 border border-<color>-500/20 text-[11px] text-<color>-400 hover:bg-<color>-500/10`)
- Mobile modal: Add feature buttons alongside Subdomains, Error Pages, SSL, Delete
- Error pages: Use Inertia modal confirmations matching existing delete patterns