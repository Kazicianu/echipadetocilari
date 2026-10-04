/**
 * Scaffold a new page directly into the Elementor mirror.
 *
 *   node scripts/new-page.mjs --slug logo-design --title "Logo design" \
 *        --description "..." --template administrare-site
 *
 * How this works
 * --------------
 * Every mirror page is three parts: <head> + header, the page content, then the
 * footer. Header (`elementor-3359`) and footer (`elementor-3355`) are shared by
 * every page and styled by CSS that already ships, so reusing a page as a shell
 * gives you identical chrome for free.
 *
 * Only the middle is per-page. Elementor styles it with ID-bound rules like
 *   .elementor-4297 .elementor-element.elementor-element-abc123 { … }
 * which is unusable for hand-written pages. So new pages get their own small
 * stylesheet (/wp-content/ect-pages/<slug>.css) and use plain, readable class
 * names, while still borrowing Elementor's generic widget CSS (widget-heading,
 * widget-icon-box, …) that is NOT ID-bound.
 *
 * The result is a page that looks native to the site but is ordinary HTML/CSS
 * you can edit by hand.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureSharedContact } from './lib/shared-contact.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const mirror = path.join(root, 'legacy-mirror');

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .join(' ')
    .split('--')
    .filter(Boolean)
    .map((s) => {
      const [k, ...v] = s.trim().split(/\s+/);
      return [k, v.join(' ').replace(/^["']|["']$/g, '')];
    })
);

const slug = args.slug;
const title = args.title || slug;
const description = args.description || '';
const template = args.template || 'administrare-site';

if (!slug) {
  console.error('Usage: node scripts/new-page.mjs --slug my-page --title "My page" [--template administrare-site]');
  process.exit(1);
}

const templateFile = path.join(mirror, template, 'index.html');
if (!existsSync(templateFile)) {
  console.error(`Template page not found: legacy-mirror/${template}/index.html`);
  process.exit(1);
}

const html = readFileSync(templateFile, 'utf8');

// ─── split the shell ────────────────────────────────────────────────────────

/**
 * Start of the page-content wrapper: `elementor elementor-NNNN` with no
 * `location-*` suffix (those are the header and footer templates). The class
 * attribute is not necessarily first on the tag, so find the class then walk
 * back to the opening `<div`.
 */
const classMatch = [...html.matchAll(/class="elementor elementor-(\d+)"/g)][0];
const contentStart = classMatch ? html.lastIndexOf('<div', classMatch.index) : -1;
if (!classMatch || contentStart === -1) {
  console.error('Could not find the page-content wrapper in the template.');
  process.exit(1);
}
const contentMatch = { index: contentStart };

/** Start of the footer wrapper — walk back to its opening tag. */
const footerIdx = html.indexOf('elementor-location-footer');
const footerStart = html.lastIndexOf('<footer', footerIdx);
if (footerIdx === -1 || footerStart === -1) {
  console.error('Could not find the footer wrapper in the template.');
  process.exit(1);
}

const prefix = html.slice(0, contentMatch.index);
const suffix = html.slice(footerStart);

// ─── page-specific bits ─────────────────────────────────────────────────────

const cssHref = `/wp-content/ect-pages/${slug}.css`;

let head = prefix
  .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)} | Echipa de Tocilari</title>`)
  .replace(
    /<meta\s+name="description"[^>]*>/i,
    description ? `<meta name="description" content="${escAttr(description)}">` : ''
  );

// Load the page's own stylesheet last so it wins over the generic widget CSS.
if (!head.includes(cssHref)) {
  head = head.replace(/<\/head>/i, `<link rel="stylesheet" href="${cssHref}">\n</head>`);
}

const content = `<div class="elementor ect-page ect-page--${slug}">
  <section class="ect-hero">
    <div class="ect-container">
      <p class="ect-eyebrow">Serviciu</p>
      <h1 class="ect-h1">${esc(title)}</h1>
      <p class="ect-lead">${esc(description || 'Descrie aici, într-o frază, ce rezolvă acest serviciu.')}</p>
      <a class="ect-btn ect-btn--outline" href="/contact/">
        Participă la o consultație <strong>GRATUITĂ</strong> de 30 minute
      </a>
    </div>
  </section>

  <section class="ect-section">
    <div class="ect-container">
      <p class="ect-eyebrow">Ce include</p>
      <h2 class="ect-h2">Cum lucrăm</h2>
      <div class="ect-grid">
        <article class="ect-card">
          <h3 class="ect-h3">Primul pas</h3>
          <p class="ect-body">Înlocuiește textul acesta.</p>
        </article>
        <article class="ect-card">
          <h3 class="ect-h3">Al doilea pas</h3>
          <p class="ect-body">Înlocuiește textul acesta.</p>
        </article>
        <article class="ect-card">
          <h3 class="ect-h3">Al treilea pas</h3>
          <p class="ect-body">Înlocuiește textul acesta.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="ect-cta">
    <div class="ect-container ect-cta__inner">
      <h2 class="ect-cta__title">Vorbește cu Echipa de Tocilari, agenția ta de marketing digital</h2>
      <a class="ect-btn ect-btn--on-brand" href="/contact/">
        Participă la o consultație <strong>GRATUITĂ</strong> de 30 minute
      </a>
    </div>
  </section>
