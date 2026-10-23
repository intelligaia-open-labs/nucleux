# nucleux-mcp (hosted)

Serves the published `@nucleux/mcp` npm package, which speaks **stdio only**, at a
URL. Clients that can only take a URL (claude.ai, Claude Desktop custom connectors,
Cursor, Windsurf) can then use it. Access is **token only**: there are no accounts and no
sign-in. A token comes from the site's MCP page (self-serve), from a one-time connect code,
or from an OAuth consent screen. Usage is tracked per token.

**Endpoint:** `https://nucleux.in/mcp` (Streamable HTTP, `Authorization: Bearer …`)
**Get a token:** `https://nucleux.in/mcp` (the old `/mcp/connect` redirects there)
**Health:** `https://nucleux.in/mcp/health` (public)

The open package keeps working without a token: `npx -y @nucleux/mcp` runs the
catalog locally over stdio.

**Any valid token also gets Nucleux Mobile** (SwiftUI, Jetpack Compose, Flutter, React
Native), served from the private kit's MCP bundle when it is present in `vendor/`.
Requests without a token (only possible with `NUCLEUX_AUTH=optional|off`) and the public
npm package stay web-only.

## How it works

`src/upstream.js` runs the published package as one long-lived child process and
proxies `tools/list` / `tools/call` to it, with its `instructions` forwarded verbatim.
The catalog is not re-implemented, so upgrading is just bumping the `@nucleux/mcp`
dependency. Each POST gets its own proxy `Server` + `StreamableHTTPServerTransport`
(stateless) sharing that single child, and the tool list is cached per version.

### Nucleux Mobile (with a token)

`createMobileUpstream` (`src/upstream.js`) runs a second child the same way: the private
mobile bundle at `NUCLEUX_MOBILE_MCP` (default `vendor/nucleux-mobile-mcp.cjs`). If the
file is missing, the server runs web-only and `/health` reports `"mobile": "unavailable"`;
a mobile child that dies or fails is respawned on the next request and, meanwhile, token
holders get the web surface.

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
- **Requests without a token:** the web tools and instructions exactly as the package serves them.

Usage rows record which side answered (`usage.upstream`: `web`, `mobile` or `web+mobile`).

In front of that (`src/app.js`):

| Route (public path under `/mcp`) | What |
|---|---|
| `POST /` | MCP endpoint. Bearer gate per `NUCLEUX_AUTH` (default `required`); every `tools/call` is logged (principal, tool, ms, ok — never arguments). `GET`/`DELETE` → 405. |
| `GET /health` | Public health check: web upstream and tools, and `mobile: { version, components }` or `"unavailable"`. |
| `POST /tokens/prompt` | Site page only. → `{ code, expires, prompt }`: a one-time connect code and the prompt to paste into a coding agent. |
| `POST /tokens` | Site page only. → `{ token }`: a bearer token to paste into an agent's config. Shown once. |
| `POST /cli/exchange` | `{ code, label }` → `{ token, email, name }` or `400 { error: "invalid_code" }`. Rate-limited. |
| `GET /cli/whoami` | Bearer → `{ email, name }` (`""` / `"anonymous"` for new principals) or 401. |
| `POST /cli/revoke` | Bearer `nx_…` → revokes that token → `{ revoked: true }`, or 401. |
| `GET /.well-known/oauth-protected-resource[/mcp]` | RFC 9728 metadata. |
| `GET /.well-known/oauth-authorization-server[/mcp]`, `/.well-known/openid-configuration[/mcp]` | RFC 8414 metadata. |
| `POST /oauth/register` | RFC 7591 dynamic client registration. Rate-limited. |
| `GET/POST /oauth/authorize` | Consent page, no login: "Allow <client> to use Nucleux?" (PKCE S256, exact redirect URI, `resource` must be the base). Allow creates an anonymous principal for the grant. |
| `POST /oauth/token` | `authorization_code` (PKCE, single use, 5 min) and `refresh_token` (rotated; reuse revokes the family). Access 1 h, refresh 60 days. |
| `POST /oauth/revoke` | RFC 7009. |
| `GET /admin` | HTTP Basic (`NUCLEUX_ADMIN_PASSWORD`, any user name; 404 if unset): principals with provider, last used, calls 7/30 days, tokens/apps; active tokens. |
| `POST /admin/tokens/:id/revoke`, `POST /admin/users/:id/{revoke,disable,enable}` | Admin actions (Basic auth + CSRF). |
| `GET /connect`, `/connect/*`, `/login` | 301 → `https://nucleux.in/mcp#setup`. |

