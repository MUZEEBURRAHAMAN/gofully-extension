import { test, expect } from "@playwright/test";
import { buildZip, crc32 } from "../../src/export/zip";
import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

test.describe("Guide ZIP writer", () => {
  test("CRC-32 matches the standard check value", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
    expect(crc32(new Uint8Array(0))).toBe(0);
  });

  test("produces a ZIP that the system unzip accepts, with the exact bytes back", async () => {
    const enc = new TextEncoder();
    const png = Uint8Array.from({ length: 5000 }, (_, i) => (i * 31 + 7) & 255);
    const blob = buildZip([
      { name: "guide.md", data: enc.encode("# Tést ✓\n\n## Step 1\n") },
      { name: "images/step-01.jpg", data: png },
    ]);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gf-zip-"));
    const file = path.join(dir, "g.zip");
    fs.writeFileSync(file, Buffer.from(await blob.arrayBuffer()));

    const test_ = execFileSync("unzip", ["-t", file]).toString();
    expect(test_).toContain("No errors detected");

    execFileSync("unzip", ["-o", "-q", file, "-d", path.join(dir, "out")]);
    expect(fs.readFileSync(path.join(dir, "out", "guide.md"), "utf8")).toBe("# Tést ✓\n\n## Step 1\n");
    expect(Buffer.compare(fs.readFileSync(path.join(dir, "out", "images", "step-01.jpg")), Buffer.from(png))).toBe(0);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
