// jsPDF lazy-loads canvg only for doc.addSvgAsImage(), which GoFully never calls.
// The real canvg bundles core-js polyfills that the Chrome Web Store flags as obfuscated code
// (violation "Red Titanium", Nov 2026), so builds resolve "canvg" to this stub instead.
throw new Error("canvg is not bundled with GoFully");
