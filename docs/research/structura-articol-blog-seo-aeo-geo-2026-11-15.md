# Structura unui articol de blog pentru SERP, AI Overviews și motoare generative (SEO, AEO, GEO)

Data cercetării: 15.11.2026 · 5 unghiuri de cercetare + 2 verificatori care au încercat să infirme fiecare afirmație (67 de constatări: 24 confirmate, 41 slabe, 2 depășite) · Punctele-cheie de la Google, Ahrefs și disponibilitatea în România au fost reverificate separat pe sursă.

## Pe scurt

Pentru Google nu există o disciplină separată AEO/GEO. Ghidul oficial din 2026 spune că optimizarea pentru căutarea generativă este „still SEO”, că nu există o lungime ideală a paginii, că nu trebuie să tai conținutul în bucăți mici și că nu ai nevoie de fișiere sau markup speciale pentru AI ([Google, AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)). Ce contează: conținut original, „non-commodity”, scris de un autor real, cu răspunsul direct sus și cu fiecare subîntrebare acoperită într-o secțiune clară.

Pentru ChatGPT, Perplexity, Copilot și Claude se adaugă un strat: accesul crawler-elor de căutare, dovezi verificabile în text (cifre cu sursă, citate atribuite) și prezența brandului în afara site-ului. Acest strat are dovezi mai slabe (studii corelaționale sau GPT-3.5).

## Scheletul articolului (de sus în jos)

