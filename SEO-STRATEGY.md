# Strategie SEO și memorie de proiect

Salvat la cererea utilizatorului la 18 septembrie 2026. Acest document păstrează direcția de lucru pentru paginile viitoare. Nu reprezintă confirmarea că toate modificările propuse au fost implementate.

## Oferta și arhitectura

Homepage-ul este punctul central pentru șapte grupuri tematice. Oferta este limitată la creare site web, creare magazin online, dezvoltare aplicații web și mobile, SEO și vizibilitate în AI, Google Ads, Facebook Ads cu Instagram și mentenanță site. Nu promova logo design sau copywriting ca servicii separate. Pagina dedicată pentru magazin online a fost readusă în implementare (design aprobat pe 12.10.2026, pachet în `docs/ui/creare-magazin-online/`). Pagina pentru dezvoltare aplicații a fost readusă în implementare la cererea utilizatorului din 17.10.2026, exact după pachetul `docs/ui/dezvoltare-aplicatii/`. Pagina Facebook Ads rămâne retrasă; rândul ei de mai jos rămâne cercetare pentru o eventuală etapă viitoare.

Păstrează URL-urile existente, cu excepția migrării explicite a paginii Google Ads descrise mai jos, fără a introduce obligatoriu un director /servicii/. Nu crea pagini separate pentru sinonime precum creare site, realizare site și creare website. Delimitează intenția homepage-ului de cea a paginilor de servicii.

O pagină Servicii care repetă homepage-ul nu este necesară. Meniul și cardurile de magazin online și dezvoltare aplicații de pe homepage oferă acces direct la /creare-magazin-online/ și /dezvoltare-aplicatii/. Din 19.10.2026, cardul Facebook Ads trimite la formularul existent, iar /services/ și /en/services/ sunt retrase din surse, rute și metadata. URL-urile lor redirecționează permanent către lista de servicii de pe homepage, la /#servicii și /en/#servicii.

Tot la 19.10.2026 au fost retrase paginile demonstrative /clients/ și /en/clients/ și serviciul separat /logo-design/ și /en/logo-design/. Nu au un înlocuitor echivalent și răspund cu 404 după publicarea schimbărilor. Nu se generează pagini HTML, schema, hreflang sau intrări sitemap pentru aceste șase rute. About promovează web design cu link către /creare-site-web/. Build-ul respinge linkurile interne către paginile retrase, iar scraperul le exclude.

## Keywords pe pagini

Sursa: `keyword-research-2026-09-18.md`, cercetare Semrush pentru România. Volumele sunt estimări lunare istorice din cercetare, nu valori live sau garanții. Nu aplica volumele RO versiunilor EN.

| Pagină | Keyword principal și volum | Keywords secundare |
| --- | --- | --- |
| / | agentie marketing online bucuresti, 1300 | agentie marketing online; agentie marketing digital |
| /creare-site-web/ | creare site web, 2900 | creare site prezentare; realizare site; creare site web bucuresti; creare site web pret; firma web design |
| /creare-magazin-online/ | creare magazin online, 1300 | realizare magazin online; creare magazin online pret |
| /dezvoltare-aplicatii/ | dezvoltare aplicatii mobile, 170 | dezvoltare aplicatii web; creare aplicatii mobile |
| /servicii-seo/ | servicii seo, 2900 | optimizare seo; servicii seo bucuresti; consultanta seo; audit seo; optimizare seo pret |
| /agentie-google-ads/ | agentie google ads, 260 | servicii google ads; campanii google ads; promovare google ads |
| /facebook-ads/ | agentie facebook ads, 140 | servicii facebook ads; promovare facebook |
| /administrare-site/ | mentenanta site, 260 | administrare site; mentenanta site wordpress; administrare website; mentenanta website |

Folosește variantele natural, cu diacritice în textele publicate. Nu forța potrivirea exactă și nu crea pagini repetitive pentru fiecare variantă sau pentru fiecare oraș. Termenii de preț se acoperă inițial prin secțiuni utile în pagina serviciului, fără prețuri inventate.

