# Formulare independente de WordPress

`api/contact.js` este funcția Vercel pentru `/api/contact`; implementarea privată este în `server/contact.mjs`. Nu are dependențe npm: folosește `fetch` din Node pentru Resend și, în modul Turnstile, Cloudflare. Niciun secret nu este injectat în HTML sau JavaScript-ul public.

Build-ul trebuie să apeleze `enhanceContactForms(html, { locale: 'ro' | 'en' })` din `scripts/lib/contact-forms.mjs` **după generarea și traducerea paginilor EN**. Fișierele `legacy-mirror/wp-content/ect-contact.js` și `.css` sunt copiate automat în output. Funcția păstrează aspectul existent, dar elimină metadatele de submit WordPress și dezactivează controllerul Elementor pentru formular.

## Configurare Vercel

Adaugă aceste variabile în proiectul Vercel, separat pentru Production și Preview. Valorile secrete se introduc în interfața Vercel sau prin fluxul securizat de configurare, nu în repository.

| Variabilă | Valoare / utilizare |
| --- | --- |
| `RESEND_API_KEY` | Cheie Resend cu permisiunea de trimitere pentru domeniul verificat. Secret server. |
| `CONTACT_FROM` | Adresă simplă, fără nume afișat, pe domeniul verificat Resend, de exemplu `site@echipadetocilari.ro`. Obligatorie. |
| `CONTACT_TO` | Între 1 și 5 adrese simple separate prin virgulă. Implicit `contact@echipadetocilari.ro`. Toate adresele sunt validate; duplicatele sunt eliminate fără diferențiere între majuscule și minuscule. |
| `CONTACT_SPAM_PROTECTION` | `turnstile` implicit; alternativ `vercel-waf` numai după activarea regulii persistente de mai jos în Vercel. |
| `TURNSTILE_SITE_KEY` | Cheia publică a widgetului Cloudflare Turnstile, obligatorie în modul `turnstile`. |
| `TURNSTILE_SECRET_KEY` | Cheia secretă Turnstile, păstrată exclusiv pe server, obligatorie în modul `turnstile`. |
| `CONTACT_ALLOWED_ORIGINS` | Opțional: origini HTTPS suplimentare, separate prin virgulă, fără wildcard. Domeniile apex/www, `VERCEL_URL` și `VERCEL_PROJECT_PRODUCTION_URL` sunt incluse automat. |

Verifică domeniul expeditorului în Resend și adaugă exact înregistrările DNS indicate de Resend. Păstrează înregistrările MX ale emailului Hostico. Pentru trimitere se poate folosi un subdomeniu separat, dacă acesta este verificat în contul Resend.

În modul implicit `turnstile`, widgetul trebuie să permită `echipadetocilari.ro`, `www.echipadetocilari.ro` și hostname-ul exact Vercel folosit pentru testare. Cheile Turnstile de test nu se folosesc în producție. Validarea server verifică succesul, hostname-ul și acțiunea `contact`; nu este suficient doar widgetul vizibil.

Pentru modul `vercel-waf`, configurează **mai întâi** în Vercel Firewall o regulă persistentă de rate limiting pentru metoda `POST` și ruta `/api/contact` (inclusiv `/api/contact/` dacă ruta este normalizată astfel). Regula trebuie să se aplice adreselor Production și Preview, cu grupare per IP și acțiune de blocare/răspuns 429. Confirmă regula activă, apoi setează `CONTACT_SPAM_PROTECTION=vercel-waf` pentru mediile respective. Acest mod folosește protecția Vercel deja configurată și nu cere cont Cloudflare sau chei Turnstile.

Contoarele Vercel WAF sunt per regiune, nu un singur contor global. Pentru Hobby/Pro, fereastra configurabilă este de maximum 10 minute; limita suplimentară din funcție poate rămâne 5 încercări/15 minute per instanță. Regula WAF trebuie să blocheze efectiv, nu să folosească doar acțiunea Log.

