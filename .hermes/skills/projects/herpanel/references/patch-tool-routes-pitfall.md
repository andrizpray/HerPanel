# Patch Tool Failure on routes/web.php

## Context
Encountered during HerPanel Phase 24 (Firewall Management) when adding FirewallController routes to `routes/web.php`.

## Bug Description
`patch` tool incorrectly reports "Found X matches" for unique `old_string` in files with many repetitive lines (e.g., multiple `use App\Http\Controllers\...` statements in Laravel routes).

## Symptoms
- Error: "Found 5 matches for old_string" when only 1 match exists
- Tool loops on failed patches
- Files may corrupt/truncate after repeated failures

## Workaround
Use Python native file I/O via `execute_code`:
```python
path = "/var/www/herpanel/routes/web.php"
with open(path, 'r') as f:
    content = f.read()
if old_string in content:
    content = content.replace(old_string, new_string, 1)
    with open(path, 'w') as f:
        f.write(content)
```

## Recovery
If file corrupts: `cd /var/www/herpanel && git checkout -- routes/web.php`

## Notes
- Avoid `read_file` for these files (caching issues)
- Applies to any Laravel project with complex `routes/web.php`