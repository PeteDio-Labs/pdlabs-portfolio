import { esc, md } from './html.ts';
import { legalPages, legalUpdated } from './legal.ts';
import { site, studies, featured, latest, tags, type Accent, type CaseStudy } from './content.ts';

const HEX: Record<Accent, string> = { blue: '#3d7bff', red: '#ff3d3d', yellow: '#ffd60a', violet: '#9b7bff' };
// Shadow paired with each accent: never a complementary clash, never the fill's own colour.
const PAIR: Record<Accent, Accent> = { blue: 'yellow', red: 'yellow', yellow: 'blue', violet: 'red' };
const BADGE: Record<Accent, string> = { blue: 'toon-badge-blue', red: '', yellow: 'toon-badge-yellow', violet: 'toon-badge-violet' };

/** A comic starburst, drawn once per accent: the shape behind a hero word or a figure. */
const burst = (accent: Accent, cls = '') => {
  const pts: string[] = [];
  for (let i = 0; i < 24; i++) {
    const r = i % 2 ? 44 : 60;
    const a = (i / 24) * Math.PI * 2;
    pts.push(`${(60 + r * Math.cos(a)).toFixed(1)},${(60 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `<svg class="toon-burst ${cls}" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><polygon points="${pts.join(' ')}" fill="${HEX[accent]}" stroke="#0a0a1f" stroke-width="5" stroke-linejoin="round"/></svg>`;
};

/** Speed lines: a fan of yellow strokes behind a panel. Ink would vanish on the navy ground. */
const speedLines = (cls = '') =>
  `<svg class="toon-speed ${cls}" viewBox="0 0 200 120" aria-hidden="true" focusable="false" preserveAspectRatio="none"><g stroke="#ffd60a" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke">${[8, 26, 44, 62, 80, 98, 116].map((y, i) => `<line class="toon-speed-line" style="--i:${i}" x1="4" y1="${y}" x2="${120 + (i % 3) * 30}" y2="${y}" pathLength="100" vector-effect="non-scaling-stroke"/>`).join('')}</g></svg>`;

/**
 * Display type: the comic font with an ink outline and a hard shadow in the paired colour.
 * Each letter is its own span, so the kit's CSS can tilt them in turn and, with `live`, bob them.
 * The text stays real text, so readers and search see it as written.
 */
const letters = (text: string, accent: Accent = 'blue', opts: { live?: boolean; flat?: boolean; cls?: string } = {}) =>
  `<span class="toon-type${opts.live ? ' toon-type-live' : ''}${opts.flat ? ' toon-type-flat' : ''} ${opts.cls ?? ''}" style="--toon-fill:${HEX[accent]}; --toon-shade:${HEX[PAIR[accent]]}">${[...text]
    .map((c, i) => (c === ' ' ? ' ' : `<span style="--i:${i}">${esc(c)}</span>`))
    .join('')}</span>`;

/** A figure on a paper card: the display type, flat and heavy. */
const figure = (value: string, accent: Accent, cls: string) => letters(value, accent, { flat: true, cls: `block leading-none ${cls}` });

/** A section heading in the display type. */
const lettered = (id: string, text: string, accent: Accent, cls: string) =>
  `<h2 id="${id}" class="m-0 ${cls}">${letters(text, accent, { cls: 'text-display2' })}</h2>`;

const nav = (current: string, path: string) => {
  const items: [string, string, string?][] = [
    ['Work', '/work.html', 'work'],
    ['About', '/#about', 'about'],
    ['UI kit', '/ui.html'],
  ];
  // On the home page, Work and About point at sections, and the page script marks the one in view.
  const home = path === '/';
  return `<nav class="toon-nav" aria-label="Main">${items
    .map(([label, href, spy]) => {
      const attrs = [home && spy ? `data-spy="${spy}"` : '', label === current ? 'aria-current="page"' : ''].filter(Boolean).join(' ');
      return `<a href="${home && spy ? `#${spy}` : href}"${attrs ? ` ${attrs}` : ''}>${label}</a>`;
    })
    .join('')}</nav>`;
};

const analyticsToken = process.env.CF_ANALYTICS_TOKEN?.trim() || '';

export function layout(opts: { title: string; description: string; path: string; current?: string; body: string; scriptSrc?: string; noindex?: boolean; jsonLd?: object }): string {
  const fullTitle = opts.path === '/' ? `${site.name}: systems built with AI` : `${opts.title} | ${site.name}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0c1240">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(opts.description)}">
<link rel="canonical" href="https://${site.domain}${opts.path}">
<meta property="og:type" content="${opts.path.startsWith('/work/') ? 'article' : 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:url" content="https://${site.domain}${opts.path}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(opts.description)}">
<meta property="og:image" content="https://${site.domain}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="pdlab: systems built with AI, in comic-book style">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(opts.description)}">
<meta name="twitter:image" content="https://${site.domain}/og.png">
${opts.noindex ? '<meta name="robots" content="noindex">\n' : ''}${opts.jsonLd ? `<script type="application/ld+json">${JSON.stringify(opts.jsonLd).replace(/</g, '\\u003c')}</script>\n` : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bangers&family=DM+Sans:wght@400;700&display=swap">
<link rel="stylesheet" href="/toonish.css">
</head>
<body class="toon-dots">
<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 toon-btn toon-btn-paper">Skip to content</a>
<div class="toon-page mx-auto max-w-5xl px-s4 pb-16">
  <header class="flex items-center justify-between gap-s3 py-s4 sm:py-s5">
    <a href="/" class="block shrink-0 no-underline" aria-label="pdlab home">${letters('pdlab', 'blue', { cls: 'text-[30px] sm:text-[40px]' })}</a>
    ${nav(opts.current ?? '', opts.path)}
  </header>
  <main id="main">
${opts.body}
  </main>
  <footer class="toon-footer">
    <span class="block">${letters('pdlab', 'red', { cls: 'text-title1' })}</span>
    <p class="toon-footer-note text-subhead">Built with Bun, TypeScript and Tailwind on <a class="toon-link whitespace-nowrap" href="/ui.html">toonish-ui</a>, an original kit.</p>
    <nav aria-label="Footer"><ul class="toon-footer-links text-footnote">
      <li><a class="toon-link" href="${site.github}">GitHub</a></li>
      <li><a class="toon-link" href="/privacy.html" data-toon-modal>Privacy</a></li>
      <li><a class="toon-link" href="/terms.html" data-toon-modal>Terms</a></li>
    </ul></nav>
  </footer>
</div>
<script src="/site.js" defer></script>${opts.scriptSrc ? `\n<script src="${opts.scriptSrc}" defer></script>` : ''}
${analyticsToken ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${esc(analyticsToken)}"}'></script>\n` : ''}</body>
</html>
`;
}

/** "Oct 2026": the month is enough, and it does not promise a precision the dates do not have. */
const month = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** A case-study card. The data attributes let the /work sort script order and filter without re-reading the page. */
const studyCard = (s: CaseStudy, i: number, label = '') => `
      <article class="toon-card toon-pop relative flex flex-col" data-study data-date="${s.date}" data-tag="${esc(s.tag)}" data-title="${esc(s.title)}" style="--toon-shadow:${HEX[s.accent]}; --toon-tilt:${i % 2 ? '1deg' : '-1.5deg'}; animation-delay:${120 * i}ms">
        ${label ? `<span class="toon-corner" style="background:${HEX[s.accent]}">${esc(label)}</span>` : ''}
        <p class="m-0 flex flex-wrap items-center gap-s2"><span class="toon-badge ${BADGE[s.accent]}">${esc(s.tag)}</span><time class="text-footnote" datetime="${s.date}">${month(s.date)}</time></p>
        <h3 class="mb-s2 mt-s3 text-title2 font-bold leading-snug">${esc(s.title)}</h3>
        <p class="my-0">${md(s.summary)}</p>
        <p class="mt-s4 mb-s4">${figure(s.stat.value, s.accent, 'text-[52px]')}<span class="mt-s1 block text-footnote">${esc(s.stat.label)}</span></p>
        <a class="toon-link mt-auto self-start" href="/work/${s.slug}.html">Read the case study<span class="sr-only">: ${esc(s.title)}</span></a>
      </article>`;

export function home(): string {
  const body = `
    <section class="grid items-center gap-s8 py-s8 md:grid-cols-[1.5fr_1fr]">
      <div class="relative z-0 min-w-0">
        <h1 class="sr-only">${esc(site.name)}. ${esc(site.role)}</h1>
        <div class="grid gap-s2 text-hero leading-[.9]">
          <div>${letters('I build', 'blue', { live: true })}</div>
          <div>${letters('systems', 'yellow', { live: true })}</div>
          <div class="relative w-fit">${burst('red', 'toon-burst-hero')}${letters('with AI!', 'yellow', { live: true, cls: 'relative' })}</div>
        </div>
        <p class="mt-s6 flex flex-wrap items-baseline gap-x-s3 gap-y-s1"><span class="font-display text-title1 tracking-wide text-toon-yellow">${esc(site.name)}</span><span class="text-subhead text-toon-paper/80">${esc(site.tagline)}</span></p>
        <p class="mt-s4 max-w-[38ch] text-title3">${esc(site.intro)}</p>
        <div class="mt-s6 flex flex-wrap gap-s4">
          <a class="toon-btn" href="#work">See the work</a>
          <a class="toon-btn toon-btn-red" href="${site.org}">Browse the repos</a>
        </div>
      </div>
      <div class="relative">
        ${speedLines('toon-speed-hero')}
        <figure class="toon-frame toon-panel-tilt m-0">
          <span class="toon-caption absolute right-s3 top-s3">The lab</span>
          <svg viewBox="0 0 320 236" role="img" aria-label="A terminal: terraform plan reports no changes, and the merge lands after CI and review">
            <rect width="320" height="236" fill="#0c1240"/>
            <rect width="320" height="34" fill="#9b7bff"/>
            <circle cx="22" cy="17" r="7" fill="#ff3d3d"/><circle cx="44" cy="17" r="7" fill="#ffd60a"/><circle cx="66" cy="17" r="7" fill="#3d7bff"/>
            <g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="15">
              <text x="18" y="70" fill="#3d7bff">$ terraform plan</text>
              <text x="18" y="96" fill="#fff6dc">No changes. Your infrastructure</text>
              <text x="18" y="116" fill="#fff6dc">matches the configuration.</text>
              <text x="18" y="152" fill="#ffd60a">$ gh pr merge --squash</text>
              <text x="18" y="178" fill="#fff6dc">Merged after CI and review.</text>
              <text x="18" y="212" fill="#ff3d3d" class="toon-blink">$ _</text>
            </g>
          </svg>
        </figure>
      </div>
    </section>

    <section id="work" class="scroll-mt-8 py-s8" aria-labelledby="work-h">
      ${lettered('work-h', 'Case studies', 'yellow', 'mb-s8 max-w-md')}
      <div class="grid gap-s8 sm:grid-cols-2">${[studyCard(featured, 0, 'Featured'), ...(latest ? [studyCard(latest, 1, 'Latest')] : [])].join('')}
      </div>
      <p class="mt-s8"><a class="toon-btn toon-btn-yellow" href="/work.html">All ${studies.length} case studies<span class="sr-only">, sortable by date and topic</span></a></p>
    </section>

    <section id="about" class="scroll-mt-8 grid gap-s8 py-s8 md:grid-cols-[1fr_1fr]" aria-labelledby="about-h">
      <div class="min-w-0">
        ${lettered('about-h', 'How I work', 'blue', 'mb-s6 max-w-sm')}
        <p class="mb-s4 mt-0 max-w-[60ch]">I treat AI agents like a team, not a tool. Each task gets its own session and its own branch. Nothing merges without a review, and no session approves its own work.</p>
        <p class="mb-s4 m-0 max-w-[60ch]">The infrastructure is declared, not hand-run: Terraform builds it, Ansible configures it, and a repair is a config change before it is ever a script. When a check reports success, it also says what it examined.</p>
        <h3 class="mb-s3 mt-s6 text-title2 font-bold">Background</h3>
        <p class="m-0 max-w-[60ch]">${esc(site.background)}</p>
      </div>
      <div class="toon-callout toon-callout-yellow self-start">
        <h3 class="mb-s3 mt-0 text-title2 font-bold">The stack</h3>
        <ul class="m-0 grid gap-s2 pl-s5">
          <li>Proxmox, three nodes, built to the shape of AWS</li>
          <li>Terraform and Ansible, deployed by GitOps</li>
          <li>Vault for secrets, reached from CI by OIDC</li>
          <li>Bun and TypeScript for services and bots</li>
          <li>Claude and local Qwen models for the agents</li>
        </ul>
      </div>
    </section>

    <section class="py-s8" aria-labelledby="contact-h">
      <div class="flex flex-wrap items-center gap-s8">
        <div class="toon-bubble toon-pop"><h2 id="contact-h" class="m-0 text-title2 font-bold">Want to talk systems?</h2></div>
        <a class="toon-btn toon-btn-yellow toon-wiggle" href="${site.github}">Find me on GitHub</a>
      </div>
    </section>`;
  return layout({ title: 'Home', path: '/', current: 'Work', description: `${site.name}. ${site.role} ${site.intro}`, body, jsonLd: personJsonLd() });
}

/**
 * The /work page script, written to dist/work.js so a Content-Security-Policy of script-src 'self' allows it.
 * The page is complete without it: cards arrive newest first and the controls
 * stay hidden. With it, the controls appear and the cards reorder and filter in place, with no fetch
 * and no animation of its own. The choice lives in the query string, so a sorted view can be shared.
 */
export const workScript = `(() => {
  const list = document.getElementById('study-list');
  const controls = document.getElementById('study-controls');
  const sort = document.getElementById('study-sort');
  const tagBar = document.getElementById('study-tags');
  const status = document.getElementById('study-status');
  if (!list || !controls || !sort || !tagBar || !status) return;
  const cards = [...list.querySelectorAll('[data-study]')];
  const by = {
    newest: (a, b) => b.dataset.date.localeCompare(a.dataset.date) || a.dataset.title.localeCompare(b.dataset.title),
    oldest: (a, b) => a.dataset.date.localeCompare(b.dataset.date) || a.dataset.title.localeCompare(b.dataset.title),
    title: (a, b) => a.dataset.title.localeCompare(b.dataset.title),
  };
  const state = { sort: 'newest', tag: '' };
  const q = new URLSearchParams(location.search);
  if (by[q.get('sort')]) state.sort = q.get('sort');
  if (cards.some((c) => c.dataset.tag === q.get('tag'))) state.tag = q.get('tag');
  const render = () => {
    cards.sort(by[state.sort]).forEach((c) => {
      list.appendChild(c);
      c.hidden = !!state.tag && c.dataset.tag !== state.tag;
    });
    sort.value = state.sort;
    tagBar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tag === state.tag)));
    const shown = cards.filter((c) => !c.hidden).length;
    status.textContent = 'Showing ' + shown + ' of ' + cards.length + ' case studies' + (state.tag ? ', topic ' + state.tag : '') + ', ' + sort.selectedOptions[0].textContent.toLowerCase() + '.';
    const next = new URLSearchParams();
    if (state.sort !== 'newest') next.set('sort', state.sort);
    if (state.tag) next.set('tag', state.tag);
    try { history.replaceState(null, '', location.pathname + (next.size ? '?' + next : '')); } catch (e) {}
  };
  sort.addEventListener('change', () => { state.sort = sort.value; render(); });
  tagBar.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b && tagBar.contains(b)) { state.tag = b.dataset.tag; render(); }
  });
  controls.hidden = false;
  render();
})();`;

export function workIndex(): string {
  const body = `
    <section class="py-s8" aria-labelledby="work-h">
      <h1 id="work-h" class="m-0">${letters('Case studies', 'yellow', { live: true, cls: 'text-hero leading-[.9]' })}</h1>
      <p class="mt-s4 max-w-[60ch] text-title3">${studies.length} write-ups of systems I built with AI. Each one names the problem, what I built, the result and what went wrong.</p>
      <div id="study-controls" class="mt-s6 flex flex-wrap items-end gap-x-s6 gap-y-s4" hidden>
        <label class="grid gap-s1 text-footnote font-bold" for="study-sort">Sort by
          <select id="study-sort" class="rounded-toon border-toon border-toon-ink bg-toon-paper px-s3 py-s2 font-body text-body font-bold text-toon-ink">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title, A to Z</option>
          </select>
        </label>
        <div class="grid gap-s1 text-footnote font-bold"><span id="study-tags-label">Topic</span>
          <div id="study-tags" class="toon-nav" role="group" aria-labelledby="study-tags-label" data-toon-toggle>
            <button type="button" data-tag="" aria-pressed="true">All</button>${tags.map((g) => `<button type="button" data-tag="${esc(g)}" aria-pressed="false">${esc(g)}</button>`).join('')}
          </div>
        </div>
      </div>
      <p id="study-status" class="sr-only" role="status" aria-live="polite"></p>
      <div id="study-list" class="mt-s8 grid gap-s8 sm:grid-cols-2">${studies.map((s, i) => studyCard(s, i)).join('')}
      </div>
    </section>`;
  return layout({
    title: 'Case studies',
    path: '/work.html',
    current: 'Work',
    description: `${studies.length} case studies on building systems with AI: agents, merge gates, short-lived access, local models and disaster recovery. Sort by date or filter by topic.`,
    body,
    scriptSrc: '/work.js',
  });
}

export function study(s: CaseStudy): string {
  const i = studies.indexOf(s);
  const next = studies[(i + 1) % studies.length];
  const prev = studies[(i + studies.length - 1) % studies.length];
  const body = `
    <article class="py-s8">
      <a class="toon-link" href="/work.html">All case studies</a>
      <header class="mb-s8 mt-s6 grid items-end gap-s6 md:grid-cols-[1fr_auto]">
        <div class="min-w-0">
          <span class="toon-badge ${BADGE[s.accent]}">${esc(s.tag)}</span>
          <h1 class="mt-s4 leading-none">${letters(s.title, s.accent, { flat: true, cls: 'text-display2 leading-[1.05]' })}</h1>
          <p class="mt-s4 max-w-[60ch] text-title3">${md(s.summary)}</p>
        </div>
        <div class="toon-card m-0 w-full max-w-[18rem] text-center md:w-[16rem]" style="--toon-shadow:${HEX[PAIR[s.accent]]}">
          ${figure(s.stat.value, s.accent, 'text-[72px]')}
          <span class="mt-s2 block text-footnote">${esc(s.stat.label)}</span>
        </div>
      </header>
      <div class="grid max-w-[68ch] gap-s8">${s.sections
        .map(
          (sec) => `
        <section>
          <h2 class="mb-s3 mt-0 font-display text-title1 font-normal" style="color:${HEX[s.accent]}">${esc(sec.heading)}</h2>
          ${sec.paragraphs.map((p) => `<p class="mb-s3 mt-0">${md(p)}</p>`).join('\n          ')}
        </section>`,
        )
        .join('')}
        <section>
          <h2 class="mb-s3 mt-0 font-display text-title1 font-normal" style="color:${HEX[s.accent]}">Skills shown</h2>
          <ul class="m-0 flex list-none flex-wrap gap-s2 p-0">${s.skills.map((k) => `<li class="toon-badge toon-badge-violet">${esc(k)}</li>`).join('')}</ul>
        </section>
      </div>
      <nav class="mt-16 grid gap-s6 sm:grid-cols-2" aria-label="Case studies">
        <a class="toon-btn toon-btn-paper justify-self-start" href="/work/${prev.slug}.html"><span class="block text-footnote font-normal">Previous</span>${esc(prev.title)}</a>
        <a class="toon-btn justify-self-start sm:justify-self-end sm:text-right" href="/work/${next.slug}.html"><span class="block text-footnote font-normal">Next</span>${esc(next.title)}</a>
      </nav>
    </article>`;
  return layout({ title: s.title, path: `/work/${s.slug}.html`, current: 'Work', description: s.summary.replace(/`/g, ''), body });
}

