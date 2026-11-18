// The browser entry: hydrates the page the server rendered, then routes on the client, so a click on the nav swaps the
// content under a header and footer that stay where they are. Every route is also a real file, so a deep link, a refresh
// and a crawler all get the page without this script.
import { hydrate } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { initToonish } from 'toonish-ui';
import { App, notFoundPage, pageFor } from './app.tsx';
import { fullTitle, type Page } from './pages.ts';
import { site } from './content.ts';

const resolve = (pathname: string): Page => pageFor(pathname) ?? notFoundPage();

/** An internal link the app routes itself: same origin, a page it knows, no download, no new tab, no modal. */
function routable(a: HTMLAnchorElement): URL | null {
  if (a.target && a.target !== '_self') return null;
  if (a.hasAttribute('download') || a.hasAttribute('data-toon-modal')) return null;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin) return null;
  return pageFor(u.pathname) ? u : null;
}

/** Keep the tab title, the description, the canonical link and the social tags in step with the page. */
function applyHead(page: Page): string {
  const t = fullTitle(page);
  document.title = t;
  const url = `https://${site.domain}${page.path}`;
  const set = (sel: string, attr: string, value: string) => document.head.querySelector(sel)?.setAttribute(attr, value);
  set('meta[name="description"]', 'content', page.description);
  set('link[rel="canonical"]', 'href', url);
  set('meta[property="og:url"]', 'content', url);
  set('meta[property="og:title"]', 'content', t);
  set('meta[property="og:description"]', 'content', page.description);
  set('meta[name="twitter:title"]', 'content', t);
  set('meta[name="twitter:description"]', 'content', page.description);
  set('meta[property="og:type"]', 'content', page.path.startsWith('/work/') ? 'article' : 'website');
  return t;
}

/**
 * The kit starts its behaviours once per document. For content that arrives later, run the same start-up against a view of
 * the document whose queries stop at the new content, and whose listeners are dropped: the document-level ones (modals,
 * disclosures) are already in place from the first start.
 */
function startKit(el: HTMLElement) {
  const scoped = new Proxy(document, {
    get(d, k) {
      if (k === 'querySelectorAll') return (s: string) => el.querySelectorAll(s);
      if (k === 'querySelector') return (s: string) => el.querySelector(s);
      if (k === 'addEventListener') return () => {};
      const v = Reflect.get(d, k, d);
      return typeof v === 'function' ? v.bind(d) : v;
    },
  });
  initToonish(scoped);
}

/** The 404 card: show one of its lines at random, and let the button step to the next one. */
function startLost(el: HTMLElement) {
  const lines = [...el.querySelectorAll<HTMLElement>('[data-lost-line]')];
  const more = el.querySelector<HTMLElement>('[data-lost-next]');
  if (lines.length < 2) return;
  let at = Math.floor(Math.random() * lines.length);
  const show = () => lines.forEach((l, i) => (l.hidden = i !== at));
  show();
  if (more) {
    more.hidden = false;
    more.addEventListener('click', () => { at = (at + 1) % lines.length; show(); });
  }
}

/** The markup of remote pages (the case studies), by path: the content of the page's own file, fetched once. */
const remote = new Map<string, string>();
const pending = new Map<string, Promise<boolean>>();

/** Fetch a remote page's content into `remote`. Resolves false when it could not be read, and the caller then does a normal navigation. */
function load(page: Page): Promise<boolean> {
  if (remote.has(page.path)) return Promise.resolve(true);
  let p = pending.get(page.path);
  if (!p) {
    p = fetch(page.path, { headers: { Accept: 'text/html' } })
      .then(async (r) => {
        if (!r.ok) return false;
        const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
        // A host that answers a missing page with 200 and the 404 page must not be stored as the study.
        if (doc.querySelector('link[rel="canonical"]')?.getAttribute('href') !== `https://${site.domain}${page.path}`) return false;
        const html = doc.querySelector('#main > div')?.innerHTML;
        if (!html) return false;
        remote.set(page.path, html);
        return true;
      })
      .catch(() => false)
      .finally(() => pending.delete(page.path));
    pending.set(page.path, p);
  }
  return p;
}

/** The path the app is showing, so a popstate can tell a hash change on this page from a move to another. */
let shown = location.pathname;

type Loc = { path: string; search: string };
const here = (): Loc => ({ path: location.pathname, search: location.search });

