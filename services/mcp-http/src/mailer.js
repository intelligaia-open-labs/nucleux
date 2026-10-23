// Outgoing mail for email sign-in: SMTP via nodemailer (Google Workspace by
// default). Tests inject a fake with the same `send({ to, subject, text, html })`.

import nodemailer from "nodemailer";
import { e } from "./pages.js";

export function createMailer({ host, port, secure, user, pass, from }) {
  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure, // never send a code over plain SMTP
    auth: { user, pass },
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return {
    async send({ to, subject, text, html }) {
      await transport.sendMail({ from, to, subject, text, html });
    },
    verify: () => transport.verify(),
  };
}

// The sign-in email: the code, a one-click link, the expiry, and "ignore it".
export function signInEmail({ code, link, base }) {
  const host = new URL(base).host;
  const subject = `${code} is your Nucleux sign-in code`;
  const text = [
    `Your Nucleux sign-in code is: ${code}`,
    ``,
    `Enter it on the page where you asked for it, or sign in with this link:`,
    link,
    ``,
    `The code and the link expire in 10 minutes and work once.`,
    ``,
    `Didn't ask for this? Ignore this email — nobody can sign in without the code.`,
    ``,
    `— Nucleux MCP (${host})`,
  ].join("\n");
  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#f6f6f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1917">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border:1px solid #e7e5e4;border-radius:12px">
<tr><td style="padding:28px 28px 8px">
  <p style="margin:0 0 4px;font-size:14px;color:#78716c">Nucleux MCP</p>
  <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3">Your sign-in code</h1>
  <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${e(code)}</p>
  <p style="margin:0 0 20px;font-size:15px;line-height:1.5">Enter it on the page where you asked for it, or sign in with one click:</p>
  <p style="margin:0 0 24px"><a href="${e(link)}" style="display:inline-block;padding:10px 18px;background:#1c1917;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600">Sign in to Nucleux</a></p>
  <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#57534e">The code and the link expire in 10 minutes and work once.</p>
  <p style="margin:0 0 24px;font-size:13px;line-height:1.5;color:#57534e">Didn't ask for this? Ignore this email — nobody can sign in without the code.</p>
</td></tr></table>
<p style="margin:16px 0 0;font-size:12px;color:#a8a29e">${e(host)}</p>
</td></tr></table>
</body></html>`;
  return { subject, text, html };
}
