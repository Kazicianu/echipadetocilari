import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../../legacy-mirror/wp-content/ect-pages/dezvoltare-aplicatii.js', import.meta.url), 'utf8');

/* Keep event capture and bubbling: the mobile story intercepts a progress-button
   click before it reaches the button's ordinary desktop click handler. */
function element(tag = 'div', dataset = {}) {
  const attributes = new Map(Object.entries(dataset).map(([name, value]) => [`data-${name}`, value]));
  const listeners = new Map();
  const classes = new Set();
  let animation = '';
  const node = {
    tag, dataset, attributes, parentElement: null, hidden: false, tabIndex: -1, focusVisible: false,
    restarts: 0,
    get className() { return [...classes].join(' '); },
    set className(value) { classes.clear(); value.split(/\s+/).filter(Boolean).forEach(name => classes.add(name)); },
    classList: {
      contains: name => classes.has(name),
      toggle(name, force) {
        const enabled = force ?? !classes.has(name);
        if (enabled) classes.add(name);
        else classes.delete(name);
        return enabled;
      },
    },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute: name => attributes.get(name) ?? null,
    addEventListener(name, listener, options) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push({ listener, capture: options === true || Boolean(options?.capture) });
    },
    matches(selector) {
      return selector.split(',').some((part) => {
        const simple = part.trim();
        if (simple === ':focus-visible') return node.focusVisible;
        const attribute = /^\[([^=]+)="([^"]+)"\]$/.exec(simple);
        return attribute ? node.getAttribute(attribute[1]) === attribute[2] : node.tag === simple;
      });
    },
    closest(selector) { return node.matches(selector) ? node : node.parentElement?.closest(selector) ?? null; },
    contains(other) {
      for (let candidate = other; candidate; candidate = candidate.parentElement) if (candidate === node) return true;
      return false;
    },
    getBoundingClientRect: () => ({ left: 0, width: 360 }),
    get offsetWidth() { return 100; },
    style: {},
    dispatch(name, values = {}) {
      const event = {
        target: node, detail: 1, button: 0, isPrimary: true, pointerId: 1, clientX: 270, clientY: 50,
        defaultPrevented: false, propagationStopped: false,
        preventDefault() { this.defaultPrevented = true; },
        stopPropagation() { this.propagationStopped = true; },
        ...values,
      };
      const path = [];
      for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) path.push(ancestor);
      for (const capture of [true, false]) {
        for (const target of capture ? [...path].reverse() : path) {
          for (const listener of target.listeners.get(name) ?? []) {
            if (listener.capture === capture) listener.listener(event);
          }
          if (event.propagationStopped) return event;
        }
      }
      return event;
    },
    listeners,
  };
  Object.defineProperty(node.style, 'animation', {
    get: () => animation,
    set(value) { animation = value; if (value === 'none') node.restarts++; },
  });
  return node;
}

