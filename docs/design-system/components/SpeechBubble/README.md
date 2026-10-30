# SpeechBubble

Cream speech bubbles that voice a client's doubts, and the question-and-answer pair of the Google Ads report.

Markup: `p.ect-bubble` (or `li.ect-bubble`) for a quote; tilt it with `--r`. For a conversation, `.ect-qa` holds `p.ect-qa__label`, then alternating `div.ect-bubble.ect-bubble--question` and `div.ect-answer` (the logo `img`, `h3.ect-answer__title`, `p.ect-answer__text`).

- Quote bubbles: `cream`, `radius-panel`, `bubble` (13px 600), a small tail at the bottom left and `shadow-bubble` as a drop shadow. On the homepage checklist they pop in and out over the orange panel ("Nu știu de unde să încep", "Asta chiar îmi aduce clienți?").
- Questions: the same `cream` with a square bottom-left corner (`radius-status`), 15px 600, `shadow-bubble-soft`, aligned left.
- Answers: `white` cards aligned right, corners `radius-card` / `radius-status` / `radius-leaf-sm`, `shadow-soft`, the 30px logo, a 16px 600 title and a 15px 300 text.
- Write quotes in the client's words, first person, as they would say them; answers in the agency's plain voice.
- Contrast: `ink` on `cream` 13.8:1.

Hand-written from `home.css` (`.ect-checklist__quotes`) and the Google Ads measurement section.
