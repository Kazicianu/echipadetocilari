# ContactSection

The contact block at the end of every page: an orange wave section with the invitation on the left and the form card on the right.

Markup: `section.ect-contact#formular_contact_bottom` with `div.ect-contact__wave--top` and `--bottom` (the wave `svg`), `.ect-contact__inner` holding `.ect-contact__copy` (`h2.ect-contact__title`, `p.ect-contact__text`, key words in `b`) and `.ect-contact__card` (`h3.ect-contact__card-title`, the `form` with one `div.ect-field` per field, `button.ect-btn.ect-btn--submit`, `p.ect-contact-privacy`, `p.ect-contact-status` and `p.ect-contact-fallback`).

- Section: the `orange-light` to `orange-hot` gradient at 135deg; white waves 60px tall at the top (flipped) and 30px at the bottom; 120px × 20px × 70px padding (90px top from 1024px, 20px on phones); content at most `contact-max`.
- Copy: `contact-title` (42/1.2, 400) and 22/1.2 400, both `white`, with two or three words in 700.
- Card: `white` with a 3px `white` border, `radius-button`, 40px padding (30 on phones); title `form-title` (22px, 600).
- Fields: `field` fill and border, `radius-card`, 16/1.4 400 (15px from 1024px), at least 40px, 25px apart; placeholders name the field ("Nume", "Nume Companie", "Email", "Telefon", "Mesaj"). Google Ads adds visible labels (`span.ect-field__label`, 13px 500), 48px fields and a full-width button (`ect-contact--labels`).
- Under the button: the privacy note in 13px `ink-muted` with an `ect-link--quiet` link, the status line (`data-state` success, error or sending, with `success`, `danger` or `info` on their `-soft` fills) and the email fallback in 13px `ink-theme`.
- Contrast: `white` on the gradient is 2.1:1 at the light end and 3.2:1 at the dark end, below AA; kept as the site has it. The `field` fill is almost `white`, so fields show no visible edge on the card (a 1.0:1 boundary); the placeholders carry the layout.

Hand-written from the shared Elementor contact section (post 3381), `ect-contact.css` and the Google Ads contact overrides in `google-ads.css`.
