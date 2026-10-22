import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { consentCopy } from './privacy.mjs';

const runtimeUrl = new URL('../../legacy-mirror/wp-content/ect-pages/consent.js', import.meta.url);
const stylesUrl = new URL('../../legacy-mirror/wp-content/ect-pages/consent.css', import.meta.url);
const runtime = readFileSync(runtimeUrl, 'utf8');
const GA_ID = 'G-PGM4B3VM9Z';
const GA_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
const DAY = 24 * 60 * 60 * 1000;
const plain = value => JSON.parse(JSON.stringify(value));

// ─── a small fake DOM: just what consent.js touches ─────────────────────────

class FakeNode {
  constructor(document) { this.ownerDocument = document; this.parentNode = null; this.childNodes = []; }
  get nextSibling() { const siblings = this.parentNode?.childNodes || []; return siblings[siblings.indexOf(this) + 1] || null; }
  get textContent() { return this.childNodes.map(node => node.textContent).join(''); }
}

class FakeText extends FakeNode {
  constructor(document, data) { super(document); this.nodeType = 3; this.data = String(data); }
  get textContent() { return this.data; }
}

function parseSelector(selector) {
  const match = selector.trim().match(/^([a-z][a-z0-9]*)?((?:\.[\w-]+|\[[\w-]+(?:="[^"]*")?\])*)$/i);
  if (!match) throw new Error(`fake DOM cannot match selector ${selector}`);
  const parts = [...match[2].matchAll(/\.([\w-]+)|\[([\w-]+)(?:="([^"]*)")?\]/g)];
  return element => element.nodeType === 1 &&
    (!match[1] || element.tagName === match[1].toUpperCase()) &&
    parts.every(([, className, name, value]) => className
      ? element.classList.contains(className)
      : element.hasAttribute(name) && (value === undefined || element.getAttribute(name) === value));
}

class FakeElement extends FakeNode {
  constructor(document, tag) {
    super(document);
    this.nodeType = 1;
    this.tagName = tag.toUpperCase();
    this.attributes = new Map();
    this.listeners = new Map();
    const element = this;
    this.classList = {
      contains: name => element.className.split(/\s+/).includes(name),
      add: name => { if (!element.classList.contains(name)) element.className = `${element.className} ${name}`.trim(); },
      remove: name => { element.className = element.className.split(/\s+/).filter(item => item && item !== name).join(' '); },
      toggle: (name, force) => {
        const on = force === undefined ? !element.classList.contains(name) : force;
        if (on) element.classList.add(name); else element.classList.remove(name);
        return on;
      },
    };
  }
  get className() { return this.attributes.get('class') || ''; }
  set className(value) { this.attributes.set('class', String(value)); }
  get id() { return this.attributes.get('id') || ''; }
  get hidden() { return this.attributes.has('hidden'); }
  set hidden(value) { if (value) this.attributes.set('hidden', ''); else this.attributes.delete('hidden'); }
  get disabled() { return this.attributes.has('disabled'); }
  get checked() { return this._checked ?? this.attributes.has('checked'); }
  set checked(value) { this._checked = Boolean(value); }
  get dataset() {
    return Object.fromEntries([...this.attributes].filter(([name]) => name.startsWith('data-'))
      .map(([name, value]) => [name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), value]));
  }
  get children() { return this.childNodes.filter(node => node.nodeType === 1); }
  get firstChild() { return this.childNodes[0] || null; }
  get firstElementChild() { return this.children[0] || null; }
  get parentElement() { return this.parentNode?.nodeType === 1 ? this.parentNode : null; }
  set textContent(value) { this.childNodes.forEach(node => { node.parentNode = null; }); this.childNodes = [new FakeText(this.ownerDocument, value)]; this.childNodes[0].parentNode = this; }
  get textContent() { return super.textContent; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); }
  appendChild(child) { return this.insertBefore(child, null); }
  insertBefore(child, reference) {
    if (child.parentNode) child.parentNode.childNodes.splice(child.parentNode.childNodes.indexOf(child), 1);
    const index = reference ? this.childNodes.indexOf(reference) : -1;
    if (index < 0) this.childNodes.push(child); else this.childNodes.splice(index, 0, child);
    child.parentNode = this;
    return child;
  }
  contains(node) { for (let current = node; current; current = current.parentNode) if (current === this) return true; return false; }
  descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
  querySelectorAll(selector) { const matches = selector.split(',').map(parseSelector); return this.descendants().filter(node => matches.some(match => match(node))); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  addEventListener(type, callback, options) {
    const capture = options === true || Boolean(options && options.capture);
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push({ callback, capture });
  }
  /** Capture phase from the root, then the target, then bubbling; stopPropagation works between nodes. */
  dispatch(type, properties = {}) {
    let stopped = false;
    const event = { type, target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { stopped = true; }, ...properties };
    const path = [];
    for (let node = this; node; node = node.parentNode) path.push(node);
    const run = (node, phase) => {
      for (const { callback, capture } of node.listeners?.get(type) || []) {
        if (phase === 'target' || capture === (phase === 'capture')) callback(event);
      }
    };
    for (const node of path.slice(1).reverse()) { if (stopped) return event; run(node, 'capture'); }
    if (!stopped) run(this, 'target');
    for (const node of path.slice(1)) { if (stopped) return event; run(node, 'bubble'); }
    if (!stopped) for (const callback of this.ownerDocument.listeners.get(type) || []) callback(event);
    return event;
  }
  /** A click `after` ms after the previous one (people take time to read); `detail` 2 is the second click of a double-click. */
  click({ detail = 1, after = 1000 } = {}) {
    this.ownerDocument.clock.now += after;
    return this.dispatch('click', { button: 0, detail });
  }
  focus() { this.ownerDocument.activeElement = this; }
  getBoundingClientRect() { return { width: this.ownerDocument.layout.width(this), height: 44 }; }
  get scrollWidth() { return Math.ceil(this.ownerDocument.layout.width(this)); }
  get clientWidth() { return this.ownerDocument.layout.clientWidth(this); }
}

/** Cookie jar with host-only and domain cookies, like a browser on `hostname`. */
function cookieJar(hostname) {
  const jar = new Map();
  const visible = domain => domain === `host:${hostname}` || hostname === domain || hostname.endsWith(`.${domain}`);
  return {
    jar,
    get: () => [...jar].filter(([key]) => visible(key.split('|')[1])).map(([key, value]) => `${key.split('|')[0]}=${value}`).join('; '),
    set(raw) {
      const [pair, ...attributes] = raw.split(';').map(part => part.trim());
      const [name, ...rest] = pair.split('=');
      const options = Object.fromEntries(attributes.map(part => { const [key, ...value] = part.split('='); return [key.toLowerCase(), value.join('=')]; }));
      let domain = `host:${hostname}`;
      if (options.domain !== undefined) {
        domain = options.domain.replace(/^\./, '');
        if (!(hostname === domain || hostname.endsWith(`.${domain}`))) return; // browsers reject foreign domains
      }
      const key = `${name}|${domain}|${options.path || '/'}`;
      const expired = options['max-age'] !== undefined ? Number(options['max-age']) <= 0 : options.expires ? Date.parse(options.expires) < Date.now() : false;
      if (expired) jar.delete(key); else jar.set(key, rest.join('='));
    },
  };
}

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return { map, getItem: key => (map.has(key) ? map.get(key) : null), setItem: (key, value) => { map.set(key, String(value)); }, removeItem: key => { map.delete(key); } };
}

const storedChoice = (analytics, ageDays = 10, v = 1) => JSON.stringify({ v, analytics, ts: new Date(Date.now() - ageDays * DAY).toISOString() });

/**
 * Run consent.js on a page shaped like the built site: skip link, header,
 * footer list with the hidden cookie-settings button, and a state paragraph.
 */
function page({ hostname = 'www.echipadetocilari.ro', lang = 'ro', storage = memoryStorage(), cookies = [], layout, allowedHosts = 'echipadetocilari.ro www.echipadetocilari.ro', run = 1, policyButton = false } = {}) {
  const listeners = new Map();
  const document = {
    listeners,
    clock: { now: 0 },
    activeElement: null,
    layout: layout || { width: element => element.textContent.length * 7, clientWidth: () => 300 },
    createElement: tag => new FakeElement(document, tag),
    createTextNode: text => new FakeText(document, text),
    addEventListener: (type, callback) => { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(callback); },
    querySelector: selector => document.documentElement.querySelector(selector),
    querySelectorAll: selector => document.documentElement.querySelectorAll(selector),
  };
  const jar = cookieJar(hostname);
  Object.defineProperty(document, 'cookie', { get: jar.get, set: jar.set });
  for (const cookie of cookies) jar.set(cookie);

  const create = (tag, attributes = {}, text) => {
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    if (text !== undefined) element.textContent = text;
    return element;
  };
  document.documentElement = create('html', { lang });
  document.documentElement.lang = lang;
  document.head = document.documentElement.appendChild(create('head'));
  document.body = document.documentElement.appendChild(create('body'));
  const script = document.head.appendChild(create('script', {
    src: '/wp-content/ect-pages/consent.js', 'data-ga-id': GA_ID, 'data-ga-hosts': allowedHosts,
    'data-policy': lang === 'en' ? '/en/privacy-policy/#cookies' : '/politica-de-confidentialitate/#cookies', defer: '',
  }));
  document.currentScript = script;
  const skip = document.body.appendChild(create('a', { class: 'skip-link screen-reader-text', href: '#content' }, 'Sari la conținut'));
  const header = document.body.appendChild(create('header'));
  const state = document.body.appendChild(create('p', { 'data-ect-consent-state': '', 'aria-live': 'polite' }));
  // The policy page has its own settings button in #cookies, besides the footer one.
  const inPage = policyButton
    ? document.body.appendChild(create('p')).appendChild(create('button', { type: 'button', class: 'ect-policy__consent-btn', 'data-ect-consent-open': '', hidden: '' }, 'Schimbă setările cookie-urilor'))
    : null;
  const footer = document.body.appendChild(create('footer'));
  const list = footer.appendChild(create('p'));
  const opener = list.appendChild(create('button', { type: 'button', class: 'ect-consent-open', 'data-ect-consent-open': '', hidden: '' }, 'Setări cookie-uri'));
  document.activeElement = document.body;

  const windowListeners = new Map();
  const context = {
    document,
    location: { hostname },
    performance: { now: () => document.clock.now },
    console,
    addEventListener: (type, callback) => { if (!windowListeners.has(type)) windowListeners.set(type, []); windowListeners.get(type).push(callback); },
  };
  if (storage === 'throws') {
    Object.defineProperty(context, 'localStorage', { get() { throw new Error('SecurityError: storage is disabled'); } });
  } else {
    context.localStorage = storage;
  }
  if (layout) {
    context.getComputedStyle = element => element.classList?.contains('ect-consent__actions--summary')
      ? { columnGap: '8px' }
      : { paddingLeft: '8px', paddingRight: '8px', borderLeftWidth: '1px', borderRightWidth: '1px' };
  }
  vm.createContext(context);
  context.window = context;
  for (let index = 0; index < run; index += 1) vm.runInContext(runtime, context, { filename: 'consent.js' });

  const banner = document.querySelector('.ect-consent');
  const views = banner ? banner.querySelectorAll('.ect-consent__view') : [];
  const [summary, customise] = [views.find(view => view.classList.contains('ect-consent__view--summary')), views.find(view => view.classList.contains('ect-consent__view--customise'))];
  const button = (view, label) => view.querySelectorAll('button').find(item => item.textContent === label);
  return {
    context, document, jar, storage, skip, header, state, opener, policyButton: inPage, banner, summary, customise, button,
    gaScripts: () => document.head.querySelectorAll('script').filter(item => String(item.src || '').includes('googletagmanager.com')),
    dataLayer: () => plain(Array.from(context.dataLayer || [], args => Array.from(args))),
    cookieNames: () => (jar.get() ? jar.get().split('; ').map(item => item.split('=')[0]) : []),
    stored: () => (storage && storage.map && storage.map.has('ect-consent') ? JSON.parse(storage.map.get('ect-consent')) : null),
    emitWindow: (type, event) => (windowListeners.get(type) || []).forEach(callback => callback(event)),
    analyticsBox: () => customise.querySelector('input[name="ect-consent-analytics"]'),
  };
}

const gaCookies = [
  '_ga=GA1.1.123.456; domain=.echipadetocilari.ro; path=/',
  '_ga_PGM4B3VM9Z=GS2.1.s1; domain=.echipadetocilari.ro; path=/',
  '_ga_NM6575781Q=GS1.1.legacy; path=/',
  '_gac_keep=1; path=/',
  'theme=light; path=/',
];
const ro = consentCopy().ro;
const en = consentCopy().en;

// ─── tests ──────────────────────────────────────────────────────────────────

test('copy has both languages, the same keys, and no em dash, diagonal arrows or cedilla ş/ţ', () => {
  const copy = consentCopy();
  assert.deepEqual(Object.keys(copy.ro).sort(), Object.keys(copy.en).sort());
  const prohibited = /[—↖-↙ŞşŢţ]|&mdash;|&#8212;/;
  for (const language of ['ro', 'en']) {
    for (const [key, value] of Object.entries(copy[language])) {
      assert.equal(typeof value, 'string', `${language}.${key}`);
      assert.ok(value.trim(), `${language}.${key} is not empty`);
      assert.doesNotMatch(value, prohibited, `${language}.${key}`);
    }
    for (const key of ['stateAccepted', 'stateRefused']) assert.match(copy[language][key], /\{date\}/);
  }
  assert.match(Object.values(copy.ro).join(' '), /[șț]/, 'Romanian uses comma-below letters');
  for (const file of [runtime, readFileSync(stylesUrl, 'utf8')]) assert.doesNotMatch(file, prohibited);
});

test('no stored choice: banner after the skip link, nothing loaded, old _ga cookies deleted, focus untouched', () => {
  const view = page({ cookies: gaCookies });
  assert.ok(view.banner, 'banner injected');
  assert.equal(view.skip.nextSibling, view.banner, 'banner follows the skip link in tab order');
  assert.equal(view.banner.tagName, 'SECTION');
  assert.equal(view.banner.getAttribute('role'), 'region');
  assert.equal(view.banner.getAttribute('aria-label'), ro.region);
  assert.equal(view.banner.hidden, false);
  assert.equal(view.summary.hidden, false);
  assert.equal(view.customise.hidden, true);
  assert.equal(view.banner.querySelectorAll('h1,h2,h3,h4,h5,h6').length, 0, 'no heading levels added');
  assert.deepEqual(view.summary.querySelectorAll('button').map(item => item.textContent), [ro.customise, ro.rejectAll, ro.acceptAll]);
  const link = view.summary.querySelector('a');
  assert.equal(link.getAttribute('href'), '/politica-de-confidentialitate/#cookies');
  assert.equal(link.textContent, ro.learnMore);
  assert.equal(view.summary.querySelector('p').textContent, `${ro.summary} ${ro.learnMore}.`);
  assert.equal(view.gaScripts().length, 0);
  assert.equal(view.context.dataLayer, undefined);
  assert.equal(view.context.gtag, undefined);
  assert.deepEqual(view.cookieNames().sort(), ['_gac_keep', 'theme']);
  assert.equal(view.document.activeElement, view.document.body, 'first show does not steal focus');
  assert.equal(view.opener.hidden, false, 'footer control is revealed');
  assert.equal(view.state.textContent, ro.stateNone);
  assert.equal(view.stored(), null);
});

test('refuse and accept look the same in both views; no close button', () => {
  const view = page();
  const solid = item => item.classList.contains('ect-consent__pill--solid');
  assert.ok(solid(view.button(view.summary, ro.rejectAll)) && solid(view.button(view.summary, ro.acceptAll)));
  assert.equal(view.button(view.customise, ro.rejectAll).className, view.button(view.customise, ro.acceptAll).className);
  assert.equal(view.button(view.summary, ro.rejectAll).className, view.button(view.summary, ro.acceptAll).className);
  // Settings view: refuse + accept as equal halves on the first row, save on the full second row (DOM order = visual order).
  assert.deepEqual(view.customise.querySelectorAll('button').map(item => item.textContent), [ro.rejectAll, ro.acceptAll, ro.save]);
  assert.ok(view.customise.querySelector('.ect-consent__actions').classList.contains('ect-consent__actions--customise'));
  assert.ok(view.button(view.customise, ro.save).classList.contains('ect-consent__pill--wide'));
  assert.ok(!view.button(view.customise, ro.acceptAll).classList.contains('ect-consent__pill--wide'));
  assert.equal(view.banner.querySelectorAll('button').length, 6, 'only the three choices per view');
});

test('consent.css: phone styles are the base, refuse and accept are equal in the settings view, footer rows are even 44px targets', () => {
  const css = readFileSync(stylesUrl, 'utf8').replace(/\r\n/g, '\n');
  assert.doesNotMatch(css, /@media \(max-width/, 'mobile first: no max-width overrides');
  assert.match(css, /@media \(min-width: 481px\) \{\n {2}\.ect-consent \{/);
  assert.match(css, /\.ect-consent \.ect-consent__actions \{\n\s*display: grid;\n\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(css, /\.ect-consent \.ect-consent__actions--summary \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\); \}/);
  assert.match(css, /\.ect-consent \.ect-consent__actions--customise \.ect-consent__pill--wide \{ grid-column: 1 \/ -1; \}/);
  assert.doesNotMatch(css, /\bflex: 1 1 auto/, 'no stretched single pill');
  assert.match(css, /footer \.ect-footer-links \{\n\s*display: flex;\n\s*flex-direction: column;/);
  assert.match(css, /footer \.ect-footer-links > br \{ display: none; \}/);
  assert.match(css, /footer \.ect-footer-links > a,\nfooter \.ect-footer-links > \.ect-consent-open \{[^}]*min-height: 44px;/);
  assert.doesNotMatch(css, /\.ect-consent-open\.ect-consent-open \{[^}]*line-height:/, 'the button keeps the line height of the footer links');
});

test('accept on the production host loads GA4 once with consent mode and stores the choice', () => {
  const view = page({ cookies: ['theme=light; path=/'] });
  view.button(view.summary, ro.acceptAll).click();
  assert.equal(view.banner.hidden, true);
  const stored = view.stored();
  assert.equal(stored.v, 1);
  assert.equal(stored.analytics, true);
  assert.ok(Math.abs(Date.parse(stored.ts) - Date.now()) < 5000);
  const scripts = view.gaScripts();
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, GA_SRC);
  assert.equal(scripts[0].async, true);
  const layer = view.dataLayer();
  assert.deepEqual(layer[0], ['consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' }]);
  assert.deepEqual(layer[1], ['consent', 'update', { analytics_storage: 'granted' }]);
  assert.equal(layer[2][0], 'js');
  assert.deepEqual(layer[3], ['config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false }]);
  assert.equal(layer.length, 4);
  assert.equal(view.context[`ga-disable-${GA_ID}`], false);
  const date = new Date(stored.ts);
  const expected = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
  assert.equal(view.state.textContent, ro.stateAccepted.replace('{date}', expected));

  // Reopening and accepting again never adds a second tag.
  view.opener.click();
  view.button(view.customise, ro.acceptAll).click();
  assert.equal(view.gaScripts().length, 1);
});

test('GA never loads on preview or local hosts, though the choice is stored', () => {
  for (const hostname of ['localhost', '127.0.0.1', 'echipadetocilari.vercel.app', 'staging.echipadetocilari.ro']) {
    const view = page({ hostname });
    view.button(view.summary, ro.acceptAll).click();
    assert.equal(view.stored().analytics, true, hostname);
    assert.equal(view.banner.hidden, true, hostname);
    assert.equal(view.gaScripts().length, 0, hostname);
    assert.equal(view.context.dataLayer, undefined, hostname);
  }
  const bare = page({ hostname: 'echipadetocilari.ro' });
  bare.button(bare.summary, ro.acceptAll).click();
  assert.equal(bare.gaScripts().length, 1, 'apex host is allowed');
});

test('refuse stores the choice, loads nothing and deletes _ga cookies on the host and the shared domain', () => {
  const view = page({ cookies: gaCookies });
  for (const cookie of gaCookies.slice(0, 3)) view.jar.set(cookie); // set again after the first cleanup
  view.button(view.summary, ro.rejectAll).click();
  assert.equal(view.banner.hidden, true);
  assert.equal(view.stored().analytics, false);
  assert.equal(view.gaScripts().length, 0);
  assert.equal(view.context[`ga-disable-${GA_ID}`], true);
  assert.deepEqual(view.cookieNames().sort(), ['_gac_keep', 'theme']);
  assert.match(view.state.textContent, /^Ai refuzat cookie-urile de analiză pe \d{2}\.\d{2}\.\d{4}\.$/);
});

test('a stored grant loads GA without the banner; a stored refusal keeps it off', () => {
  const granted = page({ storage: memoryStorage({ 'ect-consent': storedChoice(true) }) });
  assert.equal(granted.banner.hidden, true);
  assert.equal(granted.gaScripts().length, 1);
  assert.equal(granted.gaScripts()[0].src, GA_SRC);
  assert.match(granted.state.textContent, /^Ai acceptat/);

  const refused = page({ storage: memoryStorage({ 'ect-consent': storedChoice(false) }), cookies: gaCookies });
  assert.equal(refused.banner.hidden, true);
  assert.equal(refused.gaScripts().length, 0);
  assert.deepEqual(refused.cookieNames().sort(), ['_gac_keep', 'theme']);
});

test('an expired, outdated or malformed choice asks again and loads nothing', () => {
  for (const value of [storedChoice(true, 200), storedChoice(true, 10, 2), storedChoice(true, -30), '{"v":1,"analytics":"yes","ts":"2026-10-01T00:00:00Z"}', 'not json']) {
    const view = page({ storage: memoryStorage({ 'ect-consent': value }) });
    assert.equal(view.banner.hidden, false, value);
    assert.equal(view.summary.hidden, false, value);
    assert.equal(view.gaScripts().length, 0, value);
    assert.equal(view.state.textContent, ro.stateNone, value);
  }
  const recent = page({ storage: memoryStorage({ 'ect-consent': storedChoice(true, 182) }) });
  assert.equal(recent.banner.hidden, true, 'a choice inside 6 months is kept');
});

test('blocked storage: the banner still shows and a choice works for the current page', () => {
  const blocked = page({ storage: 'throws' });
  assert.equal(blocked.banner.hidden, false);
  blocked.button(blocked.summary, ro.acceptAll).click();
  assert.equal(blocked.banner.hidden, true);
  assert.equal(blocked.gaScripts().length, 1);

  const failing = { getItem() { throw new Error('quota'); }, setItem() { throw new Error('quota'); }, removeItem() {} };
  const view = page({ storage: failing });
  assert.equal(view.banner.hidden, false);
  view.button(view.summary, ro.rejectAll).click();
  assert.equal(view.banner.hidden, true);
  assert.match(view.state.textContent, /^Ai refuzat/);
});

test('Setări opens the customise view inside the same card and moves focus there', () => {
  const view = page();
  view.button(view.summary, ro.customise).click();
  assert.equal(view.banner.hidden, false);
  assert.equal(view.summary.hidden, true);
  assert.equal(view.customise.hidden, false);
  const title = view.customise.querySelector('.ect-consent__title');
  assert.equal(title.tagName, 'P');
  assert.equal(title.textContent, ro.title);
  assert.equal(view.document.activeElement, title);
  assert.ok(view.customise.contains(view.document.activeElement));
  const [necessary, analytics] = view.customise.querySelectorAll('input');
  assert.equal(necessary.checked, true);
  assert.equal(necessary.disabled, true);
  assert.equal(analytics.checked, false, 'analytics is off by default');
  assert.deepEqual(view.customise.querySelectorAll('.ect-consent__name').map(item => item.textContent), [ro.necessaryName, ro.analyticsName]);
  assert.deepEqual(view.customise.querySelectorAll('.ect-consent__desc').map(item => item.textContent), [ro.necessaryText, ro.analyticsText]);

  // Escape without a choice goes back to the summary; the banner stays.
  view.customise.dispatch('keydown', { key: 'Escape' });
  assert.equal(view.banner.hidden, false);
  assert.equal(view.summary.hidden, false);
  assert.equal(view.document.activeElement, view.button(view.summary, ro.customise));

  view.button(view.summary, ro.customise).click();
  analytics.checked = true;
  view.button(view.customise, ro.save).click();
  assert.equal(view.stored().analytics, true);
  assert.equal(view.gaScripts().length, 1);
});

test('the footer control reopens settings with the current state, withdraws consent and returns focus', () => {
  const view = page({ storage: memoryStorage({ 'ect-consent': storedChoice(true) }) });
  assert.equal(view.gaScripts().length, 1);
  for (const cookie of gaCookies.slice(0, 2)) view.jar.set(cookie); // GA wrote its cookies

  view.opener.focus();
  view.opener.click();
  assert.equal(view.banner.hidden, false);
  assert.equal(view.customise.hidden, false);
  assert.equal(view.summary.hidden, true);
  assert.equal(view.analyticsBox().checked, true, 'shows the stored grant');
  assert.equal(view.document.activeElement, view.customise.querySelector('.ect-consent__title'));

  view.analyticsBox().checked = false;
  view.button(view.customise, ro.save).click();
  assert.equal(view.banner.hidden, true);
  assert.equal(view.document.activeElement, view.opener, 'focus returns to the footer control');
  assert.equal(view.stored().analytics, false);
  assert.equal(view.context[`ga-disable-${GA_ID}`], true);
  assert.deepEqual(view.dataLayer().at(-1), ['consent', 'update', { analytics_storage: 'denied' }]);
  assert.deepEqual(view.cookieNames(), []);
  assert.match(view.state.textContent, /^Ai refuzat/);
  assert.equal(view.gaScripts().length, 1, 'the loaded tag is disabled, not loaded again');

  // Reopen shows the refusal; Escape closes without changing it.
  const before = view.storage.map.get('ect-consent');
  view.opener.click();
  assert.equal(view.analyticsBox().checked, false);
  view.customise.dispatch('keydown', { key: 'Escape' });
  assert.equal(view.banner.hidden, true);
  assert.equal(view.storage.map.get('ect-consent'), before);
  assert.equal(view.document.activeElement, view.opener);

  // Granting again re-enables the same tag.
  view.opener.click();
  view.button(view.customise, ro.acceptAll).click();
  assert.equal(view.context[`ga-disable-${GA_ID}`], false);
  assert.deepEqual(view.dataLayer().at(-1), ['consent', 'update', { analytics_storage: 'granted' }]);
  assert.equal(view.gaScripts().length, 1);
});

test('English pages use the English copy and ISO dates', () => {
  const view = page({ lang: 'en' });
  assert.equal(view.banner.getAttribute('aria-label'), en.region);
  assert.deepEqual(view.summary.querySelectorAll('button').map(item => item.textContent), [en.customise, en.rejectAll, en.acceptAll]);
  assert.equal(view.summary.querySelector('a').getAttribute('href'), '/en/privacy-policy/#cookies');
  assert.equal(view.state.textContent, en.stateNone);
  view.button(view.summary, en.rejectAll).click();
  const date = new Date(view.stored().ts);
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  assert.equal(view.state.textContent, en.stateRefused.replace('{date}', iso));
  assert.equal(page({ lang: 'en-GB' }).banner.getAttribute('aria-label'), en.region);
});

// Montserrat 500 at 14px (the pill font), measured with getBoundingClientRect in
// headless Chrome on the built RO and EN pages.
const MONTSERRAT_PILL_WIDTHS = {
  'Setări': 40.98, 'Refuz toate': 81.08, 'Accept toate': 90.45,
  'Customize': 75.13, 'Reject all': 65.05, 'Accept all': 69.8,
};

/** Width of the summary actions row for a viewport, read from consent.css. */
function summaryRowWidth(viewport) {
  const css = readFileSync(stylesUrl, 'utf8').replace(/\r\n/g, '\n');
  const rem = 16;
  // Mobile first: the base rule is the phone card, the floating card starts at 481px.
  const phone = css.match(/\n\.ect-consent \{\n([^}]*)\n\}/)[1];
  const card = css.match(/@media \(min-width: 481px\) \{\n {2}\.ect-consent \{\n([^}]*)\n {2}\}/)[1];
  const value = (block, property) => {
    const match = block.match(new RegExp(`(?:^|\\n)\\s*${property}: ([^;]+);`));
    assert.ok(match, `consent.css declares ${property}`);
    return match[1];
  };
  assert.equal(value(phone, 'border'), '1px solid rgb(239, 230, 220)');
  assert.equal(value(phone, 'left'), '.75rem');
  assert.equal(value(phone, 'right'), '.75rem');
  assert.equal(value(phone, 'width'), 'auto');
  assert.equal(value(phone, 'max-width'), 'none');
  assert.equal(value(phone, 'padding'), '.875rem 1rem');
  assert.equal(value(card, 'left'), '1rem');
  assert.equal(value(card, 'right'), 'auto');
  assert.equal(value(card, 'width'), 'calc(100% - 2rem)');
  assert.equal(value(card, 'padding'), '1rem 1.125rem');
  // The fake getComputedStyle below assumes these pill and gap sizes.
  assert.match(css, /\.ect-consent \.ect-consent__actions \{[^}]*\bgap: \.5rem;/);
  assert.match(css, /\.ect-consent \.ect-consent__actions--summary \.ect-consent__pill \{\n\s*padding-inline: \.5rem;/);
  assert.match(css, /\.ect-consent \.ect-consent__pill \{[^}]*\bborder: 1px solid transparent;/);
  const maxWidth = parseFloat(value(card, 'max-width')) * rem;
  const cardWidth = viewport > 480 ? Math.min(viewport - 2 * rem, maxWidth) : viewport - 1.5 * rem;
  const paddingX = viewport > 480 ? 1.125 * rem : 1 * rem;
  return cardWidth - 2 * paddingX - 2;
}

test('summary pills: one row above 480px in both languages; refuse + accept, then customise, only where labels do not fit', () => {
  let viewport = 1440;
  const layout = {
    width: element => MONTSERRAT_PILL_WIDTHS[element.textContent] ?? element.textContent.length * 8,
    clientWidth: () => summaryRowWidth(viewport),
  };
  const pillFrame = 2 * 8 + 2 * 1; // padding-inline .5rem + 1px border, both sides
  const order = view => view.summary.querySelector('.ect-consent__actions--summary').children.map(item => item.textContent);
  const stacked = view => view.banner.classList.contains('ect-consent--stacked');

  for (const [lang, copy] of [['ro', ro], ['en', en]]) {
    const oneRow = [copy.customise, copy.rejectAll, copy.acceptAll];
    const widest = Math.max(...oneRow.map(label => MONTSERRAT_PILL_WIDTHS[label]));
    for (const width of [481, 600, 768, 1024, 1440, 1920]) {
      viewport = width;
      const view = page({ lang, layout });
      assert.equal(stacked(view), false, `${lang} at ${width}px: one row`);
      assert.deepEqual(order(view), oneRow, `${lang} at ${width}px: Setări | Refuz toate | Accept toate`);
      const column = (summaryRowWidth(width) - 2 * 8) / 3;
      assert.ok(column - pillFrame - widest >= 3, `${lang} at ${width}px: the widest label has room to spare`);
    }
  }
  viewport = 1440;
  const card = summaryRowWidth(1440) + 2 * 18 + 2;
  assert.ok(card <= 400, `desktop card stays close to the reference 360px (${card}px)`);

  // Phones: English fits on one row; Romanian falls back to two rows below about 400px.
  for (const width of [360, 390, 414, 480]) {
    viewport = width;
    const english = page({ lang: 'en', layout });
    assert.equal(stacked(english), false, `en at ${width}px`);
    assert.deepEqual(order(english), [en.customise, en.rejectAll, en.acceptAll]);
  }
  for (const [width, twoRows] of [[320, true], [360, true], [390, true], [414, false], [480, false]]) {
    viewport = width;
    const romanian = page({ lang: 'ro', layout });
    assert.equal(stacked(romanian), twoRows, `ro at ${width}px`);
    assert.deepEqual(order(romanian), twoRows ? [ro.rejectAll, ro.acceptAll, ro.customise] : [ro.customise, ro.rejectAll, ro.acceptAll], `ro at ${width}px: DOM order follows the visual order`);
    if (twoRows) {
      const column = (summaryRowWidth(width) - 8) / 2;
      assert.ok(column - pillFrame >= MONTSERRAT_PILL_WIDTHS[ro.acceptAll], `ro at ${width}px: two-row labels are not cut`);
    }
  }

  // Resizing re-checks the row and restores the order.
  viewport = 1440;
  const view = page({ lang: 'ro', layout });
  assert.equal(stacked(view), false);
  viewport = 360;
  view.emitWindow('resize', {});
  assert.equal(stacked(view), true);
  assert.deepEqual(order(view), [ro.rejectAll, ro.acceptAll, ro.customise]);
  viewport = 1024;
  view.emitWindow('resize', {});
  assert.equal(stacked(view), false);
  assert.deepEqual(order(view), [ro.customise, ro.rejectAll, ro.acceptAll]);
});

test('another tab deciding hides the banner here; a second copy of the script does nothing', () => {
  const storage = memoryStorage();
  const view = page({ storage });
  storage.setItem('ect-consent', storedChoice(true, 0));
  view.emitWindow('storage', { key: 'ect-consent' });
  assert.equal(view.banner.hidden, true);
  assert.equal(view.gaScripts().length, 1);

  const twice = page({ run: 2 });
  assert.equal(twice.document.querySelectorAll('.ect-consent').length, 1);
});

test('a double-click or double-tap on Setări records nothing: the settings view needs its own click', () => {
  for (const [lang, copy] of [['ro', ro], ['en', en]]) {
    // Mouse: the view swaps under the pointer, so the second click of the double-click lands on Accept.
    const mouse = page({ lang });
    mouse.button(mouse.summary, copy.customise).click();
    const second = mouse.button(mouse.customise, copy.acceptAll).click({ detail: 2, after: 120 });
    assert.equal(second.defaultPrevented, true, `${lang}: the second click is swallowed`);
    assert.equal(mouse.stored(), null, `${lang}: nothing stored`);
    assert.equal(mouse.banner.hidden, false);
    assert.equal(mouse.customise.hidden, false, `${lang}: the settings stay open`);
    assert.equal(mouse.gaScripts().length, 0);
    assert.equal(mouse.context.dataLayer, undefined);
    // A slow double-click (system setting) is still a double-click: detail 2 never decides.
    mouse.button(mouse.customise, copy.acceptAll).click({ detail: 2, after: 700 });
    assert.equal(mouse.stored(), null, `${lang}: detail 2 never decides`);
    // A deliberate click does.
    mouse.button(mouse.customise, copy.acceptAll).click();
    assert.equal(mouse.stored().analytics, true);
    assert.equal(mouse.gaScripts().length, 1);

    // Touch: two taps (detail 1 each) close together, whatever lands under the second one.
    for (const label of [copy.acceptAll, copy.rejectAll, copy.save]) {
      const touch = page({ lang });
      touch.button(touch.summary, copy.customise).click();
      touch.button(touch.customise, label).click({ after: 150 });
      assert.equal(touch.stored(), null, `${lang}: a quick second tap on ${label} records nothing`);
      assert.equal(touch.customise.hidden, false);
    }
  }

  // The Analiză box does not toggle from that second click either.
  const box = page();
  box.button(box.summary, ro.customise).click();
  const toggle = box.analyticsBox().click({ after: 100 });
  assert.equal(toggle.defaultPrevented, true, 'the browser reverts the checkbox');
  assert.equal(box.analyticsBox().click({ after: 600 }).defaultPrevented, false, 'later it toggles normally');

  // Keyboard activation (detail 0) is never held back: Space on the box and Enter on Save right away.
  const keys = page();
  keys.button(keys.summary, ro.customise).click({ detail: 0 });
  assert.equal(keys.analyticsBox().click({ detail: 0, after: 50 }).defaultPrevented, false);
  keys.analyticsBox().checked = true;
  keys.button(keys.customise, ro.save).click({ detail: 0, after: 50 });
  assert.equal(keys.stored().analytics, true);

  // Reopened from the footer: a double-click there cannot change a stored refusal.
  const footer = page({ storage: memoryStorage({ 'ect-consent': storedChoice(false) }) });
  const before = footer.storage.map.get('ect-consent');
  footer.opener.click();
  footer.button(footer.customise, ro.acceptAll).click({ detail: 2, after: 100 });
  assert.equal(footer.storage.map.get('ect-consent'), before);
  assert.equal(footer.gaScripts().length, 0);
});

test('another tab withdrawing consent stops GA here: ga-disable, consent update, _ga cookies deleted, state text', () => {
  const storage = memoryStorage({ 'ect-consent': storedChoice(true) });
  const view = page({ storage });
  assert.equal(view.gaScripts().length, 1);
  for (const cookie of gaCookies.slice(0, 2)) view.jar.set(cookie); // GA wrote its cookies
  assert.deepEqual(view.cookieNames().sort(), ['_ga', '_ga_PGM4B3VM9Z']);

  storage.setItem('ect-consent', storedChoice(false, 0));
  view.emitWindow('storage', { key: 'unrelated' });
  assert.equal(view.context[`ga-disable-${GA_ID}`], false, 'other keys are ignored');
  view.emitWindow('storage', { key: 'ect-consent' });
  assert.equal(view.context[`ga-disable-${GA_ID}`], true);
  assert.deepEqual(view.dataLayer().at(-1), ['consent', 'update', { analytics_storage: 'denied' }]);
  assert.deepEqual(view.cookieNames(), []);
  assert.match(view.state.textContent, /^Ai refuzat/);
  assert.equal(view.banner.hidden, true, 'nothing to show here');
  assert.equal(view.gaScripts().length, 1, 'the tag is disabled, not loaded again');

  // A grant from the other tab turns it back on.
  storage.setItem('ect-consent', storedChoice(true, 0));
  view.emitWindow('storage', { key: 'ect-consent' });
  assert.equal(view.context[`ga-disable-${GA_ID}`], false);
  assert.deepEqual(view.dataLayer().at(-1), ['consent', 'update', { analytics_storage: 'granted' }]);
  assert.match(view.state.textContent, /^Ai acceptat/);
  assert.equal(view.gaScripts().length, 1);
});

test('a choice made in another tab while the settings are open here shows in the open view', () => {
  const storage = memoryStorage({ 'ect-consent': storedChoice(true) });
  const view = page({ storage });
  view.opener.focus();
  view.opener.click();
  assert.equal(view.analyticsBox().checked, true);

  // Withdrawn elsewhere: the open box unticks, so Save cannot grant again from the old state.
  storage.setItem('ect-consent', storedChoice(false, 0));
  view.emitWindow('storage', { key: 'ect-consent' });
  assert.equal(view.banner.hidden, false, 'the settings stay open');
  assert.equal(view.customise.hidden, false);
  assert.equal(view.analyticsBox().checked, false, 'the box shows the refusal');
  assert.equal(view.context[`ga-disable-${GA_ID}`], true);
  view.button(view.customise, ro.save).click();
  assert.equal(view.stored().analytics, false, 'Save keeps the refusal');
  assert.equal(view.context[`ga-disable-${GA_ID}`], true);
  assert.equal(view.document.activeElement, view.opener);

  // Granted elsewhere: the open box ticks.
  view.opener.click();
  storage.setItem('ect-consent', storedChoice(true, 0));
  view.emitWindow('storage', { key: 'ect-consent' });
  assert.equal(view.analyticsBox().checked, true);

  // No choice yet and the settings open here: the other tab's answer closes the banner
  // and focus goes back to the control that opened it.
  const fresh = page();
  fresh.opener.focus();
  fresh.opener.click();
  assert.ok(fresh.customise.contains(fresh.document.activeElement));
  fresh.storage.setItem('ect-consent', storedChoice(false, 0));
  fresh.emitWindow('storage', { key: 'ect-consent' });
  assert.equal(fresh.banner.hidden, true);
  assert.equal(fresh.document.activeElement, fresh.opener);
  assert.match(fresh.state.textContent, /^Ai refuzat/);

  // Focus elsewhere on the page stays where it is.
  const reading = page();
  reading.header.focus();
  reading.storage.setItem('ect-consent', storedChoice(true, 0));
  reading.emitWindow('storage', { key: 'ect-consent' });
  assert.equal(reading.banner.hidden, true);
  assert.equal(reading.document.activeElement, reading.header);
});

test('a page with a second settings control (the policy page): both are revealed and focus returns to the one used', () => {
  const view = page({ policyButton: true, storage: memoryStorage({ 'ect-consent': storedChoice(true) }) });
  const controls = view.document.querySelectorAll('[data-ect-consent-open]');
  assert.deepEqual(controls, [view.policyButton, view.opener]);
  assert.ok(controls.every(control => control.hidden === false), 'both controls are revealed');

  view.policyButton.focus();
  view.policyButton.click();
  assert.equal(view.customise.hidden, false);
  assert.equal(view.analyticsBox().checked, true);
  view.customise.dispatch('keydown', { key: 'Escape' });
  assert.equal(view.banner.hidden, true);
  assert.equal(view.document.activeElement, view.policyButton, 'Escape returns to the in-page button');

  view.opener.focus();
  view.opener.click();
  view.customise.dispatch('keydown', { key: 'Escape' });
  assert.equal(view.document.activeElement, view.opener, 'and to the footer button when that one was used');

  view.policyButton.click();
  view.analyticsBox().checked = false;
  view.button(view.customise, ro.save).click();
  assert.equal(view.document.activeElement, view.policyButton, 'Save returns to the in-page button');
  assert.equal(view.stored().analytics, false);
  assert.match(view.state.textContent, /^Ai refuzat/);

  view.opener.click();
  view.button(view.customise, ro.acceptAll).click();
  assert.equal(view.document.activeElement, view.opener, 'a choice returns to the footer button');
  assert.equal(view.stored().analytics, true);
});
