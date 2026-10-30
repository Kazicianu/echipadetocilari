# Highlight

An orange chip behind the key words of a heading.

Markup: wrap the words in `span.ect-hl` inside the heading. `ect-hl--wide` gives the store's scope title its slightly wider chip.

- The chip is `orange` with `radius-card` corners and padding in em, so it scales with the heading; the words stay `ink` (6.1:1 on `orange`).
- One highlight per heading, on two or three words that carry the promise ("cu tine", "la prima comandă", "cerere", "ce nu").
- Long highlights wrap with each line keeping its own chip (`box-decoration-break: clone`). On the homepage process title, phones move the chip to its own centred line.

Hand-written from `home.css` (`.ect-process__hl`), `creare-magazin-online.css` (`.ect-hl`, `.mg-scope__hl`) and the Google Ads measurement heading.
