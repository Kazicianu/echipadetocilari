# ChecklistBand

The homepage band that names the problem: an endless to-do list scrolling on an orange panel, the client's doubts popping up as speech bubbles, and the promise beside it.

Markup: `section.ect-checklist > .ect-checklist__shell > .ect-checklist__panel` with `.ect-checklist__board > .ect-checklist__stage > ul.ect-checklist__track` (the tasks, listed twice so the loop is seamless, `aria-hidden="true"`), `.ect-checklist__copy` (`p.ect-checklist__eyebrow`, `h2.ect-checklist__title`) and `ul.ect-checklist__quotes` of `li.ect-bubble` (`aria-hidden="true"`). Add `ect-checklist--still` for a still frame.

- Panel: `orange` with a 1px `orange` border and `radius-panel`, 480px tall, the list on the left and the words on the right; the shell is 128px narrower than the page (48px from 1024px, full width on phones).
- Task rows: `white` with a 1px `line-peach` border and `radius-xs`, `row` type (13/20); a 14px `warm-gray` checkbox at the start and a dotted handle at the end. The list scrolls up in 42s, endlessly.
- Words: eyebrow 16/1.4 500 and title `h2-heavy` (44px max, 800, -0.035em), both `white`.
- Bubbles: six `SpeechBubble`s placed around the panel, each tilted, appearing for about four seconds of a twelve-second loop, staggered. With reduced motion the list stops and two bubbles stay.
- On phones the title moves above the list and the bubbles share the list's area.
- Contrast: `white` on `orange` is 2.4:1, below AA (the 44px title still misses 3:1); kept as the site has it. Task rows (`ink` on `white`) and bubbles (`ink` on `cream`) pass.

Hand-written from `home.css` (`.ect-checklist`).
