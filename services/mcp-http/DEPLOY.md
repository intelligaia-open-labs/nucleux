# Deploying the hosted MCP (token only)

Box: the shared Ubuntu host. The app lives in `~/nucleux-mcp`, runs as pm2 app
`nucleux-mcp` under the `jaswant-singh` daemon, listens on `127.0.0.1:8118`, and sits
behind nginx at `https://nucleux.in/mcp`. The node version there is 21.

There is no sign-in, so there are no OAuth apps or SMTP accounts to register. Tokens come from
the site's MCP page (`https://nucleux.in/mcp`, which calls `POST /mcp/tokens` and
`POST /mcp/tokens/prompt`), from connect codes, or from the OAuth consent page.

## 1. What changes from the sign-in version

- `/mcp/connect` (and everything under it) 301-redirects to `https://nucleux.in/mcp#setup`.
  **The site page must have a `#setup` section** that calls the two token endpoints (see README).
- Google, GitHub and email sign-in are gone. Their env keys (`GOOGLE_*`, `GITHUB_*`, `SMTP_*`,
  `MAIL_FROM`, `NUCLEUX_ADMINS`, `NUCLEUX_ALLOWED_*`) are ignored; delete them from `.env`.
- Existing principals and tokens (Google/GitHub/email) keep working. Nothing is migrated or deleted.
- `/admin` uses HTTP Basic with `NUCLEUX_ADMIN_PASSWORD` instead of an admin email list.
- `NUCLEUX_AUTH` now defaults to `required`.
- nodemailer is no longer a dependency.

## 2. Ship the code

```bash
# on the box
cd ~/nucleux-mcp
ts=$(date +%Y%m%d-%H%M%S)
cp package.json package.json.bak-$ts && cp package-lock.json package-lock.json.bak-$ts && cp -r src src.bak-$ts
# copy services/mcp-http/{src,package.json,package-lock.json,ecosystem.config.cjs,README.md,DEPLOY.md} over
ls vendor/nucleux-mcp-0.12.0.tgz          # already there from the last upgrade
npm ci --omit=dev                          # pulls better-sqlite3 10.1.0's prebuilt linux-x64 binary for Node 21
node -e "new (require('better-sqlite3'))(':memory:'); console.log('sqlite ok')"
mkdir -p data && chmod 700 data
```

### Nucleux Mobile bundle (private)

Any valid token also gets the Nucleux Mobile tools (SwiftUI, Compose, Flutter, React Native)
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
rather than `"unavailable"`. Requests without a token never see the mobile tools. To update after
a kit change, fetch the file again and restart.

## 3. The `.env` file

`~/nucleux-mcp/.env`, `chmod 600`. The server reads it at startup (`src/env.js`; values
already in the environment win). Don't rely on `node --env-file` under pm2: pm2 records
`node_args` but did not pass them on the box, which left the secrets unset.

```bash
umask 077
cat > ~/nucleux-mcp/.env <<'EOF'
NUCLEUX_AUTH=required
NUCLEUX_SESSION_SECRET=<openssl rand -hex 32>
NUCLEUX_ADMIN_PASSWORD=<openssl rand -base64 24>
# NUCLEUX_ISSUE_PER_HOUR=10        # self-serve tokens/prompts per IP per hour (each)
# NUCLEUX_SITE_URL=https://nucleux.in/mcp
EOF
chmod 600 ~/nucleux-mcp/.env
```

Keep the admin password in the team's password manager. `/admin` sends it as HTTP Basic, so
only open it over https.

Then:

```bash
pm2 restart nucleux-mcp && pm2 save
curl -s http://127.0.0.1:8118/health                                   # "auth":"required"
curl -sI https://nucleux.in/mcp/connect | grep -i '^location'          # https://nucleux.in/mcp#setup
curl -s -X POST https://nucleux.in/mcp/tokens -H 'Origin: https://nucleux.in' \
  -H 'content-type: application/json' -d '{}'                         # {"token":"nx_…"}
curl -s -X POST https://nucleux.in/mcp/tokens -H 'Origin: https://evil.example' -d '{}'   # 403 forbidden_origin
curl -s -o /dev/null -w '%{http_code}\n' -u admin:"$NUCLEUX_ADMIN_PASSWORD" https://nucleux.in/mcp/admin   # 200
```

Then, from the site page, get a connect prompt and run it on a laptop. Also add
`https://nucleux.in/mcp` as a custom connector in claude.ai and click **Allow**. Check `/admin`
afterwards: each should show as an anonymous principal.

## 4. nginx (needs an admin with sudo)

The existing `location = /mcp` and `location /mcp/` blocks strip the prefix and proxy to
`127.0.0.1:8118` with `proxy_buffering off`. Those already cover `/mcp/tokens`,
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

1. Ship the site page with its `#setup` section first (it calls `/mcp/tokens` and
   `/mcp/tokens/prompt`, same origin), then deploy this server. Until the server is deployed
   those calls 404; once it is, `/mcp/connect` redirects to the page.
2. `NUCLEUX_AUTH=required`. Agents configured with a token keep working, including tokens
   from the sign-in version. URL-only configs get a 401 that points at the OAuth metadata, so
   OAuth-capable clients show the consent page and the others need a token from the site.
3. OAuth discovery needs the nginx root `/.well-known/…` blocks above. Without them some clients
   can't find the authorization server.

Rollback: restore the `*.bak-<ts>` files, `npm ci`, and restore the old `.env` keys. The
database is unchanged in shape, apart from new `anon` principals, which the old code treats
like any user. The `sessions` and `email_codes` tables were kept for exactly this reason.

## 6. Backups

The database holds principals, token hashes and usage, but no plaintext tokens. It runs in WAL
mode, so use SQLite's online backup instead of copying the file:

```bash
mkdir -p ~/nucleux-mcp/backups && chmod 700 ~/nucleux-mcp/backups
# crontab -e (jaswant-singh):
17 3 * * * cd ~/nucleux-mcp && node -e "const D=require('better-sqlite3');new D('data/nucleux.db',{readonly:true}).backup('backups/nucleux-'+new Date().toISOString().slice(0,10)+'.db').then(()=>process.exit(0))" && find ~/nucleux-mcp/backups -name 'nucleux-*.db' -mtime +14 -delete
```

To restore: stop the app, copy a backup to `data/nucleux.db` (and delete any
`data/nucleux.db-wal` and `-shm` files), then start the app.

## 7. Operations

- Revoke: `/admin` → **Revoke** on a token, or **Revoke all** on a principal (its tokens and
  OAuth grants). **Disable** also blocks the principal's existing and future tokens. A user can
  revoke their own machine's token with `npx -y @nucleux/mcp logout`.
- Anonymous principals that never connected (an unused prompt code, say) are counted on
  `/admin` but not listed.
- Rotating `NUCLEUX_SESSION_SECRET` only invalidates consent and admin forms that are already open.
- Logs: `logs/nucleux-mcp.{out,err}.log`. Tokens, codes and tool arguments are never logged.
- When you upgrade `@nucleux/mcp`, the vendored-tarball steps are unchanged: `npm pack` into
  `vendor/`, bump the dependency, `npm install`, then `pm2 restart`.
- When the mobile kit changes, re-fetch `vendor/nucleux-mobile-mcp.cjs` (section 2) and
  `pm2 restart nucleux-mcp`.
