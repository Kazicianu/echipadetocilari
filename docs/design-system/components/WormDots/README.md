# WormDots

The dot strip under a horizontal rail or a phone preview: one dot per card, and a worm that stretches from the current dot to the next while the card scrolls past. The strip is also a control: tap a dot, drag along the dots to scrub, or use the arrow keys.

Markup: `div.wd-strip` of `button.wd-dot[type=button][aria-label][aria-current]`, one button per card, `aria-current="true"` on the first. The script adds the `span.wd-ring` and `span.wd-worm` (both `aria-hidden`), a visually hidden live region after the strip (scroll mode only) and `data-wd-ready` on the strip. Load `worm-dots.css` before the page stylesheet and `worm-dots.js` before the page script, then call `window.ectWormDots.attach(strip, options)`.

- Scroll mode: `attach(strip, { track })`. The worm follows `track.scrollLeft`, so a swipe on the rail moves it continuously and the strip drives the rail while it is tapped or scrubbed. `track.children.length` must equal the number of dots, or `attach` returns `null`. When the last card's start cannot be reached (two cards visible), the scroll range is mapped onto the dots in pieces, so the worm still reaches the last dot at the end of the rail.
- Virtual mode: `attach(strip, { onSelect })`, no `track`. The module keeps its own position (the dot with `aria-current="true"` at attach time). `onSelect(index)` is called when the user taps, scrubs or uses the keyboard; the page switches its content and calls `goTo(index)` when it advances on its own (autoplay).
- API: `attach` returns `{ goTo(index, { animate = true }), destroy() }`, or `null` (fewer than 2 dots, or a track with the wrong number of children). Attaching twice returns the same controller. `goTo` never calls `onSelect` and is ignored while a pointer is down.
- Geometry: 8px dot, 16px worm at rest, 20px hover ring, 24px pitch (`--wd-gap`), 44px tall hit area. On `(pointer: coarse)` the pitch is 44px and the side reach is 0, so every dot is a 44 x 44 target.
- Colours: inactive `--line-step`, worm `--orange`, pressed dot `--orange-light`, ring and keyboard focus `--ink` (the ring at 8%). Each has a hex fallback in the stylesheet.
- Timing: the worm has no clock of its own. A release snaps in 180ms, a tap travels in 280ms plus 40ms per extra dot, the ring glides in 80ms, arrow keys, Home and End jump. With `prefers-reduced-motion` taps and snaps jump and the scrub follows the pointer directly.
- Accessibility: keep each dot's existing `aria-label`; the current dot is `aria-current="true"` and the others `"false"`. The strip is one Tab stop (roving tabindex). In scroll mode the live region reads the current dot's label after 250ms of stillness. Forced colours use system colours.
- No counter: the dots carry the position, no "1 / 6" text next to them.
- The selectors are `.wd-strip .wd-dot` and `.wd-strip .wd-dot:is(:hover, :focus, :active)`, strong enough to beat the legacy WordPress theme's `[type=button]:hover` background and border. Without the script the current dot shows as a plain orange pill.
- Page scripts keep a fallback to their old behaviour when `window.ectWormDots` is missing.

Source: "Worm dots" by microinteractions.dev (https://microinteractions.dev/worm-dots/), MIT License, rewritten as a plain script and stylesheet. Used on `/dezvoltare-aplicatii/` (two rails) and the `/creare-magazin-online/` hero phone.
