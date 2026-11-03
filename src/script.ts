// Browser behaviour for every page. build.ts writes it to dist/site.js, so the Content-Security-Policy
// can allow scripts from 'self' only and needs no inline hash.
export const siteScript = String.raw`// Two behaviours, no framework. Pages stay static HTML, so S3 and CloudFront need no rewrite.
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
  // 2. Toggle groups: one pressed button at a time, with a bounce on the newly pressed one.
  document.querySelectorAll('[data-toon-toggle]').forEach((group) => {
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || !group.contains(b)) return;
      group.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      b.classList.remove('toon-boing');
      void b.offsetWidth; // restart the animation on a repeat tap
      b.classList.add('toon-boing');
    });
  });
})();
`;
