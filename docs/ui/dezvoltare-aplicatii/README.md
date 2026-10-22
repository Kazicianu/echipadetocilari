# Dezvoltare aplicații: pachet pentru implementare

Pagina finală `/dezvoltare-aplicatii/`, varianta aprobată în canvasul de design „Dezvoltare aplicații” (Varianta 5, landing pentru Google Ads, gândită întâi pentru telefon), exportată pe 17.10.2026 pentru implementare în `legacy-mirror/`.

Desktopul și mobilul sunt aceeași pagină, responsivă. Sub 600 px pagina are un aranjament propriu pentru telefon: titlul ca un afiș, garanțiile pe o bandă înclinată, tipurile de aplicații ca povești și „Pentru cine e” ca grilă de afiș. De la 600 px în sus e aranjamentul de desktop. Variantele respinse din canvas nu sunt incluse.

## Ce e în folder

| Fișier | Ce conține |
| --- | --- |
| `pagina.html` | Pagina finală, ca HTML static. Folosește `docs/design-system/tokens.css` și imaginile care există deja în `legacy-mirror/`. |
| `pagina.css` | Toate regulile paginii, peste `tokens.css`: clasele `lp-`, `v2-`, `v4-`, `ap-` și componentele `ect-` cu valorile din design (vezi „Diferențe față de design system”). |
| `pagina.js` | Interacțiunile: titlul după grupul de anunțuri (`?tip=`), poveștile de pe telefon și taburile de pe desktop, punctele caruselelor, confirmarea formularului. |
| `capturi/desktop-1440/` | Câte o captură pe secțiune, la 1440 px. |
| `capturi/mobil-390/` | Câte o captură pe secțiune, la 390 px, plus cele patru povești, hero-ul pentru fiecare valoare `?tip=`, hero-ul cu mișcare și butonul lipit de jos. |
| `capturi/*-toata-pagina.jpg` | Toată pagina, pentru ritmul general. |

Capturile sunt făcute cu `prefers-reduced-motion`: banda din hero stă pe loc, cu textele pe rânduri, și bara poveștii deschise e plină. `mobil-390/01-antet-si-hero-cu-miscare.png` arată banda cum rulează, oprită la început.

## Decizii de luat înainte de implementare

1. **Strategia SEO.** `SEO-STRATEGY.md` (rândul 7) spune că pagina pentru dezvoltare aplicații rămâne retrasă. Implementarea începe doar după ce utilizatorul o readuce în strategie, cum s-a făcut pentru magazin pe 12.10.2026. Tot atunci se decide rolul paginii: pagină de serviciu indexabilă (keyword-urile de la „SEO”) sau landing doar pentru anunțuri. Pentru a doua variantă, excluderea din indexare se stabilește în pipeline, fiindcă `PUBLIC_INDEXABLE` e singurul control al indexării.
2. **Mobil și web pe aceeași pagină.** `keyword-research-2026-09-18.md` recomandă să nu amesteci automat intenția pentru aplicații mobile cu cea pentru aplicații web. `SEO-STRATEGY.md` permite o pagină comună cu secțiuni distincte. Pagina are secțiuni distincte pe tip (cele patru tipuri, cardurile 01-04 din „Ce construim”), iar anunțurile se despart prin `?tip=`.
3. **Prețuri și cifre.** `[PREȚ]` (cele trei pachete, introducerea prețurilor și primul răspuns din FAQ) și `[N]` (ecrane, integrări, zile de corectare a erorilor) le completează proprietarul. Nu folosi prețurile de la magazin și nu inventa valori. Datele structurate pentru prețuri depind de ele.
4. **Politica de confidențialitate.** Decis pe 22.10.2026: pagină nouă, `/politica-de-confidentialitate/` (EN `/en/privacy-policy/`). Build-ul adaugă sub butonul fiecărui formular, inclusiv pe această pagină, rândul „Folosim datele din formular ca să-ți răspundem.”, urmat de linkul „Politica de confidențialitate” (`scripts/lib/contact-forms.mjs`), în locul lui `[Link spre politica de confidențialitate]` din design. Footerul trimite și el la pagină.
5. **Măsurarea conversiilor.** Exportul nu conține cod de măsurare. Nicio pagină nu încarcă un tag Google din HTML: build-ul elimină tagul moștenit din WordPress, iar GA4 (`G-PGM4B3VM9Z`) se încarcă numai prin `consent.js`, după acordul pentru cookie-urile de analiză (README, secțiunea „Cookie-uri, Google Analytics și confidențialitate”). Rămâne de stabilit cu utilizatorul doar cum ajunge trimiterea formularului în Google Ads ca conversie.
6. **Headerul.** Designul are un header de landing, fără meniu: logo, nota „Consultație gratuită · 30 de minute” (de la 768 px) și butonul „Primește o ofertă”. `npm run new-page` aduce headerul comun, cu meniu. De ales între cele două.
7. **Versiunea EN.** Exportul e doar în română. Ruta EN, textele și hreflang se stabilesc cu utilizatorul; nu adăuga hreflang către o pagină care nu există.

