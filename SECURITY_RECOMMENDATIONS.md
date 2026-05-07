# Security Recommendations for HerPanel

## Date: May 8, 2026

This document provides actionable security recommendations for the HerPanel development team.

---

## Immediate Actions Required (Week 1)

### 1. Implement Laravel Policies

**Why:** Centralize authorization logic and make it reusable across controllers.

**How:**
```bash
php artisan make:policy DomainPolicy --model=Domain
php artisan make:policy DatabasePolicy --model=Database
php artisan make:policy EmailAccountPolicy --model=EmailAccount
```

**Example Policy:**
```php
<?php

namespace App\Policies;

use App\Models\Domain;
use App\Models\User;

class DomainPolicy
{
    public function view(User $user, Domain $domain): bool
    {
        return $user->id === $domain->user_id;
    }

    public function update(User $user, Domain $domain): bool
    {
        return $user->id === $domain->user_id;
    }

    public function delete(User $user, Domain $domain): bool
    {
        return $user->id === $domain->user_id;
    }
}
```

**Usage in Controllers:**
```php
// Instead of:
$domain = Domain::where('user_id', auth()->id())->findOrFail($id);

// Use:
$domain = Domain::findOrFail($id);
$this->authorize('view', $domain);
```

---

### 2. Add Rate Limiting

**Why:** Prevent abuse of sensitive operations and DoS attacks.

**How:**

**In `app/Http/Kernel.php`:**
```php
protected $middlewareGroups = [
    'web' => [
        // ... existing middleware
        \Illuminate\Routing\Middleware\ThrottleRequests::class.':web',
    ],
];

protected $middlewareAliases = [
    // ... existing aliases
    'throttle.sensitive' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':5,1', // 5 requests per minute
];
```

**In routes:**
```php
Route::middleware(['auth', 'throttle.sensitive'])->group(function () {
    Route::post('/domains/{domain}/ssl/check', [DomainController::class, 'checkSsl']);
    Route::post('/cron-jobs/{id}/run', [CronJobController::class, 'runNow']);
    Route::post('/backups', [BackupController::class, 'store']);
});
```

---

### 3. Implement Audit Logging

**Why:** Track security-sensitive operations for compliance and incident response.

**How:**

**Create Migration:**
```bash
php artisan make:migration create_audit_logs_table
```

**Migration:**
```php
Schema::create('audit_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
    $table->string('action'); // e.g., 'database.created', 'domain.deleted'
    $table->string('model_type')->nullable();
    $table->unsignedBigInteger('model_id')->nullable();
    $table->json('old_values')->nullable();
    $table->json('new_values')->nullable();
    $table->string('ip_address', 45);
    $table->text('user_agent')->nullable();
    $table->timestamps();
    
    $table->index(['user_id', 'created_at']);
    $table->index(['model_type', 'model_id']);
});
```

**Create Trait:**
```php
<?php

namespace App\Traits;

use App\Models\AuditLog;

trait Auditable
{
    public static function bootAuditable()
    {
        static::created(function ($model) {
            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => class_basename($model) . '.created',
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'new_values' => $model->toArray(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });

        static::updated(function ($model) {
            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => class_basename($model) . '.updated',
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'old_values' => $model->getOriginal(),
                'new_values' => $model->getChanges(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });

        static::deleted(function ($model) {
            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => class_basename($model) . '.deleted',
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'old_values' => $model->toArray(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });
    }
}
```

**Use in Models:**
```php
class Domain extends Model
{
    use Auditable;
    // ...
}
```

---

### 4. Add Database Transactions

**Why:** Ensure atomicity of multi-step operations.

**Example in DatabaseController:**
```php
public function store(Request $request)
{
    // ... validation ...

    try {
        DB::beginTransaction();
        
        // Create database
        DB::statement("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET ? COLLATE ?", [$charSet, $collation]);
        
        // Create user and grant privileges
        DB::statement("CREATE USER IF NOT EXISTS ?@'localhost' IDENTIFIED BY ?", [$dbUser, $dbPassword]);
        DB::statement("GRANT ALL PRIVILEGES ON `{$dbName}`.* TO ?@'localhost'", [$dbUser]);
        DB::statement("FLUSH PRIVILEGES");

        // Save to HerPanel database
        Database::create([
            'user_id' => Auth::id(),
            'db_name' => $dbName,
            'db_user' => $dbUser,
            'db_password' => encrypt($dbPassword),
            'character_set' => $charSet,
            'collation' => $collation,
        ]);

        DB::commit();
        
        return redirect()->route('databases.index')->with('success', 'Database created successfully.');
    } catch (\Exception $e) {
        DB::rollBack();
        return back()->withErrors(['error' => 'Failed to create database: ' . $e->getMessage()]);
    }
}
```