export function kit(): string {
  const swatch = (name: string, cls: string, text = 'text-toon-ink') =>
    `<div class="grid h-16 w-28 place-items-end justify-start rounded-toon border-toon border-toon-ink ${cls} p-s2 text-caption1 font-bold ${text}">${name}</div>`;
  const body = `
    <section class="py-s8">
      <h1 class="sr-only">toonish-ui</h1>
      <div class="text-hero leading-[.9]">${letters('toonish-ui', 'yellow', { live: true })}</div>
      <p class="mt-s4 max-w-[60ch] text-title3">The component kit this site is built on. Comic-book panels: ink outlines, hard offset shadows, halftone and a bounce, in electric blue, red, yellow and violet on deep navy. Every animation stops when you ask your system for reduced motion.</p>
    </section>

    <section class="py-s6" aria-labelledby="k-btn"><h2 id="k-btn" class="toon-heading mb-s6 text-display2">Buttons</h2>
      <div class="flex flex-wrap gap-s4">
        <button class="toon-btn" type="button">Blue</button>
        <button class="toon-btn toon-btn-red" type="button">Red</button>
        <button class="toon-btn toon-btn-yellow" type="button">Yellow</button>
        <button class="toon-btn toon-btn-paper" type="button">Paper</button>
        <button class="toon-btn toon-wiggle" type="button">Wiggle on hover</button>
      </div>
    </section>

    <section class="py-s6" aria-labelledby="k-card"><h2 id="k-card" class="toon-heading mb-s6 text-display2">Cards, badges and links</h2>
      <div class="grid gap-s8 sm:grid-cols-3">
        <div class="toon-card relative"><span class="toon-corner" aria-hidden="true">01</span><span class="toon-badge">Badge</span><p>A paper card tilts a little and straightens when you point at it. A <code>toon-corner</code> numbers it.</p><a class="toon-link" href="/ui.html">A link</a></div>
        <div class="toon-card"><span class="toon-badge toon-badge-blue">Blue</span><p>Its shadow color comes from <code>--toon-shadow</code>.</p></div>
        <div class="toon-card"><span class="toon-badge toon-badge-yellow">Yellow</span> <span class="toon-badge toon-badge-violet">Violet</span><p>Badges sit on any surface.</p></div>
      </div>
    </section>

    <section class="py-s6" aria-labelledby="k-comic"><h2 id="k-comic" class="toon-heading mb-s6 text-display2">Panels, captions, bursts</h2>
      <div class="grid gap-s8 sm:grid-cols-[1fr_auto] items-start">
        <div class="relative">${speedLines('toon-speed-hero')}<div class="toon-frame toon-panel-tilt p-s6"><span class="toon-caption absolute left-s3 top-s3">Caption</span><p class="mb-0 mt-s8">A <code>toon-frame</code> is a comic panel: cream, halftone, ink border, hard shadow. <code>toon-panel-tilt</code> tilts it and straightens it on hover. <code>toon-speed</code> fans speed lines behind it, and a <code>toon-caption</code> is the yellow box a narrator speaks from.</p></div></div>
        <div class="relative grid h-40 w-40 place-items-center">${burst('red', 'toon-burst-spin')}<span class="relative font-display text-title1 text-toon-ink">POW</span></div>
      </div>
    </section>

    <section class="py-s6" aria-labelledby="k-misc"><h2 id="k-misc" class="toon-heading mb-s6 text-display2">Nav, bubble, callout</h2>
      <div class="flex flex-wrap items-start gap-s8">
        <div class="toon-nav" role="group" aria-label="Sample nav, tap to switch" data-toon-toggle><button type="button" aria-pressed="true">Current</button><button type="button" aria-pressed="false">Other</button><button type="button" aria-pressed="false">Third</button></div>
        <div class="toon-bubble">A speech bubble with a tail.</div>
      </div>
      <div class="toon-callout mt-s8"><strong>Callout:</strong> violet by default, yellow with <code>toon-callout-yellow</code>.</div>
    </section>

    <section class="py-s6" aria-labelledby="k-modal"><h2 id="k-modal" class="toon-heading mb-s6 text-display2">Modal</h2>
      <p class="max-w-[60ch]">A <code>toon-modal</code> is a native <code>&lt;dialog&gt;</code>: it traps focus, closes on <kbd>Esc</kbd> or a tap on the backdrop, marks the page behind it inert and returns focus to the button that opened it. The footer uses it for Privacy and Terms: a link with <code>data-toon-modal</code> opens the linked page's article in the modal, and without JavaScript it stays an ordinary link.</p>
      <button class="toon-btn toon-btn-yellow" type="button" data-toon-modal-open="k-modal-demo">Open a modal</button>
      <dialog id="k-modal-demo" class="toon-modal" aria-modal="true" aria-labelledby="k-modal-demo-title">
        <div class="toon-modal-box">
          <div class="toon-modal-head"><h2 id="k-modal-demo-title" class="toon-heading m-0 text-display2">POW!</h2><button type="button" class="toon-btn toon-btn-red toon-modal-x" data-toon-modal-close>Close</button></div>
          <div class="toon-modal-body"><p class="mt-0">Any markup fits here. Tab stays inside the box, <kbd>Esc</kbd> closes it, and the pop-in stops under reduced motion.</p><p class="mb-0"><button type="button" class="toon-btn toon-btn-paper" data-toon-modal-close>Got it</button></p></div>
        </div>
      </dialog>
    </section>

    <section class="py-s6" aria-labelledby="k-let"><h2 id="k-let" class="toon-heading mb-s6 text-display2">Display type</h2>
      <p class="max-w-[60ch]">Display text is set in Bangers, a comic lettering face, with an ink outline and a hard shadow in the paired colour. <code>toon-type</code> wraps each letter in a span, so every other letter tilts a little. <code>toon-type-live</code> bobs them in turn, as the hero does, and <code>toon-type-flat</code> sets them straight for a figure.</p>
      <div class="grid gap-s3 text-display2 leading-none">
        <div>${letters('ABCDEFGHIJKLM', 'blue', { live: true })}</div>
        <div>${letters('NOPQRSTUVWXYZ', 'yellow')}</div>
        <div>${letters('0123456789 &?! +~%/', 'violet')}</div>
      </div>
      <p class="max-w-[60ch]">A figure on a card is the same type, flat, so a number reads as part of the drawing.</p>
      <div class="grid gap-s8 sm:grid-cols-3">
        <div class="toon-card" style="--toon-shadow:#ffd60a">${figure('214', 'blue', 'text-[52px]')}<span class="mt-s1 block text-footnote">a count</span></div>
        <div class="toon-card" style="--toon-shadow:#3d7bff">${figure('60 min', 'yellow', 'text-[52px]')}<span class="mt-s1 block text-footnote">a duration</span></div>
        <div class="toon-card" style="--toon-shadow:#ff3d3d">${figure('~70%', 'violet', 'text-[52px]')}<span class="mt-s1 block text-footnote">an estimate</span></div>
      </div>
    </section>

    <section class="py-s6" aria-labelledby="k-tok"><h2 id="k-tok" class="toon-heading mb-s6 text-display2">Colors</h2>
      <div class="flex flex-wrap gap-s3">
        ${swatch('ground', 'bg-toon-ground', 'text-toon-paper')}${swatch('blue', 'bg-toon-blue')}${swatch('red', 'bg-toon-red')}${swatch('yellow', 'bg-toon-yellow')}${swatch('violet', 'bg-toon-violet')}${swatch('paper', 'bg-toon-paper')}
      </div>
      <p class="max-w-[60ch]">Text on every fill is ink, at 5.1:1 or better. Paper text on the ground is 16:1.</p>
    </section>`;
  return layout({ title: 'toonish-ui', path: '/ui.html', current: 'UI kit', description: 'toonish-ui, the original cartoon component kit behind this site.', body });
}

