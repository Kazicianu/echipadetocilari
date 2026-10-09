import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../../legacy-mirror/wp-content/ect-pages/home/faq-mascot.js', import.meta.url), 'utf8');
const moduleUrl = '/wp-content/ect-pages/home/faq-mascot-3d-v2.js';
// Mock only the module import boundary; execute the actual loader lifecycle.
// Node's VM dynamic import hook otherwise needs an experimental module flag.
const executable = source.replace("import('" + moduleUrl + "')", "importMascotModule('" + moduleUrl + "')");
assert.notEqual(executable, source, 'the loader must keep a controllable import boundary');
const flush = () => new Promise(resolve => setImmediate(resolve));

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

function fixture({ reduced = false, importModule, mount } = {}) {
  const calls = [];
  const events = new Map();
  const docEvents = new Map();
  const preferenceEvents = new Map();
  const buttonEvents = new Map();
  const observers = [];
  const imports = [];
  const attributes = {};
  const button = {
    hidden: true,
    dataset: { pauseLabel: 'Pause animation', playLabel: 'Play animation' },
    setAttribute(name, value) { attributes[name] = value; },
    addEventListener(name, listener) { buttonEvents.set(name, listener); },
  };
  const host = { dataset: {}, querySelector: () => button };
  const reduce = {
    matches: reduced,
    addEventListener(name, listener) { preferenceEvents.set(name, listener); },
    removeEventListener(name) { preferenceEvents.delete(name); },
  };
  const document = {
    hidden: false,
    querySelector: () => host,
    addEventListener(name, listener) { docEvents.set(name, listener); },
    removeEventListener(name) { docEvents.delete(name); },
  };
  class IntersectionObserver {
    constructor(listener, options) { this.listener = listener; this.options = options; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  const controller = {
    setPaused(paused) { calls.push(['paused', paused]); },
    dispose() { calls.push(['dispose']); },
  };
  const mountMascot = mount || (async () => { calls.push(['mounted']); return controller; });
  const window = {
    IntersectionObserver,
    matchMedia: () => reduce,
    addEventListener(name, listener) { events.set(name, listener); },
  };
  new vm.Script(executable).runInNewContext({
    window, document, IntersectionObserver, URLSearchParams, location: { search: '' },
    importMascotModule(url) {
      imports.push(url);
      return importModule ? importModule() : Promise.resolve({ mountMascot });
    },
  });
  return {
    calls, host, button, reduce, document, attributes, imports, controller,
    near: value => observers[1].listener([{ isIntersecting: value }]),
    visible: value => observers[0].listener([{ isIntersecting: value }]),
    preference: value => { reduce.matches = value; preferenceEvents.get('change')?.(); },
    tabHidden: value => { document.hidden = value; docEvents.get('visibilitychange')?.(); },
    click: () => buttonEvents.get('click')(),
    pagehide: persisted => events.get('pagehide')({ persisted }),
    observers, docEvents, preferenceEvents,
  };
}

test('mascot imports near the viewport once and starts playback only when visible', async () => {
  const f = fixture();
  assert.equal(f.imports.length, 0);
  assert.equal(f.button.hidden, true);
  assert.equal(f.observers[1].options.rootMargin, '160px');
  f.near(true);
  f.near(true);
  await flush();
  assert.deepEqual(f.imports, [moduleUrl]);
  assert.deepEqual(f.calls.at(-1), ['paused', true]);
  assert.equal(f.observers[1].disconnected, true);
  f.visible(true);
  assert.deepEqual(f.calls.at(-1), ['paused', false]);
  assert.equal(f.button.hidden, false);
  assert.equal(f.attributes['aria-label'], 'Pause animation');
  f.click();
  assert.deepEqual(f.calls.at(-1), ['paused', true]);
  assert.equal(f.attributes['aria-label'], 'Play animation');
  assert.equal(f.button.title, 'Play animation');
  f.click();
  assert.deepEqual(f.calls.at(-1), ['paused', false]);
});

test('offscreen and hidden-tab suspension preserve an explicit user pause and BFCache state', async () => {
  const f = fixture();
  f.visible(true);
  await flush();
  f.visible(false);
  assert.deepEqual(f.calls.at(-1), ['paused', true]);
  f.visible(true);
  assert.deepEqual(f.calls.at(-1), ['paused', false]);
  f.tabHidden(true);
  assert.deepEqual(f.calls.at(-1), ['paused', true]);
  f.tabHidden(false);
  assert.deepEqual(f.calls.at(-1), ['paused', false]);
  f.click();
  f.visible(false);
  f.visible(true);
  f.tabHidden(true);
  f.tabHidden(false);
  assert.deepEqual(f.calls.at(-1), ['paused', true]);
  assert.equal(f.button.dataset.paused, 'true');
  f.pagehide(true);
  assert.ok(!f.calls.some(([kind]) => kind === 'dispose'));
  assert.equal(f.docEvents.has('visibilitychange'), true);
  f.click();
  assert.deepEqual(f.calls.at(-1), ['paused', false]);
});

test('reduced motion skips initial loading and preference changes suspend an existing mascot', async () => {
  const f = fixture({ reduced: true });
  f.near(true);
  f.visible(true);
  await flush();
  assert.equal(f.imports.length, 0);
  assert.equal(f.button.hidden, true);
  f.preference(false);
  await flush();
  assert.deepEqual(f.imports, [moduleUrl]);
  assert.deepEqual(f.calls.at(-1), ['paused', false]);
  f.preference(true);
  assert.deepEqual(f.calls.at(-1), ['paused', true]);
  assert.equal(f.button.hidden, true);
  f.preference(false);
  assert.deepEqual(f.calls.at(-1), ['paused', false]);
  assert.equal(f.button.hidden, false);
});

test('failed module loading leaves the static fallback and motion control untouched', async () => {
  const f = fixture({ importModule: async () => { throw new Error('Unavailable module'); } });
  f.visible(true);
  await flush();
  assert.equal(f.calls.length, 0);
  assert.equal(f.button.hidden, true);
  assert.equal(f.host.dataset.mascotReady, undefined);
});

test('failed renderer setup preserves the static fallback without exposing a playback control', async () => {
  const f = fixture({ mount: async () => null });
  f.visible(true);
  await flush();
  assert.deepEqual(f.imports, [moduleUrl]);
  assert.equal(f.calls.length, 0);
  assert.equal(f.button.hidden, true);
  assert.equal(f.host.dataset.mascotReady, undefined);
});

test('navigation during a pending import prevents mounting and removes observation listeners', async () => {
  const pending = deferred();
  const f = fixture({ importModule: () => pending.promise });
  f.visible(true);
  f.pagehide(false);
  pending.resolve({ mountMascot: async () => { throw new Error('Must not mount a disposed page'); } });
  await flush();
  assert.equal(f.calls.length, 0);
  assert.ok(f.observers.every(observer => observer.disconnected));
  assert.equal(f.docEvents.has('visibilitychange'), false);
  assert.equal(f.preferenceEvents.has('change'), false);
});

test('navigation during an asynchronous mount disposes its eventual controller exactly once', async () => {
  const pending = deferred();
  const f = fixture({ mount: () => pending.promise });
  f.visible(true);
  await flush();
  f.pagehide(false);
  pending.resolve(f.controller);
  await flush();
  assert.deepEqual(f.calls, [['dispose']]);
  assert.equal(f.button.hidden, true);
});
