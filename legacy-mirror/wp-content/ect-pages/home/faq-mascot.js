/* The decorative 3D companion loads only near the FAQ. The HTML stays useful without it. */
(() => {
  const host = document.querySelector('.ect-home-faq__mascot');
  if (!host) return;
  const button = host.querySelector('.ect-home-faq__motion');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let controller;
  let loading = false;
  let visible = false;
  let userPaused = false;
  let disposed = false;

  function syncPlayback() {
    const paused = userPaused || reduce.matches || !visible || document.hidden;
    host.dataset.paused = String(paused);
    controller?.setPaused(paused);
    if (!button) return;
    button.hidden = !controller || reduce.matches;
    const label = userPaused ? button.dataset.playLabel : button.dataset.pauseLabel;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.dataset.paused = String(userPaused);
  }

  async function load() {
    if (loading || controller || disposed || reduce.matches) return;
    loading = true;
    try {
      const { mountMascot } = await import('/wp-content/ect-pages/home/faq-mascot-3d.js');
      if (disposed) return;
      controller = await mountMascot(host);
      if (disposed) controller?.dispose();
      else syncPlayback();
    } catch {
      // A static render covers browsers without WebGL and unavailable modules.
    } finally {
      loading = false;
    }
  }

  button?.addEventListener('click', () => {
    userPaused = !userPaused;
    syncPlayback();
  });
  const visibilityObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
      if (visible) load();
    }) : null;
  const preloadObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reduce.matches) {
        load();
        preloadObserver.disconnect();
      }
    }, { rootMargin: '160px' }) : null;
  visibilityObserver?.observe(host);
  preloadObserver?.observe(host);
  if (!visibilityObserver) {
    visible = true;
    load();
  }
  function onPreferenceChange() {
    syncPlayback();
    if (visible && !reduce.matches) load();
  }
  reduce.addEventListener('change', onPreferenceChange);
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    disposed = true;
    visibilityObserver?.disconnect();
    preloadObserver?.disconnect();
    reduce.removeEventListener('change', onPreferenceChange);
    document.removeEventListener('visibilitychange', syncPlayback);
    controller?.dispose();
  });
  syncPlayback();
})();
