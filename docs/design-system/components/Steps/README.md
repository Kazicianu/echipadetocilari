# Steps

Numbered steps with peach number circles, for a process explained in four moves.

Markup: `ol.ect-steps` with `li` items holding `span.ect-steps__num` ("01"), `h3.ect-steps__title` and `p.ect-steps__text`. The consumer supplies the steps.

- Mobile: one column, number on the left, a thin `line-step` connector between steps. From 640px two columns; from 960px four, with the 48px number above the title.
- Use it for a calmer process than `ProcessStep`, inside text-heavy pages.

Hand-written from `ect-pages/google-ads.css` (`.gads-steps`).
