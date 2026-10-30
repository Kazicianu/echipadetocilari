# FeatureCard

A numbered card that explains one part of a service, with an optional worked example; the Google Ads "Ce includ serviciile" bento.

Markup: `article.ect-feature` with `span.ect-feature__num` ("01"), `h3.ect-feature__title`, `p.ect-feature__text` and one optional extra: a campaign structure (`.ect-structure` of tags), a note (`span.ect-feature__note`) or a head row with an icon (`.ect-feature__head`). The lead card is `ect-feature--lead` and may hold a keyword example (`.ect-terms`).

- Regular card: `white` leaf card (`radius-card`, `radius-leaf` bottom left), `shadow-card`, 36px × 34px × 42px padding; number 14px 600 `orange`; title 20/1.3 500, -0.012em; text 16/1.55 300.
- Lead card: the `orange-logo` to `orange` gradient at 270deg with `shadow-glow`, `white` text at 400 and a 28px title. Its example box is `white` with `radius-card`: label 12px 600 `ink-muted`, rows 14px with `line-peach` dividers; kept terms carry a 20px `orange` disc with a `white` check and "păstrat", excluded ones a `line` disc with an `ink-soft` cross, struck through, and "exclus".
- These cards inform; they do not move on hover.
- On wide screens the six cards form a 12-column bento (lead card 5 columns, two rows); below 900px they become a sideways scroller with 84% wide cards and a "Glisează și vezi mai mult" note.
- Contrast: `white` on the gradient is 2.8:1 at the `orange-logo` end and 2.4:1 at the `orange` end, below AA; `ink-soft` excluded terms are 4.4:1 on `white` (just under AA for 14px). Kept as the site has them.

Hand-written from the Google Ads services section (inline styles) and `google-ads.css`.
