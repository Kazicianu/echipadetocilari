Echipa de Tocilari ("the team of nerds") is a digital marketing agency in Bucharest: websites and online shops, apps, SEO and visibility in AI answers, Google Ads, Facebook Ads and website maintenance. The site, echipadetocilari.ro, is Romanian first, with an English version behind the RO | EN switch. The brand is a friendly nerd: orange and white, soft leaf-shaped cards, a mascot with round glasses, a handwritten aside here and there, and plain talk instead of agency jargon.

## Voice and content

- Talk to one person with "tu" and speak as "noi". Short, concrete sentences, a little cheeky, never corporate: "Suntem nerdy și suntem pricepuți." · "Fără 12 ședințe până la un răspuns." · "Vorbești cu un singur om, nu cu un grup." · "Depinde de canal, nu de magie."
- Promise clarity, not magic: "pe înțeles", "fără slides", "Îți spunem și ce nu merită", "Fără asteriscuri." Say what is separate and what is not guaranteed: "Bugetul de publicitate se plătește separat, direct către Google." · "Nu garantăm un număr de cereri sau vânzări."
- Open a service page with the keyword in plain words ("Creare magazin online", "Agenție Google Ads pentru firme"), the price or the offer, then what is included, how we work, what it costs and what it does not include, frequent questions, and the contact form.
- Name the client's worry in their own words before the fix ("„Clienții mă sună să afle dacă mai am pe stoc.”"), then answer it in ours.
- State prices exactly as the site does: "1.490 €", "260 € / lună", "de la" for a minimum, "preț pachet" for a fixed price. Make only verifiable claims; never invent clients, results, reviews or prices.
- Never use the em dash (U+2014): rewrite with a full stop, comma, colon or parentheses. Separate short items with " · ": "Consultație gratuită · 30 de minute · Fără obligații".
- Never use diagonal arrows (U+2196 to U+2199) in text, buttons, links or icons. "→" leads to another page or step ("Vezi ce include →"), "↓" jumps down the page ("Vezi cât costă ↓").
- Write full Romanian diacritics with comma-below ș and ț, and Romanian quotes („...”) in running text.
- Write headings in sentence case in the markup. The Elementor sections (homepage, /creare-site-web/) capitalise every word on screen; the hand-built sections (homepage process, checklist and FAQ, the store page, Google Ads) show sentence case; hero titles are set in capitals.
- Buttons are short invitations in the "tu" form: "Ai o idee?", "Primește o ofertă", "Hai să vorbim", "Discută pachetul Silver", "Trimite". The homepage CTA bolds one word: "Participă la o consultație **GRATUITĂ** de 30 minute".
- No emoji anywhere. Every page ends with `ContactSection` right above the footer.

## Color

