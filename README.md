# Echipa de Tocilari

Site cu **20 de pagini: 11 în română și 9 în engleză**, publicabile pe Vercel.
Paginile, imaginile, fonturile și componentele de prezentare sunt statice.
Formularele folosesc o funcție Node.js separată, `/api/contact`, care trimite
emailuri prin Resend.

Proiectul a pornit de la exportul unui site WordPress/Elementor și păstrează
stilurile și unele biblioteci de afișare ale acestuia. **Build-ul și site-ul
public nu au nevoie de un server WordPress, PHP, baza sa de date sau editorul
Elementor.** Directoarele `wp-content` și `wp-includes` conțin fișiere locale.

## Dezvoltare locală

Este necesar Node.js 22.12 sau mai nou. Proiectul nu are dependențe npm pentru
build sau pentru funcția de contact.

```powershell
npm install
npm test
npm run build
npm run preview
```

Preview-ul pornește la `http://localhost:3000` și servește atât `dist/`, cât și
aceeași implementare `/api/contact` folosită pe Vercel. Citește automat
`.env.local`, dacă există. Portul poate fi schimbat prin variabila `PORT`.
Fără configurarea serviciilor de email și antispam, API-ul răspunde 503, iar
formularele afișează și adresa de email pentru contact direct.

Poți copia `.env.example` în `.env.local` și completa valorile necesare.
Fișierele cu secrete nu se publică și sunt ignorate de Git. `npm run build`
citește variabilele procesului, fără a încărca automat `.env.local`; pentru un
build care folosește acel fișier rulează:

```powershell
node --env-file=.env.local scripts/build-static.mjs
```

## Surse și build

| Cale | Rol |
| --- | --- |
| `legacy-mirror/` | Sursa HTML și asset-uri; aici se fac modificările vizuale |
| `scripts/build-static.mjs` | Copiază sursele, aplică metadatele, generează EN și validează rezultatul |
| `scripts/i18n/routes.mjs` | Lista unică a paginilor RO/EN |
| `scripts/i18n/dictionary.mjs` | Traduceri și metadate în engleză; `pageDictionaries` leagă dicționarele de pagină de rutele lor |
| `scripts/i18n/google-ads.mjs`, `scripts/i18n/privacy-policy.mjs` | Traducerile EN ale paginilor Google Ads și Politica de confidențialitate, câte un bloc întreg pe intrare |
| `scripts/lib/navigation.mjs` | Rezolvă linkurile relative folosind pagina sursă și limba țintă |
| `scripts/lib/standalone-assets.mjs` | Elimină integrările WordPress nefolosite și verifică asset-urile locale |
| `scripts/lib/contact-forms.mjs` | Adaptează formularele după generarea paginilor EN și adaugă rândul despre confidențialitate |
| `scripts/lib/privacy.mjs` | Adaugă în footer linkul spre politica de confidențialitate și butonul „Setări cookie-uri”, plus `consent.css`/`consent.js` în `<head>` |
| `legacy-mirror/wp-content/ect-pages/consent.js`, `consent.css` | Bannerul de cookie-uri și încărcarea Google Analytics după acord; obiectul `COPY` conține toate textele lui |
| `scripts/lib/social-meta.mjs` | Open Graph și Twitter: `og:locale` pe limbă, imagini absolute, logo implicit, fără etichetele vechi WordPress |
| `scripts/lib/lastmod.mjs`, `scripts/i18n/lastmod.json` | `<lastmod>` din sitemap: ziua ultimului commit al surselor paginii. Build-ul local actualizează fișierul JSON, care se comite împreună cu pagina; pe Vercel (clonă parțială) datele lipsă din istoric se iau din el |
| `api/contact.js`, `server/contact.mjs` | Intrarea Vercel și implementarea server pentru formulare |
| `dist/` | Rezultatul generat; nu se editează direct |
| `vercel.json` | Build, funcția API, redirecturi și headere |

Build-ul verifică sintaxa scripturilor inline și JSON-LD, paginile declarate,
metadatele, `hreflang`, indexarea și existența asset-urilor, inclusiv imaginile
responsive, fișierele CSS și dependențele încărcate dinamic. Iese cu eroare dacă
găsește probleme, inclusiv dacă o pagină încarcă tagul Google direct din HTML.
`npm test` verifică formularele, navigarea, transformarea asset-urilor,
bannerul de cookie-uri și pagina de politică (inclusiv traducerea ei completă
în engleză); testele folosesc răspunsuri simulate și nu trimit emailuri sau
date către Google.