function Root() {
  const [loc, setLoc] = useState<Loc>(here);
  const [announce, setAnnounce] = useState('');
  const [motion, setMotion] = useState(true);
  const page = resolve(loc.path);
  // The first render is the hydrated one: the kit has not started on it yet, and the title is already right.
  const [first, setFirst] = useState(true);

  useEffect(() => {
    setMotion(document.documentElement.dataset.motion !== 'off');
  }, []);
  const onMotion = useCallback(() => {
    const next = document.documentElement.dataset.motion === 'off' ? 'on' : 'off';
    document.documentElement.dataset.motion = next;
    try { localStorage.setItem('pd-motion', next); } catch {}
    setMotion(next === 'on');
  }, []);

  const nav = useRef(0);
  const go = useCallback(async (u: URL, push: boolean) => {
    const mine = ++nav.current;
    // The page stays as it is until the next one is ready, so nothing blanks between them.
    const next = resolve(u.pathname);
    if (next.remote && !(await load(next))) {
      if (push) location.assign(u.href);
      else location.reload(); // the address already changed, so reload it rather than add an entry
      return;
    }
    if (mine !== nav.current) return; // a later navigation started while this one loaded
    if (push) {
      try { history.replaceState({ y: scrollY }, ''); } catch {}
      history.pushState({ y: 0 }, '', u.pathname + u.search + u.hash);
    }
    shown = u.pathname;
    setLoc({ path: u.pathname, search: u.search });
    setFirst(false);
    (window as any).__hash = u.hash;
  }, []);

  useEffect(() => {
    history.scrollRestoration = 'manual';
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const u = routable(a);
      if (!u) return;
      // A link to a place on this same page is the browser's to follow.
      if (u.pathname === location.pathname && u.search === location.search && u.hash) return;
      e.preventDefault();
      // The page you are on: scroll to its top and stop, with no new history entry.
      if (u.pathname === location.pathname && u.search === location.search) { scrollTo(0, 0); return; }
      go(u, true);
    };
    const pop = () => {
      const same = location.pathname === shown;
      if (same) { setLoc((l) => ({ ...l, search: location.search })); return; } // a hash or query change on the same page: the browser scrolls
      (window as any).__restore = history.state?.y ?? 0;
      go(new URL(location.href), false);
    };
    // Warm the cache when a link is about to be used.
    const warm = (e: Event) => {
      const a = (e.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
      const u = a && routable(a);
      const p = u && pageFor(u.pathname);
      if (p?.remote) void load(p);
    };
    document.addEventListener('pointerover', warm);
    document.addEventListener('focusin', warm);
    document.addEventListener('click', click);
    addEventListener('popstate', pop);
    // An old link to a section of the home page that now has a page of its own.
    if (location.pathname === '/' && /^#(about|how|review)$/.test(location.hash)) go(new URL('/about.html' + location.hash, location.href), false), history.replaceState({ y: 0 }, '', '/about.html' + location.hash);
    return () => { document.removeEventListener('pointerover', warm); document.removeEventListener('focusin', warm); document.removeEventListener('click', click); removeEventListener('popstate', pop); };
  }, [go]);

  const onMount = useCallback((el: HTMLElement, p: Page) => {
    if (first) return; // the hydrated content: the kit starts on the whole document below
    const t = applyHead(p);
    el.classList.add('route-in');
    startKit(el);
    if (p.kind === 'lost') startLost(el);
    const w = window as any;
    const hash = w.__hash as string | undefined;
    const restore = w.__restore as number | undefined;
    w.__hash = w.__restore = undefined;
    if (restore !== undefined) scrollTo(0, restore);
    else if (hash && document.getElementById(decodeURIComponent(hash.slice(1)))) document.getElementById(decodeURIComponent(hash.slice(1)))!.scrollIntoView();
    else scrollTo(0, 0);
    // Move focus to the content and say where you are, so a keyboard or a screen reader follows the change.
    if (restore === undefined) document.getElementById('main')?.focus({ preventScroll: true });
    setAnnounce(`${t}, page loaded`);
  }, [first]);

  return <App page={page} search={loc.search} announce={announce} onMount={onMount} remote={remote} motion={motion} onMotion={onMotion} />;
}

const root = document.getElementById('root');
if (!root) throw new Error('the page has no #root');
const initial = resolve(location.pathname);
hydrate(<Root />, root);
initToonish(document);
if (initial.kind === 'lost') startLost(root);
