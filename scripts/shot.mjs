// Screenshot util — controla a espera (waitUntil:'load') p/ não travar como o harness.
// uso: node scripts/shot.mjs <url> <out.png> [light|dark] [width] [height] [full|fold]
import { chromium } from "playwright";

const [, , url, out, mode = "light", w = "1440", h = "900", crop = "full"] =
  process.argv;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: +w, height: +h },
  deviceScaleFactor: 2,
});
if (mode === "dark") {
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("theme", "dark");
    } catch {}
  });
}
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(700); // deixa fontes/paint assentarem
await page.screenshot({ path: out, fullPage: crop === "full" });
await browser.close();
console.log("shot ->", out);
