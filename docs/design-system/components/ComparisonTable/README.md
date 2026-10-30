# ComparisonTable

The plan comparison under the Google Ads price cards, folded behind a "Compară pachetele" pill.

Markup: `details.ect-compare` (open it by default only when the table is the point) with `summary` (`span.ect-compare__closed` "Compară pachetele", `span.ect-compare__open` "Ascunde comparația", the chevron `svg`), then `div.ect-compare__box > table` and `p.ect-compare__note`. Mark the recommended column's cells `.is-featured`. Each check or dash is an `svg` with `role="img"` and an `aria-label` ("Inclus", "Nu este inclus").

- Pill: at least 48px, `white`, `radius-button`, an inset 2px `orange` ring, 15px 500; it fills `orange` on hover and the chevron turns.
- Table: in a `white` box with `radius-card` and `shadow-card`, fixed layout (43% for the feature column); header "Ce include" 400 `ink-muted`, plan names 500 with the price in 900 `orange` under them; rows split by 1px `line`; feature names 300; cells centred, 15px (13px on phones).
- The recommended column is marked by 1px `orange` side rules and a 3px `orange` top rule, never a tint.
- Included: an `orange` check (2.5 stroke); not included: a short `mute` dash. Footnote 14px for any asterisk ("* Monitorizarea zilnică ... în zilele lucrătoare.").
- Contrast: the `orange` check is 2.4:1 and the `mute` dash 1.7:1 on `white`, below 3:1 for meaningful icons; each carries an `aria-label`. Kept as the site has them.

Hand-written from `google-ads.css` (`.gads-comparison`) and the table markup.
