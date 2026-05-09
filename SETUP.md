# HerPanel - Complete Setup Guide

## 📋 System Requirements
- **OS**: Ubuntu 22.04 / Debian 12
- **PHP**: 8.3+
- **Database**: MySQL 8.0+
- **Web Server**: Nginx 1.24+
- **Node.js**: 22.x
- **NPM**: 10.x
- **Composer**: 2.x

---

## 🚀 Quick Setup (Automated)

```bash
# 1. Clone repository
git clone https://github.com/andrizpray/HerPanel.git
cd HerPanel

# 2. Run automated setup (as root)
sudo bash setup/setup.sh

# 3. Start HerPanel
php artisan serve
```

The setup script will:
1. Install system dependencies (Nginx, MySQL, PHP, Node.js)
2. Create MySQL databases and users
3. Install Laravel PHP dependencies via Composer
4. Run database migrations
5. Build frontend assets (Vite)
6. Install and configure Roundcube webmail
7. Set up Nginx virtual hosts

---

## 🛠 Manual Setup

### 1. Install System Dependencies

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Nginx, MySQL, PHP 8.3
sudo apt install -y nginx mysql-server php8.3-fpm php8.3-cli \
    php8.3-mysql php8.3-xml php8.3-mbstring php8.3-curl \
    php8.3-gd php8.3-imap php8.3-bcmath php8.3-zip \
    php8.3-intl php8.3-common php8.3-soap php8.3-ldap \
    curl wget git unzip

# Install Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install Composer
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
php -r "unlink('composer-setup.php');"

# Start services
sudo systemctl enable nginx mysql php8.3-fpm
sudo systemctl start nginx mysql php8.3-fpm
```

### 2. Setup MySQL Databases

```bash
sudo mysql < setup/mysql-setup.sql
```

This creates:
- **Database**: `herpanel_cpanel`, **User**: `herpanel_user`@`127.0.0.1`
- **Database**: `roundcube`, **User**: `roundcube`@`localhost`

### 3. Setup Laravel Project

```bash
cd /path/to/HerPanel

# Configure environment
cp .env.example .env
# Edit .env if needed (DB credentials, etc.)

# Install PHP dependencies
composer install

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Install & build frontend
npm install
npm run build
```

### 4. Setup Roundcube Webmail

```bash
# Download and install Roundcube
sudo mkdir -p /var/www/html
cd /var/www/html
sudo wget https://github.com/roundcube/roundcubemail/releases/download/1.6.7/roundcubemail-1.6.7-complete.tar.gz
sudo tar xzf roundcubemail-1.6.7-complete.tar.gz
sudo mv roundcubemail-1.6.7 webmail
sudo rm roundcubemail-1.6.7-complete.tar.gz

# Import database schema
sudo mysql -u roundcube -p'roundcube_pass' roundcube < /var/www/html/webmail/SQL/mysql.initial.sql

# Copy configuration
sudo cp /path/to/HerPanel/setup/roundcube-config.php /var/www/html/webmail/config/config.inc.php

# Set permissions
sudo chown -R www-data:www-data /var/www/html/webmail
sudo chmod -R 755 /var/www/html/webmail
```

### 5. Configure Nginx

```bash
# Copy Nginx configs
sudo cp /path/to/HerPanel/setup/nginx-webmail.conf /etc/nginx/sites-available/webmail
sudo cp /path/to/HerPanel/setup/nginx-roundcube.conf /etc/nginx/sites-available/roundcube

# Enable sites
sudo ln -sf /etc/nginx/sites-available/webmail /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/roundcube /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

### 6. Run HerPanel

```bash
cd /path/to/HerPanel

# Development server
php artisan serve

# Or full dev mode (server + queue + logs + Vite)
composer run dev
```

---

## 📁 Project Structure

```
HerPanel/
├── app/                    # Laravel application code
│   ├── Http/
│   │   └── Controllers/    # All controllers
│   └── Models/             # Eloquent models
├── database/
│   └── migrations/         # Database migrations
├── setup/                  # Setup & configuration files
│   ├── setup.sh           # Automated setup script
│   ├── mysql-setup.sql     # MySQL database creation
│   ├── nginx-webmail.conf  # Nginx webmail config (port 8082)
│   ├── nginx-roundcube.conf # Nginx roundcube config (port 80)
│   └── roundcube-config.php # Roundcube configuration
├── .env                   # Environment configuration
├── .env.example           # Environment template
└── WEBMAIL_BACKUP_CONFIG.md # Backup documentation
```

## 🔗 Access URLs

| Service | URL | Notes |
|---------|-----|-------|
| HerPanel (dev) | `http://localhost:8000` | Laravel artisan serve |
| Webmail | `http://localhost:8082` | Roundcube via Nginx |
| Roundcube | `http://localhost:80` | Roundcube standalone |

## 👤 Test Credentials

- **Email**: `test@testherpanel.com`
- **Password**: `password123`
- **Admin Login**: `test@herpanel.dev` / `password123`

---

## 📦 Backup & Database Dumps

All backup files are stored in the repository:

| File | Contents |
|------|----------|
| `WEBMAIL_BACKUP_CONFIG.md` | Full backup documentation |
| `nginx_webmail_backup.conf` | Nginx webmail config backup |
| `roundcube_config_backup.php` | Roundcube PHP config backup |
| `roundcube_schema_backup.sql` | Roundcube database schema |
| `roundcube_db_backup.sql` | Roundcube database dump |
| `herpanel_db_backup.sql` | HerPanel database dump |

## 🧪 Testing

Test scripts are included to verify functionality:

```bash
# Test all HerPanel features
php test_all_features.php

# Test webmail specifically
php test_webmail_final.php
```
