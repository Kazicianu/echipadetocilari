# FAQAccordion

Numbered questions in white cards that open in place; the Google Ads FAQ, beside an orange "Ai altă întrebare?" card.

Markup: a column of `details.ect-faq-acc__item` (same `name`, one open at a time), each with `summary` (`span.ect-faq-acc__num`, `span.ect-faq-acc__q`, `span.ect-faq-acc__plus`) and `div.ect-faq-acc__a` (paragraphs; an optional `p.ect-faq-acc__source` with an outside link). Beside it, `div.ect-ask` with `h3`, `p` and `a.ect-btn.ect-btn--on-orange`.

- Item: `white`, `radius-card`, `shadow-card`; open, an inset 2px `orange` ring is added. Row at least 68px, 20px × 22px padding, 18px gaps; question 17/1.35 500 (16px on narrow screens); number 14px 800 `orange`; a 32px `orange` disc with "+" or "−" in `white`.
- Answer: 16/1.55 300, indented under the question (58px left, 70px right on wide screens). Links inside are `orange` 600; a source line is 14px with an `ink` link.
- Side card: the `orange-logo` to `orange` gradient with `shadow-glow` and the leaf corner (`radius-leaf`), 28px × 28px × 40px; title 20px 500, text 15px 400, both `white`.
- Heading: `ect-eyebrow--blue` ("Răspunsuri drepte") over an `orange` `h2` ("Întrebări frecvente despre Google Ads").
- Answer the question in the first sentence ("Nu.", "Da."), then the condition. Point to an official source when a claim is Google's own.
- Contrast: the `orange` number and the `white` sign on `orange` are 2.4:1, below AA; kept as the site has them. Answers pass (14.9:1).

Hand-written from `google-ads.css` (`.gads-faq-item`) and the Google Ads FAQ section.
