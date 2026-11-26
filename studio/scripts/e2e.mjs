// End-to-end smoke test against a running dev server + worker (ENABLE_MOCK_PROVIDER=true).
// Usage: node scripts/e2e.mjs <screenshot-dir>   (needs Playwright + Chromium)
import { createRequire } from "node:module"; const { chromium } = createRequire(import.meta.url)("playwright");
const S = process.argv[2] ?? "/tmp"; const SAMPLE_VIDEO = process.env.SAMPLE_VIDEO ?? "../01.mp4.MOV";
const base = "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 920 } });
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200)); });
const step = async (name, fn) => { const t = Date.now(); try { await fn(); console.log("OK  ", name, Date.now() - t, "ms"); } catch (e) { console.log("FAIL", name, e.message.split("\n")[0]); await page.screenshot({ path: `${S}/fail-${name.replace(/\W+/g, "_")}.png` }); } };
const email = `t${Date.now()}@lumora.local`;
await step("signup", async () => {
  await page.goto(base + "/signup");
  await page.fill('input[autocomplete="name"]', "Test User");
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', "password123");
  await page.click('button[type=submit]');
  await page.waitForURL("**/home", { timeout: 60000 });
});
await step("home renders", async () => { await page.getByText("Recent projects").waitFor(); await page.screenshot({ path: `${S}/home.png` }); });
let pid;
await step("create from template", async () => {
  const r = await page.evaluate(async () => (await fetch("/api/projects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ templateId: "product-launch", aspect: "16:9" }) })).json());
  pid = r.id;
  await page.goto(`${base}/editor/${pid}`);
  await page.getByText("Export").first().waitFor({ timeout: 90000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${S}/editor.png` });
});
await step("add text from panel", async () => {
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await page.getByText("Neon", { exact: true }).click();
  await page.waitForTimeout(500);
  const n = await page.evaluate(() => document.querySelectorAll('[title*="Neon"]').length);
  if (!n) throw new Error("neon clip not on timeline");
});
await step("autosave", async () => {
  await page.getByText("Saved").first().waitFor({ timeout: 15000 });
});
await step("assistant (local parser)", async () => {
  await page.getByRole("button", { name: "AI", exact: true }).click();
  await page.getByText("Make the color grading warmer").click();
  await page.getByRole("button", { name: "Apply" }).click({ timeout: 20000 });
  await page.getByText("Applied").first().waitFor();
});
await step("undo/redo", async () => {
  await page.keyboard.press("Escape");
  await page.locator("body").click({ position: { x: 5, y: 5 } }).catch(() => {});
  await page.keyboard.press("Control+z");
  await page.keyboard.press("Control+Shift+z");
});
await step("upload video (chunked)", async () => {
  await page.getByRole("button", { name: "Media", exact: true }).click();
  const input = page.locator('input[type=file]').first();
  await input.setInputFiles(SAMPLE_VIDEO);
  await page.getByText("Uploaded 01.mp4.MOV").waitFor({ timeout: 120000 });
});
await step("add uploaded video to timeline", async () => {
  await page.locator('[title^="01.mp4.MOV"]').first().hover();
  await page.locator('button[title="Add at playhead"]').first().click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${S}/editor-video.png` });
});
await step("export render", async () => {
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const dlg = page.getByRole("dialog");
  await dlg.getByRole("button", { name: "720p", exact: true }).click();
  await dlg.getByRole("button", { name: "Draft", exact: true }).click();
  await dlg.getByRole("button", { name: "Render", exact: true }).click();
  await dlg.getByRole("link", { name: "Download" }).waitFor({ timeout: 300000 });
  await page.screenshot({ path: `${S}/export-done.png` });
});
await step("mock AI generation", async () => {
  const r = await page.evaluate(async () => (await fetch("/api/ai/jobs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider: "mock", model: "mock-image", capability: "text-to-image", input: { prompt: "test image", aspectRatio: "16:9" } }) })).json());
  if (!r.job) throw new Error(JSON.stringify(r));
  for (let i = 0; i < 30; i++) { const j = await page.evaluate(async (id) => (await fetch("/api/ai/jobs/" + id)).json(), r.job.id); if (j.job.status === "SUCCEEDED") return; if (j.job.status === "FAILED") throw new Error(j.job.error); await page.waitForTimeout(1000); }
  throw new Error("timeout");
});
await step("ai studio basic plan + build", async () => {
  await page.goto(base + "/ai-studio");
  await page.getByText("Create a 20-second premium").first().click();
  await page.getByRole("button", { name: "Generate storyboard" }).click();
  await page.getByText("Basic planner (no AI)").waitFor({ timeout: 30000 });
  await page.screenshot({ path: `${S}/ai-studio.png`, fullPage: true });
  await page.getByRole("button", { name: /Build timeline/ }).click();
  await page.waitForURL("**/editor/**", { timeout: 60000 });
  await page.getByText("Export").first().waitFor({ timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${S}/editor-ai.png` });
});
for (const p of ["/projects", "/templates", "/motion", "/image", "/animation", "/audio", "/brand", "/assets", "/exports", "/settings", "/editor"]) {
  await step("page " + p, async () => { const res = await page.goto(base + p); if (res.status() >= 400) throw new Error("status " + res.status()); await page.waitForTimeout(800); });
}
await page.goto(base + "/motion"); await page.waitForTimeout(1500); await page.screenshot({ path: `${S}/motion.png` });
console.log("errors:", [...new Set(errors)].slice(0, 15).join("\n"));
await browser.close();
