# SectionHead

The eyebrow, heading and lead that open a section.

Markup: `.ect-section-head` (add `ect-section-head--center` to centre it) holding `p.ect-eyebrow`, `h2.ect-h2` and `p.ect-lead`.

- Eyebrow: `eyebrow` (18/21.6, 300) in `orange`, a short topic in a few words ("Rezolvăm probleme reale", "Ce include", "Procesul nostru"). Variants: `--caps` capitalises it (Elementor sections); `--deep` uses `orange-deep` on the store's tinted sections; `--blue` is the Google Ads FAQ (`ink-blue`, 20px); `--sm` is 16px (/creare-site-web/, testimonials); `--ink` and `--accent` colour it `ink` or `accent` (the homepage "ECHIPA DE TOCILARI", the site's "Inovatie si creativitate").
- Heading: `h2` (45/54, 500, `ink`). Elementor sections capitalise every word; the store and Google Ads write sentence case (`ect-h2--sentence`, Google Ads adds `--tight`, -0.02em). `--brand` turns it `orange` (homepage about, site prices, Google Ads FAQ); `--light` sets 400 (/creare-site-web/).
- A heading may carry one `Highlight` on its key words ("Cum lucrăm <span class=ect-hl>cu tine</span>").
- Lead: `lead` (18/24, 400) or `lead-light` (18/27, 300), at most 640px wide.
- Sizes: 45px from 1025px, 32px down to 768px, 7.5vw on phones.
- Contrast: `orange` eyebrows and brand headings are 2.4:1 on `white` (AA fails, kept); `orange-deep` 5.9:1, `ink-blue` 9.7:1 and `accent` 5.0:1 pass.

Hand-written from the Elementor heading widgets (homepage, /creare-site-web/), `creare-magazin-online.css` (`.ect-eyebrow`, `.ect-h2`, `.ect-lead`) and the Google Ads inline styles.
