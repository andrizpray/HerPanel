# Phase 27: Error Pages Custom (2026-05-07)

## Features Implemented
- Custom error pages per domain (403, 404, 500, 502, 503, 504)
- HTML content editor (textarea)
- Active/Inactive toggle per error page
- Auto-generate Nginx config snippet
- Public preview endpoint for Nginx (`/error-preview/{domainId}/{errorCode}`)

## Architecture
### Database
- Table: `error_pages`
- Fields: `domain_id`, `error_code` (string, max 10), `content` (longText), `is_active` (boolean)
- Unique constraint: `['domain_id', 'error_code']`

### Controller: `ErrorPageController`
- `index($domainId)` — List error pages
- `create($domainId)` — Show create form
- `store(Request $request, $domainId)` — Save new error page + generate Nginx config
- `edit($domainId, $id)` — Show edit form
- `update(Request $request, $domainId, $id)` — Update + regenerate Nginx config
- `destroy($domainId, $id)` — Delete + regenerate Nginx config
- `preview($domainId, $errorCode)` — Public endpoint for Nginx to serve custom error pages

### Routes (`routes/web.php`)
```php
// Public preview (before auth middleware)
Route::get('/error-preview/{domainId}/{errorCode}', [ErrorPageController::class, 'preview'])->name('error.preview');

// Authenticated routes (nested under domains)
Route::get('/domains/{domainId}/error-pages', [ErrorPageController::class, 'index'])->name('error-pages.index');
Route::get('/domains/{domainId}/error-pages/create', [ErrorPageController::class, 'create'])->name('error-pages.create');
Route::post('/domains/{domainId}/error-pages', [ErrorPageController::class, 'store'])->name('error-pages.store');
Route::get('/domains/{domainId}/error-pages/{id}/edit', [ErrorPageController::class, 'edit'])->name('error-pages.edit');
Route::put('/domains/{domainId}/error-pages/{id}', [ErrorPageController::class, 'update'])->name('error-pages.update');
Route::delete('/domains/{domainId}/error-pages/{id}', [ErrorPageController::class, 'destroy'])->name('error-pages.destroy');
```

### Frontend Files
- `resources/js/Pages/Domains/ErrorPages/Index.jsx` — List + Delete with confirmation modal
- `resources/js/Pages/Domains/ErrorPages/Create.jsx` — Create with HTML editor + error code selector
- `resources/js/Pages/Domains/ErrorPages/Edit.jsx` — Edit existing error page

### Integration
- Button "Error Pages" added to `Domains/Index.jsx` (desktop table actions + mobile actions modal)

## Nginx Config Generation
The controller generates `/etc/nginx/snippets/error-pages-{domain_id}.conf`:
```
# Error Pages Configuration for {domain_name}
error_page 404, 500 @custom_error;

location @custom_error {
    internal;
    proxy_intercept_errors on;
    default_type text/html;
    return 200 "";
}
```
**Note:** Full implementation of serving custom HTML via Nginx needs further work (proxy_pass to Laravel or use of `echo` module).

## Commits
- `44393b9` Phase 27: Error Pages Custom (Migration, Model, Controller, Frontend, Routes)

## Testing
- Backend: Tested via `php artisan tinker` (create/delete logic works)
- Routes: `php artisan route:list --path=error` shows 7 routes registered
- Build: `npm run build` successful, `ErrorPages/Index.jsx` compiled to `Subdomains-*.js`

## Pitfalls to Remember
1. **Missing controller imports in `routes/web.php`** → Always add `use App\Http\Controllers\ControllerName;` at top
2. **Missing Inertia import** → Controllers using `Inertia::render()` need `use Inertia\Inertia;`
3. **Test route cleanup** → Leftover syntax (e.g., `->name('test.subdomain');`) causes 500 errors; always verify with `php artisan route:clear`
4. **File corruption (JSX)** → If patch tool corrupts file (missing closing tags), use `git restore <file>` and redo
5. **Python file I/O for complex edits** → When patch tool reports false "Found X matches", use `execute_code` with Python `open()` to edit files reliably