## Grupurile de anunțuri (`?tip=`)

Titlul se potrivește cu anunțul pe care s-a dat clic. Parametrul `tip` se pune în URL-ul final al anunțului.

| URL final | Kicker | H1 | Tipul deschis |
| --- | --- | --- | --- |
| `/dezvoltare-aplicatii/` | Aplicații pentru afacerea ta | Dezvoltare aplicații mobile și web | 1, poveștile pornesc singure |
| `?tip=mobil` | Pentru iOS și Android | Dezvoltare aplicații mobile | 1, Aplicație mobilă, pe pauză |
| `?tip=web` | Pentru echipa ta, în browser | Dezvoltare aplicații web | 2, Aplicație web internă, pe pauză |
| `?tip=portal` | Cont, comenzi, facturi și plăți online | Portal pentru clienții tăi | 3, Portal pentru clienți, pe pauză |
| `?tip=ai` | Pentru munca repetitivă din firmă | Automatizări cu AI pentru firma ta | 4, AI și automatizări, pe pauză |

- HTML-ul are un singur H1, cel general. Variantele stau în `<template data-js="hero-title-variant">`, cu kickerul în `data-kicker`; `pagina.js` le pune în locul titlului general. Valoarea se citește fără diferență între majuscule și minuscule și merge lângă `gclid` sau `utm_*`. O valoare necunoscută lasă titlul general.
- Pauza privește poveștile de pe telefon. Pe desktop, taburile nu se schimbă singure oricum; acolo se vede doar titlul și tabul deschis.
- Variantele nu sunt pagini separate: canonical rămâne `/dezvoltare-aplicatii/`, fără parametru.
- Pe site, scriptul paginii se încarcă cu `defer`. Dacă se vede o clipă titlul general înainte de variantă, mută doar schimbarea titlului într-un script mic, inline, imediat după H1.
- Pe telefon, fiecare rând al H1-ului are clasa lui (`lp-pl--*`), cu mărimea în unități de container (`cqi`) calculată ca rândul să ocupe 96-99% din lățimea titlului, la orice lățime de telefon. „cu AI” e limitat intenționat. Un text nou de titlu are nevoie de o clasă nouă, măsurată la fel: Montserrat 900, majuscule, `letter-spacing: -0.015em`. Valoarea în `vw` din fața fiecăreia e rezerva pentru browserele fără unități de container.

## Cum o deschizi

Pornește un server static din rădăcina repo-ului (de exemplu `npx serve .` sau `python -m http.server 8080`) și deschide `/docs/ui/dezvoltare-aplicatii/pagina.html`, apoi variantele, de exemplu `pagina.html?tip=web`. Aranjamentul de telefon apare sub 600 px. Căile sunt relative la repo; deschisă direct ca fișier, e posibil ca browserul să nu încarce fonturile.

## Ce se implementează și ce nu se copiază

