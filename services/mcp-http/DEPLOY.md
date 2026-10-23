# Deploying the signed-in hosted MCP

Box: the shared Ubuntu host. The app lives in `~/nucleux-mcp`, runs as pm2 app
`nucleux-mcp` under the `jaswant-singh` daemon, listens on `127.0.0.1:8118`, and sits
behind nginx at `https://nucleux.in/mcp`. The node version there is 21.

## 1. Register the OAuth apps

**Google** (Google Cloud console → APIs & Services → Credentials → Create OAuth client ID → *Web application*):
- Authorized redirect URI: `https://nucleux.in/mcp/auth/callback/google`
- OAuth consent screen scopes: `openid`, `email`, `profile` (all non-sensitive; no verification needed).
- Publish the consent screen (*In production*), or only listed test users can sign in.

**GitHub** (Settings → Developer settings → OAuth Apps → New OAuth App):
- Homepage URL: `https://nucleux.in/mcp/connect`
- Authorization callback URL: `https://nucleux.in/mcp/auth/callback/github`
- Scopes are requested at sign-in: `read:user user:email`. The primary verified email is used.

**Email codes** (Google Workspace SMTP). This is optional; without it, the email form is hidden:
1. Pick the sending account, e.g. a `no-reply@` or `auth@` user in the Workspace. Mail goes
   out as that account, so use one nobody signs in to day to day.
2. On that account, turn on **2-Step Verification** (myaccount.google.com → Security).
   App passwords only exist for accounts with 2SV.
3. myaccount.google.com → Security → **App passwords** (or myaccount.google.com/apppasswords),
   then create one named "Nucleux MCP". Copy the 16 characters without spaces; that is `SMTP_PASS`.
   - If App passwords is missing, a Workspace admin has to allow it: Admin console →
     Security → Authentication → 2-Step Verification → *Allow users to turn on 2-Step
     Verification* (and the account must be enrolled). Some orgs block app passwords
     outright (Advanced Protection, or "less secure apps" policies). In that case use the
     **SMTP relay service** (Admin console → Apps → Google Workspace → Gmail → Routing →
     SMTP relay service: allow the box's IP, require TLS, `SMTP_HOST=smtp-relay.gmail.com`,
     `SMTP_PORT=587`) instead.
   - Changing the account's password revokes its app passwords; create a new one if that happens.
4. **Deliverability.** Codes in spam are the usual failure. Check these:
   - **SPF.** The domain's TXT record includes Google: `v=spf1 include:_spf.google.com ~all`
     (merge with any existing SPF record; only one per domain).
   - **DKIM.** Admin console → Apps → Google Workspace → Gmail → **Authenticate email** →
     generate a key, add the `google._domainkey` TXT record at the DNS host, then click
     *Start authentication*.
   - **DMARC.** At least `_dmarc` TXT `v=DMARC1; p=none; rua=mailto:dmarc@<domain>`, tightened later.
   - `MAIL_FROM` has to use the sending account's address (or a verified alias) on that same
     domain, or Gmail rewrites it and alignment fails.
   - Send yourself a code at a Gmail and an Outlook address. In Gmail, *Show original* should
     say SPF, DKIM and DMARC: PASS.
5. Gmail limits sending to about 2,000 messages a day per Workspace user. Each address can
   receive at most 5 codes an hour, so this is plenty.

## 2. Ship the code

```bash
# on the box
cd ~/nucleux-mcp
ts=$(date +%Y%m%d-%H%M%S)
cp package.json package.json.bak-$ts && cp package-lock.json package-lock.json.bak-$ts && cp -r src src.bak-$ts
# copy services/mcp-http/{src,package.json,package-lock.json,ecosystem.config.cjs,README.md,DEPLOY.md} over
ls vendor/nucleux-mcp-0.10.0.tgz          # already there from the last upgrade
npm ci --omit=dev                          # pulls better-sqlite3 10.1.0's prebuilt linux-x64 binary for Node 21
node -e "new (require('better-sqlite3'))(':memory:'); console.log('sqlite ok')"
mkdir -p data && chmod 700 data
```

### Nucleux Mobile bundle (private)

