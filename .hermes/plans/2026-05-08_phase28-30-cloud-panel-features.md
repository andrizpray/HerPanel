# HerPanel Phase 28-30: Cloud Panel Essential Features

**Created:** 2026-05-08  
**Purpose:** Define missing essential features for a complete cloud hosting panel (HerPanel)

---

## 🎯 PHASE 28: One-Click Application Installer

### **Objective**
Allow users to deploy popular applications (WordPress, Laravel, etc.) with a single click — no manual setup required.

### **Features**
1. **Application Repository**
   - WordPress (latest + multisite)
   - Laravel (auto-deploy from Git)
   - Joomla, Drupal, Magento
   - Custom app templates (user-defined)

2. **Deployment Wizard**
   - Select app → choose domain/subdomain
   - Auto-create database + user
   - Auto-configure `wp-config.php` / `.env`
   - Set admin credentials
   - Install with progress bar

3. **Management**
   - List installed apps (per domain)
   - Update/remove apps
   - Clone/staging environment
   - Backup before update

### **Technical Stack**
- Laravel + Inertia.js + React (same as HerPanel)
- Git clone for Laravel apps
- cURL + unzip for WordPress/Joomla
- Automated `artisan` / `wp-cli` commands

### **Status:** ❌ Not Started

---

## 🔒 PHASE 29: Security Management

### **Objective**
Provide comprehensive security tools to protect user domains and servers.

### **Features**
1. **Firewall Management**
   - UFW (Uncomplicated Firewall) GUI
   - Allow/block IP addresses
   - Port management (open/close)
   - Rate limiting (per IP, per endpoint)

2. **IP & Access Control**
   - Whitelist/blacklist IPs
   - Geo-blocking (block countries)
   - Failed login monitoring
   - Temporary IP ban after X failed attempts

3. **Malware & Integrity Scanning**
   - File integrity monitoring (FIM)
   - Malware scan (ClamAV integration)
   - Auto-quarantine infected files
   - Email alerts for threats

4. **SSL/TLS Enhancements**
   - Force HTTPS redirect
   - HSTS (HTTP Strict Transport Security)
   - TLS version control (disable old TLS)
   - Certbot auto-renewal status (already in Phase 25, enhance here)

### **Technical Stack**
- UFW CLI wrapper (Laravel command)
- Fail2ban integration (already partially in Phase 16)
- ClamAV for malware scanning
- Laravel jobs for background scanning

### **Status:** ❌ Not Started

---

## 🔌 PHASE 30: API & Developer Tools

### **Objective**
Enable developers and resellers to integrate with HerPanel programmatically.

### **Features**
1. **REST API**
   - Token-based auth (Laravel Sanctum)
   - Endpoints for:
     - Domain management (CRUD)
     - Email accounts (CRUD)
     - Database management
     - SSL certificate issuance
     - File manager operations
   - Rate limiting per API token
   - API documentation (Swagger/OpenAPI)

2. **Webhooks**
   - Event triggers: domain created, email created, SSL issued, etc.
   - Configure webhook URLs per user
   - Retry logic on failure
   - Webhook logs (success/fail)

3. **Git Deployment**
   - Connect GitHub/GitLab repo to domain
   - Auto-deploy on push (webhook receiver)
   - Deployment scripts (npm install, composer install, migrations)
   - Deployment history + rollback

4. **CLI Tool (Optional)**
   - HerPanel CLI for server management
   - Commands: `herpanel domain:add`, `herpanel email:create`, etc.
   - Interactive mode + scripting support

### **Technical Stack**
- Laravel API routes + Sanctum
- Webhook using Laravel Queues + Redis
- GitHub webhook handler
- CLI using Symfony Console component

### **Status:** ❌ Not Started

---

## 📊 COMPLETENESS SUMMARY

| Phase | Feature | Status | Priority |
|-------|---------|--------|----------|
| Phase 5 | Email Management | ✅ Completed | - |
| Phase 24 | Advanced Email Features | ❌ Pending | Medium |
| **Phase 28** | **One-Click App Installer** | ❌ **Not Started** | **High** |
| **Phase 29** | **Security Management** | ❌ **Not Started** | **High** |
| **Phase 30** | **API & Developer Tools** | ❌ **Not Started** | **Medium** |

---

## 🎯 RECOMMENDED ROADMAP

### **Option A: Complete Cloud Panel (Recommended)**
1. ✅ Phase 5 (Email) — *Done*
2. ❌ Phase 24 (Advanced Email) — *Next small step*
3. ❌ **Phase 28 (App Installer)** — *High impact for users*
4. ❌ **Phase 29 (Security)** — *Critical for production*
5. ❌ **Phase 30 (API)** — *For developers & scaling*

### **Option B: Minimal Viable Panel**
1. ✅ Phase 5 (Email) — *Done*
2. ❌ Phase 28 (App Installer) — *Core feature*
3. ❌ Phase 29 (Security - firewall only) — *Essential*
4. Skip Phase 24 & 30 for now

---

## 📝 NOTES

- Phase 28-30 are **essential** for a production-ready cloud panel
- Phase 28 (App Installer) is the **highest ROI** — users expect one-click WordPress/Laravel
- Phase 29 (Security) is **critical** for production servers (especially firewall + fail2ban)
- Phase 30 (API) enables **reseller models** and **developer integrations** (future-proofing)
- Phase 24 (Advanced Email) can be done in parallel or after Phase 28-30

---

## 🚀 NEXT ACTION

**User decision needed:**
1. Start with **Phase 28 (App Installer)** — high user value?
2. Start with **Phase 29 (Security)** — production readiness?
3. Finish **Phase 24 (Advanced Email)** first — complete email suite?
4. Or define different features for Phase 28-30?

Kabarin bro, mana yang mau diprioritaskan. 🎯
