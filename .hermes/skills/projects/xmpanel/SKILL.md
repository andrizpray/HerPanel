---
name: xmpanel
description: Work with XMpanel (container-based hosting panel) — SSH access, API keys, deployment, and troubleshooting for XMpanel-hosted servers.
trigger:
  - user mentions XMpanel, xmpanels.de
  - task involves managing server hosted on XMpanel
  - need to SSH or deploy to XMpanel container
---

# XMpanel — Container Hosting Panel

XMpanel (xmpanels.de) is a container-based hosting platform. Users get a **container** (not bare metal), with a web-based terminal. Direct SSH to container is usually not available (no sshd installed).

## Architecture
- **Container**: User terminal (`XMPanels@users:~$`) — isolated environment, no SSH daemon
- **Host/Node**: Runs on port 7000 (or other) — forwards to container internal port
- **Web Terminal**: Primary access method (browser-based)
- **API**: Available for programmatic access (check dashboard for API keys)

## SSH Access (If Available)
XMpanel *may* provide SSH access via host port forwarding (e.g., port 7000).

### Generate SSH Key (Hermes Side)
```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_hermes -N "" -C "hermes-agent@xmpanel"
cat ~/.ssh/id_ed25519_hermes.pub
```

### Install Public Key in Container
In XMpanel web terminal:
```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
printf "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC5DTA+5zJrzCqOxTxew5PznzRpY7v47mCql/CPeUaE2 hermes-agent@xmpanel\n" > ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Pitfall**: `authorized_keys` must contain **only the key**, one line. Extra commands/text appended to the line will break SSH. Always use `printf` or careful `echo` with proper newline.

### Test Connection
```bash
ssh -i ~/.ssh/id_ed25519_hermes -p 7000 -o StrictHostKeyChecking=no root@45.251.7.63
```

**If timeout**: Check firewall — whitelist IP `43.134.37.14` for port 7000 (TCP) in XMpanel dashboard.

## API Access (Alternative to SSH)
If SSH unavailable, use XMpanel API:

1. Go to dashboard → API Keys
2. Generate key with **full access**
3. **Allowed ISP field**: Leave empty (allows all ISPs) or fill `*` if required
4. Store key securely; revoke after use

## Cloudflare Restrictions
All xmpanels.de domains (www, client) are protected by Cloudflare. Hermes Agent IP `43.134.37.14` is blocked, resulting in HTTP 403 for any browser/curl requests. This affects:
- Dashboard login (https://client.xmpanels.de)
- API endpoints (any path under xmpanels.de)
- SSH/API access even if firewall whitelists IP

**Never spend time trying to access XMpanel via browser/curl from Hermes.**

## Common Issues
- **"ssh: connect to host ... port ...: Connection timed out"**: Firewall blocking OR Cloudflare block. Whitelisting Hermes IP `43.134.37.14` rarely helps due to edge blocking.
- **"ssh: unrecognized service"** in container: Normal — no SSH daemon in container. Use web terminal or API.
- **Port 7000 not listening in container**: Normal — port is on host, forwarded to container.
- **Dirty authorized_keys**: Always verify with `cat ~/.ssh/authorized_keys` — must be exactly one key line.
- **HTTP 403 from xmpanels.de**: Cloudflare block. Abandon browser/curl methods immediately.

## Workflow Note
If SSH/API attempts fail (timeout, Cloudflare 403), immediately default to using the XMpanel web terminal provided to the user. Do not keep trying blocked methods.

## Credential Security
If user shares XMpanel credentials (email/password), remind them to rotate password immediately after the session.

## Deployment via Web Terminal
If no SSH/API, manage container directly via web terminal. Send commands to user, they paste into XMpanel terminal.

## Server Info (Example)
```
IP: 45.251.7.63
Port: 7000
User: root (or container-specific)
Container: XMPanels@users
```
