<?php
// Test script for HerPanel features - FIXED

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Domain;
use App\Models\VirtualUser;
use App\Models\ManagedDatabase;
use App\Models\FirewallRule;
use App\Models\Backup;
use App\Models\User;

echo "=== TESTING HERPANEL FEATURES ===\n\n";

// Get first user or create one
$user = User::first();
if (!$user) {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@herpanel.dev',
        'password' => bcrypt('password123')
    ]);
    echo "✓ Created user: {$user->email}\n";
} else {
    echo "✓ Using existing user: {$user->email}\n";
}

// 1. DOMAIN
echo "\n1. DOMAIN MANAGEMENT\n";
$domain = Domain::firstOrCreate([
    'domain_name' => 'testherpanel.com'
], [
    'user_id' => $user->id,
    'status' => 'active',
    'php_version' => '8.3',
    'ssl_status' => 'none'
]);
echo "✓ Domain: {$domain->domain_name} (ID: {$domain->id})\n";

// 2. EMAIL (VirtualUser)
echo "\n2. EMAIL MANAGEMENT (Virtual Users)\n";
$email = VirtualUser::firstOrCreate([
    'domain_id' => $domain->id,
    'email' => 'test@testherpanel.com'
], [
    'password' => bcrypt('test123'),
    'quota' => 1024,
    'status' => 'active'
]);
echo "✓ Email: {$email->email} (ID: {$email->id})\n";

// 3. DATABASE (ManagedDatabase)
echo "\n3. DATABASE MANAGEMENT\n";
$database = ManagedDatabase::firstOrCreate([
    'domain_id' => $domain->id,
    'name' => 'testdb'
], [
    'user' => 'testuser',
    'password' => 'testpass123',
    'status' => 'active'
]);
echo "✓ Database: {$database->name} (ID: {$database->id})\n";

// 4. FIREWALL RULES
echo "\n4. FIREWALL MANAGEMENT\n";
$firewall = FirewallRule::firstOrCreate([
    'domain_id' => $domain->id,
    'type' => 'allow',
    'source' => '192.168.1.0/24'
], [
    'port' => '80,443',
    'status' => 'active'
]);
echo "✓ Firewall Rule: {$firewall->type} from {$firewall->source} (ID: {$firewall->id})\n";

// 5. BACKUP
echo "\n5. BACKUP MANAGEMENT\n";
$backup = Backup::firstOrCreate([
    'domain_id' => $domain->id,
    'filename' => 'backup_' . time() . '.tar.gz'
], [
    'size' => 1024000,
    'status' => 'completed'
]);
echo "✓ Backup: {$backup->filename} (ID: {$backup->id})\n";

echo "\n=== ALL TEST DATA CREATED SUCCESSFULLY ===\n";
echo "Domain ID: {$domain->id}\n";
echo "Virtual User ID: {$email->id}\n";
echo "Database ID: {$database->id}\n";
echo "Firewall Rule ID: {$firewall->id}\n";
echo "Backup ID: {$backup->id}\n";

// Test controllers exist
echo "\n=== CHECKING CONTROLLERS ===\n";
$controllers = [
    'DomainController',
    'EmailController',
    'DatabaseManagementController',
    'FirewallController',
    'BackupController'
];

foreach ($controllers as $ctrl) {
    $path = __DIR__ . "/app/Http/Controllers/{$ctrl}.php";
    echo file_exists($path) ? "✓ {$ctrl} exists\n" : "✗ {$ctrl} NOT FOUND\n";
}