- Orange and white carry the brand; `ink` carries the words. Pages and cards are `white`, text is `ink`, secondary text `ink-muted`.
- `orange` fills the brand moments: filled buttons, the highlight chip behind heading words, process bars, the checklist panel, the "Pentru cine e" and "În preț" panels, FAQ answers, recommended badges, the current language, back-to-top. On `white` it marks hero titles, eyebrows, card and package names, numbers and icons.
- Gradients mark the moments that ask for action: `orange-logo` to `orange` at 270deg (Google Ads buttons and cards, the homepage CTA band, the plan picker), `orange-logo` to `orange-hot` at 135deg (the store's "Hai să ne cunoaștem" tile) and `orange-light` to `orange-hot` at 135deg (the contact section).
- Use `orange-deep` when orange must carry small text or focus: focus rings in the header and menus, hovered mobile-menu links and the hovered inactive language, the store's stop labels, receipt values and ticket icons. It passes AA on `white` and the peach tints.
- Warm tints stay quiet: `peach` (icon discs, ticket icons, a bento tile), `peach-menu` (submenu icon discs, the hovered inactive language), `peach-phase` (process phases), `cream` (speech bubbles). Hairlines are `line`; the store adds `line-peach`, `line-step` and `line-menu`.
- Turquoise and lavender live in the background blob sheets and in a few store accents (`blob-*`, `wash-turquoise`, `tint-turquoise`): never as text or button colours.
- `check-green` is only the check in price lists. Status colours belong to the contact form: `success`, `danger`, `info` on their `-soft` fills, always with a message.
- The cookie banner keeps its own neutral `consent-*` palette; use it nowhere else.
- Contrast: `orange` and `white` are 2.4:1 in both directions and the orange gradients 2.1:1 to 3.2:1 with white, under WCAG AA even for large text. The live pages set white on orange and orange on white anyway; this system keeps those pairs exactly as they are and flags each in its token and component notes. Passing pairs that exist today: `ink` on `orange` (6.1:1), `orange-deep` on `white` (5.9:1), `orange` on `ink` (6.1:1), `white` on `ink` (14.9:1).

## Type

- Set everything in Montserrat (`--font-sans`, variable 100 to 900). Hierarchy comes from weight: 300 body, 500 headings, 600 buttons and labels, 800 to 900 for heroes, numbers and panel titles.
- Hero: `kicker` (21px, `ink`) above `display` (45/54, 900, capitals, `orange`); Google Ads uses `display-ads` (54px), /creare-site-web/ `kicker-lg` over `display-site` (64px).
- Sections: `eyebrow` (18px, 300, `orange`) above `h2` (45/54, 500), then `lead`. The ladder is 45px on desktop, 32px on tablet, 7.5vw on phones. Titles on an orange panel use `h2-heavy` (44px, 800, tight tracking).
- Cards: titles `h3-sm` to `h3` (20 to 22px, 500), text `body` (16/22.4, 300). Copy on `orange` moves to 400 so thin strokes survive.
- `scribble` and `scribble-lg` (Caveat ECT, `--font-hand`) are for one short handwritten aside per section, rotated a few degrees, never for information people need.
- `button-cta` (Noto Sans 500) belongs to the header button only; `testimonial-name` (Varela Round) to the testimonial names only.
- Stay at 13px or above for running text; 11 and 12px are for uppercase labels (`micro-caps`, `label-caps`) and tags.

## Layout and spacing

- Design mobile first, then widen. Check every page at 360 and 390px and on desktop: no horizontal overflow, no clipped text.
- Content widths: `content-max` (1150px) for the hand-built sections, `contact-max` (1200px) for the contact section and footer, `ads-max` (1240px) on Google Ads, `header-max` (1300px) for the header, `section-max` (1400px) for Elementor sections; 20px side gutters (`space-20`).
- Breakpoints: `bp-mobile` (767px) and `bp-tablet` (1024px); the hand-built sections also switch at 600, 960 and 1100px, and Google Ads on its container at 760, 900 and 1100px.
- Section padding is generous: about 50px on phones and 70 to 110px on desktop (`space-50` to `space-120`). Card grids use 14 to 20px gaps; panels and plans 20 to 30px.
- Every tappable thing is at least `target-min` (44 × 44px).

## Shape, elevation and backgrounds

- The leaf card is the signature: three `radius-card` corners and one big bottom-left corner, `radius-leaf` (70px) on large cards, `radius-leaf-sm` (40px) on small ones. Service tiles, link and feature cards, price cards, process cards, bento tiles, panels and FAQ side cards all use it.
- Buttons are pills (`radius-button`); chips, tags and fields use `radius-card`; speech bubbles and big panels `radius-panel`; number badges and icon discs are circles.
- Elevation is a soft glow with no offset: `shadow-card` at rest (cards, chips, the desktop header menu pill), `shadow-dropdown` for the desktop services submenu; interactive cards lift 10px and glow orange (`shadow-card-hover`). Recommended packages glow orange at rest (`shadow-recommended`). The store's paper pieces (tickets, receipt, metro cards) cast offset shadows tinted with their surface.
- Outlines: 3px `orange` on price cards and site type cards, 2px on outline buttons and link cards, 2px dashed on the "Pe lângă preț" panel and the Google Ads process line.
- Backgrounds are `white` with pale blob sheets bleeding off the section edges (`assets/Backgrounds`); the contact section sits on its orange gradient with white waves top and bottom.

## Imagery

- The logo is a white line drawing of a nerd (round glasses, bow tie, three strands of hair) on an `orange-logo` blob. Use the files as they are; never redraw or recolour them. There is no wordmark: the name is set in type.
- The homepage uses two animated cartoon nerds (Lottie): the hero's propeller-hat nerd and the meditating nerd beside "ECHIPA DE TOCILARI".
- Service pages use 3D pictures, warm and colourful on white: the jumping nerd in a VR headset (/creare-site-web/ hero), a website mock-up with tiny figures and a 3D pointer (same page), the developer at a desk (`work.png`), the bearded client with a parcel (FAQ) and the nerd with a laptop on the store's "Pentru cine e" panel.
- Give each illustration its `width` and `height`; describe it in `alt` only when the text around it does not say the same thing.

## Iconography

- Service marks (homepage tiles, the maintenance band, Google Ads related cards) are custom outline drawings on a 75 × 66 box, `orange`, the first path a faint blob.
- Interface icons are 24px strokes with round caps and joins: the services menu (1.6, `orange`), the store's tickets, stops and cards (1.5 to 1.8, `orange-deep` or `ink`), the Google Ads checks, crosses and refresh. Paint them with `currentColor` when inlined.
- Glyphs from Font Awesome 5 Free: back-to-top arrow, the "Despre noi" arrow, the comparison chevron, the check-circle in price lists, Facebook and LinkedIn.
- Typographic marks do the rest: "+" and "−" on FAQ toggles, "→" and "↓" on links. Never emoji, never diagonal arrows; `service-seo.svg` and `service-google-ads.svg` draw one and stay only where they are today.
- Icons beside text that says the same are `aria-hidden="true"`; a check or dash that is the only content of a table cell gets an `aria-label`.

## Motion and states

- Hover: cards lift 10px with the orange glow (0.3s); outline buttons fill `orange`; filled buttons turn `white` with an `orange` label and border; arrow chips slide; back-to-top grows to 110%.
- Press: Google Ads buttons, plan tabs and arrow chips scale to 0.98.
- Focus: always visible. 3px `ink` 5px out on buttons and FAQ controls; 2px `orange-deep` 3px out in the header, submenu and language switch; 2px `consent-ink` in the cookie banner.
- Decorative motion: the checklist scrolls in 42s loops with speech bubbles popping on a 12s cycle; the store's metro van drives the line; sections reveal on entry.
- Respect `prefers-reduced-motion`: stop the loops, drop the lifts and scales, keep colour changes. Never rely on hover for navigation.

## Accessibility rules

- Every form field has an accessible name and the right type and autocomplete; Google Ads shows visible labels.
- FAQs use native `details` and `summary`, so they work with the keyboard and without script; mark the one-open-at-a-time groups with a shared `name`.
- Charts and scrollers that move sideways (`ProcessGantt`, the Google Ads services) are focusable regions with a label.
- Text contrast: see Color. The failing pairs are named in the notes of `orange`, `orange-logo`, `orange-light`, `orange-hot`, `field`, `ink-soft`, `check-green`, `mute` and in each component's notes.

## Components

Each component has a static preview and a guide. Class names use the site's `ect-` prefix; every colour, radius and shadow reads from the tokens.

- Navigation: `Header`, `ServicesMenu`, `LanguageSwitch`, `MobileMenu`, `Footer`, `BackToTop`, `CookieConsent`.
- Actions: `Button`, `TextLink`.
- Content: `Hero`, `SectionHead`, `Highlight`, `Chip`, `HandwrittenNote`, `SpeechBubble`.
- Cards: `ServiceCard`, `ServiceBand`, `LinkCard`, `FeatureCard`, `TypeCard`, `PriceCard`, `BentoTile`, `Ticket`, `Receipt`, `ScopePanel`.
- Process: `ProcessGantt`, `ProcessSteps`, `StepList`, `MetroLine`.
- Sections: `ChecklistBand`, `CTABand`, `Testimonial`, `FAQChat`, `FAQAccordion`, `CostEquation`, `PlanPicker`, `ComparisonTable`, `ContactSection`.

## Not synced

Built only from the homepage, /creare-magazin-online/, /creare-site-web/ and /agentie-google-ads/, the shared header and footer, the contact section and the cookie banner, as the repository builds them at 576228d (23 October 2026); the header menu was brought in line with 9fc0ca6 (30 October 2026): the desktop pill with its sliding highlight, the plain tablet menu, the seven services and the phone menu. Not carried over: the store hero's phone mockup and notification banners (their own greys, Georgia in the banner), the Google Ads search-results mockup (Google's colours and Arial), the fills inside the Lottie animations and the 3D pictures, the store's box character, delivery van, clouds, trees and hero sun, the Elementor kit colours these pages never render (Secondary #6bf2e9, #f9f9f9, #7e222200 as a visible colour), Elementor scroll effects, the testimonial carousel behaviour (Swiper) and the FAQ mascot's canvas animation. The components are hand-written static renditions of `ect-pages/home.css`, `creare-magazin-online.css`, `google-ads.css`, `desktop-header.css`, `service-menu.css`, `mobile-menu.css`, `consent.css`, `ect-contact.css` and the Elementor CSS of posts 3359, 3355, 3381 and 3471; no component library was built.
