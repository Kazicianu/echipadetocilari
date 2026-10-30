# Backgrounds

Pale blob sheets that sit behind sections on `white`. They are transparent PNGs (two SVGs), so text keeps its normal colours on top; `ink` reads above 13:1 on the strongest tint.

- `daycare-hero-bg.png` (1920 × 815): two overlapping turquoise blobs (`blob-turquoise`, `blob-turquoise-deep`) entering from the top right. The homepage hero (cover) and the Google Ads hero on wide screens (right top, cover).
- `BG-HomePage-High.png` (1920 × 780): an almost white wash laid over the homepage hero (centre, cover) to soften the blobs.
- `day-care-page-header-blobs.svg` (747 × 542): two turquoise blobs (#8ae0e5 at 24%), the homepage hero below 1025px (at -138px 0 on phones).
- `hero-blobs-mobile.svg` (1200 × 542): the Google Ads hero on narrow screens (-138px 0, natural size).
- `day-care-about-hero-bg.png` (1920 × 1150): turquoise blobs at the top right, the /creare-site-web/ hero.
- `BG-home-new4.png` (1920 × 800): a sky-turquoise blob on the left (#0ac4f5 at 10%) and small lavender ones (`blob-lavender`). The homepage about section and process chart (left -60px, at least 1750px wide), the Google Ads measurement section.
- `BG-Testemonials-home-page.png` (1920 × 620): a lavender blob at the right edge, behind the homepage testimonials.
- `Shapes-icons.png` (1761 × 790): lavender blobs, bottom right of the homepage services and of the Google Ads services (60% wide).
- `BG-Join-Clients.png` (1921 × 1051): faint lavender and turquoise washes, the Google Ads pricing section (centre, cover) and the "Design și UX" section of /creare-site-web/.
- `BG-Service-one.png` (1920 × 774) and `BG-more-Services.png` (1691 × 782): faint washes behind "Ce îți oferă un site de prezentare" and the price boxes on /creare-site-web/.

Sections use `background-size: cover`, or a fixed width where cover would blow the blobs up to twice their drawn size (the homepage process). Let the blobs bleed off the section edge rather than end in a straight line.
