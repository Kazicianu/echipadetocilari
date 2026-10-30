# FAQChat

Frequently asked questions as a chat: each question is a white bubble from the client, each answer an orange bubble from us. Used on the homepage and the store page.

Markup: `section.ect-faq-chat > .ect-faq-chat__inner` with `.ect-faq-chat__intro` (`p.ect-faq-chat__eyebrow`, `h2.ect-faq-chat__title`, `p.ect-faq-chat__subtitle`, an `ect-btn--outline` "Hai să vorbim", then `figure.ect-faq-chat__mascot > img`) and `.ect-faq-chat__conversation` of `details.ect-faq-chat__item` (give them the same `name` so one opens at a time), each with `summary.ect-faq-chat__q` (the text, then `span.ect-faq-chat__sign`) and `div.ect-faq-chat__a`.

- Question: `white` with a 1px `line` outline and a tail at the bottom left, corners `radius-panel` (square bottom-left), `faq-question` (16/1.6, 500; 15px on phones). Hover turns the outline `line-faq`; open turns it `orange`. The plus sign becomes a minus in `orange`.
- Answer: `orange` with a tail at the bottom right, corners `radius-panel` (5px bottom-right), `faq-answer` (16/1.75, 400) in `white`, indented 62px from the left on wide screens.
- Intro: eyebrow 18px 300 `orange`, title 45px 500 (sentence case, at most 380px), subtitle 18/1.4 300, then the 3D mascot (280px; `faq-client-3d.webp`).
- Answers are short and frank, in the agency's voice ("Depinde de canal, nu de magie."). The first item is open.
- Below 960px the intro sits above the conversation with a 160px mascot; below 600px the mascot centres under the text.
- Contrast: `white` answers on `orange` are 2.4:1, below AA; kept as the site has it. The `orange` outline of an open question is a state mark at 2.4:1 (below 3:1).

Hand-written from `home.css` (`.ect-home-faq`).