Signed-in users also get the Nucleux Mobile tools (SwiftUI, Compose, Flutter, React Native)
from the private kit's MCP server, bundled into one file in the private repo
`intelligaia/nucleux-mobile-mcp`. It is never committed here (`vendor/` is gitignored) and
never published to npm. Fetch it on a machine with access and copy it over:

```bash
# laptop (gh signed in with read access to intelligaia/nucleux-mobile-mcp)
gh api repos/intelligaia/nucleux-mobile-mcp/contents/nucleux-mobile-mcp.cjs \
  -H "Accept: application/vnd.github.raw" > nucleux-mobile-mcp.cjs
head -1 nucleux-mobile-mcp.cjs             # #!/usr/bin/env node
scp nucleux-mobile-mcp.cjs <box>:nucleux-mcp/vendor/nucleux-mobile-mcp.cjs
# on the box
chmod 600 ~/nucleux-mcp/vendor/nucleux-mobile-mcp.cjs
```

The path is `NUCLEUX_MOBILE_MCP` (default `vendor/nucleux-mobile-mcp.cjs`, relative to
`~/nucleux-mcp`). It is self-contained (SDK, zod and catalog inside), so it needs no
`npm install`. Without the file the server runs web-only. After `pm2 restart nucleux-mcp`,
check `curl -s http://127.0.0.1:8118/health` shows `"mobile":{"version":…,"components":…}`
rather than `"unavailable"`. Anonymous callers never see the mobile tools, so this only matters
with sign-in. To update after a kit change, fetch the file again and restart.

## 3. The `.env` file

`~/nucleux-mcp/.env`, `chmod 600`. The server reads it at startup (`src/env.js`; values
already in the environment win). Don't rely on `node --env-file` under pm2: pm2 records
`node_args` but did not pass them on the box, which left the secrets unset.

```bash
umask 077
cat > ~/nucleux-mcp/.env <<'EOF'
NUCLEUX_AUTH=optional
NUCLEUX_SESSION_SECRET=<openssl rand -hex 32>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
NUCLEUX_ADMINS=neeraj@intelligaia.com
# Email sign-in (optional; omit SMTP_USER/SMTP_PASS to hide it)
SMTP_USER=no-reply@intelligaia.com
SMTP_PASS=<16-character app password, no spaces>
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=465
# MAIL_FROM=Nucleux <no-reply@intelligaia.com>
# NUCLEUX_ALLOWED_DOMAINS=intelligaia.com     # optional; empty = anyone
EOF
chmod 600 ~/nucleux-mcp/.env
```

Then:

```bash
pm2 delete nucleux-mcp && pm2 start ecosystem.config.cjs && pm2 save   # reloads the config
curl -s http://127.0.0.1:8118/health                  # "auth":"optional"
curl -s https://nucleux.in/mcp/.well-known/oauth-authorization-server | head -c 200
```

The boot log says `email sign-in: SMTP smtp.gmail.com:465 ok`, or that the check failed
with an SMTP code: `EAUTH 535` means a wrong app password or that app passwords aren't allowed.

Open `https://nucleux.in/mcp/connect`, sign in with each method (Google, GitHub, emailed
code), generate a connect line, and run it on a laptop. Then check `/admin`.

## 4. nginx (needs an admin with sudo)

The existing `location = /mcp` and `location /mcp/` blocks strip the prefix and proxy to
`127.0.0.1:8118` with `proxy_buffering off`. Those already cover `/mcp/connect`,
`/mcp/oauth/*`, `/mcp/.well-known/*` and so on. Make sure they also pass the client
address, because the rate limits use it:

```nginx
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host              $host;
```

MCP clients find the authorization server through RFC 8414 and RFC 9728. Those standards put
the metadata at the **root** of the host, with the path appended. For the resource
`https://nucleux.in/mcp` and the issuer `https://nucleux.in/mcp`, a spec-following client
(claude.ai included) asks for:

- `https://nucleux.in/.well-known/oauth-protected-resource/mcp`
- `https://nucleux.in/.well-known/oauth-authorization-server/mcp`
- `https://nucleux.in/.well-known/openid-configuration/mcp` (fallback)

The 401's `WWW-Authenticate: Bearer resource_metadata="https://nucleux.in/mcp/.well-known/oauth-protected-resource"`
covers the first one without nginx changes. The authorization-server lookup still goes to
the root, though. Add these blocks to `/etc/nginx/sites-available/nucleux.in`, in the
`server` block for 443 and **before** `location /`:

