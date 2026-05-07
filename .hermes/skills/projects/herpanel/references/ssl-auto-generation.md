# SSL Auto-Generation (Phase 25)

Implements real Certbot integration for SSL certificates, replacing Phase 23's simulation.

## Components
1. **SslService** (`app/Services/SslService.php`)
   - `generateCertificate()`: Runs Certbot in webroot mode, creates `.well-known/acme-challenge` directory with proper permissions.
   - `checkCertificateStatus()`: Uses `openssl x509` to check cert expiry, returns status (active/expired/pending/none).
   - `renewCertificates()`: Runs `certbot renew --non-interactive` for bulk renewal.
   - `revokeCertificate()`: Revokes cert via `certbot revoke` and deletes cert files.

2. **SslGenerateCommand** (`app/Console/Commands/SslGenerateCommand.php`)
   - `php artisan ssl:generate`: Generates SSL for all active domains with `ssl_status` none/expired/null.
   - `php artisan ssl:generate {domain_id}`: Generates SSL for a specific domain.
   - Updates domain's `ssl_status` and expiry dates after generation.

3. **Sudoers Configuration**
   - File: `/etc/sudoers.d/herpanel-ssl`
   - Content: `www-data ALL=(ALL) NOPASSWD: /usr/bin/certbot, /usr/bin/mkdir, /usr/bin/chown, /usr/bin/openssl, /usr/bin/rm, /usr/bin/systemctl reload nginx`

4. **Controller Update**
   - `DomainController::checkSsl()` now calls `SslService::generateCertificate()` instead of simulating.
   - Returns success/error messages based on Certbot output.

## Workflow
1. Create SslService and SslGenerateCommand.
2. Setup sudoers for www-data.
3. Update DomainController to use real Certbot.
4. Rebuild assets: `npm run build`
5. Commit and push: `git commit -m "Phase 25: SSL Auto-Generation"` then `git push origin master`
