import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { test, expect } from "../fixtures/extension";

async function seed(serviceWorker: any, label: string) {
  await serviceWorker.evaluate(async (label: string) => {
    const c = new OffscreenCanvas(900, 500);
    const g = c.getContext("2d")!;
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, 900, 500);
    g.fillStyle = "#1667F2"; g.fillRect(0, 0, 900, 60);
    g.fillStyle = "#101828"; g.font = "bold 40px Arial"; g.fillText(label, 40, 150);
    const blob = await c.convertToBlob();
    const r = new FileReader();
    const url = await new Promise<string>((res) => { r.onload = () => res(String(r.result)); r.readAsDataURL(blob); });
    await chrome.storage.session.set({ lastCaptureDataUrl: url });
  }, label);
}

async function addFromEditor(context: any, extensionId: string) {
  const page = await context.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(`chrome-extension://${extensionId}/editor.html`);
  await page.waitForTimeout(700);
  await page.locator("#export-menu-btn").click();
  await page.locator("#guide-btn").click();
  await page.waitForTimeout(500);
  await page.close();
}

test.describe("19 - Guide builder", () => {
  test("TC-GUIDE-001: add steps from the editor, caption, reorder, delete, and export PDF + Markdown bundle", async ({
    context, serviceWorker, extensionId,
  }) => {
    const helper = await context.newPage();
    await helper.goto(`chrome-extension://${extensionId}/popup.html`);
    await helper.evaluate(() => chrome.storage.local.remove("gofullyGuide"));

    await seed(serviceWorker, "Open the dashboard");
    await addFromEditor(context, extensionId);
    await seed(serviceWorker, "Click Settings");
    await addFromEditor(context, extensionId);

    const stored = await helper.evaluate(async () => ((await chrome.storage.local.get("gofullyGuide")) as any).gofullyGuide);
    expect(stored.steps).toHaveLength(2);
    expect(stored.steps[0].img.startsWith("data:image/jpeg")).toBe(true);

    const guide = await context.newPage();
    await guide.goto(`chrome-extension://${extensionId}/guide.html`);
    await expect(guide.locator(".step")).toHaveCount(2);
    await expect(guide.locator("#count")).toHaveText("2 of 30 steps");

    await guide.locator("#title").fill("Change a setting");
    await guide.locator(".step").nth(0).locator("textarea").fill("Open the dashboard from the top bar");
    await guide.locator(".step").nth(1).locator("textarea").fill("Pick Settings");
    await guide.waitForTimeout(600);

    // reorder: step 2 moves up
    await guide.locator(".step").nth(1).locator('button[aria-label="Move up"]').click();
    await expect(guide.locator(".step").nth(0).locator("textarea")).toHaveValue("Pick Settings");
    await expect(guide.locator(".step").nth(1).locator("textarea")).toHaveValue("Open the dashboard from the top bar");

    // captions and order survive a reload
    await guide.reload();
    await expect(guide.locator(".step").nth(0).locator("textarea")).toHaveValue("Pick Settings");
    await expect(guide.locator("#title")).toHaveValue("Change a setting");

    // PDF
    const [pdf] = await Promise.all([guide.waitForEvent("download"), guide.locator("#exportPdf").click()]);
    expect(pdf.suggestedFilename()).toBe("change-a-setting.pdf");
    const pdfBytes = fs.readFileSync((await pdf.path())!);
    expect(pdfBytes.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdfBytes.length).toBeGreaterThan(3000);

    // Markdown bundle: a valid zip with guide.md and one image per step
    const [zip] = await Promise.all([guide.waitForEvent("download"), guide.locator("#exportMd").click()]);
    expect(zip.suggestedFilename()).toBe("change-a-setting.zip");
    const zpath = (await zip.path())!;
    expect(execFileSync("unzip", ["-t", zpath]).toString()).toContain("No errors detected");
    const out = fs.mkdtempSync(path.join(os.tmpdir(), "gf-guide-"));
    execFileSync("unzip", ["-o", "-q", zpath, "-d", out]);
    const md = fs.readFileSync(path.join(out, "guide.md"), "utf8");
    expect(md).toContain("# Change a setting");
    expect(md).toContain("## Step 1\n\nPick Settings\n\n![Step 1](images/step-01.jpg)");
    expect(md).toContain("## Step 2\n\nOpen the dashboard from the top bar");
    expect(fs.readFileSync(path.join(out, "images", "step-02.jpg")).subarray(0, 3).toString("hex")).toBe("ffd8ff");
    fs.rmSync(out, { recursive: true, force: true });

    // delete a step
    await guide.locator(".step").nth(0).locator('button[aria-label="Delete step"]').click();
    await expect(guide.locator(".step")).toHaveCount(1);

    // clear needs confirmation
    guide.once("dialog", (d) => d.accept());
    await guide.locator("#clearAll").click();
    await expect(guide.locator("#empty")).toBeVisible();
    await expect(guide.locator(".step")).toHaveCount(0);

    await helper.evaluate(() => chrome.storage.local.remove("gofullyGuide"));
    await guide.close();
    await helper.close();
  });

  test("TC-GUIDE-002: the capture card path adds the last capture as a step", async ({ context, serviceWorker, extensionId }) => {
    const helper = await context.newPage();
    await helper.goto(`chrome-extension://${extensionId}/popup.html`);
    await helper.evaluate(() => chrome.storage.local.remove("gofullyGuide"));
    // a real capture first, so the service worker has a "last capture"
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("domcontentloaded");
    const cap = await helper.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ url: "http://localhost:8085/test-page-long.html" });
      return chrome.runtime.sendMessage({ type: "START_CAPTURE", payload: { mode: "visible-area", tabId: tab.id } });
    });
    expect(cap.type).toBe("CAPTURE_COMPLETE");

    const res = await helper.evaluate(() => chrome.runtime.sendMessage({ type: "GUIDE_ADD_LAST_CAPTURE" }));
    expect(res).toEqual({ ok: true, count: 1 });
    const steps = await helper.evaluate(async () => ((await chrome.storage.local.get("gofullyGuide")) as any).gofullyGuide.steps);
    expect(steps[0].url).toContain("test-page-long.html");

    await helper.evaluate(() => chrome.storage.local.remove("gofullyGuide"));
    await helper.close();
    await page.close();
  });
});
