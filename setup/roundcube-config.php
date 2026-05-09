<?php
/**
 * Roundcube Webmail Configuration
 * Copy this file to: /var/www/html/webmail/config/config.inc.php
 * Or your Roundcube installation's config directory
 */

$config = [];

// Database connection
$config['db_dsnw'] = 'mysql://roundcube:roundcube_pass@localhost/roundcube';

// IMAP settings
$config['imap_host'] = 'localhost:143';
$config['imap_port'] = 143;

// SMTP settings
$config['smtp_host'] = 'localhost:587';
$config['smtp_port'] = 587;

// Encryption
$config['imap_conn_options'] = [
    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false],
];
$config['smtp_conn_options'] = [
    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false],
];

// Product name
$config['product_name'] = 'HerPanel Webmail';

// Skin & language
$config['skin'] = 'elastic';
$config['language'] = 'en_US';

// Session
$config['session_lifetime'] = 600;
$config['session_domain'] = '';
$config['session_path'] = '/';
$config['session_secure'] = false;

// Security
$config['des_key'] = 'roundcube-secret-key-abc123';

// Plugins
$config['plugins'] = [
    'archive',
    'zipdownload',
    'emoticons',
    'enigma',
    'new_user_identity',
    'newmail_notifier',
    'password',
    'markasjunk',
    'managesieve',
    'redundant_attachments',
];

// Mailbox settings
$config['default_imap_folders'] = ['INBOX', 'Drafts', 'Sent', 'Junk', 'Trash'];
$config['create_default_folders'] = true;
$config['protect_default_folders'] = true;
$config['skip_deleted'] = false;
$config['flag_for_deletion'] = true;

// Upload settings
$config['max_message_size'] = '50M';
$config['upload_max_filesize'] = '50M';

// Logging
$config['log_dir'] = '/var/log/roundcube/';
$config['log_driver'] = 'file';
$config['smtp_log'] = true;
$config['imap_log'] = true;

// Auto-create user on first login
$config['auto_create_user'] = true;