---

## Short-Term Actions (Month 1)

### 5. Improve Cron Job Security

**Current Issue:** Command whitelist is still risky.

**Better Solution:** Use Laravel's job queue system.

**Implementation:**

**Create Job:**
```bash
php artisan make:job ExecuteCronJob
```

**Job Class:**
```php
<?php

namespace App\Jobs;

use App\Models\CronJob;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ExecuteCronJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $cronJobId;

    public function __construct($cronJobId)
    {
        $this->cronJobId = $cronJobId;
    }

    public function handle()
    {
        $cronJob = CronJob::find($this->cronJobId);
        
        if (!$cronJob) {
            return;
        }

        // Execute in isolated environment
        $output = [];
        $returnVar = 0;
        
        // Use proc_open for better control
        $descriptorspec = [
            0 => ["pipe", "r"],
            1 => ["pipe", "w"],
            2 => ["pipe", "w"]
        ];
        
        $process = proc_open(
            $cronJob->command,
            $descriptorspec,
            $pipes,
            null,
            ['HOME' => '/tmp', 'USER' => 'www-data']
        );
        
        if (is_resource($process)) {
            fclose($pipes[0]);
            $output = stream_get_contents($pipes[1]);
            fclose($pipes[1]);
            $errors = stream_get_contents($pipes[2]);
            fclose($pipes[2]);
            $returnVar = proc_close($process);
        }

        $cronJob->update([
            'last_run_at' => now(),
            'last_output' => $output,
            'last_status' => $returnVar === 0 ? 'success' : 'failed',
        ]);
    }
}
```

---

### 6. Add Input Validation Service

**Why:** Centralize and standardize input validation.

**Create Service:**
```php
<?php

namespace App\Services;

class ValidationService
{
    /**
     * Validate IP address or CIDR range
     */
    public static function validateIpOrCidr(string $input): bool
    {
        // Check if it's a valid IP
        if (filter_var($input, FILTER_VALIDATE_IP)) {
            return true;
        }
        
        // Check if it's a valid CIDR
        if (preg_match('/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/', $input)) {
            list($ip, $mask) = explode('/', $input);
            if (filter_var($ip, FILTER_VALIDATE_IP) && $mask >= 0 && $mask <= 32) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Validate domain name
     */
    public static function validateDomain(string $domain): bool
    {
        return preg_match('/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i', $domain);
    }

    /**
     * Sanitize file path
     */
    public static function sanitizePath(string $path): string
    {
        $path = str_replace(['../', '..\\', '../', '..'], '', $path);
        $path = trim($path, '/\\');
        $path = str_replace('\\', '/', $path);
        return $path;
    }
}
```

---

### 7. Implement Security Headers Middleware

**Why:** Protect against common web vulnerabilities.

**Create Middleware:**
```bash
php artisan make:middleware SecurityHeaders
```

**Middleware:**
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
        // Content Security Policy
        $response->headers->set('Content-Security-Policy', 
            "default-src 'self'; " .
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " .
            "style-src 'self' 'unsafe-inline'; " .
            "img-src 'self' data: https:; " .
            "font-src 'self' data:; " .
            "connect-src 'self';"
        );

        return $response;
    }
}
```

**Register in `app/Http/Kernel.php`:**
```php
protected $middleware = [
    // ... existing middleware
    \App\Http\Middleware\SecurityHeaders::class,
];
```

---

### 8. Add Soft Deletes

**Why:** Prevent accidental data loss and enable recovery.

**Update Models:**
```php
use Illuminate\Database\Eloquent\SoftDeletes;

class Domain extends Model
{
    use SoftDeletes;
    
    protected $dates = ['deleted_at'];
}
```

**Update Migrations:**
```php
Schema::table('domains', function (Blueprint $table) {
    $table->softDeletes();
});
```

---

## Medium-Term Actions (Months 2-3)

### 9. Implement Comprehensive Testing

**Unit Tests:**
```bash
php artisan make:test DomainControllerTest
php artisan make:test DatabaseControllerTest
```

**Example Test:**
```php
<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Domain;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DomainControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_only_see_own_domains()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        $domain1 = Domain::factory()->create(['user_id' => $user1->id]);
        $domain2 = Domain::factory()->create(['user_id' => $user2->id]);
        
        $response = $this->actingAs($user1)->get('/domains');
        
        $response->assertStatus(200);
        $response->assertSee($domain1->domain_name);
        $response->assertDontSee($domain2->domain_name);
    }

    public function test_user_cannot_delete_other_users_domain()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        $domain = Domain::factory()->create(['user_id' => $user2->id]);
        
        $response = $this->actingAs($user1)->delete("/domains/{$domain->id}");
        
        $response->assertStatus(404);
        $this->assertDatabaseHas('domains', ['id' => $domain->id]);
    }
}
```

---

### 10. Add Security Monitoring

**Install Laravel Telescope:**
```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