- **Se implementează:** tot ce e între header și formularul de contact: hero-ul cu banda și tipurile de aplicații, „Pentru cine e”, „Ce construim”, „Cum lucrăm”, prețurile, „Ce intră în preț și ce nu”, FAQ-ul și butonul lipit de jos. Headerul de landing, dacă așa decide utilizatorul (decizia 6).
- **Nu se copiază din prototip:** formularul de contact și footerul. În `pagina.html` sunt aproximări, ca pagina să arate completă. Pe site vin din shell-ul comun (`npm run new-page`) și din formularul comun (`scripts/lib/shared-contact.mjs`), ca pe celelalte pagini.
- **Ce adaugă designul la formular:** rândul „Consultație gratuită · 30 de minute · Fără obligații” sub titlul cardului, rândul despre date sub buton și câmpuri de 16 px, înalte de cel puțin 44 px (pe telefon pagina nu se mărește la focus). Formularul e comun tuturor paginilor, așa că orice schimbare la el se discută întâi cu utilizatorul.
- **Contactul pe telefon:** padding-ul de sus al secțiunii e 70 px. Cu 20 px, cât are `components/bundle.css` sub 768 px, valul alb de sus (60 px) acoperă primul rând al titlului. Verifică formularul comun pe telefon la implementare.
- **Butonul lipit de jos:** `.lp-sticky` e ultimul element din `.lp-flow`, iar formularul trebuie să vină imediat după `.lp-flow`. Altfel butonul nu se mai oprește la formular.
- **Fără „După lansare”:** utilizatorul a respins toate variantele acestei secțiuni, așa că pagina nu o are.

## Pași (după AGENTS.md)

1. Decizia 1 vine înaintea oricărei modificări: `SEO-STRATEGY.md` se actualizează doar după acordul utilizatorului.
2. Citește `SEO-STRATEGY.md` și `docs/design-system/README.md`.
3. Creează pagina cu `node scripts/new-page.mjs --slug dezvoltare-aplicatii --title "Dezvoltare aplicații" --description "..." --template <o pagină de serviciu existentă, de exemplu creare-magazin-online>`.
4. Stilurile și scriptul paginii merg în `legacy-mirror/wp-content/ect-pages/dezvoltare-aplicatii.css` și `.js`, după modelul `creare-magazin-online.css` și `.js`. Copiază regulile din `pagina.css`, care conține deja componentele `ect-` folosite. Montserrat variabil (titlul folosește greutatea 900) și Caveat 600 (notițele scrise de mână) sunt deja în `legacy-mirror/wp-content/ect-pages/fonts/`; încarcă-le ca în `creare-magazin-online.css`. Noto Sans 500, folosit doar de butonul din headerul de landing, nu e acolo: dacă headerul de landing rămâne, folosește fontul cu care shell-ul afișează butonul din headerul comun sau adaugă fișierul din `docs/design-system/fonts/`. Nu lega fișiere din `docs/`: folderul nu se publică.
5. Adaugă pagina în `scripts/i18n/routes.mjs` (RO `/dezvoltare-aplicatii/`; EN după decizia 7) și metadata în `scripts/i18n/meta-ro.mjs`.
6. Linkurile interne: după `SEO-STRATEGY.md`, cardul de dezvoltare aplicații de pe homepage trimite acum la `/services/`. Odată cu publicarea, cardul trimite la `/dezvoltare-aplicatii/`, iar pagina intră în submeniul „Servicii” din meniul comun (RO, apoi EN când există).
7. Folosește imaginile care sunt deja în repo (tabelul de mai jos), fără copii noi.
8. Verifică: `npm test`, `npm run build`, pagina la 320, 360, 390, 600, 768 și 1440 px, fără parametru și cu fiecare valoare `?tip=`. Apoi poveștile (atingere în dreapta și în stânga, glisare, pauză, oprirea după a patra, mișcare redusă), punctele caruselelor, FAQ-ul cu mouse și tastatură, butonul lipit de jos și validarea formularului, fără să trimiți mesaje reale.
9. Nu face commit sau push fără acordul utilizatorului.

## Imagini (există deja în repo)

| În pagină | Fișier |
| --- | --- |
| Logo (header, avatarul din povești, footer) | `legacy-mirror/wp-content/uploads/2024/02/Logo_Echipa_de_Tocilari-e1708028624694.webp` |
| Personajul din FAQ (clientul care întreabă) | `legacy-mirror/wp-content/ect-pages/home/faq-client-3d.webp` |

