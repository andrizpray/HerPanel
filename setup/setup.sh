#!/bin/bash
# HerPanel - Automated Setup Script
# Run: sudo bash setup/setup.sh
# This script installs all dependencies and configures everything

set -e

echo "========================================"
echo "  HerPanel - Automated Setup Script"
echo "========================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get the project root directory (where this script is being run from)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (sudo bash setup/setup.sh)${NC}"
    exit 1
fi

# ============================================
# Step 1: System Requirements
# ============================================
echo -e "${YELLOW}[1/8] Installing system requirements...${NC}"

apt update
apt install -y nginx mysql-server php8.3-fpm php8.3-cli \
    php8.3-mysql php8.3-xml php8.3-mbstring php8.3-curl \
    php8.3-gd php8.3-imap php8.3-bcmath php8.3-zip \
    php8.3-intl php8.3-common php8.3-soap php8.3-ldap \
    curl wget git unzip composer nodejs npm

# Enable & start services
systemctl enable nginx mysql php8.3-fpm
systemctl start nginx mysql php8.3-fpm

echo -e "${GREEN}✓ System requirements installed${NC}"

# ============================================
# Step 2: MySQL Database Setup
# ============================================
echo ""
echo -e "${YELLOW}[2/8] Setting up MySQL databases...${NC}"

mysql < "$PROJECT_DIR/setup/mysql-setup.sql"

echo -e "${GREEN}✓ MySQL databases created${NC}"

# ============================================
# Step 3: Laravel Project Setup
# ============================================
echo ""
echo -e "${YELLOW}[3/8] Setting up Laravel project...${NC}"

cd "$PROJECT_DIR"

# Copy .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
fi

# Install PHP dependencies
composer install --no-interaction --prefer-dist
echo -e "${GREEN}✓ PHP dependencies installed${NC}"

# Generate app key
php artisan key:generate --force
echo -e "${GREEN}✓ App key generated${NC}"

# Run migrations
php artisan migrate --force
echo -e "${GREEN}✓ Database migrations run${NC}"

# ============================================
# Step 4: Frontend Setup
# ============================================
echo ""
echo -e "${YELLOW}[4/8] Setting up frontend assets...${NC}"

npm install --ignore-scripts
npm run build
echo -e "${GREEN}✓ Frontend assets built${NC}"

# ============================================
# Step 5: Roundcube Webmail Setup
# ============================================
echo ""
echo -e "${YELLOW}[5/8] Installing Roundcube webmail...${NC}"

if [ ! -d /var/www/html/webmail ]; then
    mkdir -p /var/www/html
    cd /var/www/html
    
    # Download Roundcube 1.6.7
    wget -q https://github.com/roundcube/roundcubemail/releases/download/1.6.7/roundcubemail-1.6.7-complete.tar.gz
    tar xzf roundcubemail-1.6.7-complete.tar.gz
    mv roundcubemail-1.6.7 webmail
    rm roundcubemail-1.6.7-complete.tar.gz
    
    # Import Roundcube database schema
    mysql -u roundcube -p'roundcube_pass' roundcube < /var/www/html/webmail/SQL/mysql.initial.sql
    
    # Copy Roundcube config
    cp "$PROJECT_DIR/setup/roundcube-config.php" /var/www/html/webmail/config/config.inc.php
    
    # Set permissions
    chown -R www-data:www-data /var/www/html/webmail
    chmod -R 755 /var/www/html/webmail
    
    echo -e "${GREEN}✓ Roundcube webmail installed${NC}"
else
    echo -e "${GREEN}✓ Roundcube webmail already exists${NC}"
fi

cd "$PROJECT_DIR"

# ============================================
# Step 6: Nginx Configuration
# ============================================
echo ""
echo -e "${YELLOW}[6/8] Configuring Nginx...${NC}"

# Copy Nginx configs
cp "$PROJECT_DIR/setup/nginx-webmail.conf" /etc/nginx/sites-available/webmail
cp "$PROJECT_DIR/setup/nginx-roundcube.conf" /etc/nginx/sites-available/roundcube

# Enable sites
ln -sf /etc/nginx/sites-available/webmail /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/roundcube /etc/nginx/sites-enabled/

# Test and reload
nginx -t && systemctl reload nginx
echo -e "${GREEN}✓ Nginx configured${NC}"

# ============================================
# Step 7: PHP-FPM Configuration
# ============================================
echo ""
echo -e "${YELLOW}[7/8] Configuring PHP-FPM...${NC}"

systemctl reload php8.3-fpm
echo -e "${GREEN}✓ PHP-FPM configured${NC}"

# ============================================
# Step 8: Summary
# ============================================
echo ""
echo -e "${GREEN}"
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "  Access URLs:"
echo "  HerPanel:    http://localhost (artisan serve)"
echo "  Webmail:     http://localhost:8082 (Roundcube via Nginx)"
echo ""
echo "  Test Credentials:"
echo "  Email:       test@testherpanel.com"
echo "  Password:    password123"
echo ""
echo "  Commands to run HerPanel:"
echo "  cd $PROJECT_DIR"
echo "  php artisan serve"
echo ""
echo "  Or use the dev script:"
echo "  composer run dev"
echo "========================================"
echo -e "${NC}"