Pagina Google Ads folosește acum ruta /agentie-google-ads/. Rutele anterioare /pay-per-click/ și /en/ppc-advertising/ au redirecționări permanente către versiunile noi, ca fiecare limbă să aibă o singură pagină comercială Google Ads. La 19.10.2026, auditul live a confirmat 404 pe URL-urile vechi, deși configurația locală declara redirecționări. Repararea locală acoperă potrivirea cu și fără slash final; funcționarea în producție trebuie reverificată după publicare.

## Oferta magazin online aprobată (12.10.2026)

Pagina `/creare-magazin-online/` folosește trei pachete: Start 1.490 €, Business 2.490 € și Avansat de la 4.490 €. Business este recomandarea comercială de pe pagină, iar oferta de intrare pentru viitoarele reclame Google Ads este de la 1.490 €. Aceste prețuri înlocuiesc Start 1.250 € și variantele provizorii Silver/Gold din prototip.

Platformele sunt Shopify și Medusa, cu cod personalizat și limitele de implementare precizate în ofertă. Start și Business se construiesc pe Shopify; Avansat se construiește pe Shopify sau pe Medusa, deci Medusa este disponibilă doar în pachetul Avansat (decizia utilizatorului din 13.10.2026). Nu asocia prețul de intrare de 1.490 € cu Medusa. La aceeași dată utilizatorul a renunțat complet la WooCommerce; nu îl readuce în texte, metadata sau date structurate. Start include 25 produse încărcate manual sau 100 importate dintr-un CSV pregătit, o limbă și 30 zile de corectare a erorilor. Business include 50 produse manual sau 500 din CSV, personalizarea paginilor de homepage, categorie și produs, filtre, produse recomandate, recuperare coș abandonat, feed Merchant Center și 60 zile de corectare a erorilor.

La Medusa, integrările se estimează separat (decizia utilizatorului din 13.10.2026). În rest, toate pachetele includ un procesator de plată, un curier cu AWB și un serviciu de facturare prin conectori standard compatibili, SEO tehnic, măsurarea comenzilor, instruire și două runde de revizii. Pentru Avansat, catalogul, limbile și automatizările se stabilesc în oferta scrisă. ERP, aplicațiile custom și migrările complexe se estimează separat. Clientul furnizează materialele și datele produselor; curățarea datelor, variantele complexe și redactarea se ofertează separat.

Domeniul, hostingul, abonamentul Shopify, aplicațiile, licențele și mentenanța ulterioară au costuri separate, comunicate înainte de contract. Regimul TVA se precizează explicit în ofertă. Pagina magazinului rămâne exclusiv RO în etapa aprobată; versiunea EN și ruta ei necesită o etapă ulterioară.

## Optimizarea paginii magazin online (12.10.2026)

Pagina păstrează „creare magazin online” ca termen principal în title și H1. „Realizarea unui magazin online” apare natural în descrierea livrabilelor, iar căutările despre preț sunt acoperite de secțiunea cu pachete, costuri separate și FAQ. Title-ul include oferta de intrare de la 1.490 €. Introducerea explică serviciul, publicul și gestionarea comenzilor direct pe site; FAQ-ul explică și pe ce platformă se construiește fiecare pachet.

Datele structurate Service includ catalogul pachetelor extras din HTML-ul vizibil. Start și Business au prețurile afișate, iar Avansat are preț minim, fără a transforma „de la” într-un preț fix. FAQPage este generat din cele șapte întrebări vizibile. Aceste date nu reprezintă o garanție de clasare, rezultate speciale sau citare AI. Pagina rămâne exclusiv RO, iar politica PUBLIC_INDEXABLE rămâne neschimbată.

## Pagina dezvoltare aplicații (17.10.2026)

