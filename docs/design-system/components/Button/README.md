# Button

A pill-shaped link or button in one of the seven variants the live pages use.

Put `ect-btn` and one variant class on an `<a>` or `<button>`. The label is the content; an optional icon goes inline as `<svg>` (1em, painted with `currentColor`).

| Variant | Class | On the site |
| --- | --- | --- |
| Filled | `ect-btn--primary` | Elementor buttons such as "Despre noi" and "Comandă acum!": `orange` fill, `white-warm` label; on hover the fill turns `white` and a 3px `orange` border appears |
| Outline | `ect-btn--outline` | About and Logo design ("Hai să ne cunoaștem"): `white` with a 2px `orange` border and `orange` label, filling `orange` on hover. Add `ect-btn--lg` for the homepage hero |
| Ink outline | `ect-btn--ink` | The Google Ads page ("Solicită o discuție"): `ink` label, 52px tall, `orange` fill on hover, `peach` and 98% scale when pressed |
| On brand | `ect-btn--on-brand` | A white button on an orange band or panel, label `orange-hot` |
| Text | `ect-btn--text` | The quiet action beside an ink outline button ("Vezi ce include ↓") |
| Submit | `ect-btn--submit` | The contact form ("Trimite") |
| Header | `ect-btn--header` | "Ai o idee?" in the header, set in Noto Sans |

- Give a view one main action, and pair it with a text button or a `TextLink` rather than a second filled button.
- Write short invitations in the "tu" form, verb first. Bold one word at most: "Participă la o consultație <b>GRATUITĂ</b> de 30 minute".
- Keep every button at least 44px tall; add `ect-btn--block` to fill a card (price cards do).
- Contrast: the labels of the filled, outline and submit buttons are `white` on `orange` or `orange` on `white` (2.4:1), the on-brand label is `orange-hot` on `white` (3.2:1), the header label `white` on `orange-logo` at 89% (2.6:1). The ink outline button passes in every state (`ink` on `white` 14.9:1, on `orange` 6.1:1).

Hand-written from the Elementor button rules on the homepage (elements 4e66a892, 3f5947e and the form a3688cf) and the header (682f9a60), and from `ect-pages/about.css`, `logo-design.css` and `google-ads.css`.
