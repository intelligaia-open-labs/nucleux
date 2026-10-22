// Nucleux Mobile in @nucleux/mcp: the shared tools route framework swiftui|compose|flutter|react-native to the
// vendored mobile module (src/mobile/), the mobile-only tools are registered, and the web answers are unchanged.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import mobileCatalog from "../src/mobile/mobile-catalog.json";
import { createServer } from "../src/server";

let client: Client;

beforeAll(async () => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "nucleux-mobile-test", version: "0.0.0" });
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

const MOBILE = ["swiftui", "compose", "flutter", "react-native"] as const;

describe("Nucleux Mobile tools", () => {
  it("adds the mobile-only tools and keeps one of each shared name", async () => {
    const names = (await client.listTools()).tools.map((t) => t.name);
    for (const n of ["get_mobile_spec", "get_mobile_words", "validate_mobile_usage"]) expect(names).toContain(n);
    expect(new Set(names).size).toBe(names.length);
    expect(client.getInstructions()).toMatch(/Native mobile apps: the same tools cover Nucleux Mobile/);
  });

  it("offers the mobile frameworks on the shared tools", async () => {
    const tools = (await client.listTools()).tools;
    for (const n of ["list_components", "get_component", "search_components", "get_setup", "list_examples", "get_example"]) {
      const fw = (tools.find((t) => t.name === n)!.inputSchema.properties as Record<string, { enum?: string[] }>).framework;
      expect(fw?.enum, n).toEqual(expect.arrayContaining([...MOBILE]));
    }
  });

  it("leaves the web answers unchanged when framework is omitted or react", async () => {
    const plain = await call("get_component", { name: "Caveat" });
    const react = await call("get_component", { name: "Caveat", framework: "react" });
    expect(plain.text).toBe(react.text);
    expect(plain.text).toMatch(/@nucleux\/caveat/);
    expect(plain.text).not.toMatch(/Nucleux Mobile|SwiftUI/);
    expect((await call("list_components")).text).not.toMatch(/Nucleux Mobile/);
    expect((await call("get_setup")).text).toMatch(/^# Nucleux setup \(@nucleux\/react@/);
  });

  it("list_components with a mobile framework lists the mobile kit", async () => {
    const { text } = await call("list_components", { framework: "flutter" });
    expect(text).toMatch(/^Nucleux Mobile .* 37 components and patterns/);
    expect(text).toMatch(/NucleuxMadlibCard/);
  });

  it.each(MOBILE)("get_component PromptComposer in %s returns that framework's API", async (framework) => {
    const { text, isError } = await call("get_component", { name: "composer", framework });
    expect(isError).toBe(false);
    expect(text).toMatch(/^# PromptComposer \(`prompt-composer`/);
    expect(text).toMatch(framework === "react-native" ? /PromptComposerProps/ : /NucleuxPromptComposer/);
    expect(text).toMatch(/onLimitsPress|nucleuxDisclaimerLine/);
  });

  it("get_component with a mobile framework never falls back to ShadCN", async () => {
    const { text, isError } = await call("get_component", { name: "Holodeck", framework: "swiftui" });
    expect(isError).toBe(true);
    expect(text).toMatch(/No Nucleux Mobile component/);
    expect(text).not.toMatch(/ShadCN|shadcn/);
  });

  it("search_components, get_setup, list_examples and get_example route mobile frameworks", async () => {
    expect((await call("search_components", { query: "fill in the blanks", framework: "compose" })).text).toMatch(/\*\*Madlibs\*\*/);
    expect((await call("get_setup", { framework: "swiftui" })).text).toMatch(/NucleuxMenuHost/);
    expect((await call("get_setup", { framework: "react-native" })).text).toMatch(/@intelligaia\/nucleux/);
    expect((await call("list_examples", { framework: "flutter" })).text).toMatch(/madlibs \(flutter\)/);
    expect((await call("get_example", { name: "caveat", framework: "swiftui" })).text).toMatch(/struct CaveatScreen: View/);
    expect((await call("get_example", { name: "agent-chat" })).text).toMatch(/```tsx/);
  });

  it("get_mobile_spec and get_mobile_words return the spec and the exact words", async () => {
    expect((await call("get_mobile_spec", { name: "Modes" })).text).toMatch(/# Modes/);
    const caveat = mobileCatalog.components.find((c) => c.id === "caveat")!;
    const words = (caveat.words as Record<string, { constants: { words?: Record<string, string> } }>)["specs/caveat.fixtures.json"]!.constants.words!;
    const { text } = await call("get_mobile_words", { name: "Caveat", framework: "swiftui" });
    for (const w of Object.values(words)) expect(text).toContain(w);
  });

  it("validate_mobile_usage flags removed APIs and generic AI warnings", async () => {
    const { text } = await call("validate_mobile_usage", {
      framework: "react-native",
      code: "import { PromptComposer } from '@intelligaia/nucleux';\n<PromptComposer caveat=\"AI can make mistakes\" onCaveatPress={open} />",
    });
    const report = JSON.parse(text) as { valid: boolean; issues: Array<{ code: string }> };
    expect(report.valid).toBe(false);
    expect(report.issues.map((i) => i.code)).toEqual(expect.arrayContaining(["removed-api", "generic-ai-warning"]));
  });
});
