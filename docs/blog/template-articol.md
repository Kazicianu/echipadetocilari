# Template: articol de blog (SEO, AEO, GEO)

Template de conținut pentru articolele de pe echipadetocilari.ro. Descrie ce scriem și în ce ordine, nu cum arată pagina: aspectul vizual vine din canvasul blogului după aprobare. Fundamentarea fiecărei reguli este în `docs/research/structura-articol-blog-seo-aeo-geo-2026-11-15.md`.

Cum se folosește: copiezi fișierul în `docs/blog/articole/<slug>.md`, completezi fișa, faci cercetarea, scrii în ordinea scheletului, iar la final treci prin lista de verificare. Textele dintre `[paranteze drepte]` se înlocuiesc. Blocurile marcate „opțional” se șterg dacă nu ajută cititorul.

---

## 1. Fișa articolului

```yaml
titlu_h1: "[Întrebarea sau promisiunea, cu cuvântul principal la început]"
title_tag: "[Aceeași idee ca H1, concis] | Echipa de Tocilari"
meta_description: "[1-2 propoziții care rezumă răspunsul. Unică.]"
slug: "/blog/[cuvinte-fara-diacritice-cu-cratime]/"
keyword_principal: "[ex. cat costa un site web]"
keywords_secundare: ["[varianta 1]", "[varianta 2]"]
intentie: "[informațională | comparație | cost | ghid practic]"
format_serp: "[ghid | listă | comparație | how-to | definiție]"   # din analiza top 10
etapa: "[TOFU | MOFU | BOFU]"
pagina_serviciu: "[/creare-site-web/ | /magazin-online/ | ...]"   # o singură pagină țintă
pilon: "[/blog/slug-pilon/ sau 'este pilon']"
autor: "[Nume real]"                       # vezi „Decizii deschise”
reviewer: "[Nume sau gol]"                 # pentru subiecte fiscale/juridice
data_publicarii: "[AAAA-LL-ZZ]"
data_actualizarii: "[AAAA-LL-ZZ]"          # se schimbă doar la modificări reale
element_original: "[ce aducem noi: date din proiecte, test, captură, caz]"
date_de_la_utilizator: ["[prețuri, cifre, acord client, capturi]"]
```

## 2. Cercetare înainte de scris

- [ ] **SERP-ul pe google.ro**: fereastră privată, `hl=ro&gl=ro`, top 10 pentru `keyword_principal`. Notezi tipul paginilor, formatul, unghiul și subiectele care se repetă. Dacă primele rezultate sunt pagini de servicii, nu scrii articol: cuvântul aparține paginii de serviciu.
- [ ] **Subîntrebări**: People also ask, căutările asociate, Autocomplete, plus întrebările de bază ale temei: ce este, cum funcționează, cât costă, de ce depinde, comparație cu alternativa, greșeli frecvente, specificul pentru România. Fiecare subîntrebare relevantă devine un H2 sau H3.
- [ ] **AI Overview și AI Mode**: ce răspuns dau pentru întrebare și pe cine citează. Același test în ChatGPT și Perplexity.
- [ ] **Canibalizare**: nu există deja o pagină sau un articol care răspunde aceleiași întrebări (vezi `SEO-STRATEGY.md` și `docs/research/blog-100-articole-2026-10-30/`).
- [ ] **Unghiul lipsă**: ce nu spune niciunul dintre primele rezultate și putem spune noi din experiență.
- [ ] **Surse primare** pentru fiecare cifră externă: lege, ANAF, documentația oficială a platformei, studiul original (nu un rezumat).

## 3. Scheletul articolului

Ordinea secțiunilor H2 din mijloc se adaptează formatului din SERP. Restul ordinii rămâne fix.

