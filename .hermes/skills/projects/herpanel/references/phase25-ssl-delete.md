# Phase 25: SSL Auto-Generation & Delete Domain — Lessons Learned

## SSL Auto-Generation (Certbot Integration)

### Architecture
- **Service**: `App\Services\SslService` — handle Certbot execution, status check, renewal, revocation
- **Command**: `App\Console\Commands\SslGenerateCommand` — Artisan CLI `ssl:generate {domain_id?}`
- **Controller**: `DomainController::checkSsl()` — trigger generation from UI

### Critical Patterns

#### 1. Permission Handling (VERY IMPORTANT)
Certbot files di `/etc/letsencrypt/` butuh permission biar www-data (PHP/Laravel) bisa baca:
```bash
# Storage permission (buat logging)
sudo chmod -R 777 /var/www/herpanel/storage
sudo chown -R www-data:www-data /var/www/herpanel/storage

# Let's Encrypt permission (buat checkCertificateStatus)
sudo chmod -R 755 /etc/letsencrypt/live/ /etc/letsencrypt/archive/
sudo chown -R root:www-data /etc/letsencrypt/live/ /etc/letsencrypt/archive/
```

#### 2. Avoid `file_exists()` for SSL Certs
**Pitfall**: `file_exists('/etc/letsencrypt/live/domain.com/fullchain.pem')` bakal return `false` karena PHP/www-data gak punya permission baca direktori root.

**Solution**: Pakai `sudo test -f` via exec:
```php
exec("sudo /usr/bin/test -f {$certPath}/fullchain.pem", $output, $returnCode);
if ($returnCode !== 0) {
    // Certificate not found
}
```

#### 3. Certbot Suffix Handling (-0001, -0002, etc.)
**Problem**: Certbot nambahin suffix `-0001`, `-0002` kalau generate SSL untuk domain yang sama berkali-kali.

**Solution**: Cari semua kemungkinan direktori pas revoke/delete:
```php
// Find all certificate variants
exec("sudo /usr/bin/find {$livePath} -maxdepth 1 -type d -name '{$domainName}*' 2>/dev/null", $foundDirs);
foreach ($foundDirs as $dir) {
    // Revoke & delete each
}
```

#### 4. Sudoers Configuration
www-data butuh akses ke:
```
www-data ALL=(ALL) NOPASSWD: /usr/bin/certbot, /usr/bin/mkdir, /usr/bin/chown, /usr/bin/openssl, /usr/bin/rm, /usr/bin/systemctl reload nginx, /usr/bin/test
```

#### 5. Nginx ACME Challenge (Port 80)
Domain baru butuh Nginx config buat tangkep Let's Encrypt challenge:
```nginx
# /etc/nginx/sites-available/acme-challenge
server {
    listen 80;
    server_name _;
    
    location /.well-known/acme-challenge/ {
        root /var/www/herpanel/public;
        try_files $uri =404;
    }
}
sudo ln -sf /etc/nginx/sites-available/acme-challenge /etc/nginx/sites-enabled/
```

### SSL Status Flow
1. User klik **Request SSL** di Domains/Index.jsx
2. `DomainController::checkSsl()` jalan
3. Update status ke `pending`
4. `SslService::generateCertificate()` — jalanin Certbot webroot mode
5. `SslService::checkCertificateStatus()` — cek expiry date
6. Update DB: `ssl_status`, `ssl_valid_from`, `ssl_valid_to`
7. Frontend reload: `window.location.reload()` (biar status fresh)

---

## Delete Domain Best Practices

### 1. Delete Confirmation Modal
**Problem**: User report "Munculnya notif hapus malah hapus domain drizdev.space" — gara-gara gak jelas domain mana yang mau dihapus.

**Solution**: 
- Pas klik Delete, set `domainToDelete` state (bukan langsung delete)
- Tampilin modal konfirmasi dengan **nama domain yang jelas**
- Tombol: "Cancel" + "Yes, Delete"

### 2. SSL Cleanup on Deletion
**Problem**: User tanya "klo domain dihapus SSL juga kehapus untuk domain itu?"

**Solution**: Update `DomainController::destroy()`:
```php
public function destroy($id)
{
    $domain = Domain::where('user_id', auth()->id())->findOrFail($id);
    $domainName = $domain->domain_name;
    
    // Delete SSL certificate if exists (auto-handle -0001, -0002)
    $sslService = new \App\Services\SslService();
    $sslService->revokeCertificate($domain);
    
    $domain->delete();
    
    return redirect()->route('domains.index')->with('success', "Domain '{$domainName}' deleted successfully.");
}
```

### 3. Controller Flash Messages
Update controller biar return **nama domain yang dihapus**:
```php
return redirect()->route('domains.index')->with('success', "Domain '{$domainName}' deleted successfully.");
```

### 4. Permission Cleanup
SslService::revokeCertificate() harus handle:
- Exact match: `/etc/letsencrypt/live/{domain_name}/`
- Suffixed: `/etc/letsencrypt/live/{domain_name}-0001/`, etc.
- Delete dari `live/`, `archive/`, dan `renewal/` directories

---

## User Workflow Preference (Andriz)
- **"Jangan dipaksakan"** → Kerjain pelan-pelan, satu fitur penuh, test dulu, baru lanjut
- **Commit & Push** setiap update/fix batch
- **"Kabarin klo selesai"** → Kasih tahu pas task selesai, jangan nunggu ditanya
- **Bahasa Indonesia** → Komunikasi pake Bahasa Indonesia

---

## Testing Checklist (SSL)
- [ ] DNS domain udah di-point ke IP server (43.134.37.14)
- [ ] `dig domain.com +short` → return IP server
- [ ] Nginx port 80 catch-all udah jalan (ACME challenge)
- [ ] `sudo nginx -t` → syntax ok
- [ ] Storage permission 777 (www-data writable)
- [ ] Let's Encrypt permission 755 (www-data readable)
- [ ] Sudoers configured (www-data can run certbot)
- [ ] Test: `php artisan ssl:generate {domain_id}`
- [ ] Check: `sudo ls -la /etc/letsencrypt/live/{domain}/`
- [ ] Check DB: `php artisan tinker --execute="Domain::find({id})->ssl_status"`
- [ ] UI: Klik "Request SSL" → status berubah ke ACTIVE