**Configure for Production:**
```php
// config/telescope.php
'enabled' => env('TELESCOPE_ENABLED', false),

'middleware' => [
    'web',
    Authorize::class,
],
```

---

### 11. Implement API Documentation

**Install Scribe:**
```bash
composer require --dev knuckleswtf/scribe
php artisan vendor:publish --tag=scribe-config
php artisan scribe:generate
```

**Add Annotations:**
```php
/**
 * Create a new domain
 * 
 * @group Domains
 * @authenticated
 * 
 * @bodyParam domain_name string required The domain name. Example: example.com
 * 
 * @response 201 {
 *   "message": "Domain added successfully."
 * }
 */
public function store(Request $request)
{
    // ...
}
```

---

## Long-Term Actions (Months 4-6)

### 12. Implement Two-Factor Authentication

**Install Laravel Fortify:**
```bash
composer require laravel/fortify
php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
php artisan migrate
```

---

### 13. Add Automated Security Scanning

**GitHub Actions Workflow:**
```yaml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
      
      - name: Install dependencies
        run: composer install
      
      - name: Run security audit
        run: composer audit
      
      - name: Run PHPStan
        run: ./vendor/bin/phpstan analyse
```

---

### 14. Implement Backup Encryption

**Why:** Protect sensitive data in backups.

**Example:**
```php
use Illuminate\Support\Facades\Crypt;

// When creating backup
$encryptedContent = Crypt::encryptString(file_get_contents($backupPath));
file_put_contents($backupPath . '.enc', $encryptedContent);

// When restoring
$decryptedContent = Crypt::decryptString(file_get_contents($backupPath . '.enc'));
```

---

## Configuration Recommendations

### Environment Variables

**Add to `.env.example`:**
```env
# Security
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=strict

# Rate Limiting
THROTTLE_REQUESTS_PER_MINUTE=60
THROTTLE_SENSITIVE_REQUESTS_PER_MINUTE=5

# Audit Logging
AUDIT_LOG_ENABLED=true
AUDIT_LOG_RETENTION_DAYS=90

# Backup
BACKUP_ENCRYPTION_ENABLED=true
BACKUP_RETENTION_DAYS=30

# SSL
SSL_EMAIL=admin@example.com
SSL_AUTO_RENEW=true

# Server
SERVER_IP=0.0.0.0
```

---

## Security Checklist

### Daily
- [ ] Review application logs for errors
- [ ] Monitor failed login attempts
- [ ] Check system resource usage

### Weekly
- [ ] Review audit logs for suspicious activity
- [ ] Check SSL certificate expiration dates
- [ ] Review firewall rules

### Monthly
- [ ] Update dependencies (`composer update`)
- [ ] Run security audit (`composer audit`)
- [ ] Review user access levels
- [ ] Test backup restoration
- [ ] Review and rotate API keys

### Quarterly
- [ ] Conduct security audit
- [ ] Review and update security policies
- [ ] Test disaster recovery procedures
- [ ] Review and update documentation

---

## Incident Response Plan

### If Security Breach Detected:

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve logs and evidence
   - Notify security team

2. **Investigation**
   - Review audit logs
   - Identify scope of breach
   - Determine attack vector

3. **Remediation**
   - Patch vulnerabilities
   - Reset compromised credentials
   - Update security measures

4. **Communication**
   - Notify affected users
   - Document incident
   - Update security procedures

5. **Post-Incident**
   - Conduct post-mortem
   - Implement preventive measures
   - Update incident response plan

---

## Resources

### Security Tools
- **OWASP ZAP:** Web application security scanner
- **Burp Suite:** Security testing toolkit
- **PHPStan:** Static analysis tool
- **Psalm:** Static analysis tool
- **Laravel Telescope:** Debugging assistant

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Laravel Security Best Practices](https://laravel.com/docs/security)
- [PHP Security Guide](https://www.php.net/manual/en/security.php)

### Training
- OWASP Security Training
- Laravel Security Course
- Web Application Security Fundamentals

---

## Conclusion

Security is an ongoing process, not a one-time fix. Regular reviews, updates, and training are essential to maintain a secure application.

**Next Steps:**
1. Review and prioritize recommendations
2. Create implementation timeline
3. Assign responsibilities
4. Schedule regular security reviews

**Questions?** Contact the security team.
