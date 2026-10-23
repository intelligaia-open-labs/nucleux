// Nucleux Mobile on the hosted server: merged for any valid token, absent for
// requests without one, and optional (no bundle = web only).
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { startServer, newCliCode, exchange, rpc, fakeWebUpstream, fakeMobileUpstream } from "./helpers.js";
import { createMobileUpstream } from "../src/upstream.js";
import { PLATFORM_PREAMBLE } from "../src/surface.js";

const INIT = { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } };
const MOBILE = ["swiftui", "compose", "flutter", "react-native"];

async function tokenFor(srv) {
  return (await (await exchange(srv, await newCliCode(srv))).json()).token;
}
const textOf = (res) => res.body.result.content.map((c) => c.text).join("\n");

describe("with a token: web + mobile, one tool per shared name", () => {
  let srv, token, web, mobile;
  const call = (name, args) => rpc(srv, "tools/call", { name, arguments: args }, token);
  before(async () => {
    web = fakeWebUpstream();
    mobile = fakeMobileUpstream();
    srv = await startServer({ NUCLEUX_AUTH: "required" }, { upstream: web, mobile });
    token = await tokenFor(srv);
  });
  after(() => srv.close());

  test("instructions: platform preamble, then web, then mobile", async () => {
    const res = await rpc(srv, "initialize", INIT, token);
    const text = res.body.result.instructions;
    assert.ok(text.startsWith(PLATFORM_PREAMBLE));
    const [p, w, m] = [text.indexOf("Package.swift"), text.indexOf("WEB INSTRUCTIONS"), text.indexOf("MOBILE INSTRUCTIONS")];
    assert.ok(p > 0 && p < w && w < m, "preamble < web < mobile");
    assert.match(text, /# Web \(@nucleux\/react\)\n\nWEB INSTRUCTIONS/);
    assert.match(text, /# Mobile \(Nucleux Mobile\)\n\nMOBILE INSTRUCTIONS$/);
    assert.match(text, /ask only when you can't tell/);
    assert.match(text, /Nucleux platform: SwiftUI/);
  });

  test("tools/list: shared names once, both sides' own tools, framework enum widened", async () => {
    const tools = (await rpc(srv, "tools/list", {}, token)).body.result.tools;
    const names = tools.map((t) => t.name);
    assert.equal(new Set(names).size, names.length, "no duplicate names");
    for (const n of ["list_components", "get_component", "search_components", "get_setup", "list_examples", "get_example", "search_patterns", "get_mobile_spec", "get_mobile_words", "validate_mobile_usage"]) {
      assert.ok(names.includes(n), n);
    }
    const get = tools.find((t) => t.name === "get_component");
    assert.deepEqual(get.inputSchema.properties.framework.enum, ["react", "html", ...MOBILE]);
    assert.match(get.inputSchema.properties.framework.description, /^Web: react or html\. Mobile: "swiftui"/);
    assert.ok(get.inputSchema.properties.template, "web-only params kept");
    assert.deepEqual(get.inputSchema.required, ["name"]);
    const list = tools.find((t) => t.name === "list_components");
    assert.deepEqual(list.inputSchema.properties.framework.enum, ["react", ...MOBILE]);
    assert.deepEqual(list.inputSchema.properties.kind.enum, ["component", "infrastructure", "all", "pattern", "foundation"]);
    assert.match(list.description, /^web list For Nucleux Mobile/);
    const setup = tools.find((t) => t.name === "get_setup");
    assert.deepEqual(setup.inputSchema.properties.framework.enum, ["react", "html", ...MOBILE]);
    assert.ok(setup.inputSchema.properties.packageManager);
  });

  test("a mobile framework routes to mobile, a web one (or none) to web", async () => {
    mobile.calls.length = web.calls.length = 0;
    assert.equal(textOf(await call("get_component", { name: "PromptComposer", framework: "swiftui" })).split("\n").pop(), "MOBILE PromptComposer swiftui");
    assert.equal(textOf(await call("get_setup", { framework: "flutter" })), 'MOBILE get_setup {"framework":"flutter"}');
    assert.equal(textOf(await call("get_example", { name: "caveat", framework: "compose" })), 'MOBILE get_example {"name":"caveat","framework":"compose"}');
    assert.equal(textOf(await call("get_setup", { framework: "html", packageManager: "npm" })), 'WEB get_setup {"framework":"html","packageManager":"npm"}');
    assert.equal(textOf(await call("get_setup", {})), "WEB get_setup {}");
    assert.equal(textOf(await call("list_examples", {})), "WEB list_examples {}");
    // A web tool without `framework` never receives one.
    assert.equal(textOf(await call("get_example", { name: "agent-chat", framework: "react" })), 'WEB get_example {"name":"agent-chat"}');
    assert.ok(web.calls.every((c) => !MOBILE.includes(c.args.framework)), "web never sees a mobile framework");
  });

  test("mobile-only and web-only tools pass through", async () => {
    assert.equal(textOf(await call("get_mobile_words", { name: "caveat", framework: "swiftui" })), 'MOBILE get_mobile_words {"name":"caveat","framework":"swiftui"}');
    assert.equal(textOf(await call("validate_mobile_usage", { framework: "flutter", code: "x" })), 'MOBILE validate_mobile_usage {"framework":"flutter","code":"x"}');
    assert.equal(textOf(await call("search_patterns", { query: "dashboard" })), 'WEB search_patterns {"query":"dashboard"}');
  });

  test("list_components without framework: web list, then a short mobile section", async () => {
    const text = textOf(await call("list_components", {}));
    assert.ok(text.startsWith("WEB LIST"));
    assert.match(text, /## Mobile \(SwiftUI, Compose, Flutter, React Native\) — pass framework/);
    assert.match(text, /- Component: PromptComposer \(`prompt-composer`\)/);
    assert.match(text, /- Pattern: Initial CTA \(`initial-cta`\)/);
    assert.ok(text.indexOf("WEB LIST") < text.indexOf("## Mobile"));
    // With a mobile framework: the mobile list only. With a mobile-only kind: mobile too.
    assert.match(textOf(await call("list_components", { framework: "compose" })), /^Nucleux Mobile/);
    assert.match(textOf(await call("list_components", { kind: "pattern" })), /^Nucleux Mobile/);
    assert.equal(textOf(await call("list_components", { kind: "infrastructure" })), "WEB LIST: Button, InitialCta");
  });

  test("search_components without framework searches both, labelled by platform", async () => {
    const text = textOf(await call("search_components", { query: "composer" }));
    assert.match(text, /^## Web \(React — shadcn and Material 3\)\n\nWEB SEARCH composer/);
    assert.match(text, /## Mobile \(SwiftUI, Compose, Flutter, React Native\) — pass framework to get_component\n\nMOBILE SEARCH composer$/);
    assert.equal(textOf(await call("search_components", { query: "composer", framework: "react-native" })), "MOBILE SEARCH composer");
  });

  test("get_component without framework: web first, mobile for a mobile-only name", async () => {
    const webHit = textOf(await call("get_component", { name: "InitialCta" }));
    assert.match(webHit, /^WEB get_component/);
    assert.match(webHit, /Nucleux Mobile also has Initial CTA \(`initial-cta`, Pattern\)/);
    const mobileOnly = textOf(await call("get_component", { name: "PromptComposer" }));
    assert.match(mobileOnly, /^"PromptComposer" is not a web component; it is in Nucleux Mobile/);
    assert.match(mobileOnly, /pass framework "swiftui", "compose", "flutter" or "react-native" for the exact API/);
    assert.match(mobileOnly, /MOBILE PromptComposer all$/);
    const neither = textOf(await call("get_component", { name: "Nope" }));
    assert.match(neither, /^Nucleux has no "Nope"/);
  });

  test("usage records which upstream answered", async () => {
    await call("get_component", { name: "PromptComposer", framework: "swiftui" });
    await call("search_patterns", { query: "x" });
    await call("search_components", { query: "x" });
    const rows = srv.db.all("SELECT tool, upstream FROM usage ORDER BY id DESC LIMIT 3").reverse().map((r) => ({ ...r }));
    assert.deepEqual(rows, [
      { tool: "get_component", upstream: "mobile" },
      { tool: "search_patterns", upstream: "web" },
      { tool: "search_components", upstream: "web+mobile" },
    ]);
  });

  test("health reports the mobile catalog", async () => {
    const body = await (await fetch(`${srv.url}/health`)).json();
    assert.deepEqual(body.mobile, { version: "0.1.0", components: 2 });
  });
});

describe("anonymous (NUCLEUX_AUTH=optional): web only, exactly as before", () => {
  let srv, web, mobile;
  before(async () => {
    web = fakeWebUpstream();
    mobile = fakeMobileUpstream();
    srv = await startServer({ NUCLEUX_AUTH: "optional" }, { upstream: web, mobile });
  });
  after(() => srv.close());

  test("web instructions and tools, untouched", async () => {
    assert.equal((await rpc(srv, "initialize", INIT)).body.result.instructions, "WEB INSTRUCTIONS");
    const tools = (await rpc(srv, "tools/list", {})).body.result.tools;
    assert.deepEqual(tools, await web.listTools());
  });

  test("calls go to web, even with a mobile framework", async () => {
    mobile.calls.length = 0;
    await rpc(srv, "tools/call", { name: "get_component", arguments: { name: "PromptComposer", framework: "swiftui" } });
    await rpc(srv, "tools/call", { name: "list_components", arguments: {} });
    await rpc(srv, "tools/call", { name: "get_mobile_words", arguments: { name: "caveat" } });
    assert.equal(mobile.calls.length, 0);
    const rows = srv.db.all("SELECT upstream FROM usage");
    assert.ok(rows.every((r) => r.upstream === "web"));
  });

  test("NUCLEUX_AUTH=off is anonymous too", async () => {
    const off = await startServer({ NUCLEUX_AUTH: "off" }, { upstream: fakeWebUpstream(), mobile: fakeMobileUpstream() });
    try {
      assert.equal((await rpc(off, "initialize", INIT)).body.result.instructions, "WEB INSTRUCTIONS");
      const names = (await rpc(off, "tools/list", {})).body.result.tools.map((t) => t.name);
      assert.ok(!names.includes("get_mobile_spec"));
    } finally {
      await off.close();
    }
  });
});

describe("no mobile bundle: web only, health says unavailable", () => {
  let srv, token, web;
  before(async () => {
    web = fakeWebUpstream();
    const mobile = createMobileUpstream({ file: "vendor/does-not-exist.cjs" });
    assert.equal(mobile.available, false);
    srv = await startServer({ NUCLEUX_AUTH: "required" }, { upstream: web, mobile });
    token = await tokenFor(srv);
  });
  after(() => srv.close());

  test("signed-in users get the web surface unchanged", async () => {
    assert.equal((await rpc(srv, "initialize", INIT, token)).body.result.instructions, "WEB INSTRUCTIONS");
    const tools = (await rpc(srv, "tools/list", {}, token)).body.result.tools;
    assert.deepEqual(tools, await web.listTools());
  });

  test("health", async () => {
    const body = await (await fetch(`${srv.url}/health`)).json();
    assert.equal(body.status, "ok");
    assert.equal(body.mobile, "unavailable");
  });
});

describe("a broken mobile child does not take web down", () => {
  let srv, token;
  before(async () => {
    const mobile = {
      ...fakeMobileUpstream(),
      listTools: async () => {
        throw new Error("child died");
      },
      info: async () => null,
    };
    srv = await startServer({ NUCLEUX_AUTH: "required" }, { upstream: fakeWebUpstream(), mobile });
    token = await tokenFor(srv);
  });
  after(() => srv.close());

  test("web instructions and tools, health unavailable", async () => {
    assert.equal((await rpc(srv, "initialize", INIT, token)).body.result.instructions, "WEB INSTRUCTIONS");
    const names = (await rpc(srv, "tools/list", {}, token)).body.result.tools.map((t) => t.name);
    assert.ok(!names.includes("get_mobile_spec"));
    const res = await rpc(srv, "tools/call", { name: "get_component", arguments: { name: "Button" } }, token);
    assert.match(textOf(res), /^WEB get_component/);
    assert.equal((await (await fetch(`${srv.url}/health`)).json()).mobile, "unavailable");
  });
});
