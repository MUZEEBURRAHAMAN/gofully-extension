export async function getCaptureMethod(
  pageHeight: number
): Promise<"cdp" | "scroll-stitch"> {
  const MAX_CDP_HEIGHT = 16384;
  if (pageHeight > MAX_CDP_HEIGHT) return "scroll-stitch";
  // debugger is a required permission in manifest, always available
  return "cdp";
}
