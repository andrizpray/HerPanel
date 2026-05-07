## HerPanel Email Management Setup (Postfix + Dovecot)

### Common Pitfalls
1. **Missing `postfix-mysql` package**: Postfix requires this to read MySQL virtual maps. Install with:
   ```bash
   sudo apt-get install -y postfix-mysql
   sudo systemctl restart postfix
   ```
2. **Incorrect virtual mailbox map query**: `/etc/postfix/postfix_mysql_virtual_mailboxes.cf` must return the full Maildir path:
   ```ini
   user = herpanel_admin
   password = <db_password>
   hosts = 127.0.0.1
   dbname = herpanel_cpanel
   query = SELECT CONCAT(vd.name, "/", SUBSTRING_INDEX(vu.email, "@", 1), "/Maildir/") FROM virtual_users vu JOIN virtual_domains vd ON vu.domain_id = vd.id WHERE vu.email = "%s"
   ```
   Avoid returning static values like `1` which causes delivery to mbox instead of Maildir.
   Verify with: `sudo postmap -q "user@domain.com" mysql:/etc/postfix/postfix_mysql_virtual_mailboxes.cf`
3. **Dovecot password scheme mismatch**: HerPanel uses SHA512-CRYPT for email passwords. Set in `/etc/dovecot/dovecot-sql.conf.ext`:
   ```ini
   default_pass_scheme = SHA512-CRYPT
   password_query = SELECT email as user, password FROM virtual_users WHERE email = "%u"
   ```
4. **Dovecot mail location & user_query**: Ensure in `/etc/dovecot/dovecot-sql.conf.ext`:
   ```ini
   user_query = SELECT "/var/mail/vhosts/%d/%n" as home, "maildir:/var/mail/vhosts/%d/%n/Maildir" as mail, 5000 as uid, 5000 as gid FROM virtual_users WHERE email = "%u"
   ```
   And in `/etc/dovecot/dovecot.conf`:
   ```ini
   mail_location = maildir:/var/mail/vhosts/%d/%n/Maildir
   ```
5. **Outbound port 25 blocked**: Most VPS providers block port 25 for outbound SMTP. Use an SMTP relay (SendGrid, Mailgun, Amazon SES) or alternative ports (587/465) for external email delivery.

### SMTP Relay Setup (Gmail Example)
When port 25 is blocked, configure Postfix to use Gmail SMTP relay:

1. **Install SASL modules**:
   ```bash
   sudo apt-get install -y libsasl2-modules sasl2-bin
   ```

2. **Configure Postfix relayhost** (avoid duplicate entries in main.cf):
   ```bash
   sudo postconf -e "relayhost = [smtp.gmail.com]:587"
   sudo postconf -e "smtp_sasl_auth_enable = yes"
   sudo postconf -e "smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd"
   sudo postconf -e "smtp_sasl_security_options = noanonymous"
   sudo postconf -e "smtp_tls_security_level = encrypt"
   sudo postconf -e "smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt"
   ```

3. **Create SASL password file**:
   ```bash
   sudo bash -c 'echo "[smtp.gmail.com]:587 your_email@gmail.com:app_password" > /etc/postfix/sasl_passwd'
   sudo chmod 600 /etc/postfix/sasl_passwd
   sudo postmap /etc/postfix/sasl_passwd
   sudo chown postfix:postfix /etc/postfix/sasl_passwd*
   ```

4. **Restart and test**:
   ```bash
   sudo systemctl restart postfix
   swaks --to recipient@gmail.com --from your_email@gmail.com --server 127.0.0.1 --port 25
   ```

**Note**: Gmail SMTP relay may require app passwords and can be strict. SendGrid (100 emails/day free) is more reliable.

### Testing Steps
1. **SMTP test**: Use `swaks` to send test emails:
   ```bash
   swaks --to <email> --from <sender> --server 127.0.0.1 --port 25 --body "Test" --header "Subject: Test"
   ```
2. **Check Postfix logs**:
   ```bash
   tail -f /var/log/mail.log
   ```
3. **Dovecot mailbox check**:
   ```bash
   sudo doveadm mailbox status -u <email> all INBOX
   sudo doveadm fetch -u <email> body mailbox INBOX
   ```
4. **Maildir verification**: Emails should land in `/var/mail/vhosts/<domain>/<user>/Maildir/new/`.

### Service Restart
After any config changes to Postfix or Dovecot:
```bash
sudo systemctl restart postfix dovecot
```