Ilustrațiile (telefonul și laptopul de la tipurile de aplicații, ecranele din „Ce construim”) sunt desenate în HTML și CSS, fără imagini. Datele din ele sunt exemple inventate: programările unei frizerii, comenzile 2378-2381, clienta „Ioana M.”, inițialele din echipă. Nu sunt clienți și nici nu trebuie prezentate ca atare. Au `aria-hidden="true"` și `data-nosnippet`, ca macheta de pe pagina de magazin.

## Secțiuni, în ordine

1. **Header de landing** (`.lp-header`): logo, nota „Consultație gratuită · 30 de minute” de la 768 px și „Primește o ofertă” către `#formular_contact_bottom`.
2. **Hero** (`.v2-hero`): kicker, H1 (după `?tip=`), „Spune-ne ce trebuie să facă aplicația. Noi o construim, pe înțeles și cu prețul în scris.”, CTA „Primește o ofertă” către `#formular_contact_bottom`, „Vezi pachetele ↓” către `#cost` și cele trei garanții. Pe telefon titlul e un afiș, iar garanțiile rulează pe banda portocalie înclinată.
3. **Tipurile de aplicații** (`#lp-story`, „Alege tipul de aplicație”): patru tipuri. De la 600 px sunt taburi cu o previzualizare (dispozitivul și panoul închis la culoare), pe două coloane de la 960 px. Sub 600 px sunt un card de povești, câte una pe tip, fiecare cu culoarea ei.
4. **Pentru cine e** (`.v2-meter`): panoul portocaliu cu șase situații, fiecare cu tipul de aplicație care o rezolvă, și „Scrie-ne în două paragrafe”. Pe telefon, grilă de afiș 2 x 3, alb și negru pe portocaliu.
5. **Ce construim** (`#ce-construim`): patru carduri (aplicație mobilă, aplicație web internă, portal, AI și automatizări). Carusel cu puncte pe telefon, două coloane de la 768 px, bento de la 1100 px.
6. **Cum lucrăm** (`#cum-lucram`): șase pași pe cablul cu beculețe. Carusel cu puncte sub 1100 px, șase coloane de la 1100 px.
7. **Prețuri** (`#cost`): Start, Business (Recomandat) și Avansat, cu `[PREȚ]` și `[N]`. Pe telefon cardurile stau unul sub altul.
8. **Ce intră în preț și ce nu** (`.ap-scope`): „În orice pachet”, „Plătești separat” și nota despre costurile separate și TVA.
9. **FAQ** (`#intrebari-frecvente`): portat de pe homepage (`.ect-home-faq`), cu personajul clientului, șapte întrebări în `<details name="ap-faq">`, prima deschisă.
10. **Butonul lipit de jos** (`.lp-sticky`, sub 768 px): apare după hero și rămâne pe ecran până la formular.
11. **Formularul de contact** (`#formular_contact_bottom`), imediat deasupra footerului, apoi footerul.

## Comportamente

- **Poveștile (sub 600 px):** bara fiecărei povești se umple în 7 s (animația CSS `lp-fill`), apoi se deschide următoarea. După a patra se opresc, iar butonul rotund le pornește din nou de la prima. Două treimi din dreapta cardului duc înainte, treimea din stânga înapoi; o glisare orizontală de peste 40 px face la fel. Poveștile pornesc abia când jumătate din card e pe ecran. Cine vine cu `?tip=` începe pe pauză, pe tipul lui. Cardul are înălțimea celei mai lungi povești, ca pagina să nu sară la schimbare.
- **Mișcare redusă:** barele nu se mai umplu, poveștile se schimbă doar la atingere sau glisare și butonul de pauză nu se afișează. Banda din hero stă pe loc, iar beculețele, notificarea din telefonul de la „Ce construim”, linia de scanare din cardul AI și personajul din FAQ se opresc.
- **Taburile (de la 600 px):** se schimbă la clic sau din tastatură (săgeți, Home, End), niciodată singure. Barele poveștilor de pe telefon sunt aceleași taburi (`role="tab"`).
- **Caruselele:** punctele urmăresc derularea, iar un punct derulează la cardul lui (instant cu mișcare redusă). De la 768 px („Ce construim”) și 1100 px („Cum lucrăm”) punctele dispar și cardurile stau în grilă.
- **Formularul:** în prototip doar afișează confirmarea. Pe site folosește handlerul existent.
- **Cârligele pentru JavaScript** sunt atribute `data-js`; clasele rămân doar pentru stil.