</div>

`;

const css = `/* ${title} — page styles.
   Design tokens taken from the live Elementor build: Montserrat throughout,
   brand #fd8649, ink #27272d, h1 45/54 w900, h2 45/54 w500, body 18/24. */

.ect-page {
  font-family: Montserrat, system-ui, sans-serif;
  color: #27272d;
}

.ect-container {
  width: 100%;
  max-width: 1150px;
  margin: 0 auto;
  padding: 0 20px;
}

.ect-hero {
  background: #fff url('/wp-content/uploads/2022/03/day-care-page-header-blobs.svg') calc(0% - 138px) 0% / cover no-repeat;
  padding: 120px 0 90px;
}

.ect-section {
  padding: 80px 0;
}

.ect-eyebrow {
  margin: 0 0 10px;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 300;
  color: #fd8649;
}

.ect-h1 {
  margin: 0 0 24px;
  font-size: clamp(37px, 4vw, 45px);
  line-height: 1.2;
  font-weight: 900;
  color: #fd8649;
}

.ect-h2 {
  margin: 0 0 40px;
  font-size: clamp(28px, 3.4vw, 45px);
  line-height: 1.2;
  font-weight: 500;
  color: #27272d;
}

.ect-h3 {
  margin: 0 0 10px;
  font-size: 20px;
  line-height: 1.2;
  font-weight: 500;
  color: #fd8649;
}

.ect-lead {
  margin: 0 0 32px;
  max-width: 640px;
  font-size: 18px;
  line-height: 24px;
}

.ect-body {
  margin: 0;
  font-size: 16px;
  line-height: 22.4px;
  font-weight: 300;
}

.ect-grid {
  display: grid;
  gap: 40px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.ect-page .ect-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  border: 2px solid transparent;
  padding: 15px 30px;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.ect-page .ect-btn strong {
  margin: 0 4px;
}

.ect-page .ect-btn--outline {
  border-color: #fd8649;
  background: #fff;
  color: #fd8649;
  padding: 20px 40px;
  font-size: 16px;
  font-weight: 600;
}

.ect-page .ect-btn--outline:hover {
  background: #fd8649;
  color: #fff;
}

.ect-page .ect-btn--on-brand {
  background: #fff;
  color: #ff5600;
  padding: 20px 40px;
  font-size: 16px;
  font-weight: 600;
}

.ect-cta {
  background: linear-gradient(135deg, #ff6c2a 0%, #fd8649 45%, #ff9762 100%);
  color: #fff;
}

.ect-cta__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 215px;
  padding-block: 32px;
}

.ect-cta__title {
  margin: 0;
  max-width: 571px;
  font-size: 35px;
  line-height: 42px;
  font-weight: 500;
  color: #fff;
}

@media (max-width: 767px) {
  .ect-hero { padding: 60px 0 50px; }
  .ect-section { padding: 50px 0; }
  .ect-cta__title { font-size: 26px; line-height: 32px; }
}
`;

// ─── write ──────────────────────────────────────────────────────────────────

const pageDir = path.join(mirror, slug);
const cssDir = path.join(mirror, 'wp-content', 'ect-pages');
mkdirSync(pageDir, { recursive: true });
mkdirSync(cssDir, { recursive: true });

const pageFile = path.join(pageDir, 'index.html');
if (existsSync(pageFile) && !('force' in args)) {
  console.error(`legacy-mirror/${slug}/index.html already exists — pass --force to overwrite.`);
  process.exit(1);
}

writeFileSync(pageFile, ensureSharedContact(head + content + suffix, readFileSync(path.join(mirror, 'index.html'), 'utf8')), 'utf8');
writeFileSync(path.join(cssDir, `${slug}.css`), css, 'utf8');

console.log(`✓ legacy-mirror/${slug}/index.html`);
console.log(`✓ legacy-mirror/wp-content/ect-pages/${slug}.css`);
console.log('');
console.log('Next: add the route to scripts/i18n/routes.mjs so it gets meta, hreflang,');
console.log('the language switcher and a sitemap entry — otherwise the build treats it');
console.log('as leftover HTML and the build will fail until you add the route.');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAttr(s) {
  return esc(s).replace(/"/g, '&quot;');
}
