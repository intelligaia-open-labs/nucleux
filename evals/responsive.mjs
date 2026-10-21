#!/usr/bin/env node
// Responsive check for a running app: screenshots each hash route at desktop
// (1280px) and phone (390px, mobile emulation) and reports horizontal overflow
// (document wider than the viewport). Uses a local Chrome via puppeteer-core:
//
//   npm i -g puppeteer-core   (or: npx -p puppeteer-core node evals/responsive.mjs …)
//   node evals/responsive.mjs http://localhost:4173 ./shots/app home,projects,settings
//
// Note: `chrome --headless --window-size=390,…` cannot measure phones. Headless
// Chrome clamps the viewport to 500px and crops the screenshot, which looks
// like overflow. This script uses device emulation instead.
const [base, prefix, routes] = process.argv.slice(2);
if (!base || !prefix || !routes) {
  console.error("usage: node evals/responsive.mjs <baseUrl> <outPrefix> <route,route,...>  (route 'home' = /)");
  process.exit(1);
}
let puppeteer;
try {
  puppeteer = (await import("puppeteer-core")).default;
} catch {
  console.error("puppeteer-core is not installed: npm i -g puppeteer-core");
  process.exit(1);
}
const executablePath =
  process.env.CHROME_PATH ??
  { darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", linux: "/usr/bin/google-chrome" }[process.platform];

const browser = await puppeteer.launch({ executablePath });
const page = await browser.newPage();
const results = [];
for (const [width, height, mobile] of [[1280, 900, false], [390, 844, true]]) {
  await page.setViewport({ width, height, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  for (const route of routes.split(",")) {
    // The query string forces a full load per route (a hash-only change would not).
    await page.goto(`${base}/?r=${route}#/${route === "home" ? "" : route}`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1200));
    const m = await page.evaluate(() => ({ vw: innerWidth, sw: document.documentElement.scrollWidth }));
    await page.screenshot({ path: `${prefix}-${route}-${width}.png` });
    results.push({ route, width, overflowPx: Math.max(0, m.sw - m.vw) });
  }
}
await browser.close();
console.log(JSON.stringify({ overflowing: results.filter((r) => r.overflowPx > 0).length, results }, null, 2));