Nu scrie manual paginile EN: modifică sursele RO și dicționarul, apoi reconstruiește.
`npm run new-page` oferă un punct de pornire pentru o nouă pagină în surse;
adaugă și ruta, traducerile și metadatele corespunzătoare.

## Portofoliu

Catalogul local conține **20 de modele demonstrative de site-uri**, preluate
din catalogul existent. Acestea sunt prezentate ca exemple de șabloane, nu ca
proiecte realizate pentru clienți. Cardurile, imaginile, categoriile și căutarea
funcționează fără cereri către WordPress. Linkurile de demonstrație se deschid
pe serviciul extern `websitedemos.net`.

Datele și imaginile sunt în `legacy-mirror/wp-content/ect-pages/portfolio/`.
După modificarea catalogului local, regenerează secțiunea RO astfel:

```powershell
node scripts/import-portfolio.mjs
npm run build
```

Opțiunea `--refresh` a scriptului este doar pentru un import explicit din vechiul
WordPress, cât timp acel serviciu există. Build-ul normal nu o folosește și nu
necesită acces la rețea.

## Formulare și configurare Vercel

Formularele trimit JSON către `/api/contact`. Funcția validează datele și
originea cererii, aplică protecția antispam și trimite mesajul prin Resend.
Răspunsul de succes confirmă acceptarea mesajului de către Resend; livrarea în
inbox se verifică în contul furnizorului.

Configurează separat variabilele pentru Production și Preview:

| Variabilă | Utilizare |
| --- | --- |
| `RESEND_API_KEY` | Cheia secretă Resend, numai pe server |
| `CONTACT_FROM` | O adresă de expeditor de pe domeniul verificat în Resend |
| `CONTACT_TO` | Între 1 și 5 destinatari separați prin virgulă; implicit `contact@echipadetocilari.ro` |
| `CONTACT_SPAM_PROTECTION` | `turnstile` implicit; `vercel-waf` numai după activarea regulii persistente în Vercel |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Necesar în modul Turnstile |
| `CONTACT_ALLOWED_ORIGINS` | Opțional: origini suplimentare explicite, separate prin virgulă |

Modul `vercel-waf` funcționează numai în Preview/Production Vercel și presupune
o regulă Firewall activă de rate limiting pentru POST pe `/api/contact` și
`/api/contact/`. Codul nu creează și nu verifică acea regulă. Nu seta variabilele
de sistem Vercel manual pentru a simula acest mod local.

Configurarea completă, verificarea domeniului expeditorului, protecția
Turnstile/WAF și testarea locală sunt descrise în
[docs/contact-forms.md](docs/contact-forms.md). Cheile și valorile secrete se
introduc în setările Vercel; nu se pun în HTML, în catalog sau în repository.

## Cookie-uri, Google Analytics și confidențialitate

Google Analytics 4 (`G-PGM4B3VM9Z`, cookie-urile `_ga` și `_ga_PGM4B3VM9Z`) nu
este în HTML-ul static. Build-ul elimină tagul moștenit din WordPress, iar
`scripts/lib/privacy.mjs` adaugă pe fiecare pagină RO și EN, după generarea
paginilor EN, `consent.css` și `consent.js` (cu `defer`). Validarea build-ului
eșuează dacă o pagină încarcă `gtag/js` sau `gtag('config')` direct.

- **Bannerul** apare la prima vizită în colțul din stânga jos, după modelul
  strawberrybrowser.com: „Setări”, „Refuz toate” și „Accept toate” (EN:
  Customize, Reject all, Accept all). Refuzul și acceptul arată la fel. Peste
  480px cele trei butoane stau pe un rând, cu lățimi egale; pe telefoanele
  unde etichetele nu încap, „Refuz toate” și „Accept toate” sunt pe primul
  rând, iar „Setări” pe al doilea. Etichetele nu sunt tăiate niciodată.
