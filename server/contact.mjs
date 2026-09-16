import { createHash } from 'node:crypto';

const MAX_BODY_BYTES = 16_384;
const EMAIL = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
const CONTROL = /[\u0000-\u001f\u007f]/;
const LIMIT_WINDOW = 15 * 60_000;
const attempts = new Map();

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

function header(req, name) {
  const value = req.headers?.[name];
  return typeof value === 'string' ? value : '';
}

/** Only configured site origins are trusted; never reflect the Host header. */
function allowedOrigins(env) {
  const origins = new Set(['https://echipadetocilari.ro', 'https://www.echipadetocilari.ro']);
  for (const value of [env.VERCEL_URL && `https://${env.VERCEL_URL}`, env.VERCEL_PROJECT_PRODUCTION_URL && `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`, ...(env.CONTACT_ALLOWED_ORIGINS || '').split(',')]) {
    if (!value) continue;
    try {
      const url = new URL(value.trim());
      const local = env.VERCEL_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(url.hostname);
      if (url.protocol === 'https:' || (local && url.protocol === 'http:')) origins.add(url.origin);
    } catch { /* Ignore malformed deployment configuration. */ }
  }
  return origins;
}

function configuration(env) {
  const from = (env.CONTACT_FROM || '').trim();
  const recipients = (env.CONTACT_TO || 'contact@echipadetocilari.ro').split(',').map((address) => address.trim());
  if (recipients.length > 5 || recipients.some((address) => address.length > 254 || !EMAIL.test(address))) return null;
  const to = recipients.filter((address, index) => recipients.findIndex((candidate) => candidate.toLowerCase() === address.toLowerCase()) === index);
  const protection = env.CONTACT_SPAM_PROTECTION || 'turnstile';
  if (!['turnstile', 'vercel-waf'].includes(protection)) return null;
  // This explicit mode is an operator assertion that the persistent Vercel WAF rule
  // is already active. Never infer it from missing Turnstile credentials.
  if (protection === 'vercel-waf' && !(env.VERCEL === '1' && ['preview', 'production'].includes(env.VERCEL_ENV))) return null;
  const developmentBypass = env.CONTACT_DEV_BYPASS_TURNSTILE === 'true' && env.NODE_ENV === 'development' && (!env.VERCEL_ENV || env.VERCEL_ENV === 'development');
  const requireChallenge = protection === 'turnstile' && !developmentBypass;
  if (!env.RESEND_API_KEY || !EMAIL.test(from) ||
      (requireChallenge && (!env.TURNSTILE_SITE_KEY || !env.TURNSTILE_SECRET_KEY))) return null;
  return { from, to, protection, requireChallenge, siteKey: protection === 'turnstile' ? env.TURNSTILE_SITE_KEY || null : null, developmentBypass };
}

function readBody(req) {
  if (Number(header(req, 'content-length')) > MAX_BODY_BYTES) return { error: 'too_large', status: 413 };
  try {
    const raw = req.body;
    const encoded = typeof raw === 'string' ? raw : JSON.stringify(raw);
    if (!encoded) return { error: 'invalid', status: 400 };
    if (Buffer.byteLength(encoded, 'utf8') > MAX_BODY_BYTES) return { error: 'too_large', status: 413 };
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'invalid', status: 400 };
    return { body };
  } catch {
    return { error: 'invalid', status: 400 };
  }
}

