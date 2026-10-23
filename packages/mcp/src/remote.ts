import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  CallToolResultSchema,
  ListToolsRequestSchema,
  ListToolsResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { defaultAuthEnv, resolveAuth, SIGN_IN_HINT, type AuthEnv } from "./auth.js";

const NAME = "nucleux";
const VERSION = "remote";

export interface RemoteOptions {
  /** Base URL, e.g. https://nucleux.in/mcp (the MCP endpoint is `{server}/`). */
  server: string;
  token?: string;
  /** stderr; never stdout (that's the JSON-RPC channel). */
  warn: (line: string) => void;
  fetch?: typeof fetch;
}

const isUnauthorized = (err: unknown) =>
  (err as { code?: unknown })?.code === 401 || /\b401\b|unauthori[sz]ed/i.test(String((err as Error)?.message ?? ""));

/**
 * A stdio MCP server that forwards to the hosted Nucleux server with the
 * user's bearer token. Without a valid token it still starts, but every tool
 * call answers with how to sign in. It never falls back to the local catalog.
 */
export async function createRemoteProxy(o: RemoteOptions): Promise<Server> {
  const notSignedIn = o.token
    ? `Nucleux rejected the saved token (revoked or expired). ${SIGN_IN_HINT}`
    : `Nucleux isn't signed in on this machine. ${SIGN_IN_HINT}`;

  let upstream: Client | undefined;
  let authFailed = !o.token;
  let unreachable: string | undefined;

  const connect = async () => {
    const client = new Client({ name: "nucleux-remote", version: VERSION });
    const transport = new StreamableHTTPClientTransport(new URL(`${o.server}/`), {
      requestInit: { headers: { Authorization: `Bearer ${o.token}` } },
      ...(o.fetch ? { fetch: o.fetch } : {}),
    });
    await client.connect(transport);
    return client;
  };
  const drop = async () => {
    const c = upstream;
    upstream = undefined;
    await c?.close().catch(() => {});
  };

  if (o.token) {
    try {
      upstream = await connect();
    } catch (err) {
      if (isUnauthorized(err)) authFailed = true;
      else unreachable = (err as Error).message;
    }
  }
  if (authFailed) o.warn(`nucleux-mcp remote: ${notSignedIn}`);
  else if (unreachable) o.warn(`nucleux-mcp remote: couldn't reach ${o.server} (${unreachable}); will retry on the next call.`);

  /** Runs a request upstream; reconnects once if the server lost our session or restarted. */
  const withUpstream = async <T>(fn: (c: Client) => Promise<T>): Promise<T> => {
    for (let attempt = 0; ; attempt++) {
      try {
        if (!upstream) upstream = await connect();
        return await fn(upstream);
      } catch (err) {
        await drop();
        if (isUnauthorized(err) || attempt >= 1) throw err;
      }
    }
  };

  const errorResult = (text: string) => ({ content: [{ type: "text" as const, text }], isError: true });
  const failure = (err: unknown) => {
    if (isUnauthorized(err)) {
      authFailed = true;
      o.warn(`nucleux-mcp remote: ${notSignedIn}`);
      return errorResult(notSignedIn);
    }
    return errorResult(`Couldn't reach the Nucleux server at ${o.server} (${(err as Error).message}). Try again in a moment.`);
  };

  const instructions = authFailed
    ? `Nucleux (hosted) is not connected: ${notSignedIn}`
    : upstream?.getInstructions();
  const server = new Server({ name: NAME, version: upstream?.getServerVersion()?.version ?? VERSION }, {
    capabilities: { tools: {} },
    ...(instructions ? { instructions } : {}),
  });

  server.setRequestHandler(ListToolsRequestSchema, async (req) => {
    if (authFailed) {
      // One tool, so the agent can surface the sign-in step instead of seeing nothing.
      return {
        tools: [
          {
            name: "nucleux_sign_in",
            description: `Nucleux is not connected. ${notSignedIn} Call this tool to show the user how to connect.`,
            inputSchema: { type: "object" as const, properties: {} },
          },
        ],
      };
    }
    try {
      return await withUpstream((c) => c.request({ method: "tools/list", params: req.params }, ListToolsResultSchema));
    } catch (err) {
      if (isUnauthorized(err)) {
        failure(err);
        return { tools: [] };
      }
      throw err;
    }
  });

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    if (authFailed) return errorResult(notSignedIn);
    try {
      return await withUpstream((c) => c.request({ method: "tools/call", params: req.params }, CallToolResultSchema));
    } catch (err) {
      return failure(err);
    }
  });

  server.onclose = () => void drop();
  return server;
}

/** `nucleux-mcp remote`: the stdio proxy that `add --code` puts into every agent's config. */
export async function runRemote(env: AuthEnv = defaultAuthEnv()): Promise<void> {
  const { server, token } = resolveAuth(env);
  const proxy = await createRemoteProxy({ server, token, warn: (line) => console.error(line) });
  await proxy.connect(new StdioServerTransport());
  console.error(`nucleux-mcp remote — proxying to ${server}`);
}
