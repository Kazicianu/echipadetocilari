import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createContactHandler, deliverResend, validateContact } from '../server/contact.mjs';
import { enhanceContactForms } from '../scripts/lib/contact-forms.mjs';

const NOW = 1_800_000_000_000;
const env = {
  RESEND_API_KEY: 'test-key-not-real',
  CONTACT_FROM: 'site@echipadetocilari.ro',
  TURNSTILE_SITE_KEY: 'test-public-key',
  TURNSTILE_SECRET_KEY: 'test-secret-key',
  VERCEL_ENV: 'production',
};
const valid = {
  name: 'Test Visitor', company: '', email: 'visitor@example.com', phone: '+40 721 123 456',
  message: 'A test message that is never sent.', website: '', startedAt: NOW - 5000,
  turnstileToken: 'test-token', page: '/contact/', language: 'en',
  submissionId: 'a2f32c0e-5e75-453b-806d-ea893c76a977',
};
const challengeOK = { success: true, action: 'contact', hostname: 'echipadetocilari.ro' };

async function request({ method = 'POST', body = valid, headers = {}, options = {} } = {}) {
  const req = { method, body, headers: { origin: 'https://echipadetocilari.ro', 'content-type': 'application/json', ...headers }, socket: { remoteAddress: '127.0.0.1' } };
  const res = { headers: {}, setHeader(key, value) { this.headers[key] = value; }, end(value) { this.body = JSON.parse(value); } };
  await createContactHandler({ env, now: () => NOW, fetchImpl: async () => ({ ok: true, json: async () => challengeOK }), deliver: async () => {}, rateLimit: () => true, log: () => {}, ...options })(req, res);
  return res;
}

test('GET exposes only the public challenge configuration', async () => {
  const response = await request({ method: 'GET' });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { ok: true, protection: 'turnstile', siteKey: env.TURNSTILE_SITE_KEY, developmentBypass: false });
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('valid submission delivers normalized data only after verified Turnstile', async () => {
  const events = [];
  const response = await request({ body: { ...valid, name: '  Test Visitor  ', to: 'attacker@example.com' }, options: {
    fetchImpl: async (url, init) => {
      events.push('verify');
      assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
      assert.equal(JSON.parse(init.body).secret, env.TURNSTILE_SECRET_KEY);
      return { ok: true, json: async () => challengeOK };
    },
    deliver: async (fields, _env, config) => {
      events.push('deliver');
      assert.equal(fields.name, 'Test Visitor');
      assert.equal(fields.turnstileToken, undefined);
      assert.equal(fields.to, undefined);
      assert.deepEqual(config.to, ['contact@echipadetocilari.ro']);
    },
  } });
  assert.deepEqual(events, ['verify', 'deliver']);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { ok: true });
});

test('invalid fields, header injection, honeypots and quick submissions cannot reach delivery', async () => {
  for (const change of [
    { email: 'not-an-email' }, { email: 'a@example.com\r\nBcc:spam@example.com' },
    { name: 'Test\nBcc:bad' }, { message: 'short' }, { message: 'x'.repeat(5001) },
    { phone: '#####' }, { website: 'https://spam.example' }, { website: undefined },
    { startedAt: NOW - 1000 }, { startedAt: NOW + 10000 }, { startedAt: NOW - 86_400_001 },
    { submissionId: '../bad' }, { page: '//untrusted.example' }, { turnstileToken: '' },
  ]) {
    const response = await request({ body: { ...valid, ...change }, options: {
      deliver: async () => assert.fail('Invalid request reached delivery'),
      fetchImpl: async () => assert.fail('Invalid request reached challenge service'),
    } });
    assert.equal(response.statusCode, 400, JSON.stringify(change));
    assert.equal(response.body.ok, false);
  }
});

