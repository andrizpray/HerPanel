<?php
// Test script for HerPanel features - CORRECTED VERSION

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Domain;
use App\Models\Database as DatabaseModel;
use App\Models\FirewallRule;
use App\Models\Backup;

echo "=== TESTING HERPANEL FEATURES (CORRECTED) ===\n\n";

// Create a user first (required for domains)
echo "0. CREATING USER FIRST\n";
$user = User::firstOrCreate([
    'email' => 'test@example.com'
], [
    'name' => 'Test User',
    'password' => bcrypt('password123'),
    'role' => 'admin'
]);
echo "✓ User: {$user->email} (ID: {$user->id})\n\n";

// 1. DOMAIN
echo "1. DOMAIN MANAGEMENT\n";
$domain = Domain::firstOrCreate([
    'user_id' => $user->id,
    'domain_name' => 'testherpanel.com'
], [
    'status' => 'active'
]);
echo "✓ Domain: {$domain->domain_name} (ID: {$domain->id})\n\n";

// 2. EMAIL ACCOUNTS (virtual_users table)
echo "2. EMAIL MANAGEMENT\n";
$email = \DB::table('virtual_users')->firstOrCreate([
    'domain_id' => $domain->id,
    'email' => 'test@testherpanel.com'
], [
    'password' => sha1('password123'), // Postfix/Dovecot format
    'quota_mb' => 1024,
    'created_at' => now(),
    'updated_at' => now()
]);
echo "✓ Email: {$email->email} (ID: {$email->id})\n\n";

// 3. DATABASE
echo "3. DATABASE MANAGEMENT\n";
$database = DatabaseModel::firstOrCreate([
    'user_id' => $user->id,
    'db_name' => 'testdb'
], [
    'db_user' => 'testuser',
    'db_password' => 'testpass123',
    'character_set' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'created_at' => now(),
    'updated_at' => now()
]);
echo "✓ Database: {$database->db_name} (ID: {$database->id})\n\n";

// 4. FIREWALL RULES
echo "4. FIREWALL MANAGEMENT\n";
$firewall = FirewallRule::firstOrCreate([
    'user_id' => $user->id,
    'domain_id' => $domain->id,
    'type' => 'allow',
    'source' => '192.168.1.0/24'
], [
    'port' => '80,443',
    'protocol' => 'tcp',
    'is_active' => true,
    'created_at' => now(),
    'updated_at' => now()
]);
echo "✓ Firewall Rule: {$firewall->type} from {$firewall->source} (ID: {$firewall->id})\n\n";

// 5. BACKUP
echo "5. BACKUP MANAGEMENT\n";
$backup = Backup::firstOrCreate([
    'user_id' => $user->id,
    'domain_id' => $domain->id,
    'backup_type' => 'full',
    'file_path' => '/backups/backup_' . time() . '.tar.gz'
], [
    'file_size' => 1024000,
    'status' => 'completed',
    'created_at' => now(),
    'updated_at' => now()
]);
echo "✓ Backup: {$backup->file_path} (ID: {$backup->id})\n\n";

echo "=== TEST DATA CREATED SUCCESSFULLY ===\n";
echo "User ID: {$user->id}\n";
echo "Domain ID: {$domain->id}\n";
echo "Email ID: {$email->id}\n";
echo "Database ID: {$database->id}\n";
echo "Firewall ID: {$firewall->id}\n";
echo "Backup ID: {$backup->id}\n";
?>