/**
 * Visible copy for the website creation page (/creare-site-web/), RO source -> British English.
 * Replacement runs on the HTML source, so every RO string is copied exactly from the markup.
 * Short strings are anchored on their tags ("> ... <") so they cannot hit a longer word.
 */
const t = (ro, en) => [`>${ro}<`, `>${en}<`];
/** Heading text before and after the decorative csw-sel span. */
const before = (ro, en) => [`>${ro} <span`, `>${en} <span`];
const after = (ro, en) => [`</span> ${ro}<`, `</span> ${en}<`];
const attr = (name, ro, en) => [`${name}="${ro}"`, `${name}="${en}"`];

export const websiteDesignDictionary = [
  // Hero
  t('Agenție web din București, pentru toată țara', 'Web agency in Bucharest, serving all of Romania'),
  ['>Creare <span class="csw-chip">', '>Create a <span class="csw-chip">'],
  ['</svg>site web</span> pentru afacerea ta<', '</svg>website</span> for your business<'],
  [
    'Facem <b>landing page-uri</b>, <b>site-uri de prezentare</b>, <b>magazine online</b> și <b>aplicații web</b> pentru firme care vor să fie găsite și contactate. Un site de prezentare pornește de la 499&nbsp;€.',
    'We build <b>landing pages</b>, <b>business websites</b>, <b>online stores</b> and <b>web apps</b> for companies that want to be found and contacted. A business website starts from €499.',
  ],
  t('Consultație gratuită de 30 de minute', 'Free 30-minute consultation'),
  t(
    'Ne spui ce vrei să prezinți. Îți spunem ce am face și cam cât costă. Fără obligații.',
    'You tell us what you want to present. We tell you what we would do and roughly what it costs. No obligation.',
  ),
  ['>Programează apelul<span>', '>Book the call<span>'],
  attr('aria-label', 'Avantaje', 'Benefits'),
  t('Prețuri afișate', 'Prices shown upfront'),
  t('Un singur om de contact', 'One point of contact'),
  t('Costul, înainte să începem', 'The cost, before we start'),
  attr('alt', 'Procesul de creare site web', 'The website creation process'),

  // In short
  t('Pe scurt', 'In short'),
  before('Creare site web,', 'Website creation,'),
  after('în 30 de secunde', 'in 30 seconds'),
  t(
    'Răspunsurile la ce ne întreabă aproape toată lumea înainte de primul apel. Detaliile sunt mai jos, pe secțiuni.',
    'Answers to what almost everyone asks us before the first call. The details are below, section by section.',
  ),
  t('Cât costă un site web?', 'How much does a website cost?'),
  [
    'Landing page de la 299&nbsp;€, site de prezentare de la 499&nbsp;€, magazin online de la 1.490&nbsp;€. Proiectele custom au preț pe proiect. <a href="#preturi">Vezi ce include fiecare</a>.',
    'Landing page from €299, business website from €499, online store from €1,490. Custom projects are priced per project. <a href="#preturi">See what each one includes</a>.',
  ],
  t('În ce e construit?', 'What is it built with?'),
  [
    'Landing page-urile și site-urile de prezentare le scriem direct în cod, cu Next.js sau Astro. Magazinele online, pe Shopify sau Medusa.',
    'We write landing pages and business websites directly in code, with Next.js or Astro. Online stores run on Shopify or Medusa.',
  ],
  t('Ce pregătești tu?', 'What do you prepare?'),
  t(
    'Serviciile pe care vrei să le prezinți, numărul de pagini, funcțiile de care ai nevoie și textele și imaginile pe care le ai deja.',
    'The services you want to present, the number of pages, the features you need, and the texts and images you already have.',
  ),
  t('Cât durează?', 'How long does it take?'),
  t(
    'De regulă, între 5 și 7 zile lucrătoare pentru un landing page și între 1 și 3 săptămâni pentru un site de prezentare, după ce avem materialele.',
    'Typically, between 5 and 7 working days for a landing page and between 1 and 3 weeks for a business website, once we have the materials.',
  ),
  t('Al cui e site-ul?', 'Who owns the website?'),
  t(
    'Al tău, în totalitate. Domeniul, găzduirea, fișierele și toate conturile de administrare sunt pe numele tău. Nu te ținem legat de noi.',
    'Yours, completely. The domain, hosting, files and all admin accounts are in your name. We never lock you in.',
  ),
  t('Pe această pagină', 'On this page'),
  t('Ce tip de site ți se potrivește', 'Which type of website suits you'),
  t('Cât costă un site web', 'How much a website costs'),
  t('Ce include crearea unui site', 'What website creation includes'),
  t('Cum lucrăm, pas cu pas', 'How we work, step by step'),
  t('Cum alegi firma de web design', 'How to choose a web design company'),
  t('Întrebări frecvente', 'Frequently asked questions'),

  // How we work
  t('Cum lucrăm', 'How we work'),
  before('Un site făcut', 'A website built'),
  after('ca la tocilari', 'the way swots do it'),
  t(
    'Fără surprize la final de proiect. Afli de la început ce primești, cât costă și cine îți răspunde la telefon.',
    'No surprises at the end of the project. You know from the start what you get, what it costs and who answers the phone.',
  ),
  ['>5 motive <span>Glisează<', '>5 reasons <span>Swipe<'],
  t('Prețuri la vedere', 'Prices in plain sight'),
  t('Vezi de la cât pornește fiecare tip de site, chiar pe pagina asta.', 'See what each type of website starts from, right on this page.'),
  t('Primul apel e gratuit', 'The first call is free'),
  t('30 de minute în care afli ce am face și cam cât ar costa.', '30 minutes to find out what we would do and roughly what it would cost.'),
  t('Vorbești cu o persoană, nu cu un grup de mesaje.', 'You talk to one person, not to a group chat.'),
  t('Pe orice ecran', 'On any screen'),
  t('Afișare pregătită pentru telefon, tabletă și desktop.', 'Display prepared for phone, tablet and desktop.'),
  t('SEO din pachet', 'SEO in the package'),
  t('Configurăm elementele SEO incluse înainte să publicăm site-ul.', 'We set up the included SEO elements before we publish the website.'),

  // Types
  t('Tipuri de site', 'Types of website'),
  attr('aria-label', 'Tipuri de site', 'Types of website'),
  before('Ce tip de site', 'Which type of website'),
  after('ți se potrivește', 'suits you'),
  t(
    'Patru tipuri de proiect, de la o singură pagină pentru o campanie până la ideile care nu încap în niciun pachet. Alege-l pe cel care seamănă cu afacerea ta.',
    'Four types of project, from a single page for a campaign to the ideas that fit no package. Pick the one that looks like your business.',
  ),
  t('Site de prezentare', 'Business website'),
  t('Magazin online', 'Online store'),
  t('Proiect custom', 'Custom project'),
  t(
    'Un landing page este un site dintr-o singură pagină, cu un singur scop: vizitatorul completează un formular, te sună sau se înscrie. Îl folosești pentru o campanie Google Ads sau Facebook Ads, pentru un eveniment sau pentru un singur serviciu pe care vrei să-l vinzi.',
    'A landing page is a single-page website with a single goal: the visitor fills in a form, calls you or signs up. You use it for a Google Ads or Facebook Ads campaign, for an event, or for a single service you want to sell.',
  ),
  t(
    'Pentru că tot conținutul stă pe o pagină, ordinea contează: problema clientului, oferta, dovezile și butonul de contact, fără meniuri care trimit vizitatorul în altă parte.',
    'Because all the content sits on one page, the order matters: the customer’s problem, the offer, the proof and the contact button, with no menus sending the visitor elsewhere.',
  ),
  t('Potrivit dacă', 'A good fit if'),
  [
    '<li>ai o singură ofertă sau un singur serviciu de promovat;</li><li>trimiți vizitatori din reclame și vrei să măsori cererile;</li><li>vrei să pornești repede, cu un buget mic.</li>',
    '<li>you have a single offer or service to promote;</li><li>you send visitors from ads and want to measure enquiries;</li><li>you want to start quickly, on a small budget.</li>',
  ],
  t('Vezi ce include pachetul', 'See what the package includes'),
  ['<small>de la</small><b>299&nbsp;€</b>', '<small>from</small><b>€299</b>'],
  t(
    'Un site de prezentare arată cine ești, ce servicii oferi și cum te pot contacta clienții. Seamănă cu o broșură a firmei, doar că poate fi găsit în Google, răspunde la întrebările clienților și duce vizitatorul spre formular sau telefon.',
    'A business website shows who you are, what services you offer and how customers can contact you. It is like a company brochure, except that it can be found on Google, answers customers’ questions and leads the visitor to a form or a phone call.',
  ),
  t(
    'Pachetul de bază are până la 6 pagini: de obicei o pagină principală, paginile de servicii, o pagină despre firmă și una de contact. Structura o stabilim împreună, în funcție de ce vrei să prezinți.',
    'The basic package has up to 6 pages: usually a home page, the service pages, an about page and a contact page. We agree the structure together, depending on what you want to present.',
  ),
  [
    '<li>ai o firmă fără site și clienții te întreabă unde pot vedea ce faci;</li><li>ai mai multe servicii care merită explicate separat;</li><li>ai deja un site care arată ciudat pe telefon.</li>',
    '<li>you have a company with no website and customers ask where they can see what you do;</li><li>you have several services that deserve a separate explanation;</li><li>you already have a website that looks odd on a phone.</li>',
  ],
  ['<small>de la</small><b>499&nbsp;€</b>', '<small>from</small><b>€499</b>'],
  t(
    'Un magazin online îți permite să vinzi produse direct de pe site: clientul alege produsul, plătește și primește comanda prin curier. Îl construim pe Shopify, cu plăți, livrare și facturare standard configurate.',
    'An online store lets you sell products straight from your website: the customer picks the product, pays and receives the order by courier. We build it on Shopify, with standard payments, delivery and invoicing set up.',
  ),
  t(
    'La pachetul de pornire încărcăm 25 de produse manual sau 100 dintr-un fișier CSV pregătit, facem două runde de revizii și îți arătăm cum gestionezi comenzile.',
    'With the starter package we upload 25 products manually or 100 from a prepared CSV file, do two rounds of revisions and show you how to manage orders.',
  ),
  [
    '<li>vinzi produse fizice și vrei comenzi fără intermediari;</li><li>ai nevoie de plăți online și livrare prin curier;</li><li>vrei să adaugi singur produse după lansare.</li>',
    '<li>you sell physical products and want orders with no middlemen;</li><li>you need online payments and courier delivery;</li><li>you want to add products yourself after launch.</li>',
  ],
  t('Vezi pagina de creare magazin online', 'See the online store creation page'),
  ['<small>de la</small><b>1.490&nbsp;€</b>', '<small>from</small><b>€1,490</b>'],
  t(
    'Pentru ideile care nu încap în niciun pachet: un site cu design gândit de la zero, funcții construite special pentru afacerea ta, integrări cu sistemele pe care le folosești deja sau o aplicație web cu conturi de utilizator. Aici construim pentru cei care au idei mari și vor un site care nu seamănă cu nimic din piață.',
    'For the ideas that fit no package: a website with a design thought through from scratch, features built specially for your business, integrations with the systems you already use, or a web app with user accounts. This is where we build for those with big ideas who want a website unlike anything on the market.',
  ),
  t(
    'Nu are preț afișat pentru că nu seamănă cu nimic din ce am făcut înainte. Pornim de la un apel, scriem împreună ce trebuie să facă și primești costul și condițiile înainte să începem.',
    'It has no listed price because it is unlike anything we have done before. We start with a call, write down together what it must do, and you get the cost and the terms before we begin.',
  ),
  [
    '<li>ai o idee pe care n-ai văzut-o la alții;</li><li>ai nevoie de funcții sau integrări care nu există gata făcute;</li><li>vrei un site care să nu arate a template.</li>',
    '<li>you have an idea you have not seen elsewhere;</li><li>you need features or integrations that do not exist ready-made;</li><li>you want a website that does not look like a template.</li>',
  ],
  t('Spune-ne ideea', 'Tell us your idea'),
  ['<small>preț</small><b>pe proiect</b>', '<small>price</small><b>per project</b>'],

  // Prices
  t('Prețuri', 'Prices'),
  t('Cât costă un site web în 2026?', 'How much does a website cost in 2026?'),
  [
    'Un site web costă de la 299&nbsp;€ pentru un landing page, de la 499&nbsp;€ pentru un site de prezentare, de la 1.490&nbsp;€ pentru un magazin online. Proiectele custom au preț pe proiect, stabilit după primul apel. Prețul final depinde de numărul de pagini, de funcții și de materialele pe care le ai.',
    'A website costs from €299 for a landing page, from €499 for a business website and from €1,490 for an online store. Custom projects are priced per project, set after the first call. The final price depends on the number of pages, the features and the materials you already have.',
  ],
  ['>4 pachete <span>Glisează<', '>4 packages <span>Swipe<'],
  t('O pagină', 'One page'),
  t('Pentru o campanie sau un singur serviciu.', 'For a campaign or a single service.'),
  [
    '<p class="csw-pcard__from">de la</p><p class="csw-pcard__price">299&nbsp;€</p>',
    '<p class="csw-pcard__from">from</p><p class="csw-pcard__price">€299</p>',
  ],
  t('o singură pagină', 'one page only'),
  t('optimizare SEO', 'SEO optimisation'),
  t('consultanță', 'consultancy'),
  t('design scris în cod, fără template', 'design written in code, no template'),
  t('o singură limbă', 'one language'),
  t('Cere ofertă', 'Request a quote'),
  t('Recomandat pentru firme', 'Recommended for businesses'),
  t('Pentru firme care își explică serviciile.', 'For companies that explain their services.'),
  [
    '<p class="csw-pcard__from">de la</p><p class="csw-pcard__price">499&nbsp;€</p>',
    '<p class="csw-pcard__from">from</p><p class="csw-pcard__price">€499</p>',
  ],
  t('până la 6 pagini', 'up to 6 pages'),
  t('Pentru vânzare de produse cu plată online.', 'For selling products with online payment.'),
  [
    '<p class="csw-pcard__from">de la</p><p class="csw-pcard__price">1.490&nbsp;€</p>',
    '<p class="csw-pcard__from">from</p><p class="csw-pcard__price">€1,490</p>',
  ],
  t('design personalizat, o limbă', 'custom design, one language'),
  t('plăți, curier și facturare standard', 'standard payments, courier and invoicing'),
  t('25 de produse manual sau 100 din CSV', '25 products manually or 100 from a CSV'),
  t('SEO tehnic și măsurarea comenzilor', 'technical SEO and order tracking'),
  t('instruire și 30 de zile de corectare a erorilor', 'training and 30 days of bug fixing'),
  t('Vezi pachetele', 'See the packages'),
  t('Proiecte curajoase', 'Bold projects'),
  t('Pentru ideile care nu încap în niciun pachet.', 'For the ideas that fit no package.'),
  [
    '<p class="csw-pcard__from">preț</p><p class="csw-pcard__price csw-pcard__price--word">pe proiect</p>',
    '<p class="csw-pcard__from">price</p><p class="csw-pcard__price csw-pcard__price--word">per project</p>',
  ],
  t('design gândit de la zero', 'design thought through from scratch'),
  t('funcții construite pentru tine', 'features built for you'),
  t('integrări cu sistemele tale', 'integrations with your systems'),
  t('aplicații web cu conturi', 'web apps with accounts'),
  t('cost scris înainte de start', 'cost in writing before we start'),
  t(
    'Prețurile afișate sunt finale (Echipa de Tocilari SRL nu este plătitoare de TVA). Costurile externe (domeniu, găzduire, licențe terțe) se achită separat către furnizorii respectivi. Îți comunicăm costul și condițiile înainte de începerea proiectului.',
    'The displayed prices are final (Echipa de Tocilari SRL is not registered for VAT). External costs (domain, hosting, third-party licences) are paid separately to the respective providers. We share the cost and terms with you before the project begins.',
  ),
  t('Ce influențează prețul unui site', 'What affects the price of a website'),
  t(
    'Pornim de la prețul pachetului și îl ajustăm doar pentru ce adaugi peste el. Toate se stabilesc în ofertă, înainte să începem.',
    'We start from the package price and adjust it only for what you add on top. Everything is agreed in the quote, before we start.',
  ),
  ['>4 factori <span>Glisează<', '>4 factors <span>Swipe<'],
  t('Numărul de pagini', 'Number of pages'),
  t(
    'Site-ul de prezentare include până la 6 pagini. Paginile în plus se adaugă în ofertă.',
    'The business website includes up to 6 pages. Extra pages are added to the quote.',
  ),
  t('Funcțiile suplimentare', 'Additional features'),
  t(
    'Rezervări, calculatoare, zone cu cont sau integrări cu alte sisteme.',
    'Bookings, calculators, account areas or integrations with other systems.',
  ),
  t('A doua limbă', 'A second language'),
  t(
    'Pachetele de bază sunt într-o singură limbă. O versiune în engleză se discută separat.',
    'The basic packages are in one language. An English version is discussed separately.',
  ),
  t('Textele și fotografiile', 'Texts and photos'),
  t(
    'Textele și imaginile de bază sunt furnizate de tine. Dacă nu ai materiale pregătite, putem asigura redactarea conținutului și imagini licențiate, ca serviciu separat specificat în ofertă.',
    'The core texts and images are provided by you. If you do not have materials ready, we can provide content copywriting and licensed images as a separate service specified in the quote.',
  ),

  // What it includes
  t('Ce include', 'What it includes'),
  before('Ce facem', 'What we do'),
  after('când creăm un site web', 'when we create a website'),
  t(
    'Crearea unui site web înseamnă structura paginilor, designul, construcția, adaptarea pentru telefon, optimizarea SEO și publicarea online. Activitățile exacte se stabilesc în oferta pentru proiectul tău.',
    'Creating a website means page structure, design, building, adapting it for phones, SEO optimisation and publishing online. The exact activities are set out in the quote for your project.',
  ),
  ['>6 etape <span>Glisează<', '>6 stages <span>Swipe<'],
  t('Structura paginilor', 'Page structure'),
  t(
    'Pornim de la ce vrei să prezinți și de la întrebările clienților tăi. Așezăm paginile în jurul serviciilor, ca vizitatorul să găsească repede ce caută și să ajungă la contact din cel mult câteva clicuri.',
    'We start from what you want to present and from your customers’ questions. We arrange the pages around the services, so visitors quickly find what they are looking for and reach the contact page in a few clicks at most.',
  ),
  t('Designul și experiența vizitatorului', 'Design and visitor experience'),
  t(
    'Designul înseamnă culorile, fonturile, imaginile și felul în care sunt așezate informațiile. Experiența vizitatorului (UX) înseamnă cât de ușor înțelege pagina și cât de ușor ajunge la butonul de contact. Le lucrăm împreună și nu pornim de la un template: totul se scrie direct în cod.',
    'Design means the colours, fonts, images and the way the information is laid out. Visitor experience (UX) means how easily people understand the page and how easily they reach the contact button. We work on both together and do not start from a template: everything is written directly in code.',
  ),
  t('Construcția site-ului', 'Building the website'),
  t(
    'Scriem landing page-urile și site-urile de prezentare direct în cod, cu Next.js sau Astro, iar magazinele online le construim pe Shopify sau Medusa, cu funcțiile convenite în ofertă. Sunt tehnologii folosite pe scară largă, deci găsești ușor ajutor și după lansare.',
    'We write landing pages and business websites directly in code, with Next.js or Astro, and build online stores on Shopify or Medusa, with the features agreed in the quote. These are widely used technologies, so you can easily find help after launch.',
  ),
  t('Telefon, tabletă și desktop', 'Phone, tablet and desktop'),
  t(
    'Pregătim afișarea pentru toate ecranele pe care te caută clienții. Verificăm meniul, butoanele, formularele și imaginile pe telefon, unde se întâmplă de obicei primul contact cu o firmă.',
    'We prepare the display for every screen your customers search on. We check the menu, buttons, forms and images on a phone, where the first contact with a company usually happens.',
  ),
  t('Optimizarea SEO de bază', 'Basic SEO optimisation'),
  t(
    'Configurăm structura titlurilor (H1-H3), meta titlurile și descrierile pentru fiecare pagină, sitemap-ul XML, indexarea în Google Search Console și imagini comprimate pentru viteză cu etichete text.',
    'We configure the heading structure (H1-H3), meta titles and descriptions for each page, XML sitemap, indexing in Google Search Console, and images compressed for speed with text labels.',
  ),
  t('Publicarea și predarea', 'Publishing and handover'),
  t(
    'Punem site-ul online și îți predăm toate credențialele de acces. Domeniul și găzduirea se achită separat direct furnizorilor pentru a rămâne pe numele tău, iar noi te ajutăm gratuit cu alegerea și configurarea tehnică.',
    'We launch the website and hand over all access credentials. The domain and hosting are paid separately directly to providers to remain in your name, and we help you choose and configure them free of charge.',
  ),

  // SEO, AEO, GEO
  t('Google și AI', 'Google and AI'),
  before('SEO, AEO și GEO,', 'SEO, AEO and GEO,'),
  after('pe înțeles', 'in plain language'),
  t(
    'Tot mai mulți oameni își caută furnizorii întrebând un asistent AI, nu doar Google. Un site clar și bine structurat ajută în ambele cazuri.',
    'More and more people look for suppliers by asking an AI assistant, not just Google. A clear, well-structured website helps in both cases.',
  ),
  ['>3 termeni <span>Glisează<', '>3 terms <span>Swipe<'],
  t('Să fii găsit în Google', 'Get found on Google'),
  t(
    'Optimizarea pentru motoarele de căutare: structura paginilor, titluri clare, viteză și conținut care răspunde la ce caută clienții.',
    'Optimisation for search engines: page structure, clear titles, speed and content that answers what customers search for.',
  ),
  t('Să răspunzi direct la întrebări', 'Answer questions directly'),
  t(
    'Answer Engine Optimization urmărește ca informațiile tale să răspundă clar la întrebări, de exemplu cât costă un serviciu sau cât durează.',
    'Answer Engine Optimization makes sure your information answers questions clearly, for example what a service costs or how long it takes.',
  ),
  t('Să apari în răspunsurile AI', 'Appear in AI answers'),
  t(
    'Generative Engine Optimization urmărește vizibilitatea informațiilor tale în răspunsurile generate de asistenți precum ChatGPT sau Gemini.',
    'Generative Engine Optimization focuses on the visibility of your information in answers generated by assistants such as ChatGPT or Gemini.',
  ),
  [
    'Activitățile se suprapun în mare parte cu SEO, iar Google spune că practicile SEO rămân valabile și pentru funcțiile sale bazate pe AI. Nu promitem poziții sau citări garantate. <a href="/servicii-seo/">Vezi serviciile SEO și vizibilitate în AI</a>',
    'The activities largely overlap with SEO, and Google says that SEO practices remain valid for its AI-based features too. We do not promise guaranteed rankings or citations. <a href="/servicii-seo/">See the SEO and AI visibility services</a>',
  ],

  // Steps
  t('Pas cu pas', 'Step by step'),
  before('De la primul apel', 'From the first call'),
  [
    '</span> la <span class="csw-nw">site-ul</span> online<',
    '</span> to your <span class="csw-nw">website</span> going live<',
  ],
  t(
    'Patru pași, același om de contact de la început până la final. Afli costul și condițiile înainte să începem lucrul.',
    'Four steps, the same point of contact from start to finish. You learn the cost and the terms before we start work.',
  ),
  ['>4 pași <span>Glisează<', '>4 steps <span>Swipe<'],
  t('Ne cunoaștem', 'We get to know each other'),
  t(
    'Un apel gratuit de 30 de minute despre servicii, pagini, funcții și materialele pe care le ai deja.',
    'A free 30-minute call about services, pages, features and the materials you already have.',
  ),
  t('Gratuit', 'Free'),
  t('Primești oferta', 'You get the quote'),
  t(
    'După apelul inițial de 30 de minute, primești oferta detaliată cu etape, livrabile, calendar și cost în 1 până la 2 zile lucrătoare.',
    'After the initial 30-minute call, you receive a detailed quote with stages, deliverables, schedule and cost within 1 to 2 working days.',
  ),
  t('24 - 48 ore', '24 - 48 hours'),
  t('Construim', 'We build'),
  t(
    'Design și construcție direct în cod, adaptate pentru telefon, tabletă și desktop. Durează între 5 și 7 zile lucrătoare pentru un landing page și între 1 și 3 săptămâni pentru un site de prezentare.',
    'Design and build directly in code, tailored for phone, tablet and desktop. Takes between 5 and 7 working days for a landing page and between 1 and 3 weeks for a business website.',
  ),
  t('1 - 3 săpt.', '1 - 3 weeks'),
  t('Publicăm', 'We publish'),
  t(
    'Configurăm elementele SEO din pachet, punem site-ul online și îți arătăm ce ai primit.',
    'We set up the SEO elements in the package, put the website online and show you what you have received.',
  ),

  // Choosing a company
  t('Ghid', 'Guide'),
  before('Cum alegi firma', 'How to choose a'),
  after('de creare site web', 'website creation company'),
  t(
    'Șase întrebări pe care merită să le pui oricărei firme de web design înainte să semnezi. Am pus lângă ele și răspunsurile noastre.',
    'Six questions worth asking any web design company before you sign. We have put our own answers next to them.',
  ),
  t('Întrebarea', 'The question'),
  t('De ce contează', 'Why it matters'),
  t('La noi', 'With us'),
  t('Cât costă și ce intră în preț?', 'How much does it cost and what is in the price?'),
  t(
    'Un preț fără listă de livrabile se poate dubla pe parcurs.',
    'A price without a list of deliverables can double along the way.',
  ),
  t('Prețuri afișate și ofertă scrisă înainte de start', 'Prices shown and a written quote before we start'),
  t('În ce tehnologie e construit site-ul?', 'What technology is the website built with?'),
  t(
    'O tehnologie cunoscută îți permite să schimbi oricând furnizorul.',
    'A well-known technology lets you change supplier at any time.',
  ),
  t('Cod scris de noi (Next.js, Astro), Shopify sau Medusa', 'Code we write (Next.js, Astro), Shopify or Medusa'),
  t('Cu cine vorbesc pe durata proiectului?', 'Who do I talk to during the project?'),
  t(
    'Mesajele pierdute între mai mulți oameni întârzie proiectul.',
    'Messages lost between several people delay the project.',
  ),
  t('Se vede bine pe telefon?', 'Does it look good on a phone?'),
  t(
    'Majoritatea vizitatorilor ajung pe site de pe telefon.',
    'Most visitors reach the website from a phone.',
  ),
  t('Al cui e site-ul după lansare?', 'Who owns the website after launch?'),
  t(
    'Domeniul, găzduirea și conturile trebuie să rămână ale tale.',
    'The domain, hosting and accounts must stay yours.',
  ),
  t('Site-ul și toate conturile sunt 100% ale tale', 'The website and all accounts are 100% yours'),
  t('Ce se întâmplă după lansare?', 'What happens after launch?'),
  t(
    'Un site neactualizat devine lent și vulnerabil.',
    'A website that is not updated becomes slow and vulnerable.',
  ),
  t('Mentenanță, SEO și Google Ads, la alegere', 'Maintenance, SEO and Google Ads, as you choose'),

  // After launch
  t('Mai departe', 'What next'),
  t('Ce urmează după lansare', 'What comes after launch'),
  t(
    'Putem continua împreună cu serviciile care aduc vizitatori și țin site-ul în formă. Le alegi doar dacă au sens pentru tine.',
    'We can carry on together with the services that bring visitors and keep the website in shape. You choose them only if they make sense for you.',
  ),
  t('SEO și vizibilitate în AI', 'SEO and AI visibility'),
  t(
    'Lucrăm la structură, conținut și partea tehnică, ca site-ul să fie mai ușor de găsit în Google și în răspunsurile AI.',
    'We work on structure, content and the technical side, so the website is easier to find on Google and in AI answers.',
  ),
  ['</svg></i>Vezi serviciile SEO<', '</svg></i>See the SEO services<'],
  t(
    'Campanii Search care aduc pe site vizitatori interesați, cu urmărirea cererilor.',
    'Search campaigns that bring interested visitors to your website, with enquiry tracking.',
  ),
  ['</svg></i>Vezi Google Ads<', '</svg></i>See Google Ads<'],
  t('Mentenanță site', 'Website maintenance'),
  t(
    'Actualizări, copii de siguranță și intervenții, ca site-ul să rămână rapid și sigur după lansare.',
    'Updates, backups and fixes, so the website stays fast and secure after launch.',
  ),
  ['</svg></i>Vezi mentenanța<', '</svg></i>See maintenance<'],

  // FAQ
  t('Tu întrebi. Noi lămurim.', 'You ask. We explain.'),
  t(
    'Tot ce vrei să știi despre crearea unui site, pe înțeles, fără jargon.',
    'Everything you want to know about creating a website, in plain language, no jargon.',
  ),
  t('Hai să vorbim', 'Let’s talk'),
  attr(
    'alt',
    'Client 3D cu barbă care ridică degetul lângă o bulă cu semnul întrebării',
    'Bearded 3D client raising a finger next to a speech bubble with a question mark',
  ),
  [
    'Landing page de la 299 €, site de prezentare de la 499 €, magazin online de la 1.490 €. Proiectele custom au preț pe proiect. Prețurile sunt orientative, iar costul exact îl afli înainte să începem, nu după.',
    'Landing page from €299, business website from €499, online store from €1,490. Custom projects are priced per project. Prices are indicative, and you learn the exact cost before we start, not after.',
  ],
  t('Ce este un site de prezentare?', 'What is a business website?'),
  t(
    'Cartea de vizită a firmei, doar că o găsești pe Google. Are mai multe pagini cu firma, serviciile și contactul. La noi, pachetul de bază are până la 6 pagini.',
    'The company’s business card, except that you find it on Google. It has several pages covering the company, the services and the contact details. With us, the basic package has up to 6 pages.',
  ),
  t('Landing page sau site de prezentare?', 'Landing page or business website?'),
  t(
    'Ai o singură ofertă și trimiți oameni din reclame? Landing page. Ai mai multe servicii de explicat? Site de prezentare, cu până la 6 pagini în pachetul de bază.',
    'Do you have a single offer and send people from ads? A landing page. Do you have several services to explain? A business website, with up to 6 pages in the basic package.',
  ),
  t(
    'Landing page-urile și site-urile de prezentare le scriem direct în cod, cu Next.js sau Astro. Magazinele online, pe Shopify sau Medusa. Platforme cunoscute, nu ceva inventat de noi pe care nu-l mai poate atinge nimeni.',
    'We write landing pages and business websites directly in code, with Next.js or Astro. Online stores run on Shopify or Medusa. Well-known platforms, not something we invented that nobody else can touch.',
  ),
  t(
    'Da. Pregătim afișarea pentru telefon, tabletă și desktop, din prima zi.',
    'Yes. We prepare the display for phone, tablet and desktop from day one.',
  ),
  t('Ce trebuie să vă trimit pentru o ofertă?', 'What do I need to send you for a quote?'),
  t(
    'Ce servicii vrei să prezinți, câte pagini ai în minte, ce funcții îți trebuie și ce texte și poze ai deja. Restul lămurim la telefon.',
    'Which services you want to present, how many pages you have in mind, which features you need and which texts and photos you already have. We sort out the rest on the phone.',
  ),
  t('SEO este inclus în preț?', 'Is SEO included in the price?'),
  t(
    'Da, în formele din pachet: optimizare SEO la landing page și site de prezentare, SEO tehnic la magazinul online. SEO-ul pe termen lung e un serviciu separat.',
    'Yes, in the forms included in the package: SEO optimisation for the landing page and business website, technical SEO for the online store. Long-term SEO is a separate service.',
  ),
  t('Ce înseamnă AEO și GEO?', 'What do AEO and GEO mean?'),
  t(
    'AEO urmărește ca site-ul tău să răspundă clar la întrebări. GEO urmărește să apară în răspunsurile date de AI. Ambele se suprapun în mare parte cu SEO-ul făcut bine.',
    'AEO aims for your website to answer questions clearly. GEO aims for it to appear in the answers given by AI. Both largely overlap with SEO done well.',
  ),
  t('Lucrați doar în București?', 'Do you only work in Bucharest?'),
  t(
    'Nu. Suntem în București, dar lucrăm la proiecte din toată țara.',
    'No. We are based in Bucharest, but we work on projects across the whole country.',
  ),
  t('Cât durează să fie gata?', 'How long does it take to be ready?'),
  t(
    'Un landing page este gata de obicei în 5 până la 7 zile lucrătoare, iar un site de prezentare durează între 1 și 3 săptămâni. Un magazin online durează între 3 și 6 săptămâni. Timpul depinde de numărul de pagini și funcții și de cât de repede primim materialele și feedbackul la revizii. Stabilim un calendar clar în oferta scrisă.',
    'A landing page is typically ready in 5 to 7 working days, and a business website takes between 1 and 3 weeks. An online store takes between 3 and 6 weeks. The timeline depends on the number of pages and features, and how quickly we receive materials and feedback on revisions. We set a clear schedule in the written quote.',
  ),
  t('Prețurile includ TVA?', 'Do the prices include VAT?'),
  t(
    'Firma noastră nu este plătitoare de TVA, așadar prețurile afișate sunt sumele finale pe care le achiți pentru serviciile noastre, fără adaosuri ulterioare. Serviciile externe (cum ar fi găzduirea web sau domeniul achiziționate direct de la furnizori terți) pot include TVA conform politicii fiecărui furnizor.',
    'Our company is not registered for VAT, so the displayed prices are the final amounts you pay for our services, with no extra charges. External services (such as web hosting or domains purchased directly from third-party providers) may include VAT according to each provider\'s policy.',
  ),
  t('Al cui este site-ul după lansare?', 'Who owns the website after launch?'),
  t(
    'Site-ul este integral proprietatea ta. Domeniul și abonamentul de găzduire se configurează pe numele tău sau al firmei tale. La predare primești toate datele de acces (codul sursă, panoul de hosting, contul domeniului). Nu folosim soluții captive: poți muta site-ul sau poți lucra cu oricine altcineva în viitor, fără nicio restricție din partea noastră.',
    'The website is entirely your property. The domain and hosting plan are configured in your name or your company\'s name. Upon handover you receive all access credentials (source code, hosting panel, domain account). We do not use lock-in solutions: you can move the website or work with anyone else in the future, without any restrictions from us.',
  ),

  // Sticky bar
  ['>Programează apelul gratuit<', '>Book the free call<'],
  attr('aria-label', 'Sună-ne la 0750 203 466', 'Call us on 0750 203 466'),
];
