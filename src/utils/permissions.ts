export async function getCaptureMethod(
  pageHeight: number,
  dpr: number = 1
): Promise<"cdp" | "scroll-stitch"> {
  // GoFully's primary full page engine is scrolling-capture with stitch
  return "scroll-stitch";
}

