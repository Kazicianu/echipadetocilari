/**
 * Build the 1:1 static mirror of echipadetocilari.ro (Elementor HTML/CSS/JS/assets)
 * and layer SEO/AEO/GEO + mobile fixes on top — head-only, no visual change.
 *
 *   legacy-mirror/  →  dist/   (+ /en/… twins, robots, llms.txt, sitemap)
 *
 * Indexing is off by default. A production build needs:
 *   PUBLIC_INDEXABLE=true PUBLIC_SITE_URL=https://www.echipadetocilari.ro npm run build
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { routes, isOwnedPage, routeByRo } from './i18n/routes.mjs';
import { roPageMeta, roOrg, roFaqs } from './i18n/meta-ro.mjs';
import { generateEnglishPages, patchRomanianPages } from './i18n/generate-en.mjs';
import {
  appendToBody,
  appendToHead,
  applyIndexPolicy,
  renderJsonLd,
  setLang,
  stripJsonLd,
  upsertMeta,
  upsertTitle,
} from './lib/html.mjs';
import { faqPage, organization, service, webPage, website } from './lib/schema.mjs';
import { extractGoogleAdsFaqs } from './lib/google-ads-faq.mjs';
import { junkRedirects, vercelRedirects } from './lib/junk-redirects.mjs';
import { validateBuild } from './lib/validate.mjs';
import { enhanceContactForms } from './lib/contact-forms.mjs';
import { makeStandaloneAssets, validateStandaloneAssets } from './lib/standalone-assets.mjs';
import { normalizePageLinks } from './lib/navigation.mjs';
import { ensureSharedContact } from './lib/shared-contact.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'legacy-mirror');
const outDir = path.join(root, 'dist');

const INDEXABLE = process.env.PUBLIC_INDEXABLE === 'true';
const SITE = (process.env.PUBLIC_SITE_URL || 'https://www.echipadetocilari.ro').replace(/\/$/, '');

if (!existsSync(path.join(srcDir, 'index.html'))) {
  console.error('Missing legacy-mirror/index.html — run `npm run mirror` first.');
  process.exit(1);
}

// ─── helpers ────────────────────────────────────────────────────────────────

function walkHtml(dir, list = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walkHtml(full, list);
    else if (name.endsWith('.html')) list.push(full);
  }
  return list;
}

function urlPathOf(file) {
  const rel = path.relative(outDir, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

function distPathFromUrl(urlPath) {
  return path.join(outDir, urlPath.replace(/^\//, '').replace(/\/$/, ''));
}

/**
 * Theme-demo / duplicate / attachment HTML must not ship. 301s live in
 * vercel.json; leftover files in dist would still 200 on a static host.
 */
function pruneJunkFromDist() {
  let removed = 0;
  for (const { from } of junkRedirects) {
    const target = distPathFromUrl(from);
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true });
      removed += 1;
    }
  }
  const leftoverHtml = walkHtml(outDir).filter((f) => !isOwnedPage(urlPathOf(f)));
  for (const file of leftoverHtml) {
    rmSync(file, { force: true });
    removed += 1;
  }
  console.log(`  pruned ${removed} leftover path(s) (301s are in vercel.json)`);
}

function assertVercelRedirects() {
  const vercel = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const expected = vercelRedirects();
  const actual = vercel.redirects || [];
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      'vercel.json redirects do not match scripts/lib/junk-redirects.mjs — update both together.'
    );
  }
}

function schemasFor(urlPath, meta, html) {
  const route = routeByRo(urlPath);
  const list = [
    organization({ site: SITE, lang: 'ro', ...roOrg }),
    website({ site: SITE, lang: 'ro' }),
    webPage({ site: SITE, lang: 'ro', url: urlPath, name: meta.title, description: meta.description }),
  ];

  if (urlPath === '/') list.push(faqPage(roFaqs));
  if (urlPath === '/agentie-google-ads/') list.push(faqPage(extractGoogleAdsFaqs(html)));
  if (route?.service) {
    list.push(
      service({
        site: SITE,
        lang: 'ro',
        name: route.service.ro,
        description: meta.description,
        url: urlPath,
      })
    );
  }
  return list;
}

console.log('→ Cleaning dist/');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

console.log('→ Copying 1:1 mirror (HTML/CSS/JS/images/fonts)…');
cpSync(srcDir, outDir, { recursive: true });
pruneJunkFromDist();

// ─── per-page enhancement ───────────────────────────────────────────────────

