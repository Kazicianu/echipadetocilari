# Backgrounds

Pale blob sheets that sit behind sections on `white`. They are drawn as transparent PNGs (one SVG), so text keeps its normal colours on top; `ink` reads 13.5:1 on the strongest tint.

- `daycare-hero-bg.png` (1920 × 815): two overlapping turquoise blobs, `blob-turquoise` and `blob-turquoise-deep`, entering from the top right. The About hero (centre, cover) and the Google Ads hero (right bottom at 64% of the height on mobile; right top at full height from 960px).
- `BG-home-new4.png` (1920 × 800): a sky-turquoise blob on the left (#0ac4f5 at 10%) and small lavender ones (`blob-lavender`). Behind the homepage process section (left -60px, 1750px wide) and the About team section.
- `BG-Join-Clients.png` (1921 × 1051), `BG-Service-one.png` (1920 × 774), `BG-more-Services.png` (1691 × 782): faint lavender and turquoise washes for the sections further down (About values and story, Google Ads "Ce include").
- `day-care-page-header-blobs.svg` (747 × 542): two turquoise (#8ae0e5) blobs at 24% opacity; the hero of the Logo design page, positioned at calc(0% - 138px) 0% and covering.

Sections use `background-size: cover`, or a fixed width where cover would blow the blobs up to twice their drawn size (the homepage process section). Let the blobs bleed off the section edge.
