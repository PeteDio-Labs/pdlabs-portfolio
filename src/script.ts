// The motion setting, read before first paint. build.ts writes it to dist/motion.js, so the Content-Security-Policy
// can allow scripts from 'self' only and needs no inline hash.
// Runs in <head> before first paint, so a visitor who chose motion off never sees it start.
// Default: off when the device asks for reduced motion, on otherwise. A saved choice wins.
export const motionScript = String.raw`(() => {
  let saved = null;
  try { saved = localStorage.getItem('pd-motion'); } catch (e) {}
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const m = saved === 'on' || saved === 'off' ? saved : reduced ? 'off' : 'on';
  document.documentElement.dataset.motion = m;
  // Set here, before first paint, so the pinned hero has its height at once and a deep link does not jump.
  document.documentElement.classList.toggle('sc-on', m === 'on');
})();
`;
