# Footer nou (previzualizare)

Footer în stilul Leedlime, cu pictura Bucureștiului (Ateneul Român) pe toată lățimea, jos. Etapa A: doar previzualizare, nimic nu e legat de site.

- Deschide `prototip.html` direct în browser (`file:///`).
- `footer.ro.html` și `footer.en.html`: elementul `<footer>` exact cum îl va emite build-ul (căi de producție).
- `site-footer.css`: stilul final (se copiază identic în `legacy-mirror/wp-content/ect-pages/` la implementare).
- `media/`: pictura originală și variantele WebP 640 / 1280 / 2000 (raport 3:1).
- `capturi/`: `acum-1440.png` (footerul actual) și `nou-360|390|768|1440|1920.png` (pagina `/` reală, footerul înlocuit).
- Ajustabile în CSS: înălțimea picturii (`.ect-footer__art img { height: clamp(220px, 26vw, 720px); object-position: 53% 100% }`), tagline-ul (în cele două fișiere HTML), pasul vertical al linkurilor (`min-height: 44px`).
- Butonul „înapoi sus” rămâne cel din Elementor; CSS-ul adaugă `position: fixed` pentru că widgetul nu mai e copil direct al unui `.e-con`.
