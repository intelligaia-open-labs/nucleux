# nucleux-mcp (hosted)

Serves the published `@nucleux/mcp` npm package, which speaks **stdio only**, at a
URL. Clients that can only take a URL (claude.ai, Claude Desktop custom connectors,
Cursor, Windsurf) can then use it. It also adds accounts: sign-in with Google, GitHub or an emailed one-time code,
per-user tokens for coding agents, OAuth 2.1 for claude.ai, and per-user usage tracking.

**Endpoint:** `https://nucleux.in/mcp` (Streamable HTTP, `Authorization: Bearer …`)
**Connect page:** `https://nucleux.in/mcp/connect`
**Health:** `https://nucleux.in/mcp/health` (public)

The open package keeps working without an account: `npx -y @nucleux/mcp` runs the
catalog locally over stdio.

**Signed-in users also get Nucleux Mobile** (SwiftUI, Jetpack Compose, Flutter, React
Native), served from the private kit's MCP bundle when it is present in `vendor/`.
Anonymous callers (`NUCLEUX_AUTH=optional|off`) and the public npm package stay web-only.

## How it works

`src/upstream.js` runs the published package as one long-lived child process and
proxies `tools/list` / `tools/call` to it, with its `instructions` forwarded verbatim.
The catalog is not re-implemented, so upgrading is just bumping the `@nucleux/mcp`
dependency. Each POST gets its own proxy `Server` + `StreamableHTTPServerTransport`
(stateless) sharing that single child, and the tool list is cached per version.

### Nucleux Mobile (signed-in only)

`createMobileUpstream` (`src/upstream.js`) runs a second child the same way: the private
mobile bundle at `NUCLEUX_MOBILE_MCP` (default `vendor/nucleux-mobile-mcp.cjs`). If the
file is missing, the server runs web-only and `/health` reports `"mobile": "unavailable"`;
a mobile child that dies or fails is respawned on the next request and, meanwhile, signed-in
users get the web surface.

`src/surface.js` merges the two for requests with a valid token:

- **Shared names** (`list_components`, `get_component`, `search_components`, `get_setup`,
  `list_examples`, `get_example`): one tool each. Its `framework` takes the web values
  (`react`/`html`, or `react` where the web tool has none) plus `swiftui | compose | flutter |
  react-native`. A mobile value goes to the mobile child, anything else to web (arguments a
  side does not declare are dropped). Without `framework`: `list_components` returns the web
  list followed by a short "Mobile … pass framework" section; `search_components` searches
  both, labelled by platform; `get_component` answers from web and notes a mobile namesake,
  or, for a mobile-only name, answers from mobile.
- **Mobile-only** (`get_mobile_spec`, `get_mobile_words`, `validate_mobile_usage`) and
  **web-only** tools (`search_patterns`, `get_pattern`, `validate_design`…) pass through.
- **Instructions:** a short platform preamble (detect web vs mobile and the framework from
  the project, ask only when unclear, record it in AGENTS.md/CLAUDE.md), then the web
  instructions and the mobile instructions verbatim, each under a heading.
- **Anonymous requests:** the web tools and instructions exactly as the package serves them.

Usage rows record which side answered (`usage.upstream`: `web`, `mobile` or `web+mobile`).

In front of that (`src/app.js`):

