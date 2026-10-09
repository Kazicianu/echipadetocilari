# Echipa de Tocilari design system

Echipa de Tocilari ("the team of nerds") is a digital marketing agency in Bucharest: websites and online shops, SEO and visibility in AI answers, Google Ads, Facebook Ads, website maintenance, logo design and apps. The site, echipadetocilari.ro, is Romanian first, with an English version generated from it. The brand is a friendly nerd: orange and white, soft rounded cards, a mascot with round glasses, and plain talk instead of agency jargon.

## This folder

The live, editable version is the "Echipa de Tocilari" design system in your Claude artifacts: https://claude.ai/artifact/FBMd1CsMctdi8oa9w1o7eD. This folder is a copy kept with the site's code, saved on 10 October 2026 from commit ca87b3e plus the local changes up to 9 October. The colours are the site's current ones, unchanged.

- `tokens.json`: every token (colours, type styles, spacing, radii, shadows, layout values) with a usage note.
- `tokens.css`: the same tokens as CSS custom properties, the `@font-face` rules and a `.ds-<style>` class per type style. Load it first, then `components/bundle.css`.
- `components/`: one folder per component with its guidelines (`README.md`) and a static preview (`preview.html`, opens in a browser). `components/bundle.css` holds the `ect-` component styles; `components/Cover/preview.html` is the cover image of the system.
- `fonts/`: Montserrat (variable, Latin and Latin Extended), Caveat ECT 600 and Noto Sans 500.
- `assets/`: logos, icons, illustrations (with the two Lottie mascots) and the blob backgrounds, each group with a README.

## Voice and content

- Talk to one person with "tu" and speak as "noi". Short, concrete sentences, a little cheeky, never corporate: "Suntem nerdy și suntem pricepuți." · "pentru promovarea online de care chiar ai nevoie, nu pentru cea din broșuri" · "Fără 12 ședințe până la un răspuns." · "Vorbești cu un singur om, nu cu un grup."
- Promise clarity, not magic: "pe înțeles", "fără slides", "Îți spunem și ce nu merită", "Depinde de canal, nu de magie."
- Open every page with what we do, for whom and which problem it solves, then deliverables, process, costs and conditions. Answer real customer questions in a short FAQ; never pad it with keyword questions.
- Make only verifiable claims. Never invent clients, results, reviews, certifications, prices or sources.
- Never use the em dash (U+2014): rewrite with a full stop, comma, colon or parentheses. Use " · " to separate short items: "Consultație gratuită · 30 de minute · Fără obligații".
- Never use diagonal arrows (U+2196 to U+2199) in text, buttons, links or decorative navigation, including icons that draw one. Horizontal and vertical arrows are in use: the band CTA ends in " →", in-page links in " ↓".
- Write full Romanian diacritics with comma-below ș and ț (not ş, ţ).
- Write headings in sentence case in the markup ("Cum te putem ajuta, concret?"). The Elementor pages and the About page capitalise every word on screen; the display H1 is set in capitals; the Google Ads page and the checklist band show sentence case.
- Buttons are short invitations in the "tu" form: "Ai o idee?", "Hai să ne cunoaștem", "Vezi ce include", "Trimite", "Solicită o discuție". The hero button sets one word in bold capitals: "Participă la o consultație **GRATUITĂ** de 30 minute".
- No emoji anywhere in the interface.
- Every page ends with the contact form (`ContactSection`) directly above the footer, in Romanian and English. A button to the Contact page does not replace it.
- Name the company "Echipa de Tocilari"; the legal entity is Echipa de Tocilari SRL.

## Color

