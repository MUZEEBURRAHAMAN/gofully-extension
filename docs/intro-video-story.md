# GoFully intro video: "The Friday Report"

Length: 3 minutes. Format: screen recording with voice-over, 16:9, 1920 x 1080 at 60 fps. Audience: anyone who sends screenshots for work (support, QA, product, design, marketing, docs). Goal: one action, **Add to Chrome**.

Every feature appears because the character needs it at that moment, in an order where each step sets up the next. Nothing is shown "for completeness". By the end, all 23 features on the checklist at the bottom have been on screen.

---

## The story in one paragraph

It is 4:40 on a Friday. Priya, a support lead at a billing app called Ledgerly, has one customer's problem to turn into three things before she can log off: a bug report a developer can act on, a how-to the customer can follow, and a line for the changelog. Last week this took five apps and two hours, and the developer still wrote back, "I can't see the bug. Is that a customer's email in the corner?" This time she has GoFully. Eleven minutes later she is done, and nothing she captured ever left her computer.

**Why this story works.** It starts with a pain every viewer has felt (the rejected, crooked screenshot with something private in it), gives the hero a clock, and pays off with a quiet win. The private-data scare is the emotional hook, so the strongest feature, Redact page, lands in the first third, not the last.

**Characters.** *Priya*, support lead (the viewer's stand-in, never seen, only her cursor). *Dev, Marcus*, appears only as a chat message. *The customer, Maya Okafor*, appears only as data on the page (fake: maya.okafor@example.com, card 4242 4242 4242 4242).

**Tone.** Calm, a little dry, never hype. The narrator talks like a colleague showing you a trick, not like an ad. No "game-changer", no "supercharge". Short sentences. Numbers and specifics.

**Visual world.** The made-up Ledgerly dashboard from `scripts/landing-shots/ledgerly.html`, so no real data ever appears. Use the same fake customer in every scene so the viewer learns the page once. A small chat window (Marcus) appears in two scenes.

---

## Structure at a glance

| # | Time | Beat | Features shown |
|---|---|---|---|
| 1 | 0:00 to 0:14 | The Friday problem | (pain only) |
| 2 | 0:14 to 0:30 | One click, whole page | Full page, sticky headers, lazy images |
| 3 | 0:30 to 0:55 | The scare: hide it first | Redact page |
| 4 | 0:55 to 1:15 | The bug hides in a menu | Delayed capture, capture stack, QR codes |
| 5 | 1:15 to 1:40 | Show exactly where | Capture Element, Measure, Draw on page |
| 6 | 1:40 to 2:05 | Polish in the editor | Editor markup, Auto-redact, Crop, Capture text |
| 7 | 2:05 to 2:30 | Three deliverables | Guide, Beautify, Pin |
| 8 | 2:30 to 2:48 | Find it later, send it now | History search, export, after-capture setting |
| 9 | 2:48 to 3:00 | Close | Privacy, shortcuts, CTA |

---

## Scene by scene

Voice-over (VO) is written to be spoken at about 150 words a minute. On-screen text (OST) is short, lower-left, and never repeats the VO word for word. Timecodes are targets.

### Scene 1: The Friday problem (0:00 to 0:14)

**Visual.** Screen recording of a cluttered desktop at 4:40 PM (clock in the menu bar). Five windows: a browser, an image editor, a PDF tool, a notes app, a chat. In the chat, Marcus has replied to a crooked, cropped screenshot. Zoom on his message: *"I can't see the bug. And is that a customer's email in the corner??"* The screenshot behind it shows a half-cut dropdown and, in the corner, `maya.okafor@example.com`.

**VO.**
"Friday, 4:40. Priya has one customer problem to turn into a bug report, a how-to and a changelog line. Last week that took five apps and two hours. And the developer still wrote back: *I can't see the bug.*"

**OST.** "4:40 PM" (fades in), then "5 apps. 2 hours. Still unclear."

**Sound.** A low office hum and a chat-notification ping on Marcus's message, then silence for a beat. Music starts softly on the cut.

**Cut.** Hard cut to a clean, empty browser window on the Ledgerly dashboard.

### Scene 2: One click, whole page (0:14 to 0:30)

**Visual.** The browser shows the Ledgerly customer page, a long scrolling page (invoices, payments, activity). Cursor goes to the GoFully icon, popup opens (the real popup). Click **Full page**. The progress card appears: "Capturing full page, Screen 4 of 9". The page scrolls itself. A fixed top bar stays at the top only once in the result. The review tab opens with one tall image; the caption reads 1280 x 4056 px.

**VO.**
"This time she opens GoFully and clicks Full page. It scrolls for her, waits for the images to load, keeps the sticky header from repeating, and joins it into one picture. No stitching, no crops."

**OST.** "Full page: one click, one image". Small chip near the progress card: "Keeps sticky headers from repeating".

**Features on screen:** Full page, sticky-header handling, lazy images.

**Note for the shoot.** Use a page that has a visible sticky header and an image that loads late, so the claim is visible. The progress card should show for about two seconds.

### Scene 3: The scare, hide it first (0:30 to 0:55)

**Visual.** Priya notices Maya's email, phone, card and API key on the page. A slow push-in on the "Payment method" card. Cursor goes to the popup and clicks **Redact page**. Instantly black bars cover the email, phone number, card number and key. The toolbar at the bottom reads "Hidden: 1 email, 1 phone number, 1 card number, 1 API key". She clicks Maya's name and company to hide those too (names are not found automatically, and the scene says so). She scrolls the long page: the covers stay in place as new content loads. She taps **Blur** to show the alternative, then back to **Black**, then **Capture full page**. The capture card appears. She clicks **Done**: the page returns exactly as it was, and the email is readable again on screen.

**VO.**
"But the page holds Maya's email, her phone, her card, an API key. Priya clicks Redact page. GoFully covers them on the live page, and keeps covering what loads as she scrolls. Names it can't recognise, so she clicks those herself. Then she captures. When she clicks Done, the page is exactly as it was."

**OST.** "Redact page: covers private details before you capture". Then "Done restores the page".

**Features on screen:** Redact page, black and blur, click to hide, live updates, Done restores.

**Beat.** After the covers appear, hold for one second of silence. This is the emotional high point of the first half: relief.

### Scene 4: The bug hides in a menu (0:55 to 1:15)

**Visual.** Marcus's follow-up in the chat: *"The bug is in the Export menu."* The dropdown closes the moment she clicks anything, so she cannot capture it. In the popup she sets **Delay** to 5 s and clicks Visible area. The popup closes. A dark pill at the top counts down: "3  Capturing soon. Open the menu or hover what you need. Esc cancel". She opens Export. The countdown ends, a shutter sound plays, and a card slides in at the top right with the menu clearly visible and "Screenshot captured". She takes a second capture of a payment-link QR code on the same page. The stack now shows two cards: the new one open, the first folded. On the open card, a line reads "QR code, Link" with **Open** and **Copy**.

**VO.**
"Marcus writes back: the bug is in the Export menu. A menu closes the moment you click away, so she sets a five-second delay, opens the menu, and lets the countdown finish. The shot comes out with the menu open. Her captures wait in the corner, and when a capture holds a QR code, GoFully reads it for her."

**OST.** "Delay: 3, 5 or 10 seconds". Later: "QR codes read on your device".

**Features on screen:** Delayed capture (countdown left out of the image), capture stack with folded cards, QR code reading with a safe Open button.

**Sound.** The shutter, once. Soft click on card appearance.

### Scene 5: Show exactly where (1:15 to 1:40)

**Visual.** Three quick moves, each about eight seconds.

1. **Capture Element.** Popup, **Element**. A blue outline follows the cursor over the page, showing "448 x 160". She presses the up arrow once to select the parent, then clicks. The capture card shows only the Payment card, cropped to the edge.
2. **Measure.** Popup, **Measure**. She hovers a card: an info card appears (Section, 448 x 160 px, Padding 18 px top and bottom, 20 px sides, Text 14 px Regular Inter). She clicks the Contact card, then hovers the Payment card: a red "20 px" tag appears in the gap. She presses **C**, clicks a green bar: a swatch appears and "#1e6b43 copied".
3. **Draw on page.** Popup, **Draw on page**. She circles the broken Export button in red, adds an arrow and a sticky note ("Menu clips under the card"). She clicks **Visible** on the bar; the bar disappears for the shot, and the marks are in the image.

**VO.**
"To show where, she captures just the card with Capture Element. To settle whether the gap is twenty pixels or twenty-four, she measures it: hover for size and padding, click two for the gap, press C to copy a color. Then she draws straight on the page, circles the button, adds a note, and captures it with her marks in place."

**OST.** "Element", then "Measure: size, padding, gaps, colors", then "Draw on page".

**Features on screen:** Capture Element (parent and child with arrow keys), Measure (hover card, gap between two, color pick), Draw on page (pen, arrow, sticky note, captured with marks).

**Pacing.** This is the busiest scene. Keep each tool to one clear action, and hold the result for a full second before moving on.

### Scene 6: Polish in the editor (1:40 to 2:05)

**Visual.** The editor opens with the full-page capture. Quick sequence:

- **Arrow and step numbers:** she places an arrow, then three step badges (1, 2, 3) down the page.
- **Spotlight:** darkens everything except the Export button.
- **Blur:** one leftover field is blurred.
- **Auto-redact:** from the Blur arrow she chooses Auto-redact. A few seconds later black boxes appear over the card number and the key, with the toast "Scanning this screenshot on your device". She deletes one box to show she is in control.
- **Crop:** she presses X, picks 16:9, drags, and her arrow and steps move with the crop and stay editable.
- **Capture text:** back on the page, she drags over a red error message inside a screenshot image in the app. A panel reads the text and she clicks **Copy text**, then pastes it into the chat.

**VO.**
"In the editor she adds an arrow and numbered steps, spotlights the button, blurs a field. One more check: Auto-redact scans the picture on her device and covers anything she missed, and she reviews every box. She crops, and her marks come along. And when the error is only pixels in an image, Capture text reads it and copies the words."

**OST.** "Arrows, steps, spotlight, blur", then "Auto-redact: you review every box", then "Capture text: on-device OCR".

**Features on screen:** Editor markup (arrow, steps, spotlight, blur), Auto-redact with review, Crop that keeps annotations editable, Capture text (OCR).

### Scene 7: Three deliverables (2:05 to 2:30)

**Visual.** Three quick wins, side by side in one flow.

1. **Guide.** On the capture cards she clicks **Guide** on four captures. The guide page shows four steps with a caption line under each. She clicks **Export PDF**: a neat paginated PDF opens, with "Step 1" through "Step 4".
2. **Beautify.** She opens a capture in the editor, clicks Beautify, picks a gradient, adds a window frame and a soft shadow, then drags the 3D tilt slider. The result is a polished, tilted image on a gradient.
3. **Pin.** She clicks **Pin** on a capture. It floats over the page as a draggable window. She slides the opacity down, so she can see the page through it while she writes the changelog.

**VO.**
"Now the other two jobs. For the customer, she adds four captures to a guide, writes a line under each, and exports a PDF. For the changelog, Beautify turns a plain screenshot into something worth posting: a gradient, a window frame, a tilt. And Pin floats a capture over the page, so she can see it while she types."

**OST.** "Step-by-step guides: PDF or Markdown", then "Beautify: backgrounds, frames, 3D", then "Pin as a reference".

**Features on screen:** Step-by-step guide (PDF export), Beautify (gradient, frame, shadow, 3D tilt), Pin with opacity.

### Scene 8: Find it later, send it now (2:30 to 2:48)

**Visual.** She opens the popup, clicks History, and types "export" into the search box. The grid narrows to the capture whose image contains that word. She opens Settings and changes **After a capture** from "Show the capture card" to "Copy to clipboard", with a one-line caption. She presses the shortcut Ctrl+Shift+V: a small "Copied" pill, nothing else. In the editor's export menu, formats scroll past: PNG, JPG, WebP, PDF, 4K UHD.

**VO.**
"A week from now she can search her history by the words inside the pictures. If she'd rather skip the card, Settings can copy, save or open the editor automatically. And she can save as PNG, JPG, WebP or PDF, up to 4K."

**OST.** "Search inside your captures", then "Choose what happens after a capture", then "PNG, JPG, WebP, PDF, up to 4K".

**Features on screen:** History search, after-capture setting, keyboard shortcut, export formats.

### Scene 9: Close (2:48 to 3:00)

**Visual.** The clock reads 4:51 PM. Marcus: *"Got it. Fixing now. Thanks, that's the clearest report I've had."* Priya opens the popup one last time: the footer reads "Runs on your device". Then the end card: the GoFully mark, the line "Free. Private. On your device.", and the Add to Chrome button with the web address.

**VO.**
"Eleven minutes. One extension. And none of it left her computer: no account, no uploads, nothing sent anywhere. GoFully. Add it to Chrome. It's free."

**OST.** "No account. No uploads. Free." Then end card: "GoFully, Add to Chrome" and the address `gofully-extension.vercel.app`.

**Sound.** Music resolves on the last line. A single soft chime on the end card.

---

## Full voice-over script (read straight through)

Friday, 4:40. Priya has one customer problem to turn into a bug report, a how-to and a changelog line. Last week that took five apps and two hours. And the developer still wrote back: *I can't see the bug.*

This time she opens GoFully and clicks Full page. It scrolls for her, waits for the images to load, keeps the sticky header from repeating, and joins it into one picture. No stitching, no crops.

But the page holds Maya's email, her phone, her card, an API key. Priya clicks Redact page. GoFully covers them on the live page, and keeps covering what loads as she scrolls. Names it can't recognise, so she clicks those herself. Then she captures. When she clicks Done, the page is exactly as it was.

Marcus writes back: the bug is in the Export menu. A menu closes the moment you click away, so she sets a five-second delay, opens the menu, and lets the countdown finish. The shot comes out with the menu open. Her captures wait in the corner, and when a capture holds a QR code, GoFully reads it for her.

To show where, she captures just the card with Capture Element. To settle whether the gap is twenty pixels or twenty-four, she measures it: hover for size and padding, click two for the gap, press C to copy a color. Then she draws straight on the page, circles the button, adds a note, and captures it with her marks in place.

In the editor she adds an arrow and numbered steps, spotlights the button, blurs a field. One more check: Auto-redact scans the picture on her device and covers anything she missed, and she reviews every box. She crops, and her marks come along. And when the error is only pixels in an image, Capture text reads it and copies the words.

Now the other two jobs. For the customer, she adds four captures to a guide, writes a line under each, and exports a PDF. For the changelog, Beautify turns a plain screenshot into something worth posting: a gradient, a window frame, a tilt. And Pin floats a capture over the page, so she can see it while she types.

A week from now she can search her history by the words inside the pictures. If she'd rather skip the card, Settings can copy, save or open the editor automatically. And she can save as PNG, JPG, WebP or PDF, up to 4K.

Eleven minutes. One extension. And none of it left her computer: no account, no uploads, nothing sent anywhere. GoFully. Add it to Chrome. It's free.

442 words, or about 177 seconds at 150 words a minute. With the pauses between scenes the finished video runs 3:00 to 3:15. If you need exactly 3:00, cut the second sentence of Scene 5's voice-over.

---

## Feature checklist (all 23 must appear)

| # | Feature | Scene |
|---|---|---|
| 1 | Full page capture | 2 |
| 2 | Sticky headers kept from repeating | 2 |
| 3 | Lazy images waited for | 2 |
| 4 | Redact page (live covers, black and blur) | 3 |
| 5 | Redact page keeps covering new content, Done restores | 3 |
| 6 | Delayed capture with countdown | 4 |
| 7 | Capture stack with folded cards | 4 |
| 8 | QR code reading with safe Open | 4 |
| 9 | Capture Element (parent and child) | 5 |
| 10 | Measure (size, padding, gap) | 5 |
| 11 | Color picker | 5 |
| 12 | Draw on page | 5 |
| 13 | Editor markup (arrow, steps, spotlight, blur) | 6 |
| 14 | Auto-redact with review | 6 |
| 15 | Crop that keeps annotations | 6 |
| 16 | Capture text (OCR) | 6 |
| 17 | Step-by-step guide to PDF | 7 |
| 18 | Beautify with 3D tilt | 7 |
| 19 | Pin with opacity | 7 |
| 20 | History search | 8 |
| 21 | After-capture setting | 8 |
| 22 | Export formats | 8 |
| 23 | Keyboard shortcuts | 8 |

Features deliberately shown only in passing, or left out, to keep the story clear: selected area and scrolling area (mentioned in the cut-downs below), landing-page mode (best shown in a dedicated clip), Settings language and theme.

---

## Production notes

**Recording.** Record at 2560 x 1440 and export at 1920 x 1080 so the UI stays sharp. 60 fps. Browser zoom 110%. Hide bookmarks and other extensions. Use a clean Chrome profile with only GoFully installed. Show the cursor with a soft ring, and add a click ripple in editing (the repository's `scripts/record-demo-video.mjs` shows how to record the real extension with a visible cursor).

**Page and data.** Use `scripts/landing-shots/ledgerly.html` or a copy of it, so nothing real appears. Add a long section (invoices and activity) so Full page has something to scroll, with a sticky header and one late-loading image. Keep Maya Okafor's data exactly as in the landing-page images so the video and the site match.

**Voice.** One warm, steady voice, close to the microphone, no music under the first sentence. Record each scene as its own take so the edit can breathe. Leave half a second of silence at every scene change.

**Music.** Quiet, light electronic or acoustic, around 90 beats per minute, no vocals. It enters softly after the first line, lifts slightly at scene 3 (the relief), and resolves on the last line. Duck it by 12 dB under the voice.

**Motion and captions.** Push in on the feature as it appears and ease out after a second. OST in Inter Medium, lower-left, white on a soft dark pill, held for two seconds. Burn in subtitles for the whole voice-over, so the video works with the sound off. Navy (#014073) and sky (#6AB0FF) only for GoFully's own highlights, so the brand colors mark what is GoFully.

**Sound design.** Shutter once per capture. A soft click when a card appears. Chat ping on Marcus's messages. Keep every effect quieter than the voice.

**Accessibility.** Captions in English as a separate file, and a transcript in the description. Never rely on color alone for meaning.

**Thumbnail.** The Redact page moment: the dashboard with black bars over the email and card, the headline "Hide it before you capture" in large type, and the GoFully mark in a corner. No faces, no arrows.

**Title.** "GoFully in 3 minutes: capture, redact and share a bug report"
**Alternative.** "I hid private data on a live page before taking the screenshot"

**Description.**
> GoFully is a free Chrome extension for full-page screenshots. In three minutes, Priya turns one customer problem into a bug report, a how-to and a changelog line, with every capture staying on her computer.
>
> Chapters
> 0:00 The Friday problem
> 0:14 One click, whole page
> 0:30 Hide private details before you capture
> 0:55 Capture menus with a delay
> 1:15 Capture an element, measure, draw on the page
> 1:40 Edit, auto-redact, crop and read text
> 2:05 Guides, Beautify and Pin
> 2:30 Search your history and choose what happens after a capture
> 2:48 Free, private, on your device
>
> Add GoFully to Chrome: https://chromewebstore.google.com/detail/gofully-full-page-screens/akfbmhmdlbmljklgajkgoekobofhhofc
> Website: https://gofully-extension.vercel.app

---

## Cut-downs for other places

| Length | Where | Keep | Opening line |
|---|---|---|---|
| 15 s | Social, ads | Scene 3 only (Redact page) | "Hide private details before you capture." |
| 30 s | Chrome Web Store promo video, landing hero | Scenes 2, 3 and 4 in half time | "One click for the whole page. One more to cover what's private." |
| 60 s | Product Hunt, newsletter | Scenes 2, 3, 4, 5 and 7, without the story setup | "Capture, redact, measure and share, without leaving Chrome." |
| 3 min | YouTube, website | Everything above | "Friday, 4:40." |

**Chrome Web Store.** The listing accepts a YouTube link as its promo video. Use the 30-second cut as the link target, in 16:9, with captions on, and no music louder than the voice.

---

## Checks before you publish

1. Every claim in the voice-over matches the shipped version (1.1.3). Nothing shown is "coming soon".
2. No real names, emails, cards or keys appear anywhere, including in the browser's address bar and tab titles.
3. The drag-out of a capture is not shown, because it depends on the receiving app. If you want to show it, drag to the desktop.
4. Do not show a browser network panel as proof of privacy: it lists the page's traffic, not the extension's. Show the permission list or the "Runs on your device" line instead.
5. Captions match the audio word for word.
6. The final frame holds for at least three seconds, with the address readable.
