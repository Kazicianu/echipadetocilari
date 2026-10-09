# ContactSection

The orange contact section that closes every page: a headline on the left and the white form card on the right, between two white waves.

Markup: `section.ect-contact` with `id="formular_contact_bottom"` (buttons link to it), two `.ect-contact__wave` dividers (top and bottom, the Elementor "waves" shape), `.ect-contact__inner` with `.ect-contact__copy` (`h2.ect-contact__title`, `p.ect-contact__text`) and `.ect-contact__card` (`h3.ect-contact__card-title` and the form). Each field is a `.ect-field` wrapper; the submit is `ect-btn ect-btn--submit`.

- Place it on every page, Romanian and English, directly above the footer. A link to the Contact page does not replace it.
- Fields: name, company (optional), email, phone, message. Each has `aria-label`, the right `type` and `autocomplete`, and a `maxlength`; required fields carry `required`. The form posts JSON to `/api/contact`, adds a hidden honeypot field, and shows the result in `.ect-contact-status` (`data-state` `sending`, `success` or `error`) with a fallback line that gives contact@echipadetocilari.ro.
- The headline bolds the words that matter ("<b>Te putem ajuta</b>, indiferent de <b>orașul</b> din care ne scrii.").
- Gradient 135deg `orange-light` to `orange-hot`; padding 120/70px on desktop. Contrast: `white` text on the gradient is 2.1 to 3.2:1; the fields (`field` on `white`) have no visible edge, 1.03:1.

Hand-written from the homepage section 9884c62 and form a3688cf (Elementor), `scripts/lib/contact-forms.mjs` and `wp-content/ect-contact.css`.