function enhanceHtml(file) {
  const urlPath = urlPathOf(file);
  const owned = isOwnedPage(urlPath);
  const meta = roPageMeta[urlPath];
  let html = readFileSync(file, 'utf8');
  if (owned) html = ensureSharedContact(html, readFileSync(path.join(srcDir, 'index.html'), 'utf8'));

  // The scraper wrote `?_ver%3D…`; the files on disk (and Vercel) use `_ver=`.
  html = html.replace(/(src|href)="([^"]*?)_ver%3D([^"]*)"/gi, '$1="$2_ver=$3"');

  html = normalizePageLinks(html, { pageUrl: urlPath });

  html = setLang(html, 'ro');

  // Replace the GA4 tag inherited from the WordPress mirror before EN pages are generated.
  html = html.replace(
    /<script\b[^>]*\bid=["']google_gtagjs(?:-inline)?["'][^>]*>[\s\S]*?<\/script>\s*/gi,
    ''
  );
  html = appendToHead(
    html,
    `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-PGM4B3VM9Z"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-PGM4B3VM9Z');
</script>`
  );

  if (!/name=["']viewport["']/i.test(html)) {
    html = html.replace(
      /<head[^>]*>/i,
      (h) =>
        `${h}\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
    );
  }
  if (!/name=["']theme-color["']/i.test(html)) {
    html = appendToHead(html, '<meta name="theme-color" content="#fd8649">');
  }

  // Rank Math's scraped graph duplicates entities and describes demo content —
  // drop it wholesale and re-emit only what we mean.
  html = stripJsonLd(html);

  if (owned && meta) {
    html = upsertTitle(html, meta.title);
    html = upsertMeta(html, 'name="description"', meta.description);
    html = upsertMeta(html, 'property="og:title"', meta.title);
    html = upsertMeta(html, 'property="og:description"', meta.description);
    html = upsertMeta(html, 'property="og:url"', `${SITE}${urlPath}`);
    html = upsertMeta(html, 'name="twitter:title"', meta.title);
    html = upsertMeta(html, 'name="twitter:description"', meta.description);
    html = appendToHead(html, renderJsonLd(schemasFor(urlPath, meta, html)));
  }

  html = applyIndexPolicy(html, {
    indexable: owned && INDEXABLE,
    canonical: `${SITE}${urlPath}`,
  });

  // Additive, layout-neutral: 16px inputs stop iOS from zooming on focus.
  if (!html.includes('/* ect-mobile-a11y */')) {
    html = appendToHead(
      html,
      '<style>/* ect-mobile-a11y */input,textarea,select{font-size:16px}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}</style>'
    );
  }

  // Elementor's entrance animations need its editor runtime; on a static host we
  // reveal `.elementor-invisible` ourselves or the content stays at opacity 0.
  if (!html.includes('/* ect-invis-fallback */')) {
    html = appendToHead(
      html,
      '<style>/* ect-invis-fallback */.elementor-invisible{opacity:0}.elementor-invisible.animated,.elementor-invisible[data-ect-revealed="1"]{opacity:1}@media(prefers-reduced-motion:reduce){.elementor-invisible{opacity:1!important}}</style>'
    );
  }
  if (!html.includes('ect-anim-polyfill.js')) {
    html = appendToBody(html, '<script src="/wp-content/ect-anim-polyfill.js" defer></script>');
  }

  writeFileSync(file, html, 'utf8');
  return { urlPath, owned };
}

const roFiles = walkHtml(outDir);
console.log(`→ Enhancing ${roFiles.length} HTML pages (SEO/AEO/GEO, keep 1:1 visuals)…`);
const enhanced = roFiles.map(enhanceHtml);
const leftoverCount = enhanced.filter((p) => !p.owned).length;
console.log(`  ${enhanced.filter((p) => p.owned).length} own pages, ${leftoverCount} leftovers`);

console.log('→ Generating English pages (/en/…) with natural-language SEO…');
const enPages = generateEnglishPages({ outDir, site: SITE, indexable: INDEXABLE });
patchRomanianPages({ outDir, site: SITE });
console.log('  EN pages:', enPages.join(', '));

// Run after translation so form field names and runtime settings stay intact.
console.log('→ Preparing standalone forms and local presentation assets…');
for (const file of walkHtml(outDir)) {
  const html = readFileSync(file, 'utf8');
  writeFileSync(file, makeStandaloneAssets(enhanceContactForms(html)), 'utf8');
}

// ─── site-level files ───────────────────────────────────────────────────────

// Staging keeps Disallow: / so Google never sees the site. Leftover URLs are
// 301'd in vercel.json, not published as noindex HTML.
writeFileSync(
  path.join(outDir, 'robots.txt'),
  INDEXABLE
    ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n\nUser-agent: Googlebot\nDisallow: /\n\nUser-agent: Bingbot\nDisallow: /\n',
  'utf8'
);

const llmsPages = routes
  .flatMap((r) => [
    `- ${SITE}${r.ro === '/' ? '/' : r.ro} (ro) — ${r.labelRo}`,
    `- ${SITE}${r.en} (en) — ${r.labelEn}`,
  ])
  .join('\n');
writeFileSync(
  path.join(outDir, 'llms.txt'),
  `# Echipa de Tocilari\n\n> Digital marketing agency Romania: website design, SEO, maintenance, PPC. Multilingual RO/EN.\n\n## Pages\n${llmsPages}\n`,
  'utf8'
);

if (INDEXABLE) {
  const entry = (loc, alternates) =>
    `  <url><loc>${SITE}${loc}</loc><changefreq>weekly</changefreq>${alternates}</url>`;
  const alternatesFor = (r) =>
    `<xhtml:link rel="alternate" hreflang="ro" href="${SITE}${r.ro}"/>` +
    `<xhtml:link rel="alternate" hreflang="en" href="${SITE}${r.en}"/>` +
    `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${r.ro}"/>`;

  const urls = routes
    .flatMap((r) => [entry(r.ro, alternatesFor(r)), entry(r.en, alternatesFor(r))])
    .join('\n');

  writeFileSync(
    path.join(outDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
    'utf8'
  );
}

// ─── verify ─────────────────────────────────────────────────────────────────

console.log('→ Validating output…');
assertVercelRedirects();
const errors = validateBuild({
  outDir,
  files: walkHtml(outDir),
  urlPathOf,
  indexable: INDEXABLE,
});
errors.push(...validateStandaloneAssets({ outDir, files: walkHtml(outDir), urlPathOf }));

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) in dist/:`);
  for (const e of errors) console.error(`   ${e}`);
  process.exit(1);
}

console.log(`✓ Build complete → dist/ (RO + EN, ${routes.length * 2} own pages, indexable=${INDEXABLE})`);
