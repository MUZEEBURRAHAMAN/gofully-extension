/** Feature demos: four frames each. The first seven were exported from Figma ("Feature demos · animation storyboards");
 *  Redact page, Measure and Delayed capture are the real extension, shot by scripts/landing-shots/shoot.mjs. */
export type Demo = {
  id: string;
  icon: "full-page" | "region" | "element" | "text-ocr" | "shield" | "beautify" | "draw" | "auto-redact" | "ruler" | "timer";
  /** Shown next to the title while the feature is not yet in the Chrome Web Store release. */
  badge?: string;
  title: string;
  blurb: string;
  alt: string;
  steps: [string, string, string, string];
};

export const DEMOS: Demo[] = [
  { id: "full-page", icon: "full-page", title: "Full page", blurb: "One tall image of the whole page", alt: "GoFully capturing a full article in Chrome", steps: ["Click the GoFully icon", "Choose Full page", "GoFully scrolls and loads images", "One tall image, ready to use"] },
  { id: "region", icon: "region", title: "Selected area", blurb: "Drag a box, copy it", alt: "Dragging a selection over two photos on a page", steps: ["Pick Selected area or press ⌘⇧A", "Drag over what you need", "The size shows as you drag", "Copied, with Save and Edit one click away"] },
  { id: "element", icon: "element", title: "One element", blurb: "Hover a card, click, done", alt: "Hovering a billing card with a blue outline", steps: ["Pick Element", "Hover: a blue outline shows the size", "Move to any card, table or message", "Click. GoFully crops to its edges"] },
  { id: "text", icon: "text-ocr", title: "Capture text", blurb: "Copy words out of pixels", alt: "Reading text from a dashboard on the device", steps: ["Pick Capture text", "Drag over any text on the page or in an image", "GoFully reads it on your device", "Copy it as plain text"] },
  { id: "redact", icon: "shield", title: "Auto-redact", blurb: "Find and cover private details", alt: "Auto-redact covering an email, phone, card and API key", steps: ["Open a capture in the editor", "GoFully reads the text locally", "It marks emails, phones, cards and keys", "Tick what to hide. Blur is baked in"] },
  { id: "beautify", icon: "beautify", title: "Beautify", blurb: "Turn a capture into a post", alt: "A screenshot framed on a gradient and tilted in 3D", steps: ["Start from any capture", "Pick a gradient or wallpaper", "Add a window frame, radius and shadow", "Tilt it in 3D and save the look"] },
  { id: "redact-page", icon: "auto-redact", badge: "New", title: "Redact page", blurb: "Hide private details before you capture", alt: "Emails, card numbers and an API key covered on a live billing page", steps: ["Pick Redact page", "Emails, cards, phones and keys are covered at once", "Click anything else to hide it too", "Capture it with the covers in place"] },
  { id: "measure", icon: "ruler", badge: "New", title: "Measure", blurb: "Sizes, gaps and colors on any page", alt: "Measuring two cards and the gap between them on a live page", steps: ["Pick Measure", "Hover: size, padding, margin and text style", "Click one, hover another: the gap in pixels", "Drag anywhere for a free ruler"] },
  { id: "delay", icon: "timer", badge: "New", title: "Delayed capture", blurb: "Capture menus and hover states", alt: "A countdown on the page while an Export menu is open", steps: ["Set Delay to 3, 5 or 10 seconds", "The popup closes and a countdown starts", "Open the menu you want in the shot", "Captured with the menu open"] },
  { id: "draw", icon: "draw", title: "Draw on page", blurb: "Mark up the live site", alt: "Circling a photo and adding an arrow and a sticky note", steps: ["Turn on Draw on page", "Circle or highlight on the live site", "Add arrows and sticky notes", "Capture it with your marks in place"] },
];

export const frameSrc = (id: string, n: number) => `/landing/${id === "full-page" ? "full-page" : id}-${n}.webp`;
