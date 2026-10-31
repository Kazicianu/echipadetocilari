/** Local preview of the static output and the same contact API used on Vercel. */
import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContactHandler } from '../server/contact.mjs';
import { junkRedirects } from './lib/junk-redirects.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

export function createPreviewServer({ outDir = root, port = 3000, env = process.env } = {}) {
 const staticRoot = path.resolve(outDir);
 const contact = createContactHandler({ env: {
  ...env,
  CONTACT_ALLOWED_ORIGINS: [env.CONTACT_ALLOWED_ORIGINS, `http://localhost:${port}`, `http://127.0.0.1:${port}`].filter(Boolean).join(','),
 } });
 return http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (url.pathname === '/api/contact' || url.pathname === '/api/contact/') {
      let size = 0;
      const parts = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 16_384) { res.writeHead(413); res.end(); return; }
        parts.push(chunk);
      }
      req.body = Buffer.concat(parts).toString('utf8') || undefined;
      await contact(req, res);
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const redirect = junkRedirects.find(({ from }) => url.pathname === from || url.pathname === from.replace(/\/$/, ''));
    if (redirect) {
      const destination = new URL(redirect.to, url.origin);
      destination.search = url.search;
      res.writeHead(308, { Location: destination.pathname + destination.search + destination.hash });
      res.end();
      return;
    }
    let file = path.resolve(staticRoot, '.' + decodeURIComponent(url.pathname));
    if (file !== staticRoot && !file.startsWith(staticRoot + path.sep)) { res.writeHead(403); res.end(); return; }
    if (existsSync(file) && statSync(file).isDirectory()) {
      if (!url.pathname.endsWith('/')) { res.writeHead(308, { Location: url.pathname + '/' + url.search }); res.end(); return; }
      file = path.join(file, 'index.html');
    }
    if (!existsSync(file) || !statSync(file).isFile()) {
      // Like the host: a missing path gets the generated 404 page when the build wrote one.
      const notFound = path.join(staticRoot, '404.html');
      if (existsSync(notFound) && statSync(notFound).isFile()) {
        res.writeHead(404, { 'Content-Type': types['.html'], 'Cache-Control': 'no-store' });
        if (req.method === 'HEAD') res.end();
        else createReadStream(notFound).pipe(res);
        return;
      }
      res.writeHead(404); res.end('Not found'); return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    if (req.method === 'HEAD') res.end();
    else createReadStream(file).pipe(res);
  } catch { res.writeHead(500); res.end('Preview error'); }
 });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
 const port = Number(process.env.PORT || 3000);
 createPreviewServer({ port }).listen(port, '127.0.0.1', () => console.log(`Preview: http://localhost:${port}`));
}
