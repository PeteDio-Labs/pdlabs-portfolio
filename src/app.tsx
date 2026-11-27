// The app shell and the pages' views. The build renders it to HTML for every page (so a crawler, a slow connection and a
// browser with scripts off all get the page), and the browser hydrates the same tree and then routes on the client.
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { letters } from 'toonish-ui/markup';
import { site, studies, tags } from './content.ts';
import { notFoundPage, pageFor, studyCard, type Page } from './pages.ts';

/** The three nav items. Work always opens the case-study list. */
export const NAV: { label: NonNullable<Page['current']>; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work.html' },
  { label: 'About', href: '/about.html' },
];

const logo = (cls: string, accent: 'blue' | 'red') => letters('pdlab', accent, { live: true, cls });

type Sort = 'newest' | 'oldest' | 'title';
const SORTS: Record<Sort, (a: (typeof studies)[number], b: (typeof studies)[number]) => number> = {
  newest: (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
  oldest: (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title),
  title: (a, b) => a.title.localeCompare(b.title),
};
const SORT_LABEL: Record<Sort, string> = { newest: 'Newest first', oldest: 'Oldest first', title: 'Title, A to Z' };

/**
 * The case-study list. The first render is the same on the server and in the browser: newest first, every topic, and the
 * controls hidden, so a visitor without scripts gets the full list. After mount the controls appear, and the choice
 * lives in the query string, so a sorted view can be shared.
 */
export function WorkIndex({ search }: { search: string }) {
  const [ready, setReady] = useState(false);
  const [sort, setSort] = useState<Sort>('newest');
  const [tag, setTag] = useState('');
  useEffect(() => {
    const q = new URLSearchParams(search);
    const s = q.get('sort') as Sort | null;
    const t = q.get('tag') ?? '';
    setSort(s && s in SORTS ? s : 'newest');
    setTag(tags.includes(t) ? t : '');
    setReady(true);
  }, [search]);
  useEffect(() => {
    if (!ready) return;
    const next = new URLSearchParams();
    if (sort !== 'newest') next.set('sort', sort);
    if (tag) next.set('tag', tag);
    try {
      history.replaceState(history.state, '', location.pathname + (next.size ? `?${next}` : ''));
    } catch {}
  }, [ready, sort, tag]);
  const shown = [...studies].filter((s) => !tag || s.tag === tag).sort(SORTS[sort]);
  return (
    <section class="py-s8" aria-labelledby="work-h">
      <h1 id="work-h" class="m-0" dangerouslySetInnerHTML={{ __html: letters('Case studies', 'yellow', { live: true, cls: 'text-hero leading-[.9]' }) }} />
      <p class="mt-s4 max-w-[60ch] text-title3">{studies.length} write-ups of systems I built with AI. Each one names the problem, what I built, the result and what went wrong.</p>
      <div id="study-controls" class="mt-s6 flex flex-wrap items-end gap-x-s6 gap-y-s4" hidden={!ready}>
        <label class="grid gap-s1 text-footnote font-bold" for="study-sort">
          Sort by
          <select id="study-sort" value={sort} onChange={(e) => setSort((e.currentTarget as HTMLSelectElement).value as Sort)} class="rounded-toon border-2 border-toon-ink bg-toon-paper px-s3 py-s2 font-body text-body font-bold text-toon-ink">
            {(Object.keys(SORT_LABEL) as Sort[]).map((k) => <option value={k}>{SORT_LABEL[k]}</option>)}
          </select>
        </label>
        <div class="grid gap-s1 text-footnote font-bold">
          <span id="study-tags-label">Topic</span>
          <div id="study-tags" class="toon-nav toon-nav-wrap" role="group" aria-labelledby="study-tags-label">
            {['', ...tags].map((g) => (
              <button type="button" data-tag={g} aria-pressed={g === tag} onClick={() => setTag(g)}>{g || 'All'}</button>
            ))}
          </div>
        </div>
      </div>
      <p id="study-status" class="sr-only" role="status" aria-live="polite">
        {ready ? `Showing ${shown.length} of ${studies.length} case studies${tag ? `, topic ${tag}` : ''}, ${SORT_LABEL[sort].toLowerCase()}.` : ''}
      </p>
      <div id="study-list" class="mt-s8 grid gap-s6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => (
          <div key={s.slug} class="contents" dangerouslySetInnerHTML={{ __html: studyCard(s, studies.indexOf(s), '', 'h2', 240) }} />
        ))}
      </div>
    </section>
  );
}

