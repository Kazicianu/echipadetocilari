# PriceCard

A package card: name in a tinted band, the price, who it is for, what it includes, and a button.

Markup: `article.ect-price` (add `ect-price--featured` to one card at most) with `h3.ect-price__name`, then `.ect-price__body` holding `p.ect-price__amount` (price plus `<small>` for the period), `p.ect-price__desc`, `ul.ect-price__list` and an ink outline button (`ect-btn ect-btn--ink`). Lay three side by side in `.ect-prices`.

- Show real prices only, the ones in the offer; say what is not included in a note under the cards ("Bugetul de publicitate se plătește separat către Google.").
- List items start with what the client gets, three to five per card; the next package starts with "Tot ce include pachetul …".
- The featured card swaps the `peach` band for `orange` and adds `shadow-featured`.

Hand-written from `ect-pages/google-ads.css` (`.gads-price`).
