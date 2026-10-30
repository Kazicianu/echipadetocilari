# Chip

Small labels: the white chips with an orange dot that list promises, and the hairline tags of the Google Ads page.

Markup: `ul.ect-chips` of `li.ect-chip` (or one `span.ect-chip`). Tags are `span.ect-tag` or `li.ect-tag`, with `--dot`, `--solid`, `--tint` or `--small`.

- `ect-chip`: `white`, `radius-card`, `shadow-card`, a 7px `orange` dot; `body-sm` (15/21, 300), 16/22.4 from 1025px. The homepage process lists four ("Consultație de 30 de minute, gratuită").
- `ect-chip--flat`: no shadow, 15/20 500, an 8px dot; the "Ne dai tu" list on the store's orange panel (Descrieri, Prețuri, Stocuri, Imagini).
- `ect-tag`: `white` with an inset 1px `line` hairline, 13px 500: informational tags on Google Ads ("Grup: revizie", "Activitate"). Tags are never tinted, except `--tint` (`tint-turquoise`, 12px 600) for "către Google"; `--solid` is `orange` with a `white` label ("Campanie: service centrale").
- Keep labels to a few words. Chips are not buttons: no hover state.
- Contrast: `ink` on `white` 14.9:1, on `tint-turquoise` 13.7:1; `white` on `orange` (solid tag) 2.4:1, kept as the site has it.

Hand-written from `home.css` (`.ect-process__chips`), `creare-magazin-online.css` (`.mg-scope__chips`) and `google-ads.css` (`.gads-tag`).
