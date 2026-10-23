# nucleux-mcp (hosted)

Serves the published `@nucleux/mcp` npm package, which speaks **stdio only**, at a
URL. Clients that can only take a URL (claude.ai, Claude Desktop custom connectors,
Cursor, Windsurf) can then use it. It also adds accounts: sign-in with Google or GitHub,
per-user tokens for coding agents, OAuth 2.1 for claude.ai, and per-user usage tracking.

**Endpoint:** `https://nucleux.in/mcp` (Streamable HTTP, `Authorization: Bearer …`)
**Connect page:** `https://nucleux.in/mcp/connect`
**Health:** `https://nucleux.in/mcp/health` (public)

The open package keeps working without an account: `npx -y @nucleux/mcp` runs the
catalog locally over stdio.

## How it works

`src/upstream.js` runs the published package as one long-lived child process and
proxies `tools/list` / `tools/call` to it, with its `instructions` forwarded verbatim.
The catalog is not re-implemented, so upgrading is just bumping the `@nucleux/mcp`
dependency. Each POST gets its own proxy `Server` + `StreamableHTTPServerTransport`
(stateless) sharing that single child, and the tool list is cached per version.

In front of that (`src/app.js`):

| Route (public path under `/mcp`) | What |
|---|---|
| `POST /` | MCP endpoint. Bearer gate per `NUCLEUX_AUTH`; every `tools/call` is logged (user, tool, ms, ok — never arguments). `GET`/`DELETE` → 405. |
| `GET /health` | Public health check. |
| `GET /connect` | Sign in; generate the one-line connect command; claude.ai instructions; your tokens and connected apps (revoke); your usage. |
| `GET /admin` | Admins only: users, last seen, calls 7/30 days, revoke all, disable/enable. |
| `GET /auth/login?provider=google\|github&next=…`, `GET /auth/callback/:provider`, `POST /auth/logout` | Sign-in. |
| `POST /cli/exchange` | `{ code, label }` → `{ token, email, name }` or `400 { error: "invalid_code" }`. Rate-limited. |
| `GET /cli/whoami` | Bearer → `{ email, name }` or 401. |
| `POST /cli/revoke` | Bearer `nx_…` → revokes that token → `{ revoked: true }`, or 401. |
| `GET /.well-known/oauth-protected-resource[/mcp]` | RFC 9728 metadata. |
| `GET /.well-known/oauth-authorization-server[/mcp]`, `/.well-known/openid-configuration[/mcp]` | RFC 8414 metadata. |
| `POST /oauth/register` | RFC 7591 dynamic client registration. Rate-limited. |
| `GET/POST /oauth/authorize` | Consent page (needs a session, PKCE S256, exact redirect URI). |
| `POST /oauth/token` | `authorization_code` (PKCE, single use, 5 min) and `refresh_token` (rotated; reuse revokes the family). Access 1 h, refresh 60 days. |
| `POST /oauth/revoke` | RFC 7009. |

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
`oauth_tokens` and `usage`.

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
| `NUCLEUX_TRUST_PROXY` | `loopback` | Express `trust proxy` (nginx on the same host). |
| `NUCLEUX_MCP_HOST` / `NUCLEUX_MCP_PORT` | `127.0.0.1` / `8118` | |
| `NUCLEUX_MCP_TIMEOUT_MS` | `30000` | Upstream call timeout. |

Deployment, OAuth app registration, nginx and rollout: see [DEPLOY.md](DEPLOY.md).

## Development

```bash
cd vendor && npm pack @nucleux/mcp@0.10.0 && cd ..   # the dependency is a vendored tarball
npm install
npm test                                              # node --test, no network
NUCLEUX_PUBLIC_URL=http://localhost:8118 NUCLEUX_MCP_HOST=127.0.0.1 npm start
```

The tests run the real app on an ephemeral port with an in-memory database, a fake
upstream and a fake sign-in provider. They cover code exchange, the bearer gate in each
`NUCLEUX_AUTH` mode, the full OAuth flow (DCR → authorize → PKCE token → MCP call →
refresh → revoke), metadata documents, CSRF and usage logging.

## Client setup

- **Coding agents:** sign in at `/connect`, click **Generate connect line**, and paste the line
  into the agent: ``Connect Nucleux to my coding agents: run `npx -y @nucleux/mcp add --code XXXX-XXXX` ``.
- **claude.ai / Claude Desktop:** Settings → Connectors → Add custom connector →
  `https://nucleux.in/mcp`, then sign in.
