# Highlight

An orange chip behind one or two words of a heading, like a marker stroke.

Wrap the words in `span.ect-hl` inside an H2. The text keeps the heading colour, so it is `ink` on `orange` (6.1:1).

- One highlight per heading, on the words that carry the point ("Cum lucrăm <span class="ect-hl">cu tine</span>").
- The chip follows the text: padding 0.02em 0.16em 0.08em, `radius-card` corners, and it repeats on each line when the words wrap.
- Never put `white` text on it.

Hand-written from `ect-pages/home.css` (`.ect-process__hl`) and `about.css` (`h2 > span`).
