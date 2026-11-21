import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/*
 * Elementor and our CSS switch layouts at max-width:767px / min-width:768px.
 * With browser zoom or display scaling the viewport can be fractional
 * (e.g. 767.3px): neither query matches, the containers lose both layouts and
 * the shared contact form overflows the page. Mobile queries end at 767.98px
 * instead, so every width below 768px gets the mobile layout.
 */
const MOBILE_MAX = /(max-width\s*:\s*)767px/g;

export function closeMobileBreakpointGap(text) {
  return String(text).replace(MOBILE_MAX, '$1767.98px');
}

const ROOTS = ['wp-content', 'wp-includes'];

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && /\.(?:css|js)$/i.test(entry.name)) yield full;
  }
}

/** Rewrites the mobile breakpoint in every CSS/JS file under dist/; returns the number of files changed. */
export function closeMobileBreakpointGapInAssets(outDir) {
  let changed = 0;
  for (const root of ROOTS) {
    for (const file of walk(path.join(outDir, root))) {
      const source = readFileSync(file, 'utf8');
      const output = closeMobileBreakpointGap(source);
      if (output !== source) {
        writeFileSync(file, output, 'utf8');
        changed += 1;
      }
    }
  }
  return changed;
}
