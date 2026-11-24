# Blog (`/blog/` și `/blog/[slug]/`): mockup-uri și implementare

Prototipuri statice responsive (mobile first) pentru pagina hub `/blog/` și pagina unui articol individual (`/blog/[slug]/`) ale site-ului `echipadetocilari.ro`, aliniate cu `docs/design-system/README.md`, `SEO-STRATEGY.md`, `docs/blog/template-articol.md` și planul de articole din `docs/research/blog-100-articole-2026-10-30/README.md`.

Pagina `/blog/` a fost implementată în site-ul real la `legacy-mirror/blog/index.html` (+ `legacy-mirror/wp-content/ect-pages/blog.css` și `blog.js`), cu formularul de contact și footerul comune din build și cu headerul integrat în fundal.

## Ce e în folder

| Fișier | Ce conține |
| --- | --- |
| `pagina.html` | Mockup-ul complet pentru hub-ul `/blog/`, cu titluri reale din Valul 1 al cercetării. |
| `pagina.css` | Stilurile hub-ului `/blog/` (mobile first, baza 360-767 px, apoi 640, 768, 920, 1025 și 1200 px), cu header integrat în fundal. |
| `pagina.js` | Interacțiunile hub-ului: submeniul „Servicii”, meniul mobil, filtrarea pe cele 7 servicii + Strategie, căutarea instant și validarea locală a formularului. |
| `articol.html` | Mockup-ul complet pentru pagina unui articol (`/blog/[slug]/`), exemplificat pe ghidul pilon „Cât costă un site web în România în 2026”. |
| `articol.css` | Stilurile paginii de articol (mobile first, bară de progres, header în fundal, cuprins colapsabil pe mobil / sticky pe desktop, tabel scrollabil, FAQ nativ, formular și footer comune). |
| `articol.js` | Interacțiunile articolului: header, cuprins sincronizat pe scroll (`IntersectionObserver`), bară de progres cu `prefers-reduced-motion` și validare locală a formularului. |
| `capturi/desktop-1440.png` | Captură `/blog/` la 1440 px (`desktop-1440-top.png` pentru zona de sus). |
| `capturi/mobil-390.png` | Captură `/blog/` la 390 px (`mobil-390-top.png` pentru zona de sus). |
| `capturi/mobil-360.png` | Captură `/blog/` la 360 px (`mobil-360-top.png` pentru zona de sus). |
| `capturi/articol-1440.png` | Captură articol la 1440 px (`articol-1440-top.png` pentru zona de sus). |
| `capturi/articol-390.png` | Captură articol la 390 px (`articol-390-top.png` pentru zona de sus). |
| `capturi/articol-360.png` | Captură articol la 360 px (`articol-360-top.png` pentru zona de sus). |

## Cum le deschizi

Pornește un server static din rădăcina repo-ului și deschide `/docs/ui/blog/pagina.html` (hub-ul `/blog/`) sau `/docs/ui/blog/articol.html` (pagina unui articol). Căile către fonturi și imaginile existente (`legacy-mirror/wp-content/...`) sunt relative la rădăcina repo-ului.

## Structura paginii de articol (`articol.html`)

1. **Header transparent integrat în fundal** (aceeași continuitate de sus ca pe `/blog/`, plus bară subțire de progres al citirii).
2. **Antet articol**: breadcrumb (`Acasă / Blog / Cât costă un site web`), etichete (`Ghid pilon`, `Creare site web`), `H1`, byline (slot transparent `De completat: autor real`, date publicare/actualizare, timp de citire).
3. **Răspuns direct (BLUF) + „Pe scurt” + vizual de copertă**: 40-60 de cuvinte cu prețurile reale de pornire publicate pe site, 4 puncte rezumative și o grafică editorială clară cu pragurile de cost.
4. **Layout pe 2 coloane pe desktop (1 coloană pe mobil)**:
   - **Cuprins**: `<details>` colapsabil pe mobil/tabletă, sidebar sticky pe desktop (`>= 1025 px`) cu evidențiere activă și mini-CTA discret.
   - **Corpul articolului**: tabel comparativ (scrollabil orizontal pe mobil, fără overflow de pagină), 4 factori de cost, costuri separate vs. opționale, brief în 4 pași, slot transparent pentru element original din proiecte reale, greșeli frecvente, un singur CTA moderat spre `/creare-site-web/`, 4 întrebări FAQ native (`<details>`), concluzie, surse și casetă „Despre autor”.
5. **Citește și**: 3 ghiduri din același cluster + link către `/blog/`.
6. **Formularul de contact comun** imediat deasupra footerului (identic cu homepage).
7. **Footerul comun** (structura Metricra + ilustrația `balcon-urban-v8`).

## De decis înainte de publicarea primelor articole

- **Autorul**: nume real, rol, fotografie, profil LinkedIn și pagina `/autor/[slug]/` (nu s-a inventat nicio persoană).
- **Elementul original**: date verificabile din proiecte reale Echipa de Tocilari (interval real brief-lansare sau structură anonimizată).
- **Legarea `/blog/` în meniul global / footer**: după publicarea primelor articole reale, decide dacă intră în header și în coloana „Companie” din footer (cu actualizarea testelor de navigare și footer).
