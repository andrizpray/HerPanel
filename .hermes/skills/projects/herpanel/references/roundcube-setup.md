# Roundcube Webmail Setup for HerPanel

## Overview
Roundcube provides web-based email access for HerPanel users. Installed at `/var/www/roundcube`, accessible at `https://drizdev.space/roundcube/`.

## Prerequisites
- PHP extensions: `mysql`, `xml`, `mbstring`, `intl`, `curl`, `zip`, `json` (already installed)
- IMAP server (Dovecot) listening on port 143
- SMTP server (Postfix) listening on port 25
- Nginx with PHP-FPM support

## Installation Steps

### 1. Download & Extract
```bash
cd /tmp
curl -L -o roundcube.tar.gz "https://github.com/roundcube/roundcubemail/releases/download/1.6.9/roundcubemail-1.6.9-complete.tar.gz"
tar -xzf roundcube.tar.gz
sudo mv roundcubemail-1.6.9 /var/www/roundcube
rm roundcube.tar.gz
```

### 2. Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/roundcube
sudo find /var/www/roundcube -type d -exec chmod 755 {} \;
sudo find /var/www/roundcube -type f -exec chmod 644 {} \;
```

### 3. Database Setup
```bash
# Generate password
ROUNDCUBE_PASS=$(openssl rand -base64 24)

# Create DB and user
mysql -u herpanel_admin -p'HPadmin2026!' -h 127.0.0.1 -e "
CREATE DATABASE IF NOT EXISTS roundcube;
CREATE USER IF NOT EXISTS 'roundcube'@'127.0.0.1' IDENTIFIED BY '$ROUNDCUBE_PASS';
GRANT ALL PRIVILEGES ON roundcube.* TO 'roundcube'@'127.0.0.1';
FLUSH PRIVILEGES;
"

# Import schema
mysql -u herpanel_admin -p'HPadmin2026!' -h 127.0.0.1 roundcube < /var/www/roundcube/SQL/mysql.initial.sql
```

### 4. Configure Roundcube
```bash
cd /var/www/roundcube/config
sudo cp config.inc.php.sample config.inc.php
sudo chown ubuntu:ubuntu config.inc.php
```

Edit `config.inc.php` with these settings:
```php
$config['db_dsnw'] = 'mysql://roundcube:ROUNDCUBE_PASS@127.0.0.1/roundcube';
$config['imap_host'] = 'localhost:143';
$config['smtp_host'] = 'localhost:25';
$config['smtp_user'] = '%u';
$config['smtp_pass'] = '%p';
$config['product_name'] = 'HerPanel Webmail';
$config['des_key'] = 'GENERATED_24_CHAR_KEY'; // Use: openssl rand -base64 18 | tr -dc 'A-Za-z0-9' | head -c 24
$config['plugins'] = ['archive', 'zipdownload'];
$config['skin'] = 'elastic';
```

### 5. Nginx Configuration
Create snippet `/etc/nginx/snippets/roundcube.conf`:
```nginx
# Roundcube Webmail
location /roundcube {
    alias /var/www/roundcube;
    index index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $request_filename;
        include fastcgi_params;
    }
}
```

Include in `herpanel-ssl` config:
```nginx
# Inside server block
include /etc/nginx/snippets/roundcube.conf;
```

Test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Final Permissions & Security
```bash
sudo chown -R www-data:www-data /var/www/roundcube/temp /var/www/roundcube/logs
sudo chmod 755 /var/www/roundcube/temp /var/www/roundcube/logs
sudo mv /var/www/roundcube/installer /var/www/roundcube/installer.bak
```

## Verification
1. **Access**: Open `https://drizdev.space/roundcube/`
2. **Login**: Use existing email account (e.g., `andriz@eatrade-journal.site`)
3. **Check IMAP**: `netstat -tlnp | grep 143` (Dovecot)
4. **Check SMTP**: `netstat -tlnp | grep 25` (Postfix)

## Troubleshooting
- **403 Forbidden**: Check Nginx `alias` directive and PHP-FPM socket path
- **DB Connection Error**: Verify `db_dsnw` format and MySQL user privileges
- **IMAP Login Failed**: Check Dovecot config `/etc/dovecot/dovecot-sql.conf.ext`
- **Permission Denied**: Ensure `www-data` owns `temp/` and `logs/` directories

## Current Configuration (as of May 2026)
- **Path**: `/var/www/roundcube`
- **Config**: `/var/www/roundcube/config/config.inc.php`
- **DB**: `roundcube` (user: `roundcube@127.0.0.1`, pass: `RoundcubePass2026!`)
- **IMAP**: `localhost:143`
- **SMTP**: `localhost:25`
- **Nginx Snippet**: `/etc/nginx/snippets/roundcube.conf`
- **Access URL**: `https://drizdev.space/roundcube/`
