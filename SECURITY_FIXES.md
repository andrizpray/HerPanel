# Security Fixes Applied to HerPanel

## Date: 2026-05-08

This document outlines all security vulnerabilities identified and fixed in the HerPanel Laravel project.

---

## Critical Security Issues Fixed

### 1. SQL Injection Vulnerabilities ⚠️ CRITICAL

**Location:** `DatabaseController.php`

**Issue:** Direct string interpolation in SQL statements without proper escaping, allowing potential SQL injection attacks.

**Fixed:**
- Lines 47-52: Database creation now uses parameterized queries for character set and collation
- Line 91-92: User password updates now use prepared statements
- Lines 111-114: User deletion now uses prepared statements
- Added whitelist validation for character sets and collations

**Before:**
```php
DB::statement("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET {$charSet} COLLATE {$collation}");
DB::statement("ALTER USER '{$database->db_user}'@'localhost' IDENTIFIED BY '{$dbPassword}'");
```

**After:**
```php
DB::statement("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET ? COLLATE ?", [$charSet, $collation]);
DB::statement("ALTER USER ?@'localhost' IDENTIFIED BY ?", [$database->db_user, $dbPassword]);
```

---

### 2. Command Injection Vulnerability ⚠️ CRITICAL

**Location:** `CronJobController.php` - Line 97

**Issue:** User-controlled commands executed directly without sanitization, allowing arbitrary system command execution.

**Fixed:**
- Added whitelist of allowed command executables
- Implemented command validation before execution
- Added `escapeshellcmd()` for additional protection
- Added error handling for disallowed commands

**Before:**
```php
exec($cronJob->command . ' 2>&1', $output, $returnVar);
```

**After:**
```php
// Whitelist validation
$allowedCommands = ['/usr/bin/php', '/usr/bin/curl', '/usr/bin/wget', '/bin/bash', '/usr/bin/python3', '/usr/bin/node'];
// Validation logic...
$safeCommand = escapeshellcmd($cronJob->command) . ' 2>&1';
exec($safeCommand, $output, $returnVar);
```

**Note:** Consider using Laravel's job queue system instead of direct command execution for better security.

---

### 3. Authorization Bypass Vulnerabilities ⚠️ HIGH

**Issue:** Multiple controllers fetched resources without verifying user ownership, allowing horizontal privilege escalation.

**Fixed Controllers:**

#### EmailController.php
- `index()`: Now filters emails by user's domains only
- `create()`: Now shows only user's domains
- `store()`: Verifies domain ownership before creating email
- `edit()`: Verifies email belongs to user's domain
- `update()`: Verifies email belongs to user's domain
- `destroy()`: Verifies email belongs to user's domain

#### RedirectController.php
- All methods now verify domain ownership with `Domain::where('user_id', auth()->id())`

#### MimeTypeController.php
- All methods now verify domain ownership with `Domain::where('user_id', auth()->id())`

#### HotlinkProtectionController.php
- All methods now verify domain ownership with `Domain::where('user_id', auth()->id())`

#### BackupController.php
- `store()`: Now verifies domain ownership when domain_id is provided

**Before:**
```php
$domain = Domain::findOrFail($domainId);
```

**After:**
```php
$domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
```

---

### 4. Insecure Password Storage ⚠️ HIGH

**Location:** `EmailController.php` - Lines 73, 110

**Issue:** Email passwords stored in plaintext in the database.

**Fixed:**
- Email passwords now hashed using `bcrypt()` before storage
- Both creation and update methods now hash passwords

**Before:**
```php
// Simple: store password directly (temporary, no hash)
$passwordToStore = $validated['password'];
```

**After:**
```php
// Hash password using bcrypt for secure storage
$passwordToStore = bcrypt($validated['password']);
```

**Note:** If using Dovecot for email, configure it to accept bcrypt hashes or use Dovecot-compatible hash schemes.

---

## Medium Security Issues Fixed

### 5. Path Traversal Vulnerability

**Location:** `FileManagerController.php`

**Issue:** User-supplied paths not sanitized, allowing directory traversal attacks.

