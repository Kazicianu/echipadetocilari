import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../../legacy-mirror/wp-content/ect-pages/creare-magazin-online.js', import.meta.url), 'utf8');

function element() {
  const attributes = new Map();
  const listeners = new Map();
  const classes = new Set();
  const properties = new Map();
  return {
    hidden: false,
    style: {
      setProperty(name, value) { properties.set(name, value); },
      getPropertyValue: name => properties.get(name) ?? '',
    },
    attributes,
    classList: {
      contains: name => classes.has(name),
      add(...names) { names.forEach(name => classes.add(name)); },
      remove(...names) { names.forEach(name => classes.delete(name)); },
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

function block(top, height = 200) {
  const node = { ...element(), parentElement: null, getBoundingClientRect: () => ({ top, bottom: top + height }) };
  const waiting = () => node.classList.contains('mg-rv') && !node.classList.contains('mg-in');
  node.closest = selector => selector === '.mg-rv:not(.mg-in)' && waiting() ? node : node.parentElement?.closest(selector) ?? null;
  return node;
}

function fixture({
  reducedMotion = false, observer = false, without = [],
  blockTops = [], paperTop = null, lineTops = [], ticketTops = [], cutTops = [], anchors = {},
  hash = null, arrival = null, scrollY = 0,
} = {}) {
  const visual = element();
  const metro = element();
  const blocks = blockTops.map(top => block(top));
  const paper = paperTop === null ? null : block(paperTop, 700);
  const lines = lineTops.map(top => block(top, 60));
  const tickets = ticketTops.map(top => block(top, 260));
  const cuts = cutTops.map(top => block(top, 36));
  lines.forEach((line) => { line.parentElement = paper; });
  cuts.forEach((cut, index) => { cut.parentElement = tickets[index] ?? null; });
  /* Document order: plain blocks, then the receipt with its lines, then the tickets and their cut rows. */
  const armable = [...blocks, ...(paper ? [paper] : []), ...lines, ...tickets, ...cuts];
  const observers = [];
  const screens = Array.from({ length: 4 }, element);
  const dots = screens.map(() => ({ ...element(), firstElementChild: element() }));
  const mascot = element();
  const page = {
    querySelector: selector => without.includes(selector) ? null : ({
      '.mg-hero-visual': visual,
      '.mg-metro': observer ? metro : null,
      '.mg-receipt': paper,
      '[data-js="faq-mascot"]': mascot,
    })[selector] || null,
    querySelectorAll(selector) {
      if (selector === '.mg-rv') return armable.filter(node => node.classList.contains('mg-rv'));
      if (selector === '.mg-rv:not(.mg-in)') return armable.filter(node => node.closest(selector) === node);
      if (selector === '.mg-t3__cut') return cuts;
      if (selector.startsWith('.mg-receipt__list > li')) return lines;
      if (selector.includes('.mg-pcard')) return armable;
      return { '[data-screen]': screens, '[data-js="dot"]': dots }[selector] || [];
    },
  };
  const document = {
    ...element(),
    hidden: false,
    querySelector: selector => selector === '.ect-page--creare-magazin-online' ? page : null,
    getElementById: id => anchors[id] ?? null,
  };
  const preference = { ...element(), matches: reducedMotion };
  const timers = new Map();
  let now = 0;
  let timerId = 0;
  const window = {
    ...element(),
    innerHeight: 800,
    scrollY,
    ...(hash === null ? {} : { location: { hash } }),
    performance: {
      now: () => now,
      ...(arrival ? { getEntriesByType: kind => kind === 'navigation' ? [{ type: arrival }] : [] } : {}),
    },
    matchMedia: () => preference,
    setTimeout(callback, delay) {
      const id = ++timerId;
      timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
  };
  if (observer) {
    window.IntersectionObserver = class {
      constructor(callback, options) {
        Object.assign(this, { callback, options, targets: new Set(), disconnected: false });
        observers.push(this);
      }
      observe(target) {
        if (!target) throw new TypeError('observe() needs an element');
        this.targets.add(target);
      }
      unobserve(target) { this.targets.delete(target); }
      disconnect() { this.targets.clear(); this.disconnected = true; }
    };
  }
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

  const entry = ([target, isIntersecting, top = 0, intersectionRatio]) => ({
    target, isIntersecting, intersectionRatio, boundingClientRect: { top, bottom: top + 200 },
  });

  return {
    visual, metro, blocks, paper, lines, tickets, cuts, observers, screens, dots, mascot, timers, window, advance,
    select(index) { dots[index].emit('click'); },
    /* Delivers one batch through the first observer that watches the first target. Each entry is [target, isIntersecting, top, ratio]. */
    intersect(...entries) {
      observers.find(candidate => candidate.targets.has(entries[0][0])).callback(entries.map(entry));
    },
    /* Delivers one batch through a given observer, whether or not it still watches the targets. */
    deliver(watcher, ...entries) { watcher.callback(entries.map(entry)); },
    watchers: target => observers.filter(candidate => candidate.targets.has(target)),
    focus(target) { document.emit('focusin', { target }); },
    click(target, keys = {}) { document.emit('click', { target, ...keys }); },
    emitWindow(name, event) { window.emit(name, event); },
    setClock(read) { window.performance.now = read ?? (() => now); },
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

test('the FAQ character keeps moving and rests only for a hidden tab or reduced motion', () => {
  const f = fixture();
  assert.equal(f.mascot.classList.contains('mg-paused'), false);
  f.select(2);
  f.advance(3800);
  assert.equal(f.mascot.classList.contains('mg-paused'), false);

  f.setHidden(true);
  assert.equal(f.mascot.classList.contains('mg-paused'), true);
  f.setHidden(false);
  assert.equal(f.mascot.classList.contains('mg-paused'), false);

  f.setReducedMotion(true);
  assert.equal(f.mascot.classList.contains('mg-paused'), true);
  f.setReducedMotion(false);
  assert.equal(f.mascot.classList.contains('mg-paused'), false);

  assert.equal(fixture({ reducedMotion: true }).mascot.classList.contains('mg-paused'), true);
});

test('off screen the hero freezes without the poster state and returns with the time it had left', () => {
  const f = fixture({ observer: true });
  /* The delivery line and the character get a 120px lead. The phone tells a story, so it has none. */
  assert.equal(f.observers[0].options.rootMargin, '120px 0px');
  assert.deepEqual([f.observers[0].targets.has(f.visual), f.observers[0].targets.has(f.metro), f.observers[0].targets.has(f.mascot)], [false, true, true]);
  assert.deepEqual([f.observers[1].options, f.observers[1].targets.has(f.visual)], [undefined, true]);
  f.advance(1000);
  f.intersect([f.visual, false]);
  assert.equal(f.visual.classList.contains('mg-offscreen'), true);
  assert.equal(f.visual.classList.contains('mg-phone-paused'), false);
  assert.equal(f.timers.size, 0);
  f.advance(20000);
  assertScreen(f, 0);

  f.intersect([f.visual, true]);
  assert.equal(f.visual.classList.contains('mg-offscreen'), false);
  assert.equal(f.timers.size, 1);
  f.advance(2799);
  assertScreen(f, 0);
  f.advance(1);
  assertScreen(f, 1);
  f.advance(3800);
  assertScreen(f, 2);
  assert.equal(f.timers.size, 1);
});

test('a screen picked or a tab hidden while the hero is off screen restarts a full interval on return', () => {
  for (const interrupt of [f => f.select(2), f => { f.setHidden(true); f.setHidden(false); }]) {
    const f = fixture({ observer: true });
    f.advance(3000);
    f.intersect([f.visual, false]);
    interrupt(f);
    assert.equal(f.timers.size, 0);
    const shown = f.screens.findIndex(screen => !screen.hidden);
    f.intersect([f.visual, true]);
    f.advance(3799);
    assertScreen(f, shown);
    f.advance(1);
    assertScreen(f, (shown + 1) % 4);
  }
});

test('the delivery line and the FAQ character wait off screen without touching the hero', () => {
  const f = fixture({ observer: true });
  f.advance(1000);
  f.intersect([f.metro, false], [f.mascot, false]);
  assert.equal(f.metro.classList.contains('mg-offscreen'), true);
  assert.equal(f.mascot.classList.contains('mg-paused'), true);
  assert.equal(f.visual.classList.contains('mg-offscreen'), false);

  f.intersect([f.metro, true], [f.mascot, true]);
  assert.equal(f.metro.classList.contains('mg-offscreen'), false);
  assert.equal(f.mascot.classList.contains('mg-paused'), false);
  f.advance(2799);
  assertScreen(f, 0);
  f.advance(1);
  assertScreen(f, 1);
});

test('entrances hide only blocks below the fold and reveal each batch as a cascade', () => {
  const f = fixture({ observer: true, blockTops: [-300, 200, 800, 900, 1000, 2400] });
  const [above, inView, ...waiting] = f.blocks;
  const [watcher, whole] = f.watchers(waiting[0]);
  assert.equal(watcher.options.rootMargin, '100000px 0px -64px 0px');
  assert.deepEqual([whole.options.rootMargin, whole.options.threshold], ['100000px 0px 0px 0px', 0.99]);
  assert.equal(above.classList.contains('mg-rv') || inView.classList.contains('mg-rv'), false);
  assert.deepEqual(waiting.map(node => node.classList.contains('mg-rv')), [true, true, true, true]);
  assert.equal(f.timers.size, 1);

  f.intersect([waiting[0], true, 600], [waiting[1], false, 900], [waiting[2], true, 640]);
  assert.deepEqual(waiting.map(node => node.classList.contains('mg-in')), [true, false, true, false]);
  assert.deepEqual([waiting[0], waiting[2]].map(node => node.style.getPropertyValue('--mg-delay')), ['0ms', '80ms']);
  assert.deepEqual(waiting.map(node => watcher.targets.has(node)), [false, true, false, true]);

  /* A block the visitor jumped past is counted by the tall top margin and does not delay the visible one. */
  f.intersect([waiting[1], true, -900], [waiting[3], true, 500]);
  assert.deepEqual([waiting[1], waiting[3]].map(node => node.style.getPropertyValue('--mg-delay')), ['0ms', '0ms']);
  assert.deepEqual([watcher.targets.size, whole.targets.size], [0, 0]);
  assert.equal(f.timers.size, 1);
});

test('a block that is wholly on screen enters even below the 64px line, but a block that only touches the viewport waits', () => {
  const f = fixture({ observer: true, blockTops: [900, 1000] });
  const [short, tall] = f.blocks;
  const [line, whole] = f.watchers(short);
  f.deliver(whole, [short, true, 760, 1], [tall, true, 790, 0.05]);
  assert.deepEqual(f.blocks.map(node => node.classList.contains('mg-in')), [true, false]);
  assert.deepEqual([line.targets.has(short), whole.targets.has(short), line.targets.has(tall), whole.targets.has(tall)], [false, false, true, true]);
  /* Both observers may report the same block. The second report changes nothing. */
  f.deliver(line, [short, true, 700]);
  assert.equal(short.style.getPropertyValue('--mg-delay'), '0ms');
});

test('a long batch caps the cascade, and a batch delivered after reduced motion is ignored', () => {
  const f = fixture({ observer: true, blockTops: Array.from({ length: 11 }, (_, index) => 800 + index * 100) });
  const [late, ...batch] = f.blocks;
  const [watcher] = f.watchers(late);
  f.intersect(...batch.map(node => [node, true, 300]));
  assert.deepEqual(batch.map(node => node.style.getPropertyValue('--mg-delay')), ['0ms', '80ms', '160ms', '240ms', '320ms', '400ms', '480ms', '560ms', '560ms', '560ms']);
  f.setReducedMotion(true);
  assert.doesNotThrow(() => f.deliver(watcher, [late, true, 300]));
  assert.equal(late.classList.contains('mg-in'), false);
});

test('receipt lines print in a queue behind the paper, and a cut row follows its ticket without a delay of its own', () => {
  const f = fixture({ observer: true, blockTops: [900], paperTop: 1000, lineTops: [1100, 1200, 1300], cutTops: [950] });
  const [tile] = f.blocks;
  const [first, second, third] = f.lines;
  assert.deepEqual([f.paper, ...f.lines, ...f.cuts].map(node => node.classList.contains('mg-rv')), [true, true, true, true, true]);

  f.advance(1000);
  f.intersect([tile, true, 500], [f.cuts[0], true, 520], [f.paper, true, 400], [first, true, 500], [second, true, 600]);
  /* The paper and the cut row take no step of the cascade and set no delay. */
  assert.deepEqual([tile, f.cuts[0], f.paper].map(node => node.style.getPropertyValue('--mg-delay')), ['0ms', '', '']);
  assert.deepEqual([first, second].map(node => node.style.getPropertyValue('--mg-delay')), ['250ms', '410ms']);
  assert.deepEqual([f.cuts[0], f.paper, first, second, third].map(node => node.classList.contains('mg-in')), [true, true, true, true, false]);

  /* A line that scrolls in while the queue is busy waits its turn. Once the queue is idle a line prints at once. */
  f.advance(200);
  f.intersect([third, true, 700]);
  assert.equal(third.style.getPropertyValue('--mg-delay'), '370ms');
  const g = fixture({ observer: true, lineTops: [1100], paperTop: 1000 });
  g.advance(5000);
  g.intersect([g.lines[0], true, 700]);
  assert.equal(g.lines[0].style.getPropertyValue('--mg-delay'), '0ms');
});

test('keyboard focus shows a waiting block at once, with the blocks around it, and leaves other blocks alone', () => {
  const f = fixture({ observer: true, blockTops: [200, 900, 1800], paperTop: 2000, lineTops: [2100] });
  const [inView, focused, far] = f.blocks;
  const [watcher] = f.watchers(focused);
  f.focus(inView);
  f.focus(f.dots[0]);
  f.focus(null);
  assert.deepEqual(f.blocks.map(node => node.classList.contains('mg-in')), [false, false, false]);

  f.focus(focused);
  assert.equal(focused.classList.contains('mg-in'), true);
  assert.equal(focused.style.getPropertyValue('--mg-delay'), '0ms');
  assert.deepEqual([watcher.targets.has(focused), watcher.targets.has(far)], [false, true]);

  f.focus(f.lines[0]);
  assert.deepEqual([f.lines[0], f.paper].map(node => node.classList.contains('mg-in')), [true, true]);
  f.setReducedMotion(true);
  assert.doesNotThrow(() => f.focus(far));
  assert.equal(far.classList.contains('mg-in'), false);
});

test('an in-page link shows the blocks above its target without an entrance and keeps the ones below waiting', () => {
  const goal = block(1500);
  const link = { closest: selector => selector === 'a[href^="#"]' ? link : null, getAttribute: () => '#cost' };
  const f = fixture({ observer: true, blockTops: [900, 1200, 1500, 2600], anchors: { cost: goal } });
  const [above, alsoAbove, atGoal, below] = f.blocks;
  const [watcher, whole] = f.watchers(above);
  f.click({ closest: () => null });
  f.click({ closest: selector => selector === 'a[href^="#"]' ? { getAttribute: () => '#missing' } : null });
  assert.deepEqual(f.blocks.map(node => node.classList.contains('mg-rv')), [true, true, true, true]);

  f.click(link);
  assert.deepEqual(f.blocks.map(node => node.classList.contains('mg-rv')), [false, false, true, true]);
  assert.deepEqual(f.blocks.map(node => node.classList.contains('mg-in')), [false, false, false, false]);
  assert.deepEqual([above, alsoAbove, atGoal, below].map(node => watcher.targets.has(node) || whole.targets.has(node)), [false, false, true, true]);
  /* A report that was already queued for a released block is ignored. */
  f.deliver(watcher, [above, true, 300]);
  assert.equal(above.classList.contains('mg-in'), false);
});

test('entrances never hide content without an observer or with reduced motion, and reduced motion drops them', () => {
  for (const options of [{}, { observer: true, reducedMotion: true }]) {
    const f = fixture({ ...options, blockTops: [900, 1800] });
    assert.deepEqual(f.blocks.map(node => node.classList.contains('mg-rv')), [false, false]);
  }

  const f = fixture({ observer: true, blockTops: [900, 1800] });
  const watcher = f.observers.find(candidate => candidate.targets.has(f.blocks[0]));
  f.intersect([f.blocks[0], true, 600]);
  f.setReducedMotion(true);
  assert.deepEqual(f.blocks.map(node => node.classList.contains('mg-rv') || node.classList.contains('mg-in')), [false, false]);
  assert.equal(watcher.disconnected, true);
  f.setReducedMotion(false);
  assert.deepEqual(f.blocks.map(node => node.classList.contains('mg-rv')), [false, false]);
});

test('pageshow starts one full interval although it hands over an event, and pagehide stops the timer', () => {
  const f = fixture();
  f.advance(300);
  f.emitWindow('pageshow', { persisted: false });
  assert.deepEqual([...f.timers.values()].map(timer => timer.at), [4100]);
  f.advance(3799);
  assertScreen(f, 0);
  f.advance(1);
  assertScreen(f, 1);
  f.emitWindow('pagehide', { persisted: true });
  assert.equal(f.timers.size, 0);
  f.emitWindow('pageshow', { persisted: true });
  assert.equal(f.timers.size, 1);
  f.advance(3800);
  assertScreen(f, 2);
});

test('a repeated in-view report does not restart the hero interval, and an overdue tick is not carried off screen', () => {
  const f = fixture({ observer: true });
  f.advance(1000);
  f.intersect([f.visual, true]);
  f.intersect([f.metro, true], [f.mascot, true]);
  assert.deepEqual([...f.timers.values()].map(timer => timer.at), [3800]);

  f.setClock(() => 5000);
  f.intersect([f.visual, false]);
  f.setClock();
  f.intersect([f.visual, true]);
  assert.deepEqual([...f.timers.values()].map(timer => timer.at), [4800]);
});

test('a page without the delivery line or the FAQ character still starts and still holds the hero off screen', () => {
  const f = fixture({ observer: true, without: ['.mg-metro', '[data-js="faq-mascot"]'], blockTops: [900] });
  assert.deepEqual(f.observers.slice(0, 2).map(watcher => watcher.targets.size), [0, 1]);
  assert.equal(f.blocks[0].classList.contains('mg-rv'), true);
  f.intersect([f.visual, false]);
  assert.equal(f.visual.classList.contains('mg-offscreen'), true);
  assert.equal(f.timers.size, 0);
});

test('a second report for a block that already entered changes neither its delay nor the printer queue', () => {
  const f = fixture({ observer: true, blockTops: [900, 1000], paperTop: 1100, lineTops: [1200] });
  const [first, second] = f.blocks;
  const [line, whole] = f.watchers(first);
  f.advance(1000);
  f.deliver(line, [first, true, 700], [f.paper, true, 500], [f.lines[0], true, 600]);
  assert.deepEqual([first, f.lines[0]].map(node => node.style.getPropertyValue('--mg-delay')), ['0ms', '250ms']);
  f.deliver(whole, [second, true, 760, 1], [first, true, 700, 1], [f.lines[0], true, 600, 1]);
  assert.deepEqual([second, first, f.lines[0]].map(node => node.style.getPropertyValue('--mg-delay')), ['0ms', '0ms', '250ms']);
});

test('the paper, a receipt line and a cut row ahead of plain blocks take no step of the cascade', () => {
  const f = fixture({ observer: true, blockTops: [900, 1000], paperTop: 1100, lineTops: [1200], cutTops: [950] });
  const [one, two] = f.blocks;
  const [watcher] = f.watchers(one);
  f.deliver(watcher, [f.cuts[0], true, 520], [f.paper, true, 400], [f.lines[0], true, 500], [one, true, 500], [two, true, 600]);
  assert.deepEqual([one, two].map(node => node.style.getPropertyValue('--mg-delay')), ['0ms', '80ms']);
});

test('receipt lines the visitor jumped past neither wait in the queue nor hold it', () => {
  const f = fixture({ observer: true, paperTop: 1000, lineTops: [1100, 1200, 1300] });
  const [watcher] = f.watchers(f.paper);
  f.advance(1000);
  f.deliver(watcher, [f.paper, true, -900], [f.lines[0], true, -800], [f.lines[1], true, -600], [f.lines[2], true, 300]);
  assert.deepEqual(f.lines.map(node => node.style.getPropertyValue('--mg-delay')), ['0ms', '0ms', '250ms']);
});

test('a block just under the whole-block threshold still waits, and a block cut by the top edge counts as visible', () => {
  const f = fixture({ observer: true, blockTops: [900, 1000, 1100] });
  const [almost, cut, next] = f.blocks;
  const [line, whole] = f.watchers(almost);
  f.deliver(whole, [almost, true, 700, 0.98]);
  assert.equal(almost.classList.contains('mg-in'), false);
  f.deliver(line, [cut, true, -100], [next, true, 300]);
  assert.deepEqual([cut, next].map(node => node.style.getPropertyValue('--mg-delay')), ['0ms', '80ms']);
});

test('an address with a hash arms only from its target down, and a page that flies back after a reload drops its entrances', () => {
  const f = fixture({ observer: true, blockTops: [200, 900, 1200, 1500, 2600], anchors: { cost: block(1500) }, hash: '#cost' });
  assert.deepEqual(f.blocks.map(node => node.classList.contains('mg-rv')), [false, false, false, true, true]);
  for (const hash of ['#near', '#missing', '#%E0%A4%A', '#', '']) {
    const g = fixture({ observer: true, blockTops: [200, 900, 1200], anchors: { near: block(300) }, hash });
    assert.deepEqual(g.blocks.map(node => node.classList.contains('mg-rv')), [false, true, true]);
  }
  const armedBlocks = g => g.blocks.map(node => node.classList.contains('mg-rv'));
  for (const arrival of ['reload', 'back_forward']) {
    /* Still at the top: the page arms, and a move nobody asked for is the browser flying back. */
    const flown = fixture({ observer: true, blockTops: [900, 1200], arrival });
    const [watcher] = flown.watchers(flown.blocks[0]);
    assert.deepEqual(armedBlocks(flown), [true, true]);
    flown.emitWindow('scroll');
    assert.deepEqual(armedBlocks(flown), [false, false]);
    assert.deepEqual(flown.blocks.map(node => node.classList.contains('mg-in')), [false, false]);
    assert.equal(watcher.targets.size, 0);

    /* The visitor scrolls first: the entrances stay. */
    for (const input of ['wheel', 'touchstart', 'keydown', 'pointerdown']) {
      const read = fixture({ observer: true, blockTops: [900, 1200], arrival });
      read.emitWindow(input);
      read.emitWindow('scroll');
      assert.deepEqual(armedBlocks(read), [true, true]);
    }

    /* Already back in place: the page arms from there and a late scroll report changes nothing. */
    const restored = fixture({ observer: true, blockTops: [200, 900, 1200], arrival, scrollY: 2400 });
    assert.deepEqual(armedBlocks(restored), [false, true, true]);
    restored.emitWindow('scroll');
    assert.deepEqual(armedBlocks(restored), [false, true, true]);
  }
  const plain = fixture({ observer: true, blockTops: [900, 1200], arrival: 'navigate' });
  plain.emitWindow('scroll');
  assert.deepEqual(armedBlocks(plain), [true, true]);
});

test('a click with a modifier key releases nothing, because the link opens elsewhere', () => {
  const link = { closest: selector => selector === 'a[href^="#"]' ? link : null, getAttribute: () => '#cost' };
  const f = fixture({ observer: true, blockTops: [900, 1200, 1500], anchors: { cost: block(1500) } });
  for (const keys of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
    f.click(link, keys);
    assert.deepEqual(f.blocks.map(node => node.classList.contains('mg-rv')), [true, true, true]);
  }
  f.click(link, { button: 0, ctrlKey: false });
  assert.deepEqual(f.blocks.map(node => node.classList.contains('mg-rv')), [false, false, true]);
});

test('the next Tab stop keeps its own entrance while the blocks the page flies over are simply shown', () => {
  const f = fixture({ observer: true, blockTops: [900, 1200, 1500, 2600] });
  const [passed, alsoPassed, focused, later] = f.blocks;
  f.focus(focused);
  assert.deepEqual(f.blocks.map(node => node.classList.contains('mg-rv')), [false, false, true, true]);
  assert.deepEqual(f.blocks.map(node => node.classList.contains('mg-in')), [false, false, true, false]);
  assert.deepEqual([passed, alsoPassed, focused, later].map(node => f.watchers(node).length), [0, 0, 0, 2]);
});

test('a cut row waits only together with its ticket, so the stub of a ticket already on screen never straightens', () => {
  /* The fold (800) lies between the first ticket's top and its cut row. */
  const f = fixture({ observer: true, ticketTops: [700, 900], cutTops: [843, 1043] });
  assert.deepEqual(f.tickets.map(node => node.classList.contains('mg-rv')), [false, true]);
  assert.deepEqual(f.cuts.map(node => node.classList.contains('mg-rv')), [false, true]);
});
