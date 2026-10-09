import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const runtime = readFileSync(new URL('../../legacy-mirror/wp-content/ect-pages/mobile-menu.js', import.meta.url), 'utf8');

function inlineStyle(initial = '') {
  const style = {};
  Object.defineProperty(style, 'cssText', {
    get: () => Object.entries(style).map(([name, value]) => `${name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}: ${value};`).join(' '),
    set(value) {
      Object.keys(style).forEach(name => delete style[name]);
      value.split(';').forEach(declaration => {
        const separator = declaration.indexOf(':');
        if (separator < 0) return;
        const name = declaration.slice(0, separator).trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        style[name] = declaration.slice(separator + 1).trim();
      });
    },
  });
  style.cssText = initial;
  return style;
}

function createMenu({ reducedMotion = false } = {}) {
  const animations = [];
  const navigation = [];
  const scrollCalls = [];
  let document;

  class Animation {
    constructor(frames, options) {
      this.frames = frames;
      this.duration = options.duration;
      this.currentTime = 0;
      this.playbackRate = 1;
      this.playState = 'running';
      this.onfinish = null;
    }
    pause() { this.playState = 'paused'; }
    play() {
      // WAAPI play() rewinds an animation already at the endpoint for its direction.
      if (this.playbackRate < 0 && this.currentTime <= 0) this.currentTime = this.duration;
      if (this.playbackRate > 0 && this.currentTime >= this.duration) this.currentTime = 0;
      this.playState = 'running';
    }
    cancel() { this.currentTime = null; this.playState = 'idle'; }
  }

  class Element {
    constructor() {
      this.style = inlineStyle();
      this.attributes = new Map();
      this.listeners = new Map();
      this.dataset = {};
      this.parentElement = null;
      this.inert = false;
      this.rect = { top: 24, right: 358, left: 310, width: 48, height: 48 };
    }
    addEventListener(type, callback) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(callback);
    }
    emit(type, properties = {}) {
      const event = { target: this, button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...properties };
      for (const callback of this.listeners.get(type) || []) callback(event);
      return event;
    }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name); }
    getBoundingClientRect() { return this.rect; }
    append(element) { element.parentElement = this; }
    focus() { document.activeElement = this; }
    animate(frames, options) {
      const animation = new Animation(frames, options);
      animations.push(animation);
      return animation;
    }
  }

  const dialog = new Element();
  dialog.open = false;
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; };
  const panel = new Element();
  const nav = new Element();
  const button = new Element();
  button.dataset = { openLabel: 'Deschide meniul', closeLabel: 'Închide meniul' };
  button.setAttribute('aria-expanded', 'false');
  const slot = new Element();
  slot.append(button);
  const lines = [new Element(), new Element()];
  const links = Array.from({ length: 6 }, (_, index) => {
    const link = new Element();
    link.href = `https://example.test/page-${index}/`;
    link.closest = selector => selector === 'a' ? link : null;
    return link;
  });
  const footer = [new Element(), new Element()];
  const fallback = new Element();
  dialog.querySelector = selector => ({ '.ect-mobile-menu-panel': panel, '.ect-mobile-menu-nav': nav })[selector];
  dialog.querySelectorAll = selector => ({ '.ect-mobile-menu-link': links, '.ect-mobile-menu-footer-link': footer })[selector] || [];
  button.querySelectorAll = selector => selector === '.ect-mobile-menu-icon > span' ? lines : [];

  const body = new Element();
  body.style.cssText = 'color: black; margin: 4px;';
  const originalBodyStyle = body.style.cssText;
  const classes = new Set();
  body.classList = { contains: value => classes.has(value), add: value => classes.add(value) };
  document = {
    body,
    activeElement: null,
    getElementById: id => id === 'ect-mobile-menu' ? dialog : null,
    querySelector: selector => ({ '.ect-mobile-menu-toggle': button, '.ect-mobile-menu-slot': slot })[selector],
    querySelectorAll: () => [fallback],
  };
  const reduced = new Element();
  reduced.matches = reducedMotion;
  const mobile = new Element();
  mobile.matches = true;
  const window = new Element();
  window.scrollY = 157;
  window.visualViewport = { height: 844 };
  window.scrollTo = (x, y) => { scrollCalls.push([x, y]); window.scrollY = y; };
  window.location = { assign: href => navigation.push(href) };

  vm.runInNewContext(runtime, {
    document, window, innerWidth: 390, innerHeight: 844,
    matchMedia: query => query.includes('prefers-reduced-motion') ? reduced : mobile,
  }, { filename: 'mobile-menu.js' });

  function advance(milliseconds) {
    const finished = [];
    for (const animation of animations) {
      if (animation.playState !== 'running') continue;
      animation.currentTime = Math.max(0, Math.min(animation.duration, animation.currentTime + milliseconds * animation.playbackRate));
      if ((animation.playbackRate > 0 && animation.currentTime === animation.duration) || (animation.playbackRate < 0 && animation.currentTime === 0)) {
        animation.playState = 'finished';
        if (animation.onfinish) finished.push(animation.onfinish);
      }
    }
    // Finish events run after all tracks update, as they do on a shared browser frame.
    finished.forEach(callback => callback());
  }

  return { dialog, panel, nav, button, slot, links, footer, body, document, animations, navigation, scrollCalls, originalBodyStyle, advance };
}