Pagina păstrează conținutul landingului aprobat din `docs/ui/dezvoltare-aplicatii/`, variantele de titlu și tip de aplicație prin `?tip=mobil|web|portal|ai`, poveștile pe telefon, taburile pe desktop și formularul și footerul comune. La cererea utilizatorului din 17.10.2026, headerul folosește structura comună de pe homepage: logo, meniul Servicii, Portofoliu, Contact, butonul «Ai o idee?» și meniul expansibil pe mobil. Pagina este exclusiv RO; o versiune EN necesită texte și rută aprobate separat. De la 20.10.2026, la cererea utilizatorului ca headerul de pe homepage să apară pe toate paginile, comutatorul RO/EN apare și aici, iar EN duce la homepage-ul englezesc (`/en/`, etichetat «English homepage»), fără să sugereze o traducere și fără hreflang. La fel pentru pagina magazinului online. Meniurile RO și cardul de pe homepage trimit la pagina nouă. Canonical rămâne `/dezvoltare-aplicatii/`, fără parametri. Indexarea rămâne controlată exclusiv de `PUBLIC_INDEXABLE`, implicit dezactivată; nu a fost introdusă o excepție permanentă de indexare pentru landing.

Pachetele au fost aprobate explicit de utilizator la 17.10.2026, după cercetarea din `docs/research/aplicatii-2026-10-17/`: Start de la 4.900 €, Business de la 9.900 € și Avansat de la 19.900 €, toate fără TVA. Aceste valori și limitele aprobate înlocuiesc `[PREȚ]` și `[N]` din design. Business rămâne pachetul recomandat.

Start include o aplicație web sau mobilă iOS și Android, administrare simplă, maximum 5 ecrane principale, un flux, două roluri, UX/UI, autentificare, backend, bază de date, emailuri tranzacționale, lansare, monitorizare, testare, cod, documentație, instruire și 30 de zile de corectare a erorilor. Nu include la pragul minim plăți, abonamente, integrări de business, offline sau AI.

Business include baza Start, o aplicație iOS și Android cu administrare web extinsă sau o aplicație web de business, maximum 12 ecrane, 3 fluxuri și 3 roluri. Adaugă permisiuni, căutare, filtrare, un modul de plăți standard sau programări, notificări push și email, până la 2 integrări standard, rapoarte, export CSV, mediu de test, teste automate, backup configurat și 60 de zile de corectare a erorilor. Procesatorul de plăți ocupă una dintre integrări. API-urile de business trebuie documentate, cu acces furnizat de client.

Avansat include baza Business, cu limite totale de maximum 20 de ecrane, 5 fluxuri, 5 roluri și 3 integrări standard. Include portal clienți, SaaS sau web cu mobil, în configurația agreată, un singur modul avansat ales (organizații multiple, abonamente recurente sau automatizare AI delimitată), istoric, rapoarte, exporturi, lansare pe etape, verificări de securitate și încărcare potrivite scopului și 90 de zile de corectare a erorilor. Varianta AI are un flux, o sursă de date și un furnizor API, care consumă una dintre cele 3 integrări. Limitele treptelor înlocuiesc plafoanele anterioare, fără a se aduna.

Inventarul ecranelor include autentificarea și administrarea când au interfețe distincte. Emailul tranzacțional, push, autentificarea, monitorizarea și infrastructura nu consumă plafonul integrărilor de business. Toate pachetele includ două runde de ajustări de design înainte de dezvoltare. Funcțiile și criteriile de acceptare se precizează în ofertă; plafoanele nu garantează că orice funcție încape în prețul minim. Marketplace complet, plăți către vânzători, ERP complex, offline complex și migrări ample au estimări distincte.

Conturile Apple și Google, hostingul, găzduirea bazei de date, stocarea, domeniul, licențele, comisioanele și consumul serviciilor externe și AI se plătesc separat. Corecțiile de 30/60/90 de zile se raportează la specificația livrată. Funcțiile noi, mentenanța, actualizările de sistem, SLA și intervențiile permanente se ofertează separat. Aprobarea publicării în magazine aparține Apple și Google. Regimul TVA și toate costurile sunt precizate înainte de contract.

