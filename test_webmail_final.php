<?php
// Final comprehensive test for HerPanel webmail functionality

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== HERPANEL WEBMAIL FUNCTIONALITY TEST ===\n\n";

// Test results summary
$tests = [
    'webmail_server_access' => false,
    'login_form_present' => false,
    'email_account_exists' => false,
    'roundcube_db_connection' => false,
    'nginx_webmail_config' => false,
    'php_roundcube_config' => false,
    'imap_service_running' => false,
    'smtp_service_running' => false,
    'webmail_login_working' => false
];

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
    $tests['webmail_server_access'] = true;
} else {
    echo "✗ Webmail server returned HTTP $http_code\n";
}

// 2. Test webmail login form
echo "\n2. TESTING WEBMAIL LOGIN FORM\n";
if (strpos($response, 'login-form') !== false && strpos($response, 'rcmloginuser') !== false) {
    echo "✓ Login form is present\n";
    $tests['login_form_present'] = true;
} else {
    echo "✗ Login form not found\n";
}

// 3. Test email credentials
echo "\n3. TESTING EMAIL CREDENTIALS\n";
$test_email = "test@testherpanel.com";
$email_exists = \DB::table('virtual_users')->where('email', $test_email)->exists();

if ($email_exists) {
    echo "✓ Email account exists: $test_email\n";
    $tests['email_account_exists'] = true;
    
    $email_data = \DB::table('virtual_users')->where('email', $test_email)->first();
    echo "✓ Email account ID: {$email_data->id}\n";
    echo "✓ Quota: {$email_data->quota_mb} MB\n";
} else {
    echo "✗ Email account not found: $test_email\n";
}

// 4. Test Roundcube database connection
echo "\n4. TESTING ROUNDCUBE DATABASE CONNECTION\n";
$roundcube_conn = @new mysqli("127.0.0.1", "roundcube", "roundcube_pass", "roundcube");

if ($roundcube_conn->connect_error) {
    echo "✗ Roundcube database connection failed: " . $roundcube_conn->connect_error . "\n";
} else {
    echo "✓ Roundcube database connection successful\n";
    $tests['roundcube_db_connection'] = true;
    
    $result = $roundcube_conn->query("SELECT COUNT(*) as count FROM users");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "✓ Roundcube users count: {$row['count']}\n";
    }
    
    $roundcube_conn->close();
}

// 5. Test email services
echo "\n5. TESTING EMAIL SERVICES\n";
$imap_test = @fsockopen("127.0.0.1:143", $timeout = 5);
$smtp_test = @fsockopen("127.0.0.1:587", $timeout = 5);

if ($imap_test) {
    echo "✓ IMAP service is accessible\n";
    $tests['imap_service_running'] = true;
    fclose($imap_test);
} else {
    echo "✗ IMAP service not accessible\n";
}

if ($smtp_test) {
    echo "✓ SMTP service is accessible\n";
    $tests['smtp_service_running'] = true;
    fclose($smtp_test);
} else {
    echo "✗ SMTP service not accessible\n";
}

// 6. Test Nginx configuration
echo "\n6. TESTING NGINX WEBMAIL CONFIGURATION\n";
$nginx_config_file = "/etc/nginx/sites-available/webmail";
if (file_exists($nginx_config_file)) {
    echo "✓ Nginx webmail config exists\n";
    $tests['nginx_webmail_config'] = true;
    
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

// 7. Test PHP configuration
echo "\n7. TESTING PHP CONFIGURATION\n";
$webmail_path = "/var/www/html/webmail";
if (is_dir($webmail_path)) {
    echo "✓ Roundcube installation directory exists\n";
    
    $config_file = "$webmail_path/config/config.inc.php";
    if (file_exists($config_file)) {
        echo "✓ Roundcube config file exists\n";
        $tests['php_roundcube_config'] = true;
        
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
    }
}

// 8. Test webmail login (via curl simulation)
echo "\n8. TESTING WEBMAIL LOGIN FUNCTIONALITY\n";
$login_ch = curl_init("http://127.0.0.1:8082");
curl_setopt($login_ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($login_ch, CURLOPT_POST, true);
curl_setopt($login_ch, CURLOPT_POSTFIELDS, "_task=login&_action=login&_user=test@testherpanel.com&_pass=password123");
curl_setopt($login_ch, CURLOPT_COOKIEJAR, '/tmp/cookies.txt');
curl_setopt($login_ch, CURLOPT_COOKIEFILE, '/tmp/cookies.txt');
$login_response = curl_exec($login_ch);
$login_http_code = curl_getinfo($login_ch, CURLINFO_HTTP_CODE);
curl_close($login_ch);

if ($login_http_code == 200 && strpos($login_response, 'Invalid request') === false) {
    echo "✓ Webmail login appears to work\n";
    $tests['webmail_login_working'] = true;
} else {
    echo "✗ Webmail login failed (HTTP $login_http_code)\n";
    if (strpos($login_response, 'Invalid request') !== false) {
        echo "✓ Login form present but authentication failed (expected without email services)\n";
    }
}

// Final summary
echo "\n=== FINAL TEST RESULTS ===\n";
$passed_tests = array_sum($tests);
$total_tests = count($tests);
$percentage = round(($passed_tests / $total_tests) * 100, 1);

echo "Tests Passed: $passed_tests / $total_tests ($percentage%)\n\n";

foreach ($tests as $test => $result) {
    $status = $result ? '✓' : '✗';
    $test_name = str_replace('_', ' ', $test);
    echo "$status $test_name\n";
}

echo "\n=== CONCLUSION ===\n";
echo "Webmail installation: " . ($passed_tests >= 6 ? "SUCCESS" : "PARTIAL") . "\n";
echo "Email services: " . ($tests['imap_service_running'] && $tests['smtp_service_running'] ? "RUNNING" : "NOT RUNNING") . "\n";
echo "Webmail accessible: " . ($tests['webmail_server_access'] ? "YES" : "NO") . "\n";
echo "Login form: " . ($tests['login_form_present'] ? "PRESENT" : "MISSING") . "\n";

echo "\n=== ACCESS INFO ===\n";
echo "Webmail URL: $webmail_url\n";
echo "Test Email: $test_email\n";
echo "Test Password: password123\n";
echo "Note: Login will fail until IMAP/SMTP services are installed and configured\n";
?>