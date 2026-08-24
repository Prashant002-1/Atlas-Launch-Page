// Bake p5.brush plates into draw-on PNG sequences with alpha.
import puppeteer from "puppeteer-core";
import { mkdirSync } from "fs";
import { resolve } from "path";

const SHELL = resolve(
  "node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/headless_shell"
);
const FRAMES = 26;

const browser = await puppeteer.launch({
  executablePath: SHELL,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
});
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 900 });
await page.goto("file://" + resolve("bake/bake.html"));
await page.waitForFunction("window.ready === true", { timeout: 30000 });

const names = await page.evaluate("window.plateNames");
const opCounts = await page.evaluate("window.plateOps");
console.log("plates:", names, opCounts);

for (const name of names) {
  mkdirSync(`public/plates/${name}`, { recursive: true });
  const ops = opCounts[name];
  for (let i = 0; i < FRAMES; i++) {
    const k = Math.ceil((ops * (i + 1)) / FRAMES);
    await page.evaluate(`window.bake(${JSON.stringify(name)}, ${k})`);
    const canvas = await page.$("canvas");
    await canvas.screenshot({
      path: `public/plates/${name}/f${String(i).padStart(2, "0")}.png`,
      omitBackground: true,
    });
  }
  console.log("baked", name);
}
await browser.close();
console.log("done");