- **„Setări”** deschide în același card categoriile Necesare (mereu active) și
  Analiză (oprită implicit), apoi „Refuz toate” și „Accept toate” pe primul
  rând, cu lățimi egale, și „Salvează preferințele” pe al doilea. Timp de o
  jumătate de secundă după deschidere, clicurile din această vedere nu
  contează, iar al doilea clic al unui dublu-clic nu face niciodată o alegere,
  ca un dublu-clic sau o dublă atingere pe „Setări” să nu înregistreze acordul.
  Bannerul nu are buton de închidere: fără o alegere, Escape revine doar la
  rezumat. Dacă alegerea se schimbă în alt tab, setările deschise arată noua
  alegere.
- **Alegerea** se păstrează în `localStorage`, cheia `ect-consent`
  (`{v, analytics, ts}`), timp de 183 de zile (aproximativ 6 luni). Nu se
  trimite la server. Bannerul reapare după expirare sau când crește `VERSION`
  din `consent.js`, pentru o schimbare de politică ce cere o nouă alegere.
- **Google Analytics** se încarcă numai după acord și numai pe
  `echipadetocilari.ro` și `www.echipadetocilari.ro` (atributul
  `data-ga-hosts`). Pe localhost, pe adresele Preview Vercel și pe orice alt
  host alegerea se salvează, dar nu pleacă nicio cerere către Google,
  indiferent de `PUBLIC_INDEXABLE`. Consent Mode (basic): `ad_storage`,
  `ad_user_data` și `ad_personalization` rămân mereu `denied`; Google Signals
  și personalizarea reclamelor sunt oprite în configurare. Refuzul sau
  retragerea acordului dezactivează tagul și șterg cookie-urile `_ga*`.
- **Footer:** lista „PAGINI IMPORTANTE” / „IMPORTANT PAGES” primește linkul
  „Politica de confidențialitate” (`/politica-de-confidentialitate/`, EN
  `/en/privacy-policy/`) și butonul „Setări cookie-uri”, ascuns fără
  JavaScript. Lista primește clasa `ect-footer-links`: toate linkurile ei și
  butonul stau pe rânduri egale de 44px. Butonul redeschide preferințele și
  readuce focusul pe el la închidere. Elementele cu `data-ect-consent-open` sau
  `data-ect-consent-state` de pe alte pagini (de exemplu politica) primesc
  același comportament, respectiv starea curentă a alegerii.
- **Formular:** sub butonul de trimitere apare rândul „Folosim datele din
  formular ca să-ți răspundem. Politica de confidențialitate.” (EN: „We use
  the details in this form to reply to you. Privacy policy.”), cu link spre
  politică. Destinatarii (inclusiv căsuța Gmail din `CONTACT_TO`) și colectarea
  datelor furnizate de utilizatori din GA4 sunt descriși în politică; dacă se
  schimbă, actualizează politica.
- **Pagina de politică** (`/politica-de-confidentialitate/`, EN generat
  `/en/privacy-policy/`) are rezumatul „Pe scurt”, un cuprins (lipit în
  stânga de la 1100px), secțiunile cu id-uri neutre (`#summary`,
  `#controller`, `#data`, `#purpose`, `#retention`, `#recipients`,
  `#transfers`, `#cookies`, `#rights`, `#complaints`, `#children`,
  `#security`, `#changes`), apoi formularul comun și footerul. În `#cookies`,
  butonul „Schimbă setările cookie-urilor” (`data-ect-consent-open`, ascuns
  fără JavaScript) deschide preferințele, iar rândul `data-ect-consent-state`
  arată alegerea curentă. Linkul „Află mai multe” din banner duce la
  `#cookies`. Data din „Ultima actualizare” (`<time datetime>`) ajunge și în
  `dateModified` din schema WebPage, în ambele limbi.

