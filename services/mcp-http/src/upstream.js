// Upstreams: long-lived child processes running stdio MCP servers — the
// published @nucleux/mcp (web) and, when its bundle is present, the private
// Nucleux Mobile server.
//
// `@nucleux/mcp` on npm speaks stdio only, so remote clients (Claude Desktop
// custom connectors, claude.ai, anything that takes a URL) cannot reach it.
// We run the published package as a long-lived child and re-expose its tools,
// rather than re-implementing the catalog — bumping the dependency is then the
// whole upgrade.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const require = createRequire(import.meta.url);
// services/mcp-http — relative vendor paths resolve against it.
const SERVICE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Fallback only. The package has carried its own `instructions` since 0.1.3 —
// including the ShadCN-as-base policy for components Nucleux does not ship —
// and those are forwarded verbatim so the two surfaces cannot drift. This text
// is what a client sees if the child is unreachable at initialize.
export const FALLBACK_INSTRUCTIONS = `Nucleux (@nucleux/react) is intelligaia's React component library for AI products, in two families: shadcn-style components and their Material 3 counterparts (Md3*). It covers the basics (shadcn/ui and Material 3 component lists) and the agentic patterns from nucleux.in (Disclosure, Consent, Caveat, OpenInput, SuggestedPrompts, Attachments, ModelSelection, KnowledgeBase, McpConnection…), each with an Md3 twin that has the same props.

Design-first workflow: search_patterns, then get_pattern for the curated composition, get_component for exact contracts and get_setup for installation. Pick one family per app. If a component, prop or pattern is not in the catalog it does not exist — report the gap instead of inventing it.

Note that the unrelated npm package "nucleux" (a state-management library) is not this library.`;

// One long-lived stdio child speaking MCP: respawned on the next request after
// it dies, with its tool list and instructions cached (both are fixed for a
// given build of the server it runs).
function createStdioUpstream({ label, entry, fallbackInstructions, callTimeoutMs }) {
  let upstream = null; // Promise<Client> while connecting or connected
  let pending = null;

  async function connect() {
    const client = new Client({ name: "nucleux-mcp-http-bridge", version: "1.0.0" }, { capabilities: {} });
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [entry],
      stderr: "inherit",
    });

    // A dead child must not be handed to the next request, or every call after
    // a crash fails against a closed pipe instead of respawning.
    const drop = () => {
      if (upstream === pending) upstream = null;
    };
    client.onclose = drop;
    client.onerror = (err) => {
      console.error(`[nucleux-mcp] ${label} upstream error:`, err);
      drop();
    };

    await client.connect(transport);
    const v = client.getServerVersion();
    console.log(`[nucleux-mcp] upstream ${label} (${v?.name ?? "?"}@${v?.version ?? "?"}) connected`);
    return client;
  }

  function get() {
    if (!upstream) {
      pending = connect().catch((err) => {
        if (upstream === pending) upstream = null;
        throw err;
      });
      upstream = pending;
    }
    return upstream;
  }

  // The catalog ships inside the package, so the tool list is fixed for a
  // given version — cache it and let tools/list answer without the child.
  let toolsCache = null;
  // Instructions are fixed per package version too, and are read off the
  // client handshake, so one successful connect is enough.
  let instructionsCache = null;
  let serverVersion = null;

  return {
    async serverVersion() {
      if (serverVersion) return serverVersion;
      const client = await get();
      serverVersion = client.getServerVersion() ?? { name: label, version: "unknown" };
      return serverVersion;
    },
    async instructions() {
      if (instructionsCache) return instructionsCache;
      try {
        const client = await get();
        instructionsCache = client.getInstructions() || fallbackInstructions;
      } catch (err) {
        // A dead child must not fail initialize — serve the local copy and let
        // the next request try again.
        console.error(`[nucleux-mcp] could not read ${label} upstream instructions:`, err);
        return fallbackInstructions;
      }
      return instructionsCache;
    },
    async listTools() {
      if (toolsCache) return toolsCache;
      const client = await get();
      const result = await client.listTools({}, { timeout: callTimeoutMs });
      toolsCache = result.tools ?? [];
      return toolsCache;
    },
    async callTool(name, args) {
      const client = await get();
      return client.callTool({ name, arguments: args ?? {} }, undefined, { timeout: callTimeoutMs });
    },
  };
}

// The web catalog: the published @nucleux/mcp package (a dependency).
export function createUpstream({ callTimeoutMs = 30_000 } = {}) {
  const entry = require.resolve("@nucleux/mcp");
  const version = require("@nucleux/mcp/package.json").version;
  return {
    version,
    ...createStdioUpstream({ label: "web", entry, fallbackInstructions: FALLBACK_INSTRUCTIONS, callTimeoutMs }),
  };
}

// Nucleux Mobile (SwiftUI, Compose, Flutter, React Native): the private kit's
// MCP server, bundled into one file in the private GitHub repo
// intelligaia/nucleux-mobile-mcp and dropped into vendor/ on deploy (never
// committed, never on npm). Served to signed-in users only (see surface.js).
// A missing file is not an error: the server runs web-only.
export const DEFAULT_MOBILE_FILE = "vendor/nucleux-mobile-mcp.cjs";

export function createMobileUpstream({ file = DEFAULT_MOBILE_FILE, callTimeoutMs = 30_000 } = {}) {
  const entry = path.resolve(SERVICE_ROOT, file);
  if (!fs.existsSync(entry)) {
    return {
      available: false,
      entry,
      async info() {
        return null;
      },
    };
  }
  const child = createStdioUpstream({ label: "mobile", entry, fallbackInstructions: "", callTimeoutMs });
  let infoCache = null;
  return {
    available: true,
    entry,
    ...child,
    // { version, components } for /health; null when the child cannot answer.
    async info() {
      if (infoCache) return infoCache;
      try {
        const { version } = await child.serverVersion();
        const list = await child.callTool("list_components", {});
        const text = (list?.content ?? []).map((c) => c.text ?? "").join("\n");
        const m = /(\d+) components/.exec(text);
        const components = m ? Number(m[1]) : (text.match(/^- \*\*/gm) ?? []).length;
        infoCache = { version, components };
        return infoCache;
      } catch (err) {
        console.error("[nucleux-mcp] mobile upstream unavailable:", err);
        return null;
      }
    },
  };
}
