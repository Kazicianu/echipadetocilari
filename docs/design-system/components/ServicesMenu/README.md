# ServicesMenu

The card that drops from "Servicii" in the header: one row per service with a round icon disc, the service name and a one-line description.

Markup: `ul.ect-svc-menu` with one `li > a.ect-svc-link` per service; inside, `span.ect-svc-icon` (an inline 24px stroke icon from `assets/Icons`, the `menu-*.svg` set, painted with `currentColor`) and `span.ect-svc-text` holding `span.ect-svc-title` and `span.ect-svc-desc`. Inside `.ect-header__submenu` the header picks the right form by itself; on its own, add `ect-svc-menu--tablet` for the bordered form.

- From 1025px: a leaf card, `radius-card` corners with a `radius-leaf-sm` bottom-left, `white`, no border, `shadow-dropdown`, 8px padding. It grows down from its top-left corner (0.32s, from 96% and 8px up) and the rows follow 30ms apart.
- From 768 to 1024px: a plain card, a 1px `line-menu` border, `radius-menu`, `shadow-menu`, 10px padding, no animation.
- Both are 400px wide (never wider than the screen minus 40px). Rows are at least 44px tall with 12 × 14px padding and 14px between disc and text: the disc is 40px, `peach-menu`, with the icon in `orange`; the title is `menu-title` (15/20, 600) in `ink`; the description `menu-desc` (13/18) in `ink-muted`.
- Hover, focus and the current service fill the disc `orange` with a `white` icon and turn the title `orange`; the row itself stays `white`. Mark the current service with `aria-current="page"`. Focus adds a 2px `orange-deep` ring 3px out.
- Keep the seven services in the site's order (site, store, apps, SEO, Google Ads, Facebook Ads, maintenance) and write each description as one short line: what the service delivers, in plain words.
- Contrast: `ink` on `white` 14.9:1 and `ink-muted` on `white` 7.4:1 pass; the hovered title, `orange` on `white` (2.4:1), fails AA and is kept as the site has it, the filled disc marks the row too.

Hand-written from `desktop-header.css` (the submenu card) and the header menu markup.
