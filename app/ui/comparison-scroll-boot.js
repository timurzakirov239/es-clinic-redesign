// Runs while the HTML is parsed, before the client component hydrates.
// Guard the approach to the landing-page comparison until it is ready.
export const comparisonBootGuard = `(() => {
  if (location.pathname !== "/" && location.pathname !== "") return;
  const cleanup = () => {
    window.removeEventListener('wheel', guard, true);
    window.removeEventListener('comparison-scroll-ready', cleanup);
    clearTimeout(expiry);
  };
  const guard = (event) => {
    if (event.deltaY <= 0 || event.ctrlKey) return;
    const scene = document.querySelector('[data-comparison-scene]');
    if (!scene) return;
    if (scene.dataset.scrollPhase) { cleanup(); return; }
    const distance = event.deltaMode === 1 ? event.deltaY * 16
      : event.deltaMode === 2 ? event.deltaY * innerHeight : event.deltaY;
    const top = scene.getBoundingClientRect().top;
    if (top > 0 && top - distance <= innerHeight * 1.25 + 70) event.preventDefault();
  };
  const expiry = setTimeout(cleanup, 10000);
  window.addEventListener('wheel', guard, { passive: false, capture: true });
  window.addEventListener('comparison-scroll-ready', cleanup, { once: true });
})();`;

