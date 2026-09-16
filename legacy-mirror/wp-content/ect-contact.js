(() => {
  'use strict';
  const forms = new WeakMap();
  let configPromise;
  let turnstilePromise;
  const copy = {
    ro: {
      sending: 'Se trimite mesajul…',
      success: 'Mulțumim! Mesajul tău a fost trimis. Te vom contacta în curând.',
      invalid: 'Verifică datele introduse. Mesajul trebuie să aibă cel puțin 10 caractere.',
      unavailable: 'Formularul nu este disponibil momentan. Scrie-ne la contact@echipadetocilari.ro.',
      delivery: 'Nu am putut confirma trimiterea mesajului. Datele tale sunt păstrate în formular. Încearcă din nou sau scrie-ne pe email.',
      challenge: 'Finalizează verificarea de securitate de lângă formular, apoi apasă din nou Trimite.',
      rate_limit: 'Ai făcut prea multe încercări. Revino în 15 minute sau scrie-ne direct pe email.',
      timing: 'Așteaptă câteva secunde, apoi încearcă din nou.',
      network: 'Nu am putut confirma trimiterea. Verifică conexiunea sau scrie-ne direct pe email.',
    },
    en: {
      sending: 'Sending your message…',
      success: 'Thank you! Your message has been sent. We will be in touch soon.',
      invalid: 'Check the information you entered. Your message must contain at least 10 characters.',
      unavailable: 'The form is temporarily unavailable. Please email contact@echipadetocilari.ro.',
      delivery: 'We could not confirm that your message was sent. Your entries are still in the form. Try again or email us directly.',
      challenge: 'Complete the security check by the form, then press Send again.',
      rate_limit: 'Too many attempts. Please try again in 15 minutes or email us directly.',
      timing: 'Wait a few seconds, then try again.',
      network: 'We could not confirm sending. Check your connection or email us directly.',
    },
  };

  function state(form) {
    if (!forms.has(form)) forms.set(form, { startedAt: Date.now(), widget: null, token: '', busy: false });
    return forms.get(form);
  }

  function status(form, key, kind, focus = false) {
    const target = form.querySelector('.ect-contact-status');
    target.textContent = (copy[form.dataset.ectContact] || copy.ro)[key] || copy.ro.unavailable;
    target.dataset.state = kind;
    if (focus) target.focus({ preventScroll: true });
  }

  async function config() {
    if (!configPromise) {
      configPromise = fetch('/api/contact', { headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(10000) })
        .then(async (response) => {
          const result = await response.json();
          const supportedProtection = ['turnstile', 'vercel-waf'].includes(result.protection);
          if (!response.ok || !result.ok || !supportedProtection || (result.protection === 'turnstile' && !result.siteKey && !result.developmentBypass)) throw new Error('unavailable');
          return result;
        }).catch((error) => { configPromise = null; throw error; });
    }
    return configPromise;
  }

  function loadTurnstile() {
    if (!turnstilePromise) turnstilePromise = new Promise((resolve, reject) => {
      if (window.turnstile) { resolve(window.turnstile); return; }
      const script = document.createElement('script');
      const timer = setTimeout(() => { script.remove(); turnstilePromise = null; reject(new Error('unavailable')); }, 15000);
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => {
        clearTimeout(timer);
        if (window.turnstile) resolve(window.turnstile);
        else { turnstilePromise = null; reject(new Error('unavailable')); }
      };
      script.onerror = () => { clearTimeout(timer); script.remove(); turnstilePromise = null; reject(new Error('unavailable')); };
      document.head.append(script);
    });
    return turnstilePromise;
  }

  async function prepare(form) {
    const current = state(form);
    if (current.widget !== null) return;
    if (!current.preparing) current.preparing = (async () => {
      const { siteKey, developmentBypass, protection } = await config();
      const local = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
      if (protection === 'vercel-waf') {
        if (local || window.location.protocol !== 'https:') throw new Error('unavailable');
        current.bypass = true;
        return;
      }
      if (developmentBypass && local) {
        current.bypass = true;
        return;
      }
      const turnstile = await loadTurnstile();
      current.widget = turnstile.render(form.querySelector('.ect-contact-challenge'), {
        sitekey: siteKey,
        action: 'contact',
        language: form.dataset.ectContact === 'en' ? 'en' : 'ro',
        theme: 'light',
        'response-field': false,
        callback: (token) => { current.token = token; },
        'expired-callback': () => { current.token = ''; },
        'error-callback': () => { current.token = ''; },
      });
    })().finally(() => { current.preparing = null; });
    await current.preparing;
  }

  function resetChallenge(current) {
    current.token = '';
    if (current.widget !== null && window.turnstile) window.turnstile.reset(current.widget);
  }

  // Capture before legacy Elementor/jQuery form handlers can submit to WordPress.
  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches('[data-ect-contact]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const current = state(form);
    if (current.busy || !form.reportValidity()) return;
    current.busy = true;
    form.setAttribute('aria-busy', 'true');
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    try {
      await prepare(form);
      if (!current.token && !current.bypass) { status(form, 'challenge', 'error', true); return; }
      const data = new FormData(form);
      const body = Object.fromEntries(['name', 'company', 'email', 'phone', 'message', 'website'].map((key) => [key, String(data.get(key) || '')]));
      const fingerprint = JSON.stringify(body);
      if (current.fingerprint !== fingerprint) {
        current.fingerprint = fingerprint;
        current.submissionId = crypto.randomUUID();
      }
      body.submissionId = current.submissionId;
      body.startedAt = current.startedAt;
      body.turnstileToken = current.token;
      body.page = window.location.pathname;
      body.language = form.dataset.ectContact;
      status(form, 'sending', 'sending');
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(45000),
      });
      // Edge rate limiting may return an HTML response before this API runs.
      const result = await response.json().catch(() => ({ ok: false, error: response.status === 429 ? 'rate_limit' : 'unavailable' }));
      if (response.status === 429) result.error = 'rate_limit';
      if (!response.ok || result.ok !== true) {
        const key = ['invalid', 'challenge', 'rate_limit', 'timing', 'delivery'].includes(result.error) ? result.error : 'unavailable';
        status(form, key, 'error', true);
        if (result.error === 'timing') current.startedAt = Date.now();
        if (result.field) form.elements.namedItem(result.field)?.focus();
      } else {
        form.reset();
        current.startedAt = Date.now();
        current.fingerprint = null;
        status(form, 'success', 'success', true);
      }
      resetChallenge(current);
    } catch (error) {
      status(form, error.message === 'unavailable' ? 'unavailable' : 'network', 'error', true);
      resetChallenge(current);
    } finally {
      current.busy = false;
      form.removeAttribute('aria-busy');
      if (button) button.disabled = false;
    }
  }, true);

  document.querySelectorAll('[data-ect-contact]').forEach((form) => {
    state(form);
    // Start the challenge when visitors reach or focus the form, without blocking the page.
    form.addEventListener('focusin', () => { prepare(form).catch(() => {}); });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) { observer.disconnect(); prepare(form).catch(() => {}); }
      }, { rootMargin: '100px' });
      observer.observe(form);
    }
  });
})();
