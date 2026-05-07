# HerPanel SSL, Email, Responsive Design & Git Workflows

## SSL Setup (Phase 7)
- **Domain**: `drizdev.space` (DNS points to 43.134.37.14)
- **Certbot**: `sudo certbot --nginx -d drizdev.space -d www.drizdev.space`
- **Cert path**: `/etc/letsencrypt/live/drizdev.space/` (expires 2026-08-04, auto-renewal enabled)
- **Nginx configs**:
  - `herpanel-ssl` (port 443): Listen HTTPS, SSL certs, root `/var/www/herpanel/public`, reverse proxy Socket.IO
  - `herpanel-ip` (port 8083): Redirect all traffic to `https://drizdev.space$request_uri`
- **Test**: `curl -I https://drizdev.space` (expect 302 to /login), `curl -I http://43.134.37.14:8083` (expect 301 to HTTPS)

## Email System (Postfix + Dovecot)
- **Postfix-MySQL**: Fix `postfix_mysql_virtual_mailboxes.cf` query to return correct Maildir path:
  `SELECT CONCAT(vd.name, "/", vu.email_prefix, "/Maildir/") FROM virtual_users vu JOIN virtual_domains vd ON vu.domain_id = vd.id WHERE vu.email='%s'`
- **Dovecot**: Set `mail_location = maildir:/var/mail/vhosts/%d/%n/Maildir` in `/etc/dovecot/dovecot.conf`
- **Dovecot SQL**: Set `default_pass_scheme = SHA512-CRYPT` in `/etc/dovecot/dovecot-sql.conf.ext`
- **SMTP Relay**: Port 25 blocked by provider, Gmail relay failed (535 Auth failed), skip for now; use SendGrid/Mailgun later
- **Local Email**: Works (Maildir at `/var/mail/vhosts/<domain>/<user>/Maildir/`), test with `doveadm fetch`

## Responsive Design Patterns
- **Mobile table actions**: Use `hidden md:table-cell` to hide desktop action buttons on mobile
- **Table scroll**: Wrap tables in `overflow-x-auto` for horizontal scroll on mobile
- **Layout**: Use `flex-col sm:flex-row` for search + create button groups (stack vertical on mobile, horizontal on desktop)
- **Mobile click actions**: Add state for `isMobile`, click row name to open bottom sheet modal with actions
- **Build**: Always run `npm run build` after React/Inertia changes to compile assets

## Git Workflow
- **Commit immediately**: After every change batch, run `git add .`, `git commit -m "descriptive message"`, `git push origin master`
- **Backup configs**: Save Nginx configs as `nginx-*.backup` in repo root, commit them
- **Credentials**: Never commit `.env` or sensitive files; use `.gitignore`
- **User preference**: Always push to GitHub after every update/fix batch (enforced convention)