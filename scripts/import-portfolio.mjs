/** One-time/explicit refresh of the existing public template catalogue.
 * Run `node scripts/import-portfolio.mjs --refresh` while WordPress is available.
 * Without --refresh, render only from the saved catalogue. Builds need no network.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://www.echipadetocilari.ro';
const publicDir = '/wp-content/ect-pages/portfolio';
const targetDir = path.join(root, 'legacy-mirror', publicDir);
const catalogueFile = path.join(targetDir, 'catalogue.json');
const pageFile = path.join(root, 'legacy-mirror/portofoliu/index.html');
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

async function download(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response;
}

let catalogue;
if (process.argv.includes('--refresh')) {
  const [itemsResponse, categoriesResponse] = await Promise.all([
    download(`${base}/wp-json/wp/v2/astra-portfolio?per_page=100`),
    download(`${base}/wp-json/wp/v2/astra-portfolio-categories?per_page=100`),
  ]);
  if (Number(itemsResponse.headers.get('x-wp-totalpages')) > 1 || Number(categoriesResponse.headers.get('x-wp-totalpages')) > 1) {
    throw new Error('Catalogue exceeds 100 entries. Add pagination before importing.');
  }
  const items = await itemsResponse.json();
  const categories = await categoriesResponse.json();
  if (!Array.isArray(items) || !items.length || !Array.isArray(categories)) throw new Error('Invalid catalogue response');
  await mkdir(path.join(targetDir, 'images'), { recursive: true });
  catalogue = {
    importedAt: new Date().toISOString(),
    source: `${base}/wp-json/wp/v2/astra-portfolio?per_page=100`,
    kind: 'Existing website template examples; not claimed as completed client projects.',
    categories: categories.map(({ id, name, slug }) => ({ id, name, slug })),
    items: [],
  };
  for (const item of items) {
    if (item['portfolio-type'] !== 'iframe') throw new Error(`Unsupported entry type: ${item.id}`);
    const demo = new URL(item['astra-site-url'], base);
    if (demo.hostname !== 'websitedemos.net') throw new Error(`Review new demo host before importing: ${demo.hostname}`);
    demo.protocol = 'https:';
    const image = new URL(item['thumbnail-image-url']);
    if (image.origin !== base || !image.pathname.startsWith('/wp-content/uploads/')) throw new Error(`Unexpected image source: ${image}`);
    const imageName = `${item.id}-${path.posix.basename(image.pathname)}`;
    const imageResponse = await download(image);
    if (!imageResponse.headers.get('content-type')?.startsWith('image/')) throw new Error(`Invalid image response: ${image}`);
    await writeFile(path.join(targetDir, 'images', imageName), Buffer.from(await imageResponse.arrayBuffer()));
    catalogue.items.push({
      id: item.id,
      slug: item.slug,
      title: item.title.rendered,
      categories: item['astra-portfolio-categories'],
      demoUrl: demo.href,
      image: `${publicDir}/images/${imageName}`,
      imageSource: image.href,
    });
  }
  await writeFile(catalogueFile, `${JSON.stringify(catalogue, null, 2)}\n`);
} else {
  catalogue = JSON.parse(await readFile(catalogueFile, 'utf8'));
}

const categories = catalogue.categories.filter((category) => catalogue.items.some((item) => item.categories.includes(category.id)));
const filters = [{ id: 'all', name: 'Toate' }, ...categories].map((category) => `<button type="button" data-category="${escape(category.id)}" aria-pressed="${category.id === 'all'}">${escape(category.name === 'Other' ? 'Altele' : category.name)}</button>`).join('\n');
const cards = catalogue.items.map((item, index) => `<article class="ect-portfolio-card" data-categories="${item.categories.join(' ')}">
  <a class="ect-portfolio-preview" href="${escape(item.demoUrl)}" target="_blank" rel="noopener noreferrer" data-elementor-open-lightbox="no" aria-labelledby="ect-model-${item.id}">
    <img src="${escape(item.image)}" alt="" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async">
    <span class="ect-portfolio-overlay"><span>Vezi modelul</span></span>
  </a>
  <h3 id="ect-model-${item.id}"><a href="${escape(item.demoUrl)}" target="_blank" rel="noopener noreferrer">${escape(item.title)}</a></h3>
</article>`).join('\n');

const markup = `<!-- ect-portfolio:start -->
<section id="ect-portfolio" aria-label="Modele de site-uri web" data-count-label="modele" data-count-label-singular="model">
  <p class="ect-portfolio-note">Modele demonstrative de site-uri web, pe care le putem adapta afacerii tale. Previzualizările se deschid într-o filă nouă.</p>
  <div class="ect-portfolio-controls" hidden>
    <div class="ect-portfolio-filters" role="group" aria-label="Filtrează după categorie">
      ${filters}
    </div>
    <div class="ect-portfolio-search">
      <label for="ect-portfolio-search" class="screen-reader-text">Caută modele</label>
      <input id="ect-portfolio-search" type="search" placeholder="Caută un model..." aria-controls="ect-portfolio-grid">
    </div>
  </div>
  <p class="ect-portfolio-count" role="status" aria-live="polite" aria-atomic="true">${catalogue.items.length} modele</p>
  <div id="ect-portfolio-grid" class="ect-portfolio-grid">
    ${cards}
  </div>
  <p class="ect-portfolio-empty" hidden>Nu am găsit modele pentru această căutare. Încearcă alt termen sau altă categorie.</p>
</section>
<!-- ect-portfolio:end -->`;

let html = await readFile(pageFile, 'utf8');
if (html.includes('<!-- ect-portfolio:start -->')) {
  html = html.replace(/<!-- ect-portfolio:start -->[\s\S]*?<!-- ect-portfolio:end -->/, markup);
} else {
  const start = html.indexOf('<div id="astra-portfolio"');
  const lastTemplate = html.indexOf('<script type="text/template" id="tmpl-astra-portfolio-no-more-demos">', start);
  const end = html.indexOf('</script>', lastTemplate) + '</script>'.length;
  if (start < 0 || lastTemplate < 0 || end < start) throw new Error('Cannot locate the original portfolio markup');
  html = html.slice(0, start) + markup + html.slice(end);
}
const unusedIds = /^(?:astra-portfolio-|portfolio-front-|starter-templates-zip-preview-|thickbox-|react-js$|react-dom-js$|wp-escape-html-js$|wp-element-js$|wp-dom-ready-js$|underscore-js$|wp-util-js|imagesloaded-js$|masonry-js$|jquery-masonry-js$)/;
html = html.replace(/<(script|style)\b[^>]*\bid="([^"]+)"[^>]*>[\s\S]*?<\/\1>\s*/gi, (tag, _type, id) => unusedIds.test(id) ? '' : tag);
html = html.replace(/<link\b[^>]*\bid="([^"]+)"[^>]*>\s*/gi, (tag, id) => unusedIds.test(id) ? '' : tag);
if (!html.includes('id="ect-portfolio-css"')) html = html.replace('</head>', `<link id="ect-portfolio-css" rel="stylesheet" href="${publicDir}/portfolio.css">\n</head>`);
if (!html.includes('id="ect-portfolio-js"')) html = html.replace('</body>', `<script id="ect-portfolio-js" src="${publicDir}/portfolio.js" defer></script>\n</body>`);
await writeFile(pageFile, html);
console.log(`Rendered ${catalogue.items.length} local portfolio templates with ${categories.length} categories.`);
