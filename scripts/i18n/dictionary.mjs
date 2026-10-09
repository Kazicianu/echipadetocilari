import { googleAdsDictionary } from './google-ads.mjs';
export { googleAdsDictionary };

/**
 * Romanian → natural English replacements (longest-first applied).
 * Tuned for how people actually search in EN (digital marketing, web design, SEO…).
 */
export const dictionary = [
  ['Tu întrebi. Noi lămurim.', 'You ask. We explain.'],
  ['Despre promovare, bugete și ce merită făcut. Pe înțeles, fără jargon.', 'Marketing, budgets and what is worth doing. Clear answers, without the jargon.'],
  ['Tocilar 3D cu ochelari și pulover portocaliu, care te salută cu un laptop în poală', 'A 3D nerd with glasses and an orange sweater, waving hello with a laptop in his lap'],
  ['Oprește animația', 'Pause animation'],
  ['Pornește animația', 'Play animation'],
  ["Configurare cont Google Ads","Google Ads account setup"],
  ["Monitorizarea campaniilor de două ori pe săptămână","Campaign monitoring twice a week"],
  ["Adăugarea săptămânală a cuvintelor cheie negative","Weekly negative keyword updates"],
  ["Verificarea bugetului de două ori pe săptămână","Budget review twice a week"],
  ["Configurarea urmăririi conversiilor","Conversion tracking setup"],
  ["Sistem antifraudă PPC","PPC fraud protection system"],
  ["Rapoarte lunare și recomandări","Monthly reports and recommendations"],
  // Shared service copy and Google Ads page translations.
  ['Agenție Google Ads <em>pentru afaceri.</em>', 'Google Ads agency <em>for businesses.</em>'],
  ["Google Ads","Google Ads"],
  ["Ofertă adaptată proiectului","A quote tailored to your project"],
  ["Cere o ofertă","Request a quote"],
  ["Servicii digitale","Digital services"],
  ["Hai să vorbim","Let’s talk"],
  ["Vezi ce include","See what’s included"],
  ["Consultație gratuită · 30 de minute","Free consultation · 30 minutes"],
  ["Schiță ilustrativă","Illustrative concept"],
  ["Ce construim împreună","What we build together"],
  ["Cum lucrăm","How we work"],
  ["Pași clari. De la prima discuție.","Clear steps. From the first conversation."],
  ["Despre buget","About the budget"],
  ["Răspunsuri simple","Straightforward answers"],
  ["Probabil te întrebi…","You might be wondering…"],
  ["Următorul pas","The next step"],
  ["Spune-ne unde ești și ce vrei să obții. Începem cu o conversație.","Tell us where you are and what you want to achieve. We start with a conversation."],
  ["Povestește-ne despre proiect","Tell us about your project"],
  ["/ lună","/ month"],
  ["Discută pachetul","Discuss this package"],
  ["Când ei caută,","When they search,"],
  ["afacerea ta poate fi acolo.","your business can be there."],
  ["Administrăm campanii Google Ads pentru oamenii care caută ce oferi. Alegem cuvintele potrivite, urmărim bugetul și optimizăm pentru cereri și vânzări măsurabile.","We manage Google Ads campaigns for people searching for what you offer. We choose relevant keywords, monitor budgets and optimise for measurable enquiries and sales."],
  ["O căutare. O oportunitate.","A search. An opportunity."],
  ["serviciul de care am nevoie","the service I need"],
  ["Sponsorizat · Afacerea ta","Sponsored · Your business"],
  ["Soluția potrivită începe aici","The right solution starts here"],
  ["Descoperă serviciile și cere o ofertă.","Explore the services and request a quote."],
  ["Căutări relevante","Relevant searches"],
  ["Buget sub control","Budget control"],
  ["Rezultate măsurabile","Measurable results"],
  ["O campanie bună începe cu întrebările potrivite.","A good campaign starts with the right questions."],
  ["Analiza căutărilor","Search analysis"],
  ["Identificăm ce caută potențialii clienți și ce expresii nu au legătură cu oferta ta.","We identify what potential customers search for and which terms are unrelated to your offer."],
  ["Structura campaniilor","Campaign structure"],
  ["Organizăm serviciile și cuvintele cheie în campanii și grupuri de anunțuri relevante.","We organise services and keywords into relevant campaigns and ad groups."],
  ["Anunțuri clare","Clear ads"],
  ["Scriem mesaje care explică oferta și trimit vizitatorul spre pagina potrivită.","We write messages that explain the offer and direct visitors to the right page."],
  ["Verificarea conversiilor","Conversion review"],
  ["Verificăm ce acțiuni pot fi măsurate. Implementarea urmăririi se stabilește în pachetul ales.","We review which actions can be measured. Tracking implementation is agreed in your package."],
  ["Buget și optimizare","Budget and optimisation"],
  ["Urmărim cheltuielile, căutările și performanța anunțurilor pentru a ajusta campaniile.","We monitor spend, searches and ad performance to adjust campaigns."],
  ["Decizii pe înțeles","Understandable decisions"],
  ["Discutăm costurile și rezultatele relevante. Formatul raportării se stabilește în ofertă.","We discuss costs and relevant results. Reporting format is agreed in the quote."],
  ["Analizăm punctul de plecare","Review the starting point"],
  ["Oferta, site-ul, zona deservită și contul existent, dacă ai deja campanii.","Your offer, website, service area and existing account if you already run campaigns."],
  ["Stabilim planul","Set the plan"],
  ["Alegem căutările, paginile și bugetul, apoi pregătim anunțurile.","We choose searches, pages and budget, then prepare the ads."],
  ["Lansăm campaniile","Launch campaigns"],
  ["Verificăm setările și pornim campaniile aprobate de tine.","We review settings and launch the campaigns you approve."],
  ["Optimizăm în timp","Optimise over time"],
  ["Analizăm datele și ajustăm pentru obiectivele agreate.","We analyse data and adjust towards the agreed objectives."],
  ["Pachete de administrare Google Ads","Google Ads management packages"],
  ["Alegi pachetul după complexitatea campaniilor. Onorariul de administrare este separat de bugetul cheltuit pe reclame în Google.","Choose a package based on campaign complexity. The management fee is separate from the advertising budget spent on Google."],
  ["Bugetul media și condițiile aplicabile se confirmă în oferta personalizată. Rezultatele nu sunt garantate.","The media budget and applicable terms are confirmed in your personalised quote. Results are not guaranteed."],
  ["Construiește și vizibilitatea organică. Vezi SEO","Build organic visibility too. Explore SEO"],
  ["Onorariul include și bugetul de reclame?","Does the fee include ad spend?"],
  ["Nu. Onorariul plătește administrarea campaniilor. Bugetul de publicitate este separat și se cheltuiește în contul Google Ads.","No. The fee covers campaign management. Advertising spend is separate and is spent in the Google Ads account."],
  ["Google Ads înlocuiește SEO?","Does Google Ads replace SEO?"],
  ["Sunt două canale diferite: reclamele folosesc un buget publicitar, iar SEO dezvoltă vizibilitatea organică. Le putem planifica împreună, în funcție de obiective.","They are different channels: ads use an advertising budget, while SEO develops organic visibility. We can plan them together around your goals."],
  ["Puteți prelua un cont existent?","Can you take over an existing account?"],
  ["Da. Începem cu analiza campaniilor, a accesului și a măsurării. Îți explicăm ce propunem înainte de modificări.","Yes. We start by reviewing campaigns, access and measurement. We explain proposed changes before making them."],
  ["Hai să vedem ce caută viitorii tăi clienți.","Let’s see what your future customers search for."],
  // Static portfolio catalogue: demos, not claims about completed client work.
  ['Modele demonstrative de site-uri web, pe care le putem adapta afacerii tale. Previzualizările se deschid într-o filă nouă.', 'Website template demos that we can adapt to your business. Previews open in a new tab.'],
  ['Nu am găsit modele pentru această căutare. Încearcă alt termen sau altă categorie.', 'No templates match this search. Try another term or category.'],
  ['Modele de site-uri web', 'Website templates'],
  ['Filtrează după categorie', 'Filter by category'],
  ['Caută modele', 'Search templates'],
  ['Caută un model...', 'Search templates...'],
  ['Vezi modelul', 'View template'],
  ['data-count-label="modele"', 'data-count-label="templates"'],
  ['data-count-label-singular="model"', 'data-count-label-singular="template"'],
  ['>20 modele<', '>20 templates<'],
  ['>Toate<', '>All<'],
  ['>Altele<', '>Other<'],
  ['Blog de Fashion si Lifestyle', 'Fashion and Lifestyle Blog'],
  ['Magazin de Dulciuri', 'Sweet Shop'],
  ['>ONG<', '>Nonprofit<'],
  ['Design de Interior', 'Interior Design'],
  ['Agentie Digitala', 'Digital Agency'],
  ['Artist Freelancer', 'Freelance Artist'],
  ['>Agentie<', '>Agency<'],
  ['Reparatii Masini', 'Car Repair'],
  ['Firma Gradinarit', 'Gardening Company'],
  ['Firma Constructii', 'Construction Company'],
  ['Firma Avocatura', 'Law Firm'],
  ['Invitatie Nunta', 'Wedding Invitation'],
  ['Clinica Dentara', 'Dental Clinic'],
  ['Servicii de Curatenie', 'Cleaning Services'],
  ['Hotel si Pensiune', 'Hotel and Guesthouse'],
  // Brand / legal, never translate the company name
  ['ECHIPA DE TOCIALRI SRL', 'ECHIPA DE TOCILARI SRL'],
  ['ECHIPA DE TOCILARI SRL', 'ECHIPA DE TOCILARI SRL'],
  ['ECHIPA DE TOCILARI', 'ECHIPA DE TOCILARI'],
  ['Echipa de Tocilari', 'Echipa de Tocilari'],
  ['Echipa De Tocilari', 'Echipa de Tocilari'],
  ['THE NERD TEAM', 'Echipa de Tocilari'],

  // Nav / CTAs
  ['Participa la o consultatie', 'Book a free consultation'],
  ['Participă la o consultație', 'Book a free consultation'],
  ['consultație GRATUITĂ de 30 minute', 'FREE 30-minute consultation'],
  ['consultatie GRATUITA de 30 minute', 'FREE 30-minute consultation'],
  ['GRATUITA de 30 minute', 'FREE, 30 minutes'],
  ['GRATUITĂ de 30 minute', 'FREE, 30 minutes'],
  ['<b>GRATUITA</b> de 30 minute', '<b>FREE</b>, 30 minutes'],
  ['<b>GRATUITĂ</b> de 30 minute', '<b>FREE</b>, 30 minutes'],
  ['GRATUITA', 'FREE'],
  ['GRATUITĂ', 'FREE'],
  ['de 30 minute', ', 30 minutes'],
  ['Consultație gratuită', 'Free consultation'],
  ['Consultatie gratuita', 'Free consultation'],
  ['Skip to content', 'Skip to content'],
  ['Sari la conținut', 'Skip to content'],
  ['Despre noi', 'About us'],
  ['Creare Site Web', 'Website design'],
  ['Creare site web', 'Website design'],
  ['Administrare Site', 'Website maintenance'],
  ['Administrare site', 'Website maintenance'],
  ['Servicii SEO', 'SEO services'],
  ['Optimizare SEO', 'SEO optimization'],
  ['Portofoliu', 'Portfolio'],
  ['Clienți', 'Clients'],
  ['Clienti', 'Clients'],
  ['Contact', 'Contact'],
  ['Acasă', 'Home'],
  ['Servicii', 'Services'],
  ['Trimite', 'Send'],
  ['Scrie-ne un mesaj astazi', 'Send us a message today'],
  ['Scrie-ne un mesaj astăzi', 'Send us a message today'],
  ['Urmareste-ne pe:', 'Follow us:'],
  ['Urmărește-ne pe:', 'Follow us:'],
  ['PAGINI IMPORTANTE', 'IMPORTANT PAGES'],
  ['Pagini importante', 'Important pages'],

  // Hero / home + new on-page H1s (longest first is applied at runtime)
  ['Agenție de marketing online în București', 'Digital marketing agency in Bucharest'],
  ['Agentie de marketing online in Bucuresti', 'Digital marketing agency in Bucharest'],
  ['Creare site web de prezentare în București', 'Business website design in Bucharest'],
  ['Creare site web de prezentare in Bucuresti', 'Business website design in Bucharest'],
  ['Servicii SEO pentru Google și căutările AI', 'SEO services for Google and AI-assisted search'],
  ['Servicii de optimizare SEO pentru Google', 'SEO optimization services for Google'],
  ['Administrare și mentenanță site web', 'Website management and maintenance'],
  ['Administrare si mentenanta site web', 'Website management and maintenance'],
  ['Contactează agenția de marketing online', 'Contact the online marketing agency'],
  ['Contacteaza agentia de marketing online', 'Contact the online marketing agency'],
  ['Servicii de marketing digital', 'Digital marketing services'],
  ['Logo design și identitate vizuală', 'Logo design and visual identity'],
  ['Logo design si identitate vizuala', 'Logo design and visual identity'],
  ['Portofoliu de web design', 'Web design portfolio'],
  ['Campanii Google Ads', 'Google Ads campaigns'],
  ['Clienții noștri', 'Our clients'],
  ['Clientii nostri', 'Our clients'],
  ['Agentie Web Design', 'Web design agency'],
  ['Agenție Web Design', 'Web design agency'],
  ['Marketing online facut de tocilari!', 'Online marketing done by nerds!'],
  ['Marketing online făcut de tocilari!', 'Online marketing done by nerds!'],
  ['Marketing online facut de tocilari', 'Online marketing done by nerds'],
  ['Marketing online făcut de tocilari', 'Online marketing done by nerds'],
  [
    'Suntem nerdy și suntem pricepuți. O agenție de marketing digital din București, pentru promovarea online de care chiar ai nevoie, nu pentru cea din broșuri.',
    'We are nerdy and we are skilled. A digital marketing agency in Bucharest, for the online promotion you actually need, not the brochure version.',
  ],
  [
    'Suntem nerdy si suntem priceputi. O agentie de marketing digital din Bucuresti, pentru promovarea online de care chiar ai nevoie, nu pentru cea din brosuri.',
    'We are nerdy and we are skilled. A digital marketing agency in Bucharest, for the online promotion you actually need, not the brochure version.',
  ],
  [
    'Suntem nerdy, suntem priceputi: o agentie de marketing digital din Bucuresti, gata sa-ti ofere promovarea online de care afacerea ta are nevoie.',
    'We are nerdy, we are skilled: a digital marketing agency in Bucharest, ready to deliver the online promotion your business needs.',
  ],
  [
    'Suntem nerdy, suntem pricepuți: o agenție de marketing digital din București, gata să-ți ofere promovarea online de care afacerea ta are nevoie.',
    'We are nerdy, we are skilled: a digital marketing agency in Bucharest, ready to deliver the online promotion your business needs.',
  ],
  [
    'Suntem nerdy, suntem priceputi, si suntem gata sa-ti oferim solutiile de marketing online de care afacerea ta are nevoie.',
    'We are nerdy, we are skilled, and we are ready to deliver the online marketing solutions your business needs.',
  ],
  [
    'Suntem nerdy, suntem pricepuți, și suntem gata să-ți oferim soluțiile de marketing online de care afacerea ta are nevoie.',
    'We are nerdy, we are skilled, and we are ready to deliver the online marketing solutions your business needs.',
  ],
  ['Promovare online și marketing digital, pe înțelesul tău', 'Online promotion and digital marketing, in plain language'],
  ['Promovare online si marketing digital, pe intelesul tau', 'Online promotion and digital marketing, in plain language'],
  ['Promovare online si marketing digital pentru afacerea ta', 'Online promotion and digital marketing for your business'],
  ['Promovare online și marketing digital pentru afacerea ta', 'Online promotion and digital marketing for your business'],
  ['Suntem aici pentru afacerea ta!', 'We are here for your business!'],
  ['Rezolvăm probleme reale', 'We solve real problems'],
  ['Rezolvam probleme reale', 'We solve real problems'],
  ['Cum te putem ajuta, concret?', 'How can we help, specifically?'],
  ['Cum iti putem ajuta afacerea?', 'How can we help your business grow?'],
  ['Cum îți putem ajuta afacerea?', 'How can we help your business grow?'],
  [
    'Vorbeste cu Echipa de Tocilari,',
    'Talk to Echipa de Tocilari,',
  ],
  [
    'Vorbește cu Echipa de Tocilari,',
    'Talk to Echipa de Tocilari,',
  ],
  ['agentia ta de marketing digital', 'your digital marketing agency'],
  ['agenția ta de marketing digital', 'your digital marketing agency'],
  ['agentia ta de servicii SEO', 'your SEO services partner'],
  ['agenția ta de servicii SEO', 'your SEO services partner'],
  ['Ce spun clientii despre noi', 'What our clients say about us'],
  ['Ce spun clienții despre noi', 'What our clients say about us'],
  ['Testimoniale', 'Testimonials'],
  ['Răspunsuri drepte', 'Straight answers'],
  ['Întrebări frecvente', 'Frequently asked questions'],
  ['Noi avem raspunsurile', 'We have the answers'],
  ['Noi avem răspunsurile', 'We have the answers'],
  ['Intrebari adresate frecvent (FAQ)', 'Frequently asked questions (FAQ)'],
  ['Întrebări adresate frecvent (FAQ)', 'Frequently asked questions (FAQ)'],
  // Contact band, real HTML includes <b> tags that break plain-text phrases
  [
    '<b>Te putem ajuta</b>, indiferent de <b>orașul</b> din care ne scrii.',
    '<b>We can help you</b>, no matter which <b>city</b> you write from.',
  ],
  [
    'Ne-ar face <b>mare plăcere</b> să vorbim despre <b>proiectul</b> tău, fără slides.',
    'We would <b>love</b> to talk about your <b>project</b>, no slide deck.',
  ],
  [
    '<b>Noi te putem ajuta</b>, indferent de <b>orasul</b> in care te afli.',
    '<b>We can help you</b>, no matter which <b>city</b> you are in.',
  ],
  [
    '<b>Noi te putem ajuta</b>, indiferent de <b>orașul</b> în care te afli.',
    '<b>We can help you</b>, no matter which <b>city</b> you are in.',
  ],
  [
    'Ne-ar face <b>mare placere</b> sa luam legatura si sa te ajutam cu <b>proiectul</b> pe care il ai!',
    'We would love to get in touch and help you with the <b>project</b> you have in mind!',
  ],
  [
    'Ne-ar face <b>mare plăcere</b> să luăm legătura și să te ajutăm cu <b>proiectul</b> pe care îl ai!',
    'We would love to get in touch and help you with the <b>project</b> you have in mind!',
  ],
  // Already half-translated leftovers (older builds / partial dict hits)
  [
    '<b>Noi te putem ajuta</b>, no matter <b>city</b> you are in.',
    '<b>We can help you</b>, no matter which <b>city</b> you are in.',
  ],
  [
    'Ne-ar face <b>great pleasure</b> to get in touch si sa te ajutam cu <b>proiectul</b> you have in mind!',
    'We would love to get in touch and help you with the <b>project</b> you have in mind!',
  ],
  [
    'Noi te putem ajuta, indferent de orasul in care te afli.',
    'We can help you no matter which city you are in.',
  ],
  [
    'Noi te putem ajuta, indiferent de orașul în care te afli.',
    'We can help you no matter which city you are in.',
  ],
  [
    'Ne-ar face mare placere sa luam legatura si sa te ajutam cu proiectul pe care il ai!',
    'We would love to get in touch and help you with the project you have in mind!',
  ],
  [
    'Ne-ar face mare plăcere să luăm legătura și să te ajutăm cu proiectul pe care îl ai!',
    'We would love to get in touch and help you with the project you have in mind!',
  ],
  // Prefer full phrases above; keep short fragments only for rare plain text
  ['Noi te putem ajuta', 'We can help you'],
  ['indferent de', 'no matter which'],
  ['indiferent de', 'no matter which'],
  ['orasul', 'city'],
  ['orașul', 'city'],
  ['in care te afli', 'you are in'],
  ['în care te afli', 'you are in'],
  ['mare placere', 'great pleasure'],
  ['mare plăcere', 'great pleasure'],
  ['sa luam legatura', 'to get in touch'],
  ['să luăm legătura', 'to get in touch'],
  ['si sa te ajutam cu', 'and help you with'],
  ['și să te ajutăm cu', 'and help you with'],
  ['sa te ajutam cu', 'help you with'],
  ['să te ajutăm cu', 'help you with'],
  ['proiectul pe care il ai', 'the project you have in mind'],
  ['proiectul pe care îl ai', 'the project you have in mind'],
  ['proiectului tău', 'your project'],
  ['proiectului tau', 'your project'],

  // About page, complete copy and accessible labels from the Romanian source.
  ['Despre noi · Echipa de Tocilari', 'About us · Echipa de Tocilari'],
  ['Tocilari din fire.', 'Nerds by nature.'],
  ['Parteneri de echipă.', 'Teammates by choice.'],
  [
    'Ne plac întrebările grele, ideile curajoase și lucrurile făcute cum trebuie. Punem curiozitatea la treabă pentru afacerea ta.',
    'We like tough questions, bold ideas, and doing things properly. We put our curiosity to work for your business.',
  ],
  [
    'Suntem o agenție de marketing digital din București. Construim site-uri, le ajutăm să fie găsite și transformăm planurile în pași clari.',
    'We are a digital marketing agency in Bucharest. We build websites, help people find them, and turn plans into clear next steps.',
  ],
  ['Hai să ne cunoaștem', 'Let’s get to know each other'],
  ['Povestea noastră', 'Our story'],
  [
    'Ilustrație cu o echipă creativă care lucrează împreună la aceeași masă',
    'Illustration of a creative team working together around the same table',
  ],
  ['Ideile bune cresc împreună.', 'Good ideas grow together.'],
  ['Ce ne definește', 'What defines us'],
  ['Curioși înainte de toate', 'Curious above all'],
  ['Atenți la fiecare detaliu', 'Attentive to every detail'],
  ['De aceeași parte a mesei', 'On the same side of the table'],
  ['Povestea noastră', 'Our story'],
  ['Din categoria celor care', 'The kind of people who'],
  ['mai întreabă o dată', 'keep asking'],
  ['„de ce?”', '“why?”'],
  ['Da, numele ni se potrivește.', 'Yes, the name fits.'],
  [
    'Un tocilar vrea să înțeleagă cum funcționează lucrurile. Desface problema în bucăți, caută, încearcă și se bucură când totul se leagă. Cam așa privim și noi marketingul.',
    'A nerd wants to understand how things work. They break a problem down, research, experiment, and enjoy the moment it all clicks. That is how we approach marketing.',
  ],
  [
    'Echipa de Tocilari înseamnă oameni cu preocupări diferite și aceeași plăcere de a construi. Unii văd imediat un detaliu de design. Alții se întreabă ce caută un client pe Google sau de ce un buton nu primește clickuri.',
    'Echipa de Tocilari brings together people with different interests and a shared love of building things. Some spot a design detail straight away. Others wonder what a customer searches for on Google or why nobody clicks a button.',
  ],
  [
    'Ne adună o idee simplă: un proiect bun începe când înțelegem afacerea din spatele lui. Așa că ascultăm, punem întrebări și abia apoi deschidem un document, un editor sau o campanie.',
    'One simple idea brings us together: a good project starts with understanding the business behind it. So we listen and ask questions before opening a document, an editor, or a campaign.',
  ],
  ['Vezi ce ne iese când lucrăm împreună', 'See what we build together'],
  ['Mai multe feluri de a fi tocilar', 'More than one way to be a nerd'],
  ['Specializări diferite.', 'Different specialties.'],
  ['Aceeași echipă.', 'One team.'],
  [
    'Un site bun are nevoie de mai mult decât un design frumos. De aceea, privim fiecare proiect din toate unghiurile.',
    'A good website takes more than beautiful design. That is why we look at every project from every angle.',
  ],
  ['Ochiul pentru design', 'An eye for design'],
  [
    'Dă formă ideilor și face loc lucrurilor importante. De la identitatea vizuală la ultimul detaliu de pe mobil.',
    'Shapes ideas and gives the important things room to breathe. From visual identity to the smallest detail on mobile.',
  ],
  ['Identitate vizuală', 'Visual identity'],
  ['Mintea tehnică', 'A technical mind'],
  [
    'Leagă designul de funcționalitate. Construiește pagini rapide, clare și ușor de folosit, apoi are grijă de ele.',
    'Connects design with functionality. Builds fast, clear, easy-to-use pages, then keeps them running smoothly.',
  ],
  ['Curiozitatea pentru date', 'Curiosity about data'],
  [
    'Caută intenția din spatele unei căutări. Pune conținutul, structura și măsurarea în slujba vizibilității.',
    'Looks for the intent behind a search. Uses content, structure, and measurement to help your business get found.',
  ],
  ['Gândirea de ansamblu', 'A view of the bigger picture'],
  [
    'Ține aproape obiectivul afacerii. Leagă mesajul, publicul și bugetul într-un plan pe care îl putem urmări.',
    'Keeps the business goal in focus. Connects the message, audience, and budget in a plan we can track.',
  ],
  [
    'Tu aduci perspectiva afacerii tale. Noi aducem întrebările, ideile și munca.',
    'You bring your business perspective. We bring the questions, ideas, and work.',
  ],
  ['Cum e să lucrezi cu noi', 'What it is like to work with us'],
  ['Luăm proiectul în serios.', 'We take your project seriously.'],
  ['Și relația la fel.', 'And our relationship, too.'],
  [
    'Ne dorim să fim echipa cu care poți vorbi deschis, de la prima întrebare până la următoarea idee.',
    'We want to be the team you can speak openly with, from your first question to your next idea.',
  ],
  ['Descoperă serviciile noastre', 'Explore our services'],
  ['Vorbim pe înțelesul tău', 'We speak your language'],
  [
    'Explicăm ce propunem, de ce are sens și ce presupune. Ai loc pentru orice întrebare, inclusiv pentru „dar de ce costă atât?”.',
    'We explain what we propose, why it makes sense, and what it involves. Every question is welcome, including “why does it cost that much?”',
  ],
  ['Facem loc feedbackului', 'We make room for feedback'],
  [
    'Stabilim direcția împreună și îți arătăm progresul pe parcurs. Tu îți cunoști afacerea, iar perspectiva ta face parte din proiect.',
    'We agree on the direction together and show you progress along the way. You know your business, and your perspective is part of the project.',
  ],
  ['Învățăm și îmbunătățim', 'We learn and improve'],
  [
    'Urmărim ce funcționează și unde mai e de lucru. Testăm ideile, discutăm datele și alegem următorul pas cu un motiv clar.',
    'We track what works and what needs more work. We test ideas, discuss the data, and choose the next step for a clear reason.',
  ],
  ['Următorul proiect poate fi al tău', 'Your project could be next'],
  ['Tu ai ideea.', 'You have the idea.'],
  ['Noi avem o mulțime de întrebări bune.', 'We have plenty of good questions.'],
  [
    'Povestește-ne unde ești și unde vrei să ajungi. Începem cu o conversație și vedem ce putem construi împreună.',
    'Tell us where you are and where you want to go. We will start with a conversation and see what we can build together.',
  ],
  ['Hai să vorbim despre proiectul tău', 'Let’s talk about your project'],
  ['Consultație gratuită · 30 de minute · Fără obligații', 'Free consultation · 30 minutes · No obligation'],

  // About blurb
  [
    'Suntem un grup de tocilari pasionați de marketing și de tehnologie. Lucrăm ca agenție de marketing digital din București: îți luăm treaba grea, ca tu să fii găsit de oamenii care te caută deja.',
    'We are a group of nerds who care about marketing and technology. We work as a digital marketing agency in Bucharest: we take the heavy lifting so people who already search for you can find you.',
  ],
  [
    'Ne ocupăm de promovare online, Google, social, conținut. Și, dacă îți lipsește locul unde ajung clienții, lucrăm și ca agenție de web design în București: site de prezentare, landing page sau baza pentru un magazin online, după ce ai nevoie tu.',
    'We handle online promotion, Google, social, content. And if you are missing the place clients land, we also work as a web design agency in Bucharest: a business site, a landing page, or the base for an online store, based on what you actually need.',
  ],
  [
    'Când nu ai timp sau oameni pe marketing digital, preluăm noi. Îți spunem ce merită, ce e zgomot și ce se potrivește unei firme mici sau în creștere. Apoi punem mâna și facem.',
    'When you do not have time or people for digital marketing, we take it on. We tell you what is worth it, what is noise, and what fits a small or growing business. Then we get to work.',
  ],
  [
    'Suntem un grup de tocilari pasionati de marketing si tehnologie, o agentie de marketing digital din Bucuresti. Punem la dispozitia ta abilitatile noastre nerdy, ca sa ajungi la publicul tinta si sa te faci remarcat pe piata online.',
    'We are a team of nerds passionate about marketing and technology, a digital marketing agency in Bucharest. We put our nerdy skills to work so you can reach your target audience and stand out online.',
  ],
  [
    'Suntem un grup de tocilari pasionați de marketing și tehnologie, o agenție de marketing digital din București. Punem la dispoziția ta abilitățile noastre nerdy, ca să ajungi la publicul țintă și să te faci remarcat pe piața online.',
    'We are a team of nerds passionate about marketing and technology, a digital marketing agency in Bucharest. We put our nerdy skills to work so you can reach your target audience and stand out online.',
  ],
  [
    'Suntem un grup de tocilari pasionati de marketing si tehnologie. Punem la dispozitia ta abilitatile noastre nerdy, pentru a te ajuta sa ajungi la publicul tinta si sa te faci remarcat pe piata online.',
    'We are a team of nerds passionate about marketing and technology. We put our nerdy skills to work so you can reach your target audience and stand out in the online market.',
  ],
  [
    'Suntem un grup de tocilari pasionați de marketing și tehnologie. Punem la dispoziția ta abilitățile noastre nerdy, pentru a te ajuta să ajungi la publicul țintă și să te faci remarcat pe piața online.',
    'We are a team of nerds passionate about marketing and technology. We put our nerdy skills to work so you can reach your target audience and stand out in the online market.',
  ],
  [
    'Cum te putem ajuta? Facem promovare online pe Google si pe social media, si lucram ca agentie de web design in Bucuresti: site-uri de prezentare, landing page-uri si o baza solida pentru magazin online.',
    'How can we help? We handle online promotion on Google and social media, and we work as a web design agency in Bucharest: business sites, landing pages, and a solid base for an online store.',
  ],
  [
    'Cum te putem ajuta? Facem promovare online pe Google și pe social media, și lucrăm ca agenție de web design în București: site-uri de prezentare, landing page-uri și o bază solidă pentru magazin online.',
    'How can we help? We handle online promotion on Google and social media, and we work as a web design agency in Bucharest: business sites, landing pages, and a solid base for an online store.',
  ],
  [
    'Cum te putem ajuta? Ei bine, ne pricepem la tot felul de tactici si strategii de marketing online – de la optimizarea motoarelor de cautare, la crearea site-ului web si social media marketing.',
    'How can we help? We specialize in online marketing tactics and strategies, from search engine optimization to website design and social media marketing.',
  ],
  [
    'Cum te putem ajuta? Ei bine, ne pricepem la tot felul de tactici și strategii de marketing online – de la optimizarea motoarelor de căutare, la crearea site-ului web și social media marketing.',
    'How can we help? We specialize in online marketing tactics and strategies, from search engine optimization to website design and social media marketing.',
  ],
  [
    'Practic, preluam tot ce tine de marketing digital cand nu ai timp sau resurse sa le faci singur. Te ghidam prin marketingul online si iti propunem solutiile potrivite pentru o firma mica sau in crestere.',
    'In practice, we take on the digital marketing work you do not have time or resources for. We guide you through online marketing and recommend the right solutions for a small or growing business.',
  ],
  [
    'Practic, preluăm tot ce ține de marketing digital când nu ai timp sau resurse să le faci singur. Te ghidăm prin marketingul online și îți propunem soluțiile potrivite pentru o firmă mică sau în creștere.',
    'In practice, we take on the digital marketing work you do not have time or resources for. We guide you through online marketing and recommend the right solutions for a small or growing business.',
  ],
  [
    'Practic, noi ne ocupam de toate aspectele de marketing digital pe care nu ai timp sau resurse sa le faci singur. In plus, suntem mereu la curent cu cele mai noi tendinte si tehnologii din industrie, asa ca te putem ghida prin lumea complicata a marketingului online si iti putem sugera cele mai bune solutii pentru afacerea ta.',
    'In practice, we handle the digital marketing work you do not have time or resources for. We also stay on top of the latest industry trends and technologies, so we can guide you through online marketing and recommend the best solutions for your business.',
  ],
  [
    'Practic, noi ne ocupăm de toate aspectele de marketing digital pe care nu ai timp sau resurse să le faci singur. În plus, suntem mereu la curent cu cele mai noi tendințe și tehnologii din industrie, așa că te putem ghida prin lumea complicată a marketingului online și îți putem sugera cele mai bune soluții pentru afacerea ta.',
    'In practice, we handle the digital marketing work you do not have time or resources for. We also stay on top of the latest industry trends and technologies, so we can guide you through online marketing and recommend the best solutions for your business.',
  ],

  // Services short
  [
    'Ca agenție de web design din București, facem site-uri clare, rapide și ușor de folosit. Nu template-uri cu logo-ul lipit.',
    'As a web design agency in Bucharest, we make clear, fast sites that are easy to use. Not templates with your logo stuck on.',
  ],
  [
    'Ca agenție de web design din București, facem site-uri clare, rapide și ușor de folosit, nu template-uri cu logo-ul lipit.',
    'As a web design agency in Bucharest, we make clear, fast sites that are easy to use. Not templates with your logo stuck on.',
  ],
  [
    'Magazin online din care chiar se cumpără. Nu un catalog frumos care cade la checkout.',
    'An online store people actually buy from. Not a pretty catalogue that falls over at checkout.',
  ],
  [
    'Aplicații mobile și aplicații web interne: programări, CRM, platformă. Nu un site cu alt nume.',
    'Mobile apps and internal web apps: bookings, CRM, platform. Not a website under another name.',
  ],
  [
    'Te scoatem în Google pe ce caută clienții tăi, nu pe cuvinte care arată bine doar în raport.',
    'We get you found on Google for what your clients actually search, not vanity keywords that only look good in a report.',
  ],
  ['SEO și vizibilitate în AI', 'SEO and AI visibility'],
  [
    'Campanii Google Ads puse pe căutări care aduc clienți, nu pe afișări de vanitate.',
    'Google Ads campaigns aimed at searches that bring clients, not vanity impressions.',
  ],
  [
    'Promovare pe Facebook și Instagram către oameni care au de ce să te caute, nu către tot feed-ul.',
    'Facebook and Instagram ads aimed at people with a reason to look for you, not at the whole feed.',
  ],
  [
    'Actualizări, backup, securitate. Tu te ocupi de firmă, noi de site, ca să nu te trezești cu el picat într-o luni dimineața.',
    'Updates, backups, security. You run the business, we run the site, so you do not wake up to it down on a Monday morning.',
  ],
  [
    'Actualizări, backup, securitate. Tu te ocupi de firmă, noi de site, ca să nu te trezești cu el picat într-o luni dimineața.',
    'Updates, backups, security. You run the business, we run the site, so you do not wake up to it down on a Monday morning.',
  ],
  [
    'Un logo pe care îl recunoști din două linii, nu o ilustrație pe care o uiți imediat.',
    'A logo you recognize in two lines, not an illustration you forget immediately.',
  ],
  [
    'Bani de ads puși pe căutări care aduc clienți, nu pe afișări de vanitate.',
    'Ad spend on searches that bring clients, not vanity impressions.',
  ],
  [
    'Texte care spun ce vinzi, pe limba omului care cumpără. Fără „sinergii” și fără umplutură.',
    'Copy that says what you sell, in the language of the person who buys. No “synergies” and no filler.',
  ],

  // Home: service cards + maintenance band
  ['Creare magazin online', 'Online store development'],
  ['Dezvoltare aplicații', 'App development'],
  ['Mentenanță site', 'Website maintenance'],
  ['>Vezi ce include<', '>See what it covers<'],
  ['>Toate serviciile<', '>All services<'],

  // Home: "Cum lucrăm cu tine" (header + chart)
  ['De la primul mesaj până la site live', 'From your first message to a live site'],
  [
    'Cum lucrăm <span class="ect-process__hl">cu tine</span>',
    'How we work <span class="ect-process__hl">with you</span>',
  ],
  [
    'Un apel de 30 de minute, un plan pe înțeles, apoi punem mâna. Site-ul, magazinul și aplicația au termen scris în ofertă. SEO, ads și mentenanța merg lună de lună.',
    'A 30-minute call, a plan in plain language, then we get to work. Sites, stores and apps get a delivery date in the quote. SEO, ads and maintenance run month to month.',
  ],
  ['Consultație de 30 de minute, gratuită', 'Free 30-minute consultation'],
  ['Îți spunem și ce nu merită', 'We also tell you what is not worth doing'],
  ['Un singur om de contact', 'One person to talk to'],
  ['Termen scris în ofertă', 'A deadline written into the quote'],
  ['Și fără ședințe inutile!', 'And no pointless meetings!'],
  ['Glisează și vezi mai mult', 'Swipe to see more'],

  // Chart phases. Anchored on the tags: "Apelul" alone is short enough to hit
  // unrelated copy elsewhere in the document.
  ['>Primul contact<', '>First contact<'],
  ['>Apelul<', '>The call<'],
  ['>Plan și ofertă<', '>Plan and quote<'],
  ['>Execuție și teste<', '>Build and testing<'],
  ['>Live și raport<', '>Live and reporting<'],

  // Chart steps
  ['>Ne scrii<', '>You write to us<'],
  [
    'Ce te arde: site, magazin, aplicație, ads sau SEO. Două paragrafe ajung.',
    'What hurts: site, store, app, ads or SEO. Two paragraphs are enough.',
  ],
  ['Vorbim 30 de minute', 'We talk for 30 minutes'],
  [
    'Îți spunem dacă merită, ce am face și cam cât costă. Dacă nu e pentru noi, afli în apel, nu după o lună.',
    'We tell you if it is worth it, what we would do and roughly what it costs. If it is not for us, you find out on the call, not a month later.',
  ],
  ['>Primești planul<', '>You get the plan<'],
  [
    'Pași, termen sau ritm lunar, preț. Fără 12 ședințe până la un răspuns.',
    'Steps, a deadline or a monthly rhythm, a price. No 12 meetings to get an answer.',
  ],
  ['>Punem mâna<', '>We get to work<'],
  [
    'Construim sau pornim campaniile. Vorbești cu un singur om, nu cu un grup.',
    'We build, or we launch the campaigns. You talk to one person, not a group chat.',
  ],
  ['>Verificăm tot<', '>We check everything<'],
  [
    'Viteză, mobil, formulare, analytics. Verificăm tot înainte să zicem gata.',
    'Speed, mobile, forms, analytics. We check all of it before we call it done.',
  ],
  ['>Vezi rezultatul<', '>You see the result<'],
  [
    'Site-ul, magazinul sau aplicația live. La abonament, raport lunar pe înțeles.',
    'The site, store or app goes live. On a retainer, a monthly report in plain language.',
  ],
  [
    'Proiectele au dată de livrare scrisă în ofertă. SEO, Google Ads, Facebook Ads și mentenanța merg lunar, cu raport din prima lună.',
    'Projects get a delivery date written into the quote. SEO, Google Ads, Facebook Ads and maintenance run monthly, with a report from the first month.',
  ],

  // Home: never-ending checklist band
  ['Ți se pare cunoscut?', 'Sound familiar?'],
  [
    'Promovarea n-ar trebui să arate ca o <span class="ect-checklist__hl">listă care nu se mai termină</span>',
    'Marketing should not feel like a <span class="ect-checklist__hl">list that never ends</span>',
  ],
  [
    'Un apel de 30 de minute. Apoi lista trece la noi.',
    'A 30-minute call. Then the list moves to us.',
  ],
  ['Hai să vedem ce merită tăiat', 'Let us see what is worth cutting'],
  ['Actualizează site-ul', 'Update the website'],
  ['Scrie textele pentru site', 'Write the website copy'],
  ['Configurează Google Analytics', 'Set up Google Analytics'],
  ['Lansează campaniile Google Ads', 'Launch Google Ads campaigns'],
  ['Publică pe Facebook', 'Post on Facebook'],
  ['Optimizează paginile pentru Google', 'Optimize pages for Google'],
  ['Verifică site-ul pe telefon', 'Check the site on mobile'],
  ['Comprimă imaginile', 'Compress the images'],
  ['Creează pagini de campanie', 'Create campaign landing pages'],
  ['Răspunde la recenzii', 'Reply to reviews'],
  ['Schimbă găzduirea site-ului', 'Change the website hosting'],
  ['Fă o copie de siguranță', 'Back up the website'],
  ['Trimite harta site-ului la Google', 'Submit the sitemap to Google'],
  ['Testează formularele', 'Test the forms'],
  ['Verifică procesul de comandă', 'Test the checkout process'],
  ['Instalează pixelul Meta', 'Install the Meta pixel'],
  ['Conectează domeniul', 'Connect the domain'],
  ['Testează reclamele', 'Test the ads'],
  ['Actualizează pagina de contact', 'Update the contact page'],
  ['Publică site-ul', 'Publish the website'],
  ['Nu știu de unde să încep', 'I do not know where to start'],
  ['Asta chiar îmi aduce clienți?', 'Is this actually bringing me clients?'],
  ['Pe telefon nu se vede bine', 'It does not look right on mobile'],
  ['Sunt prea multe de făcut', 'There is too much to do'],
  ['N-am timp să mă ocup și de asta', 'I do not have time for all this'],
  ['Rapoarte bune, dar niciun client', 'Great reports, but no clients'],
  [
    'Ca agentie de web design din Bucuresti, cream site-uri moderne, rapide si usor de navigat.',
    'As a web design agency in Bucharest, we build modern, fast websites that are easy to navigate.',
  ],
  [
    'Ca agenție de web design din București, creăm site-uri moderne, rapide și ușor de navigat.',
    'As a web design agency in Bucharest, we build modern, fast websites that are easy to navigate.',
  ],
  [
    'Oferim servicii de design si dezvoltare web personalizate pentru a crea site-uri moderne, rapide si usor de navigat.',
    'We offer custom web design and development to build modern, fast websites that are easy to navigate.',
  ],
  [
    'Oferim servicii de design și dezvoltare web personalizate pentru a crea site-uri moderne, rapide și ușor de navigat.',
    'We offer custom web design and development to build modern, fast websites that are easy to navigate.',
  ],
  [
    'Îmbunătățim vizibilitatea online a afacerii tale, prin folosirea unor strategii SEO eficiente.',
    'We improve your online visibility with effective SEO strategies that attract qualified traffic.',
  ],
  [
    'Imbunatatim vizibilitatea online a afacerii tale, prin folosirea unor strategii SEO eficiente.',
    'We improve your online visibility with effective SEO strategies that attract qualified traffic.',
  ],
  [
    'Grijile legate de site-ul tău le preluăm noi! De la actualizări la securitate, ne asigurăm că totul funcționează lin, ca tu să te poți concentra pe ceea ce faci tu cel mai bine.',
    'We take care of your website worries, from updates to security, so everything runs smoothly and you can focus on what you do best.',
  ],
  [
    'Grijile legate de site-ul tau le preluam noi! De la actualizari la securitate, ne asiguram ca totul functioneaza lin, ca tu sa te poti concentra pe ceea ce faci tu cel mai bine.',
    'We take care of your website worries, from updates to security, so everything runs smoothly and you can focus on what you do best.',
  ],
  [
    'Povestea brandului tău merită un logo pe măsură. Vom crea împreună un simbol vizual unic, care să-ți reprezinte afacerea și să rămână în mintea clienților.',
    'Your brand story deserves a logo to match. Together we create a unique visual mark that represents your business and sticks in customers’ minds.',
  ],
  [
    'Povestea brandului tau merita un logo pe masura. Vom crea impreuna un simbol vizual unic, care sa-ti reprezinte afacerea si sa ramana in mintea clientilor.',
    'Your brand story deserves a logo to match. Together we create a unique visual mark that represents your business and sticks in customers’ minds.',
  ],
  [
    'Maximizăm impactul bugetului tău de publicitate prin campanii PPC targetate.',
    'We maximize your ad budget with targeted PPC campaigns that drive conversions.',
  ],
  [
    'Maximizam impactul bugetului tau de publicitate prin campanii PPC targetate.',
    'We maximize your ad budget with targeted PPC campaigns that drive conversions.',
  ],
  [
    'Spune povestea brandului tău în cuvinte care rezonază cu audiența ta. Cu un conținut creativ și captivant, îți vom ajuta mesajul să strălucească și să atragă atenția dorită.',
    'Tell your brand story in words that resonate. With creative, conversion-focused copy, we help your message stand out and get noticed.',
  ],
  [
    'Spune povestea brandului tau in cuvinte care rezoneaza cu audienta ta. Cu un continut creativ si captivant, iti vom ajuta mesajul sa straluceasca si sa atraga atentia dorita.',
    'Tell your brand story in words that resonate. With creative, conversion-focused copy, we help your message stand out and get noticed.',
  ],
  ['Mentenanta', 'Website maintenance'],
  ['Mentenanță', 'Website maintenance'],
  ['Servicii Copywriting', 'Copywriting services'],
  ['Logo Design', 'Logo design'],
  ['Pay Per Click', 'Pay-per-click advertising'],

  // FAQ questions + answers (home)
  [
    'Ce este marketingul online și de ce ar trebui să îl folosesc?',
    'What is online marketing and why should I use it?',
  ],
  [
    'Ce este marketingul online si de ce ar trebui sa il folosesc?',
    'What is online marketing and why should I use it?',
  ],
  [
    'Cât timp durează până când voi vedea rezultate din serviciile de marketing online?',
    'How long until I see results from online marketing services?',
  ],
  [
    'Cat timp dureaza pana cand voi vedea rezultate din serviciile de marketing online?',
    'How long until I see results from online marketing services?',
  ],
  [
    'Trebuie să măresc bugetul ca să meargă marketingul online?',
    'Do I have to increase my budget for online marketing to work?',
  ],
  [
    'Cum aleg ce să facem împreună?',
    'How do we choose what to work on together?',
  ],
  [
    'Cum știu dacă treaba merge?',
    'How do I know if the work is working?',
  ],
  [
    'Cum pot să îmi măresc bugetul pentru serviciile de marketing online?',
    'How can I increase my budget for online marketing services?',
  ],
  [
    'Cum pot sa imi maresc bugetul pentru serviciile de marketing online?',
    'How can I increase my budget for online marketing services?',
  ],
  [
    'Cum pot să aleg serviciul potrivit pentru afacerea mea?',
    'How do I choose the right marketing service for my business?',
  ],
  [
    'Cum pot sa aleg serviciul potrivit pentru afacerea mea?',
    'How do I choose the right marketing service for my business?',
  ],
  [
    'Cum monitorizați performanța campaniilor de marketing online?',
    'How do you track online marketing campaign performance?',
  ],
  [
    'Cum monitorizati performanta campaniilor de marketing online?',
    'How do you track online marketing campaign performance?',
  ],
  [
    'Cum pot să încep să lucrez cu agenția voastră de marketing digital?',
    'How can I start working with your digital marketing agency?',
  ],
  [
    'Cum pot sa incep sa lucrez cu agentia voastra de marketing digital?',
    'How can I start working with your digital marketing agency?',
  ],
  [
    'Cum pot să încep să lucrez cu firma voastră de marketing online?',
    'How can I start working with your digital marketing agency?',
  ],
  [
    'Cum pot sa incep sa lucrez cu firma voastra de marketing online?',
    'How can I start working with your digital marketing agency?',
  ],

  [
    'Marketingul online e felul în care te găsesc oamenii care deja caută ce vinzi: Google, ads, conținut, social. Asta face o agenție de marketing digital din București, promovare online cu un plan, nu postări aruncate când îți amintești.',
    'Online marketing is how people who already search for what you sell find you: Google, ads, content, social. That is what a digital marketing agency in Bucharest does, online promotion with a plan, not leftover posts when you remember.',
  ],
  [
    'Dacă nu ești acolo, clientul nu te ocolește din răutate. Pur și simplu nu știe că exiști. De-asta merită o agenție de marketing online, nu un hobby de weekend.',
    'If you are not there, the client is not snubbing you. They simply do not know you exist. That is why an online marketing agency is worth it, not a weekend hobby.',
  ],
  [
    'Depinde de canal, nu de magie. SEO se vede de obicei în câteva luni. Google Ads și social pot aduce clienți în zile sau săptămâni, dacă oferta e clară. Marketingul online e treabă lungă: concurența, bugetul și cât de repede poți tu să răspunzi la lead-uri contează la fel de mult ca treaba noastră.',
    'It depends on the channel, not on magic. SEO usually shows in a few months. Google Ads and social can bring clients in days or weeks, if the offer is clear. Online marketing is long work: competition, budget, and how fast you answer leads matter as much as what we do.',
  ],
  [
    'Nu neapărat. Mai întâi scoatem mai mult din ce ai deja: site care convertește, canale care aduc clienți, tăiat ce arde bani degeaba. Abia apoi are sens să crești bugetul. Altfel doar plătești mai scump aceeași problemă.',
    'Not necessarily. First we get more from what you already have: a site that converts, channels that bring clients, cutting what burns money for nothing. Only then does a bigger budget make sense. Otherwise you just pay more for the same problem.',
  ],
  [
    'Pornim de la ce vrei tu să se întâmple, nu de la un pachet. Vrei să te găsească lumea pe Google în 6–12 luni? SEO. Vrei clienți luna asta? Ads. Îți lipsește site-ul? Îl facem. De obicei e un mix, ți-l spunem pe limba ta, cu un buget realist.',
    'We start from what you want to happen, not from a package. Want people to find you on Google in 6–12 months? SEO. Want clients this month? Ads. Missing a site? We build it. Usually it is a mix, we say it in plain language, with a realistic budget.',
  ],
  [
    'Ne uităm la ce contează: câți oameni ajung pe site, câți cer ofertă, cât costă un client. Nu-ți trimitem un PDF cu grafice ca să pară că s-a lucrat. Dacă ceva nu duce, îl oprim sau îl schimbăm. Date, nu intuiție.',
    'We look at what matters: how many people reach the site, how many ask for a quote, what a client costs. We will not send a PDF of charts to look busy. If something does not work, we stop it or change it. Data, not gut feel.',
  ],
  [
    'Ne scrii din formular, pe mail sau ne suni. Facem o consultație de 30 de minute, îți zicem ce am face și cam cât costă. Dacă ți se pare cinstit, începem. Dacă nu, rămâi cu o opinie utilă, nu cu un pitch de 40 de slide-uri.',
    'Write via the form, email, or call. We do a 30-minute consult, tell you what we would do and roughly what it costs. If it feels fair, we start. If not, you still leave with a useful opinion, not a 40-slide pitch.',
  ],
  [
    'Marketingul online este promovarea unei afaceri prin internet: SEO, publicitate plătită, conținut și social media. O agenție de marketing digital din București se ocupă de promovare online ca să fii găsit de clienții care te caută deja.',
    'Online marketing is promoting a business on the internet: SEO, paid ads, content, and social media. A digital marketing agency in Bucharest handles online promotion so customers who already search for you can find you.',
  ],
  [
    'Fără o prezență puternică online, pierzi potențiali clienți gata să cumpere. De aceea merită o agenție de marketing online, nu să încerci totul pe cont propriu.',
    'Without a strong online presence, you lose potential customers ready to buy. That is why an online marketing agency is worth it, instead of trying to do everything yourself.',
  ],
  [
    'Marketingul online este procesul de promovare a unei afaceri sau a unui produs prin intermediul internetului. Acesta implică utilizarea diferitelor tactici de marketing online, cum ar fi publicitatea plătită, marketingul de conținut, optimizarea motoarelor de căutare (SEO), marketingul prin e-mail și multe altele.',
    'Online marketing is promoting a business or product on the internet. It includes paid ads, content marketing, search engine optimization (SEO), email marketing, and more.',
  ],
  [
    'Marketingul online este important deoarece majoritatea oamenilor folosesc internetul pentru a căuta produse sau servicii. Dacă nu ai o prezență puternică online, este posibil să pierzi potențiali clienți cărora le-ar plăcea să cumpere de la tine.',
    'Online marketing matters because most people search for products and services online. Without a strong online presence, you can lose potential customers ready to buy.',
  ],
  [
    'Timpul necesar pentru a vedea rezultatele variază în funcție de serviciul de marketing online pe care îl folosești și de cât de mult efort depui în el. De exemplu, rezultatele SEO pot dura câteva luni până să fie vizibile, în timp ce PPC și campaniile de social media pot aduce rezultate vizibile în câteva zile sau săptămâni. Este important să ai în vedere faptul că marketingul online este o abordare pe termen lung, iar rezultatele pot varia în funcție de mulți factori, cum ar fi concurența din industria ta, bugetul și calitatea serviciilor tale.',
    'Time to results depends on the channel and how consistently you invest. SEO often takes a few months to show, while PPC and social campaigns can deliver results in days or weeks. Online marketing is a long-term approach, results also depend on competition, budget, and service quality.',
  ],

  // Website design page
  ['Creare site web', 'Website design & development'],
  ['Prezenta online conteaza!', 'Your online presence matters!'],
  ['Prezența online contează!', 'Your online presence matters!'],
  ['Tipuri de creare site web', 'Types of websites we build'],
  ['Punctele noastre forte', 'Our strengths'],
  ['Care este pretul unui site in wordpress* ?', 'What does a WordPress website cost?*'],
  ['Care este prețul unui site în wordpress* ?', 'What does a WordPress website cost?*'],
  ['Design si UX', 'Design and UX'],
  ['Design și UX', 'Design and UX'],
  ['Transformă viziunea ta digitală in realitate', 'Turn your digital vision into reality'],
  ['Transformă viziunea ta digitală în realitate', 'Turn your digital vision into reality'],
  ['Expertiza Noastră, Site-ul Tău Web Fără Stres', 'Our expertise, your stress-free website'],
  ['Landing Page', 'Landing page'],
  ['Site Web de prezentare', 'Business website'],
  ['Magazin online', 'Online store'],
  ['De ce echipa de tocilari?', 'Why choose Echipa de Tocilari?'],
  ['E-commerce - magazin online', 'E-commerce, online store'],
  ['Inovatie si creativitate', 'Innovation and creativity'],
  ['Inovație și creativitate', 'Innovation and creativity'],
  [
    'Vrei să ai un site web care să te facă să strălucești pe internet? Alege serviciul nostru de creare site web și lasă-ne să transformăm visurile tale în realitate!',
    'Want a website that helps you stand out online? Choose our website design service and let us turn your vision into a high-performing site.',
  ],

  // SEO page
  ['Solicita acum un audit <br><b>GRATUIT</b> de optimizare SEO', 'Request a <br><b>FREE</b> SEO audit'],
  ['Servicii SEO on page:', 'On-page SEO services:'],
  ['Servicii SEO off page:', 'Off-page SEO services:'],
  ['1 pagina optimizata', '1 optimised page'],
  ['2 pagini optimizate', '2 optimised pages'],
  ['3 pagini optimizate', '3 optimised pages'],
  ['Meta Titluri', 'Meta titles'],
  ['Meta Descriere', 'Meta descriptions'],
  ['Alt Text', 'Image alt text'],
  ['Site map*', 'Sitemap*'],
  ['PE LUNA', 'PER MONTH'],
  ['4 linkuri externe', '4 external links'],
  ['6 linkuri externe', '6 external links'],
  ['8 linkuri externe', '8 external links'],
  ['2 comunicate de presa', '2 press releases'],
  ['3 comunicate de presa', '3 press releases'],
  ['4 comunicate de presa', '4 press releases'],
  ['2 NAP-uri', '2 NAP listings'],
  ['3 NAP-uri', '3 NAP listings'],
  ['4 NAP-uri', '4 NAP listings'],
  ['SEO tehnic*', 'Technical SEO*'],
  ['FAQ implementare', 'FAQ implementation'],
  ['Consultanta UX/UI', 'UX/UI consulting'],
  ['Raport lunar', 'Monthly report'],
  ['Comanda acum!', 'Order now!'],
  [
    '***oferta supusa unor termeni si conditii. Oferta de pret are caracter pur informativ. Pret fara TVA. Preturile sunt pentru pentru website-uri in limba romana si care se adreseaza pietei romanesti*In functie de nevoile clientului si necesitatile tehnice intalnite pe parcursul colaborarii, este posibil sa oferim servicii bonus',
    '*** Offer subject to terms and conditions. Prices are indicative, non-contractual and exclude VAT. They apply to Romanian-language websites targeting the Romanian market. Depending on project needs and technical findings, bonus services may be included.',
  ],
  ['Optimizare pornită de la nevoile site-ului tău', 'SEO shaped around the needs of your website'],
  ['Ajută-ți afacerea să fie găsită și în răspunsurile AI', 'Help people find your business in AI answers too'],
  ['Ce lucrăm concret', 'What we work on'],
  ['Cum verificăm progresul', 'How we track progress'],
  ['Ce înseamnă AEO și GEO?', 'What do AEO and GEO mean?'],
  ['Audit și prioritizarea problemelor', 'Audit and prioritisation of issues'],
  ['Strategie de cuvinte cheie potrivită serviciilor', 'A keyword strategy matched to your services'],
  ['Optimizarea conținutului și a structurii paginilor', 'Content and page structure optimisation'],
  ['Monitorizare și explicații în raportul lunar', 'Monitoring and explanations in a monthly report'],
  ['crearea sau refacerea site-ului', 'building or rebuilding your website'],
  ['Prețuri SEO: abonamente pentru site-uri', 'SEO pricing: plans for'],
  ['de prezentare în limba română***', 'Romanian-language business websites***'],
  [
    'Oferim servicii de optimizare SEO pentru site-uri și magazine online. Analizăm problemele tehnice, căutările relevante și conținutul, apoi îmbunătățim paginile pentru Google și pentru întrebările pe care oamenii le adresează asistenților AI. Lucrăm din București și colaborăm online în toată România. Rezultatele depind de site, concurență și timp, nu sunt garantate.',
    'We offer SEO services for websites and online stores. We review technical issues, relevant searches and content, then improve pages for Google and for the questions people ask AI assistants. Based in Bucharest, we work remotely across Romania. Results depend on the website, competition and time, and are not guaranteed.',
  ],
  [
    'Dacă deții o afacere sau administrezi un site, SEO poate ajuta paginile relevante să fie înțelese și găsite mai ușor în căutări. Începem prin a verifica accesul la pagini, structura lor și întrebările la care trebuie să răspundă.',
    'If you run a business or manage a website, SEO can help relevant pages be understood and found in search. We start by checking access to pages, their structure and the questions they need to answer.',
  ],
  [
    'Căutările organice pot aduce vizitatori interesați de serviciile tale, dar potențialul diferă în funcție de piață și de starea site-ului. Urmărim evoluția în date, fără să promitem poziții sau trafic garantat.',
    'Organic search can bring visitors interested in your services, but the opportunity depends on the market and the state of your website. We track progress with data without promising rankings or traffic.',
  ],
  [
    'O colaborare SEO are nevoie de priorități clare și de timp pentru implementare. Stabilim ce probleme abordăm întâi, cine poate face modificările pe site și ce date vom urmări.',
    'SEO work needs clear priorities and time to implement them. We agree which issues to address first, who can change the website and which data to track.',
  ],
  [
    'Primești explicații pe înțelesul tău și un raport lunar pentru activitățile din abonament. Dacă apar lucrări în afara pachetului, le discutăm înainte de implementare.',
    'You receive clear explanations and a monthly report on the work included in your plan. We discuss work outside the plan before implementing it.',
  ],
  [
    'Pregătim informațiile despre afacerea ta astfel încât oamenii să găsească răspunsuri utile pe site, iar sistemele AI să poată înțelege mai ușor ce oferi. Este o extensie a muncii SEO, nu o metodă separată care garantează citări sau recomandări.',
    'We make information about your business easier for people to find on your website and for AI systems to understand. This extends SEO work; it is not a separate method that guarantees citations or recommendations.',
  ],
  ['Răspundem clar la întrebările reale ale clienților, în paginile relevante.', 'We answer real customer questions clearly on the relevant pages.'],
  ['Verificăm dacă informațiile despre firmă și servicii sunt consecvente.', 'We check that business and service information is consistent.'],
  ['Corectăm problemele care pot împiedica accesarea și înțelegerea paginilor.', 'We fix issues that may prevent pages from being accessed and understood.'],
  ['Organizăm conținutul și folosim date structurate acolo unde descriu fidel pagina.', 'We organise content and use structured data where it accurately describes the page.'],
  [
    'Urmărim căutările, paginile accesate și, când datele permit, traficul atribuit asistenților AI. Verificăm și aparițiile observabile, fără să le confundăm cu o măsură completă a vizibilității.',
    'We track searches, visited pages and, where data allows, traffic attributed to AI assistants. We also check observable appearances without treating them as a complete measure of visibility.',
  ],
  [
    'Raportăm ce s-a schimbat și ce rămâne de îmbunătățit. Nici SEO, nici ajustările pentru AI nu pot asigura o poziție, o citare sau un anumit volum de trafic.',
    'We report what changed and what still needs improvement. Neither SEO nor AI-focused work can guarantee a ranking, citation or amount of traffic.',
  ],
  [
    'AEO înseamnă să formulezi răspunsuri clare la întrebările oamenilor. GEO se referă la felul în care informațiile pot fi înțelese și folosite în răspunsuri generate de AI. În practică, multe activități se suprapun cu SEO.',
    'AEO means giving clear answers to people’s questions. GEO concerns how information can be understood and used in AI-generated answers. In practice, much of this work overlaps with SEO.',
  ],
  [
    'Stabilim în ofertă ce lucrări intră în abonament după auditul site-ului. Dacă sunt necesare schimbări mai ample de structură sau design, discutăm separat despre ',
    'After auditing the website, we specify in the proposal which work is included in the plan. If broader structural or design changes are needed, we discuss ',
  ],
  [
    'Pachetele afișate sunt pentru site-uri de prezentare în limba română, pe o perioadă minimă de 6 luni. Sumele și lucrările se confirmă în oferta personalizată.',
    'The displayed plans are for Romanian-language business websites, with a minimum term of six months. Prices and deliverables are confirmed in a tailored proposal.',
  ],
  [
    'Audităm paginile, analizăm căutările relevante și prioritizăm lucrările pe care le putem implementa. Explicăm de ce propunem fiecare schimbare și urmărim datele disponibile în raportul lunar. Dacă site-ul are limitări tehnice sau este nevoie de dezvoltare suplimentară, includem aceste condiții în planul de lucru.',
    'We audit pages, review relevant searches and prioritise work we can implement. We explain each proposed change and track the available data in the monthly report. If the website has technical limits or needs further development, we include those conditions in the work plan.',
  ],
  // Updated website design and maintenance service pages.
  ['Creare site web pentru afacerea ta', 'Website design for your business'],
  ['Site de prezentare adaptat obiectivelor tale', 'A business website built around your goals'],
  ['Ce îți oferă un site de prezentare', 'What a business website gives you'],
  ['Ce informații ne ajută să estimăm proiectul', 'What we need to estimate your project'],
  ['Ce facem pentru site-ul tău', 'What we do for your website'],
  [
    'De la structura paginilor până la publicare, discutăm ce trebuie să prezinte site-ul și ce funcții sunt necesare. Activitățile și livrabilele se stabilesc în oferta pentru proiectul tău.',
    'From page structure to launch, we discuss what the site needs to present and which features it needs. Activities and deliverables are set out in the proposal for your project.',
  ],
  ['Structurăm paginile în jurul serviciilor și informațiilor pe care vrei să le prezinți.', 'We structure the pages around the services and information you want to present.'],
  ['Construim pachetele afișate pe WordPress și Elementor, cu funcțiile convenite în ofertă.', 'We build the listed packages with WordPress and Elementor, with the features agreed in the proposal.'],
  ['Pregătim afișarea pentru telefon, tabletă și desktop.', 'We prepare the layout for phones, tablets and desktops.'],
  ['Configurăm elementele de optimizare SEO incluse în pachetul ales.', 'We configure the SEO elements included in the selected package.'],
  ['Cât costă un site web WordPress?', 'How much does a WordPress website cost?'],
  ['Prețuri orientative pentru trei tipuri de proiecte', 'Indicative prices for three types of project'],
  ['Prețurile afișate sunt orientative. Costul final depinde de pagini, funcții și materialele disponibile.', 'The prices shown are indicative. Final cost depends on the pages, features and materials available.'],
  ['mentenanța site-ului', 'website maintenance'],
  ['magazin online', 'online store'],
  ['</a> sau cu <a href="/servicii-seo/">servicii SEO</a>', '</a> or <a href="/servicii-seo/">SEO services</a>'],
  [
    'Creăm site-uri web de prezentare pentru afaceri care vor să își explice clar serviciile și să poată fi contactate ușor. Pentru proiectele din București sau din alte orașe, stabilim structura și conținutul în funcție de obiectivele afacerii.',
    'We build business websites for companies that want to explain their services clearly and make it easy to get in touch. For projects in Bucharest or elsewhere, we plan the structure and content around your business goals.',
  ],
  [
    'Poți alege o pagină de campanie, un site de prezentare cu mai multe pagini sau un ',
    'You can choose a campaign page, a multi-page business website or an ',
  ],
  [
    'După lansare, te putem ajuta și cu ',
    'After launch, we can also help with ',
  ],
  [
    ', în funcție de nevoile tale.',
    ', depending on your needs.',
  ],
  [
    'Pentru o ofertă de creare site web, spune-ne ce servicii sau produse vrei să prezinți, câte pagini ai în vedere, ce funcții îți trebuie și ce texte și imagini ai deja. Aceste detalii ne ajută să stabilim împreună structura site-ului și costul proiectului.',
    'For a website quote, tell us which services or products you want to present, how many pages you expect, which features you need and which text and images you already have. These details help us agree on the website structure and project cost.',
  ],
  [
    'Prețurile de creare site web sunt orientative și nu reprezintă o ofertă contractuală. Pentru o estimare personalizată, trimite-ne numărul de pagini, funcționalitățile dorite și materialele disponibile. Îți comunicăm costul și condițiile înainte de începerea proiectului.',
    'Website prices are indicative, not a contractual offer. For a tailored estimate, send us the expected page count, desired features and available materials. We confirm the cost and terms before work begins.',
  ],
  ['Mentenanță site și administrare WordPress', 'Website maintenance and WordPress management'],
  ['Actualizări tehnice și suport pentru conținut', 'Technical updates and content support'],
  ['Pachete și prețuri de mentenanță site', 'Website maintenance plans and pricing'],
  ['Compară serviciile lunare pentru site-uri web și magazine online.', 'Compare monthly services for websites and online stores.'],
  ['Care este diferența dintre mentenanță și administrare?', 'What is the difference between maintenance and management?'],
  [
    'Oferim mentenanță pentru site-uri WordPress și magazine online: actualizări ale platformei și pluginurilor, monitorizare și backup, conform pachetului ales. Serviciul este util când vrei să păstrezi site-ul funcțional și actualizat fără să gestionezi singur aceste operațiuni.',
    'We maintain WordPress websites and online stores with platform and plugin updates, monitoring and backups according to the selected plan. This helps keep your website working and up to date without handling these tasks yourself.',
  ],
  [
    'Administrarea site-ului înseamnă și modificări de conținut sau design, în limita orelor incluse în pachet. Mai jos poți compara activitățile, timpul lunar alocat și costurile suplimentare.',
    'Website management also covers content or design changes within the hours included in your plan. Below you can compare the tasks, monthly time allowance and extra costs.',
  ],
  [
    'Mentenanța acoperă operațiunile tehnice enumerate în pachete, precum actualizările, monitorizarea și backup-ul. Administrarea include și modificările de conținut sau design prevăzute în pachet, în limita timpului lunar alocat.',
    'Maintenance covers the technical tasks listed in the plans, such as updates, monitoring and backups. Management also includes the content or design changes specified in the plan, within the monthly time allowance.',
  ],
  [
    'Pentru modificări de conținut sau funcționalități noi în afara orelor incluse, tariful afișat este de 30 euro/oră. Verifică împreună cu noi pachetul potrivit și condițiile înainte de comandă.',
    'For content changes or new features beyond the included hours, the listed rate is 30 euros per hour. Check the right plan and terms with us before ordering.',
  ],
  ['Oferim un boost afacerii tale!', 'We give your business a growth boost!'],
  ['Pentru ce am nevoie de servicii SEO?', 'Why do I need SEO services?'],
  ['Servicii SEO pentru vizibilitate maxima', 'SEO services for maximum visibility'],
  ['Servicii SEO pentru vizibilitate maximă', 'SEO services for maximum visibility'],
  ['Procesul nostru de Optimizare SEO', 'Our SEO process'],
  ['Depaseste-ti Concurenta', 'Outrank your competition'],
  ['Depășește-ți concurența', 'Outrank your competition'],
  ['Parteneriat SEO de lunga durata', 'Long-term SEO partnership'],
  ['Parteneriat SEO de lungă durată', 'Long-term SEO partnership'],
  ['Audit optimizare SEO', 'SEO audit'],
  ['Analiza concurentei si a pietei', 'Competitor and market analysis'],
  ['Analiza concurenței și a pieței', 'Competitor and market analysis'],
  ['Strategie keywords', 'Keyword strategy'],
  ['Servicii SEO on-page', 'On-page SEO'],
  ['Servicii SEO off-page', 'Off-page SEO'],
  ['Monitorizare campanie', 'Campaign monitoring'],
  ['SEO Start up', 'SEO Starter'],
  ['SEO premium', 'SEO Premium'],
  ['SEO Advanced', 'SEO Advanced'],
  [
    'Oferta Pret Abonamente pentru website de prezentare in limba Romana***',
    'Pricing packages for Romanian business websites***',
  ],
  [
    'Alege pachetul dorit pentru site-ul tau de prezentare pentru o perioada de minim 6 luni!',
    'Choose a package for your business website, minimum recommended period: 6 months.',
  ],

  // Maintenance
  ['Mentenanta la nivel inalt', 'High-level website maintenance'],
  ['Mentenanță la nivel înalt', 'High-level website maintenance'],
  ['Administrare site & magazin online', 'Website & online store management'],
  ['Preturi Administrare', 'Maintenance pricing'],
  ['Prețuri administrare', 'Maintenance pricing'],
  [
    'Servicii lunare de administrare / mentenanta pentru site-urile web si magazine online.',
    'Monthly website maintenance and management for websites and online stores.',
  ],
  ['Pachet Starter', 'Starter package'],
  ['Pachet premium', 'Premium package'],
  ['Pachet Advanced', 'Advanced package'],

  // Portfolio / contact / generic
  ['Portofoliu Web Design', 'Web design portfolio'],
  ['Uite ce putem face pentru afacerea ta', 'See what we can do for your business'],
  ['About Us', 'About us'],
  ['We Are Beyond', 'We are beyond'],
  ['behind the scenes at beyond', 'Behind the scenes'],
  ['Your Dream. Our Mission.', 'Your dream. Our mission.'],
  ['meet our amazing team', 'Meet our team'],
  ['Meet Our Clients', 'Meet our clients'],
  ['The Faces Behind our Success', 'The faces behind our success'],
  ['We Believe In Hard Work And Dedication', 'We believe in hard work and dedication'],
  ['Digital Lovers', 'Digital enthusiasts'],

  // Safe multi-word fragments only (never single short words, they corrupt HTML/brand)
  ['afacerea ta', 'your business'],
  ['afacerea mea', 'my business'],
  ['website-ul tău', 'your website'],
  ['website-ul tau', 'your website'],
  ['site-ul tău', 'your website'],
  ['site-ul tau', 'your website'],
  ['publicul țintă', 'target audience'],
  ['publicul tinta', 'target audience'],
  ['marketing online', 'online marketing'],
  ['marketing digital', 'digital marketing'],
  ['optimizarea motoarelor de căutare', 'search engine optimization'],
  ['optimizarea motoarelor de cautare', 'search engine optimization'],
  ['crearea site-ului web', 'website design'],
  ['Bucuresti', 'Bucharest'],
  ['București', 'Bucharest'],
  ['All Rights Reserved', 'All rights reserved'],

  // Testimonials (home)
  [
    'Colaborarea cu această agenție de online marketing a fost o experiență foarte plăcută. Echipa lor a fost mereu amabilă și profesionistă, iar serviciile lor au fost de înaltă calitate. Am fost impresionat de rezultatele pe care le-au obținut pentru my business și îi recomand cu încredere pe acești profesioniști în online marketing.',
    'Working with this online marketing agency was a great experience. Their team was always friendly and professional, and the service quality was excellent. I was impressed by the results for my business and I confidently recommend these digital marketing professionals.',
  ],
  [
    'Colaborarea cu această agenție de marketing online a fost o experiență foarte plăcută. Echipa lor a fost mereu amabilă și profesionistă, iar serviciile lor au fost de înaltă calitate. Am fost impresionat de rezultatele pe care le-au obținut pentru afacerea mea și îi recomand cu încredere pe acești profesioniști în marketing online.',
    'Working with this online marketing agency was a great experience. Their team was always friendly and professional, and the service quality was excellent. I was impressed by the results for my business and I confidently recommend these digital marketing professionals.',
  ],
  [
    'Am lucrat cu această agenție de online marketing și am fost impresionată de nivelul lor de expertiză. Echipa lor a fost mereu disponibilă și a răspuns prompt la întrebările noastre. Ne-au ajutat să ne îmbunătățim strategia de marketing și să creștem vizibilitatea online a afacerii noastre. Recomand cu încredere această agenție.',
    'We worked with this online marketing agency and I was impressed by their expertise. The team was always available and answered quickly. They helped us improve our marketing strategy and grow our online visibility. I highly recommend this agency.',
  ],
  [
    'Am lucrat cu această agenție de marketing online și am fost impresionată de nivelul lor de expertiză. Echipa lor a fost mereu disponibilă și a răspuns prompt la întrebările noastre. Ne-au ajutat să ne îmbunătățim strategia de marketing și să creștem vizibilitatea online a afacerii noastre. Recomand cu încredere această agenție.',
    'We worked with this online marketing agency and I was impressed by their expertise. The team was always available and answered quickly. They helped us improve our marketing strategy and grow our online visibility. I highly recommend this agency.',
  ],
  [
    'Această agenție de online marketing este cea mai bună alegere pentru oricine dorește să își promoveze afacerea online. Echipa lor de specialiști a făcut o treabă excelentă în promovarea afacerii mele și am observat o creștere semnificativă a vânzărilor. Sunt foarte mulțumită de serviciile lor si vom colabora si la viitoarele campanii de promovare.',
    'This online marketing agency is the best choice for anyone who wants to promote their business online. Their specialists did an excellent job promoting my business and I saw a significant increase in sales. I am very happy with their services and we will work together on future campaigns.',
  ],
  [
    'Această agenție de marketing online este cea mai bună alegere pentru oricine dorește să își promoveze afacerea online. Echipa lor de specialiști a făcut o treabă excelentă în promovarea afacerii mele și am observat o creștere semnificativă a vânzărilor. Sunt foarte mulțumită de serviciile lor si vom colabora si la viitoarele campanii de promovare.',
    'This online marketing agency is the best choice for anyone who wants to promote their business online. Their specialists did an excellent job promoting my business and I saw a significant increase in sales. I am very happy with their services and we will work together on future campaigns.',
  ],

  // More FAQ long answers (common Rank Math / Elementor text)
  [
    'Există mai multe opțiuni pentru a-ți mări bugetul pentru serviciile de marketing online. Una dintre ele este să optimizezi website-ul tău pentru conversii, astfel încât să maximizezi numărul de vizitatori care se transformă în clienți. De asemenea, poți să te concentrezi pe canalele care aduc cele mai bune rezultate pentru afacerea ta și să reduci bugetul pentru cele care nu generează un ROI favorabil. În final, poți să îți mărești bugetul global pentru marketingul online prin realocarea fondurilor din alte părți ale afacerii tale sau prin obținerea de investiții suplimentare.',
    'There are several ways to grow your online marketing budget. First, optimize your website for conversions so each visitor is more valuable. Focus spend on channels with the best ROI and cut underperforming ones. You can also reallocate budget from other parts of the business or raise additional investment once results are clear.',
  ],
  [
    'Înainte de a alege un serviciu de marketing online, ar trebui să îți evaluezi obiectivele și bugetul. De exemplu, dacă dorești să îți crești vizibilitatea în căutările organice, atunci SEO poate fi o alegere bună. Dacă dorești să ajungi la un public mai larg și să crești vânzările într-un timp scurt, publicitatea plătită prin PPC ar putea fi o alegere mai bună. De asemenea, ar trebui să ții cont de publicul tău țintă și de canalul prin care aceștia ar prefera să primească informații despre produsele sau serviciile tale.',
    'Before choosing an online marketing service, clarify your goals and budget. For long-term organic visibility, SEO is often best. For faster reach and sales, PPC can work better. Also consider your target audience and where they prefer to discover products and services.',
  ],
  [
    'Noi monitorizăm performanța campaniilor de marketing online prin intermediul uneltelor specifice de monitorizare și analiză. Acestea ne permit să vedem câți vizitatori au accesat website-ul tău, cum au interacționat cu conținutul și care au fost rezultatele campaniilor de publicitate plătită sau de social media. Folosim aceste informații pentru a identifica zonele în care putem îmbunătăți campaniile tale de marketing online și pentru a aduce ajustări pe baza datelor, nu pe intuiție.',
    'We track online marketing performance with analytics tools: traffic, on-site behavior, paid and social results. We use that data to improve campaigns and make evidence-based adjustments, not guesswork.',
  ],
  [
    'Noi monitorizăm performanța campaniilor de marketing online prin intermediul uneltelor specifice de monitorizare și analiză. Acestea ne permit să vedem câți vizitatori au accesat website-ul tău, cum au interacționat cu conținutul și care au fost rezultatele campaniilor de publicitate plătită sau de social media. Folosim aceste informații pentru a identifica zonele în care putem îmbunătăți campaniile tale de marketing online și pentru a aduce ajustări în funcție de rezultate.',
    'We track online marketing performance with analytics tools: traffic, on-site behavior, paid and social results. We use that data to improve campaigns and make evidence-based adjustments based on results.',
  ],
  [
    'Pentru a începe să lucrezi cu noi, tot ce trebuie să faci este să ne contactezi prin intermediul formularului de contact de pe website-ul nostru sau prin telefon sau e-mail. Vom discuta cu tine despre nevoile tale de marketing online și îți vom oferi un plan personalizat și un buget estimativ. Dacă sunteți de acord cu propunerea noastră, vom începe să lucrăm împreună pentru a-ți crește prezența online și a-ți ajuta afacerea să crească.',
    'To get started, contact us via the website form, phone, or email. We will discuss your online marketing needs and share a tailored plan with a budget estimate. If you agree, we begin work to grow your online presence and your business.',
  ],

  // SEO services long-form
  [
    'Echipa de Tocilari dă putere afacerii tale prin servicii de optimizare SEO. Convertim vizitatorii in clienti si maximizam traficul de pe site-ul tau. Un impuls real pentru prezența ta online!',
    'Echipa de Tocilari powers your business with SEO services. We turn visitors into customers and maximize traffic to your website, a real boost for your online presence.',
  ],
  [
    'Echipa de Tocilari dă putere afacerii tale prin servicii de optimizare SEO. Convertim vizitatorii în clienți și maximizăm traficul de pe site-ul tău. Un impuls real pentru prezența ta online!',
    'Echipa de Tocilari powers your business with SEO services. We turn visitors into customers and maximize traffic to your website, a real boost for your online presence.',
  ],
  ['Atrage-ti audienta cu o prezenta online crescuta', 'Attract your audience with a stronger online presence'],
  ['Atrage-ți audiența cu o prezență online crescută', 'Attract your audience with a stronger online presence'],
  [
    'Începem cu un audit SEO detaliat, identificând oportunități de îmbunătățire și prioritizând acțiunile pentru un impact maxim.',
    'We start with a detailed SEO audit, identifying improvement opportunities and prioritizing actions for maximum impact.',
  ],
  [
    'Analizăm concurența și piața pentru a înțelege unde stai și cum poți să te diferențiezi eficient.',
    'We analyze competitors and the market to understand where you stand and how to differentiate effectively.',
  ],
  [
    'Dezvoltăm o strategie de cuvinte cheie bazată pe cercetare și date, pentru a atrage trafic calificat spre site-ul tău.',
    'We build a research-driven keyword strategy to attract qualified traffic to your website.',
  ],
  [
    'Optimizăm elementele on-page, inclusiv titluri, metadescrieri și structura de conținut, pentru a îmbunătăți relevanța și accesibilitatea paginilor tale.',
    'We optimize on-page elements, titles, meta descriptions, and content structure, to improve relevance and accessibility.',
  ],
  [
    'Consolidăm autoritatea site-ului tău prin strategii off-page, cum ar fi construirea de linkuri calitative și strategii de conținut, pentru a crește autoritatea și încrederea.',
    'We strengthen site authority with off-page strategies such as quality link building and content campaigns.',
  ],
  [
    'Urmărim performanța campaniei SEO prin instrumente avansate, ajustând strategiile în funcție de datele analitice pentru a optimiza rezultatele continue.',
    'We track SEO performance with advanced tools and adjust strategy based on analytics for continuous improvement.',
  ],
  ['Oferta Pret Abonamente pentru website', 'Subscription pricing for websites'],
  ['de prezentare in limba Romana***', 'business websites in Romanian***'],
  ['de prezentare în limba Română***', 'business websites in Romanian***'],
  ['3 articole de blog (min 600 cuv fiecare)', '3 blog articles (min. 600 words each)'],
  ['5 articole de blog (min 600 cuv fiecare)', '5 blog articles (min. 600 words each)'],
  ['7 articole de blog (min 600 cuv fiecare)', '7 blog articles (min. 600 words each)'],
  ['Optimizare Google Afacerea Mea', 'Google Business Profile optimization'],
  ['Consultanta management Google Afacerea Mea', 'Google Business Profile consulting'],
  ['Consultanță management Google Afacerea Mea', 'Google Business Profile consulting'],
  ['Optimizare canale Social Media', 'Social media channel optimization'],
  [
    '*Anumite aspecte tehnice vor fi implemenate doar daca website-ul este construit in WordPress si exista acces.',
    '*Some technical items are implemented only if the website is built on WordPress and access is provided.',
  ],

  // Website design long-form
  [
    'Expertiza Noastră, Site-ul Tău Web Fără Stres',
    'Our expertise, your stress-free website',
  ],
  ['Expertiza specializata', 'Specialized expertise'],
  ['Expertiza specializată', 'Specialized expertise'],
  ['Abordare personalizata', 'Personalized approach'],
  ['Abordare personalizată', 'Personalized approach'],
  [
    'Promotia noastra de Black Friday se termina pe 30 noiembrie!',
    'Our Black Friday promotion ends on November 30!',
  ],
  [
    'Landing page - site de prezentare de o pagina',
    'Landing page, single-page conversion website',
  ],
  ['template wordpress / elementor', 'WordPress / Elementor template'],
  ['Site de prezentare clasic', 'Classic multi-page business website'],
  ['10 produse / servicii incluse', '10 products / services included'],
  [
    '*oferta supusa unor termeni si conditii. Oferta de pret are caracter pur informativ.',
    '*Offer subject to terms and conditions. Pricing is indicative only.',
  ],
  ['2. Site Web de prezentare', '2. Business website'],

  // Maintenance long-form
  [
    'Beneficiază de serviciile noastre în administrare site și mentenață și crește-ți afacerea online cu succes!',
    'Benefit from our website management and maintenance services and grow your online business successfully!',
  ],
  [
    'Beneficiază de serviciile noastre în administrare site și mentenață și crește-ți afacerea online cu succes!',
    'Benefit from our website management and maintenance services and grow your online business successfully!',
  ],
  [
    'Un site cu conținut relevant și actualizat continuu poate fi un instrument performant de generare de trafic și de creștere a vânzărilor și a afacerii.',
    'A website with relevant, continuously updated content is a powerful tool for traffic and sales growth.',
  ],
  ['Actualizare continut site', 'Website content updates'],
  ['Actualizare conținut site', 'Website content updates'],
  ['Timp alocat lunar - 2 ore', 'Monthly time allocation, 2 hours'],
  ['Timp alocat lunar - 4 ore', 'Monthly time allocation, 4 hours'],
  ['Timp alocat lunar - 6 ore', 'Monthly time allocation, 6 hours'],
  ['sector 2', 'District 2'],

  [
    'Dacă deții o afacere sau administrezi un site web, implementarea SEO te poate ajuta să obții rezultate în mai multe moduri. Un SEO bun îți crește traficul site-ului, îmbunătățește vizibilitatea și construiește credibilitate.',
    'If you run a business or manage a website, SEO can help in multiple ways. Strong SEO increases traffic, improves visibility, and builds credibility.',
  ],
  [
    'Înțelegem ce înseamnă să deții și să conduci o afacere, și știm cât de important este să te simți încrezător în alegerea partenerului tău. Avem mulți clienți de lungă durată, cu relații construite pe ani de încredere și comunicare clară.',
    'We understand what it means to run a business, and how important it is to trust your partner. We have many long-term clients built on years of trust and clear communication.',
  ],
  [
    'Ne place să realizăm lucrurile eficient, iar metodele noastre sistematizate înseamnă că toate sarcinile SEO sunt executate într-un mod rapid și eficace. Îți raportăm rezultatele SEO clar, ca să știi mereu unde stai.',
    'We work efficiently with systematic methods so SEO tasks are executed quickly and effectively. We report SEO results clearly so you always know where you stand.',
  ],
  [
    'În timp ce obții aproximativ 50% din traficul tău din căutările organice, SEO te poate ajuta să maximizezi acest număr astfel încât să nu pierzi niciun potențial client. O echipă de specialiști SEO te ajută să fii găsit când clienții caută exact ce oferi.',
    'While roughly half of traffic often comes from organic search, SEO helps maximize that share so you do not miss potential customers. An SEO team helps you get found when buyers search for what you offer.',
  ],

  // ── Complete leftovers pass (full body copy) ──
  [
    'Atunci cand vine vorba de creare site web, designul si experienta utilizatorului (UX) sunt esentiale pentru a face o impresie puternica si de durata asupra vizitatorilor. Designul site-ului web include toate aspectele vizuale, de la aspectul general al site-ului si alegerea culorilor pana la grafica si imagini. Acesta poate influenta modul in care vizitatorii percep si interactioneaza cu site-ul si este vital pentru a transmite cu succes mesajul dorit.',
    'When it comes to website design, layout and user experience (UX) are essential for a strong, lasting impression. Website design covers every visual aspect, overall look, color choices, graphics, and images. It shapes how visitors perceive and interact with your site and is vital for communicating your message successfully.',
  ],
  [
    'La Echipa de Tocilari, excelența SEO începe cu un audit profund, urmat de analiza concurenței și a pieței pentru strategii de cuvinte cheie precisă. Ne dedicăm optimizării SEO on-page și off-page, asigurând că your website strălucește în fața publicului țintă. Monitorizăm îndeaproape campaniile pentru a ne asigura că fiecare pas consolidează prezența ta online. Parteneriatul cu noi înseamnă a avea la dispoziție experți dedicați succesului tău digital.',
    'At Echipa de Tocilari, SEO excellence starts with a deep audit, then competitor and market analysis for precise keyword strategies. We focus on on-page and off-page SEO so your website stands out to your target audience. We closely monitor campaigns so every step strengthens your online presence. Partnering with us means access to experts dedicated to your digital success.',
  ],
  [
    'La Echipa de Tocilari, excelența SEO începe cu un audit profund, urmat de analiza concurenței și a pieței pentru strategii de cuvinte cheie precisă. Ne dedicăm optimizării SEO on-page și off-page, asigurând că site-ul tău strălucește în fața publicului țintă. Monitorizăm îndeaproape campaniile pentru a ne asigura că fiecare pas consolidează prezența ta online. Parteneriatul cu noi înseamnă a avea la dispoziție experți dedicați succesului tău digital.',
    'At Echipa de Tocilari, SEO excellence starts with a deep audit, then competitor and market analysis for precise keyword strategies. We focus on on-page and off-page SEO so your website stands out to your target audience. We closely monitor campaigns so every step strengthens your online presence. Partnering with us means access to experts dedicated to your digital success.',
  ],
  [
    'Experienta utilizatorului este importanta pentru crearea unui site web eficient. Aceasta se refera la modul in care utilizatorii navigheaza pe site, cum interactioneaza cu conținutul și funcționalitatile si cum reacționează la diferite elemente ale site-ului. Un UX bun poate determina utilizatorii sa petreaca mai mult timp pe site, sa se intoarca in viitor si sa interactioneze in continuare cu brand-ul sau compania.',
    'User experience is critical for an effective website. It covers how users navigate the site, interact with content and features, and react to page elements. Strong UX keeps people on the site longer, brings them back, and deepens engagement with your brand.',
  ],
  [
    'Experiența utilizatorului este importantă pentru crearea unui site web eficient. Aceasta se referă la modul în care utilizatorii navighează pe site, cum interacționează cu conținutul și funcționalitățile și cum reacționează la diferite elemente ale site-ului. Un UX bun poate determina utilizatorii să petreacă mai mult timp pe site, să se întoarcă în viitor și să interacționeze în continuare cu brand-ul sau compania.',
    'User experience is critical for an effective website. It covers how users navigate the site, interact with content and features, and react to page elements. Strong UX keeps people on the site longer, brings them back, and deepens engagement with your brand.',
  ],
  [
    'Ne place să realizăm lucrurile eficient, iar metodele noastre sistematizate înseamnă că toate sarcinile SEO sunt executate într-un mod rapid și eficace. Îți raportăm rezultatele SEO în fiecare lună și ne propunem întotdeauna să te facem să te simți confortabil cu orice explicații tehnice. În anii noștri de experiență, suntem bine cunoscuți pentru excelentele noastre abilități de comunicare.',
    'We like to work efficiently. Our systematic methods mean SEO tasks are executed quickly and effectively. We report SEO results every month and always explain technical details clearly. Over years of experience we have become known for excellent communication.',
  ],
  [
    'Un mare avantaj al acestui tip de creare site web este faptul că îți permite să îți extinzi afacerea și să ajungi la un public mult mai larg decât în cazul vânzărilor tradiționale si poți să îți îmbunătățești relația cu clienții tăi, oferindu-le posibilitatea de a comanda produsele direct de pe site și de a primi feedback instantaneu cu privire la stocul disponibil.',
    'A major advantage of this website type is that you can expand your business and reach a much wider audience than traditional sales, while improving customer relationships by letting them order directly online and get instant stock feedback.',
  ],
  [
    'La Echipa de Tocilari, îți oferim ție și afacerii tale posibilitatea de a alege unul dintre numeroasele template-uri disponibile, fiecare fiind proiectat cu grijă pentru a satisface diverse gusturi și nevoi. Ne mândrim cu colecția noastră vastă și diversificată, care îți permite să găsești soluția perfectă pentru a-ți pune în valoare brandul în mediul online.',
    'At Echipa de Tocilari we give you and your business a wide range of carefully designed templates for different tastes and needs. Our diverse collection helps you find the right solution to showcase your brand online.',
  ],
  [
    'Un site web de prezentare este un website creat pentru a promova o afacere. Acesta poate fi comparat cu o broșură digitală care își prezintă compania și serviciile într-un mod interactiv. Un astfel de site este important deoarece oferă o prezență online profesională, ajutând la atragerea de noi clienți și la consolidarea relației cu cei existenți.',
    'A business website is built to promote a company. Think of it as an interactive digital brochure presenting your brand and services. It matters because a professional online presence attracts new customers and strengthens relationships with existing ones.',
  ],
  [
    'Cauti expertiza in creare site web? Echipa de Tocilari iti ofera design inovator, abordare personalizata, si SEO integrat pentru a transforma site-ul tau intr-o carte de vizita digitala. Pasionati de tehnologie si dedicati proiectului tau, ne asiguram ca fiecare site este gata de succes online. Alege-ne pentru a face diferenta in lumea digitala.',
    'Looking for website design expertise? Echipa de Tocilari offers innovative design, a personalized approach, and integrated SEO to turn your website into a digital business card. Passionate about technology and dedicated to your project, we make sure every site is ready for online success. Choose us to stand out in the digital world.',
  ],
  [
    'Cauti expertiza in creare site web? Echipa de Tocilari iti ofera design inovator, abordare personalizata, si SEO integrat pentru a transforma your website intr-o carte de vizita digitala. Pasionati de tehnologie si dedicati proiectului tau, ne asiguram ca fiecare site este gata de succes online. Alege-ne pentru a face diferenta in lumea digitala.',
    'Looking for website design expertise? Echipa de Tocilari offers innovative design, a personalized approach, and integrated SEO to turn your website into a digital business card. Passionate about technology and dedicated to your project, we make sure every site is ready for online success. Choose us to stand out in the digital world.',
  ],
  [
    'Cauți expertiză în creare site web? Echipa de Tocilari îți oferă design inovator, abordare personalizată, și SEO integrat pentru a transforma site-ul tău într-o carte de vizită digitală. Pasionați de tehnologie și dedicați proiectului tău, ne asigurăm că fiecare site este gata de succes online. Alege-ne pentru a face diferența în lumea digitală.',
    'Looking for website design expertise? Echipa de Tocilari offers innovative design, a personalized approach, and integrated SEO to turn your website into a digital business card. Passionate about technology and dedicated to your project, we make sure every site is ready for online success. Choose us to stand out in the digital world.',
  ],
  [
    'De asemenea, reclama PPC permite companiilor să concureze în mod direct cu competitorii lor, deoarece anunțurile sunt afișate în aceeași pagină de rezultate a căutării. Mai mult decât atât, companiile pot alege să afișeze anunțurile doar utilizatorilor care se află într-o anumită locație geografică sau care utilizează anumite cuvinte cheie.',
    'PPC also lets companies compete directly with rivals, since ads appear on the same search results page. Businesses can show ads only to users in a specific location or searching specific keywords.',
  ],
  [
    'Reclama PPC este un mod eficient de publicitate, dar necesită o planificare și o gestionare atentă. Este important ca companiile să identifice cuvintele cheie relevante și să aibă o strategie de ofertare adecvată pentru a se asigura că anunțurile lor sunt afișate în locurile potrivite și că obțin un nivel ridicat de clicuri.',
    'PPC advertising is effective but needs careful planning and management. Companies must identify relevant keywords and set a sound bidding strategy so ads show in the right places and earn strong click-through rates.',
  ],
  [
    'Reclama PPC poate fi un mod eficient de a aduce trafic calificat pe site-ul web al companiei și poate fi personalizată pentru a ajunge la un public țintă specific. De asemenea, companiile pot urmări și analiza performanța campaniilor lor PPC pentru a optimiza cheltuielile de publicitate și a obține rezultate mai bune.',
    'PPC can efficiently drive qualified traffic to a company website and can be tailored to a specific target audience. Companies can also track and analyze campaign performance to optimize ad spend and improve results.',
  ],
  [
    '***Offer subject to terms and conditions. Pricing is indicative only. Pret fara TVA. Preturile sunt pentru pentru website-uri in limba romana si care se adreseaza pietei romanesti*In functie de nevoile clientului si necesitatile tehnice intalnite pe parcursul colaborarii, este posibil sa oferim servicii bonus',
    '***Offer subject to terms and conditions. Pricing is indicative only, excluding VAT. Prices apply to Romanian-language websites targeting the Romanian market. Depending on client needs and technical requirements during the project, bonus services may be included.',
  ],
  [
    'În timp ce obții aproximativ 50% din traficul tău din căutările organice, SEO te poate ajuta să maximizezi acest număr astfel încât să nu pierzi niciun potențial client. O echipă de experți SEO îți poate amplifica succesul în toate aceste aspecte, asigurându-se că fiecare investiție are un ROI puternic.',
    'While roughly 50% of traffic often comes from organic search, SEO helps maximize that share so you do not miss potential customers. An expert SEO team amplifies success across these areas and ensures every investment delivers strong ROI.',
  ],
  [
    'Indiferent dacă vrei să îți promovezi afacerea, să îți faci cunoscut brandul sau să îți împărtășești pasiunile cu lumea, noi suntem aici să te ajutăm. Echipa noastră de experți în web design și dezvoltare îți va oferi soluții personalizate, adaptate nevoilor tale și ale publicului tău țintă.',
    'Whether you want to promote your business, grow brand awareness, or share your passions with the world, we are here to help. Our web design and development experts deliver custom solutions tailored to your needs and your target audience.',
  ],
  [
    'Crearea unui site web de tipul e-commerce reprezintă construirea unei platforme online special creată pentru a vinde produse prin intermediul internetului. Folosind acest tip de site, poți să vinzi orice produs îți dorești, de la haine și bijuterii, la electronice și echipamente sportive.',
    'Building an e-commerce website means creating an online platform purpose-built to sell products on the internet, from clothing and jewelry to electronics and sports equipment.',
  ],
  [
    'Un site web de tipul landing page este un site simplu, format dintr-o singură pagină, care are scopul de a atrage atenția vizitatorilor și de a-i convinge să ia o acțiune specifică, cum ar fi să completeze un formular, să cumpere un produs sau să se înscrie la un eveniment.',
    'A landing page is a simple one-page website designed to capture attention and drive a specific action, fill a form, buy a product, or register for an event.',
  ],
  [
    'De obicei, aceste anunțuri sunt afișate în partea de sus sau de jos a paginii de rezultate a căutării sau în alte zone relevante ale site-urilor partenere. Când cineva face clic pe anunț, compania plătește o sumă mică de bani, cunoscută sub numele de cost per click (CPC).',
    'These ads usually appear at the top or bottom of search results or on partner sites. When someone clicks, the company pays a small cost-per-click (CPC).',
  ],
  [
    'Fie că ești în căutarea unui design simplu și elegant sau unuia complex și inovator, la noi vei descoperi template-ul ideal care să răspundă cerințelor tale specifice. Toate modelele noastre sunt optimizate pentru a oferi o experiență de navigare fluidă și plăcută, indiferent de dispozitivul utilizat de vizitatori.',
    'Whether you want a simple elegant design or a complex innovative one, you will find a template that fits your needs. All our designs are optimized for a smooth browsing experience on any device.',
  ],
  [
    'Fie că ești în căutarea unui design simplu și elegant sau unuia complex și inovator, la noi vei descoperi template-ul ideal care să răspundă cerințelor tale specifice. Toate modelele noastre sunt optimizate pentru a oferi o experiență de navigare fluidă și plăcută, no matter dispozitivul utilizat de vizitatori.',
    'Whether you want a simple elegant design or a complex innovative one, you will find a template that fits your needs. All our designs are optimized for a smooth browsing experience on any device.',
  ],
  [
    'Noi știm că nu e ușor să îți construiești un site web, dar noi suntem aici să îți luăm acest stres de pe umeri. Cu experiența noastră vastă în crearea site-urilor web, îți garantăm că vei avea un site profesional, optimizat SEO și adaptat pentru toate dispozitivele.',
    'We know building a website is not easy, we take that stress off your shoulders. With extensive website design experience, we deliver a professional, SEO-optimized site that works on every device.',
  ],
  [
    'Pentru modificări asupra conținutului sau funcționalități noi în website se percepe un tarif suplimentar de 30 euro / oră (în cazul în care nu ai ales un pachet de administrare care include și un anumit număr de ore alocate lunar sau ai depășit acest număr).',
    'Content changes or new features are billed at an additional rate of €30 / hour (if you did not choose a maintenance package that includes monthly hours, or if you exceed the included hours).',
  ],
  [
    '** Pentru oferte de creare website personalizate, special gandite in functie de nevoile si bugetul tau – nu ezita sa ne contactezi. Oferta este supusa unor termeni si conditii. Oferta are titlu informativ si nu are un caracter contractual.',
    '** For custom website design quotes tailored to your needs and budget, contact us anytime. Offer subject to terms and conditions. Pricing is informative and non-contractual.',
  ],
  [
    '** Pentru oferte SEO personalizate, special gandite in functie de nevoile si bugetul tau – nu ezita sa ne contactezi. Oferta este supusa unor termeni si conditii. Oferta are titlu informativ si nu are un caracter contractual.',
    '** For custom SEO quotes tailored to your needs and budget, contact us anytime. Offer subject to terms and conditions. Pricing is informative and non-contractual.',
  ],
  [
    'Reclama Pay-per-click (PPC) este o metodă de publicitate online în care companiile plătesc pentru fiecare clic pe anunțurile lor afișate în rezultatele căutării sau în alte zone ale site-urilor web.',
    'Pay-per-click (PPC) advertising is an online ads model where companies pay for each click on ads shown in search results or on partner websites.',
  ],
  [
    'Mai mult decât atât, este important să se monitorizeze și să se analizeze performanța campaniilor PPC pentru a optimiza costurile și a obține un ROI (return on investment) pozitiv.',
    'It is also important to monitor and analyze PPC campaign performance to optimize costs and achieve a positive return on investment (ROI).',
  ],
  [
    'În concluzie, reclama PPC este o modalitate populară și eficientă pentru companii de a-și promova produsele și serviciile online și de a atrage trafic calificat pe site-ul lor web.',
    'In short, PPC advertising is a popular, effective way for companies to promote products and services online and attract qualified website traffic.',
  ],
  [
    'Costul per click variază în funcție de concurența pentru cuvintele cheie relevante și de nivelul de ofertare al companiilor care concurează pentru aceleași cuvinte cheie.',
    'Cost per click varies with competition for relevant keywords and the bidding level of companies targeting the same keywords.',
  ],
  [
    'Analiza continua a performantei si modificari bid-uri pentru atingerea unor KPI-uri (search impression share, numar conversii, rata de conversie, cost per conversie)',
    'Continuous performance analysis and bid adjustments toward KPIs (search impression share, conversions, conversion rate, cost per conversion)',
  ],
  [
    'Optimizare continua a anunturilor (scor de optimizare, scor relevanta)',
    'Continuous ad optimization (optimization score, relevance score)',
  ],
  [
    'Setup campanii Google Ads Search – maximum 120 Ad grupuri',
    'Google Ads Search setup, up to 120 ad groups',
  ],
  [
    'Setup campanii Google Ads Search – maximum 80 Ad grupuri',
    'Google Ads Search setup, up to 80 ad groups',
  ],
  [
    'Setup campanii Google Ads Search – maximum 40 Ad grupuri',
    'Google Ads Search setup, up to 40 ad groups',
  ],
  [
    'Beneficiază de serviciile noastre în&nbsp;administrare site și mentenață&nbsp;și crește-ți afacerea online cu succes!',
    'Benefit from our website management and maintenance services and grow your online business successfully!',
  ],
  ['Optimizare viteza site', 'Website speed optimization'],
  ['Optimizare viteză site', 'Website speed optimization'],
  ['Optimizare imagini*', 'Image optimization*'],
  ['Lista cuvinte cheie', 'Keyword list'],
  ['de optimizare SEO', 'SEO optimization'],
  ['abonament lunar', 'monthly subscription'],
  ['Prezenta online', 'Online presence'],
  ['Prezența online', 'Online presence'],
  ['pe care il ai!', 'you have in mind!'],
  ['pe care îl ai!', 'you have in mind!'],
  ['optimizare SEO', 'SEO optimization'],
  ['Pret fara TVA', 'Price excluding VAT'],
  ['Preturile sunt pentru pentru website-uri in limba romana si care se adreseaza pietei romanesti', 'Prices are for Romanian-language websites targeting the Romanian market'],
  ['In functie de nevoile clientului si necesitatile tehnice intalnite pe parcursul colaborarii, este posibil sa oferim servicii bonus', 'Depending on client needs and technical requirements during the project, bonus services may be included'],
  ['numar conversii', 'number of conversions'],
  ['rata de conversie', 'conversion rate'],
  ['cost per conversie', 'cost per conversion'],
  ['scor de optimizare', 'optimization score'],
  ['scor relevanta', 'relevance score'],
  ['Ad grupuri', 'ad groups'],
  ['cuvinte cheie', 'keywords'],
  ['mentenață', 'maintenance'],
  ['mentenanta', 'maintenance'],
  ['Ai o idee?', 'Got an idea?'],
  ['Ai o idee', 'Got an idea'],
  ['Hai sa vorbim', "Let's talk"],
  ['Hai să vorbim', "Let's talk"],
  // Form placeholders (longer first so "Nume Companie" is not split into "Name Companie")
  ['Nume Companie', 'Company name'],
  ['Name Companie', 'Company name'],
  ['Numele companiei', 'Company name'],
  ['Nume', 'Name'],
  ['Companie', 'Company'],
  ['Mesaj', 'Message'],
  ['Telefon', 'Phone'],
  ['Email', 'Email'],
];

