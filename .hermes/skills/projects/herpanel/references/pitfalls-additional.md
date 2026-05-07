# Additional Pitfalls — Phase 24+

## routes/web.php Patching Failure
The `patch` tool may report false "multiple matches" for `routes/web.php` even when only one match exists. This happens because `patch` uses fuzzy matching that gets confused by similar lines (e.g., multiple `use` statements in the same file).

**Workaround**: Use `execute_code` with Python `open()` and `string.replace()` instead of `patch` tool for complex files:
```python
path = "/var/www/herpanel/routes/web.php"
with open(path, 'r') as f:
    content = f.read()
# Make changes
content = content.replace("old_string", "new_string", 1)
with open(path, 'w') as f:
    f.write(content)
```
Do NOT use `patch` tool for files with many similar patterns (like routes files with many use statements).

## Dark Theme Form Input Visibility
When creating form inputs in React components, avoid `bg-hpCard2` for input backgrounds — it's too light (nearly white) and text becomes invisible in dark theme. Use `bg-hpBg` or `bg-hpBg2` instead for proper contrast.

**Wrong**: `className="... bg-hpCard2 border ..."`  
**Right**: `className="... bg-hpBg border ..."`

## User Workflow Preference
User prefers slow, careful development: "kerjain perlahan mulai dari yang ringan" (work on it slowly, start with the light/easy parts). Verify each step before proceeding. Prioritize quality over speed. When user says "jangan dipaksakan", it means: stop rushing, slow down, verify each step.

## Session Notes (2026-05-07)
- Firewall Management Phase 24: migration, model, controller, frontend done
- Patch tool bug discovered & workaround found
- Form background fix: bg-hpCard2 → bg-hpBg (commit: d476bbf)
- Firewall routes added to sidebar navigation
- Button design matched to Domains style
