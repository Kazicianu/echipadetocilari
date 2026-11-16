import { appendToBody } from './html.mjs';

const SRC = '/wp-content/ect-pages/faq-panel.js';
const SCRIPT = `<script src="${SRC}" defer></script>`;

/** FAQ lists marked with data-faq-panel get the shared sliding-panel motion; without JS they stay native details. */
export function enhanceFaqPanel(html) {
  if (!html.includes('data-faq-panel') || html.includes(SRC)) return html;
  return appendToBody(html, SCRIPT);
}
