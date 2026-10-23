// Library entry (dist/lib.js): the standalone server, the mobile tools for embedding in another MCP server, and the
// pure query functions.
export { catalog, createServer } from "./server.js";
export * from "./mobile.js";
export * from "./catalog-types.js";
export { USAGE_RULES, nearestSymbols, type UsageIssue, type Severity } from "./validate.js";
