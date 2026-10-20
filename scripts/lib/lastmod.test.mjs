import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';
import { pageSources, resolveLastmods } from './lastmod.mjs';
import { routes } from '../i18n/routes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const pages = [
  { url: '/a/', files: ['legacy-mirror/a/index.html'] },
  { url: '/en/a/', files: ['legacy-mirror/a/index.html', 'scripts/i18n/dictionary.mjs'] },
  { url: '/b/', files: ['legacy-mirror/b/index.html'] },
];

function git(cwd, args, date) {
  const env = date ? { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : process.env;
  return execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', ...args], { cwd, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

function write(repo, file, content) {
  mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
  writeFileSync(path.join(repo, file), content);
}

function fixtureRepo(directory) {
  const repo = path.join(directory, 'repo');
  mkdirSync(repo);
  git(repo, ['init', '-q']);
  write(repo, 'legacy-mirror/a/index.html', 'a1');
  write(repo, 'scripts/i18n/dictionary.mjs', 'd1');
  git(repo, ['add', '.']);
  git(repo, ['commit', '-q', '-m', 'one'], '2026-01-10T12:00:00+02:00');
  write(repo, 'scripts/i18n/dictionary.mjs', 'd2');
  git(repo, ['commit', '-q', '-am', 'two'], '2026-02-15T12:00:00+02:00');
  write(repo, 'legacy-mirror/b/index.html', 'b1');
  git(repo, ['add', '.']);
  git(repo, ['commit', '-q', '-m', 'three'], '2026-03-20T12:00:00+02:00');
  return repo;
}

function scratch(prefix) {
  const parent = path.join(root, '.tmp');
  mkdirSync(parent, { recursive: true });
  const directory = mkdtempSync(path.join(parent, prefix));
  return { directory, cleanup: () => { assert.equal(path.dirname(directory), parent); rmSync(directory, { recursive: true, force: true }); } };
}

test('every route maps to its HTML source, and EN pages also to the dictionaries', () => {
  const all = routes.flatMap(pageSources);
  assert.equal(all.length, routes.length + routes.filter((r) => r.en).length);
  for (const { url, files } of all) {
    assert.ok(files.every((file) => existsSync(path.join(root, file))), url);
    assert.equal(files.includes('scripts/i18n/dictionary.mjs'), url.startsWith('/en/'), url);
  }
  const ads = all.find((p) => p.url === '/en/google-ads-agency/');
  assert.ok(ads.files.includes('scripts/i18n/google-ads.mjs'));
});

test('full history gives each page its last commit day, today for uncommitted edits, and refreshes the manifest', () => {
  const { directory, cleanup } = scratch('lastmod-full-');
  try {
    const repo = fixtureRepo(directory);
    const manifestFile = path.join(repo, 'lastmod.json');
    const first = resolveLastmods({ root: repo, pages, manifestFile, now: new Date(2026, 4, 1) });
    assert.deepEqual(first.dates, { '/a/': '2026-01-10', '/en/a/': '2026-02-15', '/b/': '2026-03-20' });
    assert.equal(first.source, 'git');
    assert.equal(first.updated, true);
    assert.deepEqual(JSON.parse(readFileSync(manifestFile, 'utf8')), first.dates);
    assert.equal(resolveLastmods({ root: repo, pages, manifestFile }).updated, false);

    write(repo, 'legacy-mirror/a/index.html', 'a2');
    const dirty = resolveLastmods({ root: repo, pages, manifestFile, now: new Date(2026, 4, 1) });
    assert.deepEqual(dirty.dates, { '/a/': '2026-05-01', '/en/a/': '2026-05-01', '/b/': '2026-03-20' });
  } finally { cleanup(); }
});

test('a shallow clone trusts git only inside the clone and uses saved dates at the boundary', () => {
  const { directory, cleanup } = scratch('lastmod-shallow-');
  try {
    const repo = fixtureRepo(directory);
    const clone = path.join(directory, 'clone');
    git(directory, ['clone', '-q', '--depth', '2', pathToFileURL(repo).href, clone]);
    const manifestFile = path.join(clone, 'lastmod.json');
    const saved = { '/a/': '2025-12-01', '/en/a/': '2025-12-02', '/b/': '2025-12-03' };
    writeFileSync(manifestFile, JSON.stringify(saved));
    const result = resolveLastmods({ root: clone, pages, manifestFile });
    // Commit "two" is the clone boundary; "three" is fully known.
    assert.deepEqual(result.dates, { '/a/': '2025-12-01', '/en/a/': '2025-12-02', '/b/': '2026-03-20' });
    assert.equal(result.source, 'shallow');
    assert.equal(result.updated, false);
    assert.deepEqual(JSON.parse(readFileSync(manifestFile, 'utf8')), saved);
  } finally { cleanup(); }
});

test('without git the saved dates are used as they are', () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'lastmod-nogit-'));
  const ceiling = process.env.GIT_CEILING_DIRECTORIES;
  process.env.GIT_CEILING_DIRECTORIES = path.dirname(directory);
  try {
    const manifestFile = path.join(directory, 'lastmod.json');
    writeFileSync(manifestFile, JSON.stringify({ '/a/': '2026-01-10' }));
    const result = resolveLastmods({ root: directory, pages, manifestFile });
    assert.deepEqual(result.dates, { '/a/': '2026-01-10', '/en/a/': null, '/b/': null });
    assert.equal(result.source, 'manifest');
  } finally {
    if (ceiling === undefined) delete process.env.GIT_CEILING_DIRECTORIES;
    else process.env.GIT_CEILING_DIRECTORIES = ceiling;
    rmSync(directory, { recursive: true, force: true });
  }
});
