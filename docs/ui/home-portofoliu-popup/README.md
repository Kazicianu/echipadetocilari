# Homepage, „Din portofoliu”: variante fără popup

Prototip static, nu face parte din site. Nu modifică nimic în `legacy-mirror/`. Se deschide direct în Chrome (`file:///`); folosește `home.css` și media din `legacy-mirror/`.

- **A · Cardul duce direct pe site**: cardul e link spre site-ul live (filă nouă), cu o descriere scurtă sub nume și pastila „Vezi site-ul ↗” în colțul de jos (se extinde la hover/focus). Un singur „Vreau un site ca acestea” sub carusel. Fără `<dialog>`.
- **B · Cardul se deschide pe loc**: clic pe card → pe desktop cardul se lărgește spre dreapta cu un panou alb (captura desktop, descriere, „Vezi site-ul” și „Vreau un site ca acesta”); pe mobil panoul urcă din josul cardului. Un singur card deschis odată, Escape închide.

Capturi (Chrome headless, 1440 și 390 px) în `capturi/`.
