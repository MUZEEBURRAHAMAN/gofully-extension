import { test, expect } from "../fixtures/extension";

test.describe("18 - Shortcut settings", () => {
  test("TC-SET-SC-001: Settings lists every GoFully command and flags any with no key", async ({
    context, extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/settings.html`);
    await page.waitForLoadState("domcontentloaded");

    const rows = page.locator("#chromeShortcutRows .shortcut-row");
    await expect(rows).toHaveCount(5); // open popup + 3 capture commands + draw on page
    await expect(rows.filter({ hasText: "Draw on this page" }).locator("kbd")).toHaveText("NOT SET");
    await expect(rows.filter({ hasText: "Draw on this page" }).locator("kbd")).toHaveClass(/unset/);
    await expect(rows.filter({ hasText: "Capture full page" })).toHaveCount(1);

    // The page never claims a binding that Chrome doesn't have: every row's key text
    // matches what chrome.commands reports.
    const real = await page.evaluate(async () =>
      (await chrome.commands.getAll()).map((c) => ({
        label: c.name === "_execute_action" ? "Open GoFully" : c.description,
        s: c.shortcut,
      })));
    for (const c of real) {
      const kbd = rows.filter({ hasText: c.label! }).locator("kbd");
      await expect(kbd).toHaveText(c.s ? c.s.toUpperCase() : "NOT SET");
    }

    await expect(page.locator("#changeChromeShortcutsBtn")).toBeVisible();
    await page.close();
  });
});