**Fixed:**
- Added `sanitizePath()` method to remove directory traversal attempts
- Applied sanitization to all path-related methods:
  - `index()`
  - `store()`
  - `mkdir()`
  - `delete()`
  - `preview()`
  - `rename()`
  - `permissions()`
  - `updatePermissions()`

**New Method:**
```php
protected function sanitizePath($path)
{
    // Remove any directory traversal attempts
    $path = str_replace(['../', '..\\', '../', '..'], '', $path);
    // Remove leading/trailing slashes
    $path = trim($path, '/\\');
    // Normalize path separators
    $path = str_replace('\\', '/', $path);
    return $path;
}
```

---

### 6. Unsafe File Operations

**Locations:** Multiple controllers

**Issue:** File operations without existence checks or error handling.

**Fixed:**

#### DomainController.php
- Line 285-290: Added existence checks before `unlink()` operations
- Used `@unlink()` to suppress errors gracefully

#### ErrorPageController.php
- Line 145: Added existence check before `unlink()` operation
- Used `@unlink()` to suppress errors gracefully

#### BackupController.php
- Lines 52-57: Added `@unlink()` and `@rmdir()` for safe file deletion

---

## Additional Security Improvements

### 7. Documentation Added

**Location:** `ErrorPageController.php` - Line 133

**Improvement:** Added documentation explaining that the `preview()` method is intentionally public as it's called by Nginx to serve custom error pages.

---

## Recommendations for Further Security Hardening

### Immediate Actions Needed:

1. **Implement Laravel Policies**
   - Create Policy classes for Domain, Database, EmailAccount, etc.
   - Centralize authorization logic
   - Use `$this->authorize()` consistently

2. **Add Rate Limiting**
   - Protect sensitive operations (SSL generation, backups, cron execution)
   - Use Laravel's rate limiting middleware
   - Prevent DoS attacks

3. **Implement Audit Logging**
   - Log all security-sensitive operations
   - Track failed authorization attempts
   - Monitor command executions
   - Use Laravel's logging facilities

4. **Add Database Transactions**
   - Wrap multi-step operations in transactions
   - Ensure atomicity for database + user creation
   - Rollback on failures

### Medium Priority:

5. **Input Validation Enhancement**
   - Add IP address/CIDR validation in FirewallService
   - Validate file paths more strictly in FileManagerController
   - Add content-type validation for file uploads

6. **Configuration Improvements**
   - Move hardcoded paths to configuration files
   - Use environment variables for sensitive settings
   - Document all configuration options

7. **Error Handling**
   - Implement global exception handler
   - Standardize error responses
   - Avoid exposing sensitive information in errors

### Low Priority:

8. **Code Quality**
   - Implement soft deletes for critical resources
   - Standardize table naming conventions
   - Add comprehensive unit and integration tests
   - Document API endpoints

9. **Security Headers**
   - Add security headers middleware
   - Implement CSRF protection verification
   - Add Content Security Policy headers

10. **Dependency Management**
    - Regularly update Laravel and dependencies
    - Use `composer audit` to check for vulnerabilities
    - Pin dependency versions in production

---

## Testing Recommendations

After applying these fixes, test the following:

1. **Authorization Tests**
   - Verify users cannot access other users' resources
   - Test all CRUD operations for each resource type
   - Attempt to access resources with invalid IDs

2. **SQL Injection Tests**
   - Test database operations with special characters
   - Attempt SQL injection in database names, usernames, passwords
   - Verify prepared statements are working correctly

3. **Command Injection Tests**
   - Test cron job execution with malicious commands
   - Verify whitelist is enforced
   - Test command escaping

4. **Path Traversal Tests**
   - Test file manager with `../` in paths
   - Verify sanitization is working
   - Test all file operations

5. **Password Security Tests**
   - Verify passwords are hashed in database
   - Test password updates
   - Verify bcrypt is being used

---

## Security Contact

For security issues, please contact: [Your Security Contact Email]

## Version History

- **v1.0** (2026-05-08): Initial security audit and fixes applied
  - Fixed SQL injection vulnerabilities
  - Fixed command injection vulnerability
  - Fixed authorization bypass issues
  - Fixed insecure password storage
  - Fixed path traversal vulnerability
  - Fixed unsafe file operations