- Orange and white carry the brand; `ink` carries the words. Use `white` for the page and cards and `ink` for text.
- Use `orange` for fills (filled buttons, process steps, the highlight chip, the checklist panel, the active language, back-to-top), for icons, and for display headings, eyebrows and card titles on `white`.
- Contrast: `orange` against `white` is 2.4:1 in both directions, under WCAG AA even for large text. The current pages set orange headings and labels on white and white labels on orange anyway. The passing pairs that already exist are `ink` on `orange` (6.1:1, the Google Ads button hover) and `orange-deep` on `white` (5.9:1, the header submenu).
- `orange-logo` is the logo's own orange. On the site it is the header button fill, the menu hover text and the first stop of the CTA gradients.
- Orange gradients mark conversion moments: the contact section runs 135deg from `orange-light` to `orange-hot`; CTA bands run from `orange-logo` through `orange` to `orange-light`; the About CTA runs 270deg from `orange-logo` to `orange`.
- Warm tints stay quiet: `peach` for number circles, pressed buttons and open toggles, `cream` for speech bubbles, `surface-soft` for an alternate section. Hairlines are `line`.
- Secondary text is `ink-muted` on the Google Ads page and `slate` in the header menu.
- Turquoise and lavender appear only as pale background blobs (`blob-turquoise`, `blob-turquoise-deep`, `blob-lavender`) and inside the illustrations. `turquoise` (the Elementor Secondary) is not a UI colour.
- Status colours belong to the contact form: `success` on `success-soft`, `danger` on `danger-soft`, `info` on `info-soft`, always with a message that says what happened.

## Type

- Set everything in Montserrat (`--font-sans`). Hierarchy comes from weight: 300 for body text, 500 for headings, 600 for buttons and labels, 900 for the hero display line.
- Hero: `kicker` (21px, `ink`) above `display` (45/54, 900, capitals, `orange`), then `body` or `lead`.
- Sections: `eyebrow` (18px, 300, `orange`) above `h2` (45/54, 500), then `lead` or `body`. The heading ladder is 45px desktop, 32px tablet, 7.5vw mobile.
- Cards: `h3` (20/24, 500) and `body` (16/22.4, 300). Body text drops to 15px on tablet and mobile.
- Use `scribble` (Caveat ECT, `--font-hand`) for one short handwritten aside per section, rotated a few degrees, never for information people need.
- `button-cta` (Noto Sans 500) belongs to the header button only.
- The smallest text is `micro` (11px) on the Google Ads page; elsewhere stay at 13px or above.

## Layout and spacing

- Design mobile first, then widen for tablet and desktop. Check every page at 360 and 390px and on desktop: no horizontal overflow, no clipped text, nothing essential hidden on mobile.
- Content sits in `content-max` (1150px) with 20px side gutters (`space-20`); Elementor sections cap at `section-max` (1400px), the Google Ads page at `ads-max` (1280px).
- Breakpoints: `bp-mobile` (767px) and `bp-tablet` (1024px) on Elementor; the hand-built sections also switch at 600, 640, 960 and 1100px.
- Sections breathe: `space-50` on mobile, `space-80` on desktop. Card grids use `space-20` to `space-40` gaps.
- Every tappable thing is at least `target-min` (44 × 44px).

## Shape, elevation and backgrounds

- The leaf card is the signature: three `radius-card` corners and one `radius-leaf` corner bottom-left (`radius-leaf-sm` on smaller cards and on mobile). Use it for service, feature, price and specialty cards, process steps and the band.
- Buttons are pills (`radius-button`); chips, fields and phase labels use `radius-card`; number badges are circles.
- Elevation is a soft glow with no offset: `shadow-card` at rest. Interactive cards lift 10px and glow orange on hover (`shadow-card-hover`).
- Backgrounds are white with pale turquoise and lavender blob sheets bleeding off the section edges (Backgrounds assets). The contact section sits on the orange gradient with white wave dividers top and bottom.

## Imagery

- The logo mascot is a white line drawing of a nerd (round glasses, bow tie, three strands of hair) on an `orange-logo` blob. Use the logo files as they are; never redraw or recolour them. There is no wordmark: the name is set in type.
- The homepage hero and the "Echipa de Tocilari" section use two animated cartoon nerds (Lottie): a bearded nerd whose propeller hat pops off, and a nerd with glasses meditating.
- Service pages and the Google Ads hero use 3D character illustrations of people at desks and laptops, warm and colourful, on white.

