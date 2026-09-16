# Static presentation dependencies

These browser assets were copied from the existing public site on 2026-09-16.
They run entirely in the browser; they do not require a WordPress server.

| Local file | Public source |
| --- | --- |
| `wp-hooks.min.js` | `https://www.echipadetocilari.ro/wp-includes/js/dist/hooks.min.js?ver=7496969728ca0f95732d` |
| `wp-i18n.min.js` | `https://www.echipadetocilari.ro/wp-includes/js/dist/i18n.min.js?ver=781d11515ad3d91786ec` |
| `wp-block-library.min.css` | `https://www.echipadetocilari.ro/wp-includes/css/dist/block-library/style.min.css?ver=7.0.2` |

Elementor Pro's presentation runtime imports `wp.i18n`; that library in turn
imports `wp.hooks`. The PPC page includes WordPress block markup and needs the
corresponding CSS. React and editor libraries are unused and are removed by
`scripts/lib/standalone-assets.mjs`.

Additional lazy-loaded presentation assets are preserved at their original
paths under `/wp-content/plugins/elementor/assets/`: `lib/dialog/dialog.min.js`,
`lib/share-link/share-link.min.js`, `css/conditionals/dialog.min.css`, and
`css/conditionals/lightbox.min.css`. They came from the same public origin.
The unversioned Swiper files mirror the existing versioned files so Elementor's
lazy asset loader can resolve them on a static server.

Upstream comments and contents are retained. WordPress is distributed under
GPLv2 or later; Elementor and its bundled dependencies retain their respective
upstream licenses. These files are kept outside a directory named `dist` because
the repository ignores that name at every level.
