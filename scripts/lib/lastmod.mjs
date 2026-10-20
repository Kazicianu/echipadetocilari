/**
 * Sitemap <lastmod>: the day of the last commit that touched a page's sources,
 * or today for sources with uncommitted changes.
 *
 * Vercel builds from a shallow clone (about ten commits). There `git log` on an
 * older file stops at the clone boundary and would report that commit's date,
 * so the dates are also kept in scripts/i18n/lastmod.json. A build with the
 * full history refreshes that file; a shallow build trusts git only for
 * commits inside the clone and falls back to the saved date otherwise.
 */
import { execFileSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';

/** Files whose content makes up each public page. EN copy comes from the dictionaries. */
export function pageSources(route) {
  const html = `legacy-mirror/${route.roFile}`;
  const pages = [{ url: route.ro, files: [html] }];
  if (route.en) {
    const en = [html, 'scripts/i18n/dictionary.mjs'];
    if (route.ro === '/agentie-google-ads/') en.push('scripts/i18n/google-ads.mjs');
    pages.push({ url: route.en, files: en });
  }
  return pages;
}

function localDay(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function gitRunner(root) {
  return (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

/**
 * @param {object} opts
 * @param {string} opts.root          repository root
 * @param {{url: string, files: string[]}[]} opts.pages
 * @param {string} opts.manifestFile  absolute path of the saved dates
 * @param {Date} [opts.now]
 * @returns {{ dates: Record<string, string|null>, source: 'git'|'shallow'|'manifest', updated: boolean }}
 */
export function resolveLastmods({ root, pages, manifestFile, now = new Date() }) {
  const saved = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : {};
  const git = gitRunner(root);
  let shallow;
  try {
    shallow = git('rev-parse', '--is-shallow-repository') === 'true';
  } catch {
    return { dates: Object.fromEntries(pages.map((p) => [p.url, saved[p.url] ?? null])), source: 'manifest', updated: false };
  }

  const today = localDay(now);
  const dates = {};
  for (const { url, files } of pages) {
    let date = null;
    if (git('status', '--porcelain', '--', ...files)) {
      date = today;
    } else {
      // %P is empty for a root commit, and for the boundary commit of a shallow clone.
      const [day, parents] = git('log', '-1', '--format=%cs%x09%P', '--', ...files).split('\t');
      if (day && (parents || !shallow)) date = day;
    }
    dates[url] = date ?? saved[url] ?? null;
  }

  let updated = false;
  if (!shallow && JSON.stringify(dates) !== JSON.stringify(saved)) {
    writeFileSync(manifestFile, `${JSON.stringify(dates, null, 2)}\n`, 'utf8');
    updated = true;
  }
  return { dates, source: shallow ? 'shallow' : 'git', updated };
}
