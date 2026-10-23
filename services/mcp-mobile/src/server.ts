import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MobileCatalog } from "./catalog-types.js";
import catalogJson from "./mobile-catalog.json";
import { MOBILE_INSTRUCTIONS, registerMobileTools } from "./mobile.js";

export const catalog = catalogJson as unknown as MobileCatalog;

/** The standalone Nucleux Mobile server: every tool, on the generated catalog. */
export function createServer(): McpServer {
  const server = new McpServer({ name: "nucleux-mobile", version: catalog.version }, { instructions: MOBILE_INSTRUCTIONS });
  registerMobileTools(server, catalog);
  return server;
}
