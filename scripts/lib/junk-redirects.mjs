/**
 * Theme-demo posts, duplicate URLs and WordPress attachment HTML that used to
 * ship as noindex leftovers. They must 301 (not 200+noindex) and must not
 * remain in `legacy-mirror/` or `dist/`.
 *
 * `vercel.json` is the runtime source Vercel reads. The build asserts it
 * matches this list so the two cannot drift.
 *
 * Do not add owned routes (`/about-2/`, `/clients/`, `/services/`, …).
 */
export const junkRedirects = [
  { from: '/ex-servicii-seo/', to: '/servicii-seo/' },
  { from: '/ex-creare-site-web/', to: '/creare-site-web/' },
  { from: '/pay-per-click/', to: '/agentie-google-ads/' },
  { from: '/en/ppc-advertising/', to: '/en/google-ads-agency/' },
  { from: '/coming-soon/', to: '/' },
  { from: '/home/', to: '/' },
  { from: '/do-ppc-ninjas-really-exist/', to: '/' },
  { from: '/lets-party-our-end-of-the-year-celebration/', to: '/' },
  { from: '/fun-fun-and-more-fun-come-work-at-beyond/', to: '/' },
  { from: '/will-there-be-a-future-post-facebook/', to: '/' },
  { from: '/always-learn-from-experience-and-past-mistakes/', to: '/' },
  { from: '/case-study-how-to-improve-your-seo-scores/', to: '/' },
  { from: '/the-weekly-podcast-design-meets-technology/', to: '/' },
  { from: '/onward-our-award-winning-creative-campaign/', to: '/' },
  { from: '/the-digital-marketing-revolution-is-here-is-here-now/', to: '/' },
  // Attachment pages the scraper saved as folders named after the file.
  { from: '/wp-content/uploads/2023/05/banner-7.jpg/', to: '/' },
  {
    from: '/uploads/2024/02/Logo_Echipa_de_Tocilari-1024x1024.webp/',
    to: '/wp-content/uploads/2024/02/Logo_Echipa_de_Tocilari-1024x1024.webp',
  },
  {
    from: '/wp-content/2024/02/Logo_Echipa_de_Tocilari-1024x1024.webp/',
    to: '/wp-content/uploads/2024/02/Logo_Echipa_de_Tocilari-1024x1024.webp',
  },
];

/** Vercel `source` has no trailing slash (except `/`). */
export function vercelRedirects() {
  return junkRedirects.map(({ from, to }) => ({
    source: from.replace(/\/$/, '') || '/',
    destination: to,
    permanent: true,
  }));
}
