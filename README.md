# Echipa de Tocilari

Site cu **22 de pagini: 11 în română și 11 în engleză**, publicabile pe Vercel.
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
| `scripts/i18n/dictionary.mjs` | Traduceri și metadate în engleză |
| `scripts/lib/navigation.mjs` | Rezolvă linkurile relative folosind pagina sursă și limba țintă |
| `scripts/lib/standalone-assets.mjs` | Elimină integrările WordPress nefolosite și verifică asset-urile locale |
| `scripts/lib/contact-forms.mjs` | Adaptează formularele după generarea paginilor EN |
| `api/contact.js`, `server/contact.mjs` | Intrarea Vercel și implementarea server pentru formulare |
| `dist/` | Rezultatul generat; nu se editează direct |
| `vercel.json` | Build, funcția API, redirecturi și headere |

Build-ul verifică sintaxa scripturilor inline și JSON-LD, paginile declarate,
metadatele, `hreflang`, indexarea și existența asset-urilor, inclusiv imaginile
responsive, fișierele CSS și dependențele încărcate dinamic. Iese cu eroare dacă
găsește probleme. `npm test` verifică formularele, navigarea și transformarea
asset-urilor; testele folosesc răspunsuri simulate și nu trimit emailuri.

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

## Indexare și domeniu

Indexarea este controlată exclusiv de `PUBLIC_INDEXABLE` la build.

| | Preview / variabilă nesetată | Production / `PUBLIC_INDEXABLE=true` |
| --- | --- | --- |
| Meta robots | `noindex, nofollow` | `index, follow` |
| `robots.txt` | `Disallow: /` | `Allow: /` și sitemap |
| `sitemap.xml` | Absent | 22 de URL-uri, 11 RO și 11 EN |

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
| `/servicii-seo/` | `/en/seo-services/` |
| `/administrare-site/` | `/en/website-maintenance/` |
| `/contact/` | `/en/contact/` |
| `/portofoliu/` | `/en/portfolio/` |
| `/services/` | `/en/services/` |
| `/clients/` | `/en/clients/` |
| `/logo-design/` | `/en/logo-design/` |
| `/pay-per-click/` | `/en/ppc-advertising/` |

Fiecare pereche primește `hreflang` ro/en/x-default și selectorul RO/EN în
header. Build-ul generează titluri, descrieri, date structurate
Organization/WebSite/WebPage și, unde se aplică, FAQ/Service, plus `llms.txt`.
Sunt păstrate adaptările pentru mobil și `prefers-reduced-motion`.

Paginile demo vechi, duplicatele și paginile de atașament sunt excluse din
publicare; redirecturile lor sunt menținute împreună în
`scripts/lib/junk-redirects.mjs` și `vercel.json`.

`npm run mirror` rămâne un instrument opțional pentru un import separat în
`.mirror-scrape/`; necesită instalarea explicită a `website-scraper`. Nu face
parte din dezvoltarea sau publicarea obișnuită a site-ului independent.
