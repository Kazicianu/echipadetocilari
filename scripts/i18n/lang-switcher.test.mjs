import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import vm from 'node:vm';
import { LANG_SWITCH_SCRIPT, injectLangSwitcher } from './lang-switcher.mjs';
import { makeStandaloneAssets } from '../lib/standalone-assets.mjs';
import { routes } from './routes.mjs';

const PAGE = '<!doctype html><html><head><title>x</title></head><body><header><div class="elementor-menu-toggle"></div></header></body></html>';
const roOnly = routes.filter(route => !route.en).map(route => route.ro);

const nav = html => html.match(/<nav id="ect-lang-switch"[\s\S]*?<\/nav>/i)?.[0] || '';
const dataFrom = html => html.match(/<script id="ect-lang-js" data-from="([^"]*)">/)?.[1];
const count = (html, pattern) => (html.match(pattern) || []).length;
const switchCss = html => (html.match(/<style id="ect-lang-css">([\s\S]*?)<\/style>/)?.[1] || '').replace(/\n\s*/g, '');

test('the chip carries an aria-hidden motion layer after the links, marked with the current language', () => {
  const cases = [
    ['ro', injectLangSwitcher(PAGE, 'ro', '/servicii-seo/', '/en/seo-services/')],
    ['en', injectLangSwitcher(PAGE, 'en', '/servicii-seo/', '/en/seo-services/')],
    ['ro', injectLangSwitcher(PAGE, 'ro', '/creare-magazin-online/')],
  ];
  for (const [language, html] of cases) {
    const chip = nav(html);
    assert.equal(count(chip, /class="ect-lang-liquid"/g), 1, `${language}: one motion layer inside the nav`);
    assert.match(chip, new RegExp(`<span class="ect-lang-liquid" data-active="${language}" aria-hidden="true"><span>RO</span><span>EN</span></span>\\s*</nav>`));
    assert.ok(chip.lastIndexOf('</a>') < chip.indexOf('ect-lang-liquid'), `${language}: the layer follows both links`);
    assert.equal(count(chip, /<a\b/g), 2, `${language}: still exactly two links`);
  }
});

test('style and script are injected once, even when the switcher is applied twice', () => {
  const once = injectLangSwitcher(PAGE, 'en', '/servicii-seo/', '/en/seo-services/');
  const twice = injectLangSwitcher(once, 'en', '/servicii-seo/', '/en/seo-services/');
  for (const html of [once, twice]) {
    assert.equal(count(html, /id="ect-lang-css"/g), 1);
    assert.equal(count(html, /id="ect-lang-js"/g), 1);
    assert.equal(count(html, /id="ect-lang-switch"/g), 1);
    assert.equal(count(html, /class="ect-lang-liquid"/g), 1);
    assert.ok(html.indexOf('id="ect-lang-js"') < html.indexOf('</head>'), 'the script sits in the head');
  }
  assert.equal(twice.replace(/\s+/g, ' '), once.replace(/\s+/g, ' '), 'a second pass changes nothing but whitespace');
});

test('data-from lists the pages the switch can arrive from', () => {
  assert.equal(dataFrom(injectLangSwitcher(PAGE, 'en', '/servicii-seo/', '/en/seo-services/')), '/servicii-seo/', 'EN page: its RO twin');
  assert.equal(dataFrom(injectLangSwitcher(PAGE, 'en', '/', '/en/')), ['/', ...roOnly].join(' '), 'EN homepage: the RO homepage and every RO-only page');
  assert.equal(dataFrom(injectLangSwitcher(PAGE, 'ro', '/servicii-seo/', '/en/seo-services/')), '/en/seo-services/', 'RO page: its EN twin');
  assert.equal(dataFrom(injectLangSwitcher(PAGE, 'ro', '/creare-magazin-online/')), '', 'RO-only page: nothing arrives here through the switch');
});

test('the view transition is declared only for visitors who accept motion', () => {
  const html = injectLangSwitcher(PAGE, 'ro', '/', '/en/');
  assert.equal(count(html, /@view-transition/g), 1);
  assert.ok(html.includes('@media (prefers-reduced-motion:no-preference){@view-transition{navigation:auto}}'));
  assert.ok(html.includes('#ect-lang-switch{view-transition-name:ect-lang}'));
});