Serverul acceptă `vercel-waf` numai dacă variabilele de platformă indică `VERCEL=1` și `VERCEL_ENV=preview` sau `production`. Păstrează activate variabilele de sistem Vercel. Codul nu inspectează configurația contului Firewall: setarea modului este declarația operatorului că regula persistentă este activă. Dacă regula este dezactivată ulterior, reactiveaz-o sau revino la `turnstile` cu cheile valide. Cheile Turnstile lipsă nu activează automat modul WAF. Setările necunoscute ori folosirea modului WAF local răspund 503.

Configurează funcția `api/contact.js` cu `maxDuration: 30` în `vercel.json`: verificarea Turnstile are timeout 8 secunde, iar Resend 15 secunde. Un redirect global de domeniu trebuie să păstreze metoda POST sau să fie evitat pentru `/api/contact`.

## Comportament și protecție

- GET returnează doar configurația publică necesară formularului, inclusiv `protection: "turnstile"` sau `"vercel-waf"`. Fără configurarea completă răspunde 503. Frontend-ul omite widgetul numai în modul WAF explicit, pe un hostname nelocal servit prin HTTPS.
- POST acceptă JSON, verifică originea, limitează corpul la 16 KiB și validează câmpurile și lungimile. Vizitatorul poate seta doar `Reply-To`, niciodată expeditorul sau destinatarii. Mesajul este trimis într-o singură cerere Resend către lista `CONTACT_TO`, vizibilă în câmpul To. O adresă invalidă, un element gol sau peste 5 intrări în configurare dezactivează trimiterea până la corectare; nu sunt ignorați destinatari în mod silențios.
- În ambele moduri rămân active honeypot-ul, minimum 3 secunde de la inițializarea formularului, verificările de origine/conținut și maximum 5 încercări/15 minute/IP per instanță activă. Limita în memorie este suplimentară, nu o limită globală garantată între instanțele Vercel. Protecția între instanțe este Turnstile verificat pe server sau regula persistentă Vercel WAF, în funcție de modul configurat.
- Formularul păstrează datele la eroare și afișează succes doar după un răspuns Resend cu ID de mesaj acceptat. Acest răspuns confirmă acceptarea pentru trimitere; livrarea efectivă și eventualele bounce-uri se verifică în Resend.
- Reîncercarea manuală cu aceleași date păstrează identificatorul formularului. Serverul generează o cheie de idempotency Resend din acel identificator și conținut, evitând dublarea emailului în fereastra de 24 de ore Resend. În modul Turnstile, un token nou este folosit la reîncercare. Răspunsurile 429 Vercel WAF sunt afișate ca limitare a încercărilor chiar dacă platforma răspunde HTML.
- Logurile nu includ conținutul mesajului, adresele vizitatorului, tokenuri sau erori brute de la furnizori.
- Dacă JavaScript sau serviciile externe nu sunt disponibile, rămâne linkul direct de email afișat sub formular.

## Verificare locală

`node --test tests/contact.test.mjs` rulează teste offline cu răspunsuri simulate: nu trimite emailuri și nu contactează Turnstile.

`npm run preview` servește fișierele statice din `dist/` și aceeași implementare `/api/contact` folosită pe Vercel. Încarcă automat `.env.local`, dacă există, și adaugă originile locale pentru portul ales (implicit 3000). Copiază `.env.example` în `.env.local` și completează configurarea pentru testare. Fără configurarea necesară, API-ul răspunde 503; nu simulează un mesaj trimis. Modul `vercel-waf` se verifică pe o adresă Preview Vercel, unde poate fi aplicată regula Firewall reală.

Există un bypass **numai pentru dezvoltare locală**: `CONTACT_DEV_BYPASS_TURNSTILE=true`, `NODE_ENV=development`, `VERCEL_ENV` absent ori `development`, și `CONTACT_ALLOWED_ORIGINS=http://localhost:3000`. POST trebuie să provină de pe `localhost`/`127.0.0.1`. Acest bypass nu funcționează în Preview sau Production, iar frontend-ul îl acceptă doar pe localhost. Bypass-ul nu simulează Resend: dacă este folosit cu o cheie reală și este trimis un formular, va trimite un email real. Testele automate folosesc întotdeauna mock-uri.

Surse oficiale: [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js), [Vercel WAF rate limiting](https://vercel.com/docs/security/vercel-waf/rate-limiting), [Vercel system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables), [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [Turnstile validare server](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
