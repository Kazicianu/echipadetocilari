import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = ['group-a.json', 'group-b.json', 'group-c.json', 'group-root.json', 'group-d-extra.json'];
const evidence = files.flatMap(file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')).competitors.map(row => ({ ...row, evidenceFile: file })));
const selections = [
  ['codelab.ro', 1999, 'web', 'MVP', 'neprecizat', 'punct de pornire'],
  ['thewebdesigncompany.ro', 3000, 'web', 'MVP', 'neprecizat', 'de la'],
  ['noerror.ro', 10000, 'web', 'Bază platformă, module separat', 'conform contractului', 'bază de catalog'],
  ['docodex.com', 2990, 'web', 'Web App MVP', 'plus TVA', 'de la, orientativ'],
  ['casir.agency', 3999, 'mobil', 'Prima versiune MVP', 'inclus', 'de la, orientativ'],
  ['devlogic.ro', 3500, 'web', 'Aplicații web și SaaS', 'neprecizat', 'de la'],
  ['domarketing.ro', 4800, 'web', 'MVP web/SaaS', 'nu aplică TVA, conform furnizorului', 'de la'],
  ['dotkoda.com', 8000, 'web sau mobil', 'Aplicație custom', 'fără TVA', 'de la, orientativ'],
  ['aiosoftware.ro', 5000, 'mobil', 'Aplicație simplă', 'neprecizat', 'de la, orientativ'],
  ['webtopocket.com', 4900, 'mobil', 'Prima versiune', 'fără TVA', 'de la'],
  ['designcreatorlab.ro', 5000, 'web', 'MVP custom', 'formulare: finale, fără TVA', 'de la'],
  ['matrixit.ro', 2999, 'mobil', 'Mobile MVP, iOS sau Android', 'neprecizat', 'pachet public'],
  ['powercart.ro', 1900, 'web', 'Aplicație mică', 'fără TVA', 'de la'],
  ['avyron.ro', 1500, 'web sau mobil', 'Un flux, valoarea EUR din FAQ', 'neprecizat', 'de la, în FAQ'],
  ['webforge.org.ro', 5000, 'web', 'Web custom, interval 5.000-15.000', 'neprecizat', 'limita inferioară a intervalului'],
  ['zetatec.ro', 2499, 'web', 'Aplicații web/SaaS', 'neprecizat', 'de la'],
  ['sergiumarcu.ro', 1500, 'web', 'Aplicație simplă, CRUD', 'neprecizat', 'de la'],
  ['faintechsolutions.com', 5000, 'web sau mobil', 'MVP, interval 5.000-15.000', 'neprecizat', 'prag explicit și limită inferioară'],
  ['sevakdesign.ro', 900, 'web', 'MVP sau automatizare simplă', 'neprecizat', 'de la'],
  ['solutiiwebcompanii.ro', 4900, 'web', 'Aplicație, un flux principal', 'fără TVA', 'de la'],
];
const rows = selections.map(([domain, entryEUR, category, offer, vat, priceKind]) => {
  const source = evidence.find(row => row.domain === domain);
  assert(source, `Lipsește dovada pentru ${domain}`);
  const url = domain === 'noerror.ro' ? source.urls[0]
    : domain === 'dotkoda.com' ? 'https://dotkoda.com/preturi'
    : domain === 'aiosoftware.ro' ? 'https://aiosoftware.ro/dezvoltare-aplicatii-mobile/'
    : domain === 'matrixit.ro' ? 'https://matrixit.ro/packages'
    : domain === 'webforge.org.ro' ? 'https://webforge.org.ro/pricing'
    : source.urls[0];
  const features = Array.isArray(source.features) ? { 'Ofertă generală': source.features } : { ...source.features };
  for (const price of source.prices) {
    if (Array.isArray(price.features) && price.features.length) features[price.package || price.tier || price.segment] = price.features;
  }
  return { name: source.name, domain, entryEUR, category, offer, vat, priceKind, url, evidenceFile: source.evidenceFile, features, notes: source.notes };
});
const stats = values => {
  const sorted = [...values].sort((a,b) => a-b);
  const sum = values.reduce((a,b) => a+b,0);
  return { n: values.length, sumEUR: sum, meanEUR: sum/values.length, medianEUR: (sorted[Math.floor((sorted.length-1)/2)]+sorted[Math.ceil((sorted.length-1)/2)])/2, minEUR: sorted[0], maxEUR: sorted.at(-1) };
};
assert.equal(rows.length,20);
assert.equal(new Set(rows.map(r => r.domain)).size,20);
assert(rows.every(r => Number.isFinite(r.entryEUR) && r.entryEUR > 0));
const cohorts = {
  publicEntry20: stats(rows.map(r => r.entryEUR)),
  webOnly13: stats(rows.filter(r => r.category === 'web').map(r => r.entryEUR)),
  mobileOnly4: stats(rows.filter(r => r.category === 'mobil').map(r => r.entryEUR)),
  flexiblePlatform3: stats(rows.filter(r => r.category === 'web sau mobil').map(r => r.entryEUR)),
  webWithoutPlatformBase12: stats(rows.filter(r => r.category === 'web' && r.domain !== 'noerror.ro').map(r => r.entryEUR)),
  mobileEntry5WithDevLogic: stats([3999,5000,4900,2999,4000]),
  webSecondTier5: stats([5500,5000,5990,2900,10000]),
  mobileSecondTier3: stats([5999,7999,15000]),
  advancedExplicit4: stats([12000,25000,15000,30000]),
};
assert.equal(cohorts.publicEntry20.sumEUR,79386);
const proposals = [
  { name:'Start', fromEUR:4900, audience:'O primă versiune care validează un singur flux.', screens:5, roles:2, flows:1, integrations:0, bugFixDays:30,
    includes:['O aplicație web responsive sau mobilă cross-platform iOS și Android, stabilită în ofertă.', 'Maximum 5 ecrane principale, inventariate înainte de contract.', 'Un flux principal, două roluri: utilizator și administrator.', 'UX/UI, autentificare, bază de date, backend și panou de administrare simplu.', 'Emailuri tranzacționale pentru fluxul inclus; configurare lansare și monitorizare erori.', 'Testarea fluxului, predare cod, documentație și instruire.'],
    limits:['O singură interfață principală pentru utilizator, plus administrare simplă. Nu include simultan o aplicație web distinctă și una mobilă.', 'Fără plăți, abonamente, API de business extern, offline sau AI la pragul minim.', 'Cele 30 zile acoperă erorile față de specificație; funcțiile noi se estimează separat.'] },
  { name:'Business', fromEUR:9900, audience:'Un produs folosit zilnic, cu roluri și integrări.', screens:12, roles:3, flows:3, integrations:2, bugFixDays:60,
    includes:['Aplicație mobilă iOS și Android cu administrare web extinsă sau aplicație web de business.', 'Maximum 12 ecrane principale, 3 fluxuri și 3 roluri.', 'Design dedicat, drepturi pe roluri, căutare și filtrare.', 'Un modul de plăți standard sau programări, plus notificări push și email aferente.', 'Până la 2 integrări standard, cu API documentat și acces furnizat de client; procesatorul de plăți consumă una dintre ele.', 'Rapoarte de bază, export CSV, staging, teste automate pentru fluxurile critice, monitorizare și backup configurat.', 'Cod, documentație, instruire și 60 zile corecții.'],
    limits:['O integrare de business înseamnă un sistem extern și fluxurile scrise în ofertă, de exemplu plăți, CRM sau facturare. Emailul tranzacțional, push, autentificarea, monitorizarea și serviciile de infrastructură nu consumă acest plafon. Taxele terților sunt separate.', 'Nu include abonamente recurente complexe, marketplace, ERP fără API sau sincronizare offline.', 'Canalele și furnizorii de notificări se aleg înainte de ofertare.'] },
  { name:'Avansat', fromEUR:19900, audience:'Portaluri, SaaS și platforme dezvoltate pe etape.', screens:20, roles:5, flows:5, integrations:3, bugFixDays:90,
    includes:['Tot ce include Business, cu limitele totale și opțiunile extinse de mai jos.', 'Până la 20 ecrane principale, 5 fluxuri și 5 roluri, confirmate după analiza cerințelor.', 'Portal clienți, platformă SaaS sau aplicație web cu mobil, în configurația agreată.', 'Un modul avansat: organizații multiple, abonamente recurente sau automatizare AI delimitată.', 'Până la 3 integrări de business standard în total, incluzând cele din Business și API-ul AI dacă este ales.', 'Istoric operațiuni, rapoarte și exporturi, mediu de test, lansare pe etape.', 'Teste pe fluxuri, verificări de securitate și încărcare potrivite scopului, documentație și instruire.', '90 zile corecții ale erorilor din livrarea agreată.'],
    limits:['Limitele Avansat înlocuiesc plafoanele Business; nu se adună. Avansat include modulul Business de plăți standard sau programări, plus un singur modul avansat ales.', 'Varianta AI include un singur flux, o sursă de date agreată și un furnizor API, care consumă una dintre cele 3 integrări; consumul se achită separat.', 'Marketplace complet, reconciliere plăți pentru vânzători, offline complex, ERP complex și migrări ample primesc estimare distinctă.', 'SLA și intervențiile permanente sunt abonamente separate. Nu se promit funcții nelimitate.'] },
];
const caveats = [
  'Media de 20 descrie valorile publice de intrare afișate, nu facturi, cotații pentru același brief sau costul mediu al proiectelor din România.',
  'Eșantionul este selectat intenționat dintre furnizori care afișează prețuri; include agenții, studiouri și furnizori individuali. Nu este topul concurenților după trafic sau cotă de piață.',
  'Sunt numărate 20 firme distincte, cu o singură valoare EUR per firmă în media principală. Nu s-au făcut conversii valutare, medii de intervale ori conversii de TVA.',
  'TVA nu este uniform: Casîr include TVA, unii publică sume fără TVA, alții nu precizează. Media nominală nu poate fi prezentată drept medie netă sau brută omogenă.',
  'NOERROR este bază de platformă fără module, Sevak este MVP sau automatizare minimă, Matrix MVP este pentru o singură platformă. Scope-ul lor diferă de aplicațiile iOS și Android cu backend.',
  'Faintech și WebForge contribuie cu limita inferioară, nu cu mijlocul intervalului. Avyron contribuie cu valoarea EUR din FAQ; cardul principal afișează 7.900 RON.',
  'Pentru CODELAB, Docodex și Casîr deschiderea directă prin web a eșuat. S-au citit rezultate indexate ale paginilor proprii, datate anterior verificării; prețurile necesită reconfirmare înaintea unei decizii contractuale.',
  'Reperele pe trepte au eșantioane diferite și scope diferit. Nu există 20 prețuri comparabile pentru fiecare dintre Start, Business și Avansat.',
  'Pachetele Echipa de Tocilari sunt propuneri comerciale, cu limite recomandate de noi. Nu sunt o ofertă existentă, un calcul al costurilor echipei sau o garanție de marjă. Prețurile propuse sunt fără TVA; tratamentul efectiv se precizează în ofertă.',
];
const excluded = evidence.filter(r => !rows.some(x => x.domain === r.domain)).map(r => ({name:r.name,domain:r.domain,urls:r.urls,notes:r.notes}));
const result = { checkedAt:'2026-10-17', question:'Prețuri și servicii pentru pachetele /dezvoltare-aplicatii/', rows, cohorts, cohortDefinitions:{
  webOnly13:'Cele 13 intrări web din eșantion, inclusiv baza NOERROR.',
  mobileOnly4:'Cele 4 intrări explicit mobile din eșantionul principal.',
  flexiblePlatform3:'dotKoda, Avyron și Faintech, pentru care platforma depinde de ofertă.',
  webWithoutPlatformBase12:'Cele 12 intrări web fără baza de platformă NOERROR.',
  mobileEntry5WithDevLogic:'Casîr 3999, AIO 5000, Webtopocket 4900, Matrix IT 2999 și pragul mobil separat DevLogic 4000 EUR. Nicio firmă nu apare de două ori în această cohortă.',
  webSecondTier5:'CODELAB Product 5500, TWDC Standard 5000, Docodex Growth 5990, PowerCart mediu 2900, Faintech Standard limita inferioară 10000 EUR.',
  mobileSecondTier3:'Casîr integrat 5999, Matrix Professional 7999, AIO mediu 15000 EUR. Casîr include TVA.',
  advancedExplicit4:'CODELAB Scale 12000, DCL SaaS 25000, WebForge Enterprise 15000, AIO complex 30000 EUR. Serviciile diferă substanțial.'
}, proposals, caveats, excluded };
fs.writeFileSync(path.join(dir,'comparison.json'),JSON.stringify(result,null,2)+'\n');

const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const eur = value => new Intl.NumberFormat('ro-RO',{maximumFractionDigits:2}).format(value)+' €';
const list = values => '<ul>'+values.map(v => '<li>'+esc(v)+'</li>').join('')+'</ul>';
const featureText = value => Array.isArray(value) ? value.join('; ') : Object.entries(value).map(([k,v]) => k+': '+v.join(', ')).join('; ');
const table = rows.map((r,i) => `<tr><td>${i+1}. <a href="${esc(r.url)}">${esc(r.name)}</a><br><small>${esc(r.domain)}</small></td><td class="number">${eur(r.entryEUR)}</td><td>${esc(r.category)}<br>${esc(r.offer)}</td><td>${esc(r.vat)}<br><small>${esc(r.priceKind)}</small></td><td>${esc(featureText(r.features))}<details><summary>Limite și verificare</summary>${list(r.notes)}<p>Dovadă: ${esc(r.evidenceFile)}</p></details></td></tr>`).join('');
const html = `<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Research pachete aplicații, 17 octombrie 2026</title><style>
:root{color-scheme:light;--orange:#fd8649;--ink:#242424}*{box-sizing:border-box}body{margin:0;background:#fff;color:var(--ink);font:16px/1.6 system-ui,sans-serif}main{max-width:1250px;margin:auto;padding:32px 20px 70px}h1{font-size:clamp(28px,5vw,44px);line-height:1.2;max-width:900px}h2{font-size:27px;margin-top:45px}h3{font-size:22px;margin:0}a{color:inherit;text-decoration:underline;text-underline-offset:3px}a:focus-visible,summary:focus-visible{outline:3px solid var(--orange);outline-offset:4px}.kicker{font-weight:650}.numbers,.packages{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.stat,.package{padding:20px;border:1px solid #ddd;border-radius:14px}.stat strong{font-size:30px;display:block}.package.recommended{border:3px solid var(--orange)}.price{font-size:28px;margin:8px 0}.label{display:inline-block;background:var(--orange);padding:4px 12px;border-radius:20px;font-weight:650}.muted,small{color:#565656}ul{padding-left:22px}.table-wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:880px;font-size:14px}th,td{padding:14px 10px;text-align:left;vertical-align:top;border-bottom:1px solid #ddd}th{background:#f5f5f5}td.number{white-space:nowrap;font-variant-numeric:tabular-nums;font-weight:650}details{margin-top:8px}summary{min-height:44px;display:list-item;padding:10px 0}blockquote{margin:20px 0;padding:15px 20px;border-left:5px solid var(--orange);background:#f8f8f8}.evidence{margin-top:35px;padding-top:20px;border-top:1px solid #ddd}@media(max-width:780px){.numbers,.packages{grid-template-columns:1fr}main{padding-top:22px}.price{font-size:26px}}@media print{main{max-width:none}.package,.stat{break-inside:avoid}.table-wrap{overflow:visible}table{min-width:0;font-size:10px}a{text-decoration:none}details{display:block}}
</style></head><body><main><p class="kicker">Echipa de Tocilari · Research comercial · 17 octombrie 2026</p><h1>Pachete pentru dezvoltare de aplicații, pornind de la 20 de competitori</h1><p>Recomandare pentru pagina <code>/dezvoltare-aplicatii/</code>: <strong>Start de la 4.900 €, Business de la 9.900 €, Avansat de la 19.900 €</strong>, cu funcții și limite scrise. Acestea sunt propuneri, înainte de aprobarea ofertei și verificarea costurilor interne.</p><div class="numbers"><div class="stat">Media nominală a pragurilor, 20 firme<strong>${eur(cohorts.publicEntry20.meanEUR)}</strong>Prețuri afișate, TVA neuniform</div><div class="stat">Mediana acelorași 20 praguri<strong>${eur(cohorts.publicEntry20.medianEUR)}</strong>O valoare per firmă</div><div class="stat">Prag mobil, cohortă de 5 firme<strong>${eur(cohorts.mobileEntry5WithDevLogic.meanEUR)}</strong>Include pragul mobil DevLogic</div></div><blockquote>Media de ${eur(cohorts.publicEntry20.meanEUR)} este media pragurilor publice afișate. Nu este prețul mediu al unui proiect echivalent și nu poate fi prezentată ca medie fără TVA.</blockquote><h2>Ce arată reperele pe complexitate</h2><p>Web fără baza de platformă NOERROR: ${eur(cohorts.webWithoutPlatformBase12.meanEUR)}, 12 firme. Al doilea nivel web: ${eur(cohorts.webSecondTier5.meanEUR)}, 5 firme. Al doilea nivel mobil: ${eur(cohorts.mobileSecondTier3.meanEUR)}, 3 firme. Pachete avansate explicite: ${eur(cohorts.advancedExplicit4.meanEUR)}, 4 firme. Cohortele folosesc ofertele nominale și nu reprezintă același brief.</p><p>Start la 4.900 € este apropiat de reperul mobil de intrare. Business la 9.900 € urmărește nivelul mobil intermediar, iar Avansat la 19.900 € se apropie de reperul de 20.500 € al celor patru pachete complexe. Rotunjirea și limitele sunt decizii comerciale propuse, nu rezultate matematice impuse de piață. Marja rămâne de verificat pe efortul echipei.</p><h2>Propunerea concretă de pachete</h2><div class="packages">${proposals.map(p => `<article class="package ${p.name==='Business'?'recommended':''}">${p.name==='Business'?'<span class="label">Recomandat</span>':''}<h3>${p.name}</h3><p class="price">de la ${eur(p.fromEUR)}</p><p>${esc(p.audience)}</p>${list(p.includes)}<details><summary>Limite la prețul de pornire</summary>${list(p.limits)}</details></article>`).join('')}</div><h2>Condiții comune propuse</h2>${list(['Analiza cerințelor, lista ecranelor și criteriile de acceptare se stabilesc înainte de contract. Limitele sunt plafoane orientative, nu promisiuni că orice funcție încape în ele.', 'Inventarul ecranelor include autentificarea și administrarea atunci când au interfețe distincte. Fluxul descrie o operațiune de business completă, de exemplu o programare sau o cerere.', 'Toate nivelurile includ design, backend și baza de date necesare, testare, configurarea publicării, cod sursă, documentație și instruire.', 'Publicarea în App Store și Google Play înseamnă pregătirea și trimiterea aplicației și corectarea problemelor din implementarea agreată. Aprobarea finală aparține magazinelor.', 'Două runde de ajustări de design înainte de dezvoltare. Modificările de cerințe și funcțiile noi primesc estimare separată.', 'Hosting, baze de date și stocare găzduite, domeniu, licențe, servicii email/SMS/push, conturi Apple/Google, comisioane de plăți și consum API/AI sunt separate, pe conturile clientului.', 'Corecțiile de 30/60/90 zile se raportează la specificația livrată. Mentenanța, actualizările pentru versiuni noi de sistem și SLA se stabilesc separat.', 'Prețurile propuse sunt fără TVA. Regimul efectiv de facturare trebuie precizat explicit în oferta finală.'])}<h2>De unde provin serviciile propuse</h2>${list(['UX/UI, autentificare, backend, bază de date și administrare: observate la CODELAB, Docodex, Faintech, Sergiu Marcu și alți furnizori din tabel.', 'Roluri, plăți, notificări și integrări: apar în treptele superioare CODELAB, Matrix IT, AIO, Casîr și Faintech.', 'Organizații multiple, SaaS, AI și integrări complexe: apar la DCL, WebForge, Do Marketing și AIO. Nu rezultă că toate sunt incluse simultan la pragul minim.', 'Predarea codului, documentație, testare și suport după lansare: recurente în ofertele comparate. Perioadele diferă, de aceea recomandăm explicit 30/60/90 zile.'])}<h2>Cei 20 de competitori incluși în medie</h2><p>Fiecare nume deschide sursa oficială. Serviciile din ultima coloană descriu oferta generală sau treptele furnizorului și nu trebuie atribuite integral prețului minim.</p><div class="table-wrap"><table><thead><tr><th>Competitor și sursă</th><th>Prag EUR</th><th>Oferta măsurată</th><th>TVA și tip preț</th><th>Servicii observate</th></tr></thead><tbody>${table}</tbody></table></div><h2>Limite care schimbă interpretarea</h2>${list(caveats)}<h2>Furnizori verificați, excluși din media de 20</h2>${list(excluded.map(r => r.name+': '+r.notes.join(' ')))}<p>Rezervele Graphic Beast și Leo Nicolae sunt documentate separat în group-c.json. Articolele generale despre costul pieței, tarifele orare și abonamentele de mentenanță nu au fost folosite ca prețuri de proiect.</p><h2>Ce trebuie schimbat în pagina actuală după aprobarea ofertei</h2>${list(['Înlocuirea valorilor [PREȚ] și [N] din secțiunea #cost și din FAQ cu pachetele aprobate.', 'Precizarea platformei și backend-ului, a ecranelor, fluxurilor, rolurilor și integrărilor, în loc de formulări nelimitate.', 'Separarea taxelor recurente de corecțiile incluse și explicarea publicării în magazine.', 'Actualizarea consecventă a textelor și a datelor structurate din pipeline, după definitivarea comercială.', 'Verificare vizuală la 360 și 390 px și desktop, FAQ și formular fără trimitere reală, apoi build. PUBLIC_INDEXABLE rămâne neschimbat.'])}<p>Pagina și strategia SEO nu au fost modificate în această etapă de research. Valorile propuse nu au fost transformate în ofertă publicată.</p><div class="evidence"><p><strong>Calcul reproductibil:</strong> <code>node docs/research/aplicatii-2026-10-17/analyze.mjs</code>. Intrări: cele cinci fișiere group. Rezultatul structurat complet este <code>comparison.json</code>.</p><p>Formula mediei principale: ${cohorts.publicEntry20.sumEUR} EUR / ${cohorts.publicEntry20.n} firme = ${eur(cohorts.publicEntry20.meanEUR)}. Datele sunt verificări ale unor prețuri publice la 17.10.2026, cu limitele de acces menționate; nu sunt cotații primite de la furnizori.</p></div></main></body></html>`;
assert(!/[\u2014\u2196-\u2199]/u.test(html));
fs.writeFileSync(path.join(dir,'research.html'),html);
console.log(JSON.stringify({rows:rows.length,cohorts,outputs:['comparison.json','research.html']},null,2));
