# Testing HerPanel When Browser Auto-Launch Fails
## Chrome Launch Error
When using `browser_navigate`, you may encounter:
```
Auto-launch failed: Chrome exited early (exit code: 46) without writing DevToolsActivePort
Chrome stderr: internal error, please report: running "chromium.orig" failed: cannot find app "orig" in "chromium"
```
This is a server-side Chrome configuration issue, not a skill or code error.

## Verified Testing Workarounds
Use these steps to test HerPanel features without browser access:
1. **Check registered routes**: `php artisan route:list --path=<feature>` (e.g., `--path=error` for Error Pages)
2. **Backend logic tests**: `php artisan tinker` (e.g., create test records, verify DB writes)
3. **Inertia-protected endpoints**: `curl -s -H "X-Inertia: true" -H "Accept: application/json" <url>` (returns "Unauthenticated" if not logged in, expected behavior)
4. **Public preview endpoints**: `curl -s <url>` (e.g., `curl -s https://drizdev.space/error-preview/2/404` for Error Pages preview)

## Cleanup After Testing
Always clean up test data (e.g., delete test ErrorPages created via tinker) to keep the DB clean.