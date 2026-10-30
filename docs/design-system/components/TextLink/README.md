# TextLink

A quiet text link for the second action next to a button, a card's way onward, or a link inside running text.

Markup: `a.ect-link` for a stand-alone link; `ect-link--inline` inside a paragraph; `ect-link--quiet` for small print; `ect-link--cta` for the arrow link that closes a card.

- `ect-link`: `link` (15/21, 500) in `ink` with a 60% `orange` underline 5px below; `orange` on hover. It keeps a 44px hit area. Used for "Vezi cât costă ↓", "Vezi serviciile SEO" and "Ai nevoie doar de un site de prezentare? Vezi creare site web".
- `ect-link--inline`: `orange`, 600, underlined, in the size of the text around it ("Pentru o pagină nouă, vezi serviciul de creare site web").
- `ect-link--quiet`: `ink` with an `orange` underline 3px below, for the privacy link under the contact form.
- `ect-link--cta`: `orange`, 15px 600, no underline, closing an outline card ("Vezi ce include →").
- Name the destination ("Vezi serviciile Google Ads"), not "click aici". A down arrow means the link jumps down the page.
- Contrast: `ink` labels pass (14.9:1); the `orange` inline and CTA links are 2.4:1 on `white`, below AA, kept as the site has them.

Hand-written from `creare-magazin-online.css` (`.ect-link`), the Google Ads page inline styles and the contact form privacy note.
