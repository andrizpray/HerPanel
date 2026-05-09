<?php

$config = [];

// Database connection string (DSN)
$config['db_dsnw'] = 'mysql://roundcube:roundcube_pass@localhost/roundcube';

// IMAP host
$config['imap_host'] = 'localhost:143';

// SMTP server host
$config['smtp_host'] = 'localhost:587';

// Secret key for sessions
$config['des_key'] = 'roundcube-secret-key-abc123';

// Product name
$config['product_name'] = 'HerPanel Webmail';

// Enable multiple languages
$config['language'] = 'en_US';

// Enable skin
$config['skin'] = 'elastic';
