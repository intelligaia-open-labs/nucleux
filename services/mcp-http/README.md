# nucleux-mcp (remote)

Serves the published `@nucleux/mcp` npm package — which speaks **stdio only** — at a
URL, so clients that can only take a URL (Claude Desktop custom connectors, claude.ai,
Cursor, Windsurf) can use it.

**Endpoint:** `https://nucleux.in/mcp` (Streamable HTTP, no auth)
**Health:** `https://nucleux.in/mcp/health`

## How it works

`src/index.js` runs the published package as one long-lived child process and proxies
`tools/list` / `tools/call` to it. The catalog is not re-implemented, so upgrading is
just bumping the `@nucleux/mcp` dependency (and `pm2 restart nucleux-mcp`).

Each POST gets its own proxy `Server` + `StreamableHTTPServerTransport` (stateless,
`sessionIdGenerator: undefined`) sharing that single child. The tools are read-only
catalog lookups, so there is nothing per-caller to keep and no auth to enforce — same
reason the endpoint is public.

The tool list is cached after first fetch: it is fixed for a given package version.

## Ops

- pm2 app `nucleux-mcp`, under the **jaswant-singh** pm2 daemon like every other
  deployment on this box (so pm2-monitor sees it). Config `ecosystem.config.cjs`.
- Listens on **127.0.0.1:8118**. nginx `location = /mcp` and `/mcp/` in
  `/etc/nginx/sites-available/nucleux.in` proxy to it with `proxy_buffering off`
  (replies are SSE) — declared *before* `location /` so the site's
  `rewrite ^(.+)/$ $1/index.html` never sees MCP requests.
- Logs: `logs/nucleux-mcp.{out,err}.log`.

```bash
pm2 restart nucleux-mcp && pm2 save
curl -s https://nucleux.in/mcp/health
```

## Client setup

Claude Desktop → Settings → Connectors → Add custom connector → `https://nucleux.in/mcp`

Claude Code:

```bash
claude mcp add --transport http nucleux https://nucleux.in/mcp
```

Any client taking JSON config:

```json
{ "mcpServers": { "nucleux": { "type": "http", "url": "https://nucleux.in/mcp" } } }
```

The local stdio form still works too (`npx -y @nucleux/mcp`) and is what
`/home/jaswant-singh/.mcp.json` uses.

## Tools

`list_components`, `search_components`, `get_component`, `get_setup`, `list_examples`,
`get_example` — 48 components, 6 examples as of `@nucleux/mcp@0.1.0`.