| # | Bloc | Ce conține | De ce |
|---|---|---|---|
| 1 | `<title>` + un singur `<h1>` | Aceeași idee, cuvântul principal și promisiunea la început, brandul doar la final. Fără an în titlu dacă nu-l actualizezi. | Google construiește titlul din `<title>`, H1, og:title și ancore; rescrie titlurile neclare. Nu există limită fixă de caractere. |
| 2 | Byline + date | Autor real cu link la pagina de autor; „Publicat” și „Actualizat” vizibile, identice cu `datePublished`/`dateModified`. | Google vrea să se vadă cine a scris; datele vizibile trebuie să corespundă markup-ului. Data se schimbă doar la modificări reale. |
| 3 | Răspunsul direct (BLUF) | Primul paragraf sub H1, cam 40-60 de cuvinte: reformulează întrebarea și răspunde direct (definiție, verdict, cifră). | Citările AI vin preponderent din partea de sus a paginii (studii Surfer, Indig/ChatGPT: corelaționale). 40-60 de cuvinte e o convenție din datele Semrush despre featured snippets, nu o regulă Google. |
| 4 | Ce aduce articolul în plus | 1-2 rânduri sau o casetă: datele, testul sau proiectul nostru. Opțional: listă de idei-cheie + cuprins cu ancore `<a href="#id">`. | Elementul central cerut de Google este conținutul „non-commodity”. Cuprinsul e pentru utilizatori, nu un factor dovedit. |
| 5 | Secțiuni H2/H3 = subîntrebările reale | Câte un H2 pentru fiecare subîntrebare din SERP, PAA și fan-out (ce este, cum, cât costă, comparație, greșeli, alternative, specific RO). Formulate cum caută oamenii în română. Fiecare secțiune începe cu un răspuns de sine stătător, apoi dovezile. | AI Mode și AI Overviews folosesc query fan-out. Doar 37,9% din URL-urile citate în AI Overviews sunt în top 10 ([Ahrefs, 02.03.2026](https://ahrefs.com/blog/ai-overview-citations-top-10/)), deci acoperirea subîntrebărilor contează. Interogările-întrebare declanșează AI Overviews mult mai des. |
| 6 | Secțiunea originală | Cifre din proiectele noastre, capturi reale, rezultatul unui test, un caz de client (cu acord), metoda („de unde știm”). | Google: „create valuable, non-commodity content”. Information gain nu e un semnal confirmat, dar e un test editorial bun. |
| 7 | Tabel / listă numerotată | Tabel pentru comparații, listă numerotată pentru pași, doar când întrebarea le cere. | Format ușor de extras pentru snippets și AI. Paginile citate de LLM-uri au mai multe definiții, comparații și pași (studii 2026, corelaționale). |
| 8 | Dovezi în text | Fiecare cifră cu sursa și data lângă ea, citate atribuite unor persoane reale, link la surse primare (ANAF, lege, documentație). | Studiul GEO (KDD 2024): citatele, statisticile și sursele au crescut vizibilitatea în răspunsurile generative, iar keyword stuffing-ul a scăzut-o. Date GPT-3.5, deci doar indicativ. |
| 9 | Imagini / video | Imagini originale lângă textul relevant, alt descriptiv (nu listă de cuvinte), `width`/`height`. Video YouTube cu transcriere pentru subiectele de tip how-to. | YouTube reprezintă 5,6% din URL-urile citate în AI Overviews (Ahrefs). |
| 10 | Întrebări frecvente (opțional) | 3-6 întrebări reale ca H3, fiecare cu răspuns scurt direct. Doar dacă ajută cititorul. | FAQ rich results au dispărut din 07.05.2026 ([changelog Google](https://developers.google.com/search/updates)). Secțiunea poate servi la PAA și fan-out, dar Surfer o vede ca factor slab de citare. |
| 11 | Concluzie + CTA | Pasul următor, CTA moderat spre pagina de serviciu potrivită, separat vizual de conținutul principal. | Conținutul principal trebuie să se distingă de restul elementelor. |
| 12 | Biografie autor + articole înrudite | Bio scurtă (rol, experiență, profiluri); 2-4 linkuri spre pilon și articolele din cluster. | E-E-A-T (Trust e elementul central); clusterul tematic și linkurile interne. |
| 13 | JSON-LD | `BlogPosting` + `Person` (url, sameAs) + `Organization` publisher + `BreadcrumbList`, legate prin `@id`. | Igienă și claritatea entităților. Nu aduce citări AI: studiul Ahrefs pe 1.885 de pagini nu a găsit creștere semnificativă. |

## Reguli de scriere

- Intenția decide formatul: deschizi top 10 pe google.ro (fereastră privată), notezi tipul paginii, formatul și unghiul, apoi alegi același format plus un unghi care lipsește. Dacă SERP-ul e plin de pagini de servicii, nu scrii articol de blog pe acel cuvânt.
- Lungimea o dau subîntrebările, nu o țintă de cuvinte. Google numește scrisul la număr de cuvinte un semnal de alarmă.
- Fiecare secțiune trebuie să se înțeleagă singură: subiectul în prima propoziție, fără „după cum am spus mai sus”. Nu tăia artificial textul în bucăți pentru AI.
- Propoziții clare, afirmative, cu cifra, data și sursa lângă afirmație. Rezumatele AI distorsionează mai greu un astfel de text.
- Cuvântul principal folosit natural, cu variante; nimic forțat în H2-uri.
- AI e permis la scris, dar cu verificare umană a fiecărei afirmații, material original și autor real. Conținutul generat în masă fără valoare adăugată este „scaled content abuse”.
- Diacritice corecte în text (ș, ț cu virgulă); slug ASCII fără diacritice, cu cratime: `/blog/cat-costa-un-site-web/`.
- Refresh pe evergreen-uri doar prin modificări reale (cifre, pași, capturi), cu „Actualizat” vizibil. Nu muți doar data.

## Stratul tehnic (o dată, în template)

- HTML static, randat pe server; textul de citat în HTML vizibil, nu doar în JSON-LD sau în taburi încărcate prin JS.
- Canonical absolut, care se referă la propria pagină, identic cu URL-ul din sitemap, og:url și `mainEntityOfPage`.
- `lastmod` în sitemap din data reală a editării (git), nu din data build-ului. `priority` și `changefreq` sunt ignorate de Google.
- Fără `nosnippet` sau `max-snippet` mic pe articole, pentru că scot pagina din AI Overviews.
- robots.txt: permiși Googlebot, Bingbot, OAI-SearchBot (ChatGPT search), PerplexityBot, Claude-SearchBot. GPTBot, ClaudeBot și Google-Extended sunt crawlere de antrenare; blocarea lor e o decizie separată și nu te scoate din răspunsuri. De verificat și CDN-ul sau WAF-ul.
- IndexNow la publicare pentru Bing, care alimentează Copilot. Google nu-l folosește, deci sitemap-ul rămâne în Search Console.
- Core Web Vitals în zona bună (LCP < 2,5 s, INP < 200 ms, CLS < 0,1): Google le recomandă, dar nu sunt un factor dominant.
- AI Overviews și AI Mode sunt disponibile în română și în România ([Google Help](https://support.google.com/websearch/answer/14901683?hl=en)).

## Ce nu facem (mituri)

| Mit | Realitate |
|---|---|
| Schema FAQPage aduce rich results sau citări AI | FAQ rich results nu mai apar din 07.05.2026; HowTo e depreciat din 2023; Google spune că nu e nevoie de schema specială pentru AI. |
| llms.txt ajută la citări | Google: nici nu ajută, nici nu strică în Search. SE Ranking (~300K domenii) nu a găsit efect. |
| Articolele de 2.000+ cuvinte rankează mai bine | „There's no ideal page length.” |
| Top 10 în Google = citat în AI | 37,9% overlap în AI Overviews (Ahrefs, 2026). Pentru ChatGPT, Gemini și Copilot, overlap-ul cu top 10 Google a fost de aproximativ 8-12% (Ahrefs, 2025). |
| Google penalizează textul scris cu AI | Problema e conținutul generat în masă fără valoare, indiferent cum e produs. |
| Schimbatul datei împrospătează rankingul | Google îl listează ca semnal de conținut scris pentru motoare. |
| Titlu max. 60 de caractere, meta description 155 | Fără limită oficială; Google rescrie des. Meta description scurtă și unică rămâne utilă. |
| 40-60 de cuvinte e regulă Google | E o medie din studii Semrush din 2018-2020 despre featured snippets, care au scăzut mult de atunci. O folosim ca reper de lizibilitate. |
| Listicle-ul propriu „cele mai bune agenții” ne face recomandați de AI | Lily Ray (2026, B2B, observațional): listicle-urile autopromoționale au fost citate fără recomandarea brandului în 69% din cazuri. |

## În afara articolului (GEO)

- Mențiuni ale brandului pe alte site-uri: corelația cu mențiunile în AI Overviews e de 0,664, mai mare decât cea a backlink-urilor, de 0,218 (Ahrefs, 75K branduri, corelație, nu cauzalitate).
- Entitate clară: pagină Despre, pagini de autor cu sameAs, Organization cu sameAs, Google Business Profile (vezi decizia GBP din memorie).
- Reutilizarea datelor originale: un rezumat video pe YouTube, răspunsuri autentice în comunități.
- Măsurare: Search Console (traficul din AI e inclus în Performance), Bing Webmaster Tools, referral din chatgpt.com, perplexity.ai și altele în GA4, plus un set fix de 10-20 de prompturi în română testate lunar în ChatGPT, Perplexity, Gemini și AI Mode.

## Grad de încredere

- Ridicat (Google oficial, reverificat): „still SEO”, fără lungime ideală, fără chunking, fără fișiere AI, conținut non-commodity, FAQ rich results eliminate, recomandările Article schema, lastmod, crawlerele OpenAI, Anthropic și Perplexity, disponibilitatea în română.
- Mediu (studii mari de industrie, corelaționale): overlap-ul AI Overviews cu top 10, prospețimea citărilor, mențiunile de brand, lipsa efectului schema asupra citărilor.
- Scăzut (un studiu, vendor sau date vechi): poziția citărilor în pagină (44,2% / 55% din prima treime), procentele din studiul GEO, 40-60 de cuvinte, ponderea factorilor din studiul Surfer.

## Surse principale

- Google: [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [AI features](https://developers.google.com/search/docs/appearance/ai-features), [Helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Article schema](https://developers.google.com/search/docs/appearance/structured-data/article), [Publication dates](https://developers.google.com/search/docs/appearance/publication-dates), [Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Title links](https://developers.google.com/search/docs/appearance/title-link), [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies), [Changelog](https://developers.google.com/search/updates)
- Studii: [Ahrefs AIO top 10 (2026)](https://ahrefs.com/blog/ai-overview-citations-top-10/), [Ahrefs schema și citări AI](https://ahrefs.com/blog/schema-ai-citations/), [Ahrefs prospețime](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/), [Ahrefs mențiuni brand](https://ahrefs.com/blog/ai-overview-brand-correlation/), [Ahrefs overlap asistenți AI](https://ahrefs.com/blog/ai-search-overlap/), [GEO paper, KDD 2024](https://arxiv.org/html/2311.09735), [Surfer AI citations](https://surfer.ai/blog/ai-overviews-research/), [Indig, SEJ](https://www.searchenginejournal.com/the-science-of-how-ai-pays-attention/561306/)
- Crawlere: [OpenAI](https://developers.openai.com/api/docs/bots), [Perplexity](https://docs.perplexity.ai/guides/bots), [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
