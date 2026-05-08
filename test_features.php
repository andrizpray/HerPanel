<?php
// Test script for HerPanel features

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Domain;
use App\Models\EmailAccount;
use App\Models\Database as DatabaseModel;
use App\Models\FirewallRule;
use App\Models\Backup;

echo "=== TESTING HERPANEL FEATURES ===\n\n";

// 1. DOMAIN
echo "1. DOMAIN MANAGEMENT\n";
$domain = Domain::firstOrCreate([
    'name' => 'testherpanel.com'
], [
    'status' => 'active'
]);
echo "✓ Domain: {$domain->name} (ID: {$domain->id})\n\n";

// 2. EMAIL ACCOUNTS
echo "2. EMAIL MANAGEMENT\n";
$email = EmailAccount::firstOrCreate([
    'domain_id' => $domain->id,
    'email' => 'test@testherpanel.com'
], [
    'password' => bcrypt('test123'),
    'quota' => 1024,
    'status' => 'active'
]);
echo "✓ Email: {$email->email} (ID: {$email->id})\n\n";

// 3. DATABASE
echo "3. DATABASE MANAGEMENT\n";
$database = DatabaseModel::firstOrCreate([
    'domain_id' => $domain->id,
    'name' => 'testdb'
], [
    'user' => 'testuser',
    'password' => 'testpass123',
    'status' => 'active'
]);
echo "✓ Database: {$database->name} (ID: {$database->id})\n\n";

// 4. FIREWALL RULES
echo "4. FIREWALL MANAGEMENT\n";
$firewall = FirewallRule::firstOrCreate([
    'domain_id' => $domain->id,
    'type' => 'allow',
    'source' => '192.168.1.0/24'
], [
    'port' => '80,443',
    'status' => 'active'
]);
echo "✓ Firewall Rule: {$firewall->type} from {$firewall->source} (ID: {$firewall->id})\n\n";

// 5. BACKUP
echo "5. BACKUP MANAGEMENT\n";
$backup = Backup::firstOrCreate([
    'domain_id' => $domain->id,
    'filename' => 'backup_' . time() . '.tar.gz'
], [
    'size' => 1024000,
    'status' => 'completed'
]);
echo "✓ Backup: {$backup->filename} (ID: {$backup->id})\n\n";

echo "=== TEST DATA CREATED SUCCESSFULLY ===\n";
echo "Domain ID: {$domain->id}\n";
echo "Email ID: {$email->id}\n";
echo "Database ID: {$database->id}\n";
echo "Firewall ID: {$firewall->id}\n";
echo "Backup ID: {$backup->id}\n";
