export function getDPR(): number {
  if (typeof self !== "undefined" && "devicePixelRatio" in self) {
    return (self as any).devicePixelRatio || 1;
  }
  return 1;
}

export function scaleForDPR(value: number, dpr: number): number {
  return Math.round(value * dpr);
}

export function detectDPRFromCapture(
  capturedWidth: number,
  cssWidth: number
): number {
  if (cssWidth === 0) return 1;
  return capturedWidth / cssWidth;
}

export function createScaledCanvas(
  width: number,
  height: number,
  dpr: number
): { canvas: OffscreenCanvas; ctx: OffscreenCanvasRenderingContext2D } {
  const canvas = new OffscreenCanvas(
    Math.round(width * dpr),
    Math.round(height * dpr)
  );
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  return { canvas, ctx };
}
