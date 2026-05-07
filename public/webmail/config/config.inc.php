<?php
// Roundcube configuration for HerPanel
// Database setup (optional, for internal Roundcube use)
$config['db_dsnw'] = 'mysql://herpanel_admin:HerPanel2026@127.0.0.1/herpanel_cpanel';

// IMAP settings - connect to Dovecot
$config['imap_host'] = 'ssl://127.0.0.1:993';
$config['imap_port'] = 993;

// SMTP settings - connect to Postfix
$config['smtp_host'] = 'tls://127.0.0.1:587';
$config['smtp_port'] = 587;
$config['smtp_user'] = '%u';
$config['smtp_pass'] = '%p';

// General settings
$config['product_name'] = 'HerPanel Webmail';
$config['des_key'] = base64_encode(openssl_random_pseudo_bytes(24));
$config['username_domain'] = 'drizdev.space';
$config['mail_domain'] = 'drizdev.space';

// Disable installer after setup
$config['enable_installer'] = false;

// Language
$config['language'] = 'en_US';
$config['spellcheck_dictionary'] = 'en';
$config['drafts_mbox'] = 'Drafts';
$config['junk_mbox'] = 'Junk';
$config['sent_mbox'] = 'Sent';
$config['trash_mbox'] = 'Trash';

// Plugins
$config['plugins'] = ['archive', 'zipdownload'];