/** The route's content. A new element per path, so the kit's behaviours start fresh on it and the old ones go with the old node. */
function View({ page, search, onMount, remote }: { page: Page; search: string; onMount: (el: HTMLElement, page: Page) => void; remote: Map<string, string> }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) onMount(ref.current, page);
  }, [page.path]);
  return page.kind === 'work' ? (
    <div ref={ref}><WorkIndex search={search} /></div>
  ) : (
    // A remote page's markup is in the page the server wrote (hydration keeps it) or in the map the router filled before it navigated here.
    <div ref={ref} dangerouslySetInnerHTML={{ __html: page.remote && typeof window !== 'undefined' ? (remote.get(page.path) ?? '') : page.body }} />
  );
}

export interface AppProps {
  page: Page;
  search?: string;
  /** What the shell announces after a client-side navigation. Empty until one happens. */
  announce?: string;
  onMount?: (el: HTMLElement, page: Page) => void;
  /** Markup the router fetched for remote pages, by path. */
  remote?: Map<string, string>;
  motion?: boolean;
  onMotion?: () => void;
}

export function App({ page, search = '', announce = '', onMount = () => {}, remote = new Map(), motion = true, onMotion = () => {} }: AppProps) {
  return (
    <>
      <a class="toon-skip" href="#main">Skip to content</a>
      <div class="toon-page mx-auto max-w-5xl pl-s4 pb-16">
        <header class="flex items-center justify-between gap-s1 py-s4 min-[360px]:gap-s3 sm:py-s5">
          <a href="/" class="flex min-h-[44px] shrink-0 items-center no-underline" aria-label="pdlab home" dangerouslySetInnerHTML={{ __html: logo('text-[24px] min-[360px]:text-[30px] sm:text-[40px]', 'blue') }} />
          {/* Three links share a phone's row with the logo and the motion switch, so each pill is narrower below sm. */}
          <nav class="toon-nav max-sm:[&_a]:px-[7px] max-[359px]:[&_a]:px-[5px] max-[359px]:[&_a]:text-footnote" aria-label="Main">
            {NAV.map((n) => <a href={n.href} aria-current={n.label === page.current ? 'page' : undefined}>{n.label}</a>)}
          </nav>
          <button type="button" class="toon-motion" aria-pressed={motion} onClick={onMotion}><span aria-hidden="true">✦</span><span class="toon-motion-label">Motion</span></button>
        </header>
        <main id="main" tabIndex={-1} class="outline-none" data-toon-scroll-auto="">
          <View key={page.path} page={page} search={search} onMount={onMount} remote={remote} />
        </main>
        <footer class="toon-footer">
          <span class="block" dangerouslySetInnerHTML={{ __html: logo('text-title1', 'red') }} />
          <p class="toon-footer-note text-subhead">Built with Bun, TypeScript, Preact and Tailwind on <a class="toon-link whitespace-nowrap" href="https://github.com/PeteDio-Labs/toonish-ui">toonish-ui</a>, an original kit.</p>
          <nav aria-label="Footer"><ul class="toon-footer-links text-footnote">
            <li><a class="toon-link inline-flex min-h-[44px] items-center" href={site.github}>GitHub</a></li>
            <li><a class="toon-link inline-flex min-h-[44px] items-center" href="/privacy.html" data-toon-modal>Privacy</a></li>
            <li><a class="toon-link inline-flex min-h-[44px] items-center" href="/terms.html" data-toon-modal>Terms</a></li>
          </ul></nav>
        </footer>
        <p class="sr-only" role="status" aria-live="polite" id="route-status">{announce}</p>
      </div>
    </>
  );
}

export { notFoundPage, pageFor };