| Route (public path under `/mcp`) | What |
|---|---|
| `POST /` | MCP endpoint. Bearer gate per `NUCLEUX_AUTH`; every `tools/call` is logged (user, tool, ms, ok — never arguments). `GET`/`DELETE` → 405. |
| `GET /health` | Public health check: web upstream and tools, and `mobile: { version, components }` or `"unavailable"`. |
| `GET /connect` | Sign in; generate the one-line connect command; claude.ai instructions; your tokens and connected apps (revoke); your usage. |
| `GET /admin` | Admins only: users, last seen, calls 7/30 days, revoke all, disable/enable. |
| `GET /auth/login?provider=google\|github&next=…`, `GET /auth/callback/:provider`, `POST /auth/logout` | Sign-in. |
| `POST /auth/email/start` | Email sign-in (only when SMTP is configured): `email`, `next`, `_csrf` → emails a 6-digit code + a one-time link → 303 to the check page. Rate-limited per IP and per address. |
| `GET/POST /auth/email/verify` | "Check your email" page / submit the code → session → 303 to `next`. 5 wrong codes lock it. |
| `POST /auth/email/resend` | New code to the same address; the previous one stops working. |
| `GET/POST /auth/email/link?t=…` | The emailed link. One click in the browser that asked; elsewhere it asks for a confirming click first. |
| `POST /cli/exchange` | `{ code, label }` → `{ token, email, name }` or `400 { error: "invalid_code" }`. Rate-limited. |
| `GET /cli/whoami` | Bearer → `{ email, name }` or 401. |
| `POST /cli/revoke` | Bearer `nx_…` → revokes that token → `{ revoked: true }`, or 401. |
| `GET /.well-known/oauth-protected-resource[/mcp]` | RFC 9728 metadata. |
| `GET /.well-known/oauth-authorization-server[/mcp]`, `/.well-known/openid-configuration[/mcp]` | RFC 8414 metadata. |
| `POST /oauth/register` | RFC 7591 dynamic client registration. Rate-limited. |
| `GET/POST /oauth/authorize` | Consent page (needs a session, PKCE S256, exact redirect URI). |
| `POST /oauth/token` | `authorization_code` (PKCE, single use, 5 min) and `refresh_token` (rotated; reuse revokes the family). Access 1 h, refresh 60 days. |
| `POST /oauth/revoke` | RFC 7009. |

### Email sign-in

Enabled when `SMTP_USER` and `SMTP_PASS` are set; otherwise the form is not shown and the
routes don't exist. Any address can sign in (subject to `NUCLEUX_ALLOWED_EMAILS` /
`NUCLEUX_ALLOWED_DOMAINS`); the response is the same whether or not it has an account.

1. The signed-out Connect page (and so the OAuth consent sign-in, which redirects there
   with `next`) shows *Email me a code* under the provider buttons.
2. `POST /auth/email/start` normalises the address (trimmed, lower-cased), checks the
   allowlist and limits, stores a code row and emails a 6-digit code (crypto random) plus a
   link with its own one-time token. Both expire in 10 minutes and are single use. Only
   hashes are stored: the code salted with the flow id. The browser gets an `nx_email`
   cookie naming its flow, so a code only works in the browser that asked for it.
3. `POST /auth/email/verify` takes the code (5 attempts, constant-time compare) and creates
   the same session as Google/GitHub, then redirects to the preserved same-origin `next`.
4. The link signs in on GET only when the flow cookie matches (same browser). Otherwise it
   shows "Sign in as …?" and needs a POST. This stops mail scanners that prefetch links from
   using or burning them, and stops a link being used to log someone into another account
   without a click.

Signed-out forms use a double-submit CSRF token: a random `nx_pre` cookie and a hidden field
holding HMAC(`NUCLEUX_SESSION_SECRET`, cookie). They also get the same Origin check as other forms.
Limits: 5 codes per address per hour (in the DB, so they survive restarts), 20 sends per IP per
hour (start and resend), and 50 verify or link requests per IP per 10 minutes. Codes, links
and addresses are never logged; a send failure logs only the SMTP error code.

Email accounts are users with `provider = "email"`, `provider_id` = the address, and
`name` = the part before the `@`. They are separate from Google and GitHub accounts with
the same address, as Google and GitHub accounts already are from each other. Linking them
is possible, since all three verify the address, but it would merge tokens and usage across
sign-in methods, so it isn't done here. `/admin` shows each user's provider.

### Tokens

- **Personal access tokens** (`nx_` + 40 base62): one per `npx -y @nucleux/mcp add --code …`,
  labelled `hostname · date`. The user gets a single-use, 10-minute code
  (`XXXX-XXXX`, from an alphabet without 0/O/1/I/L) on the Connect page. The CLI
  exchanges the code for the token and stores it in `~/.config/nucleux/credentials.json`.
- **OAuth tokens** (`nxa_…` access, `nxr_…` refresh) for claude.ai and other MCP clients.

Only SHA-256 hashes of tokens, codes and session ids are stored. Tokens never appear in logs.

### Storage

SQLite at `NUCLEUX_DB` (WAL, file mode 0600), migrated at boot (`PRAGMA user_version`).
Tables: `users`, `sessions`, `tokens`, `cli_codes`, `oauth_clients`, `oauth_codes`,
`oauth_tokens` and `usage` (migration 2 adds `usage.upstream`).

