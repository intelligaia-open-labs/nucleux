import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import catalog from "./catalog.json";
import { patterns } from "./patterns.js";
import { runAdd, runLogout } from "./add.js";
import { runWhoami } from "./auth.js";
import { runInit } from "./init.js";
import { runRemote } from "./remote.js";
import { createServer } from "./server.js";

async function main() {
  const transport = new StdioServerTransport();
  await createServer().connect(transport);
  // stderr so we never corrupt the stdio JSON-RPC channel.
  console.error(
    `nucleux-mcp ready — ${catalog.counts.components} components, ${patterns.length} patterns, ${catalog.counts.examples} examples.`,
  );
}

const [command, ...rest] = process.argv.slice(2);
const exitWith = (code: number | Promise<number>) =>
  Promise.resolve(code).then(
    (c) => process.exit(c),
    (err) => {
      console.error(`nucleux-mcp ${command} failed:`, err instanceof Error ? err.message : err);
      process.exit(1);
    },
  );

if (command === "init") {
  process.exit(runInit(rest));
} else if (command === "add") {
  exitWith(runAdd(rest));
} else if (command === "whoami") {
  exitWith(runWhoami(rest));
} else if (command === "logout") {
  exitWith(runLogout(rest));
} else if (command === "remote") {
  // Signed-in proxy to the hosted server. Never falls back to the local catalog.
  runRemote().catch((err) => {
    console.error("nucleux-mcp remote failed to start:", err);
    process.exit(1);
  });
} else {
  main().catch((err) => {
    console.error("nucleux-mcp failed to start:", err);
    process.exit(1);
  });
}
