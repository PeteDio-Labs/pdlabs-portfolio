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

export const siteScript = String.raw`// A few small behaviours, no framework. Pages stay static HTML, so S3 and CloudFront need no rewrite.
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
  // Scroll reveal: blocks rise into view the first time they appear. Blocks already in view at load stay put.
  if ('IntersectionObserver' in window) {
    root.classList.add('toon-js');
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('toon-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('main h2, main .toon-callout, main .toon-frame, main .toon-bubble, .toon-footer').forEach((n) => {
      if (n.getBoundingClientRect().top < innerHeight) return;
      n.classList.add('toon-reveal');
      io.observe(n);
    });
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
  // 3. Modals: native <dialog> gives the focus trap, Esc and an inert page. This adds opening, backdrop taps,
  // scroll lock, and a shared dialog that shows another page's <article> (the footer's Privacy and Terms).
  // If <dialog> is missing or the fetch fails, a link keeps working as a plain link.
  const lock = (on) => document.documentElement.classList.toggle('toon-modal-open', on);
  const open = (d) => { d.showModal(); lock(true); };
  document.addEventListener('close', (e) => { if (e.target.classList && e.target.classList.contains('toon-modal')) lock(false); }, true);
  document.addEventListener('click', (e) => {
    if (e.target.classList && e.target.classList.contains('toon-modal')) e.target.close(); // a tap on the backdrop
  });
  if (typeof HTMLDialogElement === 'function') {
    document.addEventListener('click', (e) => {
      const closer = e.target.closest('[data-toon-modal-close]');
      if (closer) { const d = closer.closest('dialog'); if (d) d.close(); return; }
      const opener = e.target.closest('[data-toon-modal-open]');
      if (opener) { const d = document.getElementById(opener.dataset.toonModalOpen); if (d) open(d); return; }
      const link = e.target.closest('a[data-toon-modal]');
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      showPage(link).catch(() => { location.href = link.href; });
    });
    const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
    const cache = new Map();
    let shared;
    const sharedDialog = () => {
      if (shared) return shared;
      const d = el('dialog', 'toon-modal');
      d.setAttribute('aria-modal', 'true');
      d.setAttribute('aria-labelledby', 'toon-modal-title');
      const box = el('div', 'toon-modal-box');
      const head = el('div', 'toon-modal-head');
      const title = el('h2', 'toon-heading m-0 text-display2');
      title.id = 'toon-modal-title';
      const x = el('button', 'toon-btn toon-btn-red toon-modal-x', 'Close');
      x.type = 'button';
      x.dataset.toonModalClose = '';
      head.append(title, x);
      box.append(head, el('div', 'toon-modal-body'));
      d.append(box);
      document.body.append(d);
      return (shared = d);
    };
    const showPage = async (link) => {
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) throw new Error('cross-origin');
      if (!cache.has(url.pathname)) {
        const res = await fetch(url.pathname, { headers: { Accept: 'text/html' } });
        if (!res.ok) throw new Error(String(res.status));
        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        const article = doc.querySelector('article');
        const h1 = article && article.querySelector('h1');
        if (!article || !h1) throw new Error('no article');
        cache.set(url.pathname, { title: h1.textContent.trim(), nodes: [...article.children].filter((n) => n !== h1) });
      }
      const page = cache.get(url.pathname);
      const d = sharedDialog();
      d.querySelector('#toon-modal-title').textContent = page.title;
      const body = d.querySelector('.toon-modal-body');
      body.replaceChildren(...page.nodes.map((n) => document.importNode(n, true)));
      const more = el('p', 'mb-0 mt-s6 text-footnote');
      const a = el('a', 'toon-link', 'Open as a full page');
      a.href = url.pathname;
      more.append(a);
      body.append(more);
      body.scrollTop = 0;
      open(d);
    };
  }
})();
`;