## Corecturi făcute la export (17.10.2026)

Găsite la verificarea exportului, corectate și în canvas. Toate sunt doar în aranjamentul de telefon; desktopul nu s-a schimbat.

- Titlul-afiș are mărimile în `cqi` (înainte doar în `vw`). La 320 px, „mobile și web” și „clienții tăi” treceau pe două rânduri.
- Eticheta „Pentru echipă” acoperea primul modul din laptop la poveștile 2 și 4. Zona dispozitivului are acum 174 px în loc de 150.
- Poveștile stau în aceeași celulă de grilă, iar cardul are cel puțin 660 px (înainte 640). La 320 px cardul sărea cu 35 px la schimbarea poveștii.
- „Pentru cine e”: pătratele cresc pe telefoanele înguste. La 320 px textul ieșea din pătrat.
- Contactul are 70 px deasupra titlului pe telefon (vezi mai sus).

## Diferențe față de design system

- `components/bundle.css` nu e legat. Acolo `.ect-btn--primary` și `.ect-btn--submit` au `text-transform: capitalize`, care ar face din „Primește o ofertă” „Primește O Ofertă”. `pagina.css` conține componentele `ect-` folosite, cu valorile din design.
- `.ect-btn--on-brand` are padding 16 x 30 px (în design system, 20 x 40 px).
- `.ect-btn--header` are pe telefon padding 13 x 20 px și text de 15 px; de la 768 px e ca în design system (15 x 30 px, 16 px).
- `.ect-chips` are trei coloane de la 960 px, iar pe telefon devine banda care rulează.
- `.ect-field`: câmpuri de 16 px și minimum 44 px la orice lățime (în design system, 15 px până la 1024 px și minimum 40 px).
- `.ect-contact`: 70 px sus pe telefon (în design system, 20 px).

## SEO (propunere, de confirmat cu utilizatorul)

- Title: `Dezvoltare aplicații mobile și web | Echipa de Tocilari` (55 de caractere).
- Meta description: `Dezvoltare aplicații mobile pentru iOS și Android și aplicații web pentru firma ta. Consultație gratuită de 30 de minute și prețul în scris.` (140 de caractere).
- Keyword principal: dezvoltare aplicatii mobile (170/lună, KD 18, Semrush RO, 18.09.2026), în title și în H1. Secundare: dezvoltare aplicatii web (30, KD 0), în H1 („mobile și web”) și în cardul 02 din „Ce construim”; creare aplicatii mobile (10, KD 0), în prima întrebare din FAQ („Cât costă crearea unei aplicații mobile?”). Variantele `?tip=` nu contează pentru SEO: le schimbă JavaScript, iar canonical e fără parametru.
- Date structurate: Service și FAQPage, doar cu textul vizibil pe pagină, prin pipeline, după completarea prețurilor. Indexarea rămâne controlată de `PUBLIC_INDEXABLE`.
- Linkuri interne: în conținut, doar ancorele paginii; restul vin din footer. Pentru o pagină de serviciu indexabilă merită linkuri către `/creare-site-web/` sau `/creare-magazin-online/`; pentru un landing de anunțuri, mai puține ieșiri sunt mai bune. Se decide odată cu decizia 1.

## Reguli de text

- Fără em dash (U+2014) și fără săgeți diagonale (U+2196 până la U+2199), nici ca iconuri.
- Diacritice cu virgulă dedesubt: ș și ț (U+0219, U+021B), nu variantele cu sedilă (U+015F, U+0163). Fără emoji. Ton cu „tu” și „noi”.
- Doar afirmații verificabile: fără clienți, rezultate, recenzii sau prețuri inventate.
- Ținte de atingere de minimum 44 x 44 px, focus vizibil, `prefers-reduced-motion` respectat.
- Portocaliul rămâne exact `#fd8649`, inclusiv textele albe pe panourile portocalii. Nu se înlocuiește pentru contrast.
