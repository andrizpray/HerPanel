# Blank Screen Debugging - Updated 2026-05-06

## Pattern: Ziggy Route Error in Browser Console

**Symptom**: Blank page after login, browser console shows:
```
Error: Ziggy error: route 'X' is not in the route list.
```

**Root Cause**: Stale route references in React components (especially `AuthenticatedLayout.jsx`) pointing to deleted/renamed routes.

**Systematic Fix**:

1. **Identify the route name** from console error (e.g., `emails.index`)
2. **Find references** in React code:
   ```bash
   cd /var/www/herpanel
   grep -r "emails.index\|route('X')" --include="*.jsx" resources/js/
   ```
3. **Common locations**:
   - `resources/js/Layouts/AuthenticatedLayout.jsx`:
     - `getPageTitle()` object (maps route names to display titles)
     - `navSections` array (sidebar navigation items with `route: 'X'`)
   - `resources/js/Pages/<Feature>/*.jsx` (any `route()` calls)
4. **Remove stale references** from source files
5. **Rebuild assets**: `npm run build`
6. **Clear Laravel cache**: `php artisan optimize:clear`
7. **Restart services**: `sudo systemctl restart php8.3-fpm && sudo nginx -s reload`

**Real Case (2026-05-06)**:
- Error: `route 'emails.index' is not in the route list`
- Found in: `AuthenticatedLayout.jsx` lines 57-59 (`getPageTitle`) and line 81 (`navSections`)
- Fixed by: Removing `'emails.index': 'Email Accounts'` from titles object and `{ name: 'Emails', route: 'emails.index', ... }` from nav items
- Result: Dashboard loaded successfully

---

## React ErrorBoundary Pattern

**Problem**: React rendering errors cause blank white screen with no feedback.

**Solution**: Wrap `App` component with ErrorBoundary in `resources/js/app.jsx`:

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
                <div style={{ padding: '20px', color: 'white', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                    <h1 style={{ color: '#ef4444' }}>⚠️ Application Error</h1>
                    <pre style={{ backgroundColor: '#000', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
                        {this.state.error?.toString()}
                    </pre>
                    {this.state.errorInfo && (
                        <>
                            <h3>Component Stack:</h3>
                            <pre style={{ backgroundColor: '#000', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </>
                    )}
                    <button 
                        onClick={() => window.location.reload()} 
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// In setup():
root.render(
    <ErrorBoundary>
        <App {...props} />
    </ErrorBoundary>
);
```

**Benefit**: Instead of blank screen, user sees error details + reload button.

---

## Browser Testing in Containerized Environments

**Issue**: `browser_navigate` tool fails with "No usable sandbox" even with `--no-sandbox` flag in Docker/VM environments.

**Attempted Fix** (may not work in all envs):
1. Install Chromium: `sudo apt-get install -y chromium-browser`
2. Create wrapper:
   ```bash
   sudo mv /snap/bin/chromium /snap/bin/chromium.orig
   echo '#!/bin/bash
   /snap/bin/chromium.orig --no-sandbox "$@"' | sudo tee /snap/bin/chromium
   sudo chmod +x /snap/bin/chromium
   ```
3. Try `browser_navigate` again

**Limitation**: Some container/VM setups (like this one) still block Chrome even with `--no-sandbox`. 

**Workaround**:
- Debug server-side thoroughly (curl, logs, permissions)
- Add ErrorBoundary to catch client-side errors
- Instruct user for browser-side verification:
  - Hard refresh: `Ctrl+Shift+R` (Win/Linux) or `Cmd+Shift+R` (Mac)
  - Open F12 → Console → Share error screenshots
  - Try Incognito/Private window

**User Preference Note**: When user says "Coba lu lakukan test bro" — try `browser_navigate` immediately. If fails, install chromium. If still fails, recognize environment limitation and ask user to test manually.

---

## Simplified Component Debugging

**Problem**: Complex components (Dashboard.jsx with socket.io, node_exporter) cause blank screen.

**Solution**: Replace with minimal version first:
- Remove complex imports (socket.io-client, node_exporter fetch)
- Render simple static content
- Verify page loads
- Add features back incrementally

**Template**: See `templates/simplified-dashboard.jsx` for minimal working Dashboard component.

---

## Session 2026-05-06 Summary

**Fixed**: Blank dashboard caused by stale `emails.index` route reference in `AuthenticatedLayout.jsx`

**Steps**:
1. Read browser console error (Ziggy route error)
2. `grep -r "emails" resources/js/` → Found in AuthenticatedLayout.jsx
3. Patched `getPageTitle()` and `navSections` to remove Emails menu
4. Rebuilt: `npm run build`
5. Cleared cache: `php artisan optimize:clear`
6. Restarted: `sudo systemctl restart php8.3-fpm && sudo nginx -s reload`
7. Added ErrorBoundary to `app.jsx`

**Result**: Dashboard loads with simplified content, ErrorBoundary catches future errors.
