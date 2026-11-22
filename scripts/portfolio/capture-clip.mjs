#!/usr/bin/env node
// Records a portfolio clip (MP4 + first-frame WebP still) of a site served locally.
//
//   node scripts/portfolio/capture-clip.mjs --url=http://127.0.0.1:4205/ --out=legacy-mirror/wp-content/ect-pages/portofoliu/name-clip --vp=desktop
//   node scripts/portfolio/capture-clip.mjs --url=... --out=.../name-clip-mobil --vp=mobile
//
// Frames are captured one by one on a paused page clock (Playwright clock), so heavy sections never drop frames.
// Scrolling is driven by wheel events from the first frame, so smooth-scroll libraries (Lenis, Framer) animate as for a user.
// Desktop: 1440x900 viewport, top 1440x700 scaled to 1280x622. Mobile: 390x844 viewport, top 390x585 scaled to 540x810.
// Output: H.264 High, yuvj420p, 60 fps, 6 s; the encoder retries with a higher CRF until the file is under --max-bytes.
// Chrome runs with a host-resolver allowlist (127.0.0.1, localhost and the --url host), so nothing else can be reached.
//
// Options: --playwright=<dir with node_modules/playwright> (the repo has no Playwright dependency),
//          --ffmpeg=<dir with ffmpeg.exe> (or FFMPEG_DIR), --seconds=6, --fps=60, --settle=2500 (ms of page time before frame 0),
//          --scroll=<px per second of wheel input> (default desktop 520, mobile 420), --max-bytes=1000000.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  if (!m) throw new Error(`Unknown argument: ${a}`);
  return [m[1], m[2] ?? 'true'];
}));

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, clip: { width: 1440, height: 700 }, out: [1280, 622], scroll: 520 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, clip: { width: 390, height: 585 }, out: [540, 810], scroll: 420 },
};

const url = args.url;
const out = args.out;
const vp = VIEWPORTS[args.vp ?? 'desktop'];
if (!url || !out || !vp) {
  console.error('Usage: capture-clip.mjs --url=<local url> --out=<path without extension> --vp=desktop|mobile');
  process.exit(2);
}
const host = new URL(url).hostname;
if (!['127.0.0.1', 'localhost', '[::1]'].includes(host)) throw new Error(`Refusing a non-local url: ${url}`);

const fps = Number(args.fps ?? 60);
const seconds = Number(args.seconds ?? 6);
const settle = Number(args.settle ?? 2500);
const scrollPerSecond = Number(args.scroll ?? vp.scroll);
const maxBytes = Number(args['max-bytes'] ?? 1_000_000);
const ffmpegDir = args.ffmpeg ?? process.env.FFMPEG_DIR ?? '';
const ffmpeg = ffmpegDir ? path.join(ffmpegDir, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg') : 'ffmpeg';

async function loadPlaywright() {
  if (args.playwright) {
    const req = createRequire(pathToFileURL(path.join(path.resolve(args.playwright), 'package.json')));
    return import(pathToFileURL(req.resolve('playwright')).href);
  }
  return import('playwright');
}

function run(cmd, cmdArgs) {
  const r = spawnSync(cmd, cmdArgs, { stdio: ['ignore', 'ignore', 'pipe'], encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${path.basename(cmd)} failed: ${r.stderr?.slice(-800)}`);
}

const playwright = await loadPlaywright();
const { chromium } = playwright.chromium ? playwright : playwright.default;
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost', '--hide-scrollbars'],
});
const frames = mkdtempSync(path.join(os.tmpdir(), 'portfolio-clip-'));
try {
  const { clip, out: size, scroll, ...contextOptions } = vp;
  const context = await browser.newContext({ ...contextOptions, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const offsite = [];
  page.on('request', r => { const h = new URL(r.url()).hostname; if (/^https?:/.test(r.url()) && h !== host) offsite.push(r.url()); });
  await page.clock.install({ time: new Date('2026-11-22T10:00:00Z') });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.clock.runFor(settle);
  await page.mouse.move(clip.width / 2, clip.height / 2);

  const total = Math.round(fps * seconds);
  const step = 1000 / fps;
  const wheelPerFrame = scrollPerSecond / fps;
  let pending = 0;
  for (let i = 0; i < total; i += 1) {
    const file = path.join(frames, `f${String(i).padStart(4, '0')}.png`);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, ...clip }, animations: 'allow' });
    pending += wheelPerFrame;
    if (pending >= 1) {
      const delta = Math.floor(pending);
      pending -= delta;
      await page.mouse.wheel(0, delta);
    }
    await page.clock.runFor(step);
  }
  await context.close();
  if (offsite.length) console.warn(`Blocked off-site requests (${offsite.length}):\n  ${[...new Set(offsite)].slice(0, 10).join('\n  ')}`);

  mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  const scale = `scale=${size[0]}:${size[1]}:flags=lanczos`;
  run(ffmpeg, ['-v', 'error', '-y', '-i', path.join(frames, 'f0000.png'), '-vf', scale, '-c:v', 'libwebp', '-quality', '82', '-compression_level', '6', `${out}.webp`]);
  let crf = 24;
  for (;;) {
    run(ffmpeg, ['-v', 'error', '-y', '-framerate', String(fps), '-i', path.join(frames, 'f%04d.png'),
      '-vf', `${scale},format=yuvj420p`, '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(crf),
      '-r', String(fps), '-movflags', '+faststart', '-an', `${out}.mp4`]);
    const bytes = statSync(`${out}.mp4`).size;
    if (bytes < maxBytes || crf >= 36) { console.log(`${out}.mp4: ${bytes} bytes (crf ${crf}); ${out}.webp: ${statSync(`${out}.webp`).size} bytes`); break; }
    crf += 2;
  }
} finally {
  await browser.close();
  rmSync(frames, { recursive: true, force: true });
}
