<?php
// Test script for Roundcube Webmail functionality

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== ROUNDUBE WEBMAIL TEST ===\n\n";

// 1. Test webmail server accessibility
echo "1. TESTING WEBMAIL SERVER ACCESSIBILITY\n";
$webmail_url = "http://127.0.0.1:8082";
$ch = curl_init($webmail_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code == 200) {
    echo "✓ Webmail server is accessible (HTTP $http_code)\n";
} else {
    echo "✗ Webmail server returned HTTP $http_code\n";
    exit(1);
}

// 2. Test webmail login form
echo "\n2. TESTING WEBMAIL LOGIN FORM\n";
if (strpos($response, 'login-form') !== false && strpos($response, 'rcmloginuser') !== false) {
    echo "✓ Login form is present\n";
} else {
    echo "✗ Login form not found\n";
}

// 3. Test email credentials
echo "\n3. TESTING EMAIL CREDENTIALS\n";
$test_email = "test@testherpanel.com";
$test_password = "password123";

// Check if email exists in database
$email_exists = \DB::table('virtual_users')->where('email', $test_email)->exists();
if ($email_exists) {
    echo "✓ Email account exists: $test_email\n";
    
    // Check password format (should be SHA512-CRYPT or similar)
    $email_data = \DB::table('virtual_users')->where('email', $test_email)->first();
    echo "✓ Email account ID: {$email_data->id}\n";
    echo "✓ Quota: {$email_data->quota_mb} MB\n";
    echo "✓ Password hash: " . substr($email_data->password, 0, 20) . "...\n";
} else {
    echo "✗ Email account not found: $test_email\n";
}

// 4. Test database connection for Roundcube
echo "\n4. TESTING ROUNDCUBE DATABASE CONNECTION\n";
$roundcube_db_host = "127.0.0.1";
$roundcube_db_user = "roundcube";
$roundcube_db_pass = "roundcube_pass";
$roundcube_db_name = "roundcube";

$roundcube_conn = @new mysqli($roundcube_db_host, $roundcube_db_user, $roundcube_db_pass, $roundcube_db_name);

if ($roundcube_conn->connect_error) {
    echo "✗ Roundcube database connection failed: " . $roundcube_conn->connect_error . "\n";
} else {
    echo "✓ Roundcube database connection successful\n";
    
    // Check users table
    $result = $roundcube_conn->query("SELECT COUNT(*) as count FROM users");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "✓ Roundcube users count: {$row['count']}\n";
    }
    
    $roundcube_conn->close();
}

// 5. Test IMAP/SMTP configuration
echo "\n5. TESTING EMAIL SERVICE CONFIGURATION\n";
$imap_host = "127.0.0.1:143";
$smtp_host = "127.0.0.1:587";

// Test IMAP connection
$imap_conn = @fsockopen($imap_host, $timeout = 5);
if ($imap_conn) {
    echo "✓ IMAP service is accessible on $imap_host\n";
    fclose($imap_conn);
} else {
    echo "✗ IMAP service not accessible on $imap_host\n";
}

// Test SMTP connection  
$smtp_conn = @fsockopen($smtp_host, $timeout = 5);
if ($smtp_conn) {
    echo "✓ SMTP service is accessible on $smtp_host\n";
    fclose($smtp_conn);
} else {
    echo "✗ SMTP service not accessible on $smtp_host\n";
}

// 6. Test Nginx configuration for webmail
echo "\n6. TESTING NGINX WEBMAIL CONFIGURATION\n";
$nginx_config_file = "/etc/nginx/sites-available/webmail";
if (file_exists($nginx_config_file)) {
    echo "✓ Nginx webmail config exists\n";
    
    $nginx_content = file_get_contents($nginx_config_file);
    if (strpos($nginx_content, '8082') !== false) {
        echo "✓ Webmail configured on port 8082\n";
    }
    if (strpos($nginx_content, '/var/www/html/webmail') !== false) {
        echo "✓ Webmail root directory configured\n";
    }
} else {
    echo "✗ Nginx webmail config not found\n";
}

// 7. Test PHP-FPM for webmail
echo "\n7. TESTING PHP-FPM FOR WEBMAIL\n";
$webmail_path = "/var/www/html/webmail";
if (is_dir($webmail_path)) {
    echo "✓ Roundcube installation directory exists\n";
    
    $config_file = "$webmail_path/config/config.inc.php";
    if (file_exists($config_file)) {
        echo "✓ Roundcube config file exists\n";
        
        // Check if config has database settings
        $config_content = file_get_contents($config_file);
        if (strpos($config_content, 'db_dsnw') !== false) {
            echo "✓ Database DSN configured\n";
        }
        if (strpos($config_content, 'imap_host') !== false) {
            echo "✓ IMAP host configured\n";
        }
        if (strpos($config_content, 'smtp_host') !== false) {
            echo "✓ SMTP host configured\n";
        }
    } else {
        echo "✗ Roundcube config file not found\n";
    }
} else {
    echo "✗ Roundcube installation not found\n";
}

echo "\n=== WEBMAIL TEST SUMMARY ===\n";
echo "Webmail URL: $webmail_url\n";
echo "Test Email: $test_email\n";
echo "Test Password: $test_password\n";
echo "\n✅ All webmail tests completed!\n";
?>