```markdown
Acasă > Blog > [Titlu scurt]                          <!-- breadcrumb vizibil -->

# [titlu_h1]

De [Autor](/autor/[slug-autor]/) · Publicat [ZZ.LL.AAAA] · Actualizat [ZZ.LL.AAAA] · [N] min de citit

[RĂSPUNS DIRECT, cam 40-60 de cuvinte. Prima propoziție reia întrebarea și răspunde la ea:
definiție, verdict sau interval de cost. A doua propoziție spune de ce depinde. Fără introducere
de tip „În lumea digitală de azi”.]

> **Pe scurt** (opțional)
> - [Idee-cheie 1, cu cifră dacă există]
> - [Idee-cheie 2]
> - [Idee-cheie 3]

[1-2 propoziții: ce aduce articolul în plus. Ex. „Cifrele de mai jos vin din [N] proiecte
făcute de noi în [an].”]

**Cuprins** (opțional, pentru articole cu peste 4 secțiuni)
- [Secțiunea 1](#[id-sectiunea-1])
- [Secțiunea 2](#[id-sectiunea-2])

## [Subîntrebarea 1, formulată cum caută oamenii] {#id-sectiunea-1}

[Prima propoziție răspunde direct și se înțelege fără restul articolului: numește subiectul,
nu scrie „după cum am spus”.] [Apoi explicația, exemplul, dovada. Paragrafe de 2-4 propoziții.]

## [Subîntrebarea 2] {#id-sectiunea-2}

[Răspuns direct.] [Dacă e vorba de pași:]

1. [Pas]
2. [Pas]
3. [Pas]

## [Comparație sau „de ce depinde” / „cât costă”]

[Răspuns direct.] [Dacă întrebarea cere comparație:]

| Criteriu | [Varianta A] | [Varianta B] |
|---|---|---|
| [Cost] | [...] | [...] |
| [Timp] | [...] | [...] |
| [Potrivit pentru] | [...] | [...] |

## [Ce am văzut în proiectele noastre / Cum am testat]

[ELEMENTUL ORIGINAL: cifre reale, capturi, rezultatul unui test, un caz de client cu acordul lui.
Spui metoda: câte proiecte, ce perioadă, cum ai măsurat. Fără clienți, rezultate sau cifre
inventate.]

![Alt text: ce arată exact imaginea](/wp-content/uploads/blog/[slug]/[nume-descriptiv].webp)
*[Legendă scurtă, opțional]*

## [Greșeli frecvente / Ce să eviți]

[Răspuns direct.] [Listă sau paragrafe scurte.]

## Întrebări frecvente (opțional, 3-6 întrebări reale din PAA)

### [Întrebare reală?]
[Răspuns direct de 1-3 propoziții.]

### [Întrebare reală?]
[Răspuns direct de 1-3 propoziții.]

## [Concluzie: ce faci mai departe]

[2-4 propoziții: recapitularea deciziei și pasul următor.] [Link contextual spre
`pagina_serviciu`, cu ancoră descriptivă, ex. „vezi ce include crearea unui site de prezentare”.]

**Surse**
1. [Titlul sursei], [publicația sau instituția], [data]. [URL]
2. [...]

---
**Despre autor.** [Nume], [rol] la Echipa de Tocilari. [1-2 propoziții despre experiența
reală relevantă pentru subiect.] [LinkedIn]

**Citește și**
- [Articolul pilon](/blog/[slug-pilon]/)
- [Articol din același cluster](/blog/[slug]/)

<!-- formularul de contact comun, imediat deasupra footerului (regulă AGENTS.md) -->
```

### Reguli de scris pe secțiuni

- **H1 și title**: o singură idee, cuvântul principal natural la început, fără an dacă nu actualizezi articolul în fiecare an. Fără limită fixă de caractere, dar concis.
- **Răspunsul direct**: este cea mai importantă parte pentru snippets și pentru citările AI. Conține termenul principal, răspunsul și o cifră sau un interval când există.
- **H2-urile** sunt întrebări sau subiecte reale, în română naturală. Nu repeta forțat cuvântul principal în fiecare H2.
- **Cifrele** au lângă ele sursa și data, sau metoda, dacă sunt ale noastre. Citatele sunt atribuite unor persoane reale, cu acordul lor.
- **Lungimea** o dau subîntrebările. Ce nu răspunde unei întrebări se taie.
- **Diacritice** corecte în text (ș, ț cu virgulă), fără diacritice în slug.
- **Fără em dash** (U+2014) și fără săgeți diagonale, conform AGENTS.md. Textul trece prin skill-ul `avoid-ai-writing-ro`.
- **CTA**: unul singur, moderat, spre `pagina_serviciu`, separat vizual de conținut. Formularul comun rămâne deasupra footerului.
- **Subiecte fiscale sau juridice** (TVA, contracte, GDPR): sursă primară obligatorie (ANAF, lege) și, dacă există, reviewer.

## 4. Date structurate (JSON-LD)

