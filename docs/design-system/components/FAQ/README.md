# FAQ

Numbered questions that open in place, with a round + / − toggle.

Markup: `div.ect-faq` with one `details` per question: `summary` holds the question, `p.ect-faq__answer` the answer. Numbers ("01") and the toggle are drawn by CSS. The consumer supplies real customer questions and short, direct answers.

- Ask what clients actually ask ("Onorariul include și bugetul plătit către Google?") and answer in two or three sentences, plainly, with no keyword padding. The page's FAQ structured data must match the visible text.
- Each question row is at least 78px tall and the toggle 44px; focus draws a 3px `ink` outline.
- The homepage still uses the Elementor toggle style (white boxes with `shadow-toggle`, chevrons in `orange`); new pages use this one.
- The toggle outline `line-faq` reads 1.4:1 on `white`.

Hand-written from `ect-pages/google-ads.css` (`.gads-faq`).
