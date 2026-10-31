/** Raster image data URLs only: no SVG (script-capable), no quotes or spaces that could break out of an attribute. */
const SAFE_IMAGE_DATA_URL = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

export function isSafeImageDataUrl(value: unknown): value is string {
  return typeof value === "string" && value.length < 200_000_000 && SAFE_IMAGE_DATA_URL.test(value);
}
