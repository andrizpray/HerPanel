# File Manager Implementation (Phase 22)

## Overview
Per-domain file management with upload, mkdir, delete, preview/edit, download. Uses Laravel Storage facade with path `storage/app/domains/{id}/`.

## Controller: `app/Http/Controllers/FileManagerController.php`

### Key Methods
- `index(Request, $domainId)` — List files/folders, breadcrumb generation.
- `upload(Request, $domainId)` — Handle file upload (max 10MB). Uses `storeAs()` on `Storage`.
- `mkdir(Request, $domainId)` — Create new folder. Validates folder name with regex `^[a-zA-Z0-9._-]+$`.
- `delete(Request, $domainId)` — Delete file or folder (recursive). Uses `Storage::deleteDirectory()` for dirs.
- `preview(Request, $domainId)` — Preview text, image, PDF. Returns JSON with type and content/url.
- `save(Request, $domainId)` — Save edited text file. Receives `item_path` and `content`, writes via `Storage::put()`.
- `download(Request, $domainId)` — Download file via `Storage::download()`.

### Helper Method
`getDomainPath($domainId, $path)` — Resolves domain, base path `domains/{id}`, full path, display path. Ensures base directory exists.

## Routes (in `routes/web.php`)
```php
Route::get('/domains/{domain}/file-manager', [FileManagerController::class, 'index'])->name('file-manager.index');
Route::post('/domains/{domain}/file-manager/upload', [FileManagerController::class, 'upload'])->name('file-manager.upload');
Route::post('/domains/{domain}/file-manager/mkdir', [FileManagerController::class, 'mkdir'])->name('file-manager.mkdir');
Route::delete('/domains/{domain}/file-manager/delete', [FileManagerController::class, 'delete'])->name('file-manager.delete');
Route::get('/domains/{domain}/file-manager/preview', [FileManagerController::class, 'preview'])->name('file-manager.preview');
Route::post('/domains/{domain}/file-manager/save', [FileManagerController::class, 'save'])->name('file-manager.save');
Route::get('/domains/{domain}/file-manager/download', [FileManagerController::class, 'download'])->name('file-manager.download');
```

## React UI: `resources/js/Pages/FileManager/Index.jsx`

### Features
- **Breadcrumb navigation** with clickable segments.
- **Desktop view**: Table with columns: Name (icon + clickable), Size, Type, Actions (Download, Delete).
- **Mobile view**: Card list with click-to-preview, delete button, download link.
- **Modals**:
  - Upload modal (file input, submit handler with Inertia post).
  - New folder modal (text input, form submit).
  - Preview/Edit modal (textarea for text files, `<img>` for images, `<iframe>` for PDF). Save button for text edits.
  - Delete confirmation modal.
- **Responsive**: Uses `isMobile` state (`window.innerWidth < 768`), `resize` listener. Follows mobile UX patterns from Domains page.

### Key Patterns
- File icons via `getFileIcon(item)` mapping extensions to emojis.
- `formatSize(bytes)` helper for human-readable file sizes.
- Navigation via `router.get(route('file-manager.index', { domain: domain.id, path: path }))`.
- Uses `usePage().props.flash` for success/error messages.

## Navigation
Added to `AuthenticatedLayout.jsx` navSections under Services:
```jsx
{ name: 'File Manager', route: 'file-manager.index', icon: '⊕', color: 'text-amber-400' }
```

## Commit
`e6477e3` — "feat(phase-22): File Manager - per-domain file management with upload, mkdir, delete, preview/edit"

## Pitfalls
- Ensure `Storage::exists()` checks before operations.
- For directories, use `Storage::deleteDirectory()` not `Storage::delete()`.
- Preview only supports text/*, images, PDF. Others return error.
- Download uses `Storage::download()` which streams file to browser.
