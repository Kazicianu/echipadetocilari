# LanguageSwitch

The RO | EN switch in the header: a `white` pill with a `line-menu` hairline and two round 44px halves, the current language filled `orange`.

Markup: `nav.ect-lang[aria-label="Language"]` with two links, each with `hreflang` and `lang`; mark the current one `aria-current="true"`. The labels are `lang` (12px, 700, 0.04em).

- The idle half is `slate`. On hover (devices that hover) or keyboard focus it gets no fill and an `ink` label, and the `orange` drop leans about 10px toward it; a click stretches the drop on from there. Focus is a 2px `orange-deep` ring 3px out, drawn above the drop at rest.
- Inside the header from 768 to 1024px it changes by itself to the compact form: a 2px `orange` outline with `shadow-switch`, square halves split by a faint `orange` line, `orange` idle label, `orange-logo` fill on hover (see `Header`).
- On phones the switch leaves the header; RO and EN move to the foot of the `MobileMenu`.
- Each half stays a 44px target. Link each language to the same page in the other language, not to the homepage, when that page exists.
- Motion: only when the visitor switches language. On the page you leave, the `orange` half stretches like a drop toward the chosen language (245ms); on the new page it pulls back to its half and settles with a small wobble (475ms), and the page change is a 0.32s cross-fade. Every other link stays instant. With `prefers-reduced-motion: reduce` the switch is immediate: no animation, no delay, no view transition. The drop is the `.ect-lang-liquid` layer inside the nav, hidden from screen readers (`aria-hidden`) and not copied into the phone menu.
- Width: the header button reads "Ai o idee?" in RO and "Got an idea?" in EN; it has one `min-width` for both, so the switch stays in the same place after a language change.
- Contrast: the current half is `white` on `orange` (2.4:1), below AA for 12px text; kept as the site has it. `slate` idle labels pass (5.9:1).

Hand-written from the switch styles and the motion script the build injects (`#ect-lang-css`, `#ect-lang-js`) and `desktop-header.css`.
