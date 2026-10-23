import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { startServer, fakeMailer, browser, csrfFrom, pkce, local } from "./helpers.js";

const SMTP = { SMTP_USER: "auth@nucleux.test", SMTP_PASS: "app-password" };

// Signed-out browser: load /connect (gets the pre-session cookie + CSRF), ask for a code.
async function startEmail(srv, b, email, next) {
  const page = await (await b.get(next ? `/connect?next=${encodeURIComponent(next)}` : "/connect")).text();
  const form = { _csrf: csrfFrom(page), email };
  if (next) form.next = next;
  return b.post("/auth/email/start", form);
}

async function checkPage(b) {
  const res = await b.get("/auth/email/verify");
  return { res, html: await res.text() };
}

const verify = async (b, code) => {
  const { html } = await checkPage(b);
  return b.post("/auth/email/verify", { _csrf: csrfFrom(html), code });
};

describe("email sign-in", () => {
  let srv, mail;
  before(async () => {
    mail = fakeMailer();
    // Every request comes from 127.0.0.1: lift the per-IP send limit (tested on its own below).
    srv = await startServer(SMTP, { mailer: mail, limits: { emailSend: { max: 1000 } } });
  });
  after(() => srv.close());

  test("signed-out page shows the email form under the providers", async () => {
    const res = await browser(srv).get("/connect");
    const html = await res.text();
    assert.match(html, /Continue with Fake/);
    assert.match(html, /class="or-divider"/);
    assert.match(html, /<label for="email" class="label">Email address<\/label>/);
    assert.match(html, /action="\/mcp\/auth\/email\/start"/);
    assert.match(html, /Email me a code/);
    assert.match(res.headers.getSetCookie().join(), /nx_pre=/);
  });

  test("start -> email captured -> verify -> session, user is provider email", async () => {
    const b = browser(srv);
    const start = await startEmail(srv, b, "  Carol.Smith@Example.COM ");
    assert.equal(start.status, 303);
    assert.equal(start.headers.get("location"), "https://nucleux.test/mcp/auth/email/verify");

    const m = mail.last();
    assert.equal(m.to, "carol.smith@example.com");
    const code = mail.codeOf();
    assert.match(code, /^\d{6}$/);
    assert.match(m.subject, new RegExp(code));
    assert.match(m.text, /expire in 10 minutes/);
    assert.match(m.text, /Didn't ask for this\? Ignore this email/);
    assert.match(m.html, new RegExp(`>${code}<`));
    assert.match(m.html, /href="https:\/\/nucleux.test\/mcp\/auth\/email\/link\?t=/);

    const { html } = await checkPage(b);
    assert.match(html, /Check your email/);
    assert.match(html, /carol.smith@example.com/);
    assert.match(html, /inputmode="numeric"/);
    assert.match(html, /autocomplete="one-time-code"/);
    assert.match(html, /Resend code/);
    assert.match(html, /Use a different email/);

    // Codes and links are stored only as hashes.
    const row = srv.db.get("SELECT * FROM email_codes ORDER BY id DESC LIMIT 1");
    assert.doesNotMatch(JSON.stringify(row), new RegExp(`"${code}"|:${code}`));

    const res = await verify(b, `${code.slice(0, 3)} ${code.slice(3)}`); // spaces are fine
    assert.equal(res.status, 303);
    assert.equal(res.headers.get("location"), "https://nucleux.test/mcp/connect");
    const cookie = res.headers.getSetCookie().find((c) => c.startsWith("nx_session="));
    assert.match(cookie, /Path=\/mcp; SameSite=Lax; Max-Age=2592000; HttpOnly; Secure/);
    assert.match(await (await b.get("/connect")).text(), /Signed in as carol.smith@example.com/);

    const user = srv.db.get("SELECT * FROM users WHERE email = 'carol.smith@example.com'");
    assert.equal(user.provider, "email");
    assert.equal(user.provider_id, "carol.smith@example.com");
    assert.equal(user.name, "carol.smith");

    // The code is single use.
    assert.equal((await b.post("/auth/email/verify", { code })).status, 400);
  });

  test("invalid addresses are refused with an accessible error", async () => {
    for (const email of ["", "nope", "a@b", "a@@b.com", "a b@c.com", "x@-bad.com", ".a@b.com"]) {
      const b = browser(srv);
      const res = await startEmail(srv, b, email);
      assert.equal(res.status, 400, email);
      const html = await res.text();
      assert.match(html, /aria-invalid="true" aria-describedby="email-error" autofocus/);
      assert.match(html, /<div id="email-error" class="field-error" role="alert" aria-live="assertive">Enter a valid email/);
    }
  });

  test("five wrong codes lock the flow", async () => {
    const b = browser(srv);
    await startEmail(srv, b, "dave@example.com");
    const code = mail.codeOf();
    const wrong = code === "000000" ? "111111" : "000000";
    for (let left = 4; left >= 1; left--) {
      const res = await verify(b, wrong);
      assert.equal(res.status, 400);
      const html = await res.text();
      assert.match(html, new RegExp(`That code isn&#39;t right. ${left} (tries|try) left.`));
      assert.match(html, /aria-invalid="true"/);
    }
    const fifth = await verify(b, wrong);
    assert.equal(fifth.status, 429);
    assert.match(await fifth.text(), /Too many wrong codes/);
    // Even the right code no longer works.
    const right = await b.post("/auth/email/verify", { _csrf: csrfFrom((await checkPage(b)).html), code });
    assert.equal(right.status, 429);
    assert.equal(right.headers.getSetCookie().some((c) => c.startsWith("nx_session=")), false);
    const { html } = await checkPage(b);
    assert.match(html, /Send a new code/);
    assert.doesNotMatch(html, /name="code"/);
  });

  test("expired codes are refused", async () => {
    const b = browser(srv);
    await startEmail(srv, b, "erin@example.com");
    const code = mail.codeOf();
    const { html } = await checkPage(b);
    srv.advance(10 * 60 * 1000 + 1);
    const res = await b.post("/auth/email/verify", { _csrf: csrfFrom(html), code });
    assert.equal(res.status, 400);
    assert.match(await res.text(), /expired or was already used/);
  });

  test("the code only works in the browser that asked for it", async () => {
    const b = browser(srv);
    await startEmail(srv, b, "frank@example.com");
    const code = mail.codeOf();
    const other = browser(srv);
    const page = await (await other.get("/connect")).text();
    const res = await other.post("/auth/email/verify", { _csrf: csrfFrom(page), code });
    assert.equal(res.status, 400);
    assert.equal(res.headers.getSetCookie().some((c) => c.startsWith("nx_session=")), false);
  });

  test("CSRF: forms without the token or from another origin are refused", async () => {
    const b = browser(srv);
    await b.get("/connect");
    assert.equal((await b.post("/auth/email/start", { email: "gina@example.com" })).status, 403);
    assert.equal((await b.post("/auth/email/start", { email: "gina@example.com", _csrf: "forged" })).status, 403);
    const page = await (await b.get("/connect")).text();
    const cross = await b.post("/auth/email/start", { email: "gina@example.com", _csrf: csrfFrom(page) }, { origin: "https://evil.test" });
    assert.equal(cross.status, 403);
    // A token minted for another browser's cookie doesn't work either.
    const other = await (await browser(srv).get("/connect")).text();
    assert.equal((await b.post("/auth/email/start", { email: "gina@example.com", _csrf: csrfFrom(other) })).status, 403);
    assert.equal(mail.sent.filter((m) => m.to === "gina@example.com").length, 0);
  });

  test("link sign-in: one click in the same browser, single use", async () => {
    const b = browser(srv);
    await startEmail(srv, b, "hank@example.com", "/admin");
    const link = local(srv, mail.linkOf());
    const res = await b.get(link);
    assert.equal(res.status, 303);
    assert.equal(res.headers.get("location"), "https://nucleux.test/mcp/admin");
    assert.ok(res.headers.getSetCookie().some((c) => c.startsWith("nx_session=")));
    // Used: the link and the code are both spent.
    const again = await browser(srv).get(link);
    assert.equal(again.status, 400);
    assert.match(await again.text(), /expired or was already used/);
  });

  test("link opened elsewhere (or by a mail scanner) needs a confirming POST", async () => {
    const b = browser(srv);
    await startEmail(srv, b, "ivy@example.com");
    const link = local(srv, mail.linkOf());

    const phone = browser(srv);
    const res = await phone.get(link);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Sign in as ivy@example.com\?/);
    assert.equal(res.headers.getSetCookie().some((c) => c.startsWith("nx_session=")), false);
    // A prefetch didn't burn it: still live.
    assert.equal((await browser(srv).get(link)).status, 200);

    const t = new URL(link, "http://x").searchParams.get("t");
    assert.equal((await phone.post("/auth/email/link", { t })).status, 403); // no CSRF
    const ok = await phone.post("/auth/email/link", { t, _csrf: csrfFrom(html) });
    assert.equal(ok.status, 303);
    assert.ok(ok.headers.getSetCookie().some((c) => c.startsWith("nx_session=")));
    // The code from the same email is now spent too.
    const spent = await verify(b, mail.codeOf());
    assert.equal(spent.status, 400);
  });

  test("next is preserved through OAuth authorize", async () => {
    const redirectUri = "https://claude.test/cb";
    const reg = await fetch(`${srv.url}/oauth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ client_name: "Claude", redirect_uris: [redirectUri] }),
    });
    const client = await reg.json();
    const { challenge } = pkce();
    const q = new URLSearchParams({ response_type: "code", client_id: client.client_id, redirect_uri: redirectUri, code_challenge: challenge, code_challenge_method: "S256", state: "s1" });

    const b = browser(srv);
    const toSignIn = await b.get(`/oauth/authorize?${q}`);
    assert.equal(toSignIn.status, 302);
    const signInPath = local(srv, toSignIn.headers.get("location"));
    const signInPage = await (await b.get(signInPath)).text();
    const next = new URL(signInPath, "http://x").searchParams.get("next");
    assert.match(signInPage, new RegExp(`name="next" value="${next.replace(/[?]/g, "\\?").replace(/&/g, "&amp;")}"`));

    const start = await b.post("/auth/email/start", { _csrf: csrfFrom(signInPage), email: "jill@example.com", next });
    assert.equal(start.status, 303);
    const done = await verify(b, mail.codeOf());
    assert.equal(done.status, 303);
    assert.equal(done.headers.get("location"), `https://nucleux.test/mcp/oauth/authorize?${q}`);
    const consent = await (await b.get(`/oauth/authorize?${q}`)).text();
    assert.match(consent, /Allow Claude to use Nucleux as jill@example.com\?/);
  });

  test("an off-site next is dropped", async () => {
    const b = browser(srv);
    await startEmail(srv, b, "kim@example.com", "//evil.test/x");
    const res = await verify(b, mail.codeOf());
    assert.equal(res.headers.get("location"), "https://nucleux.test/mcp/connect");
  });

  test("resend: new code, old one retired", async () => {
    const b = browser(srv);
    await startEmail(srv, b, "liam@example.com");
    const first = mail.codeOf();
    const { html } = await checkPage(b);
    const resend = await b.post("/auth/email/resend", { _csrf: csrfFrom(html) });
    assert.equal(resend.status, 303);
    assert.equal(resend.headers.get("location"), "https://nucleux.test/mcp/auth/email/verify?sent=1");
    assert.match(await (await b.get("/auth/email/verify?sent=1")).text(), /We sent a new code/);
    const second = mail.codeOf();
    assert.equal(mail.last().to, "liam@example.com");
    if (first !== second) {
      // The old code belongs to a retired flow; this browser now waits for the new one.
      assert.equal((await verify(b, first)).status, 400);
    }
    assert.equal((await verify(b, second)).status, 303);
  });

  test("same response for new and existing addresses", async () => {
    const shape = async (email) => {
      const b = browser(srv);
      const res = await startEmail(srv, b, email);
      return [res.status, res.headers.get("location")];
    };
    assert.deepEqual(await shape("carol.smith@example.com"), await shape("never.seen@example.com"));
  });

  test("admin page shows the provider per user", async () => {
    const b = browser(srv);
    await startEmail(srv, b, "root@example.com");
    await verify(b, mail.codeOf());
    const html = await (await b.get("/admin")).text();
    assert.match(html, /carol.smith@example.com · email/);
  });

  test("send failures are reported, not logged with the code", async () => {
    const b = browser(srv);
    mail.fail = true;
    const errors = [];
    const orig = console.error;
    console.error = (...a) => errors.push(a.join(" "));
    try {
      const res = await startEmail(srv, b, "mia@example.com");
      assert.equal(res.status, 503);
      assert.match(await res.text(), /couldn&#39;t send the email/);
    } finally {
      console.error = orig;
      mail.fail = false;
    }
    assert.equal(errors.length, 1);
    assert.doesNotMatch(errors[0], /mia@example.com|\d{6}/);
  });
});

describe("email sign-in limits", () => {
  test("5 codes per address per hour", async () => {
    const mail = fakeMailer();
    const srv = await startServer(SMTP, { mailer: mail });
    try {
      const statuses = [];
      for (let i = 0; i < 6; i++) statuses.push((await startEmail(srv, browser(srv), "nora@example.com")).status);
      assert.deepEqual(statuses, [303, 303, 303, 303, 303, 429]);
      assert.equal(mail.sent.length, 5);
      srv.advance(3600 * 1000 + 1);
      assert.equal((await startEmail(srv, browser(srv), "nora@example.com")).status, 303);
    } finally {
      await srv.close();
    }
  });

  test("per-IP send limit covers start and resend", async () => {
    const mail = fakeMailer();
    const srv = await startServer(SMTP, { mailer: mail, limits: { emailSend: { max: 3 } } });
    try {
      const b = browser(srv);
      assert.equal((await startEmail(srv, b, "a1@example.com")).status, 303);
      assert.equal((await startEmail(srv, b, "a2@example.com")).status, 303);
      const { html } = await checkPage(b);
      assert.equal((await b.post("/auth/email/resend", { _csrf: csrfFrom(html) })).status, 303);
      assert.equal((await b.post("/auth/email/resend", { _csrf: csrfFrom(html) })).status, 429);
      assert.equal((await startEmail(srv, b, "a3@example.com")).status, 429);
      assert.equal(mail.sent.length, 3);
    } finally {
      await srv.close();
    }
  });

  test("allowlist applies to email sign-in", async () => {
    const mail = fakeMailer();
    const srv = await startServer({ ...SMTP, NUCLEUX_ALLOWED_DOMAINS: "example.com", NUCLEUX_ALLOWED_EMAILS: "vip@other.org" }, { mailer: mail });
    try {
      const denied = await startEmail(srv, browser(srv), "eve@other.org");
      assert.equal(denied.status, 403);
      assert.match(await denied.text(), /can&#39;t sign in to this server/);
      assert.equal((await startEmail(srv, browser(srv), "vip@other.org")).status, 303);
      assert.equal((await startEmail(srv, browser(srv), "ok@example.com")).status, 303);
      assert.equal(mail.sent.length, 2);
    } finally {
      await srv.close();
    }
  });
});

describe("email sign-in disabled without SMTP", () => {
  let srv;
  before(async () => (srv = await startServer({})));
  after(() => srv.close());

  test("no form, no divider, routes absent", async () => {
    const html = await (await browser(srv).get("/connect")).text();
    assert.match(html, /Continue with Fake/);
    assert.doesNotMatch(html, /Email me a code|or-divider|name="email"/);
    const res = await fetch(`${srv.url}/auth/email/start`, { method: "POST" });
    assert.equal(res.status, 404);
    assert.equal((await fetch(`${srv.url}/auth/email/link?t=x`)).status, 404);
  });
});
