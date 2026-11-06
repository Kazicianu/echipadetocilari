# Portofoliu: 20 de variante de prezentare

Cercetare din 06.11.2026. Am analizat cum își arată lucrările agențiile mari și mici (inclusiv din România), șabloanele Framer și Webflow, plus bibliotecile de componente: 21st.dev, Aceternity UI, Magic UI, Cult UI, HyperUI, neobrutalism.dev, Skiper UI și Codrops. Toate variantele presupun că portofoliul e o pagină din site (`/portofoliu/`), nu un site separat.

Linkurile au fost verificate cu curl pe 06.11.2026. 50 din 51 au răspuns cu 200, iar Locomotive dă 403 la curl (blochează roboții), dar se deschide în browser. Scorul de potrivire (1-5) ține cont de câteva proiecte, gust îndrăzneț, site static fără React și conversie.

## Recomandare

Combină variantele 4, 15 și 10. Varianta 4 asigură structura cerută: câteva proiecte pe homepage și o pagină /portofoliu/ care rămâne o parte din site, cu o singură sursă de date. Pe pagina completă, varianta 15 (tabel index cu hover colorat și imagine care urmărește cursorul) dă aspectul tipografic îndrăzneț, cu fallback de miniatură pe mobil. Varianta 10 (bento neo-brutalist) poate încheia pagina cu proiectul vedetă, o cifră, un citat și butonul de contact. Toate se fac cu CSS și puțin JS vanilla, fără React. Dacă vrei și mai simplu la început, folosește varianta 3 (index numerotat) în loc de 15 și adaugă ulterior hover-ul.

## Cuprins

| # | Variantă | Efort | Potrivire |
|---|---|---|---|
| 1 | Grilă de carduri cu etichete | mic | 4/5 |
| 2 | Carduri neo-brutaliste | mic | 5/5 |
| 3 | Index numerotat pe o coloană | mic | 5/5 |
| 4 | Selecție pe homepage plus pagină completă | mic | 5/5 |
| 5 | Carduri cu rezultat pe față | mic | 4/5 |
| 6 | Filtre pe servicii | mic | 3/5 |
| 7 | Proiecte plus mărturii pe aceeași pagină | mic | 4/5 |
| 8 | Carduri cu logo de client | mic | 3/5 |
| 9 | Bandă derulantă (marquee) | mic | 3/5 |
| 10 | Grilă bento | mic | 5/5 |
| 11 | Comutator Grilă / Listă | mic | 2/5 |
| 12 | Panouri care se extind (acordeon de imagini) | mic | 3/5 |
| 13 | Mockup în fereastră de browser sau telefon | mic | 3/5 |
| 14 | Slider înainte / după | mic | 4/5 |
| 15 | Tabel index cu imagine care urmărește cursorul | mediu | 5/5 |
| 16 | Listă cu titluri mari și imagine dezvăluită | mediu | 4/5 |
| 17 | Carduri suprapuse la scroll (sticky stack) | mediu | 4/5 |
| 18 | Previzualizare fixă, text care derulează | mediu | 3/5 |
| 19 | Carusel orizontal cu snap | mediu | 3/5 |
| 20 | Card care se extinde în detaliu (grilă la vedere de detaliu) | mare | 3/5 |

## Variante

### 1. Grilă de carduri cu etichete

Pe desktop vizitatorul vede o grilă de 2-3 coloane cu carduri: imagine, titlu, o propoziție și etichete de serviciu. Pe mobil cardurile se așază într-o singură coloană, iar fiecare duce la pagina proiectului. La final stă un bloc de contact.