Datele trebuie să corespundă exact textului vizibil. Organizația se referă la entitatea din `scripts/lib/schema.mjs` prin `@id`. Fără FAQPage: rich results pentru FAQ nu mai apar din 07.05.2026, iar AGENTS.md cere date structurate fără promisiuni de rezultate speciale.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": "https://echipadetocilari.ro/blog/[slug]/#article",
      "mainEntityOfPage": "https://echipadetocilari.ro/blog/[slug]/",
      "headline": "[titlu_h1]",
      "description": "[meta_description]",
      "image": [
        "https://echipadetocilari.ro/wp-content/uploads/blog/[slug]/cover-16x9.webp",
        "https://echipadetocilari.ro/wp-content/uploads/blog/[slug]/cover-4x3.webp",
        "https://echipadetocilari.ro/wp-content/uploads/blog/[slug]/cover-1x1.webp"
      ],
      "datePublished": "[AAAA-LL-ZZ]T09:00:00+02:00",
      "dateModified": "[AAAA-LL-ZZ]T09:00:00+02:00",
      "inLanguage": "ro-RO",
      "author": { "@id": "https://echipadetocilari.ro/autor/[slug-autor]/#person" },
      "publisher": { "@id": "https://echipadetocilari.ro/#organization" },
      "isPartOf": { "@id": "https://echipadetocilari.ro/#website" },
      "breadcrumb": { "@id": "https://echipadetocilari.ro/blog/[slug]/#breadcrumb" }
    },
    {
      "@type": "Person",
      "@id": "https://echipadetocilari.ro/autor/[slug-autor]/#person",
      "name": "[Nume]",
      "jobTitle": "[Rol]",
      "url": "https://echipadetocilari.ro/autor/[slug-autor]/",
      "sameAs": ["[URL LinkedIn]"],
      "worksFor": { "@id": "https://echipadetocilari.ro/#organization" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://echipadetocilari.ro/blog/[slug]/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Acasă", "item": "https://echipadetocilari.ro/" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://echipadetocilari.ro/blog/" },
        { "@type": "ListItem", "position": 3, "name": "[Titlu scurt]" }
      ]
    }
  ]
}
```

- Fusul orar: `+02:00` iarna, `+03:00` vara (ora de vară a României).
- Imaginile de copertă: trei rapoarte (16x9, 4x3, 1x1), fiecare de cel puțin 50.000 de pixeli (lățime x înălțime), fără logo.
- `dateModified`, data „Actualizat” vizibilă și `lastmod` din sitemap sunt aceeași dată și se schimbă doar la modificări reale de conținut.

## 5. Lista de verificare înainte de publicare

**Conținut**
- [ ] Răspunsul direct e în primul paragraf, sub H1, și se înțelege singur.
- [ ] Fiecare subîntrebare din cercetare are o secțiune care începe cu răspunsul.
- [ ] Există cel puțin un element original, cu metoda explicată.
- [ ] Fiecare cifră externă are sursă primară și dată; nimic inventat (clienți, rezultate, prețuri, citate).
- [ ] Prețurile și informațiile despre servicii sunt identice cu cele de pe paginile de serviciu.
- [ ] Textul a trecut prin `avoid-ai-writing-ro`; zero em dash, zero săgeți diagonale.

**Autor și încredere**
- [ ] Autor real, cu pagină de autor și bio; datele vizibile corespund JSON-LD.
- [ ] Dacă AI a ajutat la redactare, fiecare afirmație a fost verificată de un om.

**Linkuri**
- [ ] Link contextual spre `pagina_serviciu` și spre pilon; pilonul are link înapoi.
- [ ] Ancore descriptive, linkuri `<a href>` crawlable, surse externe deschise și funcționale.

**Tehnic**
- [ ] Un singur H1, ierarhie H2/H3 fără salturi, ancorele din cuprins funcționează.
- [ ] Canonical absolut spre propria pagină, identic cu sitemap, `og:url` și `mainEntityOfPage`.
- [ ] Fără `nosnippet` sau `max-snippet` restrictiv; tot textul important e în HTML vizibil, nu în taburi încărcate prin JS.
- [ ] Imagini WebP sau AVIF cu `width`, `height`, alt descriptiv; imaginea LCP fără lazy-load.
- [ ] JSON-LD valid (Rich Results Test și validator.schema.org) și fidel textului.
- [ ] Verificat vizual la 360 și 390 CSS px și pe desktop; tabelele nu ies din ecran pe mobil.
- [ ] `npm run build` trece; indexarea rămâne controlată de `PUBLIC_INDEXABLE`.

**După publicare**
- [ ] URL trimis în Search Console și ping IndexNow (pentru Bing și Copilot).
- [ ] După 4-6 săptămâni: interogările din Search Console, apariția în AI Overview sau AI Mode, testul în ChatGPT și Perplexity cu aceleași prompturi.
- [ ] Revizuire programată (evergreen: la 6-12 luni sau la schimbarea prețurilor sau a regulilor).

## Decizii deschise

- **Autorul**: articolele cer un autor real cu pagină `/autor/[slug]/` (nume, rol, fotografie reală, LinkedIn). Pagina de autor nu există încă; până se decide, nu publicăm articole fără autor numit și nu inventăm o persoană.
- **Aspectul paginii**: layout-ul articolului vine din canvasul blogului (schița A), care așteaptă aprobarea. Template-ul de față nu impune design.
- **Ruta blogului**: `/blog/[slug]/` este propunerea; ruta, meniul și includerea în sitemap se stabilesc la implementarea blogului.
