# CostEquation

The Google Ads cost explained as a sum: the advertising budget paid to Google plus our management fee equals your monthly cost.

Markup: `div.ect-cost` with two `div.ect-cost__term` (a `div` with `h3` and `p`, then an `ect-tag`), `span.ect-cost__op` ("+" then "=", `aria-hidden="true"`) between them, and `div.ect-cost__result`.

- Terms: `white`, `radius-card`, `shadow-card`, 16px × 22px; title 17px 500, description 14px 300. Who gets the money is a tag: `ect-tag--tint` "către Google", `ect-tag--small` "către noi".
- Operators: 32px `orange` discs with a 20px 500 `white` sign.
- Result: the `orange-logo` to `orange` gradient pill (`radius-button`) with `shadow-glow` and 16px 600 `white` text: "Costul tău lunar".
- At most 460px wide, next to the pricing heading. Keep the two parts in this order: budget first, fee second.
- Contrast: `white` on the operators and the result is 2.4:1 to 2.8:1, below AA; kept as the site has it.

Hand-written from the Google Ads pricing section (inline styles).