## Iconography

- Service icons (homepage cards and band) are custom outline icons drawn on a 75 × 66 box with a faint blob behind them (the blob path at 5% opacity), painted `orange` through CSS `color` and `fill`.
- The Google Ads and About pages use 24px stroke icons (1.5 to 1.8 stroke, round caps and joins) in `orange`, shown at 44 to 48px.
- Interface glyphs come from Font Awesome 5 Free (Elementor inline SVG): arrow-up for back-to-top, chevrons for the homepage FAQ, Facebook and LinkedIn in the footer.
- Typographic marks do the rest: "+" and "−" on FAQ toggles, "✓" in `orange-check` in price lists, " →" after the band CTA, " ↓" on in-page links.
- Never emoji, never diagonal arrows. Icons are decorative (`aria-hidden="true"`) next to text that says the same thing.

## Motion and states

- Hover: cards lift 10px with the orange glow (0.3s ease); outline buttons fill `orange`; filled buttons turn white with an `orange` label and border; the back-to-top button grows.
- Press: Google Ads buttons scale to 0.98 and fill `peach`.
- Focus: a visible outline, 3px `ink` with 5px offset on the Google Ads page, 2px `orange-deep` with 3px offset in the header menu.
- Decorative motion: the homepage checklist scrolls in 42s loops and its speech bubbles pop in on a 12s cycle; sections fade up on entry.
- Respect `prefers-reduced-motion`: stop the loops, drop the lifts, keep only colour transitions. Under `prefers-contrast: more` the Google Ads page swaps card shadows for 1px `ink` borders and turns orange H2s `ink`.
- Never rely on hover for navigation.

## Accessibility rules

- Labels: every form field has an accessible name (the contact form adds `aria-label` at build time) and the right input type and autocomplete.
- Targets: 44 × 44px minimum.
- Text contrast: see Color. The failing pairs live in the token notes for `orange`, `orange-logo`, `orange-light`, `orange-hot`, `field` and `line-faq`.

## Components

Each component has its own page with a static preview. Class names use the site's `ect-` prefix and every colour, radius and shadow reads from the tokens.

- `Button`: filled, outline, ink-outline, on-brand, text, submit and the header button.
- `TextLink`: underlined inline links.
- `Card`: the leaf card, for services and features.
- `Band`: a full-width link card with icon, text and CTA.
- `SectionHead`: eyebrow, H2 and lead.
- `Highlight`: the orange chip behind a word in a heading.
- `Chip`: a white pill with an orange dot.
- `ProcessStep`: an orange step card with a number badge.
- `Steps`: numbered steps in a row.
- `FAQ`: numbered questions with a round +/− toggle.
- `PriceCard`: package, price, list and button.
- `CTAPanel`: the orange call-to-action panel.
- `ContactSection`: the orange contact section with the form card.
- `Header`, `LanguageSwitch`, `Footer`, `BackToTop`.
- `SpeechBubble`, `HandwrittenNote`.

## Not synced

Built from the echipadetocilari repository (local copy of ca87b3e with changes up to 9 October 2026). Not carried over: Varela Round, the Elementor kit's Primary font, because the live pages override it with Montserrat except one heading on /services/ and the homepage testimonial names; kit colours #FFFFFFE6 (unused) and #7E222200 (transparent, used as an invisible 3px button border); the page-transition colour #FFBC7D; one-off colours on older pages (#3d4459, #4632da, #00dafc, #34b233, #828282); the focus colours #4f4482 (About) and #008b9b (Portfolio); the Astra Portfolio plugin greys; Elementor image and button shadows on the older pages. The components are hand-written static renditions of `legacy-mirror/wp-content/ect-pages/*.css`, `ect-contact.css`, `scripts/i18n/lang-switcher.mjs` and the Elementor page CSS; the checklist band, the process chart, the portfolio grid, the testimonial carousel, the Google Ads contents bar and its budget and measurement cards are not built.
