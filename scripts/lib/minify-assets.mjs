import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { transform } from 'esbuild';

export const MINIFY_TARGET = ['chrome87', 'edge88', 'firefox78', 'safari15'];

const ROOTS = ['wp-content', 'wp-includes'];

// Transform mode treats the file as a classic script: top-level names are not
// renamed (covered by the tests), only local identifiers are shortened.
const JS_OPTIONS = {
  loader: 'js',
  minify: true,
  target: MINIFY_TARGET,
  charset: 'utf8',
  legalComments: 'inline',
};

const CSS_OPTIONS = {
  loader: 'css',
  minify: true,
  target: MINIFY_TARGET,
  charset: 'utf8',
  legalComments: 'inline',
};

export function shouldMinify(relPath) {
  const name = path.posix.basename(String(relPath).replaceAll('\\', '/'));
  if (!/\.(?:css|js)$/i.test(name)) return false;
  return !/\.min(?:[._-]|$)/i.test(name);
}

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
    else if (entry.isFile()) yield full;
  }
}

export async function minifyAssets(outDir) {
  const result = { minified: 0, unchanged: 0, failed: [], bytesBefore: 0, bytesAfter: 0 };
  for (const root of ROOTS) {
    for (const file of walk(path.join(outDir, root))) {
      const rel = path.relative(outDir, file).split(path.sep).join('/');
      if (!shouldMinify(rel)) continue;
      const source = readFileSync(file);
      const before = source.length;
      result.bytesBefore += before;
      try {
        const options = /\.css$/i.test(file) ? CSS_OPTIONS : JS_OPTIONS;
        const { code } = await transform(source.toString('utf8'), options);
        const output = Buffer.from(code, 'utf8');
        if (output.length < before) {
          writeFileSync(file, output);
          result.minified += 1;
          result.bytesAfter += output.length;
        } else {
          result.unchanged += 1;
          result.bytesAfter += before;
        }
      } catch (error) {
        result.failed.push({ file: rel, message: String(error?.message ?? error).split('\n')[0] });
        result.bytesAfter += before;
      }
    }
  }
  return result;
}
