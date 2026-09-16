import { escapeAttr } from './html.mjs';

const FIELDS = {
  name: { aliases: ['name', 'name1'], ro: 'Nume', en: 'Name', autocomplete: 'name', min: 2, max: 120 },
  company: { aliases: ['field_163a88b'], ro: 'Nume companie (opțional)', en: 'Company name (optional)', autocomplete: 'organization', max: 160 },
  email: { aliases: ['email', 'email1'], ro: 'Email', en: 'Email', autocomplete: 'email', max: 254 },
  phone: { aliases: ['field_99f663d'], ro: 'Telefon', en: 'Phone', autocomplete: 'tel', min: 5, max: 40 },
  message: { aliases: ['message', 'message1'], ro: 'Mesaj', en: 'Message', min: 10, max: 5000 },
};

/** Apply AFTER the EN dictionary, which translates arbitrary document strings. */
export function enhanceContactForms(html, { locale } = {}) {
  const language = locale || (/<html\b[^>]*\blang=["']en(?:[-"'])/i.test(html) ? 'en' : 'ro');
  const english = language === 'en';
  let count = 0;
  html = html.replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, (form) => {
    if (!/class=["'][^"']*\belementor-form\b/.test(form) || /\bdata-ect-contact\b/.test(form)) return form;
    count += 1;
    form = form.replace(/<form\b([^>]*)>/i, (_match, attrs) => `<form${attrs.replace(/\s(?:action|method)=["'][^"']*["']/gi, '')} method="post" action="/api/contact" data-ect-contact="${language}">`);
    form = form.replace(/<input\b[^>]*\btype=["']hidden["'][^>]*>\s*/gi, '');
    form = form.replace(/<(input|textarea)\b([^>]*)>/gi, (tag, element, attrs) => {
      const match = attrs.match(/\bname=["']form_fields\[([^\]]+)\]["']/);
      if (!match) return tag;
      const found = Object.entries(FIELDS).find(([, field]) => field.aliases.includes(match[1]));
      if (!found) return tag;
      const [key, field] = found;
      attrs = attrs.replace(/\bname=["'][^"']*["']/, `name="${key}"`)
        .replace(/\s(?:pattern|title|aria-label|autocomplete|minlength|maxlength)=["'][^"']*["']/gi, '');
      attrs += ` aria-label="${escapeAttr(field[language] || field.ro)}" maxlength="${field.max}"`;
      if (field.min) attrs += ` minlength="${field.min}"`;
      if (field.autocomplete) attrs += ` autocomplete="${field.autocomplete}"`;
      return `<${element}${attrs}>`;
    });
    const fallback = english ? 'You can also email us at' : 'Ne poți scrie și la';
    const noscript = english ? 'Enable JavaScript to use the form, or email us directly.' : 'Activează JavaScript pentru a folosi formularul sau scrie-ne direct pe email.';
    return form.replace(/<\/form>/i, `
      <div class="ect-contact-trap" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
      <div class="ect-contact-challenge"></div>
      <p class="ect-contact-status" role="status" aria-live="polite" aria-atomic="true" tabindex="-1"></p>
      <p class="ect-contact-fallback">${fallback} <a href="mailto:contact@echipadetocilari.ro">contact@echipadetocilari.ro</a>.</p>
      <noscript><p>${noscript}</p></noscript>
    </form>`);
  });
  if (!count) return html;
  // Preserve all Elementor CSS while preventing its WordPress form controller.
  html = html.replace(/data-widget_type=["']form\.default["']/g, 'data-widget_type="ect-contact.default"');
  if (!html.includes('src="/wp-content/ect-contact.js"')) html = html.replace(/<\/head>/i, '  <link rel="stylesheet" href="/wp-content/ect-contact.css">\n  <script src="/wp-content/ect-contact.js" defer></script>\n</head>');
  return html;
}
