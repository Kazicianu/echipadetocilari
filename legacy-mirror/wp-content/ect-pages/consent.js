/*
 * Cookie consent for echipadetocilari.ro.
 *
 * The Google tag (GA4 and, when data-ads-id is set, Google Ads) is not in the page
 * HTML. This script injects it on every visit, after the page `load` event, and
 * only on the hostnames listed in the script tag's data-ga-hosts (production), so
 * previews and localhost send nothing. Consent Mode v2 starts with all four signals
 * `denied`: until the visitor chooses, or after a rejection, Google gets only
 * cookieless pings. Cookies and the full data come only with the matching category.
 *
 * The choice is kept in localStorage "ect-consent" as {v, analytics, marketing, ts}.
 * It is asked again after 183 days (about 6 months) or when VERSION changes. When
 * the browser blocks storage the banner still works for the current page.
 *
 * Without a choice the banner waits on the page a visitor lands on, until the first
 * of: ASK_AFTER_MS, a scroll of one screen, focus in a form. Any later page of the
 * site asks at once, so nobody browses on without having been asked. Waiting is safe
 * only because every signal stays `denied` until the visitor chooses.
 *
 * window.ectConsent.trackLead({ email, phone }) reports a sent form: a generate_lead
 * event, with the hashed email and phone (user_data) only if Marketing is accepted.
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
      summary: 'Cu acordul tău, folosim cookie-uri Google de analiză și de marketing, iar dacă accepți marketingul, Google poate primi emailul și telefonul din formular, sub formă de cod hash. Fără acord, Google primește doar semnale fără cookie-uri.',
      learnMore: 'Află mai multe',
      customise: 'Setări',
      rejectAll: 'Refuz toate',
      acceptAll: 'Accept toate',
      title: 'Preferințe cookie-uri',
      intro: 'Alege ce cookie-uri permiți. Stocarea necesară păstrează alegerea ta și nu poate fi oprită. Indiferent de alegere, Google primește semnale fără cookie-uri.',
      necessaryName: 'Necesare',
      necessaryText: 'Păstrează în browserul tău alegerea făcută aici, timp de 6 luni.',
      analyticsName: 'Analiză',
      analyticsText: 'Google Analytics: ce pagini sunt vizitate, de unde vin vizitatorii și cum e folosit site-ul.',
      marketingName: 'Marketing',
      marketingText: 'Google Ads: măsoară ce reclame aduc cereri și permite reclame personalizate. La trimiterea formularului, Google poate primi emailul și telefonul, sub formă de cod hash.',
      save: 'Salvează preferințele',
      footerPolicy: 'Politica de confidențialitate',
      footerSettings: 'Setări cookie-uri',
      stateAccepted: 'Ai acceptat cookie-urile de analiză și de marketing pe {date}.',
      stateRefused: 'Ai refuzat cookie-urile de analiză și de marketing pe {date}.',
      stateAnalytics: 'Ai acceptat doar cookie-urile de analiză pe {date}.',
      stateMarketing: 'Ai acceptat doar cookie-urile de marketing pe {date}.',
      stateNone: 'Nu ai ales încă dacă accepți cookie-urile de analiză și de marketing.',
      date: 'DD.MM.YYYY',
    },
    en: {
      region: 'Cookie preferences',
      summary: 'With your consent, we use Google analytics and marketing cookies, and if you accept marketing, Google may receive the email and phone number from the form, in hashed form. Without consent, Google receives only cookieless signals.',
      learnMore: 'Learn more',
      customise: 'Customize',
      rejectAll: 'Reject all',
      acceptAll: 'Accept all',
      title: 'Cookie preferences',
      intro: 'Choose which cookies you allow. Necessary storage keeps your choice and cannot be turned off. Whatever you choose, Google receives cookieless signals.',
      necessaryName: 'Necessary',
      necessaryText: 'Keeps your choice in your browser for 6 months.',
      analyticsName: 'Analytics',
      analyticsText: 'Google Analytics: which pages are visited, where visitors come from and how the site is used.',
      marketingName: 'Marketing',
      marketingText: 'Google Ads: measures which ads bring requests and allows personalized ads. When you send the form, Google may receive your email and phone number, in hashed form.',
      save: 'Save preferences',
      footerPolicy: 'Privacy policy',
      footerSettings: 'Cookie settings',
      stateAccepted: 'You accepted analytics and marketing cookies on {date}.',
      stateRefused: 'You rejected analytics and marketing cookies on {date}.',
      stateAnalytics: 'You accepted only analytics cookies on {date}.',
      stateMarketing: 'You accepted only marketing cookies on {date}.',
      stateNone: 'You have not yet chosen whether to accept analytics and marketing cookies.',
      date: 'YYYY-MM-DD',
    },
  };
  /* ===== end COPY ===== */

  const STORAGE_KEY = 'ect-consent';
  const VERSION = 2; // Raise when a policy change needs a new choice from every visitor.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const MAX_AGE_MS = 183 * DAY_MS;
  const SHARED_COOKIE_DOMAIN = '.echipadetocilari.ro';
  const GA_COOKIE = /^_ga(_|$)/;
  const ADS_COOKIE = /^(_gcl_|_gac_)/;
  // Pointer clicks in the settings view are ignored this long after it opens: it
  // replaces the summary under the pointer, so the second click of a double-click
  // or double-tap on "Setări" would otherwise land on a choice.
  const OPEN_GUARD_MS = 500;
  const ASK_AFTER_MS = 15000;

  if (window.ectConsent) return;

  const script = document.currentScript || document.querySelector('script[data-ga-id]');
  const config = (script && script.dataset) || {};
  const gaId = /^G-[A-Z0-9]+$/.test(config.gaId || '') ? config.gaId : '';
  const gaHosts = (config.gaHosts || '').split(/[\s,]+/).filter(Boolean);
  const adsId = /^AW-\d+$/.test(config.adsId || '') ? config.adsId : '';
  const adsLeadLabel = /^[\w-]+$/.test(config.adsLeadLabel || '') ? config.adsLeadLabel : '';
  const language = /^en/i.test(document.documentElement.lang || '') ? 'en' : 'ro';
  const text = COPY[language];
  const policyHref = config.policy || (language === 'en' ? '/en/privacy-policy/#cookies' : '/politica-de-confidentialitate/#cookies');

  let choice = readChoice();
  let tagStarted = false;
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
    if (!data || data.v !== VERSION || typeof data.analytics !== 'boolean' || typeof data.marketing !== 'boolean' || typeof data.ts !== 'string') return null;
    const age = Date.now() - Date.parse(data.ts);
    if (!(age >= -DAY_MS && age <= MAX_AGE_MS)) return null;
    return { v: VERSION, analytics: data.analytics, marketing: data.marketing, ts: data.ts };
  }

  function storeChoice(value) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch (error) { /* kept for this page only */ }
  }

  // ─── Google tag ──────────────────────────────────────────────────────────

  function clearCookies(pattern) {
    let names = [];
    try {
      names = String(document.cookie || '').split(';').map(part => part.split('=')[0].trim()).filter(name => pattern.test(name));
    } catch (error) { return; }
    const host = window.location.hostname;
    for (const name of new Set(names)) {
      for (const domain of ['', `; domain=${host}`, `; domain=${SHARED_COOKIE_DOMAIN}`]) {
        try { document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${domain}`; } catch (error) { /* ignore */ }
      }
    }
  }

  function consentState(value) {
    const analytics = value.analytics ? 'granted' : 'denied';
    const marketing = value.marketing ? 'granted' : 'denied';
    return { analytics_storage: analytics, ad_storage: marketing, ad_user_data: marketing, ad_personalization: marketing };
  }

  function injectTag() {
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(tag);
  }

  /** Starts the Google tag once, with every signal denied (Consent Mode v2, advanced).
   *  A saved choice is applied before `config`, so the first hit already carries it. */
  function startTag() {
    if (tagStarted || !gaId || !gaHosts.includes(window.location.hostname)) return;
    tagStarted = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('set', 'ads_data_redaction', true);
    // Without ad_storage the ad click id travels in the links between our pages, not in a cookie.
    window.gtag('set', 'url_passthrough', true);
    if (choice) window.gtag('consent', 'update', consentState(choice));
    window.gtag('js', new Date());
    const marketing = Boolean(choice && choice.marketing);
    window.gtag('config', gaId, { allow_google_signals: marketing, allow_ad_personalization_signals: marketing });
    if (adsId) window.gtag('config', adsId);
    // After `load`, so the tag never competes with the first paint (LCP) on mobile.
    if (document.readyState === 'loading' || document.readyState === 'interactive') window.addEventListener('load', injectTag, { once: true });
    else injectTag();
  }

  function clearDeniedCookies(value) {
    if (!value.analytics) clearCookies(GA_COOKIE);
    if (!value.marketing) clearCookies(ADS_COOKIE);
  }

  function apply(value) {
    clearDeniedCookies(value);
    if (tagStarted) window.gtag('consent', 'update', consentState(value));
  }

  /** E.164 phone number (+407...) from what a visitor types, or '' when it is not one. */
  function e164(raw) {
    const value = String(raw || '').replace(/\s*(?:ext|int|interior)\.?\s*\d{1,6}\s*$/i, '').trim();
    let digits = value.replace(/\D/g, '');
    if (!value.startsWith('+')) {
      if (digits.startsWith('00')) digits = digits.slice(2);
      else if (/^0[237]\d{8}$/.test(digits)) digits = `40${digits.slice(1)}`;
    }
    digits = digits.replace(/^400(\d{9})$/, '40$1'); // +40 (0)722 123 456
    return /^[1-9]\d{9,14}$/.test(digits) ? `+${digits}` : '';
  }

  /** A form was sent. The email and phone go to Google only when Marketing is accepted. */
  function trackLead({ email, phone } = {}) {
    if (!tagStarted) return;
    const params = {};
    if (choice && choice.marketing) {
      const userData = {};
      const address = String(email || '').trim().toLowerCase();
      const number = e164(phone);
      if (address) userData.email = address;
      if (number) userData.phone_number = number;
      if (Object.keys(userData).length) params.user_data = userData;
    }
    window.gtag('event', 'generate_lead', params);
    if (adsId && adsLeadLabel) window.gtag('event', 'conversion', { send_to: `${adsId}/${adsLeadLabel}`, ...params });
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
  const marketingBox = el('input', {
    type: 'checkbox', class: 'ect-consent__check', name: 'ect-consent-marketing',
    'aria-labelledby': 'ect-consent-marketing', 'aria-describedby': 'ect-consent-marketing-desc',
  });
  const customiseView = el('div', { class: 'ect-consent__view ect-consent__view--customise', role: 'group', 'aria-labelledby': 'ect-consent-title', hidden: true }, [
    el('div', { class: 'ect-consent__head' }, [
      title,
      el('p', { class: 'ect-consent__copy', text: text.intro }),
    ]),
    el('div', { class: 'ect-consent__categories' }, [
      category('ect-consent-necessary', text.necessaryName, text.necessaryText, necessaryBox, true),
      category('ect-consent-analytics', text.analyticsName, text.analyticsText, analyticsBox, false),
      category('ect-consent-marketing', text.marketingName, text.marketingText, marketingBox, false),
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
    let key = 'stateRefused';
    if (choice.analytics && choice.marketing) key = 'stateAccepted';
    else if (choice.analytics) key = 'stateAnalytics';
    else if (choice.marketing) key = 'stateMarketing';
    return text[key].replace('{date}', formatDate(choice.ts));
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
    marketingBox.checked = Boolean(choice && choice.marketing);
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

  function decide(analytics, marketing) {
    choice = { v: VERSION, analytics, marketing, ts: new Date().toISOString() };
    storeChoice(choice);
    apply(choice);
    updateStates();
    close();
  }

  function cameFromThisSite() {
    const from = /^https?:\/\/([^/:]+)/.exec(document.referrer || '');
    return Boolean(from) && from[1] === window.location.hostname;
  }

  /** Shows the question at the latest moment listed at the top of this file. A choice
   *  made in the meantime (another tab, the footer control) cancels it. */
  function askWhenDue() {
    if (cameFromThisSite()) {
      show('summary');
      return;
    }
    let asked = false;
    const ask = () => {
      if (asked) return;
      asked = true;
      if (!choice && banner.hidden) show('summary');
    };
    window.setTimeout(ask, ASK_AFTER_MS);
    window.addEventListener('scroll', () => {
      if (window.scrollY >= window.innerHeight) ask();
    }, { passive: true });
    document.addEventListener('focusin', event => {
      if (event.target && event.target.closest && event.target.closest('form')) ask();
    });
  }

  summaryButtons.customise.addEventListener('click', () => openSettings());
  summaryButtons.reject.addEventListener('click', () => decide(false, false));
  summaryButtons.accept.addEventListener('click', () => decide(true, true));

  // A choice in the settings view needs its own click: no pointer click counts
  // (buttons or the category boxes) right after the view opens, and a choice never
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
  customiseButtons.reject.addEventListener('click', deliberate(() => decide(false, false)));
  customiseButtons.accept.addEventListener('click', deliberate(() => decide(true, true)));
  customiseButtons.save.addEventListener('click', deliberate(() => decide(analyticsBox.checked, marketingBox.checked)));

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
    if (!next) {
      // Cleared or outdated elsewhere: nothing here may keep relying on the old consent.
      if (choice) {
        choice = null;
        apply({ analytics: false, marketing: false });
        updateStates();
      }
      return;
    }
    const hadChoice = Boolean(choice);
    choice = next;
    apply(next);
    updateStates();
    if (banner.hidden) return;
    if (hadChoice) {
      // Settings reopened here: show the new choice, so Save never stores the old one.
      analyticsBox.checked = Boolean(next.analytics);
      marketingBox.checked = Boolean(next.marketing);
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
    trackLead,
  };

  updateStates();
  startTag();
  if (choice) clearDeniedCookies(choice);
  else {
    clearCookies(GA_COOKIE);
    clearCookies(ADS_COOKIE);
    askWhenDue();
  }
})();
