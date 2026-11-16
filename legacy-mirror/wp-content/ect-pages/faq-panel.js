/*! FAQ panel motion. Adapted from "FAQ panel" by Juan Di Nella, https://microinteractions.dev/faq-panel/
 *
 * MIT License
 *
 * Copyright (c) Juan Di Nella
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/* One shared panel for every FAQ list marked with [data-faq-panel]. The questions stay native
   <details name> elements: without this script (or if it fails) the page keeps its exclusive
   accordion. The script takes over the exclusivity, so it can animate the answer that closes.

   Contract with the page CSS:
   - host [data-faq-panel], optional data-fqp-target="<selector inside the item>" (default: the item)
     and data-fqp-reserve="off";
   - <span class="fqp-panel"> is the host's first child; the page CSS gives it its look;
   - each answer is wrapped in <div class="fqp-region">;
   - the host gets data-fqp-ready once the panel is placed, and --fqp-move / --fqp-ease;
   - an item that is closing keeps [open] and carries [data-fqp-closing] until the move ends. */
(() => {
  'use strict';

  const MOVE = 300;
  const EASE = 'cubic-bezier(0.64, 0, 0.2, 1)';
  const RETARGET = 'cubic-bezier(0.23, 1, 0.32, 1)';
  const TEXT_OUT = 140;
  const TEXT_IN = 210;
  const TEXT_OUT_EASE = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
  const TEXT_IN_EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
  const SHIFT = 6;
  const BLUR = 3;

  const px = (value) => `${value}px`;
  const translate = (b) => `translate(${b.x}px, ${b.y}px)`;

  const enhance = (host) => {
    if (host.hasAttribute('data-fqp-ready') || host.querySelector(':scope > .fqp-panel')) return;

    const items = [...host.querySelectorAll(':scope > details')];
    if (!items.length) return;
    const summaries = items.map((item) => item.querySelector(':scope > summary'));
    if (summaries.some((summary) => !summary || !summary.nextElementSibling)) return;
    const answers = summaries.map((summary) => summary.nextElementSibling);
    const selector = host.getAttribute('data-fqp-target');
    const innerTarget = Boolean(selector);
    let targets;
    try {
      targets = items.map((item) => (innerTarget ? item.querySelector(selector) : item));
    } catch (error) {
      return;
    }
    if (targets.some((target) => !target)) return;

    const useReserve = host.getAttribute('data-fqp-reserve') !== 'off';
    const controller = new AbortController();
    const { signal } = controller;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const regions = [];
    const positioned = [];
    let panel = null;
    let observer = null;
    let frame = 0;
    let open = -1;
    let run = 0;
    let moving = [];
    let stale = false;
    let dead = false;
    let closed = 0;
    let reserve = 0;
    let extra = 0;

    /* Back to the native accordion: no panel, no wrappers, names restored, one item open at most. */
    const teardown = () => {
      if (dead) return;
      dead = true;
      run++;
      controller.abort();
      if (observer) observer.disconnect();
      cancelAnimationFrame(frame);
      [...(panel ? panel.getAnimations() : []), ...moving].forEach((animation) => {
        try { animation.cancel(); } catch (error) { /* already gone */ }
      });
      moving = [];
      let keep = open;
      if (keep < 0 || !items[keep].hasAttribute('open')) {
        keep = items.findIndex((item) => item.hasAttribute('open') && !item.hasAttribute('data-fqp-closing'));
      }
      items.forEach((item, i) => {
        const region = regions[i];
        if (region) {
          if (region.parentNode === item && answers[i].parentNode === region) region.replaceWith(answers[i]);
          region.inert = false;
        }
        item.removeAttribute('data-fqp-closing');
        item.toggleAttribute('open', i === keep);
      });
      items.forEach((item) => {
        if (!item.hasAttribute('data-fqp-name')) return;
        item.setAttribute('name', item.getAttribute('data-fqp-name'));
        item.removeAttribute('data-fqp-name');
      });
      positioned.forEach((element) => { element.style.position = ''; });
      host.style.minHeight = '';
      host.style.removeProperty('--fqp-move');
      host.style.removeProperty('--fqp-ease');
      host.removeAttribute('data-fqp-ready');
      if (panel) panel.remove();
    };

    const fail = (error) => {
      teardown();
      if (window.console) console.warn('faq-panel: fell back to the native accordion.', error);
    };

    /* Wraps a listener: once the panel has failed it does nothing, and a failure inside tears it down. */
    const guard = (fn) => (...args) => {
      if (dead) return undefined;
      try {
        return fn(...args);
      } catch (error) {
        fail(error);
        return undefined;
      }
    };

    try {
      /* 1. Wrap each answer, so its height can animate with the answer's own margins included. */
      answers.forEach((answer, i) => {
        const region = document.createElement('div');
        region.className = 'fqp-region';
        region.style.display = 'flow-root';
        summaries[i].after(region);
        region.append(answer);
        regions[i] = region;
      });

      /* 3. The items paint above the panel, which sits in the host's padding box. */
      [host, ...items].forEach((element) => {
        if (getComputedStyle(element).position === 'static') {
          element.style.position = 'relative';
          positioned.push(element);
        }
      });

      /* 4. A native name group would close the old item the moment the new one opens. */
      items.forEach((item) => {
        if (!item.hasAttribute('name')) return;
        item.setAttribute('data-fqp-name', item.getAttribute('name'));
        item.removeAttribute('name');
      });

      /* 5. The first open item stays open; any other one closes without a move. */
      open = items.findIndex((item) => item.hasAttribute('open'));
      items.forEach((item, i) => {
        if (i !== open) item.removeAttribute('open');
      });

      panel = document.createElement('span');
      panel.className = 'fqp-panel';
      panel.setAttribute('aria-hidden', 'true');
      panel.style.cssText = 'position:absolute;top:0;left:0;margin:0;pointer-events:none;box-sizing:border-box;opacity:0';
      host.prepend(panel);

      host.style.setProperty('--fqp-move', `${MOVE}ms`);
      host.style.setProperty('--fqp-ease', EASE);

      /* 6. A box in the host's padding-box coordinates, undoing any scale on the host. offsetWidth is
         rounded to whole pixels, so a difference under 1px is rounding, not a scale. */
      const box = (element) => {
        const frameBox = host.getBoundingClientRect();
        const scale = Math.abs(frameBox.width - host.offsetWidth) < 1 ? 1 : frameBox.width / host.offsetWidth || 1;
        const rect = element.getBoundingClientRect();
        return {
          x: (rect.left - frameBox.left) / scale - host.clientLeft,
          y: (rect.top - frameBox.top) / scale - host.clientTop,
          width: rect.width / scale,
          height: rect.height / scale,
        };
      };

      /* min-height works on the content box unless the host is border-box. */
      const minPx = (height) => px(Math.max(0, height - extra));

      /* 7. Rearranges the items for one synchronous read: the host with everything closed, then with
         each item open on its own. The tallest of those is the height kept while an answer is open,
         so nothing below the list moves. Everything is put back as it was. */
      const measure = () => {
        const saved = items.map((item, i) => [
          item.hasAttribute('open'),
          item.hasAttribute('data-fqp-closing'),
          regions[i].style.height,
        ]);
        const minHeight = host.style.minHeight;
        host.style.minHeight = '';
        const style = getComputedStyle(host);
        extra = style.boxSizing === 'border-box'
          ? 0
          : ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth']
            .reduce((sum, key) => sum + (parseFloat(style[key]) || 0), 0);
        items.forEach((item, i) => {
          item.removeAttribute('data-fqp-closing');
          item.removeAttribute('open');
          regions[i].style.height = '';
        });
        closed = box(host).height;
        reserve = closed;
        if (useReserve) {
          items.forEach((item) => {
            item.setAttribute('open', '');
            reserve = Math.max(reserve, box(host).height);
            item.removeAttribute('open');
          });
        }
        items.forEach((item, i) => {
          const [wasOpen, wasClosing, height] = saved[i];
          item.toggleAttribute('open', wasOpen);
          item.toggleAttribute('data-fqp-closing', wasClosing);
          regions[i].style.height = height;
        });
        host.style.minHeight = minHeight;
      };

      /* 8. The resting state. */
      const sync = () => {
        items.forEach((item, i) => {
          item.toggleAttribute('open', i === open);
          item.removeAttribute('data-fqp-closing');
          regions[i].style.height = '';
          regions[i].style.overflow = '';
          regions[i].inert = false;
        });
        host.style.minHeight = open < 0 || !useReserve ? '' : minPx(reserve);
      };

      /* 9. */
      const place = () => {
        if (open < 0) {
          panel.style.opacity = '0';
          return;
        }
        const target = box(targets[open]);
        panel.style.transform = translate(target);
        panel.style.width = px(target.width);
        panel.style.height = px(target.height);
        panel.style.opacity = '';
      };

      const stopAll = () => {
        panel.getAnimations().forEach((animation) => animation.cancel());
        moving.forEach((animation) => animation.cancel());
        moving = [];
      };

      /* A change without movement. */
      const jump = (next) => {
        run++;
        stopAll();
        open = next;
        sync();
        place();
      };

      /* 11. */
      const settle = () => {
        moving.forEach((animation) => animation.cancel());
        moving = [];
        if (stale) {
          stale = false;
          measure();
        }
        sync();
        place();
      };

      /* 10. FLIP: read what is on screen (mid-move included), swap the answers, measure the end
         state, write it inline and animate from the first reading. */
      const select = (index, animate) => {
        const next = index === open ? -1 : index;
        const interrupted = panel.getAnimations().length > 0;
        const fromOpacity = Number(getComputedStyle(panel).opacity);
        const shown = fromOpacity > 0;
        let from = null;
        if (shown) from = box(panel);
        else if (!innerTarget) from = box(summaries[index]);
        const heights = items.map((item, i) => (item.hasAttribute('open') ? box(regions[i]).height : 0));
        const card = box(host).height;
        const textStates = answers.map((answer) => {
          const { opacity, transform, filter } = getComputedStyle(answer);
          return { opacity, transform, filter };
        });

        if (!animate || reduceMotion.matches) {
          jump(next);
          return;
        }

        run++;
        const current = run;
        stopAll();
        open = next;

        items.forEach((item, i) => {
          const region = regions[i];
          region.style.height = '';
          region.style.overflow = '';
          region.inert = false;
          if (i === next) {
            item.removeAttribute('data-fqp-closing');
            item.toggleAttribute('open', true);
            region.style.overflow = 'hidden';
          } else if (heights[i] > 0) {
            item.toggleAttribute('open', true);
            item.setAttribute('data-fqp-closing', '');
            region.inert = true;
            region.style.height = '0px';
            region.style.overflow = 'hidden';
          } else {
            item.removeAttribute('data-fqp-closing');
            item.removeAttribute('open');
          }
        });
        host.style.minHeight = next < 0 || !useReserve ? '' : minPx(reserve);

        const target = items.map((item, i) => (i === next ? box(regions[i]).height : 0));
        let to;
        if (next >= 0) {
          to = box(targets[next]);
        } else if (!innerTarget) {
          to = box(items[index]);
        } else {
          const targetBox = box(targets[index]);
          to = { x: targetBox.x, width: targetBox.width, y: box(regions[index]).y, height: 0 };
        }
        if (!from) from = { x: to.x, width: to.width, y: box(regions[index]).y, height: 0 };

        const direction = to.y < from.y ? -1 : 1;
        const easing = interrupted ? RETARGET : EASE;
        const opacity = next < 0 ? 0 : 1;

        panel.style.transform = translate(to);
        panel.style.width = px(to.width);
        panel.style.height = px(to.height);
        panel.style.opacity = next < 0 ? '0' : '';

        const move = panel.animate(
          [
            { transform: translate(from), width: px(from.width), height: px(from.height), opacity: fromOpacity },
            { opacity, offset: 0.5 },
            { transform: translate(to), width: px(to.width), height: px(to.height), opacity },
          ],
          { duration: MOVE, easing },
        );

        if (useReserve) {
          const cardTarget = next < 0 ? closed : reserve;
          if (Math.abs(card - cardTarget) >= 0.5) {
            moving.push(host.animate([{ minHeight: minPx(card) }, { minHeight: minPx(cardTarget) }], { duration: MOVE, easing }));
          }
        }

        regions.forEach((region, i) => {
          if (Math.abs(heights[i] - target[i]) < 0.5) return;
          moving.push(region.animate([{ height: px(heights[i]) }, { height: px(target[i]) }], { duration: MOVE, easing }));
        });

        const away = (sign) => ({ opacity: 0, transform: `translateY(${sign * SHIFT}px)`, filter: `blur(${BLUR}px)` });
        const rest = { opacity: 1, transform: 'none', filter: 'none' };
        answers.forEach((answer, i) => {
          if (i === next) {
            const resuming = heights[i] > 0;
            moving.push(
              answer.animate([resuming ? textStates[i] : away(-direction), rest], {
                duration: TEXT_IN,
                delay: resuming ? 0 : MOVE - TEXT_IN,
                easing: TEXT_IN_EASE,
                fill: 'backwards',
              }),
            );
          } else if (heights[i] > 0) {
            moving.push(answer.animate([textStates[i], away(direction)], { duration: TEXT_OUT, easing: TEXT_OUT_EASE, fill: 'forwards' }));
          }
        });

        const done = guard(() => {
          if (current === run) settle();
        });
        move.addEventListener('finish', done);
        move.addEventListener('cancel', done);
      };

      /* 12. Enter and Space on a summary also arrive as a click. */
      summaries.forEach((summary, i) => {
        summary.addEventListener('click', (event) => {
          if (dead) return;
          event.preventDefault();
          const wanted = i !== open;
          try {
            select(i, true);
          } catch (error) {
            fail(error);
            items[i].open = wanted;
          }
        }, { signal });
      });

      /* 13. Changes from outside (find in page, a fragment link, other code). Our own attribute
         changes also fire toggle, later; the checks below ignore them. */
      items.forEach((item, i) => {
        item.addEventListener('toggle', guard(() => {
          if (item.open && i !== open && !item.hasAttribute('data-fqp-closing')) select(i, false);
          else if (!item.open && i === open) jump(-1);
        }), { signal });
      });

      /* 14. */
      host.addEventListener('keydown', guard((event) => {
        const currentIndex = summaries.indexOf(event.target);
        if (currentIndex < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
        let next;
        if (event.key === 'ArrowDown') next = (currentIndex + 1) % summaries.length;
        else if (event.key === 'ArrowUp') next = (currentIndex - 1 + summaries.length) % summaries.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = summaries.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        summaries[next].focus();
      }), { signal });

      /* 15. */
      const onMotionChange = guard(() => {
        if (reduceMotion.matches) [...panel.getAnimations(), ...moving].forEach((animation) => animation.finish());
      });
      if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotionChange, { signal });
      else if (reduceMotion.addListener) {
        reduceMotion.addListener(onMotionChange);
        signal.addEventListener('abort', () => reduceMotion.removeListener(onMotionChange));
      }

      let width = -1;
      const fit = guard(() => {
        frame = 0;
        if (panel.getAnimations().length) {
          stale = true;
          return;
        }
        stale = false;
        measure();
        sync();
        place();
      });
      if (typeof ResizeObserver === 'function') {
        observer = new ResizeObserver(guard((entries) => {
          const own = entries.find((entry) => entry.target === host);
          const widened = own !== undefined && own.contentRect.width !== width;
          if (own) width = own.contentRect.width;
          /* Mid-move the host's height follows its own min-height animation: ignore it. */
          if (panel.getAnimations().length) {
            if (widened || entries.some((entry) => entry.target !== host)) stale = true;
            return;
          }
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(fit);
        }));
        observer.observe(host);
        answers.forEach((answer) => observer.observe(answer));
      }

      /* 16. */
      measure();
      sync();
      place();
      host.toggleAttribute('data-fqp-ready', true);
      place();
    } catch (error) {
      fail(error);
    }
  };

  const init = () => {
    if (typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function') return;
    if (typeof window.matchMedia !== 'function' || typeof AbortController !== 'function') return;
    document.querySelectorAll('[data-faq-panel]').forEach((host) => {
      try {
        enhance(host);
      } catch (error) {
        if (window.console) console.warn('faq-panel: skipped a list.', error);
      }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