function fixture({ mobile = true, reducedMotion = false, search = '' } = {}) {
  const window = element();
  const document = element();
  document.parentElement = window;
  document.hidden = false;
  const story = element('section', { js: 'story' });
  const card = element('div', { js: 'story-card' });
  story.parentElement = document;
  card.parentElement = story;
  const tabs = Array.from({ length: 4 }, (_, index) => {
    const tab = element('button', { js: 'type-tab' });
    tab.parentElement = card;
    tab.setAttribute('aria-controls', `type-${index}`);
    return tab;
  });
  const fills = tabs.map((tab) => {
    const fill = element('span', { js: 'bar-fill' });
    fill.parentElement = tab;
    return fill;
  });
  const panels = tabs.map((_, index) => {
    const panel = element('section', { preview: `preview-${index}`, audience: `Audience ${index}` });
    panel.parentElement = card;
    return panel;
  });
  const content = element('p');
  content.parentElement = card;
  const link = element('a');
  link.parentElement = card;
  const input = element('input');
  input.parentElement = card;
  const controls = ['story-prev', 'story-next'].map((js) => {
    const control = element('button', { js });
    control.parentElement = card;
    return control;
  });
  const preview = element();
  const audience = element();
  const number = element();
  const groups = tabs.map((_, index) => element('div', { mods: String(index) }));
  const motionPreference = Object.assign(element(), { matches: reducedMotion });
  const mobilePreference = Object.assign(element(), { matches: mobile });
  const observers = [];
  const frames = [];
  const outside = element();
  outside.parentElement = document;
  document.activeElement = outside;
  const single = {
    '[data-js="story"]': story,
    '[data-js="story-card"]': card,
    '[data-js="type-preview"]': preview,
    '[data-js="type-audience"]': audience,
    '[data-js="story-number"]': number,
  };
  document.querySelector = selector => single[selector] ?? null;
  document.querySelectorAll = selector => ({
    '[data-js="type-tab"]': tabs,
    '[data-js="bar-fill"]': fills,
    '[data-mods]': groups,
  })[selector] ?? [];
  document.getElementById = id => panels[tabs.findIndex(tab => tab.getAttribute('aria-controls') === id)] ?? null;
  let now = 0;
  window.location = { search };
  window.matchMedia = query => query.includes('prefers-reduced-motion') ? motionPreference : mobilePreference;
  window.requestAnimationFrame = callback => frames.push(callback);
  window.IntersectionObserver = class {
    constructor(callback, options) { this.callback = callback; this.options = options; observers.push(this); }
    observe(target) { this.target = target; }
  };
  function focus(target, focusVisible = true) {
    const previous = document.activeElement;
    target.focusVisible = focusVisible;
    document.activeElement = target;
    previous.dispatch('focusout', { relatedTarget: target });
    target.dispatch('focusin', { relatedTarget: previous });
    while (frames.length) frames.shift()();
  }
  [...tabs, outside].forEach(node => { node.focus = () => focus(node); });
  vm.runInNewContext(source, {
    window, document, URLSearchParams, performance: { now: () => now }, IntersectionObserver: window.IntersectionObserver,
  }, { filename: 'dezvoltare-aplicatii.js' });

  return {
    story, card, tabs, fills, panels, content, link, input, controls, preview, audience, number, groups, window, document, outside,
    focus,
    advance(milliseconds) { now += milliseconds; },
    visible(value = true, ratio = value ? 1 : 0) {
      observers[0].callback([{ target: card, isIntersecting: value, intersectionRatio: ratio }]);
    },
    finish(index = panels.findIndex(panel => !panel.hidden), animationName = 'lp-fill') {
      fills[index].dispatch('animationend', { animationName });
    },
    setHidden(value) { document.hidden = value; document.dispatch('visibilitychange'); },
    setMobile(value) { mobilePreference.matches = value; mobilePreference.dispatch('change', { matches: value }); },
    setReducedMotion(value) { motionPreference.matches = value; motionPreference.dispatch('change', { matches: value }); },
    tap(target = content, coordinates = {}) {
      target.dispatch('pointerdown', coordinates);
      now += 80;
      target.dispatch('pointerup', coordinates);
      return target.dispatch('click', coordinates);
    },
  };
}

function assertCurrent(f, index) {
  assert.deepEqual(f.panels.map(panel => panel.hidden), f.panels.map((_, position) => position !== index));
  assert.deepEqual(f.tabs.map(tab => tab.getAttribute('aria-selected')), f.tabs.map((_, position) => String(position === index)));
  assert.deepEqual(f.tabs.map(tab => tab.tabIndex), f.tabs.map((_, position) => position === index ? 0 : -1));
  assert.deepEqual(f.tabs.map(tab => tab.classList.contains('is-done')), f.tabs.map((_, position) => position < index));
  assert.equal(f.number.textContent, String(index + 1));
}

function assertPaused(f, expected) {
  assert.equal(f.story.classList.contains('is-paused'), expected);
}

const restarts = f => f.fills.map(fill => fill.restarts);

test('a visible mobile story autoplays from the ad-selected type, while an unknown type starts first', () => {
  const f = fixture({ search: '?tip=%20PoRtAl%20' });
  assertCurrent(f, 2);
  assertPaused(f, true);
  f.finish();
  assertCurrent(f, 2);
  f.visible();
  assertPaused(f, false);
  f.finish(2, 'unrelated-animation');
  f.finish(0);
  assertCurrent(f, 2);
  f.finish();
  assertCurrent(f, 3);
  assertCurrent(fixture({ search: '?tip=unknown' }), 0);
});

