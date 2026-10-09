# SpeechBubble

A small cream speech bubble with a tail, used to voice what a client might be thinking.

Markup: `p.ect-bubble` (or `li`), with an optional `style="--r: -5deg"` to tilt it. The consumer supplies a first-person thought of four to seven words, in the client's voice: "Nu știu de unde să încep", "Pe telefon nu se vede bine".

- Bubbles sit on the orange checklist panel or next to an illustration, two to six at a time, each tilted between -8 and 7 degrees.
- 13px/600 `ink` on `cream` (13.8:1), `radius-panel` corners, a drop shadow tinted brown.
- On the homepage they pop in one after another on a 12s loop; with reduced motion only two stay visible, still.

Hand-written from `ect-pages/home.css` (`.ect-checklist__quotes`).
