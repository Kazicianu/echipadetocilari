/**
 * Merge competitor Internal-HTML CSVs + Google Autocomplete + Keyword Planner
 * volumes into the master list and the keyword → page mapping.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadVolumes } from './volumes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sfDir = path.join(root, 'docs/keyword-research/sf-competitors');
const suggestFile = path.join(root, 'docs/keyword-research/google-suggest-ro.csv');
const outCsv = path.join(root, 'docs/keyword-research/lista-master-keywords.csv');
const outMap = path.join(root, 'docs/keyword-research/mapare-pagini.md');

function parseCsv(text) {
  const rows = [];
  let i = 0;
  const len = text.length;
  const next = () => {
    const row = [];
    let cur = '';
    let q = false;
    for (; i < len; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            cur += '"';
            i++;
          } else q = false;
        } else cur += c;
      } else if (c === '"') q = true;
      else if (c === ',') {
        row.push(cur);
        cur = '';
      } else if (c === '\n') {
        i++;
        row.push(cur.replace(/\r$/, ''));
        return row;
      } else cur += c;
    }
    if (cur || row.length) {
      row.push(cur.replace(/\r$/, ''));
      return row;
    }
    return null;
  };
  const header = next();
  if (!header) return [];
  const idx = Object.fromEntries(header.map((h, n) => [h.trim(), n]));
  let row;
  while ((row = next())) {
    rows.push({
      url: row[idx.Address] || '',
      status: row[idx['Status Code']] || '',
      title: row[idx['Title 1']] || '',
      h1: row[idx['H1-1']] || '',
      desc: row[idx['Meta Description 1']] || '',
    });
  }
  return rows;
}

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const files = readdirSync(sfDir).filter((f) => f.endsWith('.csv'));
const byDomain = {};
for (const f of files) {
  const domain = f.replace(/\.csv$/, '');
  byDomain[domain] = parseCsv(readFileSync(path.join(sfDir, f), 'utf8'));
}

const suggest = new Set();
for (const line of readFileSync(suggestFile, 'utf8').split(/\r?\n/).slice(1)) {
  const m = line.match(/,"([^"]+)"\s*$/) || line.match(/,(.+)$/);
  if (m) suggest.add(norm(m[1]));
}

function competitorHits(needle) {
  const n = norm(needle);
  const hits = [];
  for (const [domain, pages] of Object.entries(byDomain)) {
    const hit = pages.some((p) => {
      const blob = `${p.url} ${p.title} ${p.h1}`;
      return norm(blob).includes(n);
    });
    if (hit) hits.push(domain);
  }
  return hits;
}

const OWNED = {
  home: '/',
  site: '/creare-site-web/',
  seo: '/servicii-seo/',
  admin: '/administrare-site/',
  ppc: '/pay-per-click/',
  logo: '/logo-design/',
  port: '/portofoliu/',
  svc: '/services/',
  about: '/despre-noi/',
  clients: '/clients/',
  contact: '/contact/',
};

/**
 * Pages we do not have yet. The string doubles as the label in the mapping doc,
 * so it must stay stable: records group by this exact value.
 *
 * `appWeb` is deliberately not a page. Planner shows no demand for the whole
 * cluster (`creare aplicatie web` returns no data at all), so the service lives
 * as a section and gets no SEO page.
 */
const NEW = {
  magazin: 'de creat: /creare-magazin-online/',
  facebook: 'de creat: /agentie-facebook-ads/',
  mobile: 'de creat: /dezvoltare-aplicatii-mobile/',
  preturi: 'de creat: /preturi/',
  auditSeo: 'de creat: /audit-seo-gratuit/',
  seoLocal: 'de creat: /seo-local/',
  blog: 'de creat: articol blog',
  appWeb: 'secțiune pe /services/, fără pagină SEO',
};

/** Real volume, wrong buyer. Kept in the list so nobody re-discovers it later. */
const NOT_TARGETED = 'nu urmărim: alt cumpărător';