The driver is `better-sqlite3`, pinned to **10.1.0** because that is the last release
with a prebuilt binary for Node 21 (ABI v120), the box's Node. If the native module
cannot load, the server falls back to the built-in `node:sqlite` (Node ≥ 22.5) and logs
that it has done so. After moving the box to Node 22 or later, bump to `better-sqlite3@^12`.

## Configuration

| Env | Default | |
|---|---|---|
| `NUCLEUX_PUBLIC_URL` | `https://nucleux.in/mcp` | Public base; issuer, resource and every URL handed out derive from it. |
| `NUCLEUX_AUTH` | `optional` | `optional`: anonymous calls are allowed and calls with a token are attributed. `required`: 401 without a token. `off`: no checks. An invalid or revoked token is a 401 in `optional` too. |
| `NUCLEUX_DB` | `./data/nucleux.db` | SQLite file. |
| `NUCLEUX_SESSION_SECRET` | random per boot | HMAC key for sign-in `state`. Set it (`openssl rand -hex 32`). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — | If unset, the Google button is hidden. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | — | If unset, the GitHub button is hidden. |
| `NUCLEUX_ALLOWED_EMAILS` / `NUCLEUX_ALLOWED_DOMAINS` | empty (anyone) | Comma lists. |
| `NUCLEUX_ADMINS` | empty | Comma list of emails that may open `/admin`. |
| `SMTP_USER` / `SMTP_PASS` | — | Sending account and its app password. Both set = email sign-in on. |
| `SMTP_HOST` / `SMTP_PORT` | `smtp.gmail.com` / `465` | 465 is implicit TLS; other ports must offer STARTTLS (required). `SMTP_SECURE=true\|false` overrides. |
| `MAIL_FROM` | `Nucleux <SMTP_USER>` | From header. With Gmail it must be the account or one of its verified "Send mail as" aliases. |
| `NUCLEUX_TRUST_PROXY` | `loopback` | Express `trust proxy` (nginx on the same host). |
| `NUCLEUX_MCP_HOST` / `NUCLEUX_MCP_PORT` | `127.0.0.1` / `8118` | |
| `NUCLEUX_MCP_TIMEOUT_MS` | `30000` | Upstream call timeout. |
| `NUCLEUX_MOBILE_MCP` | `vendor/nucleux-mobile-mcp.cjs` | The private Nucleux Mobile MCP bundle (relative to this folder, or absolute). Missing = web only. Shown to signed-in users only. |

Deployment, OAuth app registration, nginx and rollout: see [DEPLOY.md](DEPLOY.md).

## Development

```bash
cd vendor && npm pack @nucleux/mcp@0.10.0 && cd ..   # the dependency is a vendored tarball
# optional, private (needs read access to intelligaia/nucleux-mobile-mcp): Nucleux Mobile
gh api repos/intelligaia/nucleux-mobile-mcp/contents/nucleux-mobile-mcp.cjs \
  -H "Accept: application/vnd.github.raw" > vendor/nucleux-mobile-mcp.cjs
npm install
npm test                                              # node --test, no network
NUCLEUX_PUBLIC_URL=http://localhost:8118 NUCLEUX_MCP_HOST=127.0.0.1 npm start
```

The tests run the real app on an ephemeral port with an in-memory database, fake
upstreams (web and mobile) and a fake sign-in provider. They cover code exchange, the bearer
gate in each `NUCLEUX_AUTH` mode, the full OAuth flow (DCR → authorize → PKCE token → MCP
call → refresh → revoke), metadata documents, CSRF, usage logging, and the web + mobile
merge (`test/mobile.test.js`: routing by `framework`, merged list/search/get, schema enum,
instruction order, anonymous = web only, no bundle or a broken child = web only).
The mobile bundle is never needed for `npm test`.

## Client setup

- **Coding agents:** sign in at `/connect`, click **Generate connect line**, and paste the line
  into the agent: ``Connect Nucleux to my coding agents: run `npx -y @nucleux/mcp add --code XXXX-XXXX` ``.
- **claude.ai / Claude Desktop:** Settings → Connectors → Add custom connector →
  `https://nucleux.in/mcp`, then sign in.
