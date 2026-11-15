# Structura paginii /servicii-seo/

15.11.2026 · propunere, neimplementată · urmează mockup în canvas, apoi implementare doar după aprobare.

## Scopul paginii

Un singur obiectiv: vizitatorul trimite site-ul pentru analiză sau cere o ofertă. Totul pe pagină răspunde la cele patru întrebări pe care clientul le are înainte să scrie: ce primesc, cât costă, în cât timp, de ce voi. Serviciul se numește „SEO și vizibilitate în AI”, iar AEO și GEO sunt prezentate ca parte din SEO, nu ca produs separat (decizia din `SEO-STRATEGY.md`, secțiunea AEO și GEO).

Keyword principal: „servicii seo” (2900). Secundare: optimizare seo, servicii seo bucuresti, consultanta seo, audit seo, optimizare seo pret. Se folosesc natural, cu diacritice, fără forțare.

## Ce am aflat (pe scurt, cu surse)

- **Prețul vizibil e un avantaj.** Pe piața românească aproape nimeni nu afișează sume; dintre paginile citite, doar Websem are prețuri complete ([websem.ro/preturi](https://www.websem.ro/preturi): audit 900 €, SEO de la 700 €/lună, AEO separat cu setup). NN/g arată că prețul e informația căutată prima în B2B și că lipsa lui trimite oamenii la concurență; recomandă prețuri pe scenarii tipice, nu calculatoare ([nngroup.com/articles/show-price](https://www.nngroup.com/articles/show-price/)).
- **Garanțiile de poziție scad încrederea.** Google spune că nimeni nu poate garanta locul 1 și că o astfel de promisiune e un semnal de alarmă ([Do you need an SEO?](https://developers.google.com/search/docs/fundamentals/do-i-need-seo)). Pagina garantează livrabile, raportare și proces.
- **Pentru AI nu există trucuri.** Google: „no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary”; traficul din funcțiile AI apare în Search Console, la tipul Web ([ai-features](https://developers.google.com/search/docs/appearance/ai-features)). ChatGPT search folosește OAI-SearchBot, iar un site care îl blochează nu apare în răspunsuri ([OpenAI bots](https://developers.openai.com/api/docs/bots)); Perplexity are PerplexityBot ([docs](https://docs.perplexity.ai/guides/bots)). Livrabilele AI oneste sunt deci: SEO solid, acces pentru crawlerele de căutare AI, informații consecvente despre firmă, conținut care răspunde la întrebări, măsurare.
- **Ce fac concurenții bine:** formular sau câmp „site-ul tău” sus, catalog de servicii, proces pe pași, FAQ, CTA repetat, bară fixă pe mobil (servicii-seo-bucuresti.ro); secțiune „ți se potrivește / nu ți se potrivește” (Webprofits, Bubblegum Search în referințele din 14.11). AI e tratat superficial, de obicei ca o linie într-o listă.
- **Golul pe care îl putem ocupa:** prețuri vizibile + SEO și AI într-o singură ofertă + metodă concretă de măsurare pentru AI + transparență (conturile rămân ale clientului, fără garanții false).

## Structura, de sus în jos (mobile first)

Fiecare secțiune are: titlul propus, rolul ei în decizie și conținutul. Titlurile sunt de lucru; textele finale trec prin `avoid-ai-writing-ro`.

### 0. Header comun
Header-ul de pe homepage, neschimbat. Pe mobil apare, după primul scroll, o bară fixă jos cu două butoane: „Analiză gratuită” (duce la formular) și „Sună” (tel:+40750203466). Un singur rând, butoane de minimum 44 px, fără widget de chat peste ea.

### 1. Hero: răspunsul direct
- **H1:** „Servicii SEO și vizibilitate în AI”
- **Primul paragraf (răspunsul AEO, 2 propoziții):** ce facem (aducem site-ul în fața oamenilor care caută ce vinzi, pe Google și în asistenți AI ca ChatGPT sau Gemini), pentru cine (firme mici și mijlocii, site-uri de prezentare și magazine online) și cum (abonament lunar, cu raport pe înțeles).
- **CTA principal:** câmp „Adresa site-ului tău” + buton „Vreau analiza gratuită”. Trimite la formularul de jos cu URL-ul precompletat, ca să nu existe două formulare.
- **CTA secundar:** link „Vezi prețurile” (ancoră la secțiunea 7).
- **Rând de încredere sub butoane (3 elemente scurte):** prețuri afișate · conturile rămân pe numele tău · fără promisiuni de locul 1.
- **Indiciu de preț:** „de la X €/lună” lângă CTA, după decizia de preț (întrebarea 1).
- Vizual: mascota/ilustrația site-ului și chip alb pe portocaliu pe cuvântul „AI” din titlu (fără text negru pe portocaliu).

### 2. „Pe scurt”
Bloc compact cu 4 rânduri, bun pentru citare în răspunsuri AI și pentru cine nu citește tot:
- Ce primești: audit, optimizare tehnică și de conținut, SEO local, vizibilitate în AI, raport lunar.
- Cât costă: de la X €/lună, auditul separat de la Y € (sau gratuit, după decizie).
- În cât timp: primele corecturi în prima lună; rezultatele în căutări se văd de regulă în câteva luni, nu în zile.
- Cum ne oprim: durata minimă și preavizul (după decizie).

### 3. Ți se potrivește?
- **H2:** „Pentru cine sunt serviciile noastre SEO”
- Două coloane (una sub alta pe mobil): „Ți se potrivește dacă” (ai un site care nu aduce cereri, concurenții apar înaintea ta, vrei să fii recomandat și în răspunsurile AI, vrei să știi ce plătești) și „Nu e pentru tine dacă” (vrei rezultate în două săptămâni, cauți locul 1 garantat, site-ul trebuie refăcut complet înainte, caz în care trimitem la /creare-site-web/).
- Rol: califică lead-ul și arată sinceritate.

### 4. Ce include serviciul SEO
- **H2:** „Ce facem concret pentru site-ul tău”
- 6 carduri, fiecare cu 2-3 livrabile verificabile:
  1. **SEO tehnic:** indexare, viteză, erori, structură, sitemap, date structurate.
  2. **Conținut și optimizare on-page:** cuvinte cheie, titluri, texte de pagină, răspunsuri la întrebările clienților, articole când au sens.
  3. **SEO local:** Profilul Companiei pe Google (numele actual, nu „Google Afacerea Mea”), date consecvente în directoare.
  4. **Autoritate:** linkuri și mențiuni din surse relevante, fără pachete de linkuri cumpărate.
  5. **Vizibilitate în AI:** detaliat în secțiunea 5.
  6. **Măsurare și raport:** Search Console, GA4 (cu acordul vizitatorilor), raport lunar.

### 5. SEO și vizibilitate în AI (AEO, GEO)
- **H2:** „Ajută-ți afacerea să fie găsită și în răspunsurile AI” (titlu stabilit în `SEO-STRATEGY.md`).
- **Definiții, câte o propoziție:** AEO = răspunsuri clare la întrebările oamenilor; GEO = informații pe care asistenții AI le pot înțelege și folosi ca sursă. În practică se suprapun cu SEO.
- **Ce lucrăm (listă):** verificăm că ChatGPT search, Perplexity și Google pot accesa site-ul (robots.txt, OAI-SearchBot, PerplexityBot; decizia despre crawlerele de antrenare îi aparține clientului); date despre firmă identice peste tot; pagini care răspund direct la întrebări; date structurate care descriu fidel pagina.
- **Cum măsurăm:** Search Console, canal separat în GA4 pentru traficul venit din asistenți AI (măsurare parțială, o parte apare ca trafic direct), un set fix de întrebări relevante pentru afacerea ta, verificat lunar ca indicator de direcție.
- **Ce nu promitem:** citări sau recomandări garantate. Link la ghidul Google despre funcțiile AI ca sursă.
- Rol: diferențiatorul principal față de concurenți; trebuie să fie concret, nu vag.

### 6. Procesul
- **H2:** „Cum lucrăm, lună de lună”
- 4 pași numerotați: Analiză (audit și listă de priorități) · Corecturi (problemele tehnice care blochează) · Creștere lunară (conținut, local, autoritate, AI) · Raport și ajustare.
- Sub pași, calendar realist fără cifre de rezultat: luna 1 audit și corecturi; lunile 2-3 primele semnale în Search Console; după luna 4-6 creștere, în funcție de concurență.

### 7. Prețuri
- **H2:** „Cât costă serviciile SEO”
- 3 pachete pe scenarii, nu doar pe cantități: firmă locală / site de prezentare, firmă care vinde în toată țara (B2B sau servicii), magazin online. Plus auditul ca ofertă separată, de intrare.
- Fiecare card: preț („de la”), unitatea (pe lună), ce include, ce nu include (redesign, buget de reclame, texte peste limită), durata minimă și preavizul. Buton „Cere oferta pentru [pachet]”, care precompletează mesajul din formular.
- Sub carduri: o propoziție despre regimul fiscal (firmă neplătitoare de TVA, formularea de stabilit), ce influențează prețul (concurența, numărul de pagini, punctul de plecare al site-ului).
- Recomandat: pachetul din mijloc marcat „Cel mai ales” doar dacă e adevărat; altfel fără etichetă.

### 8. Raportul lunar
- **H2:** „Ce primești în fiecare lună”
- Captură de raport cu date demonstrative, marcată clar „exemplu”. Listă: ce s-a lucrat, ce s-a schimbat în căutări, cereri venite din organic, apariții observate în AI, ce urmează.
- Rol: face vizibil un serviciu care altfel pare abstract.

### 9. Transparență
- **H2:** „Ce garantăm și ce nu”
- Două liste scurte. Garantăm: livrabilele din pachet, raportul lunar, metode acceptate de Google, conturile (Search Console, Analytics, Profilul Companiei) rămân pe numele tău, la plecare primești tot. Nu garantăm: poziții, citări în AI, un anumit volum de trafic. Link la pagina Google „Do you need an SEO?”.

### 10. Dovezi
- **H2:** „Proiecte și oamenii din spatele lor”
- Doar ce e real: proiecte din portofoliu cu link, eventual capturi din Search Console cu acordul clientului, recenzii cu acord scris. Dacă nu avem un caz SEO măsurat, secțiunea arată echipa (nume, poză, rol) și proiectele web, fără cifre de creștere.
- Casetă de completat: cazuri SEO reale.

### 11. Bandă CTA
Bandă portocalie pe toată lățimea, text alb: „Trimite-ne site-ul și îți spunem ce îl ține pe loc” + buton „Vreau analiza gratuită”.

### 12. Întrebări frecvente
- **H2:** „Întrebări despre serviciile SEO”
- 7-8 întrebări reale, răspuns în primele propoziții. FAQPage din exact aceste întrebări.
  1. Cât costă serviciile SEO?
  2. În cât timp văd rezultate?
  3. Garantați prima pagină în Google?
  4. Ce include auditul SEO?
  5. Există o durată minimă a contractului?
  6. Am nevoie de blog?
  7. Cum ajung să fiu recomandat de ChatGPT sau Gemini?
  8. Ce se întâmplă cu conturile și datele dacă renunț?

### 13. Linkuri interne
Un rând de carduri sau linkuri în text: /creare-site-web/ (când site-ul trebuie refăcut), /administrare-site/ (mentenanță), /agentie-google-ads/ (rezultate rapide cu reclame, în paralel cu SEO), /portofoliu/.

### 14. Formularul comun + footer
Formularul de pe homepage, imediat deasupra footerului (regulă obligatorie). Primește URL-ul și pachetul din CTA-urile de mai sus. Formularul actual are nume, email, două câmpuri suplimentare și mesaj; un câmp „Adresa site-ului” ar ajuta calificarea (întrebarea 4). Telefonul, dacă există, rămâne opțional. Apoi footerul comun.

## Tehnic și GEO pentru pagina însăși
- Title: „Servicii SEO și vizibilitate în AI | Echipa de Tocilari”, plus indiciul de preț dacă se decide. Meta description cu ce, pentru cine, de la cât.
- Schema: Service cu OfferCatalog din pachetele vizibile (minPrice unde e „de la”), FAQPage din FAQ, Organization existent. Fără promisiuni de rezultate speciale.
- Autor și dată „actualizat la” vizibile; surse externe legate unde sunt citate.
- Intrare actualizată în `llms.txt`, canonical, sitemap prin pipeline; indexarea rămâne pe `PUBLIC_INDEXABLE`.
- Doar RO, ca celelalte pagini noi, până la o decizie pentru EN.

## Ce trebuie schimbat față de pagina actuală
- Ordinea pachetelor e greșită (439 €, 999 €, 699 €).
- „Preț fără TVA” e inexact: firma nu e plătitoare de TVA.
- Nota „doar dacă website-ul este construit în WordPress” contrazice faptul că facem site-uri în cod; trebuie reformulată pentru orice platformă cu acces.
- „Google Afacerea Mea” e numele vechi; acum e Profilul Companiei pe Google.
- Comunicatele de presă și NAP-urile numărate ca livrabile arată cantitate, nu valoare; de discutat dacă rămân.
- Butonul „Comandă acum!” promite o comandă; „Cere oferta” e mai potrivit pentru un serviciu care începe cu o discuție.
- Lipsesc: FAQ, proces cu calendar, transparență, CTA în hero, bara fixă pe mobil.

## Decizii deschise (ale tale)
1. **Prețurile:** păstrăm 439 / 699 / 999 € sau le revedem? Păstrăm pachete pe cantități sau trecem la scenarii (local, național, magazin)?
2. **Auditul:** gratuit (ca prim pas de contact), plătit, sau plătit și dedus din primul abonament?
3. **Durata minimă:** rămân 6 luni sau trecem la lunar cu preaviz? Concurența directă (Websem, The Markers) spune că nu impune durată minimă.
4. **Formularul:** adăugăm câmpul „Adresa site-ului” în formularul comun sau doar pe această pagină?
5. **Dovezi:** avem vreun client SEO cu rezultate pe care le putem arăta, cu acordul lui?