Textele bannerului și etichetele din footer, în română și engleză, se
modifică numai în obiectul `COPY` din
`legacy-mirror/wp-content/ect-pages/consent.js`; build-ul citește etichetele
footerului de acolo, deci acestea nu trec prin dicționarul EN. Rândul din
formular este în `scripts/lib/contact-forms.mjs`, iar adresele politicii în
`PRIVACY_PATHS` din `scripts/lib/privacy.mjs`. Textul politicii este în
`legacy-mirror/politica-de-confidentialitate/index.html` (un bloc pe rând),
stilul în `legacy-mirror/wp-content/ect-pages/politica-de-confidentialitate.css`,
iar traducerea EN în `scripts/i18n/privacy-policy.mjs`: câte o intrare pentru
fiecare bloc, cu cheia identică cu HTML-ul românesc al blocului. Când schimbi
un bloc în română, schimbă cheia și traducerea în același commit; dacă
schimbarea privește cookie-urile sau datele trimise către Google, actualizează
și data afișată și, după publicare, crește `VERSION` din `consent.js`.
Folosește ș și ț cu virgulă, fără linie lungă (em dash) și fără săgeți
diagonale. Testele sunt în `scripts/lib/privacy.test.mjs`,
`scripts/lib/privacy-page.test.mjs` și `scripts/lib/consent-runtime.test.mjs`.

## Indexare și domeniu

Indexarea este controlată exclusiv de `PUBLIC_INDEXABLE` la build.

| | Preview / variabilă nesetată | Production / `PUBLIC_INDEXABLE=true` |
| --- | --- | --- |
| Meta robots | `noindex, nofollow` | `index, follow` |
| `robots.txt` | `Disallow: /` | `Allow: /` și sitemap |
| `sitemap.xml` | Absent | 20 de URL-uri, 11 RO și 9 EN |

Pentru un build de producție în PowerShell:

```powershell
$env:PUBLIC_INDEXABLE = 'true'
$env:PUBLIC_SITE_URL = 'https://www.echipadetocilari.ro'
npm run build
```

În Vercel, setează aceste valori pentru mediul Production. Preview trebuie să
rămână cu `PUBLIC_INDEXABLE=false` sau nesetat. `PUBLIC_SITE_URL` determină
URL-urile canonice, sitemap-ul și metadatele.

Vercel publică `dist/` și funcția `api/contact.js`. Conectarea domeniilor apex și
`www` se face în proiectul Vercel și în DNS, după verificarea adresei Preview.
Emailul poate rămâne la Hostico: păstrează înregistrările sale MX și configurează
separat înregistrările necesare site-ului și expeditorului Resend.

## Pagini și metadate

| RO | EN |
| --- | --- |
| `/` | `/en/` |
| `/about-2/` | `/en/about/` |
| `/creare-site-web/` | `/en/website-design/` |
| `/creare-magazin-online/` | Exclusiv RO |
| `/dezvoltare-aplicatii/` | Exclusiv RO |
| `/servicii-seo/` | `/en/seo-services/` |
| `/administrare-site/` | `/en/website-maintenance/` |
| `/contact/` | `/en/contact/` |
| `/portofoliu/` | `/en/portfolio/` |
| `/agentie-google-ads/` | `/en/google-ads-agency/` |
| `/politica-de-confidentialitate/` | `/en/privacy-policy/` |

Fiecare pereche primește `hreflang` ro/en/x-default și selectorul RO/EN în
header. Build-ul generează titluri, descrieri, date structurate
Organization/WebSite/WebPage și, unde se aplică, FAQ/Service, plus `llms.txt`.
Sunt păstrate adaptările pentru mobil și `prefers-reduced-motion`.

Paginile demo vechi, duplicatele și paginile de atașament sunt excluse din
publicare; redirecturile lor sunt menținute împreună în
`scripts/lib/junk-redirects.mjs` și `vercel.json`.

Paginile `/services/` și `/en/services/` sunt retrase și redirecționează permanent
către `/#servicii`, respectiv `/en/#servicii`. Paginile demonstrative Clients și
serviciul retras Logo design, în ambele limbi, nu se mai publică și răspund cu
404. Nu sunt incluse în sitemap, hreflang, metadata sau schema. Preview-ul local
aplică aceleași destinații de redirecționare și păstrează parametrii URL-urilor.
Rutele vechi Google Ads sunt `/pay-per-click/` și `/en/ppc-advertising/`, cu sau
fără slash final.

`npm run mirror` rămâne un instrument opțional pentru un import separat în
`.mirror-scrape/`; necesită instalarea explicită a `website-scraper`. Nu face
parte din dezvoltarea sau publicarea obișnuită a site-ului independent.
