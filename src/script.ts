// Browser behaviour for every page. build.ts writes it to dist/site.js, so the Content-Security-Policy
// can allow scripts from 'self' only and needs no inline hash.
// Runs in <head> before first paint, so a visitor who chose motion off never sees it start.
// Default: off when the device asks for reduced motion, on otherwise. A saved choice wins.
export const motionScript = String.raw`(() => {
  let saved = null;
  try { saved = localStorage.getItem('pd-motion'); } catch (e) {}
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.dataset.motion = saved === 'on' || saved === 'off' ? saved : reduced ? 'off' : 'on';
})();
`;

export const siteScript = String.raw`// This site's own behaviours: the scroll spy and the motion switch. Modals, toggle groups and scroll reveal come from
// toonish-ui's toonish.js. Pages stay static HTML, so S3 and CloudFront need no rewrite.
(() => {
  // 1. Scroll spy: on the home page, the main nav marks the section in view, not the page.
  const links = [...document.querySelectorAll('nav[aria-label="Main"] a[data-spy]')];
  const mark = (id) => links.forEach((a) => (a.dataset.spy === id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
  const targets = links.map((a) => document.getElementById(a.dataset.spy)).filter(Boolean);
  if (targets.length) {
    const seen = new Map();
    const pick = () => {
      // The last section whose top has passed the upper third of the screen wins. Above the first one, Work stays marked.
      let id = targets[0].id;
      for (const t of targets) if (t.getBoundingClientRect().top < innerHeight * 0.35) id = t.id;
      mark(id);
    };
    addEventListener('scroll', pick, { passive: true });
    addEventListener('hashchange', pick);
    pick();
  }
  // 0. Motion switch: flips data-motion on <html> and remembers the choice. Without storage it still works for the visit.
  const root = document.documentElement;
  const sw = document.querySelector('[data-motion-toggle]');
  const sync = () => {
    const on = root.dataset.motion !== 'off';
    if (sw) sw.setAttribute('aria-pressed', String(on));
  };
  sync();
  if (sw) sw.addEventListener('click', () => {
    const next = root.dataset.motion === 'off' ? 'on' : 'off';
    root.dataset.motion = next;
    try { localStorage.setItem('pd-motion', next); } catch (e) {}
    sync();
  });
})();
`;