test('a keyboard-focused link rises above the drop only at rest, never while it moves', () => {
  const html = injectLangSwitcher(PAGE, 'ro', '/', '/en/');
  assert.ok(html.includes('html:not(.ect-lang-anim) #ect-lang-switch a:focus-visible{position:relative;z-index:2}'));
  assert.equal(count(html, /#ect-lang-switch a:focus-visible\{[^}]*z-index/g), 1, 'no unscoped rule that would lift a link over the moving drop');
});

test('hover or keyboard focus on the other language makes the drop lean toward it', () => {
  const css = switchCss(injectLangSwitcher(PAGE, 'ro', '/', '/en/'));
  assert.ok(css.includes('#ect-lang-switch:has(a[lang="en"]:not([aria-current="true"]):focus-visible) .ect-lang-liquid{clip-path:inset(2px 34px 2px 0 round 20px)}'));
  assert.ok(css.includes('#ect-lang-switch:has(a[lang="ro"]:not([aria-current="true"]):focus-visible) .ect-lang-liquid{clip-path:inset(2px 0 2px 34px round 20px)}'));
  assert.ok(css.includes('@media (hover:hover){#ect-lang-switch:has(a[lang="en"]:not([aria-current="true"]):hover) .ect-lang-liquid{clip-path:inset(2px 34px 2px 0 round 20px)}#ect-lang-switch:has(a[lang="ro"]:not([aria-current="true"]):hover) .ect-lang-liquid{clip-path:inset(2px 0 2px 34px round 20px)}}'), 'the mouse lean only on devices that hover');
  assert.ok(css.includes('@media (prefers-reduced-motion:no-preference){#ect-lang-switch .ect-lang-liquid{transition:clip-path .42s cubic-bezier(.34,1.56,.64,1)}'), 'the lean moves only for visitors who accept motion');
});

test('the stretch leaves from wherever the drop is, with transitions off while the switch runs', () => {
  const css = switchCss(injectLangSwitcher(PAGE, 'ro', '/', '/en/'));
  assert.ok(css.includes('@keyframes ect-lang-stretch{to{clip-path:inset(3px 0 3px 0 round 19px)}}'));
  assert.ok(!/@keyframes ect-lang-stretch[^{]*\{from/.test(css), 'no fixed start: a leaning drop must not jump back before it stretches');
  assert.ok(css.includes('html.ect-lang-anim #ect-lang-switch .ect-lang-liquid{transition:none!important}'));
  assert.ok(css.includes('html.ect-lang-anim.ect-lang-leave #ect-lang-switch .ect-lang-liquid{animation:ect-lang-stretch .245s cubic-bezier(.6,0,.4,1) both}'));
});

test('the script is plain, self-contained and stores nothing in the browser', () => {
  assert.ok(!/sessionStorage|localStorage|document\.cookie|indexedDB/.test(LANG_SWITCH_SCRIPT));
  assert.ok(!LANG_SWITCH_SCRIPT.includes('</script'));
  assert.ok(!LANG_SWITCH_SCRIPT.includes('\u2014'));
  // standalone-assets.mjs lowercases every case-insensitive "url(...)" in a page ("new URL(x)" became "new url(x)").
  assert.ok(!/url\s*\(/i.test(LANG_SWITCH_SCRIPT), 'no call that the asset rewriter would mistake for a CSS url()');
});

test('the build step that rewrites asset URLs leaves the script and styles as written', () => {
  const page = injectLangSwitcher(PAGE, 'en', '/servicii-seo/', '/en/seo-services/');
  const built = makeStandaloneAssets(page);
  assert.ok(built.includes(LANG_SWITCH_SCRIPT), 'script intact');
  const styles = html => html.match(/<style id="ect-lang-css">[\s\S]*?<\/style>/)?.[0];
  assert.ok(styles(page), 'the page has the styles');
  assert.equal(styles(built), styles(page), 'styles intact');
});

// Runtime model: the script runs in a vm context with a small stub DOM.
function createPage({ referrer = '', navigationType = 'navigate', reduced = false, from = '/servicii-seo/', lang = 'en', origin = 'https://example.test' } = {}) {
  const classes = new Set();
  const root = {
    lang,
    classList: {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name),
    },
  };
  const windowListeners = new Map();
  const documentListeners = new Map();
  const assigned = [];
  const appended = [];
  const document = {
    documentElement: root,
    currentScript: { dataset: { from } },
    referrer,
    head: { append: node => appended.push(node) },
    createElement: tag => ({ tag }),
    addEventListener: (type, listener) => documentListeners.set(type, listener),
  };
  const sandbox = {
    document,
    location: { origin, assign: href => assigned.push(href) },
    matchMedia: () => ({ matches: reduced }),
    performance: { getEntriesByType: () => [{ type: navigationType }] },
    addEventListener: (type, listener) => windowListeners.set(type, listener),
    setTimeout: (...args) => globalThis.setTimeout(...args),
  };
  vm.runInNewContext(LANG_SWITCH_SCRIPT, sandbox);

  function link({ href = '/en/seo-services/', lang: linkLang = 'en', current = false, inChip = true, visible = true, hasLayer = true, target = '', matches = true } = {}) {
    const chip = { offsetWidth: visible ? 90 : 0, querySelector: () => (hasLayer ? {} : null) };
    const element = {
      href: origin + href,
      lang: linkLang,
      target,
      getAttribute: name => (name === 'aria-current' && current ? 'true' : null),
      closest: selector => (selector === '#ect-lang-switch' ? (inChip ? chip : null) : (matches ? element : null)),
    };
    return element;
  }

  function click(target, overrides = {}) {
    const event = { target, button: 0, defaultPrevented: false, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, ...overrides };
    event.preventDefault = () => { event.defaultPrevented = true; event.prevented = true; };
    documentListeners.get('click')(event);
    return event;
  }

  return {
    classes,
    assigned,
    appended,
    link,
    click,
    fireWindow: (type, event = {}) => windowListeners.get(type)(event),
    fireDocument: (type, event = {}) => documentListeners.get(type)(event),
    list: () => [...classes].sort(),
  };
}

const ARRIVE_EN = ['ect-lang-anim', 'ect-lang-arrive', 'ect-lang-to-en'];

test('arriving from the counterpart page starts the settle animation', () => {
  const en = createPage({ lang: 'en', referrer: 'https://example.test/servicii-seo/' });
  assert.deepEqual(en.list(), [...ARRIVE_EN].sort());
  const ro = createPage({ lang: 'ro', from: '/en/seo-services/', referrer: 'https://example.test/en/seo-services/?x=1#y' });
  assert.deepEqual(ro.list(), ['ect-lang-anim', 'ect-lang-arrive', 'ect-lang-to-ro']);
  const home = createPage({ lang: 'en', from: '/ /creare-magazin-online/', referrer: 'https://example.test/creare-magazin-online/' });
  assert.deepEqual(home.list(), [...ARRIVE_EN].sort(), 'a RO-only page reaches the English homepage');
});

test('other arrivals stay still: foreign referrer, other page, reload, history, reduced motion', () => {
  const none = options => createPage({ lang: 'en', referrer: 'https://example.test/servicii-seo/', ...options }).list();
  assert.deepEqual(none({ referrer: 'https://other.test/servicii-seo/' }), [], 'foreign origin');
  assert.deepEqual(none({ referrer: 'https://example.test/contact/' }), [], 'a page that is not the counterpart');
  assert.deepEqual(none({ referrer: '' }), [], 'no referrer');
  assert.deepEqual(none({ referrer: 'not a url' }), [], 'unparseable referrer');
  assert.deepEqual(none({ navigationType: 'reload' }), [], 'reload');
  assert.deepEqual(none({ navigationType: 'back_forward' }), [], 'history navigation');
  assert.deepEqual(none({ reduced: true }), [], 'reduced motion');
  assert.deepEqual(none({ from: '' }), [], 'a page nothing arrives at through the switch');
});

test('the settle animation ends the state; a safety timer and the page cache do too', () => {
  const page = createPage({ referrer: 'https://example.test/servicii-seo/' });
  page.fireDocument('animationend', { animationName: 'something-else' });
  assert.deepEqual(page.list(), [...ARRIVE_EN].sort(), 'unrelated animations do not end it');
  page.fireDocument('animationend', { animationName: 'ect-lang-settle-en' });
  assert.deepEqual(page.list(), []);

  const restored = createPage({ referrer: 'https://example.test/servicii-seo/' });
  restored.fireWindow('pageshow', { persisted: false });
  assert.deepEqual(restored.list(), [...ARRIVE_EN].sort(), 'a normal pageshow keeps the state');
  restored.fireWindow('pageshow', { persisted: true });
  assert.deepEqual(restored.list(), [], 'a page restored from the back/forward cache is at rest');

  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const stuck = createPage({ referrer: 'https://example.test/servicii-seo/' });
    mock.timers.tick(1999);
    assert.equal(stuck.list().length, 3);
    mock.timers.tick(1);
    assert.deepEqual(stuck.list(), [], 'cleared after 2s even if animationend never fires');
  } finally {
    mock.timers.reset();
  }
});

test('view transitions are skipped unless the navigation is a language switch', () => {
  const skipped = [];
  const caught = [];
  const ready = { catch: handler => caught.push(handler) };
  const event = { viewTransition: { ready, skipTransition: () => skipped.push(true) } };

  const arriving = createPage({ referrer: 'https://example.test/servicii-seo/' });
  arriving.fireWindow('pagereveal', event);
  assert.equal(skipped.length, 0, 'a switch arrival keeps its transition');

  const plain = createPage({ referrer: 'https://example.test/contact/' });
  plain.fireWindow('pagereveal', event);
  assert.equal(skipped.length, 1, 'any other arrival skips it');
  plain.fireWindow('pagereveal', {});
  assert.equal(skipped.length, 1, 'no transition object, nothing to skip');

  const leaving = createPage();
  leaving.fireWindow('pageswap', event);
  assert.equal(skipped.length, 2, 'leaving through an ordinary link skips it');
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    leaving.click(leaving.link());
    leaving.fireWindow('pageswap', event);
    assert.equal(skipped.length, 2, 'leaving through the switch keeps it');
    assert.equal(caught.length, 2, 'every skip also silences the rejected ready promise');
  } finally {
    mock.timers.reset();
  }
});

test('a plain click on the desktop chip stretches the drop, then navigates after 245ms, once', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const page = createPage({ lang: 'ro', from: '/en/seo-services/' });
    const english = page.link({ href: '/en/seo-services/', lang: 'en' });
    const event = page.click(english);
    assert.equal(event.prevented, true, 'the navigation is held back');
    assert.deepEqual(page.list(), ['ect-lang-anim', 'ect-lang-leave', 'ect-lang-to-en']);
    assert.equal(page.appended.length, 1);
    assert.deepEqual({ rel: page.appended[0].rel, href: page.appended[0].href }, { rel: 'prefetch', href: 'https://example.test/en/seo-services/' });
    mock.timers.tick(244);
    assert.deepEqual(page.assigned, []);

    const again = page.click(english);
    assert.equal(again.prevented, true, 'a second click is swallowed');
    assert.equal(page.appended.length, 1, 'and does not prefetch again');

    mock.timers.tick(1);
    assert.deepEqual(page.assigned, ['https://example.test/en/seo-services/']);
    mock.timers.tick(1000);
    assert.equal(page.assigned.length, 1, 'never navigates twice');
  } finally {
    mock.timers.reset();
  }
});

