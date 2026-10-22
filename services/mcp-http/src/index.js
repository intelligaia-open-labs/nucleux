// Nucleux MCP over Streamable HTTP.
//
// `@nucleux/mcp` on npm speaks stdio only, so remote clients (Claude Desktop
// custom connectors, claude.ai, anything that takes a URL) cannot reach it.
// This process runs the published package as a long-lived child and re-exposes
// its tools over an HTTP endpoint, rather than re-implementing the catalog —
// bumping the dependency is then the whole upgrade.
//
// Stateless per request: each POST gets its own proxy server + transport, all
// sharing the single upstream child. The tools are read-only catalog lookups,
// so there is nothing per-caller to keep and no auth to enforce.

import { createRequire } from "node:module";
import express from "express";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const PORT = Number(process.env.NUCLEUX_MCP_PORT ?? 8118);
const HOST = process.env.NUCLEUX_MCP_HOST ?? "127.0.0.1";
const CALL_TIMEOUT_MS = Number(process.env.NUCLEUX_MCP_TIMEOUT_MS ?? 30_000);

const require = createRequire(import.meta.url);
const UPSTREAM_ENTRY = require.resolve("@nucleux/mcp");
const UPSTREAM_VERSION = require("@nucleux/mcp/package.json").version;

// Fallback only. The package has carried its own `instructions` since 0.1.3 —
// including the ShadCN-as-base policy for components Nucleux does not ship —
// and those are forwarded verbatim so the two surfaces cannot drift. This text
// is what a client sees if the child is unreachable at initialize.
const FALLBACK_INSTRUCTIONS = `Nucleux (@nucleux/react) is intelligaia's React component library for AI products, in two families: shadcn-style components and their Material 3 counterparts (Md3*). It covers the basics (shadcn/ui and Material 3 component lists) and the agentic patterns from nucleux.in (Disclosure, Consent, Caveat, OpenInput, SuggestedPrompts, Attachments, ModelSelection, KnowledgeBase, McpConnection…), each with an Md3 twin that has the same props.

Design-first workflow: search_patterns, then get_pattern for the curated composition, get_component for exact contracts and get_setup for installation. Pick one family per app. If a component, prop or pattern is not in the catalog it does not exist — report the gap instead of inventing it.

Note that the unrelated npm package "nucleux" (a state-management library) is not this library.`;

// ---------------------------------------------------------------------------
// Upstream: one child process running the published stdio server.
// ---------------------------------------------------------------------------

let upstream = null; // Promise<Client> while connecting or connected

async function connectUpstream() {
  const client = new Client(
    { name: "nucleux-mcp-http-bridge", version: "1.0.0" },
    { capabilities: {} }
  );
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [UPSTREAM_ENTRY],
    stderr: "inherit",
  });

  // A dead child must not be handed to the next request, or every call after a
  // crash fails against a closed pipe instead of respawning.
  const drop = () => {
    if (upstream === pending) upstream = null;
  };
  client.onclose = drop;
  client.onerror = (err) => {
    console.error("[nucleux-mcp] upstream error:", err);
    drop();
  };

  await client.connect(transport);
  console.log(`[nucleux-mcp] upstream @nucleux/mcp@${UPSTREAM_VERSION} connected`);
  return client;
}

let pending = null;
function getUpstream() {
  if (!upstream) {
    pending = connectUpstream().catch((err) => {
      if (upstream === pending) upstream = null;
      throw err;
    });
    upstream = pending;
  }
  return upstream;
}

// The catalog ships inside the package, so the tool list is fixed for a given
// version — cache it and let tools/list answer without touching the child.
let toolsCache = null;

// Instructions are fixed per package version too, and are read off the client
// handshake rather than a request, so one successful connect is enough.
let instructionsCache = null;

async function upstreamInstructions() {
  if (instructionsCache) return instructionsCache;
  try {
    const client = await getUpstream();
    instructionsCache = client.getInstructions() || FALLBACK_INSTRUCTIONS;
  } catch (err) {
    // A dead child must not fail initialize — serve the local copy and let the
    // next request try again.
    console.error("[nucleux-mcp] could not read upstream instructions:", err);
    return FALLBACK_INSTRUCTIONS;
  }
  return instructionsCache;
}

async function listUpstreamTools() {
  if (toolsCache) return toolsCache;
  const client = await getUpstream();
  const result = await client.listTools({}, { timeout: CALL_TIMEOUT_MS });
  toolsCache = result.tools ?? [];
  return toolsCache;
}

// ---------------------------------------------------------------------------
// Proxy MCP server
// ---------------------------------------------------------------------------

function buildServer(instructions) {
  const server = new Server(
    { name: "nucleux", version: UPSTREAM_VERSION },
    { capabilities: { tools: {} }, instructions }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: await listUpstreamTools(),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const client = await getUpstream();
    return client.callTool(
      { name: request.params.name, arguments: request.params.arguments ?? {} },
      undefined,
      { timeout: CALL_TIMEOUT_MS }
    );
  });

  return server;
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

const jsonRpcError = (code, message) => ({
  jsonrpc: "2.0",
  error: { code, message },
  id: null,
});

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));

// Public read-only catalog, so any origin may call it. Mcp-Session-Id is
// exposed for browser-based clients like the MCP Inspector; stateless mode
// never sets it, but omitting it breaks clients that look for it.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, Authorization, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID"
  );
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

app.get("/health", (_req, res) => {
  void (async () => {
    try {
      const tools = await listUpstreamTools();
      res.json({
        status: "ok",
        service: "nucleux-mcp",
        upstream: `@nucleux/mcp@${UPSTREAM_VERSION}`,
        tools: tools.map((t) => t.name),
      });
    } catch (err) {
      console.error("[nucleux-mcp] health check failed:", err);
      res.status(503).json({ status: "degraded", error: String(err?.message ?? err) });
    }
  })();
});

async function handleMcpPost(req, res) {
  const server = buildServer(await upstreamInstructions());
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  // One server per request, so both must die with the response or every call
  // leaks a transport.
  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("[nucleux-mcp] request failed:", err);
    if (!res.headersSent) {
      res.status(500).json(jsonRpcError(-32603, "Internal server error"));
    }
  }
}

// Kept out of the route callback so the callback is not itself async: an async
// callback that rejects is an unhandled rejection, which would take the
// process down instead of returning a 500.
app.post("/", (req, res, next) => {
  void (async () => {
    try {
      await handleMcpPost(req, res);
    } catch (err) {
      next(err);
    }
  })();
});

// Stateless mode has no stream to resume and no session to delete.
const notAllowed = (_req, res) =>
  res.status(405).json(jsonRpcError(-32000, "Method not allowed. This endpoint is POST-only."));
app.get("/", notAllowed);
app.delete("/", notAllowed);

app.listen(PORT, HOST, () => {
  console.log(`[nucleux-mcp] listening on http://${HOST}:${PORT}`);
  // Fail loudly at boot rather than on the first user request.
  listUpstreamTools()
    .then((tools) => console.log(`[nucleux-mcp] ${tools.length} tools: ${tools.map((t) => t.name).join(", ")}`))
    .catch((err) => console.error("[nucleux-mcp] upstream unavailable at boot:", err));
});
