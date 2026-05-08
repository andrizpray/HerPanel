<?php
// Test script for HerPanel features - FINAL CORRECT VERSION

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Domain;
use App\Models\EmailAccount;
use App\Models\ManagedDatabase;
use App\Models\FirewallRule;
use App\Models\Backup;
use App\Models\User;

echo "=== TESTING HERPANEL FEATURES ===\n\n";

// Get first user
$user = User::first();
if (!$user) {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@herpanel.dev',
        'password' => bcrypt('password123')
    ]);
    echo "✓ Created user: {$user->email}\n\n";
} else {
    echo "✓ Using existing user: {$user->email}\n\n";
}

// 1. DOMAIN MANAGEMENT
echo "1. DOMAIN MANAGEMENT\n";
$domain = Domain::firstOrCreate(
    ['domain_name' => 'testherpanel.com'],
    [
        'user_id' => $user->id,
        'status' => 'active',
        'php_version' => '8.3',
        'ssl_status' => 'none'
    ]
);
echo "✓ Domain: {$domain->domain_name} (ID: {$domain->id})\n\n";

// 2. EMAIL MANAGEMENT (EmailAccount -> virtual_users table)
echo "2. EMAIL MANAGEMENT\n";
$email = EmailAccount::firstOrCreate(
    [
        'domain_id' => $domain->id,
        'email' => 'test@testherpanel.com'
    ],
    [
        'password' => bcrypt('test123'),
        'quota_mb' => 1024
    ]
);
echo "✓ Email: {$email->email} (ID: {$email->id})\n\n";

// 3. DATABASE MANAGEMENT (ManagedDatabase - no domain_id!)
echo "3. DATABASE MANAGEMENT\n";
$database = ManagedDatabase::firstOrCreate(
    ['db_name' => 'testdb_' . $user->id],
    [
        'user_id' => $user->id,
        'db_user' => 'testuser',
        'status' => 'active'
    ]
);
echo "✓ Database: {$database->db_name} (ID: {$database->id})\n\n";

// 4. FIREWALL MANAGEMENT
echo "4. FIREWALL MANAGEMENT\n";
$firewall = FirewallRule::firstOrCreate(
    [
        'domain_id' => $domain->id,
        'type' => 'allow',
        'source' => '192.168.1.0/24'
    ],
    [
        'user_id' => $user->id,
        'port' => '80,443',
        'protocol' => 'tcp',
        'is_active' => true
    ]
);
echo "✓ Firewall Rule: {$firewall->type} from {$firewall->source} (ID: {$firewall->id})\n\n";

// 5. BACKUP MANAGEMENT
echo "5. BACKUP MANAGEMENT\n";
$backup = Backup::firstOrCreate(
    [
        'domain_id' => $domain->id,
        'file_path' => '/backups/backup_' . time() . '.tar.gz'
    ],
    [
        'user_id' => $user->id,
        'backup_type' => 'full',
        'file_size' => 1024000,
        'status' => 'completed'
    ]
);
echo "✓ Backup: {$backup->file_path} (ID: {$backup->id})\n\n";

// SUMMARY
echo "=== TEST DATA CREATED SUCCESSFULLY ===\n\n";
echo "User ID: {$user->id}\n";
echo "Domain: {$domain->domain_name} (ID: {$domain->id})\n";
echo "Email: {$email->email} (ID: {$email->id})\n";
echo "Database: {$database->db_name} (ID: {$database->id})\n";
echo "Firewall: {$firewall->type} from {$firewall->source} (ID: {$firewall->id})\n";
echo "Backup: {$backup->file_path} (ID: {$backup->id})\n\n";

// VERIFY COUNTS
echo "=== VERIFYING DATA ===\n";
echo "Domains count: " . Domain::count() . "\n";
echo "EmailAccounts count: " . EmailAccount::count() . "\n";
echo "ManagedDatabases count: " . ManagedDatabase::count() . "\n";
echo "FirewallRules count: " . FirewallRule::count() . "\n";
echo "Backups count: " . Backup::count() . "\n\n";

// CONTROLLER CHECK
echo "=== CHECKING CONTROLLERS ===\n";
$controllers = [
    'DomainController' => 'domains',
    'EmailController' => 'emails',
    'DatabaseManagementController' => 'databases',
    'FirewallController' => 'firewall',
    'BackupController' => 'backups'
];

foreach ($controllers as $ctrl => $route) {
    $path = __DIR__ . "/app/Http/Controllers/{$ctrl}.php";
    $exists = file_exists($path) ? '✓' : '✗';
    echo "{$exists} {$ctrl}\n";
}

echo "\n=== ALL TESTS COMPLETED! ===\n";
echo "Login at: http://127.0.0.1:8000\n";
echo "Email: test@herpanel.dev\n";
echo "Password: password123\n";