### Self-serve issuance (the site's MCP page)

`nucleux.in/mcp` has the same origin as the API, so it calls these with `fetch` and no CORS:

```js
// A connect prompt for coding agents (the code works once, for 10 minutes)
const r = await fetch("/mcp/tokens/prompt", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
// 200 { "code": "ABCD-2345", "expires": "2026-10-23T12:10:00.000Z", "prompt": "Connect the coding agents on this machine…" }

// A raw bearer token (for agents configured by hand with Authorization: Bearer …)
const t = await fetch("/mcp/tokens", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
// 200 { "token": "nx_…" }
```

The request body is ignored, and responses are `Cache-Control: no-store`. Errors:
- `403 { "error": "forbidden_origin" }` when `Origin` isn't exactly the public origin
  (`https://nucleux.in`). Browsers always send it on POST and pages can't forge it, so other sites
  can't mint tokens through a visitor's browser.
- `429 { "error": "rate_limited" }` with `Retry-After` when an IP goes over `NUCLEUX_ISSUE_PER_HOUR`
  (default 10, counted separately per endpoint).

Each call creates a new anonymous principal (`users.provider = "anon"`, `name = "anonymous"`):
- `/tokens` gives it a token labelled `web · <date>`.
- `/tokens/prompt` gives it a code; `/cli/exchange` turns the code into a token labelled with the machine's hostname, as before.

Nothing secret is logged.

```bash
curl -s -X POST https://nucleux.in/mcp/tokens -H 'Origin: https://nucleux.in' -H 'content-type: application/json' -d '{}'
curl -s https://nucleux.in/mcp/ -H "Authorization: Bearer nx_…" -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### OAuth without login

claude.ai, Claude Desktop, Claude Code, Cursor, VS Code, Codex and Windsurf can all add
`https://nucleux.in/mcp` as a remote server. Each one discovers the authorization server
from the 401, registers itself (DCR), and opens `/oauth/authorize`. That page asks
"Allow <client> to use Nucleux?". The form is protected by a double-submit CSRF token
(a random `nx_pre` cookie plus a hidden HMAC of it keyed with `NUCLEUX_SESSION_SECRET`) and an
Origin check. **Allow** creates one anonymous principal for the grant and continues with the
usual PKCE code → token → refresh flow. **Deny** returns `access_denied`.

### Tokens

- **Personal access tokens** (`nx_` + 40 base62): from `POST /tokens`, or from a connect code
  (`XXXX-XXXX`, from an alphabet without 0/O/1/I/L; single use, 10 minutes) exchanged by
  `npx -y @nucleux/mcp add --code …`, which stores the token in
  `~/.config/nucleux/credentials.json`.
- **OAuth tokens** (`nxa_…` access, `nxr_…` refresh) for MCP clients.
- Principals and tokens from the earlier sign-in versions (providers `google`, `github`,
  `email`) keep working unchanged.

Only SHA-256 hashes of tokens and codes are stored. Tokens never appear in logs.
Revoke a token with `npx -y @nucleux/mcp logout` (its own token) or from `/admin`.

### Storage

SQLite at `NUCLEUX_DB` (WAL, file mode 0600), migrated at boot (`PRAGMA user_version`).
Tables: `users` (principals), `tokens`, `cli_codes`, `oauth_clients`, `oauth_codes`,
`oauth_tokens` and `usage` (migration 2 adds `usage.upstream`). `sessions` and `email_codes`
are left over from the sign-in versions and are no longer used. They stay so that a rollback
to those versions still works.

The driver is `better-sqlite3`, pinned to **10.1.0** because that is the last release
with a prebuilt binary for Node 21 (ABI v120), the box's Node. If the native module
cannot load, the server falls back to the built-in `node:sqlite` (Node ≥ 22.5) and logs
that it has done so. After moving the box to Node 22 or later, bump to `better-sqlite3@^12`.

## Configuration

