import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import catalog from "./catalog.json";
import { patterns } from "./patterns.js";
import { createServer } from "./server.js";

async function main() {
  const transport = new StdioServerTransport();
  await createServer().connect(transport);
  // stderr so we never corrupt the stdio JSON-RPC channel.
  console.error(
    `nucleux-mcp ready — ${catalog.counts.components} components, ${patterns.length} patterns, ${catalog.counts.examples} examples.`,
  );
}

main().catch((err) => {
  console.error("nucleux-mcp failed to start:", err);
  process.exit(1);
});