/** Curated commercial keywords — mapped after competitor + autocomplete evidence. */
const KEYWORDS = [
  // Cluster creare site
  ['creare site web', 'creare-site', 'comercial', OWNED.site, 'P0', 'avem', 'Creare site web București | prezentare și landing page', 'Creare site web de prezentare în București'],
  ['creare site', 'creare-site', 'comercial', OWNED.site, 'P0', 'avem', '', ''],
  ['creare site de prezentare', 'creare-site', 'comercial', OWNED.site, 'P0', 'avem', '', ''],
  ['realizare site web', 'creare-site', 'comercial', OWNED.site, 'P1', 'avem', '', ''],
  ['web design bucuresti', 'creare-site', 'comercial', OWNED.site, 'P0', 'avem', '', ''],
  ['creare site wordpress', 'creare-site', 'comercial', OWNED.site, 'P1', 'avem', '', ''],
  ['creare landing page', 'creare-site', 'comercial', OWNED.site, 'P1', 'avem', '', ''],
  ['creare site firma', 'creare-site', 'comercial', OWNED.site, 'P1', 'avem', '', ''],
  ['firma creare site web', 'creare-site', 'comercial', OWNED.site, 'P1', 'avem', '', ''],
  ['creare magazin online', 'magazin-online', 'comercial', NEW.magazin, 'P0', 'nu', 'Creare magazin online | WordPress și Shopify', 'Creare magazin online pentru afacerea ta'],
  ['creare site web bucuresti', 'creare-site', 'comercial', OWNED.site, 'P0', 'avem', '', ''],
  ['site de prezentare pret', 'pret', 'comercial', NEW.preturi, 'P0', 'nu', '', ''],
  ['refacere site', 'creare-site', 'comercial', OWNED.site, 'P2', 'avem', '', ''],
  ['redesign site', 'creare-site', 'comercial', OWNED.site, 'P2', 'avem', '', ''],
  // SEO
  ['servicii seo', 'seo', 'comercial', OWNED.seo, 'P0', 'avem', 'Servicii SEO București | optimizare site Google', 'Servicii de optimizare SEO pentru Google'],
  ['optimizare seo', 'seo', 'comercial', OWNED.seo, 'P0', 'avem', '', ''],
  ['agentie seo', 'seo', 'comercial', OWNED.seo, 'P0', 'avem', '', ''],
  ['agentie seo bucuresti', 'seo', 'comercial', OWNED.seo, 'P0', 'avem', '', ''],
  ['servicii seo bucuresti', 'seo', 'comercial', OWNED.seo, 'P0', 'avem', '', ''],
  ['audit seo', 'seo', 'comercial', NEW.auditSeo, 'P0', 'nu', 'Audit SEO gratuit | Echipa de Tocilari', 'Audit SEO gratuit pentru site-ul tău'],
  ['audit seo gratuit', 'seo', 'comercial', NEW.auditSeo, 'P0', 'nu', '', ''],
  ['seo local', 'seo', 'comercial', NEW.seoLocal, 'P1', 'nu', 'SEO local București | Google Business Profile', 'SEO local pentru afaceri din București'],
  ['optimizare seo magazin online', 'seo', 'comercial', OWNED.seo, 'P1', 'avem', '', ''],
  ['consultant seo', 'seo', 'comercial', OWNED.seo, 'P1', 'avem', '', ''],
  ['optimizare site google', 'seo', 'comercial', OWNED.seo, 'P1', 'avem', '', ''],
  ['servicii seo ai', 'seo', 'comercial', OWNED.seo, 'P2', 'avem', '', ''],
  // PPC
  ['google ads', 'ppc', 'comercial', OWNED.ppc, 'P0', 'avem', 'Campanii Google Ads București | administrare PPC', 'Campanii Google Ads'],
  ['agentie google ads', 'ppc', 'comercial', OWNED.ppc, 'P0', 'avem', '', ''],
  ['campanii google ads', 'ppc', 'comercial', OWNED.ppc, 'P0', 'avem', '', ''],
  ['promovare google', 'ppc', 'comercial', OWNED.ppc, 'P1', 'avem', '', ''],
  ['administrare google ads', 'ppc', 'comercial', OWNED.ppc, 'P1', 'avem', '', ''],
  ['facebook ads', 'social-ads', 'comercial', NEW.facebook, 'P2', 'nu', '', ''],
  ['meta ads', 'social-ads', 'comercial', NEW.facebook, 'P2', 'nu', '', ''],
  ['pay per click', 'ppc', 'comercial', OWNED.ppc, 'P2', 'avem', '', ''],
  ['promovare site pe google', 'ppc', 'comercial', OWNED.ppc, 'P1', 'avem', '', ''],
  // Mentenanță
  ['administrare site', 'mentenanta', 'comercial', OWNED.admin, 'P0', 'avem', 'Administrare și mentenanță site | Echipa de Tocilari', 'Administrare și mentenanță site web'],
  ['mentenanta site', 'mentenanta', 'comercial', OWNED.admin, 'P0', 'avem', '', ''],
  ['mentenanta wordpress', 'mentenanta', 'comercial', OWNED.admin, 'P1', 'avem', '', ''],
  ['mentenanta site web', 'mentenanta', 'comercial', OWNED.admin, 'P0', 'avem', '', ''],
  ['optimizare viteza site', 'mentenanta', 'comercial', OWNED.admin, 'P1', 'avem', '', ''],
  ['securitate site', 'mentenanta', 'comercial', OWNED.admin, 'P2', 'avem', '', ''],
  ['migrare site', 'mentenanta', 'comercial', OWNED.admin, 'P2', 'avem', '', ''],
  ['abonament mentenanta site', 'mentenanta', 'comercial', OWNED.admin, 'P1', 'avem', '', ''],
  ['cat costa mentenanta unui site', 'mentenanta', 'comercial', OWNED.admin, 'P1', 'avem', '', ''],
  // Agenție
  ['agentie marketing online', 'agentie', 'comercial', OWNED.home, 'P0', 'avem', 'Agenție marketing online București | Echipa de Tocilari', 'Agenție de marketing online și dezvoltare web în București'],
  ['agentie marketing digital', 'agentie', 'comercial', OWNED.home, 'P0', 'avem', '', ''],
  ['agentie marketing bucuresti', 'agentie', 'comercial', OWNED.home, 'P0', 'avem', '', ''],
  ['agentie marketing online bucuresti', 'agentie', 'comercial', OWNED.home, 'P0', 'avem', '', ''],
  ['promovare online', 'agentie', 'comercial', OWNED.home, 'P1', 'avem', '', ''],
  ['marketing online firme mici', 'agentie', 'comercial', OWNED.home, 'P2', 'avem', '', ''],
  ['strategie marketing digital', 'agentie', 'comercial', OWNED.svc, 'P2', 'avem', '', ''],
  ['agentie web design bucuresti', 'agentie', 'comercial', OWNED.home, 'P0', 'avem', '', ''],
  // Preț
  ['cat costa un site web', 'pret', 'comercial', NEW.preturi, 'P0', 'nu', 'Cât costă un site web în 2026 | prețuri orientative', 'Cât costă un site web în România'],
  ['pret creare site', 'pret', 'comercial', NEW.preturi, 'P0', 'nu', '', ''],
  ['creare site pret', 'pret', 'comercial', NEW.preturi, 'P0', 'nu', '', ''],
  ['cat costa seo', 'pret', 'comercial', NEW.preturi, 'P0', 'nu', '', ''],
  ['pret optimizare seo', 'pret', 'comercial', NEW.preturi, 'P0', 'nu', '', ''],
  ['servicii seo pret', 'pret', 'comercial', NEW.preturi, 'P1', 'nu', '', ''],
  ['cat costa un magazin online', 'pret', 'comercial', NEW.preturi, 'P0', 'nu', '', ''],
  ['administrare site pret', 'pret', 'comercial', NEW.preturi, 'P1', 'nu', '', ''],
  ['mentenanta site pret', 'pret', 'comercial', NEW.preturi, 'P1', 'nu', '', ''],
  ['seo sau google ads', 'pret', 'informational', NEW.blog, 'P1', 'nu', '', ''],
  // Informațional
  ['ce este seo', 'info', 'informational', NEW.blog, 'P2', 'nu', '', ''],
  ['cum apari pe prima pagina google', 'info', 'informational', NEW.blog, 'P1', 'nu', '', ''],
  ['cum imi fac magazin online', 'info', 'informational', NEW.blog, 'P2', 'nu', '', ''],
  ['cum optimizez google business profile', 'info', 'informational', NEW.seoLocal, 'P2', 'nu', '', ''],
  ['greseli seo', 'info', 'informational', NEW.blog, 'P2', 'nu', '', ''],
  ['cum aleg o agentie de marketing', 'info', 'informational', OWNED.about, 'P2', 'avem', '', ''],
  // Verticale
  ['creare site restaurant', 'verticale', 'comercial', 'de creat: /site-web-restaurant/', 'P1', 'nu', '', ''],
  ['site pentru restaurant', 'verticale', 'comercial', 'de creat: /site-web-restaurant/', 'P1', 'nu', '', ''],
  ['creare site cabinet stomatologic', 'verticale', 'comercial', 'de creat: /site-web-cabinet-stomatologic/', 'P1', 'nu', '', ''],
  ['site pentru cabinet stomatologic', 'verticale', 'comercial', 'de creat: /site-web-cabinet-stomatologic/', 'P1', 'nu', '', ''],
  ['site pentru clinica veterinara', 'verticale', 'comercial', 'de creat: /site-web-clinica-veterinara/', 'P1', 'nu', '', ''],
  ['site pentru pensiune', 'verticale', 'comercial', 'de creat: /site-web-pensiune-hotel/', 'P2', 'nu', '', ''],
  ['seo pentru avocati', 'verticale', 'comercial', 'de creat: /seo-pentru-avocati/', 'P2', 'nu', '', ''],
  ['creare site avocat', 'verticale', 'comercial', 'de creat: /seo-pentru-avocati/', 'P2', 'nu', '', ''],
  ['creare site agentie imobiliara', 'verticale', 'comercial', 'de creat: verticală imobiliare', 'P2', 'nu', '', ''],
  ['site pentru salon', 'verticale', 'comercial', 'de creat: verticală salon', 'P2', 'nu', '', ''],
  // Brand / trust pages
  ['logo design', 'brand', 'comercial', OWNED.logo, 'P1', 'avem', 'Logo design și identitate vizuală | Echipa de Tocilari', 'Logo design și identitate vizuală'],
  ['creare logo', 'brand', 'comercial', OWNED.logo, 'P1', 'avem', '', ''],
  ['identitate vizuala', 'brand', 'comercial', OWNED.logo, 'P2', 'avem', '', ''],
  ['portofoliu web design', 'brand', 'navigational', OWNED.port, 'P2', 'avem', 'Portofoliu web design | Echipa de Tocilari', 'Portofoliu de web design'],
  ['contact agentie marketing', 'brand', 'navigational', OWNED.contact, 'P2', 'avem', 'Contact | consultație marketing București', 'Contactează agenția de marketing online'],

  // ── Runda 2 (2026-08-28): serviciile noi ────────────────────────────────
  // Poziționare. `agentie digitala` are doar 50/lună, deci nu poate fi H1;
  // `agentie marketing online` + `dezvoltare web` au 500 fiecare.
  ['agentie web design', 'agentie', 'comercial', OWNED.home, 'P0', 'avem', '', ''],
  ['dezvoltare web', 'agentie', 'comercial', OWNED.home, 'P0', 'avem', '', ''],
  ['agentie de marketing online', 'agentie', 'comercial', OWNED.home, 'P0', 'avem', '', ''],
  ['agentie de marketing digital', 'agentie', 'comercial', OWNED.home, 'P1', 'avem', '', ''],
  ['agentii marketing online', 'agentie', 'comercial', OWNED.home, 'P1', 'avem', '', ''],
  ['agentie digitala', 'agentie', 'comercial', OWNED.home, 'P2', 'avem', '', ''],
  ['agentie digitala bucuresti', 'agentie', 'comercial', OWNED.home, 'P2', 'avem', '', ''],
  ['agentie digital', 'agentie', 'comercial', OWNED.home, 'P2', 'avem', '', ''],
  ['agentie dezvoltare web', 'agentie', 'comercial', OWNED.home, 'P2', 'avem', '', ''],
  ['agentie performance marketing', 'agentie', 'comercial', OWNED.home, 'P2', 'avem', '', ''],
  ['servicii digitale', 'agentie', 'comercial', OWNED.svc, 'P2', 'avem', '', ''],
  ['servicii it pentru firme', 'agentie', 'comercial', OWNED.svc, 'P2', 'avem', '', ''],
  // Volum real, dar cumpărător de outsourcing IT, nu clientul nostru.
  ['firma it bucuresti', 'adiacent', 'comercial', NOT_TARGETED, 'P2', 'nu', '', ''],
  ['externalizare it', 'adiacent', 'comercial', NOT_TARGETED, 'P2', 'nu', '', ''],
  ['firma software', 'adiacent', 'comercial', NOT_TARGETED, 'P2', 'nu', '', ''],
  ['firma software bucuresti', 'adiacent', 'comercial', NOT_TARGETED, 'P2', 'nu', '', ''],
  ['firma de software', 'adiacent', 'comercial', NOT_TARGETED, 'P2', 'nu', '', ''],
  ['companie software', 'adiacent', 'comercial', NOT_TARGETED, 'P2', 'nu', '', ''],
  ['firma software cluj', 'adiacent', 'comercial', NOT_TARGETED, 'P2', 'nu', '', ''],
  // Magazin online: clusterul cu cea mai mare cerere confirmată.
  ['creare site magazin online', 'magazin-online', 'comercial', NEW.magazin, 'P0', 'nu', '', ''],
  ['creare magazine online', 'magazin-online', 'comercial', NEW.magazin, 'P0', 'nu', '', ''],
  ['realizare magazin online', 'magazin-online', 'comercial', NEW.magazin, 'P0', 'nu', '', ''],
  ['creare magazin online bucuresti', 'magazin-online', 'comercial', NEW.magazin, 'P0', 'nu', '', ''],
  ['creare magazin online wordpress', 'magazin-online', 'comercial', NEW.magazin, 'P0', 'nu', '', ''],
  ['creare magazin online shopify', 'magazin-online', 'comercial', NEW.magazin, 'P0', 'nu', '', ''],
  ['creare magazin online la cheie', 'magazin-online', 'comercial', NEW.magazin, 'P0', 'nu', '', ''],
  ['magazin online la cheie', 'magazin-online', 'comercial', NEW.magazin, 'P0', 'nu', '', ''],
  ['creare magazin online magento', 'magazin-online', 'comercial', NEW.magazin, 'P1', 'nu', '', ''],
  ['creare magazin magento', 'magazin-online', 'comercial', NEW.magazin, 'P1', 'nu', '', ''],
  ['realizare magazin online magento', 'magazin-online', 'comercial', NEW.magazin, 'P1', 'nu', '', ''],
  ['dezvoltare magazin online', 'magazin-online', 'comercial', NEW.magazin, 'P2', 'nu', '', ''],
  ['firma creare magazin online', 'magazin-online', 'comercial', NEW.magazin, 'P2', 'nu', '', ''],
  ['creare site ecommerce', 'magazin-online', 'comercial', NEW.magazin, 'P2', 'nu', '', ''],
  ['dezvoltare ecommerce', 'magazin-online', 'comercial', NEW.magazin, 'P2', 'nu', '', ''],
  // `woocommerce` nu are date, `wordpress` are 500: clientul nu știe pluginul.
  ['creare magazin online woocommerce', 'magazin-online', 'comercial', NEW.magazin, 'P2', 'nu', '', ''],
  ['creare magazin online cluj', 'magazin-online', 'comercial', NEW.magazin, 'P2', 'nu', '', ''],
  ['migrare magazin online', 'magazin-online', 'comercial', NEW.magazin, 'P2', 'nu', '', ''],
  ['optimizare magazin online', 'magazin-online', 'comercial', OWNED.seo, 'P1', 'avem', '', ''],
  ['creare magazin online pret', 'pret', 'comercial', NEW.preturi, 'P0', 'nu', '', ''],
  ['magazin online preturi', 'pret', 'comercial', NEW.preturi, 'P2', 'nu', '', ''],
  // Aplicații mobile: `dezvoltare aplicatii mobile` e singurul termen cu 500.
  ['dezvoltare aplicatii mobile', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P0', 'nu', 'Dezvoltare aplicații mobile | Android și iOS', 'Dezvoltare aplicații mobile'],
  ['creare aplicatie mobila', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P1', 'nu', '', ''],
  ['dezvoltare aplicatie mobila', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P1', 'nu', '', ''],
  ['creare aplicatie android', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P1', 'nu', '', ''],
  ['creare aplicatie ios', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P1', 'nu', '', ''],
  ['realizare aplicatii mobile', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P2', 'nu', '', ''],
  ['dezvoltare aplicatii mobil', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P2', 'nu', '', ''],
  ['dezvoltare aplicatie android', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P2', 'nu', '', ''],
  ['dezvoltare aplicatie ios', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P2', 'nu', '', ''],
  ['dezvoltare aplicatii ios', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P2', 'nu', '', ''],
  ['aplicatii mobile la comanda', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P2', 'nu', '', ''],
  ['firma dezvoltare aplicatii mobile', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P2', 'nu', '', ''],
  ['aplicatie mobila pentru firma', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P2', 'nu', '', ''],
  ['creare aplicatie telefon', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P2', 'nu', '', ''],
  ['creare aplicatie mobila bucuresti', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P2', 'nu', '', ''],
  ['firma aplicatii mobile bucuresti', 'aplicatii-mobile', 'comercial', NEW.mobile, 'P2', 'nu', '', ''],
  ['cat costa o aplicatie mobila', 'pret', 'comercial', NEW.preturi, 'P1', 'nu', '', ''],
  ['pret aplicatie mobila', 'pret', 'comercial', NEW.preturi, 'P2', 'nu', '', ''],
  // Aplicații web: cerere aproape zero pe tot clusterul, deci secțiune, nu pagină.
  ['dezvoltare aplicatii web', 'aplicatii-web', 'comercial', NEW.appWeb, 'P1', 'nu', '', ''],
  ['dezvoltare software personalizat', 'aplicatii-web', 'comercial', NEW.appWeb, 'P1', 'nu', '', ''],
  ['creare aplicatie web', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['aplicatii web la comanda', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['aplicatie web personalizata', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['software personalizat', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['software la comanda', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['aplicatii software personalizate', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['platforma web personalizata', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['dezvoltare platforma online', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['creare aplicatie online', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['program de gestiune personalizat', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['sistem de rezervari online', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['sistem de programari online', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['crm personalizat', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['creare aplicatie web bucuresti', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['dezvoltare software bucuresti', 'aplicatii-web', 'comercial', NEW.appWeb, 'P2', 'nu', '', ''],
  ['cat costa o aplicatie web', 'pret', 'comercial', NEW.preturi, 'P2', 'nu', '', ''],
  ['pret dezvoltare software', 'pret', 'comercial', NEW.preturi, 'P2', 'nu', '', ''],
  // Facebook / Instagram Ads. „Meta" nu se caută în RO: ambii termeni au 0.
  ['agentie facebook ads', 'social-ads', 'comercial', NEW.facebook, 'P0', 'nu', 'Agenție Facebook Ads București | Facebook și Instagram', 'Agenție Facebook Ads'],
  ['promovare facebook', 'social-ads', 'comercial', NEW.facebook, 'P0', 'nu', '', ''],
  ['promovare instagram', 'social-ads', 'comercial', NEW.facebook, 'P0', 'nu', '', ''],
  ['agentie social media', 'social-ads', 'comercial', NEW.facebook, 'P1', 'nu', '', ''],
  ['agentie social media marketing', 'social-ads', 'comercial', NEW.facebook, 'P2', 'nu', '', ''],
  ['campanii facebook ads', 'social-ads', 'comercial', NEW.facebook, 'P1', 'nu', '', ''],
  ['administrare facebook ads', 'social-ads', 'comercial', NEW.facebook, 'P1', 'nu', '', ''],
  ['reclame facebook', 'social-ads', 'comercial', NEW.facebook, 'P1', 'nu', '', ''],
  ['reclame instagram', 'social-ads', 'comercial', NEW.facebook, 'P2', 'nu', '', ''],
  ['specialist facebook ads', 'social-ads', 'comercial', NEW.facebook, 'P2', 'nu', '', ''],
  ['promovare social media', 'social-ads', 'comercial', NEW.facebook, 'P2', 'nu', '', ''],
  ['administrare pagina facebook', 'social-ads', 'comercial', NEW.facebook, 'P2', 'nu', '', ''],
  ['agentie meta ads', 'social-ads', 'comercial', NEW.facebook, 'P2', 'nu', '', ''],
  ['campanii meta ads', 'social-ads', 'comercial', NEW.facebook, 'P2', 'nu', '', ''],
  ['cat costa promovarea pe facebook', 'pret', 'comercial', NEW.preturi, 'P1', 'nu', '', ''],
  ['promovare facebook pret', 'pret', 'comercial', NEW.preturi, 'P2', 'nu', '', ''],
  // Informațional pe serviciile noi.
  ['facebook ads sau google ads', 'info', 'informational', NEW.blog, 'P2', 'nu', '', ''],
  ['woocommerce sau shopify', 'info', 'informational', NEW.blog, 'P2', 'nu', '', ''],
  ['site sau magazin online', 'info', 'informational', NEW.blog, 'P2', 'nu', '', ''],
  ['aplicatie web vs site', 'info', 'informational', NEW.blog, 'P2', 'nu', '', ''],
  ['diferenta site si aplicatie web', 'info', 'informational', NEW.blog, 'P2', 'nu', '', ''],
  ['cum fac o aplicatie mobila', 'info', 'informational', NEW.blog, 'P2', 'nu', '', ''],
  ['cat dureaza dezvoltarea unei aplicatii', 'info', 'informational', NEW.blog, 'P2', 'nu', '', ''],
];

const header = [
  'keyword',
  'cluster',
  'intentie',
  'pagina_tinta',
  'avem_pagina',
  'prioritate',
  'cautari_lunare',
  'cautari_interval',
  'concurenta_ads',
  'cpc_low_ron',
  'cpc_high_ron',
  'in_autocomplete',
  'competitori_nr',
  'competitori',
  'title_propus',
  'h1_propus',
];

const lines = [header.join(',')];
const records = [];
const { volumes, files: statsFiles } = loadVolumes();
const noVolumeData = [];

function csvEscape(s) {
  const v = String(s ?? '');
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

for (const [kw, cluster, intent, page, prio, have, title, h1] of KEYWORDS) {
  const hits = competitorHits(kw);
  const inAuto = suggest.has(norm(kw)) ? 'da' : 'nu';
  const vol = volumes.get(kw);
  if (!vol) noVolumeData.push(kw);
  const rec = {
    keyword: kw,
    cluster,
    intentie: intent,
    pagina_tinta: page,
    avem_pagina: have,
    prioritate: prio,
    cautari_lunare: vol?.cautari_lunare ?? '',
    cautari_interval: vol?.cautari_interval ?? 'n/d',
    concurenta_ads: vol?.concurenta_ads ?? '',
    cpc_low_ron: vol?.cpc_low_ron ?? '',
    cpc_high_ron: vol?.cpc_high_ron ?? '',
    in_autocomplete: inAuto,
    competitori_nr: hits.length,
    competitori: hits.join('; '),
    title_propus: title,
    h1_propus: h1,
  };
  records.push(rec);
  lines.push(header.map((c) => csvEscape(rec[c])).join(','));
}

mkdirSync(path.dirname(outCsv), { recursive: true });
writeFileSync(outCsv, `${lines.join('\n')}\n`, 'utf8');

const byPage = new Map();
for (const r of records) {
  if (!byPage.has(r.pagina_tinta)) byPage.set(r.pagina_tinta, []);
  byPage.get(r.pagina_tinta).push(r);
}

const vol = (r) => Number(r.cautari_lunare) || 0;

/**
 * Ranking volume for a page: only the terms we actually target. P2 keywords are
 * kept in the list as evidence (head terms with product intent, dead variants),
 * so counting them would rank a page by demand we are not chasing.
 */
const targetedVol = (rows) =>
  rows.reduce((m, r) => (r.prioritate === 'P2' ? m : Math.max(m, vol(r))), 0);

let md = `# Mapare keyword → pagină

Generat de \`scripts/keyword-research/build-master-list.mjs\`. Nu edita manual: se rescrie la fiecare rulare.

Surse: crawl HTML echivalent Screaming Frog pe ${Object.keys(byDomain).length} competitori + Google Autocomplete RO + Google Keyword Planner România (1 aug 2025 – 31 iul 2026), din ${statsFiles.length} exporturi.

Căutările lunare sunt bucket-uri din contul gratuit (50 / 500 / 5.000 / 50.000), nu volume exacte. Din același motiv, orice variație raportată de Planner apare ca ±90% sau ±900%: e un salt de bucket, nu un procent real.

Nu forțăm pe o pagină existentă un head term care merită URL propriu (ex. \`creare magazin online\` nu e primary pe \`/creare-site-web/\`).

`;

function section(path, primary, secondary, avoid) {
  const rows = (byPage.get(path) || []).sort((a, b) => vol(b) - vol(a) || b.competitori_nr - a.competitori_nr);
  md += `## ${path}\n\n`;
  md += `- **Primary:** \`${primary}\`\n`;
  if (secondary.length) md += `- **Secundare:** ${secondary.map((s) => `\`${s}\``).join(', ')}\n`;
  if (avoid.length) md += `- **Nu forțăm aici:** ${avoid.map((s) => `\`${s}\``).join(', ')}\n`;
  if (rows.length) {
    md += `\n| Keyword | Căutări/lună | Interval | Prioritate | Competitori | Autocomplete |\n|---|---:|---|---|---:|---|\n`;
    for (const r of rows) {
      const v = r.cautari_lunare === '' ? 'n/d' : r.cautari_lunare;
      md += `| ${r.keyword} | ${v} | ${r.cautari_interval} | ${r.prioritate} | ${r.competitori_nr} | ${r.in_autocomplete} |\n`;
    }
  }
  md += '\n';
}

md += `# Pagini existente\n\n`;
section(OWNED.home, 'agentie marketing online', ['agentie marketing digital', 'agentie web design', 'dezvoltare web', 'promovare online'], ['agentie digitala (doar 50/lună)', 'creare site web', 'servicii seo', 'google ads']);
section(OWNED.site, 'creare site web', ['creare site de prezentare', 'web design bucuresti', 'creare site wordpress', 'realizare site web'], ['creare magazin online (pagină proprie)', 'pret creare site (pagină /preturi/)']);
section(OWNED.seo, 'servicii seo', ['optimizare seo', 'agentie seo bucuresti', 'optimizare site google', 'optimizare magazin online'], ['seo local (pagină nouă)', 'audit seo gratuit (pagină nouă)']);
section(OWNED.admin, 'administrare site', ['mentenanta site', 'mentenanta wordpress', 'optimizare viteza site'], ['mentenanta ca URL separat, rămâne aici ca secundar']);
section(OWNED.ppc, 'campanii google ads', ['agentie google ads', 'administrare google ads', 'promovare google'], ['pay per click ca head term', 'facebook ads (pagină proprie)']);
section(OWNED.logo, 'logo design', ['creare logo', 'identitate vizuala'], ['branding ca pagină separată']);
section(OWNED.port, 'portofoliu web design', ['site-uri realizate'], ['head terms comerciale']);
section(OWNED.svc, 'servicii marketing digital', ['strategie marketing digital', 'servicii digitale'], ['canibalizare cu homepage, creare site sau SEO']);
section(OWNED.about, 'despre echipa de tocilari', ['cum aleg o agentie de marketing'], ['head terms comerciale']);
section(OWNED.clients, 'clienti echipa de tocilari', [], ['head terms comerciale']);
section(OWNED.contact, 'contact agentie marketing', [], ['head terms comerciale']);

md += `# Pagini de creat\n\n`;
section(NEW.magazin, 'creare magazin online', ['creare site magazin online', 'realizare magazin online', 'creare magazin online bucuresti', 'creare magazin online wordpress', 'creare magazin online shopify', 'magazin online la cheie'], ['woocommerce în copy (clientul caută „wordpress")', 'optimizare magazin online (rămâne pe /servicii-seo/)']);
section(NEW.facebook, 'agentie facebook ads', ['promovare facebook', 'promovare instagram', 'agentie social media', 'campanii facebook ads'], ['„meta ads" oriunde în copy: 0 căutări în RO']);
section(NEW.mobile, 'dezvoltare aplicatii mobile', ['creare aplicatie android', 'creare aplicatie ios'], ['creare aplicatie mobila ca primary (de 10 ori mai puțin volum)']);
section(NEW.preturi, 'cat costa un site web', ['pret creare site', 'creare magazin online pret', 'cat costa seo', 'cat costa promovarea pe facebook'], ['head terms de serviciu']);
section(NEW.auditSeo, 'audit seo gratuit', ['audit seo'], ['servicii seo ca primary']);
section(NEW.seoLocal, 'seo local', ['cum optimizez google business profile'], ['servicii seo ca primary']);
section(NEW.blog, 'articole informaționale', [], ['head terms comerciale']);

md += `# Fără pagină SEO\n\n`;
section(NEW.appWeb, 'niciunul: cerere insuficientă', [], ['orice pagină optimizată pe acest cluster']);
section(NOT_TARGETED, 'niciunul: alt cumpărător', [], ['tot clusterul']);

md += `# Priorități, după volum\n\n`;
md += `Paginile de creat, ordonate după cel mai căutat termen pe care îl urmărim efectiv (P0 sau P1). Keyword-urile P2 sunt păstrate în listă ca dovadă, dar nu contează la clasare.\n\n`;
md += `| Pagina | Volum țintit | Keyword-uri | P0 |\n|---|---:|---:|---:|\n`;
const toBuild = [...byPage.entries()]
  .filter(([page, rows]) => page.startsWith('de creat:') && rows.length)
  .sort((a, b) => targetedVol(b[1]) - targetedVol(a[1]));
for (const [page, rows] of toBuild) {
  md += `| ${page.replace('de creat: ', '')} | ${targetedVol(rows)} | ${rows.length} | ${rows.filter((r) => r.prioritate === 'P0').length} |\n`;
}

writeFileSync(outMap, md, 'utf8');
writeFileSync(
  path.join(root, 'docs/keyword-research/lista-master-keywords.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      sites: Object.keys(byDomain).length,
      volumes: {
        source: 'Google Keyword Planner',
        location: 'Romania',
        dateRange: '1 August 2025 - 31 July 2026',
        files: statsFiles,
        note: 'Cont gratuit: 50/500/5000/50000 sunt bucket-uri rotunjite. Variațiile ±90% / ±900% sunt salturi de bucket, nu procente reale.',
      },
      records,
    },
    null,
    2,
  ),
  'utf8',
);

const p0 = records.filter((r) => r.prioritate === 'P0').length;
const withVol = records.filter((r) => vol(r) > 0).length;
console.log(`Wrote ${records.length} keywords (${p0} P0, ${withVol} cu volum) → ${path.relative(root, outCsv)}`);
console.log(`Mapping → ${path.relative(root, outMap)}`);
console.log(`Volume din ${statsFiles.length} exporturi Planner: ${statsFiles.join(', ')}`);
if (noVolumeData.length) {
  console.log(`Fără rând în exporturile Planner (${noVolumeData.length}): ${noVolumeData.join(', ')}`);
}
console.log('\nTop 15 după volum:');
for (const r of [...records].sort((a, b) => vol(b) - vol(a)).slice(0, 15)) {
  console.log(`  ${String(vol(r)).padStart(5)}  ${r.keyword.padEnd(34)} → ${r.pagina_tinta}`);
}
