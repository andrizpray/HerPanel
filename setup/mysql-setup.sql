-- MySQL Database Setup for HerPanel
-- Run: sudo mysql < mysql-setup.sql

-- Create HerPanel database
CREATE DATABASE IF NOT EXISTS herpanel_cpanel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create HerPanel user
CREATE USER IF NOT EXISTS 'herpanel_user'@'127.0.0.1' IDENTIFIED BY 'HerPanelDB2026!';
GRANT ALL PRIVILEGES ON herpanel_cpanel.* TO 'herpanel_user'@'127.0.0.1';

-- Create Roundcube database
CREATE DATABASE IF NOT EXISTS roundcube CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Roundcube user
CREATE USER IF NOT EXISTS 'roundcube'@'localhost' IDENTIFIED BY 'roundcube_pass';
GRANT ALL PRIVILEGES ON roundcube.* TO 'roundcube'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;
