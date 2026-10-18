import { test, expect } from "@playwright/test";
import { buildGuideMarkdown, guideSlug, guideTitle } from "../../src/export/guide-export";
import { dataUrlToBytes, buildZip } from "../../src/export/zip";

const step = (caption: string) => ({ id: "s", img: "data:image/jpeg;base64,AAAA", w: 10, h: 10, caption, url: "", ts: 0 });

test.describe("Guide export helpers", () => {
  test("slug: lowercases, collapses symbols, trims, caps at 60, falls back", () => {
    expect(guideSlug("Change a Setting!")).toBe("change-a-setting");
    expect(guideSlug("  --Hello___World--  ")).toBe("hello-world");
    expect(guideSlug("")).toBe("guide");
    expect(guideSlug("日本語")).toBe("guide");
    expect(guideSlug("x".repeat(200)).length).toBe(60);
  });
  test("title falls back when blank", () => {
    expect(guideTitle({ title: "   ", steps: [] })).toBe("Step-by-step guide");
    expect(guideTitle({ title: " Setup ", steps: [] })).toBe("Setup");
  });
  test("markdown: numbered steps, captions optional, image paths zero-padded", () => {
    const md = buildGuideMarkdown({ title: "T", steps: [step("Open it"), step("")] });
    expect(md).toContain("# T");
    expect(md).toContain("## Step 1\n\nOpen it\n\n![Step 1](images/step-01.jpg)");
    expect(md).toContain("## Step 2\n\n![Step 2](images/step-02.jpg)");
    expect(md).not.toContain("undefined");
  });
  test("markdown: empty guide still has a title", () => {
    expect(buildGuideMarkdown({ title: "", steps: [] })).toContain("# Step-by-step guide");
  });
  test("dataUrlToBytes decodes base64", () => {
    expect([...dataUrlToBytes("data:image/png;base64,AQID")]).toEqual([1, 2, 3]);
  });
  test("zip: empty file list and unicode names still yield a valid archive header/footer", async () => {
    const empty = new Uint8Array(await buildZip([]).arrayBuffer());
    expect(empty.length).toBe(22);
    const z = new Uint8Array(await buildZip([{ name: "é/ü.txt", data: new Uint8Array([1]) }]).arrayBuffer());
    expect(z[0]).toBe(0x50); expect(z[1]).toBe(0x4b);
  });
});
