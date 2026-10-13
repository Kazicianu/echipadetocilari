# Creare magazin online: pachet pentru implementare

Pagina finală `/creare-magazin-online/`, aprobată în canvasul de design „Creare magazin online” și exportată pe 12.10.2026 pentru implementare în `legacy-mirror/`.

Desktopul și mobilul sunt aceeași pagină, responsivă. Nu există un design de mobil separat: capturile la 390 px arată aceeași pagină pe telefon. Variantele respinse din canvas nu sunt incluse.

## Ce e în folder

| Fișier | Ce conține |
| --- | --- |
| `pagina.html` | Pagina finală, ca HTML static. Folosește `docs/design-system/` și imaginile care există deja în `legacy-mirror/`. |
| `pagina.css` | Doar regulile folosite de pagină (clasele `mg-` și FAQ-ul portat de pe homepage), peste `tokens.css` și `components/bundle.css` din design system. |
| `pagina.js` | Interacțiunile: ecranele telefonului, pauza, „Servicii”, meniul de mobil, animația din FAQ, confirmarea formularului. |
| `capturi/desktop-1440/` | Câte o captură pe secțiune, la 1440 px. |
| `capturi/mobil-390/` | Câte o captură pe secțiune, la 390 px, plus meniul de mobil deschis. |
| `capturi/*-toata-pagina.jpg` | Toată pagina, pentru ritmul general. |

Capturile sunt făcute cu `prefers-reduced-motion`, deci cu telefonul oprit pe primul ecran.

## Decizii pentru implementare (12.10.2026)

- Utilizatorul a cerut implementarea paginii doar în română în această etapă.
- **De făcut ulterior:** pagina EN, cu traducerea completă, ruta confirmată cu utilizatorul, metadata, hreflang și linkurile din meniul EN. Nu genera acum o versiune EN și nu adăuga hreflang către o pagină inexistentă.
- Oferta aprobată ulterior în aceeași zi înlocuiește variantele provizorii din canvas: Start 1.490 €, Business 2.490 € și Avansat de la 4.490 €. Business este pachetul recomandat. Fișierele `pagina.html`, `pagina.css` și capturile rămân documentarea designului inițial, nu sursa prețurilor curente.
- Platformele aprobate sunt WooCommerce și Shopify, cu cod personalizat în limitele proiectului. Platforma se stabilește după cerințe, în oferta scrisă.
- Headerul, formularul și footerul vin din shell-ul comun, inclusiv linkurile sociale existente. Switcherul de limbă al paginii va fi adăugat odată cu versiunea EN.
- La revizia vizuală, utilizatorul a confirmat explicit păstrarea exactă a culorilor din `pagina.html` și capturi, inclusiv combinațiile cu contrast redus. Nu înlocui portocaliul cu `orange-deep` și nu schimba textele albe de pe panourile portocalii în negru.

## Verificarea implementării (12.10.2026)

