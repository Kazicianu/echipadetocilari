# PriceCard

A package card with its price and what it includes; the store, /creare-site-web/ and Google Ads each have their version.

Markup: `article.ect-price` with `h3.ect-price__name`, optional `p.ect-price__for`, `p.ect-price__from`, `p.ect-price__amount`, `ul.ect-price__list` (each `li` starts with the `check-circle` icon, inline) and a button. Add `ect-price--recommended` (with `p.ect-price__badge` "Recomandat" on the store), `ect-price--site` for /creare-site-web/ or `ect-price--plan` for the monthly Google Ads plans (`p.ect-price__intro`, `p.ect-price__limit`, `p.ect-price__note`, `p.ect-price__includes`, the price with a `small` "/ lună").

- Card: `white`, a 3px `orange` border, the leaf corner (`radius-card`, `radius-leaf` bottom left), `shadow-card`, 68px × 48px padding (40 × 24 on narrow plans), 20px between parts; cards sit 20px apart (30px for the plans), at most 420px wide.
- Name `card-name` (25/30, 500) in `orange`, centred (capitalised on the store and site; 20px on narrow plans). "For whom" 14px `ink-muted`. Price `price` (46px, 600; 35px on narrow plans).
- List `list` (16/22.4, 500), the 15px `check-green` check-circle before each line, 10px apart (12px on plans).
- Buttons: `ect-btn--primary` (store), `--primary --ringed` (site), `ect-btn--plan` (Google Ads), centred under the list.
- Recommended: `shadow-recommended` at rest; the store adds the orange "Recomandat" pill on the top edge. Hover lifts any card 10px (`shadow-card-hover`; `shadow-glow-strong` for the recommended store card; `shadow-glow` on the site).
- State the price as the site does: "1.490 €" with a space before €, "de la" when the price is a minimum, "preț pachet" when it is fixed.
- Contrast: the `orange` name is 2.4:1 and the `check-green` icons 2.8:1 on `white`, both below the floor for text and meaningful icons; the badge is `white` on `orange` (2.4:1). Kept as the site has them; the text of each line carries the meaning.

Hand-written from `creare-magazin-online.css` (`.mg-pcard`), the Elementor price boxes on /creare-site-web/ (post 3471) and `google-ads.css` (`.gads-plan`).