export function notFound(): string {
  const body = `
    <section class="py-16">
      <h1 class="sr-only">Page not found</h1>
      <div class="text-hero leading-none">${letters('404!', 'red', { live: true })}</div>
      <p class="text-title3">There is no page at this address. The link may be mistyped, or the page may have moved when the site was rebuilt.</p>
      <a class="toon-btn" href="/">Go to the home page</a>
    </section>`;
  return layout({ title: 'Page not found', path: '/404.html', description: 'Page not found.', noindex: true, body });
}

/** Structured data for search engines and LLMs: a ProfilePage whose main entity is the person. */
export const personJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  url: `https://${site.domain}/`,
  mainEntity: {
    '@type': 'Person',
    name: site.name,
    url: `https://${site.domain}/`,
    jobTitle: 'Full-stack and infrastructure engineer',
    description: `${site.role} ${site.background}`,
    sameAs: [site.github, site.org],
    knowsAbout: ['AI agents', 'Terraform', 'Ansible', 'AWS', 'TypeScript', 'Bun', 'GitOps', 'Vault', 'Proxmox', 'Full-stack web development'],
  },
});

export function legal(slug: 'privacy' | 'terms'): string {
  const page = legalPages(Boolean(analyticsToken)).find((l) => l.slug === slug)!;
  const body = `
    <article class="py-s8">
      <h1 class="mt-0 leading-none">${letters(page.title, slug === 'privacy' ? 'blue' : 'yellow', { cls: 'text-display2' })}</h1>
      <p class="text-footnote">Last updated ${legalUpdated}</p>
      <div class="grid max-w-[68ch] gap-s6">${page.sections
        .map((s) => `
        <section><h2 class="mb-s2 mt-0 text-title2 font-bold">${esc(s.heading)}</h2>${s.paragraphs.map((t) => `<p class="my-s2">${md(t)}</p>`).join('')}</section>`)
        .join('')}
      </div>
    </article>`;
  return layout({ title: page.title, path: `/${slug}.html`, description: page.description, body });
}
