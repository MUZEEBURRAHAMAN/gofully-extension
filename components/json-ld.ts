/** Serialises structured data for a <script type="application/ld+json"> tag. `<` and the line separators are escaped so no string value can close the tag early. */
const LINE_SEPARATORS = new RegExp("[" + String.fromCharCode(0x2028, 0x2029) + "]", "g");

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(LINE_SEPARATORS, (c) => "\\u" + c.charCodeAt(0).toString(16));
}