function assertRestored(menu) {
  assert.equal(menu.dialog.open, false);
  assert.equal(menu.button.parentElement, menu.slot);
  assert.equal(menu.button.getAttribute('aria-expanded'), 'false');
  assert.equal(menu.body.style.cssText, menu.originalBodyStyle);
  assert.equal(menu.document.activeElement, menu.button);
  assert.deepEqual(menu.scrollCalls.at(-1), [0, 157]);
  assert.ok(menu.animations.every(animation => animation.playState === 'idle'));
}

test('an immediate double toggle closes without rewinding to the fully open endpoint', () => {
  const menu = createMenu();
  menu.button.emit('click');
  assert.equal(menu.dialog.open, true);
  assert.equal(menu.button.parentElement, menu.dialog);
  assert.equal(menu.body.style.position, 'fixed');
  assert.ok(menu.animations.every(animation => animation.currentTime === 0));

  menu.button.emit('click');
  assertRestored(menu);
  assert.deepEqual(menu.navigation, []);
});

test('closing during opening and reopening preserve the current frame of every track', () => {
  const menu = createMenu();
  menu.button.emit('click');
  const panelAnimation = menu.animations[0];
  menu.advance(panelAnimation.duration * .4);
  const beforeClose = menu.animations.map(animation => animation.currentTime);

  menu.button.emit('click');
  assert.deepEqual(menu.animations.map(animation => animation.currentTime), beforeClose);
  assert.ok(menu.animations.every(animation => animation.playbackRate < 0));
  assert.equal(menu.nav.inert, true);
  menu.advance(panelAnimation.currentTime / Math.abs(panelAnimation.playbackRate) * .25);
  const beforeReopen = menu.animations.map(animation => animation.currentTime);
  assert.ok(beforeReopen[0] < beforeClose[0]);

  menu.button.emit('click');
  assert.deepEqual(menu.animations.map(animation => animation.currentTime), beforeReopen);
  assert.ok(menu.animations.every(animation => animation.playbackRate > 0));
  assert.equal(menu.nav.inert, false);
  menu.advance(panelAnimation.duration);
  assert.equal(menu.dialog.open, true);
  assert.ok(menu.animations.every(animation => animation.currentTime === animation.duration));
  assert.deepEqual(menu.navigation, []);
});

test('link navigation waits for close completion and restores page scroll, focus and button', () => {
  const menu = createMenu();
  menu.button.emit('click');
  const panelAnimation = menu.animations[0];
  menu.advance(panelAnimation.duration);
  const click = menu.nav.emit('click', { target: menu.links[2] });
  assert.equal(click.defaultPrevented, true);
  assert.equal(menu.dialog.open, true);
  assert.equal(menu.nav.inert, true);
  assert.deepEqual(menu.navigation, []);

  const remaining = panelAnimation.currentTime / Math.abs(panelAnimation.playbackRate);
  menu.advance(remaining / 2);
  assert.equal(menu.dialog.open, true);
  assert.equal(menu.body.style.position, 'fixed');
  assert.deepEqual(menu.navigation, []);
  menu.advance(remaining / 2 + 1);
  assertRestored(menu);
  assert.deepEqual(menu.navigation, [menu.links[2].href]);
});

test('reopening while a link closes the menu cancels its pending navigation', () => {
  const menu = createMenu();
  menu.button.emit('click');
  const panelAnimation = menu.animations[0];
  menu.advance(panelAnimation.duration);
  menu.nav.emit('click', { target: menu.links[0] });
  menu.advance(panelAnimation.currentTime / Math.abs(panelAnimation.playbackRate) / 2);
  menu.button.emit('click');
  menu.advance(panelAnimation.duration);
  menu.button.emit('click');
  menu.advance(panelAnimation.currentTime / Math.abs(panelAnimation.playbackRate) + 1);
  assertRestored(menu);
  assert.deepEqual(menu.navigation, []);
});

test('reduced motion opens at the final frame and closes immediately', () => {
  const menu = createMenu({ reducedMotion: true });
  menu.button.emit('click');
  assert.equal(menu.dialog.open, true);
  assert.equal(menu.button.getAttribute('aria-expanded'), 'true');
  assert.equal(menu.nav.inert, false);
  assert.ok(menu.animations.every(animation => animation.playState === 'paused' && animation.currentTime === animation.duration));

  menu.button.emit('click');
  assertRestored(menu);
  assert.deepEqual(menu.navigation, []);
});
