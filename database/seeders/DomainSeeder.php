<?php

// Database: herpanel_db

-- Insert sample domains
INSERT INTO domains (domain_name, user_id, status, created_at, updated_at) VALUES
('herpanel.test', 2, 'active', NOW(), NOW()),
('example.com', 2, 'active', NOW(), NOW()),
('demo.local', 2, 'expiring', NOW(), NOW());

-- Insert sample subdomains
INSERT INTO subdomains (domain_id, subdomain_name, document_root, status, created_at, updated_at) VALUES
(1, 'www', '/var/www/herpanel/public', 'active', NOW(), NOW()),
(1, 'api', '/var/www/herpanel/api', 'active', NOW(), NOW()),
(1, 'admin', '/var/www/herpanel/admin', 'active', NOW(), NOW()),
(2, 'sub', '/var/www/example/sub', 'active', NOW(), NOW()),
(3, 'test', '/var/www/demo/test', 'active', NOW(), NOW());