test('the pagereveal after the switch clears the leaving state', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const page = createPage({ lang: 'ro', from: '/en/seo-services/' });
    page.click(page.link());
    page.fireWindow('pagereveal', {});
    assert.deepEqual(page.list(), []);
    // after a cancelled navigation the chip can be used again
    const event = page.click(page.link());
    assert.equal(event.prevented, true);
    assert.equal(page.list().includes('ect-lang-leave'), true);
  } finally {
    mock.timers.reset();
  }
});

test('modified, secondary, current-language and reduced-motion clicks are left alone', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const checks = [
      ['ctrl', {}, { ctrlKey: true }],
      ['meta', {}, { metaKey: true }],
      ['shift', {}, { shiftKey: true }],
      ['alt', {}, { altKey: true }],
      ['middle button', {}, { button: 1 }],
      ['already prevented', {}, { defaultPrevented: true }],
      ['current language', { current: true }, {}],
      ['new tab link', { target: '_blank' }, {}],
      ['a link outside the switch', { matches: false }, {}],
    ];
    for (const [name, linkOptions, eventOptions] of checks) {
      const page = createPage({ lang: 'ro', from: '/en/seo-services/' });
      const event = page.click(page.link(linkOptions), eventOptions);
      mock.timers.tick(1000);
      assert.equal(event.prevented, undefined, `${name}: no preventDefault`);
      assert.deepEqual(page.list(), [], `${name}: no classes`);
      assert.deepEqual(page.assigned, [], `${name}: no scripted navigation`);
    }
    const still = createPage({ lang: 'ro', from: '/en/seo-services/', reduced: true });
    const event = still.click(still.link());
    mock.timers.tick(1000);
    assert.equal(event.prevented, undefined, 'reduced motion: the browser navigates at once');
    assert.deepEqual(still.list(), []);
    assert.deepEqual(still.assigned, []);
  } finally {
    mock.timers.reset();
  }
});

test('a language link in the phone menu only marks the page as leaving; mobile-menu.js navigates', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const page = createPage({ lang: 'ro', from: '/en/seo-services/' });
    const footerLink = page.link({ inChip: false });
    const event = page.click(footerLink);
    mock.timers.tick(1000);
    assert.equal(event.prevented, undefined);
    assert.deepEqual(page.list(), ['ect-lang-leave', 'ect-lang-to-en'], 'no drop animation, view transition allowed');
    assert.deepEqual(page.assigned, []);
    assert.deepEqual(page.appended, []);
  } finally {
    mock.timers.reset();
  }
});

test('a hidden chip (phone width) is handled like the menu: no hold-back', () => {
  const page = createPage({ lang: 'ro', from: '/en/seo-services/' });
  const event = page.click(page.link({ visible: false }));
  assert.equal(event.prevented, undefined);
  assert.deepEqual(page.list(), ['ect-lang-leave', 'ect-lang-to-en']);
  assert.deepEqual(page.assigned, []);
});