- Pagina RO este implementată în `legacy-mirror/creare-magazin-online/index.html`, cu CSS și JS în `legacy-mirror/wp-content/ect-pages/`.
- Comenzile de test și build au trecut: 68 de teste, 12 pagini RO și 11 pagini EN existente. Build-ul de verificare are `indexable=false`; `PUBLIC_INDEXABLE` rămâne singurul control al indexării.
- Verificare vizuală în Chrome la 360, 390 și 1440 CSS px, cu mișcare redusă. Fără overflow orizontal și fără imagini sau ancore lipsă.
- Verificate meniurile desktop/mobil, FAQ-ul cu mouse și tastatură, cele patru ecrane ale telefonului, pauza și schimbarea preferinței de mișcare. Cele patru linkuri interne de servicii răspund cu 200.
- Formularul comun este imediat înaintea footerului. Câmpurile obligatorii și emailul invalid sunt respinse, iar datele valide trec validarea locală. Nu s-au trimis mesaje reale.
- Dimensiunile mobile au fost emulate în browser; verificarea pe un telefon fizic rămâne de făcut. Nu au fost măsurate performanța sau vizibilitatea în răspunsurile AI.
- Revizia a comparat toate cele șapte secțiuni cu prototipul, element cu element și prin capturi, la 360, 390 și 1440 px. Fontul Montserrat variabil este același fișier din design system și este încărcat sub un nume izolat pentru această pagină. Au fost refăcute paleta, spațierea linkurilor, accentuarea textelor și colțurile cardurilor de preț.
- Zonele de atingere ale linkurilor sunt extinse fără să modifice geometria vizuală. Hover-ul din kitul vechi nu mai schimbă culorile butoanelor pe dispozitive tactile. Linkul „Creare Site Web” din footer trimite la pagina corectă, iar generatorul de pagini păstrează destinațiile shell-ului înainte de clonare.
- Greșeala de tastare „TOCIALRI” din denumirea firmei a fost corectată în footerul comun al paginilor sursă RO. Denumirea este acum „ECHIPA DE TOCILARI SRL” peste tot.
- Alinierea mobilă a headerului este în `mobile-menu.css`, independent de switcherul RO/EN: logo în stânga, burger în dreapta. Verificată la 360 și 390 px, inclusiv deschiderea și închiderea meniului. Cele 17 teste relevante de meniu și pagini exclusiv RO trec.

## Cum o deschizi

Pornește un server static din rădăcina repo-ului (de exemplu `npx serve .` sau `python -m http.server 8080`) și deschide `/docs/ui/creare-magazin-online/pagina.html`. Căile sunt relative la repo; deschisă direct ca fișier, e posibil ca browserul să nu încarce fonturile.

## Ce se implementează și ce nu se copiază

