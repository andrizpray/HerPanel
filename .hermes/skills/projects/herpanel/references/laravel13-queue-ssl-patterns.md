# Laravel 13 Queue Job Patterns & SSL Implementation

## Queue Job Trait Import Fix (Critical)

### ❌ WRONG (Will cause Fatal Error)
```php
use Illuminate\Foundation\Queue\Dispatchable;
use Illuminate\Foundation\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class IssueSslCertificate implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;
    // Fatal Error: Trait "Illuminate\Foundation\Queue\Dispatchable" not found
}
```

### ✅ CORRECT (Laravel 13)
```php
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;

class IssueSslCertificate implements ShouldQueue
{
    use Queueable, SerializesModels;
    // Works correctly
}
```

### Reference Job: IssueSslCertificate
Location: `app/Jobs/IssueSslCertificate.php`

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\Domain;

class IssueSslCertificate implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes

    protected $domainId;

    public function __construct($domainId)
    {
        $this->domainId = $domainId;
    }

    public function handle(): void
    {
        $domain = Domain::find($this->domainId);
        if (!$domain) {
            Log::error('SSL Job: Domain not found', ['domain_id' => $this->domainId]);
            return;
        }

        $domain->update(['ssl_status' => 'pending']);
        $domainName = $domain->domain_name;
        $webroot = "/var/www/herpanel/domains/{$domainName}";

        if (!is_dir($webroot)) {
            mkdir($webroot, 0755, true);
        }

        // Certbot webroot plugin
        $cmd = "sudo /usr/bin/certbot certonly --webroot -w {$webroot} -d {$domainName} --non-interactive --agree-tos --email herpanel.dev@gmail.com --keep-until-expiring 2>&1";
        
        Log::info('SSL Job: Running Certbot', ['command' => $cmd]);
        exec($cmd, $output, $returnCode);

        if ($returnCode === 0) {
            $certPath = "/etc/letsencrypt/live/{$domainName}/fullchain.pem";
            $keyPath = "/etc/letsencrypt/live/{$domainName}/privkey.pem";
            
            // Get expiry from certificate
            $expiryCmd = "sudo /usr/bin/openssl x509 -enddate -noout -in {$certPath} | sed 's/notAfter=//'";
            exec($expiryCmd, $expiryOutput, $expiryCode);
            
            $expiryDate = null;
            if ($expiryCode === 0 && !empty($expiryOutput)) {
                $expiryDate = date('Y-m-d H:i:s', strtotime(trim($expiryOutput[0])));
            }

            $domain->update([
                'ssl_enabled' => true,
                'ssl_status' => 'active',
                'ssl_issuer' => 'Let\'s Encrypt',
                'ssl_valid_from' => now(),
                'ssl_valid_to' => $expiryDate,
                'ssl_cert_path' => $certPath,
                'ssl_key_path' => $keyPath,
            ]);
        } else {
            $domain->update(['ssl_status' => 'error']);
        }
    }
}
```

## Nginx ACME Challenge Configuration

### Required for Certbot Webroot Validation
```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    
    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge {
        root /var/www/herpanel/domains/example.com;
        try_files $uri =404;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

## Sudoers Configuration for Queue Worker

### Allow www-data/ubuntu to run Certbot without password
```bash
echo "ubuntu ALL=(root) NOPASSWD: /usr/bin/certbot, /usr/bin/openssl" | sudo tee /etc/sudoers.d/herpanel-ssl
sudo chmod 440 /etc/sudoers.d/herpanel-ssl
```

## Queue Worker Setup (PM2)

### Start queue worker for SSL jobs
```bash
cd /var/www/herpanel
pm2 start "php artisan queue:work --tries=3 --timeout=300" --name "herpanel-queue"
pm2 save
```

## Phase 24: Email Management (Started 2026-05-06)

### EmailAccount Model Pattern
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class EmailAccount extends Model
{
    protected $fillable = [
        'user_id', 'domain_id', 'email', 'password', 'quota', 'status', 'maildir_path'
    ];

    public function setPasswordAttribute($value): void
    {
        $this->attributes['password'] = Crypt::encryptString($value);
    }

    public function getDecryptedPasswordAttribute(): string
    {
        return Crypt::decryptString($this->attributes['password']);
    }
}
```

### Email Creation Flow
1. User selects domain (must have SSL active)
2. User enters email prefix (e.g., "info", "support")
3. Controller concatenates: `$prefix . '@' . $domain->domain_name`
4. Password encrypted via mutator
5. Maildir path: `/var/vmail/{domain_name}/{prefix}`

### Route Pattern
```php
Route::get('/email-accounts', [EmailAccountController::class, 'index'])->name('email-accounts.index');
Route::get('/email-accounts/create', [EmailAccountController::class, 'create'])->name('email-accounts.create');
Route::post('/email-accounts', [EmailAccountController::class, 'store'])->name('email-accounts.store');
Route::delete('/email-accounts/{id}', [EmailAccountController::class, 'destroy'])->name('email-accounts.destroy');
Route::post('/email-accounts/{id}/reset-password', [EmailAccountController::class, 'resetPassword'])->name('email-accounts.reset-password');
```
