# Ticket

The store's "Pentru cine e" panel: tickets torn in two, the client's worry on top and our fix underneath, with a 3D character leaning over the panel.

Markup: `section.ect-who` holding `figure.ect-who__char > img` (the character), `.ect-who__eyebrow`, `.ect-who__title`, `.ect-who__lead`, then `ul.ect-tickets` of `li.ect-ticket`. Each ticket has `.ect-ticket__top` (`.ect-ticket__head` with `span.ect-ticket__icon` and `h3.ect-ticket__title`, then `p.ect-ticket__worry`), `.ect-ticket__cut` (the `scissors` icon) and `.ect-ticket__bottom` (`span.ect-ticket__check` + `p.ect-ticket__fix`). Start the worry and the fix with a hidden label (`span.ect-sr` "Grija ta: ", "Ce facem noi: ").

- Panel: `orange`, `radius-panel` with a `radius-leaf` bottom-left corner, `shadow-featured`; eyebrow 18px 500, title 44px 800 (-0.03em) and lead 16/1.6, all `white`.
- Tickets: `white` halves with notches punched in `orange` at the tear; the top half is tilted (2deg, -1.6deg, 1.4deg) with `shadow-ticket`, the bottom keeps `shadow-ticket-deep` and a `radius-leaf`-like 44px corner. The tear is a dashed `white` line with the scissors.
- Icon tile 44px `peach` with the icon in `orange-deep`; title `ticket-title` (18px, 700); worry 15/1.5 500 `ink-muted`, in „Romanian quotes”; fix 15.5/1.5 600 next to a 28px `orange` check disc.
- The character (`faq-tocilar-3d-v2.webp`) stands on the panel's top edge with `shadow-character` as a drop shadow.
- Three tickets, one per situation, in the client's own words. Phones stack them; the tickets keep their tilt.
- Contrast: `white` panel text on `orange` is 2.4:1 (the 44px title still misses 3:1); the `white` check on `orange` 2.4:1. Ticket text passes (`ink-muted` on `white` 7.4:1). Kept as the site has them.

Hand-written from `creare-magazin-online.css` (`.mg-who`, `.mg-t3`).
