# HerPanel Webmail Backup Configuration

## Database Backups

### Roundcube Database
- **Database Name**: roundcube
- **Database User**: roundcube
- **Database Password**: roundcube_pass
- **Host**: localhost
- **Port**: 3306

### HerPanel Database
- **Database Name**: herpanel_cpanel
- **Database User**: herpanel_user
- **Database Password**: HerPanelDB2026!
- **Host**: localhost
- **Port**: 3306

## Nginx Configuration
- **Webmail Config File**: /etc/nginx/sites-available/webmail
- **Webmail Port**: 8082
- **Webmail Root**: /var/www/html/webmail
- **Main HerPanel Port**: 80

## Roundcube Configuration
- **Config File**: /var/www/html/webmail/config/config.inc.php
- **Database DSN**: mysql://roundcube:roundcube_pass@localhost/roundcube
- **IMAP Host**: localhost:143
- **SMTP Host**: localhost:587
- **Product Name**: HerPanel Webmail
- **Skin**: elastic
- **Language**: en_US

## Email Accounts
- **Test Email**: test@testherpanel.com
- **Test Password**: password123
- **Quota**: 1024 MB
- **Table**: virtual_users

## Test Data Summary
- **Domains**: 1 (testherpanel.com)
- **Email Accounts**: 1 (test@testherpanel.com)
- **Databases**: 1 (testdb_1)
- **Firewall Rules**: 1 (allow from 192.168.1.0/24)
- **Backups**: 2

## Installation Status
- ✅ Roundcube v1.6.7 installed
- ✅ Roundcube database created and schema imported
- ✅ Nginx configured for webmail (port 8082)
- ✅ PHP configuration for Roundcube completed
- ✅ Webmail accessible via HTTP 200
- ✅ Login form present
- ❌ IMAP service (Postfix) not running
- ❌ SMTP service (Dovecot) not running

## Backup Commands

### Backup Roundcube Database
```bash
mysqldump -u roundcube -p'roundcube_pass' roundcube > roundcube_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Backup HerPanel Database
```bash
mysqldump -u herpanel_user -p'HerPanelDB2026!' herpanel_cpanel > herpanel_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Backup Roundcube Configuration
```bash
cp /var/www/html/webmail/config/config.inc.php ./config_roundcube_backup_$(date +%Y%m%d_%H%M%S).php
```

### Backup Nginx Configuration
```bash
cp /etc/nginx/sites-available/webmail ./nginx_webmail_backup_$(date +%Y%m%d_%H%M%S).conf
```

## Restore Commands

### Restore Roundcube Database
```bash
mysql -u roundcube -p'roundcube_pass' roundcube < roundcube_backup_YYYYMMDD_HHMMSS.sql
```

### Restore HerPanel Database
```bash
mysql -u herpanel_user -p'HerPanelDB2026!' herpanel_cpanel < herpanel_backup_YYYYMMDD_HHMMSS.sql
```

## Notes
- Webmail is functional but email services need to be installed for full functionality
- All configurations are saved in the repository for backup purposes
- Test files are included for validation and testing