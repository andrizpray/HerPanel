# Patch Tool Workaround

## Problem
The `patch` tool may report false "Found N matches" errors on files with many similar lines (e.g., multiple `use` statements in `routes/web.php`). This is a bug in the fuzzy matching algorithm.

**Symptoms**: Error "Found 5 matches" when only 1 match exists.

## Workaround
Use `execute_code` with Python `open()` and `str.replace()` instead of `patch` tool:

```python
path = '/var/www/herpanel/routes/web.php'
with open(path, 'r') as f:
    content = f.read()

# Replace with enough context to be unique
old = 'use App\\Http\\Controllers\\FileManagerController;\nuse App\\Http\\Controllers\\MonitoringController;'
new = 'use App\\Http\\Controllers\\FileManagerController;\nuse App\\Http\\Controllers\\FirewallController;\nuse App\\Http\\Controllers\\MonitoringController;'
content = content.replace(old, new, 1)

with open(path, 'w') as f:
    f.write(content)
```

## Important Notes
- Avoid using `read_file` for the same file multiple times (cache causes stale reads)
- Use `open()` directly in `execute_code`
- If `patch` tool fails with match errors on complex files, switch to Python file I/O immediately

## Example Session
In Phase 24 Firewall Management, `patch` tool failed 4 times with "Found 5 matches" when trying to add `FirewallController` to `routes/web.php`. Workaround with Python `open()` succeeded on first try.
