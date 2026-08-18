export async function copyToClipboard(blob: Blob): Promise<void> {
  const pngBlob =
    blob.type === "image/png"
      ? blob
      : await convertToPng(blob);

  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": pngBlob }),
  ]);
}

async function convertToPng(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  return canvas.convertToBlob({ type: "image/png" });
}