- **Se implementează:** tot ce e între header și formularul de contact: hero, „Pentru cine e”, „Ce include” (Linia Comenzii), „Cum lucrăm”, prețuri, FAQ, „După lansare”.
- **Nu se copiază din prototip:** headerul, formularul de contact și footerul. În `pagina.html` sunt doar aproximări după design system, ca pagina să arate completă. Pe site vin din shell-ul comun (`npm run new-page`) și din formularul comun (`scripts/lib/shared-contact.mjs`), ca pe celelalte pagini.
- **Meniu:** designul arată „Creare magazin online” în submeniul „Servicii”, pe desktop și pe mobil. Pe site trebuie adăugat în meniul comun, în RO și EN.
- **Valori fixate din canvas:** culoarea de accent e `--orange` (#fd8649), personajul din panoul portocaliu e `faq-tocilar-3d-v2.webp`, iar cel din FAQ e `faq-tocilar-reader.webp`.

## Pași (după AGENTS.md)

1. `SEO-STRATEGY.md` a fost actualizat pe 12.10.2026 (rândul 7): pagina de magazin online e din nou în implementare. Paginile pentru dezvoltare aplicații și Facebook Ads rămân retrase.
2. Citește `SEO-STRATEGY.md` și `docs/design-system/README.md`.
3. Creează pagina cu `node scripts/new-page.mjs --slug creare-magazin-online --title "Creare magazin online" --description "..." --template <o pagină de serviciu existentă, de exemplu creare-site-web>`.
4. Stilurile și scriptul paginii merg în `legacy-mirror/wp-content/ect-pages/creare-magazin-online.css` și `.js`, după modelul `google-ads.css` și `google-ads.js`. Copiază regulile din `pagina.css` și componentele `ect-` folosite din `docs/design-system/components/bundle.css`. Nu lega fișiere din `docs/`: folderul nu se publică.
5. Adaugă pagina în `scripts/i18n/routes.mjs` (RO `/creare-magazin-online/`, ruta EN se stabilește cu utilizatorul) și textele EN într-un dicționar separat, ca `scripts/i18n/google-ads.mjs`. Paginile EN se generează, nu se scriu de mână.
6. Folosește imaginile care sunt deja în repo (tabelul de mai jos), fără copii noi.
7. Verifică: `npm test`, `npm run build`, pagina la 360, 390 și 1440 px, meniul, linkurile, FAQ-ul și validarea formularului, fără să trimiți mesaje reale.
8. Nu face commit sau push fără acordul utilizatorului.

## Imagini (există deja în repo)

| În pagină | Fișier |
| --- | --- |
| Logo (header, bon, footer) | `legacy-mirror/wp-content/uploads/2024/02/Logo_Echipa_de_Tocilari-e1708028624694.webp` |
| Personajul de deasupra panoului „Pentru cine e” | `legacy-mirror/wp-content/ect-pages/home/faq-tocilar-3d-v2.webp` |
| Personajul din FAQ | `legacy-mirror/wp-content/ect-pages/home/faq-tocilar-reader.webp` |

Telefonul din hero e desenat integral în HTML și CSS, fără imagini.

## Secțiuni, în ordine

1. **Hero:** H1 „Creare magazin online”, CTA către `#formular_contact_bottom` și link către `#ce-include`. În dreapta, un telefon cu magazinul unui brand inventat („Atelier Lut”, doar ilustrativ, nu e client): 4 ecrane și 3 notificări.
2. **Pentru cine e:** panou portocaliu cu trei cupoane. Sus e situația și grija clientului, jos ce facem noi, despărțite de o linie de tăiere cu foarfecă. Pe telefon panoul ocupă toată lățimea, ca banda de pe homepage.
3. **Ce include** (`#ce-include`): „Linia Comenzii”, un traseu de metrou cu 6 opriri, plus link către `/creare-site-web/` și link „Vezi cât costă” către `#cost`.
4. **Cum lucrăm:** casete cu cifre (30 de minute, 4 pași, 1 om de contact, „În scris”, CTA) și bonul de proiect cu cei 4 pași.
5. **Prețuri** (`#cost`): Start 1.490 €, Business 2.490 € și Avansat de la 4.490 €, cu livrabilele aprobate în revizia comercială.
6. **Ce intră în preț și ce nu** (`.mg-scope`): panoul portocaliu „În preț” (ce include fiecare pachet și ce ne dă clientul), panoul cu contur punctat „Pe lângă preț” (ce se plătește și ce se estimează separat) și patru note: Start și Business, Avansat, TVA, preț și termen.
7. **FAQ** (`#intrebari-frecvente`): portat de pe homepage (`.ect-home-faq`), `<details name="mg-faq">`, prima întrebare deschisă.
8. **După lansare:** carduri către `/servicii-seo/`, `/agentie-google-ads/`, `/administrare-site/`.
9. **Formularul de contact** (`#formular_contact_bottom`), imediat deasupra footerului, apoi footerul.

## Comportamente

- **Telefonul:** ecranele se schimbă la 3,8 s. Un punct alege ecranul și oprește schimbarea; butonul rotund oprește sau repornește. Cu `prefers-reduced-motion`, pornește oprit și animațiile se opresc. Ilustrația are `role="img"` și o descriere, iar ecranele sunt `aria-hidden`.
- **FAQ:** semnele de întrebare de lângă personaj sunt animate din CSS și au un buton de pauză (44 x 44 px). Cu `prefers-reduced-motion`, animația nu pornește și butonul nu se afișează.
- **Header:** „Servicii” și burgerul se închid unul pe altul. Pe site rămâne logica meniului comun.
- **Formular:** în prototip doar afișează confirmarea. Pe site folosește handlerul existent.

## Revizia comercială aprobată (12.10.2026)

- Start: design personalizat pe o structură simplă, o limbă, 25 produse manual sau 100 din CSV pregătit, instruire și 30 zile corectare erori.
- Business: personalizare dedicată pentru homepage, categorie și produs, 50 produse manual sau 500 din CSV, filtre pe atribute, produse recomandate, recuperare coș abandonat, feed Merchant Center și 60 zile corectare erori.
- Avansat: design și funcții pentru cerințe complexe, cu catalogul, limbile și automatizările stabilite în oferta scrisă. ERP, aplicațiile custom și migrările complexe se estimează separat.
- În toate: un procesator de plată, un curier cu AWB și un serviciu de facturare prin conectori standard compatibili, SEO tehnic, măsurarea comenzilor, instruire și două runde de revizii. Materialele și datele produselor vin de la client.
- Domeniul, hostingul, abonamentul Shopify, aplicațiile, licențele și mentenanța ulterioară sunt separate. Costurile și regimul TVA se comunică înainte de contract.
- Cardul E-commerce de pe `/creare-site-web/` reflectă aceeași ofertă Start și trimite către pachetele detaliate.
- Ruta și textele EN rămân de stabilit într-o etapă ulterioară. Linkul EN din headerul prototipului (`/en/`) nu aprobă o versiune EN a acestei pagini.

## Secțiunea „Ce intră în preț și ce nu” (13.10.2026)

- Sursa este exportul de design „Creare magazin online · secțiunea de sub prețuri”. Utilizatorul a ales varianta B („În preț” și „Pe lângă preț”); varianta A („Sumarul comenzii”) nu se implementează.
- Secțiunea vine imediat după pachetele de preț, ca secțiune separată cu H2 propriu, și înlocuiește cele trei coloane de condiții („Produsele și materialele”, „Integrările și reviziile”, „Costurile separate”) și nota de sub ele. Informațiile sunt aceleași, reorganizate; prețurile și pachetele nu se schimbă.
- Culorile sunt cele din export: text `#fcfcfc` pe panoul portocaliu `#fd8649`, iar evidențierea din titlu rămâne text închis pe portocaliu. Nu se înlocuiesc pentru contrast.
- Stilurile sunt în `creare-magazin-online.css`, cu prefixul `mg-scope`. Secțiunea nu are JavaScript și nici elemente interactive.
- Comparată cu exportul la 320, 360, 390, 430, 600, 768, 880, 900, 1024, 1100, 1280 și 1440 px: aceleași poziții, fonturi și culori, fără overflow orizontal în secțiune.

## Butoanele din hero (13.10.2026)

- La cererea utilizatorului, lista cu bife de sub descriere („Catalog clar”, „Comenzi de pe mobil”, „Plăți și livrare”) a fost scoasă din hero. Nu o readuce din `pagina.html`.
- Cele două acțiuni sunt acum `.mg-cta` în `.mg-hero-actions`: „Primește o ofertă” plin, portocaliu `#fd8649` cu text alb, și „Vezi ce include” alb cu contur `line-peach`. Fiecare are un cerc cu săgeată (orizontală, respectiv verticală), ca la CTA-ul din casetele „Cum lucrăm”.
- Sub 500 px butoanele stau unul sub altul, pe toată lățimea; de la 500 px în sus stau pe un rând, în cel mult 500 px. Înălțimea este 56 px la orice lățime.
- Variantele `ect-btn--ink` și `ect-btn--text` nu mai sunt folosite pe pagină, iar regulile lor au fost scoase din `creare-magazin-online.css`.

## SEO

- Title: `Creare magazin online | Echipa de Tocilari`
- Meta description: `Creăm magazine online WooCommerce sau Shopify, cu design personalizat, plăți, livrare și facturare. De la 1.490 €. Solicită o ofertă.`
- Keyword principal: creare magazin online (1.300/lună, Semrush RO, 18.09.2026). Secundare: realizare magazin online (260) în „Ce include”; creare magazin online preț (170) la prețuri și în FAQ.
- Date structurate: Service și FAQPage, doar cu textul vizibil pe pagină, prin pipeline. Indexarea rămâne controlată de `PUBLIC_INDEXABLE`.
- Linkuri interne: `/creare-site-web/`, `/servicii-seo/`, `/agentie-google-ads/`, `/administrare-site/`.

## Reguli de text

- Fără em dash (U+2014) și fără săgeți diagonale (U+2196 până la U+2199), nici ca iconuri.
- Diacritice cu virgulă dedesubt: ș și ț (U+0219, U+021B), nu variantele cu sedilă (U+015F, U+0163). Fără emoji. Ton cu „tu” și „noi”.
- Doar afirmații verificabile: fără clienți, rezultate, recenzii sau prețuri inventate.
- Ținte de atingere de minimum 44 x 44 px, focus vizibil, `prefers-reduced-motion` respectat.