test('rejects untrusted/missing origins, unsupported media and malformed/oversized JSON', async () => {
  const cases = [
    [{ headers: { origin: 'https://attacker.example' } }, 403],
    [{ headers: { origin: '' } }, 403],
    [{ headers: { 'sec-fetch-site': 'cross-site' } }, 403],
    [{ method: 'DELETE' }, 405],
    [{ headers: { 'content-type': 'text/plain' } }, 415],
    [{ body: '{bad json' }, 400],
    [{ body: [] }, 400],
    [{ headers: { 'content-length': '17000' } }, 413],
    [{ body: { ...valid, message: 'x'.repeat(17000) } }, 413],
  ];
  for (const [input, code] of cases) assert.equal((await request(input)).statusCode, code);
});

test('missing secrets fail closed, including when bypass is set on preview/production', async () => {
  for (const VERCEL_ENV of ['preview', 'production']) {
    const response = await request({ options: { env: { ...env, VERCEL_ENV, NODE_ENV: 'development', CONTACT_DEV_BYPASS_TURNSTILE: 'true', TURNSTILE_SECRET_KEY: '' } } });
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, { ok: false, error: 'unavailable' });
  }
  assert.equal((await request({ options: { env: { ...env, RESEND_API_KEY: '' } } })).statusCode, 503);
});

test('configured recipients support a small validated list and deduplicate without trusting form input', async () => {
  const messages = [];
  const response = await request({ body: { ...valid, to: ['attacker@example.com'] }, options: {
    env: { ...env, CONTACT_TO: ' contact@echipadetocilari.ro , second@example.com, CONTACT@ECHIPADETOCILARI.RO ' },
    deliver: deliverResend,
    fetchImpl: async (url, init) => {
      if (url.endsWith('/siteverify')) return { ok: true, json: async () => challengeOK };
      assert.equal(url, 'https://api.resend.com/emails');
      messages.push(JSON.parse(init.body));
      return { ok: true, json: async () => ({ id: 'accepted-multi-recipient-message' }) };
    },
  } });
  assert.equal(response.statusCode, 200);
  assert.equal(messages.length, 1);
  assert.deepEqual(messages[0].to, ['contact@echipadetocilari.ro', 'second@example.com']);
  assert.equal(messages[0].reply_to, valid.email);
  assert.equal((await request({ options: { env: { ...env, CONTACT_TO: 'one@example.com,two@example.com,three@example.com,four@example.com,five@example.com' } } })).statusCode, 200);
});

test('invalid recipient lists fail closed before challenge validation or email delivery', async () => {
  for (const CONTACT_TO of [
    'good@example.com,invalid', 'good@example.com,', ',good@example.com',
    'good@example.com,,other@example.com', 'Display Name <good@example.com>',
    'good@example.com;other@example.com', 'good@example.com\r\nBcc:other@example.com',
    `${'a'.repeat(245)}@example.com`,
    'one@example.com,two@example.com,three@example.com,four@example.com,five@example.com,six@example.com',
  ]) {
    const response = await request({ options: {
      env: { ...env, CONTACT_TO },
      fetchImpl: async () => assert.fail('Invalid recipients reached challenge service'),
      deliver: async () => assert.fail('Invalid recipients reached delivery'),
    } });
    assert.equal(response.statusCode, 503, CONTACT_TO);
    assert.deepEqual(response.body, { ok: false, error: 'unavailable' });
  }
});

test('explicit development bypass works only with local origin and never calls Turnstile', async () => {
  const options = {
    env: { ...env, VERCEL_ENV: 'development', NODE_ENV: 'development', CONTACT_DEV_BYPASS_TURNSTILE: 'true', TURNSTILE_SECRET_KEY: '', TURNSTILE_SITE_KEY: '', CONTACT_ALLOWED_ORIGINS: 'http://localhost:3000' },
    fetchImpl: async () => assert.fail('Local bypass called challenge service'),
  };
  assert.equal((await request({ options, body: { ...valid, turnstileToken: '' }, headers: { origin: 'http://localhost:3000' } })).statusCode, 200);
  assert.equal((await request({ options })).statusCode, 403);
});