```nginx
    # OAuth discovery for the hosted MCP (RFC 8414 / RFC 9728 path-suffixed forms)
    location = /.well-known/oauth-protected-resource/mcp {
        proxy_pass http://127.0.0.1:8118/.well-known/oauth-protected-resource/mcp;
        proxy_set_header Host $host;
    }
    location = /.well-known/oauth-authorization-server/mcp {
        proxy_pass http://127.0.0.1:8118/.well-known/oauth-authorization-server/mcp;
        proxy_set_header Host $host;
    }
    location = /.well-known/openid-configuration/mcp {
        proxy_pass http://127.0.0.1:8118/.well-known/openid-configuration/mcp;
        proxy_set_header Host $host;
    }
    # Some clients ignore the path and ask the host root; nucleux.in has no other OAuth server.
    location = /.well-known/oauth-authorization-server {
        proxy_pass http://127.0.0.1:8118/.well-known/oauth-authorization-server;
        proxy_set_header Host $host;
    }
    location = /.well-known/oauth-protected-resource {
        proxy_pass http://127.0.0.1:8118/.well-known/oauth-protected-resource;
        proxy_set_header Host $host;
    }
```

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -s https://nucleux.in/.well-known/oauth-authorization-server/mcp | head -c 200
```

## 5. Rollout

1. **`NUCLEUX_AUTH=optional`** (the default). Anonymous calls still work, so the existing
   claude.ai connector and URL-configured agents keep running. Signed-in agents
   (`add --code`) are attributed and show up on `/connect` and `/admin`. In this mode
   claude.ai never gets a 401, so it never starts OAuth and its calls stay anonymous.
2. Once the nginx blocks are live, check OAuth from a real client before requiring it.
   On a staging port with `NUCLEUX_AUTH=required`, or with the MCP Inspector against
   `https://nucleux.in/mcp`, make sure discovery, registration, consent and the token all work.
3. **`NUCLEUX_AUTH=required`**: edit `.env`, then `pm2 restart nucleux-mcp`. Existing
   anonymous URL configs get a 401 that points at the metadata. claude.ai then prompts the
   user to connect, and the coding agents need `add --code`.
   Announce it first; the npm package (`npx -y @nucleux/mcp`, local) stays open.

Rollback: set `NUCLEUX_AUTH=off` (or `optional`) and `pm2 restart nucleux-mcp`. To return
to the old code, restore the `*.bak-<ts>` files and `npm ci`. The database is additive
and can stay in place.

## 6. Backups

The database holds accounts and token hashes, but no plaintext tokens. It runs in WAL
mode, so use SQLite's online backup instead of copying the file:

```bash
mkdir -p ~/nucleux-mcp/backups && chmod 700 ~/nucleux-mcp/backups
# crontab -e (jaswant-singh):
17 3 * * * cd ~/nucleux-mcp && node -e "const D=require('better-sqlite3');new D('data/nucleux.db',{readonly:true}).backup('backups/nucleux-'+new Date().toISOString().slice(0,10)+'.db').then(()=>process.exit(0))" && find ~/nucleux-mcp/backups -name 'nucleux-*.db' -mtime +14 -delete
```

To restore: stop the app, copy a backup to `data/nucleux.db` (and delete any
`data/nucleux.db-wal` and `-shm` files), then start the app.

## 7. Operations

- Revoke a user: `/admin` → **Revoke all**, which revokes their tokens and OAuth grants. **Disable**
  also ends their sessions and blocks sign-in.
- Rotating `NUCLEUX_SESSION_SECRET` only breaks sign-ins that are in flight. Sessions are DB rows.
- Logs: `logs/nucleux-mcp.{out,err}.log`. Tokens, codes and tool arguments are never logged.
- When you upgrade `@nucleux/mcp`, the vendored-tarball steps are unchanged: `npm pack` into
  `vendor/`, bump the dependency, `npm install`, then `pm2 restart`.
- When the mobile kit changes, re-fetch `vendor/nucleux-mobile-mcp.cjs` (section 2) and
  `pm2 restart nucleux-mcp`.
- The first boot of this version migrates the database (adds `usage.upstream`); it is
  additive, so rolling back the code leaves a harmless extra column.
