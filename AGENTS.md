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

- Înainte de planificarea sau modificarea paginilor, citește `SEO-STRATEGY.md`. Acesta păstrează structura SEO stabilită cu utilizatorul, distribuția keywords și ordinea de lucru. Folosește `keyword-research-2026-09-18.md` ca sursă pentru cercetarea Semrush, ținând cont că include și termeni istorici pentru servicii retrase.

- Înainte de a construi sau modifica pagini, citește `docs/design-system/README.md`: sistemul de design al site-ului (culori, tipografie, spațiere, componentele `ect-` și regulile de conținut). Folosește valorile și componentele de acolo în loc să inventezi altele noi; detaliile sunt în `docs/design-system/tokens.json` și `docs/design-system/components/`. Folderul `docs/` nu se publică, așa că nu lega fișierele lui din pagini: copiază stilurile necesare în CSS-ul paginii din `legacy-mirror/wp-content/ect-pages/`.

- Indexarea e controlată exclusiv de env-ul `PUBLIC_INDEXABLE` (nesetat = `noindex` peste tot)
- Nu edita niciodată `dist/` direct — editează `legacy-mirror/` sau pipeline-ul
- Paginile EN sunt generate, nu scrise de mână — actualizează `scripts/i18n/dictionary.mjs`

## Reguli obligatorii pentru pagini și texte

- Fiecare pagină creată trebuie să aibă formularul de contact imediat deasupra footerului, după modelul de pe homepage. Regula se aplică atât paginilor deja create, cât și celor viitoare, în română și engleză. Refolosește structura, stilul și funcționalitatea formularului de pe homepage; un buton către pagina Contact nu înlocuiește formularul.
- Nu folosi niciodată caracterul em dash (U+2014) în textele redactate, inclusiv titluri, descrieri, butoane și răspunsuri către utilizator. Reformulează cu punct, virgulă, două puncte sau paranteze.
- Nu folosi săgeți diagonale în texte, butoane, linkuri sau elemente decorative de navigare, inclusiv caracterele U+2196, U+2197, U+2198 și U+2199. Regula se aplică și echivalentelor HTML sau iconurilor care reprezintă săgeți diagonale.

## Pagini viitoare: AEO, GEO și mobile first

- Toate paginile create de acum înainte trebuie proiectate mobile first și pregătite pentru AEO (răspunsuri clare la întrebări) și GEO (informații ușor de înțeles și folosit ca sursă în răspunsuri AI). Aplică aceleași criterii versiunilor RO și EN. Cerința privește atât conținutul vizibil, cât și structura tehnică, nu doar injectările din head.
- Începe conținutul cu o explicație directă a serviciului: ce oferim, cui îi este util și ce problemă rezolvă. Folosește limbaj simplu, titluri descriptive și secțiuni coerente despre livrabile, proces, costuri și condiții, adaptate scopului paginii.
- Răspunde concis întrebărilor reale ale clienților în secțiunile relevante sau într-un FAQ util. Nu adăuga întrebări artificiale doar pentru keywords și nu repeta inutil aceleași informații.
- Păstrează informațiile despre firmă și servicii consecvente între pagini. Folosește numai afirmații verificabile; nu inventa clienți, rezultate, recenzii, certificări, prețuri sau surse. Citează surse atunci când afirmațiile externe au nevoie de susținere.
- Folosește HTML semantic, un H1 clar, ierarhie logică H2/H3, linkuri interne relevante și conținut important disponibil în HTML. Menține metadata, canonical, hreflang și sitemap prin pipeline. Datele structurate trebuie să descrie fidel informația vizibilă, fără promisiuni de apariție în rezultate speciale.
- Nu prezenta AEO/GEO, schema sau fișierele destinate AI ca garanții de citare ori recomandare. Respectă PUBLIC_INDEXABLE; cerința de optimizare nu autorizează activarea indexării în preview sau staging.
- Proiectează întâi pentru telefon, apoi extinde pentru tabletă și desktop. Folosește stiluri de bază pentru mobil și extinderi progresive; evită overflow-ul orizontal, textele tăiate și informațiile esențiale ascunse pe mobil.
- Pe mobil, asigură text lizibil fără zoom, contrast suficient, butoane și controale ușor de atins (țintă de minimum 44 x 44 CSS px), focus vizibil și formulare cu etichete accesibile și tipuri de input potrivite. Nu baza navigarea pe hover.
- Optimizează imaginile, fonturile și scripturile pentru încărcare rapidă. Rezervă spațiu pentru media ca să eviți salturile de layout; nu încărca inutil asset-uri grele sau animații și respectă prefers-reduced-motion.
- Înainte de livrare, verifică vizual pagina la lățimi mobile (minimum 360 și 390 CSS px) și pe desktop. Testează meniul, linkurile, FAQ-ul și validarea formularului, fără a trimite mesaje reale. Rulează build-ul și verificările relevante. Raportează orice limitare de verificare; nu declara rezultate de performanță sau vizibilitate AI nemăsurate.
