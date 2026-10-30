# Receipt

The store's project "receipt": the four steps of a store project printed like a till slip, from the free call to the launch.

Markup: `div.ect-receipt` with `.ect-receipt__paper` (`.ect-receipt__head` with the logo and two lines, `ol.ect-receipt__list`, `.ect-receipt__total`, `.ect-receipt__barcode`, `p.ect-receipt__code`) and `.ect-receipt__edge` (the torn bottom). Each step is `li > .ect-receipt__row` (`span.ect-receipt__no`, `h3`, `span.ect-receipt__dots`, `span.ect-receipt__val`) and `p.ect-receipt__desc`.

- Paper: `white`, `radius-card` on the top corners, tilted -1.5deg, with `shadow-receipt` as a drop shadow so the torn edge casts it too. Dashed `line` rules; dotted `line-step` leaders between a step and its value.
- Head: the 42px logo, the brand in `label-caps` (12px, 700, 0.08em, uppercase) and "Bon de proiect · Magazin online" in 13px 300 `ink-muted`.
- Steps: number 12px 600 (`orange-check` for the first two, `orange-deep` after), title 16px 600, value in caps 12px 700 `orange-deep`, description 14/1.5 300.
- Total: "Total" in caps 14px 800 and the promise in 16px 700 ("Un magazin care primește comenzi"); then a CSS barcode in `ink` and "EDT · MAGAZIN · ONLINE" in 11px, 0.3em tracking.
- Values are short and concrete: "Gratuit", "În scris", "Cu tine", "Live".
- Contrast: `orange-check` 5.95:1 and `orange-deep` 5.9:1 on `white` pass.

Hand-written from `creare-magazin-online.css` (`.mg-receipt`).
