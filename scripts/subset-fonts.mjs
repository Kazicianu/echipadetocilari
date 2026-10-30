/**
 * Builds the smaller Montserrat files used by the site. The originals stay in
 * the repository untouched; the CSS points at the subsets.
 *
 * Requires: pip install fonttools brotli
 * Run:      node scripts/subset-fonts.mjs
 *
 * - latin-ext normal: only the Romanian letters (variable axes kept).
 * - italic: static weight 300 (the only italic weight the site uses), latin
 *   and Romanian letters as separate files.
 * - ect-pages Montserrat-Variable: latin + Romanian + the few symbols the
 *   ECT pages use, all OpenType features kept (tnum is used).
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const F = 'legacy-mirror/wp-content/uploads/elementor/google-fonts/fonts';
const ECT_DIR = 'legacy-mirror/wp-content/ect-pages/fonts';

const RO = 'U+0102-0103,U+015E-015F,U+0162-0163,U+0218-021B';
const LAT = 'U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2013-2014,U+2018-201E,U+2022,U+2026,U+2039-203A,U+20AC,U+2122,U+2212';
const ECT = `${LAT},U+0102-0103,U+015E-015F,U+0162-0163,U+0218-021B,U+2020-2021,U+2030,U+2190-2193,U+2215`;

const tmp = mkdtempSync(join(tmpdir(), 'subset-fonts-'));

function py(module, args) {
  execFileSync('python', ['-m', module, ...args], { stdio: 'inherit' });
}

function subset(input, unicodes, output) {
  py('fontTools.subset', [input, `--unicodes=${unicodes}`, '--flavor=woff2', '--layout-features=*', `--output-file=${output}`]);
}

function instance300(input, name) {
  const out = join(tmp, name);
  py('fontTools.varLib.instancer', [input, 'wght=300', '-o', out]);
  return out;
}

try {
  subset(`${F}/montserrat-jtusjig1_i6t8kchkm459wdhyzbi.woff2`, RO, `${F}/montserrat-latin-ext-ro.woff2`);

  const italicLatin = instance300(`${F}/montserrat-jtuqjig1_i6t8kchkm459wxrys7m.woff2`, 'italic-latin-300.ttf');
  subset(italicLatin, LAT, `${F}/montserrat-italic-300-latin.woff2`);

  const italicExt = instance300(`${F}/montserrat-jtuqjig1_i6t8kchkm459wxrxy7mw9c.woff2`, 'italic-latin-ext-300.ttf');
  subset(italicExt, RO, `${F}/montserrat-italic-300-latin-ext-ro.woff2`);

  subset(`${ECT_DIR}/Montserrat-Variable.woff2`, ECT, `${ECT_DIR}/Montserrat-Variable-latin-ro.woff2`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

for (const f of [`${F}/montserrat-latin-ext-ro.woff2`, `${F}/montserrat-italic-300-latin.woff2`, `${F}/montserrat-italic-300-latin-ext-ro.woff2`, `${ECT_DIR}/Montserrat-Variable-latin-ro.woff2`]) {
  console.log(`${f}: ${(statSync(f).size / 1024).toFixed(1)} KB`);
}
