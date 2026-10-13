import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../../legacy-mirror/wp-content/ect-pages/home/faq-mascot.js', import.meta.url), 'utf8');
const moduleUrl = '/wp-content/ect-pages/home/faq-mascot-client-3d.js';
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
  const observers = [];
  const imports = [];
  const host = { dataset: {} };
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
    calls, host, reduce, document, imports, controller,
    near: value => observers[1].listener([{ isIntersecting: value }]),
    visible: value => observers[0].listener([{ isIntersecting: value }]),
    preference: value => { reduce.matches = value; preferenceEvents.get('change')?.(); },
    tabHidden: value => { document.hidden = value; docEvents.get('visibilitychange')?.(); },
    pagehide: persisted => events.get('pagehide')({ persisted }),
    observers, docEvents, preferenceEvents,
  };
}

test('mascot imports near the viewport once and starts playback only when visible', async () => {
  const f = fixture();
  assert.equal(f.imports.length, 0);
  assert.equal(f.observers[1].options.rootMargin, '160px');
  f.near(true);
  f.near(true);
  await flush();
  assert.deepEqual(f.imports, [moduleUrl]);
  assert.deepEqual(f.calls.at(-1), ['paused', true]);
  assert.equal(f.host.dataset.paused, 'true');
  assert.equal(f.observers[1].disconnected, true);
  f.visible(true);
  assert.deepEqual(f.calls.at(-1), ['paused', false]);
  assert.equal(f.host.dataset.paused, 'false');
});

test('offscreen and hidden-tab suspension always resume on return, and BFCache keeps the mascot', async () => {
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
  f.pagehide(true);
  assert.ok(!f.calls.some(([kind]) => kind === 'dispose'));
  assert.equal(f.docEvents.has('visibilitychange'), true);
  f.tabHidden(true);
  f.tabHidden(false);
  assert.deepEqual(f.calls.at(-1), ['paused', false]);
});

test('reduced motion skips initial loading and preference changes suspend an existing mascot', async () => {
  const f = fixture({ reduced: true });
  f.near(true);
  f.visible(true);
  await flush();
  assert.equal(f.imports.length, 0);
  f.preference(false);
  await flush();
  assert.deepEqual(f.imports, [moduleUrl]);
  assert.deepEqual(f.calls.at(-1), ['paused', false]);
  f.preference(true);
  assert.deepEqual(f.calls.at(-1), ['paused', true]);
  f.preference(false);
  assert.deepEqual(f.calls.at(-1), ['paused', false]);
});

test('failed module loading leaves the static fallback untouched', async () => {
  const f = fixture({ importModule: async () => { throw new Error('Unavailable module'); } });
  f.visible(true);
  await flush();
  assert.equal(f.calls.length, 0);
  assert.equal(f.host.dataset.mascotReady, undefined);
});

test('failed renderer setup preserves the static fallback', async () => {
  const f = fixture({ mount: async () => null });
  f.visible(true);
  await flush();
  assert.deepEqual(f.imports, [moduleUrl]);
  assert.equal(f.calls.length, 0);
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
});
