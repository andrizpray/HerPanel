# HerPanel Issues List - Found During Development & Testing
*Created: May 9, 2026*
*Last Updated: May 9, 2026*

## 🔴 CRITICAL ISSUES

### 1. FTP Management - ~~Not Fully Functional~~ **FIXED**
- **Problem**: `FtpController` only creates DB record, doesn't create actual system FTP user
- **Fix Applied**: 
  - Added system user creation via `useradd`, `chpasswd`, `chown`
  - Configured sudoers for www-data to run FTP commands without password
  - Updated `FtpController` with `createSystemUser()`, `updateSystemUserPassword()`, `deleteSystemUser()`
- **Files**: `app/Http/Controllers/FtpController.php`, `/etc/sudoers.d/www-data-ftp`
- **Status**: ✅ **FIXED** (commit `2f68768`)

### 2. Apps Management - ~~PM2 Dependency Issues~~ **FIXED**
- **Problem**: `App` model's `start()`, `stop()`, `restart()` methods use PM2 commands
- **Fix Applied**:
  - Installed PM2 globally: `sudo npm install -g pm2`
  - Updated `App` model with proper error handling, try-catch blocks
  - Added `deletePm2Process()` method for cleanup
  - Updated `AppController` to call `deletePm2Process()` on destroy
- **Files**: `app/Models/App.php`, `app/Http/Controllers/AppController.php`
- **Status**: ✅ **FIXED** (commit `2f68768`)

### 3. Password Storage Security
- **Problem**: FTP passwords stored as plaintext in `ftp_users` table
- **Impact**: Security risk if database is compromised
- **Needed**: Use proper encryption or integrate with vsftpd's password mechanism
- **Files**: `app/Models/FtpUser.php`

---

## 🟡 MODERATE ISSUES

### 4. Web Interface Testing Blocked
- **Problem**: Cannot test FTP/Apps UI without browser login
- **Impact**: Can't verify React pages render correctly or forms work
- **Needed**: 
  - Create test user via seeder/tinker
  - Use browser (or curl with session) to test interface
  - Verify Inertia.js pages load correctly

### 5. Monitoring Server - No Auto-Restart
- **Problem**: Monitoring server started manually via `node monitoring-server.js`
- **Impact**: Server won't restart on crash/reboot
- **Needed**: Use PM2 or systemd service for production
- **Files**: `monitoring/monitoring-server.js`

### 6. Queue Worker - No Auto-Restart
- **Problem**: Queue worker started manually via `php artisan queue:work`
- **Impact**: Crashes won't recover automatically
- **Needed**: Use PM2 or supervisor for production
- **Command**: Should use `php artisan queue:work --daemon`

---

## 🟢 MINOR ISSUES / IMPROVEMENTS

### 7. FTP Quota Not Enforced
- **Problem**: `quota_mb` field exists but not enforced at system level
- **Impact**: Users can upload beyond quota
- **Needed**: Integrate with filesystem quota or vsftpd quota module

### 8. Apps Port Validation
- **Problem**: Node.js apps need unique ports, no validation for port conflicts
- **Impact**: Multiple apps might try to use same port
- **Needed**: Add port validation in `AppController::store()` and `update()`

### 9. Missing Error Handling
- **Problem**: Controllers lack try-catch for system operations (FTP user creation, PM2 commands)
- **Impact**: Uncaught exceptions will show generic 500 errors
- **Needed**: Add proper error handling with user-friendly messages

### 10. No Seeder for Testing
- **Problem**: No database seeders for ftp_users or apps
- **Impact**: Hard to test with sample data
- **Needed**: Create seeders for `FtpUser` and `App` models

---

## 📋 MISSING FEATURES (from aapanel comparison)

1. **One-Click App Installer** (Phase 28) - WordPress, Joomla, etc.
2. **Metrics/Analytics** - Website traffic, bandwidth per site
3. **API Access** (Phase 30) - RESTful API for automation
4. **Advanced Security** (Phase 29) - Brute force protection, mod_security
5. **Git Deployment** - Deploy from repository
6. **Caching Management** - Varnish, Redis, Memcached config
7. **Multi-PHP Version** - Install/manage multiple PHP versions
8. **Tomcat/Java Support** - For Java applications

---

## ✅ FIXED ISSUES (during this session)

1. ~~Database connection error~~ → Fixed `.env` password
2. ~~`routes/web.php` syntax error (extra `});`)~~ → Fixed
3. ~~Monitoring server missing dependencies~~ → Ran `npm install` in monitoring folder
4. ~~Migration failed~~ → Fixed after DB connection resolved
5. ~~FTP Management not functional~~ → **FIXED** (integrated with vsftpd, system user creation)
6. ~~Apps Management PM2 issues~~ → **FIXED** (PM2 installed globally, error handling added)

---

## 🎯 NEXT STEPS (Priority Order)

1. ✅ ~~Fix FTP Management~~ → **DONE**
2. ✅ ~~Fix Apps Management~~ → **DONE**
3. **Test Web Interface** - Create user, login, test all pages
4. **Add Error Handling** - Wrap system operations in try-catch
5. **Start Missing Features** - One-Click Installer (Phase 28)
6. **Production Setup** - PM2 for monitoring & queue worker, Nginx config

---

*Note: All code changes have been committed and pushed to GitHub as per workflow.*  
*Last commit: `2f68768` - "Fix FTP Management: integrate vsftpd system user creation and PM2 for Apps"*
