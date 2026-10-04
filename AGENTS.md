# Echipa de Tocilari — pipeline

Oglindă statică 1:1 a echipadetocilari.ro (scrape WordPress/Elementor) cu injectări SEO/AEO/GEO în `<head>`. Fără framework, fără dev server — doar scripturi Node.

## Comenzi

- `npm run build` — copiază `legacy-mirror/` → `dist/`, injectează meta/schema/hreflang, generează paginile EN și validează rezultatul (iese cu eroare dacă ceva nu e în regulă)
- `npm run preview` — servește `dist/` pe http://localhost:3000
- `npm run mirror` — re-scrape site-ul live în `.mirror-scrape/` (necesită `npm i -D website-scraper` mai întâi); mută manual ce e nevoie în `legacy-mirror/`
- `npm run new-page` — scaffoduiește o pagină nouă în `legacy-mirror/` refolosind shell-ul site-ului (header/footer)

## Structură

- `legacy-mirror/` — sursa de adevăr pentru markup și asset-uri (comis în git)
- `scripts/build-static.mjs` + `scripts/lib/` + `scripts/i18n/` — pipeline-ul de build
- `scripts/i18n/routes.mjs` — sursa unică de adevăr pentru „ce e pagină de-a noastră"
- `dist/` — output de build, deployat de Vercel (vezi `vercel.json`)

## Convenții

- Indexarea e controlată exclusiv de env-ul `PUBLIC_INDEXABLE` (nesetat = `noindex` peste tot)
- Nu edita niciodată `dist/` direct — editează `legacy-mirror/` sau pipeline-ul
- Paginile EN sunt generate, nu scrise de mână — actualizează `scripts/i18n/dictionary.mjs`

## Reguli obligatorii pentru pagini

- Fiecare pagină creată trebuie să aibă formularul de contact imediat deasupra footerului, după modelul de pe homepage. Regula se aplică atât paginilor deja create, cât și celor viitoare, în română și engleză. Refolosește structura, stilul și funcționalitatea formularului de pe homepage; un buton către pagina Contact nu înlocuiește formularul.