test('explicit Vercel WAF mode works on preview/production without contacting Turnstile', async () => {
  for (const VERCEL_ENV of ['preview', 'production']) {
    let deliveries = 0;
    const options = {
      env: { ...env, VERCEL: '1', VERCEL_ENV, CONTACT_SPAM_PROTECTION: 'vercel-waf', TURNSTILE_SITE_KEY: '', TURNSTILE_SECRET_KEY: '' },
      fetchImpl: async () => assert.fail('WAF mode called Turnstile'),
      deliver: async () => { deliveries++; },
    };
    const configuration = await request({ method: 'GET', options });
    assert.equal(configuration.statusCode, 200);
    assert.deepEqual(configuration.body, { ok: true, protection: 'vercel-waf', siteKey: null, developmentBypass: false });
    assert.equal((await request({ options, body: { ...valid, turnstileToken: '' } })).statusCode, 200);
    assert.equal(deliveries, 1);
    assert.equal((await request({ options, body: { ...valid, website: 'spam' } })).statusCode, 400);
    assert.equal((await request({ options, body: { ...valid, startedAt: NOW } })).statusCode, 400);
    assert.equal((await request({ options: { ...options, rateLimit: () => false } })).statusCode, 429);
    const failed = await request({ options: { ...options, deliver: async () => { throw new Error('provider offline'); } } });
    assert.equal(failed.statusCode, 502);
    assert.deepEqual(failed.body, { ok: false, error: 'delivery' });
    assert.equal(deliveries, 1);
  }
});

test('Vercel WAF mode cannot silently activate locally, off platform or through invalid settings', async () => {
  for (const overrides of [
    { VERCEL_ENV: 'development', VERCEL: '1' },
    { VERCEL_ENV: '', VERCEL: '1' },
    { VERCEL_ENV: 'production', VERCEL: '' },
    { VERCEL_ENV: 'preview', VERCEL: '0' },
    { VERCEL_ENV: 'production', VERCEL: '1', CONTACT_SPAM_PROTECTION: 'none' },
    { VERCEL_ENV: 'production', VERCEL: '1', CONTACT_SPAM_PROTECTION: '' },
  ]) {
    const response = await request({ method: 'GET', options: { env: {
      ...env, CONTACT_SPAM_PROTECTION: 'vercel-waf', TURNSTILE_SITE_KEY: '', TURNSTILE_SECRET_KEY: '',
      NODE_ENV: 'development', CONTACT_DEV_BYPASS_TURNSTILE: 'true', ...overrides,
    } } });
    assert.equal(response.statusCode, 503, JSON.stringify(overrides));
    assert.deepEqual(response.body, { ok: false, error: 'unavailable' });
  }
});

test('Turnstile denial, mismatched action/host and service failures do not send mail', async () => {
  for (const result of [{ ...challengeOK, success: false }, { ...challengeOK, action: 'login' }, { ...challengeOK, hostname: 'attacker.example' }]) {
    const response = await request({ options: {
      fetchImpl: async () => ({ ok: true, json: async () => result }),
      deliver: async () => assert.fail('Invalid challenge reached delivery'),
    } });
    assert.equal(response.statusCode, 400);
    assert.equal(response.body.error, 'challenge');
  }
  const response = await request({ options: { fetchImpl: async () => { throw new Error('offline'); } } });
  assert.equal(response.statusCode, 503);
});

test('rate limit and delivery failures never claim success or expose secrets', async () => {
  const limited = await request({ options: { rateLimit: () => false } });
  assert.equal(limited.statusCode, 429);
  assert.equal(limited.headers['Retry-After'], '900');
  const errors = [];
  const failed = await request({ options: { deliver: async () => { throw new Error('secret API key and visitor data'); }, log: (...args) => errors.push(args) } });
  assert.equal(failed.statusCode, 502);
  assert.deepEqual(failed.body, { ok: false, error: 'delivery' });
  assert.equal(JSON.stringify(errors).includes('secret'), false);
});

