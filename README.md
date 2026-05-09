# HerPanel — Custom Hosting Control Panel

![HerPanel Logo](https://img.shields.io/badge/HerPanel-v1.0-blue?style=for-the-badge)
![Laravel](https://img.shields.io/badge/Laravel-13.x-red?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge)

Modern, open-source hosting control panel built with **Laravel 13**, **Inertia.js**, **React**, and **Node.js**. Designed as a lightweight alternative to cPanel/CloudPanel with a professional dark UI.

🌐 **Live Demo**: [https://drizdev.space](https://drizdev.space)  
📦 **Repository**: [github.com/andrizpray/HerPanel](https://github.com/andrizpray/HerPanel)

---

## 🚀 Features (Phase 1-27 Complete, Phase 28-30 Planned)

### ✅ Core Features
- **Authentication System** — Role-based access (admin/reseller/user), Laravel Breeze
- **Domain Management** — Add/delete domains, DNS records (A, AAAA, CNAME, MX, TXT), SSL status tracking
- **Subdomain Management** — Create/manage subdomains with separate SSL
- **File Manager** — Upload, mkdir, rename, delete, preview (text/images/PDF), CHMOD permissions, per-domain isolation
- **Database Management** — Create MySQL databases, phpMyAdmin integration, user management
- **Email Management** — Create email accounts, quota management, aliases/forwarding, filters & spam settings, webmail access
- **Email Authentication** — SPF/DKIM/DMARC setup, SumoPod SMTP relay
- **Real-time Monitoring** — CPU, RAM, Disk, Network stats via Socket.IO + Prometheus/node_exporter
- **Backup Management** — Full/database/files backup, queue processing, download backups
- **User Management** — Multi-user support, roles & permissions
- **PHP Version Management** — Per-domain PHP version switching
- **Cron Job Management** — Schedule and manage cron jobs
- **SSL Certificate Management** — Auto-issue SSL for domains via Let's Encrypt (Certbot)
- **Webmail** — Roundcube integration at `/webmail`
- **Error Pages Custom** — Custom error pages (403, 404, 500, etc.)

### ✅ Technical Highlights
- Professional dark theme (CloudPanel-inspired)
- Fully responsive (mobile/tablet/desktop)
- Real-time stats via WebSocket (port 3001)
- Queue-based backup processing (Redis/Database)
- SSL auto-renewal (Certbot)
- PM2 process management for monitoring server
- **Phase 28:** One-Click App Installer (Planned)
- **Phase 29:** Security Management (Planned)
- **Phase 30:** API & Developer Tools (Planned)

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|-------------|
| **Backend** | Laravel 13 (PHP 8.3) |
| **Frontend** | React 18 + Inertia.js |
| **Styling** | Tailwind CSS (custom `hp-*` palette) |
| **Realtime** | Node.js + Socket.IO + systeminformation |
| **Database** | MySQL 8.0 |
| **Cache/Session** | Redis |
| **Web Server** | Nginx (reverse proxy + SSL) |
| **Monitoring** | Prometheus + node_exporter |
| **Process Manager** | PM2 |
| **Mail** | Postfix + Dovecot + OpenDKIM + SumoPod Relay |

---

## 📋 Requirements

- **OS**: Ubuntu 22.04/24.04
- **PHP**: 8.3+ (with extensions: mysql, redis, mbstring, xml, curl, zip)
- **Node.js**: v22+
- **Database**: MySQL 8.0 / MariaDB
- **Services**: Nginx, Redis, PM2, Certbot

---

## ⚡ Installation

### 📖 Full Setup Guide
See **[SETUP.md](SETUP.md)** for complete setup instructions including:
- Automated setup script (`setup/setup.sh`)
- Manual step-by-step installation
- Webmail (Roundcube) configuration
- Nginx virtual host setup
- Test credentials

### Quick Start (Automated)
```bash
git clone https://github.com/andrizpray/HerPanel.git
cd HerPanel
sudo bash setup/setup.sh
php artisan serve
```

### Quick Start (Manual)
```bash
# 1. Clone & setup environment
git clone https://github.com/andrizpray/HerPanel.git
cd HerPanel
cp .env.example .env
php artisan key:generate

# 2. Setup database (see setup/mysql-setup.sql)
sudo mysql < setup/mysql-setup.sql
php artisan migrate --force

# 3. Install dependencies
composer install --optimize-autoloader
npm install
npm run build

# 4. Run development server
php artisan serve
```

---

## 🌐 Deployment (Nginx + SSL)

### 1. Nginx Configuration
Create `/etc/nginx/sites-available/herpanel-ssl`:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/herpanel/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    # WebSocket proxy for monitoring
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Prometheus proxy
    location /prometheus/ {
        proxy_pass http://127.0.0.1:9090/;
    }

    # phpMyAdmin
    location /phpmyadmin {
        alias /usr/share/phpmyadmin;
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        }
    }

    # Webmail (Roundcube)
    location /webmail {
        alias /var/www/herpanel/public/webmail;
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        }
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 2. Enable Site & SSL
```bash
sudo ln -sf /etc/nginx/sites-available/herpanel-ssl /etc/nginx/sites-enabled/
sudo certbot --nginx -d your-domain.com
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Start PM2 Processes
```bash
cd /var/www/herpanel/monitoring
pm2 start npm --name "herpanel-monitoring" -- start
pm2 start "php artisan queue:work --tries=3" --name "herpanel-queue"
pm2 save
pm2 startup
```

---

## 📖 Documentation

### Domain Management
- Navigate to **Services → Domains**
- Add domain: Enter domain name (automatically sets `domain_name` in DB)
- Manage DNS: Click "DNS (N)" button → Add A/CNAME/MX/TXT records
- SSL Status: Track certificate status (none/pending/active/expired)

### File Manager
- **Path**: `storage/app/filemanager` (sandboxed)
- **Features**: Upload (max 10MB), folder creation, rename, CHMOD (permissions), preview
- **Access**: Services → File Manager

### Database Management
- Create databases + users directly via HerPanel
- Access via **phpMyAdmin** at `/phpmyadmin`
- Connection info displayed after creation

### Email Management
- Create email accounts linked to domains
- Manage aliases/forwarding, quota, filters & spam settings
- **Authentication**: SPF/DKIM/DMARC configured automatically
- **Outgoing Mail**: Relayed via SumoPod (port 465, bypasses port 25 block)
- **Webmail**: Access Roundcube at `/webmail`

### Backup Management
- **Types**: Full (files + DB), Database only, Files only
- **Processing**: Queue-based (runs in background via `herpanel-queue`)
- **Download**: Available after status changes to `completed`
- **Storage**: `storage/app/backups/{user_id}/{backup_id}/`

### Real-time Monitoring
- **Sources**: Socket.IO (2s interval) + Prometheus/node_exporter
- **Metrics**: CPU %, RAM usage, Disk I/O, Network RX/TX, Load Average, Uptime
- **Access**: Sidebar → Monitoring

---

## 🔧 Configuration Files

| File | Description |
|------|-------------|
| `config/app.php` | Application settings |
| `routes/web.php` | Web routes (Inertia pages) |
| `resources/js/Layouts/AuthenticatedLayout.jsx` | Sidebar + Topbar layout |
| `monitoring/monitoring-server.js` | Node.js monitoring server |
| `/etc/nginx/sites-available/herpanel-ssl` | Nginx HTTPS config |
| `/etc/prometheus/prometheus.yml` | Prometheus scrape config |

---

## 📂 Project Structure

```
HerPanel/
├── app/
│   ├── Http/Controllers/    # Laravel controllers
│   ├── Jobs/               # Queue jobs (BackupJob)
│   └── Models/             # Eloquent models
├── monitoring/             # Node.js monitoring server
├── resources/
│   ├── js/Pages/          # React + Inertia pages
│   │   ├── Dashboard.jsx
│   │   ├── Domains/
│   │   ├── FileManager/
│   │   ├── Databases/
│   │   ├── Emails/
│   │   ├── Backups/
│   │   └── Monitoring/
│   └── css/app.css        # Tailwind + custom HP styles
├── routes/web.php          # Web routes
└── public/build/          # Compiled assets
```

---

## 🔐 Security

- **Roles**: Admin, Reseller, User (middleware-protected)
- **Ownership**: All queries filter by `user_id = Auth::id()`
- **SSL**: Let's Encrypt with auto-renewal
- **Email**: SPF/DKIM/DMARC + relay authentication
- **Permissions**: `storage/` and `bootstrap/cache` owned by `www-data`

---

## 🐛 Known Issues & Fixes

### Issue: "Target class [Controller] does not exist"
**Fix**: Add `use` statement in `routes/web.php`:
```php
use App\Http\Controllers\BackupController;
```

### Issue: Monitoring page blank
**Fix**: Verify PM2 processes running:
```bash
pm2 list  # herpanel-monitoring + herpanel-queue should be online
```

### Issue: Backup stuck in "pending"
**Fix**: Check queue worker:
```bash
pm2 logs herpanel-queue
php artisan queue:work  # run manually to see errors
```

---

## 📜 License

MIT License — Free for personal and commercial use.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📧 Contact

- **Developer**: Andris Prayoga
- **Email**: herpanel.dev@gmail.com
- **Project**: [github.com/andrizpray/HerPanel](https://github.com/andrizpray/HerPanel)

---

**Built with ❤️ using Laravel + React + Inertia.js**
