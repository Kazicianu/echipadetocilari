# Creare site web: pachet pentru implementare

Mockup-ul aprobat de utilizator pe 08.11.2026 în canvasul Design: [Rkapb7k2NcqEwQzjEPpqC4](https://claude.ai/artifact/Rkapb7k2NcqEwQzjEPpqC4), pagina „Referințe · Designjoy, Unlimited, magier”.

Pagina implementată este `legacy-mirror/creare-site-web/index.html`. Desktopul și telefonul sunt aceeași pagină, responsivă. Capturile la 390 px arată pagina pe telefon.

## Ce e în folder

| Fișier | Ce conține |
| --- | --- |
| `canvas/RA.dc.html` | Hero, „Pe scurt”, „Cum lucrăm”, „Tipuri de site”, bara de pe telefon. |
| `canvas/RB.dc.html` | Prețuri și „Ce influențează prețul”. |
| `canvas/RC.dc.html` | „Ce include”, SEO/AEO/GEO, „Pas cu pas”, „Cum alegi firma”. |
| `canvas/RD.dc.html` | „Ce urmează după lansare”, FAQ, contact și footer (ilustrative). |
| `canvas/RSeo.dc.html` | Specificația SEO/AEO/GEO. |
| `capturi/RA-390.png` … `RD-390.png` | Fiecare secțiune de canvas, la 390 px. |
| `capturi/RA-1440.png` … `RD-1440.png` | Fiecare secțiune de canvas, la 1440 px. |
| `capturi/FULL-390.png` | Toată pagina, la 390 px. |
| `de-completat.md` | Informațiile lipsă și casetele de pe pagină care trebuie completate. |

## Decizii pentru implementare (08.11.2026)

1. Hero-ul păstrează partea dreaptă exact (imaginea VR și motion fx). Se schimbă doar coloana stângă, cu conținutul din mockup.
2. Pe telefon, imaginea VR vine sub lista de încredere, centrată, la ~200 px lățime.
3. Headerul, contactul și footerul rămân cele comune ale site-ului. Cele din mockup sunt ilustrative.
4. FAQ-ul folosește componenta site-ului `ect-home-faq`, ajustată să arate ca în mockup. Mascota este statică.
5. Casetele „De completat” și „De confirmat” rămân vizibile, marcate cu clasa `csw-todo` (13 casete).
6. CSS-ul este mobile first, cu breakpoint-urile 768, 1025 și 1241 px, echivalente cu cele din mockup.
7. Prefixul claselor paginii este `csw-`, scoped sub `.ect-page.ect-page--creare-site-web`.
8. Titlul cardului din hero este `<p>`, nu `<h2>`, pentru că nu e secțiune; vizual identic.

Informațiile care lipsesc sunt în [de-completat.md](de-completat.md).

## Verificarea implementării (08.11.2026)

- Pagina RO e în `legacy-mirror/creare-site-web/index.html`, cu `creare-site-web.css` (mobile first) și `creare-site-web.js` (tab-uri) în `legacy-mirror/wp-content/ect-pages/`. Pagina EN `/en/website-design/` se generează din ea prin `scripts/i18n/website-design.mjs`.
- Coloana dreaptă a hero-ului (`elementor-element-cd52179`, omul cu VR) e identică cu versiunea anterioară. La 1440 și 1280 arată în continuare spre „Ai o idee?”.
- `npm test`: 313 teste trec. `npm run build` trece (12 pagini RO, 9 EN, `indexable=false`).
- Schema RO: Service cu OfferCatalog (299, 499, 1.490 € și „Proiect custom” fără preț), FAQPage cu cele 9 răspunsuri complete, `dateModified` din data „Actualizat”. EN: FAQPage cu aceleași 9.
- Verificare vizuală în Chrome headless la 320, 360, 390, 768, 1100, 1280 și 1440: fără overflow orizontal pe pagină, tab-uri și FAQ cu tastatura, bara fixă de pe telefon nu se suprapune cu butonul „înapoi sus”. Formularul respinge câmpurile goale și emailul invalid. Nu s-au trimis mesaje reale.
- Abateri față de mockup, asumate: hero-ul are fundal alb și spațiu jos, ca tălpile personajului să nu intre în zona crem; între 768 și 1024 cardul de apel e stivuit; FAQ-ul trece pe două coloane de la 960 px.
- Rămas: textul portocaliu pe alb (pill-uri, linkuri) are contrast sub 4,5:1. E așa în mockup și în design system, deci e o decizie de design. Telefonul fizic, performanța și vizibilitatea în AI nu au fost măsurate.
