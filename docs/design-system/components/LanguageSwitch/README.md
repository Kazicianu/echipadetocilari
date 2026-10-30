# LanguageSwitch

The RO | EN switch in the header: a `white` pill with a `line-menu` hairline and two round 44px halves, the current language filled `orange`.

Markup: `nav.ect-lang[aria-label="Language"]` with two links, each with `hreflang` and `lang`; mark the current one `aria-current="true"`. The labels are `lang` (12px, 700, 0.04em).

- The idle half is `slate`; hover fills it `peach-menu` with an `orange-deep` label. Focus is a 2px `orange-deep` ring 3px out.
- Inside the header from 768 to 1024px it changes by itself to the compact form: a 2px `orange` outline with `shadow-switch`, square halves split by a faint `orange` line, `orange` idle label, `orange-logo` fill on hover (see `Header`).
- On phones the switch leaves the header; RO and EN move to the foot of the `MobileMenu`.
- Each half stays a 44px target. Link each language to the same page in the other language, not to the homepage, when that page exists.
- Contrast: the current half is `white` on `orange` (2.4:1), below AA for 12px text; kept as the site has it. `slate` idle labels pass (5.9:1).

Hand-written from the switch styles the build injects (`#ect-lang-css`) and `desktop-header.css`.