test('Resend uses fixed sender/recipient, reply_to and stable private idempotency keys', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return { ok: true, json: async () => ({ id: 'test-accepted-message-id' }) };
  };
  const fields = validateContact(valid, NOW).fields;
  const config = { from: env.CONTACT_FROM, to: ['contact@echipadetocilari.ro'] };
  await deliverResend(fields, env, config, fetchImpl);
  await deliverResend(fields, env, config, fetchImpl);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].init.headers.Authorization, `Bearer ${env.RESEND_API_KEY}`);
  assert.equal(calls[0].init.headers['Idempotency-Key'], calls[1].init.headers['Idempotency-Key']);
  assert.match(calls[0].init.headers['Idempotency-Key'], /^contact\/[a-f0-9]{64}$/);
  const payload = JSON.parse(calls[0].init.body);
  assert.deepEqual(payload.to, ['contact@echipadetocilari.ro']);
  assert.equal(payload.reply_to, valid.email);
  assert.equal(payload.html, undefined);
  assert.equal(payload.text.includes(valid.message), true);
  await deliverResend({ ...fields, message: 'A changed message' }, env, config, fetchImpl);
  assert.notEqual(calls[0].init.headers['Idempotency-Key'], calls[2].init.headers['Idempotency-Key']);
  for (const response of [{ ok: false, json: async () => ({ message: 'provider error' }) }, { ok: true, json: async () => ({}) }]) {
    await assert.rejects(deliverResend(fields, env, config, async () => response), /delivery_unconfirmed/);
  }
});