/** Page-level SEO for English (natural search phrasing). */
export const enPageMeta = {
  '/en/': {
    title: 'Digital Marketing Agency Bucharest | Echipa de Tocilari',
    description:
      'Bucharest digital marketing agency. We do online promotion, web design, SEO, and Google Ads. Free 30-minute consult, we work remotely across Romania.',
  },
  '/en/about/': {
    title: 'About Us | Meet Echipa de Tocilari',
    description:
      'Meet Echipa de Tocilari, a digital marketing agency in Bucharest. Discover how we bring design, development, SEO, and clear communication to your project.',
  },
  '/en/website-design/': {
    title: 'Website Design Bucharest | Business Sites & Landing Pages',
    description:
      'Website design in Bucharest: business sites, landing pages, and a solid base for online stores. Fast, mobile-first, with technical SEO from day one.',
  },
  '/en/seo-services/': {
    title: 'SEO Services and AI Visibility | Echipa de Tocilari',
    description:
      'SEO services from Bucharest: audits, technical improvements and clear content for Google and AI-assisted search. See how we work and what plans include.',
  },
  '/en/website-maintenance/': {
    title: 'Website Management & Maintenance | WordPress Support',
    description:
      'WordPress website management: updates, backups, security, and content. A monthly retainer so your site stays fast and safe.',
  },
  '/en/contact/': {
    title: 'Contact | Free Digital Marketing Consultation',
    description:
      'Contact Echipa de Tocilari for website design, SEO, or Google Ads. Free 30-minute consult, remote across Romania.',
  },
  '/en/portfolio/': {
    title: 'Website Templates & Web Design Portfolio | Echipa de Tocilari',
    description:
      'Explore 20 website template demos for businesses, shops, and blogs. Choose a design that Echipa de Tocilari can adapt to your brand.',
  },
  '/en/services/': {
    title: 'Digital Marketing Services: Web, SEO, Google Ads',
    description:
      'Echipa de Tocilari services: websites and online stores, app development, SEO and AI visibility, Google Ads, Facebook Ads and website maintenance.',
  },
  '/en/clients/': {
    title: 'Our Clients | Web Design and SEO Projects',
    description:
      'Businesses that chose Echipa de Tocilari for web design, SEO, and digital marketing. Real partnerships, not empty slide decks.',
  },
  '/en/logo-design/': {
    title: 'Logo Design and Visual Identity | Echipa de Tocilari',
    description:
      'Logo design and visual identity: distinctive marks ready for web, print, and social. Brief, iterations, and production-ready files.',
  },
  '/en/google-ads-agency/': {
  "title": "Google Ads Agency: Services and Campaigns | Echipa de Tocilari",
  "description": "Bucharest Google Ads agency serving Romania. Search campaign setup, optimisation and reporting. Management from €99 / month, with ad spend paid separately."
},
};

export const enOrg = {
  description:
    'Digital marketing agency in Romania: website design, online stores, mobile and web apps, SEO services, Google Ads, Facebook Ads, and website maintenance.',
  knowsAbout: [
    'Website design',
    'Online store development',
    'Mobile app development',
    'SEO services',
    'Google Ads',
    'Facebook Ads',
    'Website maintenance',
    'Digital marketing',
  ],
  address: {
    streetAddress: 'Alexandru Zagoritz nr. 12, sector 2',
    addressLocality: 'Bucharest',
    postalCode: '021998',
    addressCountry: 'RO',
  },
};
