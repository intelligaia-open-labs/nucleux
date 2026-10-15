import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import catalog from "../src/catalog.json";
import knowledge from "../src/knowledge.json";
import { createServer } from "../src/server";

let client: Client;

beforeAll(async () => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "nucleux-test", version: "0.0.0" });
  await Promise.all([createServer().connect(serverSide), client.connect(clientSide)]);
});
afterAll(() => client.close());

const call = async (name: string, args: Record<string, unknown> = {}) => {
  const res = (await client.callTool({ name, arguments: args })) as {
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  };
  return { text: res.content.map((c) => c.text).join("\n"), isError: res.isError === true };
};
const topPattern = (text: string) => text.match(/- \*\*([a-z0-9-]+)\*\*/)?.[1];

describe("catalog metadata", () => {
  const allExports = new Set(catalog.packages.flatMap((p) => p.exports));

  it("props are clean declarations with structured members", () => {
    for (const p of catalog.packages) {
      for (const pr of p.props) {
        expect(pr.source, `${p.name}/${pr.name}`).not.toMatch(/forwardRef|displayName/);
        expect(pr.source).toMatch(new RegExp(`interface ${pr.name}\\b`));
        expect(Array.isArray(pr.members)).toBe(true);
      }
    }
  });

  it("import lines only name real value exports", () => {
    for (const p of catalog.packages) {
      if (!p.import) continue;
      const names = p.import.match(/\{([^}]*)\}/)![1].split(",").map((s) => s.trim());
      for (const n of names) expect(allExports.has(n), `${p.package}: ${n}`).toBe(true);
      expect(p.import, p.package).not.toMatch(/Props\b|Variant\b/);
    }
  });

  it("captures exact variant values and defaults", () => {
    type Member = { name: string; required: boolean; values?: string[]; default?: string };
    const button = catalog.packages.find((p) => p.name === "button")!.props[0] as { members: Member[] };
    const variant = button.members.find((m) => m.name === "variant")!;
    expect(variant.values).toEqual(["primary", "cta", "secondary", "ghost", "destructive"]);
    const size = button.members.find((m) => m.name === "size")!;
    expect(size.default).toBe('"md"');
    const sheet = catalog.packages.find((p) => p.name === "sheet")!.props.find((p) => p.name === "SheetProps")!;
    expect(sheet.members.filter((m) => m.required).map((m) => m.name)).toEqual(["open", "onOpenChange", "children"]);
  });

  it("every pattern component resolves to a catalog export", () => {
    for (const p of knowledge.patterns) {
      for (const c of [...p.components.required, ...p.components.optional]) {
        expect(allExports.has(c), `${p.id}: ${c}`).toBe(true);
      }
      for (const r of p.related) expect(knowledge.patterns.some((x) => x.id === r), `${p.id} → ${r}`).toBe(true);
    }
  });
});

describe("MCP server", () => {
  it("keeps every existing tool and adds the pattern tools", async () => {
    const names = (await client.listTools()).tools.map((t) => t.name);
    for (const n of ["list_components", "get_component", "search_components", "get_setup", "list_examples", "get_example"]) {
      expect(names).toContain(n);
    }
    expect(names).toContain("search_patterns");
    expect(names).toContain("get_pattern");
  });

  it.each([
    ["A dashboard where administrators can monitor metrics and manage users", "dashboard-overview"],
    ["list of projects with search and status filter", "list-page"],
    ["user management table", "list-page"],
    ["responsive sidebar navigation with a mobile menu", "app-shell"],
    ["profile and notification settings", "settings-page"],
    ["loading skeleton and empty state", "page-states"],
  ])("search_patterns(%j) ranks %s first", async (query, expected) => {
    const { text, isError } = await call("search_patterns", { query });
    expect(isError).toBe(false);
    expect(topPattern(text)).toBe(expected);
  });

  it("search_patterns says so when nothing matches instead of inventing one", async () => {
    const { text } = await call("search_patterns", { query: "checkout cart" });
    expect(text).toMatch(/No curated Nucleux pattern matches/);
    expect(text).toMatch(/do not present it as a Nucleux pattern/);
  });

  it("search_patterns stays concise", async () => {
    const { text } = await call("search_patterns", { query: "dashboard", limit: 2 });
    expect(text.match(/- \*\*/g)!.length).toBeLessThanOrEqual(2);
    expect(text).not.toContain("```");
  });

  it.each(knowledge.patterns.map((p) => [p.id]))("get_pattern(%s) returns the full spec and example", async (id) => {
    const p = knowledge.patterns.find((x) => x.id === id)!;
    const { text, isError } = await call("get_pattern", { id });
    expect(isError).toBe(false);
    expect(text).toContain("Curated Nucleux pattern");
    for (const c of p.components.required) expect(text).toContain(c);
    expect(text).toContain("## Responsive rules");
    expect(text).toContain("## Accessibility");
    expect(text).toContain("```tsx");
  });

  it("get_pattern can omit the example", async () => {
    const { text } = await call("get_pattern", { id: "app-shell", includeExample: false });
    expect(text).not.toContain("```tsx");
  });

  it("get_pattern errors on an unknown id and lists the real ones", async () => {
    const { text, isError } = await call("get_pattern", { id: "kanban-board" });
    expect(isError).toBe(true);
    expect(text).toContain("app-shell");
  });

  it("rejects malformed input", async () => {
    const res = await client.callTool({ name: "get_pattern", arguments: {} }).catch((e: Error) => e);
    const failed = res instanceof Error || (res as { isError?: boolean }).isError === true;
    expect(failed).toBe(true);
  });

  it("get_component returns the structured contract and pattern back-links", async () => {
    const { text } = await call("get_component", { name: "Button" });
    expect(text).toContain('import { Button } from "@nucleux/button"');
    expect(text).toContain('`variant?`: `"primary" | "cta" | "secondary" | "ghost" | "destructive"`');
    expect(text).toMatch(/`color\?`.*\*\*deprecated\*\*/);
    expect(text).toMatch(/Used in patterns:.*list-page/);
  });

  it("get_component still answers a near-miss with suggestions", async () => {
    const { text } = await call("get_component", { name: "Buttons" });
    expect(text).toMatch(/Did you mean: .*Button/);
  });

  it("build_with_nucleux prompt carries the shared workflow", async () => {
    const res = await client.getPrompt({ name: "build_with_nucleux", arguments: { request: "a CRM" } });
    const body = res.messages.map((m) => (m.content as { text: string }).text).join("\n");
    expect(body).toContain(knowledge.workflow);
    expect(body).toContain("Task: a CRM");
  });

  it("server instructions point agents at patterns first", () => {
    expect(client.getInstructions()).toMatch(/search_patterns first/);
  });
});
