---
name: domain-dns-setup
title: Domain & DNS Setup (eatrade-journal.site)
description: Domain config, SSL, DNS, and related services for eatrade-journal.site.
---

# Domain & DNS Setup (eatrade-journal.site)

## Domain Info
- **Domain:** eatrade-journal.site
- **Server IP:** 43.134.37.14
- **SSL:** Let's Encrypt, expire Aug 2026, auto-renew enabled
- **Subdomain HerPanel:** panel.eatrade-journal.site

## DNS Configuration
- **Current NS:** Parked on dns-parking.com (pixel/byte.dns-parking.com)
- **Action needed:** User must change to Hostinger NS at registrar
- **Resolution:** Google/Cloudflare DNS resolve correctly to 43.134.37.14
- **Issue:** Some ISPs/local DNS cache may still fail

## Services
- **JTC:** https://eatrade-journal.site
- **Monitor:** https://eatrade-journal.site/monitor
- **HerPanel (future):** https://panel.eatrade-journal.site

## Known Issues
- **EA Logger DNS error:** User's local MT4/MT5 got DNS error
- **Fix:** `ipconfig /flushdns` or switch to 8.8.8.8

## SSL Setup (Let's Encrypt)
Reference: see `laravel-fullstack` skill → `references/laravel-ssl-certbot-nginx.md`
