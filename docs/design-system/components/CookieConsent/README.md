# CookieConsent

The cookie banner on every page: a short notice with three equal pills, and a settings view with the two categories.

Markup: `section.ect-consent[role="region"][aria-label="Preferințe cookie-uri"]` (add `ect-consent--floating` to pin it bottom-left) holding two `div.ect-consent__view`s. Summary: `p.ect-consent__copy` with `a.ect-consent__link` ("Află mai multe") and `div.ect-consent__actions.ect-consent__actions--summary` with three `button.ect-consent__pill` (`--ghost` "Setări", `--solid` "Refuz toate", `--solid` "Accept toate"). Settings: `.ect-consent__head` (`p.ect-consent__title` + copy), `.ect-consent__categories` with one `label.ect-consent__category` per category (`input.ect-consent__check`, `.ect-consent__name`, `.ect-consent__desc`), and the actions with "Salvează preferințele" as `ect-consent__pill--wide`.

- The banner keeps its own neutral palette, apart from the brand: `consent-surface`, a 1px `consent-line` border, 20px corners and `shadow-consent`; text `consent-ink` at 14/1.45; descriptions `consent-ink-soft`.
- Refuse and accept always look the same (`consent-solid` with `consent-on-solid` labels): never make accepting more prominent than refusing.
- Pills are at least 44px tall, `radius-pill`, 14px 500. Ghost hover adds a 4% black wash; solid hover is `consent-solid-hover`. Focus is a 2px `consent-ink` ring.
- From 481px the card floats 1rem from the bottom-left corner, at most 24.5rem wide; on phones it spans the width with 0.75rem gutters.
- The footer's "Setări cookie-uri" reopens the settings view.
- Contrast: `consent-ink` on `consent-surface` 15.0:1, `consent-on-solid` on `consent-solid` 17.2:1, `consent-ink-soft` on `consent-surface` 6.1:1.

Hand-written from `consent.css` and the markup `consent.js` builds (copy from its Romanian strings).
