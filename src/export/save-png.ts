import { generateFilename } from "../utils/image";

export async function savePng(
  blob: Blob,
  domain: string,
  saveAs = false
): Promise<void> {
  const url = URL.createObjectURL(blob);
  const filename = generateFilename(domain, "png");

  await chrome.downloads.download({
    url,
    filename,
    saveAs,
  });

  // Revoke after a delay to ensure download starts
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