test('holding pauses and releasing resumes the same story without restarting its progress', () => {
  const f = fixture();
  f.visible();
  const before = restarts(f);
  f.content.dispatch('pointerdown');
  assertPaused(f, true);
  f.advance(900);
  f.finish();
  assertCurrent(f, 0);
  f.content.dispatch('pointerup');
  assertPaused(f, false);
  assert.deepEqual(restarts(f), before);
  f.content.dispatch('click');
  assertCurrent(f, 0);
  assert.deepEqual(restarts(f), before);
  f.finish();
  assertCurrent(f, 1);
});

test('tapping a story, its edge controls or a progress line selects once and restarts only the selected bar', () => {
  const f = fixture();
  f.visible();
  f.tap();
  assertCurrent(f, 1);
  assert.deepEqual(restarts(f), [0, 1, 0, 0]);
  f.tap(f.fills[3]);
  assertCurrent(f, 3);
  assert.deepEqual(restarts(f), [0, 1, 0, 1]);
  f.tap(f.fills[3]);
  assertCurrent(f, 3);
  assert.deepEqual(restarts(f), [0, 1, 0, 2]);
  f.tap(f.controls[0]);
  assertCurrent(f, 2);
  f.tap(f.controls[1]);
  assertCurrent(f, 3);
  f.tap(f.content, { clientX: 30 });
  assertCurrent(f, 2);
  assert.deepEqual(restarts(f), [0, 1, 2, 3]);
});

test('a tap navigates on release even when the browser omits the compatibility click', () => {
  const f = fixture();
  f.visible();
  f.content.dispatch('pointerdown');
  f.advance(80);
  f.content.dispatch('pointerup');
  assertCurrent(f, 1);
  assertPaused(f, false);
  assert.deepEqual(restarts(f), [0, 1, 0, 0]);
  f.fills[3].dispatch('pointerdown');
  f.advance(80);
  f.fills[3].dispatch('pointerup');
  assertCurrent(f, 3);
  assert.deepEqual(restarts(f), [0, 1, 0, 1]);
});

test('horizontal swipes advance once even when the browser sends a compatibility click', () => {
  const f = fixture();
  f.visible();
  f.content.dispatch('pointerdown', { clientX: 280 });
  f.content.dispatch('pointermove', { clientX: 150 });
  f.content.dispatch('pointerup', { clientX: 150 });
  assertCurrent(f, 1);
  assertPaused(f, false);
  f.advance(700);
  f.content.dispatch('click', { clientX: 150 });
  assertCurrent(f, 1);
  assert.deepEqual(restarts(f), [0, 1, 0, 0]);
  f.content.dispatch('pointerdown', { clientX: 90 });
  f.content.dispatch('pointerup', { clientX: 200 });
  assertCurrent(f, 0);
  f.advance(700);
  f.content.dispatch('click', { clientX: 200 });
  assertCurrent(f, 0);
  assert.deepEqual(restarts(f), [1, 1, 0, 0]);
});

test('a backwards swipe from the first story wraps once to the last and autoplay continues forward', () => {
  const f = fixture();
  f.visible();
  f.content.dispatch('pointerdown', { clientX: 90 });
  f.content.dispatch('pointermove', { clientX: 240 });
  f.content.dispatch('pointerup', { clientX: 240 });
  assertCurrent(f, 3);
  assertPaused(f, false);
  assert.deepEqual(restarts(f), [0, 0, 0, 1]);
  f.advance(700);
  f.content.dispatch('click', { clientX: 240 });
  assertCurrent(f, 3);
  assert.deepEqual(restarts(f), [0, 0, 0, 1]);
  f.finish();
  assertCurrent(f, 0);
  assertPaused(f, false);
  assert.deepEqual(restarts(f), [1, 0, 0, 1]);
  f.finish(3);
  assertCurrent(f, 0);
  f.finish();
  assertCurrent(f, 1);
});

