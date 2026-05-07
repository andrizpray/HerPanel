# HerPanel Phase 23: SSL Certificate Management

## Workflow
Implements automatic SSL certificate issuance using Let's Encrypt Certbot via queue-based jobs to avoid blocking user requests.

### Prerequisites
1. Certbot installed: `sudo apt install certbot`
2. Sudoers rule for queue worker user (ubuntu):
   ```bash
   echo "ubuntu ALL=(root) NOPASSWD: /usr/bin/certbot, /usr/bin/openssl" | sudo tee /etc/sudoers.d/herpanel-ssl
   sudo chmod 440 /etc/sudoers.d/herpanel-ssl
   ```
3. Nginx configs must include ACME challenge location for domain verification.

### Step-by-Step Implementation
1. **Database Model**: Update `app/Models/Domain.php`:
   - Add `ssl_enabled` to `$fillable` array
   - Add `ssl_enabled` to `$casts` as boolean: `'ssl_enabled' => 'boolean'`
2. **Queue Job**: Create `app/Jobs/IssueSslCertificate.php`:
   - Use `Illuminate\Foundation\Queue\Queueable` and `Illuminate\Queue\SerializesModels` traits (avoid non-existent `Dispatchable`/`InteractsWithQueue`)
   - Implement `ShouldQueue`, set timeout to 300s
   - Job logic: Run Certbot webroot plugin, parse output, update domain SSL status/expiry/cert paths
3. **Nginx Config**: Add ACME challenge block to all domain server blocks (port 80):
   ```nginx
   location /.well-known/acme-challenge {
       root /var/www/herpanel/domains/{domain_name};
       try_files $uri =404;
   }
   ```
4. **Controller**: Update `DomainController@checkSsl` to dispatch `IssueSslCertificate` job instead of simulating SSL check.
5. **Queue Worker**: Ensure PM2 `herpanel-queue` is running to process jobs.
6. **Verify**: Check domain `ssl_status` in database, confirm certs in `/etc/letsencrypt/live/`.

### Common Pitfalls
- **Trait Fatal Error**: Use `Queueable` trait, not `Dispatchable` or `InteractsWithQueue` (these cause "trait not found" errors in Laravel 13)
- **Cert Path Conflicts**: Certbot may create `{domain}-0001` directory if existing certs are present; update Nginx `ssl_certificate` paths and domain `ssl_cert_path`/`ssl_key_path` accordingly
- **Log Permissions**: Queue worker (ubuntu) needs write access to `storage/logs/laravel.log` – fix with `sudo chown ubuntu:ubuntu storage/logs/laravel.log` or `chmod 666`
- **Nginx Conflicts**: Remove duplicate server blocks for domains to avoid "conflicting server name" warnings