export function validateContact(body, now = Date.now(), { requireChallenge = true } = {}) {
  const fields = {};
  for (const [key, min, max] of [['name', 2, 120], ['company', 0, 160], ['email', 3, 254], ['phone', 5, 40], ['message', 10, 5000]]) {
    const value = body[key] ?? '';
    if (typeof value !== 'string') return { error: 'invalid', field: key };
    fields[key] = value.trim();
    if (fields[key].length < min || fields[key].length > max ||
        (key !== 'message' && CONTROL.test(fields[key])) ||
        (key === 'message' && /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(fields[key]))) return { error: 'invalid', field: key };
  }
  if (!EMAIL.test(fields.email)) return { error: 'invalid', field: 'email' };
  if (!/^[+\d\s().#*=-]+$/.test(fields.phone) || fields.phone.replace(/\D/g, '').length < 5) return { error: 'invalid', field: 'phone' };
  if (typeof body.website !== 'string' || body.website.trim()) return { error: 'spam' };
  if (typeof body.startedAt !== 'number' || !Number.isFinite(body.startedAt) || now - body.startedAt < 3000 || now - body.startedAt > 24 * 60 * 60_000) return { error: 'timing' };
  if (requireChallenge && (typeof body.turnstileToken !== 'string' || !body.turnstileToken || body.turnstileToken.length > 2048)) return { error: 'challenge' };
  if (typeof body.submissionId !== 'string' || !/^[a-f0-9-]{36}$/i.test(body.submissionId)) return { error: 'invalid', field: 'submissionId' };
  if (typeof body.page !== 'string' || !body.page.startsWith('/') || body.page.startsWith('//') || body.page.length > 300 || CONTROL.test(body.page)) return { error: 'invalid', field: 'page' };
  return { fields: { ...fields, page: body.page, language: body.language === 'en' ? 'en' : 'ro', submissionId: body.submissionId } };
}

/** Additional best-effort limit per warm function; configured Turnstile/WAF protects across instances. */
function allowAttempt(req, now) {
  const ip = header(req, 'x-vercel-forwarded-for').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  const key = createHash('sha256').update(ip).digest('hex');
  for (const [entry, value] of attempts) if (now >= value.until) attempts.delete(entry);
  let bucket = attempts.get(key);
  if (!bucket) {
    if (attempts.size >= 5000) return false;
    bucket = { count: 0, until: now + LIMIT_WINDOW };
    attempts.set(key, bucket);
  }
  bucket.count += 1;
  return bucket.count <= 5;
}

async function verifyChallenge(token, env, origins, fetchImpl) {
  const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('challenge_unavailable');
  const result = await response.json();
  const hosts = new Set([...origins].map((origin) => new URL(origin).hostname));
  return result.success === true && result.action === 'contact' && hosts.has(result.hostname);
}

export async function deliverResend(fields, env, config, fetchImpl = globalThis.fetch) {
  const payload = {
    from: `Echipa de Tocilari <${config.from}>`,
    to: config.to,
    reply_to: fields.email,
    subject: `Mesaj nou de pe site — ${fields.name}`,
    text: [
      `Nume: ${fields.name}`, `Companie: ${fields.company || '—'}`, `Email: ${fields.email}`,
      `Telefon: ${fields.phone}`, `Pagina: ${fields.page}`, `Limba: ${fields.language}`,
      '', 'Mesaj:', fields.message,
    ].join('\n'),
  };
  // A manual retry with a fresh challenge but identical form contents must not send twice.
  const idempotencyKey = 'contact/' + createHash('sha256').update(fields.submissionId + JSON.stringify(payload)).digest('hex');
  const response = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  // A queued provider message is required. Final inbox delivery is visible in Resend's dashboard.
  if (!response.ok || typeof result.id !== 'string' || !result.id) throw new Error('delivery_unconfirmed');
}

/** Dependency injection keeps tests completely offline: no email or challenge calls. */
export function createContactHandler({ env = process.env, now = Date.now, fetchImpl = globalThis.fetch, deliver = deliverResend, rateLimit = allowAttempt, log = console.error } = {}) {
  return async function contact(req, res) {
    const method = req.method?.toUpperCase();
    if (!['GET', 'POST'].includes(method)) {
      res.setHeader('Allow', 'GET, POST');
      return json(res, 405, { ok: false, error: 'method' });
    }
    const origins = allowedOrigins(env);
    const origin = header(req, 'origin');
    if ((origin && !origins.has(origin)) || header(req, 'sec-fetch-site') === 'cross-site' || (method === 'POST' && !origin)) return json(res, 403, { ok: false, error: 'origin' });
    const config = configuration(env);
    if (!config) return json(res, 503, { ok: false, error: 'unavailable' });
    if (config.developmentBypass && method === 'POST' && !['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) return json(res, 403, { ok: false, error: 'origin' });
    if (method === 'GET') return json(res, 200, { ok: true, protection: config.protection, siteKey: config.siteKey, developmentBypass: config.developmentBypass });
    if (!/^application\/json(?:;|$)/i.test(header(req, 'content-type'))) return json(res, 415, { ok: false, error: 'content_type' });
    const parsed = readBody(req);
    if (parsed.error) return json(res, parsed.status, { ok: false, error: parsed.error });
    if (!rateLimit(req, now())) {
      res.setHeader('Retry-After', '900');
      return json(res, 429, { ok: false, error: 'rate_limit' });
    }
    const validated = validateContact(parsed.body, now(), { requireChallenge: config.requireChallenge });
    if (validated.error) return json(res, 400, { ok: false, ...validated });
    try {
      if (config.requireChallenge && !await verifyChallenge(parsed.body.turnstileToken, env, origins, fetchImpl)) return json(res, 400, { ok: false, error: 'challenge' });
    } catch {
      log('contact: challenge service unavailable');
      return json(res, 503, { ok: false, error: 'unavailable' });
    }
    try {
      await deliver(validated.fields, env, config, fetchImpl);
      return json(res, 200, { ok: true });
    } catch {
      // Do not log submitted content, addresses, tokens, provider replies or credentials.
      log('contact: mail delivery could not be confirmed');
      return json(res, 502, { ok: false, error: 'delivery' });
    }
  };
}