test('the previous button and left-side tap also wrap from first to last with fresh progress', () => {
  for (const previous of [f => f.tap(f.controls[0]), f => f.tap(f.content, { clientX: 30 })]) {
    const f = fixture();
    f.visible();
    previous(f);
    assertCurrent(f, 3);
    assertPaused(f, false);
    assert.deepEqual(restarts(f), [0, 0, 0, 1]);
    f.finish();
    assertCurrent(f, 0);
    assertPaused(f, false);
    assert.deepEqual(restarts(f), [1, 0, 0, 1]);
  }
});

test('backwards wrapping stays manual with reduced motion until the preference changes', () => {
  const f = fixture({ reducedMotion: true });
  f.visible();
  f.content.dispatch('pointerdown', { clientX: 90 });
  f.content.dispatch('pointermove', { clientX: 240 });
  f.content.dispatch('pointerup', { clientX: 240 });
  f.advance(700);
  f.content.dispatch('click', { clientX: 240 });
  assertCurrent(f, 3);
  assertPaused(f, true);
  assert.deepEqual(restarts(f), [0, 0, 0, 1]);
  f.finish();
  assertCurrent(f, 3);
  assertPaused(f, true);
  assert.deepEqual(restarts(f), [0, 0, 0, 1]);
  f.setReducedMotion(false);
  assertPaused(f, false);
  assert.deepEqual(restarts(f), [0, 0, 0, 1]);
  f.finish();
  assertCurrent(f, 0);
  assertPaused(f, false);
});

test('vertical scrolling and canceled gestures resume without navigating or resetting progress', () => {
  const f = fixture();
  f.visible();
  f.content.dispatch('pointerdown', { clientX: 280, clientY: 50 });
  f.content.dispatch('pointermove', { clientX: 260, clientY: 150 });
  f.content.dispatch('pointerup', { clientX: 260, clientY: 150 });
  f.content.dispatch('click', { clientX: 260, clientY: 150 });
  assertCurrent(f, 0);
  assertPaused(f, false);
  /* A coalesced/missing pointermove must not turn a scroll into a tap. */
  f.content.dispatch('pointerdown', { clientX: 280, clientY: 50 });
  f.content.dispatch('pointerup', { clientX: 260, clientY: 150 });
  f.content.dispatch('click', { clientX: 260, clientY: 150 });
  assertCurrent(f, 0);
  assertPaused(f, false);
  f.content.dispatch('pointerdown');
  f.content.dispatch('pointercancel');
  f.content.dispatch('pointerup', { clientX: 100 });
  f.advance(700);
  f.content.dispatch('click');
  assertCurrent(f, 0);
  assertPaused(f, false);
  assert.deepEqual(restarts(f), [0, 0, 0, 0]);
});

test('keyboard focus and arrow navigation pause until focus leaves the card', () => {
  const f = fixture();
  f.visible();
  f.focus(f.tabs[0]);
  assertPaused(f, true);
  const event = f.tabs[0].dispatch('keydown', { key: 'ArrowRight' });
  assert.equal(event.defaultPrevented, true);
  assertCurrent(f, 1);
  assert.equal(f.document.activeElement, f.tabs[1]);
  assertPaused(f, true);
  f.finish();
  assertCurrent(f, 1);
  f.focus(f.outside);
  assertPaused(f, false);
  f.finish();
  assertCurrent(f, 2);
});

test('keyboard activation selects a progress line and keeps it paused for reading', () => {
  const f = fixture();
  f.visible();
  f.fills[2].dispatch('click', { detail: 0 });
  assertCurrent(f, 2);
  assertPaused(f, true);
  assert.deepEqual(restarts(f), [0, 0, 1, 0]);
  f.finish();
  assertCurrent(f, 2);
});

test('offscreen and hidden-document pauses preserve progress and resume only after both clear', () => {
  const f = fixture();
  f.visible();
  f.tap();
  const before = restarts(f);
  f.visible(true, 0.49);
  assertPaused(f, true);
  f.finish();
  assertCurrent(f, 1);
  f.setHidden(true);
  f.visible();
  assertPaused(f, true);
  f.setHidden(false);
  assertPaused(f, false);
  assert.deepEqual(restarts(f), before);
  f.finish();
  assertCurrent(f, 2);
});

