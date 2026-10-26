/*
 * Cookie consent for echipadetocilari.ro.
 *
 * Google Analytics 4 is not in the page HTML. This script loads it only after the
 * visitor accepts analytics cookies, and only on the hostnames listed in the
 * script tag's data-ga-hosts (production), so previews and localhost send nothing.
 *
 * The choice is kept in localStorage "ect-consent" as {v, analytics, ts}. It is
 * asked again after 183 days (about 6 months) or when VERSION changes. When the
 * browser blocks storage the banner still works for the current page.
 *
 * Markup hooks: [data-ect-consent-open] controls reopen the settings,
 * [data-ect-consent-state] elements receive the current state as text.
 */
(() => {
  'use strict';

  /* ===== COPY: every visible string of the banner and the footer controls. =====
   * Edit the text here only (scripts/lib/privacy.mjs reads the footer labels from
   * this object at build time). Romanian uses comma-below ș and ț. No em dash and
   * no diagonal arrows. {date} is replaced by the date of the choice in `date` format. */
  const COPY = {
    ro: {
      region: 'Preferințe cookie-uri',
      summary: 'Folosim cookie-uri Google Analytics doar cu acordul tău. Dacă accepți, Google poate primi și numele, emailul și telefonul din formular, sub formă de cod hash.',
      learnMore: 'Află mai multe',
      customise: 'Setări',
      rejectAll: 'Refuz toate',
      acceptAll: 'Accept toate',
      title: 'Preferințe cookie-uri',
      intro: 'Alege ce cookie-uri permiți. Stocarea necesară păstrează alegerea ta și nu poate fi oprită.',
      necessaryName: 'Necesare',
      necessaryText: 'Păstrează în browserul tău alegerea făcută aici, timp de 6 luni.',
      analyticsName: 'Analiză',
      analyticsText: 'Google Analytics: ce pagini sunt vizitate, de unde vin vizitatorii și cum e folosit site-ul. Poate trimite către Google, sub formă de cod hash, numele, emailul și telefonul pe care le scrii în formular.',
      save: 'Salvează preferințele',
      footerPolicy: 'Politica de confidențialitate',
      footerSettings: 'Setări cookie-uri',
      stateAccepted: 'Ai acceptat cookie-urile de analiză pe {date}.',
      stateRefused: 'Ai refuzat cookie-urile de analiză pe {date}.',
      stateNone: 'Nu ai ales încă dacă accepți cookie-urile de analiză.',
      date: 'DD.MM.YYYY',
    },
    en: {
      region: 'Cookie preferences',
      summary: 'We use Google Analytics cookies only with your consent. If you accept, Google may also receive the name, email and phone number from the form, in hashed form.',
      learnMore: 'Learn more',
      customise: 'Customize',
      rejectAll: 'Reject all',
      acceptAll: 'Accept all',
      title: 'Cookie preferences',
      intro: 'Choose which cookies you allow. Necessary storage keeps your choice and cannot be turned off.',
      necessaryName: 'Necessary',
      necessaryText: 'Keeps your choice in your browser for 6 months.',
      analyticsName: 'Analytics',
      analyticsText: 'Google Analytics: which pages are visited, where visitors come from and how the site is used. It may send the name, email and phone number you type into the form to Google, in hashed form.',
      save: 'Save preferences',
      footerPolicy: 'Privacy policy',
      footerSettings: 'Cookie settings',
      stateAccepted: 'You accepted analytics cookies on {date}.',
      stateRefused: 'You rejected analytics cookies on {date}.',
      stateNone: 'You have not yet chosen whether to accept analytics cookies.',
      date: 'YYYY-MM-DD',
    },
  };
  /* ===== end COPY ===== */

  const STORAGE_KEY = 'ect-consent';
  const VERSION = 1; // Raise when a policy change needs a new choice from every visitor.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const MAX_AGE_MS = 183 * DAY_MS;
  const SHARED_COOKIE_DOMAIN = '.echipadetocilari.ro';
  const GA_COOKIE = /^_ga(_|$)/;
  // Pointer clicks in the settings view are ignored this long after it opens: it
  // replaces the summary under the pointer, so the second click of a double-click
  // or double-tap on "Setări" would otherwise land on a choice.
  const OPEN_GUARD_MS = 500;

  if (window.ectConsent) return;

  const script = document.currentScript || document.querySelector('script[data-ga-id]');
  const config = (script && script.dataset) || {};
  const gaId = /^G-[A-Z0-9]+$/.test(config.gaId || '') ? config.gaId : '';
  const gaHosts = (config.gaHosts || '').split(/[\s,]+/).filter(Boolean);
  const language = /^en/i.test(document.documentElement.lang || '') ? 'en' : 'ro';
  const text = COPY[language];
  const policyHref = config.policy || (language === 'en' ? '/en/privacy-policy/#cookies' : '/politica-de-confidentialitate/#cookies');

  let choice = readChoice();
  let gaLoaded = false;
  let opener = null;
  let fitFrame = 0;
  let openedAt = -Infinity;

  function now() {
    const clock = window.performance;
    return clock && typeof clock.now === 'function' ? clock.now() : Date.now();
  }

  // ─── stored choice ───────────────────────────────────────────────────────

  function readChoice() {
    let raw = null;
    try { raw = window.localStorage.getItem(STORAGE_KEY); } catch (error) { return null; }
    if (!raw) return null;
    let data;
    try { data = JSON.parse(raw); } catch (error) { return null; }
    if (!data || data.v !== VERSION || typeof data.analytics !== 'boolean' || typeof data.ts !== 'string') return null;
    const age = Date.now() - Date.parse(data.ts);
    if (!(age >= -DAY_MS && age <= MAX_AGE_MS)) return null;
    return { v: VERSION, analytics: data.analytics, ts: data.ts };
  }

  function storeChoice(value) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch (error) { /* kept for this page only */ }
  }

  // ─── Google Analytics ────────────────────────────────────────────────────

  function clearGaCookies() {
    let names = [];
    try {
      names = String(document.cookie || '').split(';').map(part => part.split('=')[0].trim()).filter(name => GA_COOKIE.test(name));
    } catch (error) { return; }
    const host = window.location.hostname;
    for (const name of new Set(names)) {
      for (const domain of ['', `; domain=${host}`, `; domain=${SHARED_COOKIE_DOMAIN}`]) {
        try { document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${domain}`; } catch (error) { /* ignore */ }
      }
    }
  }

  function grantAnalytics() {
    if (!gaId || !gaHosts.includes(window.location.hostname)) return;
    window[`ga-disable-${gaId}`] = false;
    if (gaLoaded) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      return;
    }
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', gaId, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(tag);
  }

  function refuseAnalytics() {
    if (gaId) window[`ga-disable-${gaId}`] = true;
    if (gaLoaded && typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'denied' });
    clearGaCookies();
  }

  function apply(value) {
    if (value.analytics) grantAnalytics();
    else refuseAnalytics();
  }

  // ─── markup ──────────────────────────────────────────────────────────────

  function el(tag, attributes, children) {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes || {})) {
      if (name === 'class') node.className = value;
      else if (name === 'text') node.textContent = value;
      else if (value === true) node.setAttribute(name, '');
      else if (value !== false && value != null) node.setAttribute(name, value);
    }
    for (const child of children || []) node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    return node;
  }

  function pill(variant, label, extra) {
    return el('button', { type: 'button', class: `ect-consent__pill ect-consent__pill--${variant}${extra ? ` ${extra}` : ''}` }, [
      el('span', { class: 'ect-consent__pill-label', text: label }),
    ]);
  }

  function category(id, name, description, input, locked) {
    return el('label', { class: `ect-consent__category${locked ? ' ect-consent__category--locked' : ''}` }, [
      input,
      el('span', { class: 'ect-consent__label' }, [
        el('span', { class: 'ect-consent__name', id, text: name }),
        el('span', { class: 'ect-consent__desc', id: `${id}-desc`, text: description }),
      ]),
    ]);
  }

  // Refuse and accept are always styled the same (equal prominence).
  const summaryButtons = {
    customise: pill('ghost', text.customise),
    reject: pill('solid', text.rejectAll),
    accept: pill('solid', text.acceptAll),
  };
  // Refuse and accept share the first row as equal halves; save takes the second.
  const customiseButtons = {
    reject: pill('solid', text.rejectAll),
    accept: pill('solid', text.acceptAll),
    save: pill('solid', text.save, 'ect-consent__pill--wide'),
  };
  const summaryActions = el('div', { class: 'ect-consent__actions ect-consent__actions--summary' }, [
    summaryButtons.customise, summaryButtons.reject, summaryButtons.accept,
  ]);
  const summaryView = el('div', { class: 'ect-consent__view ect-consent__view--summary' }, [
    el('p', { class: 'ect-consent__copy' }, [
      `${text.summary} `,
      el('a', { class: 'ect-consent__link', href: policyHref, text: text.learnMore }),
      '.',
    ]),
    summaryActions,
  ]);

  const title = el('p', { class: 'ect-consent__title', id: 'ect-consent-title', tabindex: '-1', text: text.title });
  const necessaryBox = el('input', {
    type: 'checkbox', class: 'ect-consent__check', checked: true, disabled: true,
    'aria-labelledby': 'ect-consent-necessary', 'aria-describedby': 'ect-consent-necessary-desc',
  });
  necessaryBox.checked = true;
  const analyticsBox = el('input', {
    type: 'checkbox', class: 'ect-consent__check', name: 'ect-consent-analytics',
    'aria-labelledby': 'ect-consent-analytics', 'aria-describedby': 'ect-consent-analytics-desc',
  });
  const customiseView = el('div', { class: 'ect-consent__view ect-consent__view--customise', role: 'group', 'aria-labelledby': 'ect-consent-title', hidden: true }, [
    el('div', { class: 'ect-consent__head' }, [
      title,
      el('p', { class: 'ect-consent__copy', text: text.intro }),
    ]),
    el('div', { class: 'ect-consent__categories' }, [
      category('ect-consent-necessary', text.necessaryName, text.necessaryText, necessaryBox, true),
      category('ect-consent-analytics', text.analyticsName, text.analyticsText, analyticsBox, false),
    ]),
    el('div', { class: 'ect-consent__actions ect-consent__actions--customise' }, [customiseButtons.reject, customiseButtons.accept, customiseButtons.save]),
  ]);

  const banner = el('section', { class: 'ect-consent', id: 'ect-consent', role: 'region', 'aria-label': text.region, hidden: true }, [
    summaryView, customiseView,
  ]);

  // ─── behaviour ───────────────────────────────────────────────────────────

  function formatDate(iso) {
    const date = new Date(iso);
    const pad = value => String(value).padStart(2, '0');
    return text.date
      .replace('YYYY', String(date.getFullYear()))
      .replace('MM', pad(date.getMonth() + 1))
      .replace('DD', pad(date.getDate()));
  }

  function stateText() {
    if (!choice) return text.stateNone;
    return (choice.analytics ? text.stateAccepted : text.stateRefused).replace('{date}', formatDate(choice.ts));
  }

  function updateStates() {
    const message = stateText();
    for (const node of document.querySelectorAll('[data-ect-consent-state]')) node.textContent = message;
  }

  /** The summary pills share one row only while every label fits; otherwise
   *  Refuse + Accept share the first row and the settings pill takes the second. */
  function fitSummary() {
    fitFrame = 0;
    if (banner.hidden || summaryView.hidden || typeof window.getComputedStyle !== 'function') return;
    const pills = [summaryButtons.customise, summaryButtons.reject, summaryButtons.accept];
    banner.classList.remove('ect-consent--stacked');
    const style = window.getComputedStyle(pills[0]);
    const frame = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth']
      .reduce((sum, key) => sum + (parseFloat(style[key]) || 0), 0);
    const gap = parseFloat(window.getComputedStyle(summaryActions).columnGap) || 0;
    // scrollWidth: a label wider than its pill overflows its own (shrunk) box.
    const widest = Math.max(...pills.map(button => Math.max(button.firstChild.getBoundingClientRect().width, button.firstChild.scrollWidth || 0)));
    const stacked = (widest + frame) * 3 + gap * 2 > summaryActions.clientWidth + 0.5;
    banner.classList.toggle('ect-consent--stacked', stacked);
    // Keep the DOM order equal to the visual order so Tab follows what people see.
    const customise = summaryButtons.customise;
    const first = summaryActions.firstElementChild;
    if (stacked ? first === customise : first !== customise) {
      const focused = document.activeElement === customise;
      if (stacked) summaryActions.appendChild(customise);
      else summaryActions.insertBefore(customise, first);
      if (focused) customise.focus();
    }
  }

  /** While the card is open, the page keeps its height free at the bottom: a field
   *  reached with Tab scrolls clear of the card, and the last footer links can too
   *  (WCAG 2.4.11). consent.css reads --ect-consent-space. */
  function reserveSpace() {
    const root = document.documentElement;
    if (!root.style || typeof root.style.setProperty !== 'function') return;
    if (banner.hidden) {
      root.classList.remove('ect-consent-open');
      root.style.removeProperty('--ect-consent-space');
      return;
    }
    const box = banner.getBoundingClientRect();
    const space = typeof window.innerHeight === 'number' && typeof box.top === 'number'
      ? window.innerHeight - box.top
      : box.height;
    root.style.setProperty('--ect-consent-space', `${Math.max(0, Math.ceil(space))}px`);
    root.classList.add('ect-consent-open');
  }

  function refit() {
    fitSummary();
    reserveSpace();
  }

  function scheduleFit() {
    if (fitFrame) return;
    if (typeof window.requestAnimationFrame === 'function') fitFrame = window.requestAnimationFrame(refit);
    else refit();
  }

  function show(view, from) {
    opener = from || null;
    analyticsBox.checked = Boolean(choice && choice.analytics);
    summaryView.hidden = view !== 'summary';
    customiseView.hidden = view !== 'customise';
    banner.hidden = false;
    if (view === 'summary') fitSummary();
    else openedAt = now();
    reserveSpace();
  }

  function openSettings(from) {
    show('customise', from === undefined ? opener : from);
    title.focus();
  }

  function close() {
    banner.hidden = true;
    reserveSpace();
    const target = opener;
    opener = null;
    if (target && typeof target.focus === 'function') target.focus();
  }

  function decide(analytics) {
    choice = { v: VERSION, analytics, ts: new Date().toISOString() };
    storeChoice(choice);
    apply(choice);
    updateStates();
    close();
  }

  summaryButtons.customise.addEventListener('click', () => openSettings());
  summaryButtons.reject.addEventListener('click', () => decide(false));
  summaryButtons.accept.addEventListener('click', () => decide(true));

  // A choice in the settings view needs its own click: no pointer click counts
  // (buttons or the Analiză box) right after the view opens, and a choice never
  // comes from the second click of a double-click. Keyboard activation (detail 0)
  // is never affected: focus moves to the title, not under a pointer.
  customiseView.addEventListener('click', event => {
    if (!(event.detail > 0) || now() - openedAt >= OPEN_GUARD_MS) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  const deliberate = handler => event => {
    if (event && event.detail > 1) return;
    handler();
  };
  customiseButtons.reject.addEventListener('click', deliberate(() => decide(false)));
  customiseButtons.accept.addEventListener('click', deliberate(() => decide(true)));
  customiseButtons.save.addEventListener('click', deliberate(() => decide(analyticsBox.checked)));

  // Escape closes a banner reopened after a choice and keeps that choice.
  // Without a choice the banner stays, so closing it never counts as an answer.
  banner.addEventListener('keydown', event => {
    if (event.key !== 'Escape' && event.key !== 'Esc') return;
    if (choice) {
      event.preventDefault();
      close();
    } else if (!customiseView.hidden) {
      event.preventDefault();
      const back = opener;
      show('summary');
      (back || summaryButtons.customise).focus();
    }
  });

  // Another tab made or changed the choice.
  window.addEventListener('storage', event => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    const next = readChoice();
    if (!next) return;
    const hadChoice = Boolean(choice);
    choice = next;
    apply(next);
    updateStates();
    if (banner.hidden) return;
    if (hadChoice) {
      // Settings reopened here: show the new choice, so Save never stores the old one.
      analyticsBox.checked = Boolean(next.analytics);
      return;
    }
    // The question was answered in the other tab.
    const focusInside = banner.contains(document.activeElement);
    const target = opener;
    banner.hidden = true;
    reserveSpace();
    opener = null;
    if (focusInside && target && typeof target.focus === 'function') target.focus();
  });

  // Re-check the summary row and the reserved space when the viewport changes,
  // the card changes height or a web font swaps in.
  window.addEventListener('resize', scheduleFit);
  if (typeof window.ResizeObserver === 'function') {
    const observer = new window.ResizeObserver(scheduleFit);
    observer.observe(banner);
    observer.observe(summaryActions);
    for (const button of Object.values(summaryButtons)) observer.observe(button.firstChild);
  }

  // ─── start ───────────────────────────────────────────────────────────────

  const skipLink = document.querySelector('.skip-link');
  if (skipLink && skipLink.parentNode) skipLink.parentNode.insertBefore(banner, skipLink.nextSibling);
  else document.body.insertBefore(banner, document.body.firstChild);

  for (const trigger of document.querySelectorAll('[data-ect-consent-open]')) {
    trigger.hidden = false;
    trigger.addEventListener('click', event => {
      event.preventDefault();
      openSettings(trigger);
    });
  }

  window.ectConsent = {
    open: () => openSettings(null),
    get choice() { return choice ? { ...choice } : null; },
  };

  updateStates();
  if (choice) apply(choice);
  else {
    clearGaCookies();
    show('summary');
  }
})();