- **Exemple:** [Pentagram Work](https://www.pentagram.com/work) (agenție), [Cuberto Projects](https://www.cuberto.com/projects/) (agenție)
- **Bună pentru:** Varianta sigură pentru 4-12 proiecte, care se simte ca o pagină normală din site.
- **Minusuri:** Poate părea generică dacă nu e stilizată îndrăzneț. Hover-ul și animațiile trebuie verificate vizual.
- **Implementare:** CSS grid plus carduri, fără JS. Culoarea fiecărui card se poate seta cu o variabilă CSS. Efort mic, potrivire 4/5.

### 2. Carduri neo-brutaliste

Carduri cu contur gros, umbră dură decalată și fundal de culoare plată. La hover umbra se mută și cardul pare apăsat. Pe mobil sunt carduri late, pe toată lățimea.

- **Exemple:** [HyperUI Neobrutalism Cards](https://hyperui.dev/components/neobrutalism/cards) (bibliotecă), [neobrutalism.dev Card](https://v3.neobrutalism.dev/components/card) (bibliotecă)
- **Bună pentru:** Se potrivește direct cu gustul pentru culori plate, tipografie mare și stickere.
- **Minusuri:** Stilul singur nu e portofoliu: trebuie text clar, contrast 4,5:1 și fără text negru pe portocaliu. Biblioteca neobrutalism.dev e React și nemenținută.
- **Implementare:** Se copiază structura HyperUI (HTML simplu) și se traduc clasele Tailwind în câteva reguli CSS: border, box-shadow, transform la hover. Efort mic, potrivire 5/5.

### 3. Index numerotat pe o coloană

Titlul mare «Lucrări», apoi proiecte uriașe una sub alta, cu numere 01, 02, 03 în tipografie ultra-bold. Fiecare intrare are o propoziție și un buton «Vezi». Pe mobil rămâne aceeași coloană, doar cu corpuri de literă mai mici.

- **Exemple:** [Fantasy Work](https://www.fantasy.co/work) (agenție), [Obys Agency](https://obys.agency/) (agenție), [Instrument Work](https://www.instrument.com/work) (agenție)
- **Bună pentru:** Puține proiecte (4-8) și un site cu tipografie îndrăzneață: fiecare proiect primește prezență pe toată lățimea.
- **Minusuri:** Scroll lung și fiecare proiect cere o imagine puternică. Merge prost cu vizuale slabe.
- **Implementare:** Doar CSS: contoare, litere mari cu clamp(), un bloc de culoare diferit pentru fiecare proiect. Efort mic, potrivire 5/5.

### 4. Selecție pe homepage plus pagină completă

Pe prima pagină apar 3-4 proiecte alese și un link «Vezi toate». Pagina /portofoliu/ le arată pe toate. Aceleași date alimentează ambele locuri.

- **Exemple:** [Studio.io (Framer)](https://www.framer.com/community/marketplace/templates/studio-io/) (șablon), [Work & Co](https://www.work.co/work/) (agenție), [Darkroom Engineering](https://darkroom.engineering/) (agenție), [Even Odd](https://evenodd.studio/) (agenție)
- **Bună pentru:** Exact cerința ta: portofoliul e o parte din site, nu un site separat. Ajută și SEO prin legături din paginile de servicii.
- **Minusuri:** Cere două niveluri de conținut și un proiect vedetă. Cardurile trebuie ținute sincronizate.
- **Implementare:** Un fișier JSON sau o listă de proiecte, randată la build sau cu un script mic, folosită pe homepage și pe /portofoliu/. Efort mic, potrivire 5/5.

### 5. Carduri cu rezultat pe față

Fiecare card începe cu un număr sau o dovadă (comenzi, ROAS, timp de încărcare), apoi o descriere scurtă și etichete de platformă. Credibilitatea se vede înainte de a deschide proiectul.

- **Exemple:** [Pixelmatters Work](https://www.pixelmatters.com/work) (agenție), [Flow Ninja case studies](https://www.flowninja.com/case-studies) (agenție), [Montix (Webflow)](https://templates.webflow.com/html/montix-website-template) (șablon)
- **Bună pentru:** Proiecte de reclame și magazine online, unde există cifre reale.
- **Minusuri:** Cifrele trebuie să fie reale și verificabile. Cifrele vagi sau inventate strică încrederea.
- **Implementare:** Doar CSS. Se adaugă un câmp «stat» la fiecare proiect, afișat ca insignă mare. Efort mic, potrivire 4/5.

### 6. Filtre pe servicii

Un rând de butoane (Site-uri, Magazine, Reclame, Mentenanță) deasupra grilei. Click-ul ascunde cardurile care nu se potrivesc. Pe mobil butoanele pot derula orizontal.

- **Exemple:** [Hello Monday Work](https://www.hellomonday.com/work) (agenție), [Refokus Work](https://www.refokus.com/work) (agenție), [Upperquad Work](https://www.upperquad.com/work) (agenție)
- **Bună pentru:** Să arăți gama de servicii a agenției.
- **Minusuri:** Sub 8 proiecte unele filtre rămân goale și portofoliul pare mai mic. Folosește-le doar când crește lista.
- **Implementare:** Aproximativ 15-20 de linii de JS cu atribute data-category, sau filtre CSS :has() cu radio. Refokus folosește și previzualizări video, care cer poster, lazy-load și respectarea prefers-reduced-motion. Efort mic, potrivire 3/5.

### 7. Proiecte plus mărturii pe aceeași pagină

Câteva carduri de proiect, imediat sub ele 2-3 citate de la clienți cu nume și firmă, apoi un buton de contact.

- **Exemple:** [Roweb Portfolio](https://roweb.com/portfolio) (agenție), [Refokus Work](https://www.refokus.com/work) (agenție), [Montix (Webflow)](https://templates.webflow.com/html/montix-website-template) (șablon)
- **Bună pentru:** Un portofoliu mic, unde 2-3 citate adevărate cântăresc cât alte proiecte.
- **Minusuri:** Cere acordul clienților și citate reale. Un slider generic nu convinge.
- **Implementare:** Doar CSS. Un citat pe proiect e mai convingător decât un carusel de citate. Efort mic, potrivire 4/5.

### 8. Carduri cu logo de client

Fiecare card are bannerul proiectului, logoul clientului, câteva puncte cu platforma folosită (Shopify, WordPress) și un link «Citește mai mult». Poate exista și un card «În curând».

- **Exemple:** [Dynamate](https://www.dynamate.be/) (agenție), [Fictivekin Work](https://www.fictivekin.com/work) (agenție), [Metalab Work](https://www.metalab.com/work) (agenție)
- **Bună pentru:** Când clienții sunt recunoscuți și ai permisiunea să le pui logoul.
- **Minusuri:** Fără rezultate sau clienți cunoscuți arată ca o simplă listă de clienți.
- **Implementare:** Doar CSS. Slotul «În curând» acoperă lipsa unui proiect. Efort mic, potrivire 3/5.

### 9. Bandă derulantă (marquee)

O bandă continuă cu capturi de ecran, logouri sau citate, sub hero sau deasupra footerului. Se oprește la hover. E un ornament care face portofoliul să pară mai plin.

- **Exemple:** [Magic UI Marquee](https://magicui.design/docs/components/marquee) (bibliotecă), [Aceternity Infinite Moving Cards](https://ui.aceternity.com/components/infinite-moving-cards) (bibliotecă), [Dynamate logo strip](https://www.dynamate.be/) (agenție)
- **Bună pentru:** Un accent suplimentar lângă o altă variantă, în stil sticker, cu puține proiecte.
- **Minusuri:** E decorativă, nu dovadă. Cere pauză și respectarea prefers-reduced-motion și nu e galerie principală.
- **Implementare:** Doar CSS: se dublează conținutul și se animează translateX(-50%) cu keyframes liniar infinit. Efort mic, potrivire 3/5.

### 10. Grilă bento

Plăci de mărimi diferite într-o singură grilă: proiectul principal mare, restul mici, plus plăci cu o cifră, un citat și un buton de contact. Pe mobil se așază în coloană.

- **Exemple:** [Aceternity Bento Grid](https://ui.aceternity.com/components/bento-grid) (bibliotecă), [Magic UI Bento Grid](https://magicui.design/docs/components/bento-grid) (bibliotecă), [21st.dev componente](https://21st.dev/community/components) (bibliotecă)
- **Bună pentru:** 4-8 proiecte plus dovezi într-un bloc compact, colorat, cu blocuri de culoare plată.
- **Minusuri:** Bibliotecile sunt React/Tailwind, iar efectele lor (spotlight, glare) nu sunt neo-brutaliste. Decupajele imaginilor variază.
- **Implementare:** Nu portezi biblioteca, copiezi ideea: CSS grid cu grid-column/grid-row span, conturi groase și umbre dure. Efort mic, potrivire 5/5.

### 11. Comutator Grilă / Listă

Vizitatorul alege cum răsfoiește: grilă cu imagini sau listă compactă de rânduri. Butonul de sus schimbă clasa containerului. Pe mobil implicit rămâne grila.

- **Exemple:** [Mother Design Work](https://www.motherdesign.com/work) (agenție), [Studio Freight Work](https://www.studiofreight.com/work) (agenție), [Pangram Pangram](https://pangrampangram.com/) (agenție)
- **Bună pentru:** Portofoliu care crește peste 10 proiecte, cu audiență mixtă.
- **Minusuri:** Interfață în plus fără câștig sub 10 proiecte. Detaliile fiecărui mod nu au fost confirmate.
- **Implementare:** Câteva linii de JS care comută o clasă, plus două aranjamente CSS (grid și listă). Proiectele mici pot apărea ca rânduri doar cu text. Efort mic, potrivire 2/5.

### 12. Panouri care se extind (acordeon de imagini)

O bandă de panouri verticale: cel peste care treci cu mouse-ul se mărește, celelalte se strâng și se estompează. Pe mobil panourile se așază în coloană.

- **Exemple:** [Framer Accordion Gallery V2](https://www.framer.com/marketplace/components/accordion-gallery-v2/) (bibliotecă), [Aceternity Focus Cards](https://ui.aceternity.com/components/focus-cards) (bibliotecă)
- **Bună pentru:** 4-6 proiecte într-o bandă scurtă și spectaculoasă pe homepage.
- **Minusuri:** Componenta Framer nu merge în afara Framer, e doar referință. Fără hover pe touch, deci trebuie tap.
- **Implementare:** Doar CSS: display:flex cu tranziție de flex-grow la :hover și :focus-within, plus media query pentru coloană. Efort mic, potrivire 3/5.

### 13. Mockup în fereastră de browser sau telefon

Captura proiectului stă într-un cadru de browser cu bară de URL, sau într-un telefon, cu buton pentru desktop, tabletă și mobil.

- **Exemple:** [Magic UI Safari](https://magicui.design/docs/components/safari) (bibliotecă), [Framer Device Showcase](https://www.framer.com/marketplace/components/nOSOleArFONxZMYYIf7o/) (bibliotecă), [Cult UI componente](https://www.cult-ui.com/docs/components) (bibliotecă)
- **Bună pentru:** Site-uri și magazine online, unde responsive-ul e argumentul de vânzare.
- **Minusuri:** Capturile se învechesc, iar cadrul adaugă zgomot într-un site deja zgomotos. Poate părea clișeu de șablon.
- **Implementare:** Cadru făcut din div cu trei puncte și o bară de URL, sau SVG. Comutatorul de dispozitiv are 3 butoane și puțin JS. Efort mic, potrivire 3/5.

### 14. Slider înainte / după

Site-ul vechi și cel nou, separate de o linie care se trage cu degetul sau mouse-ul. Apare pe pagina proiectului sau pe card.

- **Exemple:** [Aceternity Compare](https://ui.aceternity.com/components/compare) (bibliotecă), [Dorik agency templates](https://dorik.com/templates/creative-agency-websites) (șablon)
- **Bună pentru:** Reproiectări de site, unde diferența vizuală e cea mai bună dovadă, chiar fără cifre.
- **Minusuri:** Doar pentru proiecte cu stare «înainte». Fără proces sau cifre poate părea gol. Componenta Aceternity depinde de React și sparkles.
- **Implementare:** Două imagini suprapuse, clip-path: inset() controlat de un input[type=range]. Sub 30 de linii de JS. Efort mic, potrivire 4/5.

### 15. Tabel index cu imagine care urmărește cursorul

Proiectele sunt rânduri într-un tabel cu contur: nume, serviciu, an. La hover rândul se umple cu culoare, iar coperta urmează mouse-ul. Pe mobil rândurile au o miniatură vizibilă.

- **Exemple:** [Brutalist Studio (Framer)](https://www.framer.com/marketplace/templates/brutalist-studio/) (șablon), [Dogstudio](https://dogstudio.co/) (agenție), [Locomotive Projects](https://www.locomotive.ca/en/projects) (agenție), [21st.dev Project Index](https://21st.dev/@ssychui/components/project-index) (bibliotecă)
- **Bună pentru:** Look tipografic, îndrăzneț, neo-brutalist, care ocupă puțin loc vertical.
- **Minusuri:** Hover-ul nu există pe touch, deci mobilul cere alternativă. Componenta 21st.dev e React cu framer-motion și cheie API.
- **Implementare:** Circa 25-30 de linii de JS vanilla (mousemove mută un img absolut) plus CSS. Nu importa componenta React, refă-o. Efort mediu, potrivire 5/5.

### 16. Listă cu titluri mari și imagine dezvăluită

Numele proiectelor în litere uriașe pe o parte. La hover sau tap pe un rând, imaginea proiectului apare pe cealaltă parte cu o ștergere (wipe) și apare o legendă. Pe mobil se stivuiește vertical.

- **Exemple:** [Index List Image Gallery (21st.dev)](https://21st.dev/@kedhareswer/components/index-list-carousel) (bibliotecă), [Skiper UI](https://skiper-ui.com/) (bibliotecă), [Codrops HoverGrid](https://github.com/codrops/HoverGrid) (bibliotecă)
- **Bună pentru:** Gust tipografic, titluri ultra-bold, 4-12 proiecte, cu navigare de la tastatură.
- **Minusuri:** Imaginile sunt ascunse până la interacțiune și cere fallback pe touch.
- **Implementare:** Handler pe mouseenter și focus care setează data-active, plus tranziții CSS clip-path sau opacity. Varianta cu cursor cere GSAP quickTo. Efort mediu, potrivire 4/5.

### 17. Carduri suprapuse la scroll (sticky stack)

Cardurile proiectelor se suprapun: pe măsură ce derulezi, următorul alunecă peste precedent, fiecare pe fundal de altă culoare plată. Un proiect e în centrul atenției o dată.

- **Exemple:** [Aceternity Sticky Scroll Reveal](https://ui.aceternity.com/components/sticky-scroll-reveal) (bibliotecă), [3D Stacked Website Cards (21st.dev)](https://21st.dev/@kedhareswer/components/case-stack-scroll) (bibliotecă)
- **Bună pentru:** Secțiune «Lucrări alese» memorabilă, cu 3-5 proiecte vedetă.
- **Minusuri:** Pe mobil poate fi sâcâitor, textul e mai greu de citit și cere prefers-reduced-motion. Unele componente 21st.dev au licență neclară.
- **Implementare:** Doar CSS cu position: sticky și valori top crescătoare, circa 20 de linii. Nu porta componentele React. Efort mediu, potrivire 4/5.

### 18. Previzualizare fixă, text care derulează

Două coloane: pe stânga titlurile și descrierile derulează, pe dreapta un panou fix schimbă imaginea proiectului activ. Pe mobil devine o stivă obișnuită.

- **Exemple:** [Aceternity Sticky Scroll Reveal](https://ui.aceternity.com/components/sticky-scroll-reveal) (bibliotecă), [Aceternity Parallax Scroll](https://ui.aceternity.com/components/parallax-scroll) (bibliotecă)
- **Bună pentru:** 3-8 studii de caz cu titlu, descriere și un vizual puternic.
- **Minusuri:** Cere lungime de scroll pe proiect și colapsare atentă pe mobil. Componenta e React.
- **Implementare:** position: sticky pentru previzualizare și IntersectionObserver pentru schimbarea imaginii. Aproximativ 40 de linii. Efort mediu, potrivire 3/5.

### 19. Carusel orizontal cu snap

Un rând de carduri înalte pe care le tragi lateral, cu categorie și titlu pe imagine. Un click deschide o vedere mai mare. Pe mobil se trage cu degetul.

- **Exemple:** [Aceternity Apple Cards Carousel](https://ui.aceternity.com/components/apple-cards-carousel) (bibliotecă), [Cult UI 3D Carousel](https://www.cult-ui.com/docs/components/three-d-carousel) (bibliotecă), [Brutalist Studio (Framer)](https://www.framer.com/marketplace/templates/brutalist-studio/) (șablon)
- **Bună pentru:** 5-12 proiecte într-o secțiune compactă dintr-o pagină mai lungă.
- **Minusuri:** Elementele ascunse în afara ecranului se văd mai greu, iar scroll-ul orizontal strică accesibilitatea. Versiunea Apple e legată de Next.js și framer.
- **Implementare:** Varianta de bază e CSS scroll-snap cu overflow-x: auto, plus butoane și taste săgeți. Partea de extindere la click cere JS. Efort mediu, potrivire 3/5.

### 20. Card care se extinde în detaliu (grilă la vedere de detaliu)

Click pe un card îl extinde pe loc sau îl transformă într-o vedere mare cu studiul de caz, fără a părăsi pagina. Esc sau click în afară închide.

- **Exemple:** [Aceternity Expandable Cards](https://ui.aceternity.com/components/expandable-card) (bibliotecă), [Cult UI Expandable Screen](https://www.cult-ui.com/docs/components/expandable-screen) (bibliotecă), [Codrops GridToSlider](https://www.github.com/codrops/GridToSlider) (bibliotecă)
- **Bună pentru:** Studii de caz scurte fără pagini separate, cu un efect premium.
- **Minusuri:** Depinde de animații de layout partajat. Dialogul accesibil e treaba ta și SEO-ul e slab dacă textul nu e în DOM.
- **Implementare:** GridToSlider (Codrops) e deja vanilla cu GSAP Flip. Alternativ, View Transitions API plus elementul dialog. Ține textul în HTML pentru crawlere și păstrează și pagini separate pe proiect. Efort mare, potrivire 3/5.

## Reguli valabile pentru orice variantă

- Arată puține proiecte, dar bine: 4-8 studii de caz solide bat o galerie mare și neclară.
- Fiecare proiect are propria pagină statică (problemă, abordare, rezultat), cu 200-600 de cuvinte de text real, pentru SEO.
- Pune o cifră sau o dovadă pe card doar dacă e reală și o poți demonstra. Nu umfla rezultatele.
- Etichetează onest lucrările proprii sau fără client. Pentru NDA descrie tipul proiectului sau cere permisiune devreme.
- Pune un buton de contact imediat după fiecare grup de proiecte și un CTA în capătul paginii.
- Leagă fiecare proiect de pagina serviciului potrivit și invers; paginile de servicii se termină cu 2-3 proiecte relevante.
- Ține datele într-un singur loc (JSON) și randează din el cardurile de pe homepage și de pe /portofoliu/.
- Mobil întâi: hover-ul nu există pe touch, deci oferă miniatură vizibilă sau tap, ținte de minim 44px.
- Respectă prefers-reduced-motion la marquee, scroll animat și video; oprește animațiile infinite la hover.
- Imagini AVIF/WebP cu srcset, width și height setate; lazy-load sub pliu, dar prima imagine (LCP) eager cu fetchpriority=high.
- Verifică contrastul 4,5:1 și focusul vizibil; nu pune text negru pe portocaliu.
- Adaugă JSON-LD CreativeWork pe pagina fiecărui proiect, ca marcaj semantic, nu ca promisiune de rich result.