test('desktop uses manual tabs and never autoplays, including after a viewport change', () => {
  const f = fixture({ mobile: false });
  f.visible();
  assertPaused(f, true);
  f.finish();
  f.tap();
  assertCurrent(f, 0);
  f.tabs[2].dispatch('click');
  assertCurrent(f, 2);
  assertPaused(f, true);
  assert.deepEqual(restarts(f), [0, 0, 1, 0]);
  f.setMobile(true);
  assertPaused(f, false);
  f.finish();
  assertCurrent(f, 3);
  f.setMobile(false);
  assertPaused(f, true);
});

test('autoplay repeatedly loops to the first story, clears completed bars and restarts progress each lap', () => {
  const f = fixture();
  f.visible();
  for (let lap = 0; lap < 3; lap++) {
    for (let index = 0; index < 4; index++) {
      assertCurrent(f, index);
      f.finish();
      assertCurrent(f, (index + 1) % 4);
      assertPaused(f, false);
    }
    assert.deepEqual(f.tabs.map(tab => tab.classList.contains('is-done')), [false, false, false, false]);
    assert.deepEqual(restarts(f), [lap + 1, lap + 1, lap + 1, lap + 1]);
  }
});

test('holding or reduced motion blocks the last-to-first autoplay transition until resumed', () => {
  const held = fixture({ search: '?tip=ai' });
  held.visible();
  held.content.dispatch('pointerdown');
  held.advance(900);
  held.finish();
  assertCurrent(held, 3);
  assertPaused(held, true);
  assert.deepEqual(restarts(held), [0, 0, 0, 0]);
  held.content.dispatch('pointerup');
  held.content.dispatch('click');
  assertCurrent(held, 3);
  assertPaused(held, false);
  assert.deepEqual(restarts(held), [0, 0, 0, 0]);
  held.finish();
  assertCurrent(held, 0);
  assertPaused(held, false);
  assert.deepEqual(restarts(held), [1, 0, 0, 0]);

  const reduced = fixture({ search: '?tip=ai', reducedMotion: true });
  reduced.visible();
  reduced.finish();
  assertCurrent(reduced, 3);
  assertPaused(reduced, true);
  assert.deepEqual(restarts(reduced), [0, 0, 0, 0]);
  reduced.setReducedMotion(false);
  assertCurrent(reduced, 3);
  assertPaused(reduced, false);
  assert.deepEqual(restarts(reduced), [0, 0, 0, 0]);
  reduced.finish();
  assertCurrent(reduced, 0);
  assertPaused(reduced, false);
  assert.deepEqual(restarts(reduced), [1, 0, 0, 0]);
});

test('manual next from the final story wraps to the first and autoplay continues', () => {
  const f = fixture({ search: '?tip=ai' });
  f.visible();
  f.tap(f.controls[1]);
  assertCurrent(f, 0);
  assertPaused(f, false);
  assert.deepEqual(restarts(f), [1, 0, 0, 0]);
  f.advance(700);
  f.controls[1].dispatch('click');
  assertCurrent(f, 0);
  f.finish();
  assertCurrent(f, 1);
  assertPaused(f, false);
});

test('reduced motion keeps navigation manual and a live preference change resumes the same bar', () => {
  const f = fixture({ reducedMotion: true });
  f.visible();
  assertPaused(f, true);
  f.finish();
  assertCurrent(f, 0);
  f.tap();
  assertCurrent(f, 1);
  assertPaused(f, true);
  const before = restarts(f);
  f.setReducedMotion(false);
  assertPaused(f, false);
  assert.deepEqual(restarts(f), before);
  f.finish();
  assertCurrent(f, 2);
  f.setReducedMotion(true);
  f.finish();
  assertCurrent(f, 2);
});

test('links, fields and secondary pointers do not trigger story gestures', () => {
  const f = fixture();
  f.visible();
  for (const target of [f.link, f.input]) {
    const event = f.tap(target);
    assert.equal(event.defaultPrevented, false);
    assertCurrent(f, 0);
    assertPaused(f, false);
  }
  f.content.dispatch('pointerdown', { isPrimary: false });
  assertPaused(f, false);
  f.content.dispatch('pointerdown', { button: 2 });
  assertPaused(f, false);
  assert.deepEqual(restarts(f), [0, 0, 0, 0]);
});
