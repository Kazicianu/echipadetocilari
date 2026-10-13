/* The 3D companion loads only near the FAQ. The HTML stays useful without it. */
(() => {
  const host = document.querySelector('.ect-home-faq__mascot');
  if (!host) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let controller;
  let loading = false;
  let visible = false;
  let disposed = false;

  function syncPlayback() {
    const paused = reduce.matches || !visible || document.hidden;
    host.dataset.paused = String(paused);
    controller?.setPaused(paused);
  }

  async function load() {
    if (loading || controller || disposed || reduce.matches) return;
    loading = true;
    try {
      const { mountMascot } = await import('/wp-content/ect-pages/home/faq-mascot-client-3d.js');
      if (disposed) return;
      controller = await mountMascot(host);
      if (disposed) controller?.dispose();
      else syncPlayback();
    } catch {
      // The static render covers unavailable modules and browsers without WebGL.
    } finally {
      loading = false;
    }
  }

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
