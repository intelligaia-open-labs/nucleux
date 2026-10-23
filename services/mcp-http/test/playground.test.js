// POST /playground: the Playground's planner, backed by Yantra (yantra.js).
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "./helpers.js";
import { createYantra, contentOf, parsePlan } from "../src/yantra.js";

const PATTERNS = [
  { id: "open-input", name: "Open input", summary: "a free-text prompt box" },
  { id: "consent", name: "Consent", summary: "ask before acting" },
  { id: "suggestions", name: "Suggestions", summary: "starter prompts" },
];
const ORIGIN = "https://nucleux.test";
const post = (srv, body, origin = ORIGIN) =>
  fetch(`${srv.url}/playground`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(origin ? { origin } : {}) },
    body: JSON.stringify(body),
  });

// A fake gateway that answers like Ollama's /api/chat and records requests.
function fakeGateway(reply) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    if (reply instanceof Error) throw reply;
    if (typeof reply === "number") return new Response("nope", { status: reply });
    return new Response(typeof reply === "string" ? reply : JSON.stringify({ message: { role: "assistant", content: JSON.stringify(reply) }, done: true }));
  };
  return { calls, yantra: createYantra({ url: "https://yantra.test/v1/chat", key: "k-secret", model: "m1", fetchImpl }) };
}

describe("POST /playground with Yantra", () => {
  let srv, gw;
  before(async () => {
    gw = fakeGateway({
      reply: "A chat screen with a prompt box and starters.",
      title: "Chat",
      picks: [{ id: "open-input", why: "the input" }, { id: "made-up" }, { id: "suggestions" }, { id: "open-input" }],
    });
    srv = await startServer({}, { yantra: gw.yantra, limits: { playground: { max: 3 } } });
  });
  after(() => srv.close());

  test("returns the plan, keeping only catalog ids, once each", async () => {
    const res = await post(srv, { prompt: "a chat app", patterns: PATTERNS });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      reply: "A chat screen with a prompt box and starters.",
      title: "Chat",
      picks: [{ id: "open-input", why: "the input" }, { id: "suggestions", why: "" }],
    });
  });

  test("calls the gateway with the key, model, no streaming or thinking, JSON format", () => {
    const { url, init, body } = gw.calls[0];
    assert.equal(url, "https://yantra.test/v1/chat");
    assert.equal(init.headers.authorization, "Bearer k-secret");
    assert.equal(body.model, "m1");
    assert.equal(body.stream, false);
    assert.equal(body.think, false);
    assert.equal(body.format, "json");
    assert.match(body.messages[1].content, /open-input \| Open input \| a free-text prompt box/);
    assert.match(body.messages[1].content, /Request: a chat app$/);
  });

  test("rejects other origins, empty requests, and too many requests", async () => {
    assert.equal((await post(srv, { prompt: "x", patterns: PATTERNS }, "https://evil.test")).status, 403);
    assert.equal((await post(srv, { prompt: "x", patterns: PATTERNS }, null)).status, 403);
    assert.equal((await post(srv, { prompt: "", patterns: PATTERNS })).status, 400);
    assert.equal((await post(srv, { prompt: "x", patterns: [] })).status, 400);
    assert.equal((await post(srv, { prompt: "x", patterns: PATTERNS })).status, 429); // 4th counted call this hour (max 3)
  });
});

describe("POST /playground without Yantra, or when it fails", () => {
  test("503 when no key is configured", async () => {
    const srv = await startServer();
    try {
      assert.equal((await post(srv, { prompt: "x", patterns: PATTERNS })).status, 503);
    } finally {
      await srv.close();
    }
  });

  for (const [name, reply] of [["an HTTP error", 500], ["a network error", new Error("down")], ["non-JSON content", JSON.stringify({ message: { content: "sorry" } })]]) {
    test(`502 on ${name}, and the key never reaches the page`, async () => {
      const srv = await startServer({}, { yantra: fakeGateway(reply).yantra });
      try {
        const res = await post(srv, { prompt: "x", patterns: PATTERNS });
        assert.equal(res.status, 502);
        assert.doesNotMatch(await res.text(), /k-secret/);
      } finally {
        await srv.close();
      }
    });
  }
});

describe("reading Yantra's replies", () => {
  test("NDJSON chunks are joined; OpenAI-style replies work too", () => {
    const nd = ['{"message":{"content":"{\\"pic"},"done":false}', '{"message":{"content":"ks\\":[]}"},"done":false}', '{"message":{"content":""},"done":true}'].join("\n");
    assert.equal(contentOf(nd), '{"picks":[]}');
    assert.equal(contentOf(JSON.stringify({ choices: [{ message: { content: "{}" } }] })), "{}");
  });
  test("JSON inside prose or a code fence, and string picks", () => {
    assert.deepEqual(parsePlan('Sure!\n```json\n{"picks":["consent"],"reply":"ok"}\n```').picks, [{ id: "consent", why: "" }]);
  });
  test("no URL or key = no planner", () => {
    assert.equal(createYantra({ url: "https://y", key: "" }), null);
  });
});
