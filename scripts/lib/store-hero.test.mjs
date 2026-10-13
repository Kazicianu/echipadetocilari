import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../../legacy-mirror/wp-content/ect-pages/creare-magazin-online.js', import.meta.url), 'utf8');

function element() {
  const attributes = new Map();
  const listeners = new Map();
  const classes = new Set();
  return {
    hidden: false,
    style: {},
    attributes,
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
    toggleAttribute(name, force) {
      const enabled = force ?? !attributes.has(name);
      if (enabled) attributes.set(name, '');
      else attributes.delete(name);
      if (name === 'hidden') this.hidden = enabled;
      return enabled;
    },
    addEventListener(name, listener) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(listener);
    },
    emit(name, event = {}) {
      for (const listener of listeners.get(name) || []) listener(event);
    },
  };
}

function fixture({ reducedMotion = false, english = false } = {}) {
  const visual = element();
  const screens = Array.from({ length: 4 }, element);
  const dots = screens.map(() => ({ ...element(), firstElementChild: element() }));
  const mascot = element();
  const motionButton = element();
  const play = element();
  const pause = element();
  motionButton.querySelector = selector => ({ '[data-icon="play"]': play, '[data-icon="pause"]': pause })[selector] || null;
  const page = {
    querySelector: selector => ({
      '.mg-hero-visual': visual,
      '[data-js="faq-mascot"]': mascot,
      '[data-js="faq-motion"]': motionButton,
    })[selector] || null,
    querySelectorAll: selector => ({ '[data-screen]': screens, '[data-js="dot"]': dots })[selector] || [],
  };
  const document = {
    ...element(),
    documentElement: { lang: english ? 'en' : 'ro' },
    hidden: false,
    querySelector: selector => selector === '.ect-page--creare-magazin-online' ? page : null,
  };
  const preference = { ...element(), matches: reducedMotion };
  const timers = new Map();
  let now = 0;
  let timerId = 0;
  const window = {
    ...element(),
    matchMedia: () => preference,
    setTimeout(callback, delay) {
      const id = ++timerId;
      timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
  };
  vm.runInNewContext(source, { window, document }, { filename: 'creare-magazin-online.js' });

  function advance(milliseconds) {
    const end = now + milliseconds;
    while (true) {
      const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > end) break;
      now = next[1].at;
      timers.delete(next[0]);
      next[1].callback();
    }
    now = end;
  }

  return {
    visual, screens, dots, mascot, motionButton, play, pause, timers, window, advance,
    select(index) { dots[index].emit('click'); },
    setReducedMotion(value) {
      preference.matches = value;
      preference.emit('change', { matches: value });
    },
    setHidden(value) {
      document.hidden = value;
      document.emit('visibilitychange');
    },
  };
}

function assertScreen(fixture, index) {
  assert.deepEqual(fixture.screens.map(screen => screen.hidden), fixture.screens.map((_, position) => position !== index));
  assert.deepEqual(fixture.dots.map(dot => dot.attributes.get('aria-pressed')), fixture.dots.map((_, position) => String(position === index)));
}

test('selecting a hero dot shows that screen, keeps CSS motion running and resumes autoplay', () => {
  const f = fixture();
  assertScreen(f, 0);
  f.advance(1000);
  f.select(2);
  assertScreen(f, 2);
  assert.equal(f.visual.classList.contains('mg-phone-paused'), false);
  assert.equal(f.timers.size, 1);

  f.advance(3799);
  assertScreen(f, 2);
  f.advance(1);
  assertScreen(f, 3);
  f.advance(3800);
  assertScreen(f, 0);
  assert.equal(f.timers.size, 1);
});

test('rapid hero selections reset the delay without creating duplicate autoplay timers', () => {
  const f = fixture();
  f.advance(2500);
  for (const screen of [1, 3, 0, 2, 2]) {
    f.select(screen);
    assert.equal(f.timers.size, 1);
    f.advance(100);
  }
  assertScreen(f, 2);
  f.advance(3699);
  assertScreen(f, 2);
  f.advance(1);
  assertScreen(f, 3);
  assert.equal(f.timers.size, 1);
});

test('reduced motion allows manual selection and restoring motion restarts hero autoplay', () => {
  const f = fixture({ reducedMotion: true });
  assert.equal(f.timers.size, 0);
  assert.equal(f.visual.classList.contains('mg-phone-paused'), true);
  f.select(1);
  f.advance(12000);
  assertScreen(f, 1);

  f.setReducedMotion(false);
  assert.equal(f.visual.classList.contains('mg-phone-paused'), false);
  assert.equal(f.timers.size, 1);
  f.advance(3800);
  assertScreen(f, 2);

  f.setReducedMotion(true);
  assert.equal(f.timers.size, 0);
  assert.equal(f.visual.classList.contains('mg-phone-paused'), true);
  f.select(3);
  f.advance(12000);
  assertScreen(f, 3);
  f.setReducedMotion(false);
  f.advance(3800);
  assertScreen(f, 0);
});

test('hidden tabs suspend hero motion and returning schedules one fresh autoplay interval', () => {
  const f = fixture();
  f.advance(2000);
  f.setHidden(true);
  assert.equal(f.timers.size, 0);
  assert.equal(f.visual.classList.contains('mg-phone-paused'), true);
  f.advance(20000);
  assertScreen(f, 0);

  f.setHidden(false);
  assert.equal(f.visual.classList.contains('mg-phone-paused'), false);
  assert.equal(f.timers.size, 1);
  f.advance(3799);
  assertScreen(f, 0);
  f.advance(1);
  assertScreen(f, 1);
});

test('the FAQ pause control remains independent and preserves explicit pauses across visibility changes', () => {
  for (const english of [false, true]) {
    const f = fixture({ english });
    assert.equal(f.mascot.classList.contains('mg-paused'), false);
    assert.equal(f.play.hidden, true);
    assert.equal(f.pause.hidden, false);
    f.motionButton.emit('click');
    assert.equal(f.mascot.classList.contains('mg-paused'), true);
    assert.equal(f.motionButton.attributes.get('aria-pressed'), 'true');
    assert.equal(f.motionButton.attributes.get('aria-label'), english ? 'Start the animation' : 'Pornește animația');
    assert.equal(f.play.hidden, false);
    assert.equal(f.pause.hidden, true);

    f.select(2);
    f.setHidden(true);
    f.setHidden(false);
    f.setReducedMotion(true);
    f.setReducedMotion(false);
    assert.equal(f.mascot.classList.contains('mg-paused'), true);
    f.advance(3800);
    assertScreen(f, 3);
    assert.equal(f.visual.classList.contains('mg-phone-paused'), false);

    f.motionButton.emit('click');
    assert.equal(f.mascot.classList.contains('mg-paused'), false);
    assert.equal(f.motionButton.attributes.get('aria-pressed'), 'false');
    assert.equal(f.motionButton.attributes.get('aria-label'), english ? 'Pause the animation' : 'Oprește animația');
  }
});