| Env | Default | |
|---|---|---|
| `NUCLEUX_PUBLIC_URL` | `https://nucleux.in/mcp` | Public base; issuer, resource and every URL handed out derive from it. |
| `NUCLEUX_AUTH` | `required` | `required`: 401 without a valid token. `optional`: calls without a token are allowed (web only) and calls with one are attributed. `off`: no checks. An invalid or revoked token is a 401 in `optional` too. |
| `NUCLEUX_DB` | `./data/nucleux.db` | SQLite file. |
| `NUCLEUX_SESSION_SECRET` | random per boot | HMAC key for the CSRF tokens on the consent and admin forms. Set it (`openssl rand -hex 32`). |
| `NUCLEUX_ADMIN_PASSWORD` | unset | HTTP Basic password for `/admin` (any user name). Unset = `/admin` is 404. |
| `NUCLEUX_ISSUE_PER_HOUR` | `10` | Per-IP limit for `POST /tokens` and for `POST /tokens/prompt` (each). |
| `NUCLEUX_SITE_URL` | `<origin>/mcp` | The site's MCP page: `/connect` redirects there (`#setup`), and prompts and errors link to it. |
| `YANTRA_API_URL` | — | Yantra chat endpoint for the Playground planner (`POST /mcp/playground`), e.g. `https://yantra-be.intelligaia.com/v1/chat`. Unset = 503, and the Playground uses its built-in matching. |
| `YANTRA_API_KEY` | — | Yantra key (sent as `Authorization: Bearer …`). Server-side only. |
| `YANTRA_MODEL` | `deepseek-v4-flash:cloud` | Model id from Yantra's `/v1/models`. |
| `YANTRA_TIMEOUT_MS` | `25000` | Give up on Yantra after this long (the page falls back). |
| `NUCLEUX_PLAYGROUND_PER_HOUR` | `60` | Planner requests per IP per hour. |
| `NUCLEUX_TRUST_PROXY` | `loopback` | Express `trust proxy` (nginx on the same host). |
| `NUCLEUX_MCP_HOST` / `NUCLEUX_MCP_PORT` | `127.0.0.1` / `8118` | |
| `NUCLEUX_MCP_TIMEOUT_MS` | `30000` | Upstream call timeout. |
| `NUCLEUX_MOBILE_MCP` | `vendor/nucleux-mobile-mcp.cjs` | The private Nucleux Mobile MCP bundle (relative to this folder, or absolute). Missing = web only. Shown to any valid token. |

Deployment, nginx and rollout: see [DEPLOY.md](DEPLOY.md).

## Development

```bash
cd vendor && npm pack @nucleux/mcp@0.12.0 && cd ..   # the dependency is a vendored tarball
# optional, private (needs read access to intelligaia/nucleux-mobile-mcp): Nucleux Mobile
gh api repos/intelligaia/nucleux-mobile-mcp/contents/nucleux-mobile-mcp.cjs \
  -H "Accept: application/vnd.github.raw" > vendor/nucleux-mobile-mcp.cjs
npm ci   # on a Mac with Node ≥ 22: npm ci --ignore-scripts (falls back to node:sqlite)
npm test                                              # node --test, no network
NUCLEUX_PUBLIC_URL=http://localhost:8118 NUCLEUX_MCP_HOST=127.0.0.1 npm start
```

The tests run the real app on an ephemeral port with an in-memory database, fake
upstreams (web and mobile). They cover the `/connect` redirect, self-serve issuance
(prompt + code exchange, raw token, Origin check, rate limits), code exchange, tokens from
the sign-in era, the bearer gate in each `NUCLEUX_AUTH` mode, the full OAuth flow without a
session (DCR → consent → PKCE token → MCP call → refresh → revoke), metadata documents,
CSRF, admin Basic auth, usage logging, and the web + mobile
merge (`test/mobile.test.js`: routing by `framework`, merged list/search/get, schema enum,
instruction order, no token = web only, no bundle or a broken child = web only).
The mobile bundle is never needed for `npm test`.

## Client setup

- **Coding agents:** on `https://nucleux.in/mcp`, get a connect prompt and paste it into the
  agent. The agent runs `npx -y @nucleux/mcp add --code XXXX-XXXX`, which configures every agent on the machine.
- **By hand:** get a token on the same page and configure the agent with
  `https://nucleux.in/mcp` and the header `Authorization: Bearer nx_…`.
- **claude.ai / Claude Desktop and other OAuth-capable clients:** add a custom connector with
  `https://nucleux.in/mcp`, then click **Allow** on the consent page.