test('actual RO forms and generated EN form shell use the independent controller accessibly', () => {
  for (const file of ['index.html', 'contact/index.html', 'portofoliu/index.html', 'administrare-site/index.html', 'creare-site-web/index.html', 'servicii-seo/index.html']) {
    const original = readFileSync(new URL(`../legacy-mirror/${file}`, import.meta.url), 'utf8');
    for (const locale of ['ro', 'en']) {
      const result = enhanceContactForms(original, { locale });
      assert.match(result, new RegExp(`data-ect-contact="${locale}"`));
      assert.equal((result.match(/src="\/wp-content\/ect-contact.js"/g) || []).length, 1);
      assert.doesNotMatch(result, /data-widget_type="form\.default"/);
      const form = result.match(/<form\b[\s\S]*?<\/form>/)[0];
      assert.match(form, /action="\/api\/contact"/);
      assert.doesNotMatch(form, /name="(?:form_fields\[|post_id|form_id|queried_id|referer_title)/);
      assert.match(form, /name="phone"[^>]*autocomplete="tel"/);
      assert.doesNotMatch(form, /\bpattern=/);
      assert.match(form, /role="status" aria-live="polite"/);
      assert.match(form, /name="website" tabindex="-1"/);
      assert.match(form, new RegExp(`aria-label="${locale === 'en' ? 'Message' : 'Mesaj'}"`));
      assert.equal(enhanceContactForms(result, { locale }), result);
    }
  }
});

test('browser form blocks legacy submit, preserves errors and deduplicates manual retries', async () => {
  const listeners = {};
  const posted = [];
  const status = { textContent: '', dataset: {}, focus() {} };
  const button = { disabled: false };
  const fields = { name: valid.name, company: '', email: valid.email, phone: valid.phone, message: valid.message, website: '' };
  class FakeForm {
    dataset = { ectContact: 'en' };
    elements = { namedItem: () => ({ focus() {} }) };
    resetCount = 0;
    matches() { return true; }
    querySelector(selector) { return selector === '.ect-contact-status' ? status : selector.startsWith('button') ? button : {}; }
    reportValidity() { return true; }
    setAttribute() {}
    removeAttribute() {}
    addEventListener() {}
    reset() { this.resetCount += 1; }
  }
  const form = new FakeForm();
  let challengeCallback;
  const context = {
    document: { addEventListener: (event, listener, capture) => { listeners[event] = { listener, capture }; }, querySelectorAll: () => [form] },
    HTMLFormElement: FakeForm,
    FormData: class { get(key) { return fields[key]; } },
    window: { location: { pathname: '/en/contact/', hostname: 'echipadetocilari.ro' }, turnstile: {
      render: (_target, options) => { challengeCallback = options.callback; challengeCallback('browser-token'); return 'widget'; },
      reset: () => challengeCallback('fresh-browser-token'),
    } },
    fetch: async (_url, options) => {
      if (options.method !== 'POST') return { ok: true, json: async () => ({ ok: true, protection: 'turnstile', siteKey: 'public-key' }) };
      posted.push(JSON.parse(options.body));
      const success = posted.length === 3;
      return { ok: success, json: async () => success ? { ok: true } : { ok: false, error: 'delivery' } };
    },
    crypto: { randomUUID: () => 'a2f32c0e-5e75-453b-806d-ea893c76a977' },
    AbortSignal, setTimeout, clearTimeout,
  };
  vm.runInNewContext(readFileSync(new URL('../legacy-mirror/wp-content/ect-contact.js', import.meta.url), 'utf8'), context);
  assert.equal(listeners.submit.capture, true);
  let prevented = 0;
  let stopped = 0;
  const submit = () => listeners.submit.listener({ target: form, preventDefault: () => prevented++, stopImmediatePropagation: () => stopped++ });
  await submit();
  assert.equal(form.resetCount, 0);
  assert.match(status.textContent, /could not confirm/);
  assert.equal(button.disabled, false);
  await submit();
  assert.equal(posted[0].submissionId, posted[1].submissionId);
  assert.equal(posted[0].turnstileToken, 'browser-token');
  assert.equal(posted[1].turnstileToken, 'fresh-browser-token');
  await submit();
  assert.equal(form.resetCount, 1);
  assert.match(status.textContent, /Thank you/);
  assert.equal(prevented, 3);
  assert.equal(stopped, 3);
});

test('browser WAF mode skips the widget only on HTTPS deployed hosts and handles edge rate limits', async () => {
  for (const [hostname, protocol, protection, allowed] of [
    ['echipadetocilari.ro', 'https:', 'vercel-waf', true],
    ['preview.vercel.app', 'https:', 'vercel-waf', true],
    ['echipadetocilari.ro', 'http:', 'vercel-waf', false],
    ['localhost', 'https:', 'vercel-waf', false],
    ['echipadetocilari.ro', 'https:', undefined, false],
  ]) {
    let submit;
    const posted = [];
    const status = { textContent: '', dataset: {}, focus() {} };
    const button = { disabled: false };
    class FakeForm {
      dataset = { ectContact: 'en' };
      resetCount = 0;
      matches() { return true; }
      querySelector(selector) { return selector === '.ect-contact-status' ? status : button; }
      reportValidity() { return true; }
      setAttribute() {}
      removeAttribute() {}
      addEventListener() {}
      reset() { this.resetCount++; }
    }
    const form = new FakeForm();
    vm.runInNewContext(readFileSync(new URL('../legacy-mirror/wp-content/ect-contact.js', import.meta.url), 'utf8'), {
      document: {
        addEventListener: (_event, listener) => { submit = listener; },
        querySelectorAll: () => [form],
        createElement: () => assert.fail('WAF mode attempted to load the Turnstile script'),
      },
      HTMLFormElement: FakeForm,
      FormData: class { get(key) { return valid[key]; } },
      window: { location: { pathname: '/en/contact/', hostname, protocol } },
      crypto: { randomUUID: () => valid.submissionId },
      AbortSignal, setTimeout, clearTimeout,
      fetch: async (_url, options) => {
        if (options.method !== 'POST') return { ok: true, json: async () => ({ ok: true, protection, siteKey: null, developmentBypass: false }) };
        posted.push(JSON.parse(options.body));
        if (posted.length === 1) return { ok: false, status: 429, json: async () => { throw new Error('HTML response from WAF'); } };
        return { ok: true, status: 200, json: async () => ({ ok: true }) };
      },
    });
    const event = { target: form, preventDefault() {}, stopImmediatePropagation() {} };
    await submit(event);
    assert.equal(posted.length, allowed ? 1 : 0, hostname + protocol);
    assert.equal(form.resetCount, 0);
    assert.equal(button.disabled, false);
    if (allowed) {
      assert.match(status.textContent, /Too many attempts/);
      assert.equal(posted[0].turnstileToken, '');
      await submit(event);
      assert.equal(posted[0].submissionId, posted[1].submissionId);
      assert.equal(form.resetCount, 1);
      assert.match(status.textContent, /Thank you/);
    } else {
      assert.match(status.textContent, /temporarily unavailable/);
    }
  }
});
