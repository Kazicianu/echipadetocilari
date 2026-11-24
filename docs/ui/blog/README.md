# Blog (`/blog/` și `/blog/[slug]/`): mockup-uri și implementare

Prototipuri statice responsive (mobile first) pentru pagina hub `/blog/` și pagina unui articol individual (`/blog/[slug]/`) ale site-ului `echipadetocilari.ro`, aliniate cu `docs/design-system/README.md`, `SEO-STRATEGY.md`, `docs/blog/template-articol.md` și planul de articole din `docs/research/blog-100-articole-2026-10-30/README.md`.

Pagina `/blog/` a fost implementată în site-ul real la `legacy-mirror/blog/index.html` (+ `legacy-mirror/wp-content/ect-pages/blog.css`), cu formularul de contact și footerul comune din build și cu headerul integrat în fundal. Pe 24.11.2026 pagina live a fost simplificată (vezi „Distilare 24.11.2026” mai jos), iar `blog.js` a fost scos.

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

## Distilare 24.11.2026 (pagina live)

După critica `/impeccable critique /blog/` din 24.11.2026 (25/40), utilizatorul a decis ca pagina să arate doar ghidurile publicate. Ce s-a schimbat în `legacy-mirror/blog/index.html` și `blog.css`:

- Cele 6 carduri „În pregătire” au fost scoase. Un ghid intră în grilă doar după ce e publicat. Titlurile planificate, cu tema lor:
  - Ce înseamnă SEO și cum aduce clienți unui site de firmă (SEO și AI, ghid pilon)
  - Cum promovezi o afacere online: canale și ordine (Strategie)
  - Promovare pe Instagram: reclame plătite sau postări organice (Facebook și Instagram Ads)
  - Cât costă Google Ads: buget, cost pe click și onorariul agenției (Google Ads)
  - Cât costă o aplicație mobilă și de ce diferă ofertele (Aplicații)
  - Cât costă un site web în România în 2027: prețuri și ce influențează costul (Creare site web)
- Filtrele pe teme, căutarea, rândul de stare și starea goală au ieșit împreună cu `blog.js`, pentru că la 3 ghiduri pe 2 teme nu ajută. Revin când sunt destule ghiduri publicate pe mai multe teme; markup-ul, stilurile și scriptul vechi sunt în commitul `2440661` (și în `pagina.html` / `pagina.js` din acest folder).
- Ghidul recomandat („Cât costă un magazin online în 2027...”) nu se mai repetă în grilă, iar badge-ul „Publicat” a dispărut de pe carduri (data rămâne).
- Din hero a ieșit punctul „Organizate pe cele 7 servicii ale noastre”, iar secțiunea de ghiduri are titlul „Ce mai poți citi acum”.
- Grila folosește `repeat(auto-fit, minmax(300px, 1fr))` de la 1025 px, ca două carduri să umple rândul.

Rămân deschise: structura paginii (trece printr-o machetă nouă), banda de servicii, piersica (decizie: alb cu contur portocaliu) și contrastul badge-urilor.
