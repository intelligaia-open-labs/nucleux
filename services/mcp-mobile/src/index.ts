import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { catalog, createServer } from "./server.js";

async function main() {
  const transport = new StdioServerTransport();
  await createServer().connect(transport);
  // stderr, so the stdio JSON-RPC channel stays clean.
  console.error(`nucleux-mobile-mcp ready — ${catalog.counts.components} components, ${catalog.counts.examples} examples, 4 frameworks.`);
}

main().catch((err) => {
  console.error("nucleux-mobile-mcp failed to start:", err);
  process.exit(1);
});