Schema Service include catalogul extras din pachetele vizibile, cu `minPrice` pentru toate cele trei oferte, deoarece prețurile sunt «de la», și precizarea TVA exclus. FAQPage este extras din întrebările și răspunsurile vizibile. Formularul folosește handlerul existent, fără confirmarea simulată din prototip sau măsurare nouă a conversiilor. Nu se inventează o adresă pentru politica de confidențialitate. Indexarea și regula exclusiv RO rămân neschimbate.

## Conținut de suport propus

Acestea sunt idei editoriale, nu keywords cu volume validate separat. Răspunde întâi întrebărilor esențiale în pagina serviciului. Creează articole separate numai când există informație suficientă, distinctă și utilă.

- Creare site web: cât costă un site de prezentare; ce materiale pregătește clientul.
- Magazin online: costuri; funcții pentru plăți, livrare și comenzi.
- Aplicații: aplicație web sau mobilă; informații necesare pentru estimarea costului.
- SEO: ce include un audit; timpul până la rezultate; pregătirea site-ului pentru răspunsurile AI.
- Google Ads: buget; diferența dintre bugetul plătit către Google și costul administrării.
- Facebook Ads: când sunt potrivite reclamele Facebook și Instagram; materiale necesare campaniilor.
- Mentenanță: ce include; diferența dintre mentenanță și administrare.

## AEO și GEO

Integrează oferta în pagina SEO, sub denumirea clară «SEO și vizibilitate în AI», cu secțiunea «Ajută-ți afacerea să fie găsită și în răspunsurile AI». Explică activitățile, beneficiile urmărite și limitele în limbaj simplu. Nu crea acum pagini comerciale separate AEO/GEO: cercetarea disponibilă nu validează suficient intenția comercială. Nu interpreta lipsa unui rând Semrush ca volum zero.

Toate paginile viitoare, inclusiv EN, trebuie să respecte regulile AEO, GEO și mobile first din AGENTS.md. Nu garanta citarea în răspunsurile AI.

## Linkuri interne

- Homepage-ul prezintă cele șapte servicii; meniul trimite direct la paginile de servicii existente.
- Articolele trimit contextual la pagina serviciului relevant; pagina serviciului trimite la explicațiile utile.
- Creare site web se leagă contextual de mentenanță și SEO.
- Magazin online se leagă contextual de SEO, Google Ads și Facebook Ads.
- Serviciile trimit către proiecte relevante din portofoliu, numai dacă există dovezi reale.
- Folosește linkuri HTML crawlable și ancore descriptive, naturale. Nu izola artificial grupurile și nu adăuga linkuri fără utilitate doar pentru SEO.

Referință: https://developers.google.com/search/docs/crawling-indexing/links-crawlable

## Ordinea de lucru

1. Verifică distribuția keywords, titlurile, H1, conținutul și linkurile pe paginile de servicii existente, înainte de a crea pagini suplimentare.
2. Dezvoltă conținutul de suport, începând cu creare site web, SEO și mentenanță.
3. Extinde celelalte grupuri după nevoile clienților și datele disponibile.

Nu declara canibalizare sau oportunități de clasare ca fapte fără verificări. Cercetarea Semrush nu a furnizat date organice pentru domeniu; aceasta nu dovedește absența traficului. Lista istorică include termeni pentru servicii retrase, care nu trebuie reintroduse în ofertă.

Reguli persistente: formularul de pe homepage imediat înaintea footerului pe fiecare pagină RO/EN; fără em dash sau săgeți diagonale; design inspirat din homepage, creare site web, administrare site și SEO. Pentru implementare și verificări, urmează AGENTS.md. Commit și push necesită aprobarea specifică a utilizatorului.
