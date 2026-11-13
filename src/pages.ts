import { esc, md } from './html.ts';
import { HEX, PAIR, BADGE, burst, speedLines, letters, fitSize, figure, shot, stat, badge, chip, row, bars, kicker, strip, steps, sfx, deck, pager, portrait } from 'toonish-ui/markup';
import { thumb } from './illustrations/thumbs.ts';
import { hybridDiagram, hybridDiagramTall } from './illustrations/hybrid.ts';
import { legalPages, legalUpdated } from './legal.ts';
import { site, studies, featured, tags, fit, type Accent, type CaseStudy, type DataTable } from './content.ts';

/** A section heading in the display type. */
const lettered = (id: string, text: string, accent: Accent, cls: string) =>
  `<h2 id="${id}" class="m-0 ${cls}">${letters(text, accent, { cls: 'text-display2' })}</h2>`;

/** A table of words in the kit's paper panel. The first column heads each row. */
const dataTable = (t: DataTable) => `<div class="toon-table-wrap my-s6"><table class="toon-table toon-table-text"><caption class="sr-only">${esc(t.caption)}</caption><thead><tr>${t.columns.map((c) => `<th scope="col">${c.trim() ? esc(c) : '<span class="sr-only">Item</span>'}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row" class="font-bold">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;

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

const reviewBeat = (n: number, say: string, body: string, tag: string, fx = '') => `
  <li class="relative m-0 list-none pl-s6">
    <span class="toon-kicker-num absolute -left-[1.2rem] top-0" aria-hidden="true">${n}</span>
    ${fx ? `<p class="m-0 -mb-s2 text-right">${fx}</p>` : ''}
    ${say ? `<p class="toon-bubble toon-bubble-left m-0 mb-s4 w-fit font-comic text-title1 tracking-wide"><span class="sr-only">Pedro says: </span>${say}</p>` : ''}
    <p class="m-0 max-w-[52ch] text-toon-paper">${body}</p>
    <p class="m-0 mt-s2 font-mono text-caption1 text-toon-paper/80">${tag}</p>
  </li>`;
const rcpt = (href: string, text: string) => `receipt: <a class="toon-link" href="${href}">${text}</a>`;

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
<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any">
<meta name="staging-check" content="pet-913-hs1">
<link rel="manifest" href="/site.webmanifest">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/ibm-plex-sans-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/toonish.css">
<script src="/motion.js"></script>
</head>
<body class="toon-dots">
<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 toon-btn toon-btn-paper">Skip to content</a>
<div class="toon-page mx-auto max-w-5xl pl-s4 pb-16">
  <header class="flex items-center justify-between gap-s1 py-s4 min-[360px]:gap-s3 sm:py-s5">
    <a href="/" class="block shrink-0 no-underline" aria-label="pdlab home">${letters('pdlab', 'blue', { live: true, cls: 'text-[24px] min-[360px]:text-[30px] sm:text-[40px]' })}</a>
    ${nav(opts.current ?? '', opts.path)}
    <button type="button" class="toon-motion" data-motion-toggle aria-pressed="true"><span aria-hidden="true">✦</span><span class="toon-motion-label">Motion</span></button>
  </header>
  <main id="main">
${opts.body}
  </main>
  <footer class="toon-footer">
    <span class="block">${letters('pdlab', 'red', { live: true, cls: 'text-title1' })}</span>
    <p class="toon-footer-note text-subhead">Built with Bun, TypeScript and Tailwind on <a class="toon-link whitespace-nowrap" href="/ui.html">toonish-ui</a>, an original kit.</p>
    <nav aria-label="Footer"><ul class="toon-footer-links text-footnote">
      <li><a class="toon-link" href="${site.github}">GitHub</a></li>
      <li><a class="toon-link" href="/privacy.html" data-toon-modal>Privacy</a></li>
      <li><a class="toon-link" href="/terms.html" data-toon-modal>Terms</a></li>
    </ul></nav>
  </footer>
</div>
<script src="/toonish.js" defer></script>
<script src="/site.js" defer></script>${opts.scriptSrc ? `\n<script src="${opts.scriptSrc}" defer></script>` : ''}
${analyticsToken ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${esc(analyticsToken)}"}'></script>\n` : ''}</body>
</html>
`;
}

/** "Oct 2026": the month is enough, and it does not promise a precision the dates do not have. */
const month = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** A case-study card. The data attributes let the /work sort script order and filter without re-reading the page. */
const studyCard = (s: CaseStudy, i: number, label = '', h: 'h2' | 'h3' = 'h3', figureWidth = 280) => `
      <article class="toon-card toon-pop relative flex flex-col" data-study data-date="${s.date}" data-tag="${esc(s.tag)}" data-title="${esc(s.title)}" style="--toon-shadow:${HEX[s.accent]}; animation-delay:${120 * i}ms">
        ${label ? `<span class="toon-corner" style="background:${HEX[s.accent]}">${esc(label)}</span>` : ''}
        ${thumb(s.tag, s.accent)}
        <p class="m-0 flex flex-wrap items-center gap-s2"><span class="toon-badge ${BADGE[s.accent]}">${esc(s.tag)}</span><time class="text-footnote" datetime="${s.date}">${month(s.date)}</time></p>
        <${h} class="mb-s2 mt-s3 text-title2 font-bold leading-snug">${esc(s.title)}</${h}>
        <p class="my-0">${md(s.summary)}</p>
        <p class="mt-s4 mb-s4">${figure(s.stat.value, s.accent, 52, figureWidth)}<span class="mt-s1 block text-footnote">${esc(s.stat.label)}</span></p>
        <a class="toon-link mt-auto self-start" href="/work/${s.slug}.html">Read the case study<span class="sr-only">: ${esc(s.title)}</span></a>
      </article>`;

/** A case study by slug. The proof strip reads its figures from these, so a renamed or deleted study fails the build. */
export const bySlug = (slug: string): CaseStudy => {
  const s = studies.find((x) => x.slug === slug);
  if (!s) throw new Error(`home: the proof strip needs the case study "${slug}", and content/studies has none`);
  return s;
};

/** The merge count has no field of its own: it is one sentence in the merge-gate summary, and a test checks that it still says 1,200. */
const MERGED_PRS = '1,200+';

/** The closing question, rendered twice because the tail points up on a phone and left beside the headshot from `md`. */
const hiring = 'Hiring for AI automation or agent work?';

/** A compact case-study card for the row under the lead story: tag, date, title, figure and link. No summary. */
const compactCard = (s: CaseStudy, i: number) => `
        <article class="toon-card toon-pop flex flex-col" data-home="card" style="--toon-shadow:${HEX[s.accent]}; animation-delay:${120 * (i + 1)}ms">
          <p class="m-0 flex flex-wrap items-center gap-s2"><span class="toon-badge ${BADGE[s.accent]}">${esc(s.tag)}</span><time class="text-footnote" datetime="${s.date}">${month(s.date)}</time></p>
          <h3 class="mb-s3 mt-s3 text-title3 font-bold leading-snug">${esc(s.title)}</h3>
          <p class="mb-s4 mt-auto">${figure(s.stat.value, s.accent, 40, 200)}</p>
          <a class="toon-link self-start" href="/work/${s.slug}.html">Read the case study<span class="sr-only">: ${esc(s.title)}</span></a>
        </article>`;

export function home(): string {
  const gate = bySlug('agent-merge-gate');
  const rack = bySlug('rack-loss-recovery');
  const patching = bySlug('fleet-patching');
  const proof = strip(
    [
      { value: MERGED_PRS, label: 'pull requests merged through the gate', href: `/work/${gate.slug}.html` },
      { value: rack.stat.value, label: 'platform rebuilt from code after a rack loss', href: `/work/${rack.slug}.html` },
      { value: patching.stat.value, label: 'packages patched across 21 guests in one run', href: `/work/${patching.slug}.html` },
      { value: String(studies.length), label: 'case studies, all with numbers', href: '/work.html' },
    ],
    { label: 'Proof, each figure linked to its case study' },
  );
  const recent = studies.filter((s) => s !== featured).slice(0, 3);
  const body = `
    <section class="pt-s4 sm:pt-s6" aria-label="Introduction">
      <h1 class="sr-only">${esc(site.name)}. ${esc(site.role)}</h1>
      <div class="relative z-0 grid gap-s2 text-[20vw] leading-[.9] sm:text-[min(13vw,10rem)]" aria-hidden="true">
        <div class="flex flex-col gap-s2 sm:flex-row sm:gap-x-[.28em]"><div>${letters('I build', 'blue', { live: true })}</div><div>${letters('systems', 'yellow', { live: true })}</div></div>
        <div class="relative w-fit">${burst('red', 'toon-burst-hero')}${letters('with AI!', 'yellow', { live: true, cls: 'relative' })}</div>
      </div>
      <div class="mt-s6 grid items-start gap-s8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div class="min-w-0">
          <p class="m-0 flex flex-wrap items-center gap-x-s3 gap-y-s2"><span class="toon-caption text-title3">${esc(site.name)}</span><span class="text-subhead text-toon-paper/80">${esc(site.tagline)}</span></p>
          <p class="mt-s4 max-w-[38ch] text-title3">${esc(site.intro)}</p>
          <div class="mt-s6 flex flex-col gap-s4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-s6">
            <a class="toon-btn w-full text-center sm:w-auto" href="#work">See the work</a>
            <a class="toon-link" href="${site.org}">Browse the repos</a>
          </div>
        </div>
        <div class="relative z-10 md:-mt-24 lg:-mt-36">
          ${sfx('MERGE!', 'red', { size: 'sm', cls: 'absolute -bottom-s6 right-s4 z-10 md:text-[3.25rem]' })}
          <figure class="toon-frame toon-tilt-r m-0 bg-toon-ground">
            <span class="toon-caption absolute right-s3 top-s3">The lab</span>
            <svg viewBox="0 0 320 236" role="img" aria-label="A terminal: terraform plan reports no changes, and the merge lands after CI and review">
              <rect width="320" height="236" fill="#0c1240"/>
              <rect width="320" height="34" fill="#a995f0"/>
              <circle cx="22" cy="17" r="7" fill="#f2706a"/><circle cx="44" cy="17" r="7" fill="#f2c94c"/><circle cx="66" cy="17" r="7" fill="#5f8dff"/>
              <g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="15">
                <text x="18" y="70" fill="#5f8dff">$ terraform plan</text>
                <text x="18" y="96" fill="#eceff3">No changes. Your infrastructure</text>
                <text x="18" y="116" fill="#eceff3">matches the configuration.</text>
                <text x="18" y="152" fill="#f2c94c">$ gh pr merge --squash</text>
                <text x="18" y="178" fill="#eceff3">Merged after CI and review.</text>
                <text x="18" y="212" fill="#f2706a" class="toon-blink">$ _</text>
              </g>
            </svg>
          </figure>
        </div>
      </div>
    </section>

    <div class="mt-s8">${proof}</div>

    <section id="work" class="relative mt-16 scroll-mt-8 md:mt-24" aria-labelledby="work-h">
      ${sfx('SHIP!', 'blue', { size: 'lg', ghost: true, cls: 'absolute -top-[3.5rem] right-s2 text-[3.25rem] md:-top-[5.75rem] md:right-s6 md:text-[5rem]' })}
      ${kicker('01', 'The work', { link: { href: '/work.html', text: `All ${studies.length} case studies`, cls: 'hidden sm:inline' } })}
      ${lettered('work-h', 'Case studies', 'yellow', 'mb-s6 mt-s4 max-w-md')}
      <article class="toon-card toon-pop relative grid items-center gap-s6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-s8 md:p-s8" data-home="lead" style="--toon-shadow:${HEX[featured.accent]}">
        <span class="toon-corner" style="background:${HEX[featured.accent]}">Featured</span>
        <div class="min-w-0">${thumb(featured.tag, featured.accent)}</div>
        <div class="min-w-0">
          <p class="m-0 flex flex-wrap items-center gap-s2"><span class="toon-badge ${BADGE[featured.accent]}">${esc(featured.tag)}</span><time class="text-footnote" datetime="${featured.date}">${month(featured.date)}</time></p>
          <h3 class="mb-s3 mt-s3 text-title1 font-bold leading-snug">${esc(featured.title)}</h3>
          <p class="my-0">${md(featured.summary)}</p>
          <p class="mb-s4 mt-s4">${figure(featured.stat.value, featured.accent, 52, 280)}<span class="mt-s1 block text-footnote">${esc(featured.stat.label)}</span></p>
          <a class="toon-link" href="/work/${featured.slug}.html">Read the case study<span class="sr-only">: ${esc(featured.title)}</span></a>
        </div>
      </article>
      <div class="mt-s6 md:mt-s8">${deck(recent.map(compactCard), { label: 'More recent case studies', cols: 3 })}</div>
      <p class="mt-s6"><a class="toon-btn toon-btn-yellow" href="/work.html">All ${studies.length} case studies<span class="sr-only">, sortable by date and topic</span></a></p>
    </section>

    <section id="how" class="mt-16 scroll-mt-8 md:mt-24" aria-labelledby="how-h">
      ${kicker('02', 'The method')}
      ${lettered('how-h', 'How I work', 'blue', 'mb-s6 mt-s4 max-w-sm')}
      <div class="relative">
      ${sfx('CLICK!', 'yellow', { size: 'sm', corner: true })}
      ${steps(
        [
          { title: 'One task, one session, one branch.', body: 'I treat AI agents like a team, not a tool. Each task gets its own session and its own branch.' },
          { title: 'Nothing merges unreviewed.', body: 'Every pull request gets a review, and no session approves its own work.' },
          { title: 'Declared, not hand-run.', body: 'Terraform builds it, Ansible configures it, and a repair is a config change before it is ever a script.' },
        ],
        { label: 'How I work, in three steps' },
      )}
      </div>
      <div class="mt-s8 grid items-start gap-s8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <figure class="relative m-0 min-w-0">
          ${sfx('DEPLOY!', 'violet', { size: 'sm', corner: true, cls: 'md:text-[2.5rem]' })}
          <div class="toon-frame relative bg-toon-ground" data-home="window">
            <div class="flex items-center gap-s2 border-0 border-b-2 border-solid border-toon-ink bg-toon-violet px-s4 py-s2" aria-hidden="true">
              <span class="h-3.5 w-3.5 rounded-full bg-toon-red"></span><span class="h-3.5 w-3.5 rounded-full bg-toon-yellow"></span><span class="h-3.5 w-3.5 rounded-full bg-toon-blue"></span>
            </div>
            <span class="toon-caption m-s3 inline-block">Hybrid by design</span>
            <div class="sm:hidden">${hybridDiagramTall()}</div>
            <div class="hidden sm:block">${hybridDiagram()}</div>
          </div>
          <figcaption class="mt-s4 max-w-[60ch] text-subhead">When a check reports success, it also says what it examined.</figcaption>
        </figure>
        <div class="min-w-0">
          <h3 class="mb-s3 mt-0 text-title2 font-bold text-toon-yellow">The stack</h3>
          <div class="toon-list toon-list-stack" role="list" data-home="stack">
            ${STACK.map((r) => row(r).replace('<div class="toon-row">', '<div class="toon-row" role="listitem">')).join('\n            ')}
          </div>
        </div>
      </div>
    </section>

    <section id="review" class="mt-16 scroll-mt-8 md:mt-24" aria-labelledby="review-h">
      ${kicker('03', 'The review')}
      ${lettered('review-h', "I work for this guy. Here's my review.", 'red', 'mt-s4 max-w-md')}
      <figure class="toon-panel toon-tilt-l relative m-0 mt-s6 max-w-[34rem]" style="--toon-shadow:${HEX.yellow}">
        <p class="m-0 font-comic text-[2.5rem] leading-[1.05] tracking-wide md:text-[3.25rem]"><span aria-hidden="true">“</span>He decides in three words. I write three hundred to earn them.<span aria-hidden="true">”</span></p>
        <p class="m-0 mt-s4 text-title2 font-bold" role="img" aria-label="Four out of five stars"><span aria-hidden="true">★★★★☆</span> <span class="text-toon-muted">would be five, but he rejected my first font set</span></p>
        <figcaption class="mt-s4 font-bold">— Claude, AI model. Works for Pedro. Unpaid.</figcaption>
        <p class="m-0 mt-s3 font-mono text-caption1 text-toon-muted">Written by Claude from project notes. Pedro reviewed it.</p>
      </figure>
      <p class="mb-0 mt-s8 max-w-[52ch] text-title3 font-bold text-toon-yellow">The long version, with receipts:</p>
      <ol class="m-0 mt-s6 ml-s4 grid gap-s8 border-0 border-l-toon border-solid border-toon-yellow p-0" role="list">
        ${reviewBeat(1, 'Merge all.', 'He hates pasting prompts for jobs that don’t need him. So he built a lab where I do the typing and he does the deciding. “Lock in A” is a complete design meeting.', `${rcpt('/work/ending-prompt-handoffs.html', 'ending the prompts')} · quotes: banter`)}
        ${reviewBeat(2, '', 'He reviews on his phone. My desktop tests passed. His thumb found a sideways scroll trap anyway. The cards are a swipe deck now, and the page scrolls.', 'banter: no public receipt')}
        ${reviewBeat(3, 'Looks AI.', 'Cream paper: rejected. Fancy fonts: rejected. Template grids: rejected. Several font sets died before Bangers and IBM Plex survived. He was right each time, which is annoying.', 'banter: no public receipt')}
        ${reviewBeat(4, 'I’m dramatic.', 'His words, not mine. Then a RAID controller caught fire, and the platform came back from code and backups in about four hours. Some of the drama is earned.', rcpt('/work/rack-loss-recovery.html', 'the rack loss'))}
      </ol>
      <p class="toon-caption toon-tilt-r mt-s8 normal-case">Verdict: demanding, fast, allergic to templates. Would take the job again. Nobody asked me.</p>
      <p class="mt-s4 max-w-[60ch] font-mono text-caption1 text-toon-paper/80">Written by Claude, an AI model made by Anthropic, from project notes and pull requests. Pedro reviewed it before it shipped. Lines marked banter have no public receipt.</p>
    </section>

    <section id="about" class="mt-16 scroll-mt-8 md:mt-24" aria-labelledby="about-h">
      <div class="toon-panel">
        <h2 id="about-h" class="sr-only">About ${esc(site.name)}</h2>
        ${kicker('04', 'About')}
        <div class="mt-s6 grid items-center gap-s8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-16">
          <figure class="toon-tilt-l relative m-0 w-[200px] max-w-full justify-self-start pb-s3">
            ${portrait({ src: '/pedro-cutout.webp', alt: 'Pedro Delgadillo, in a black blazer and black t-shirt, on a light grey studio backdrop', width: 640, height: 768, backdrop: 'paper', accent: 'red' })}
            <figcaption class="toon-caption absolute -bottom-s1 left-s3">${esc(site.name)}</figcaption>
          </figure>
          <div class="min-w-0">
            <div class="toon-bubble toon-bubble-up toon-pop mt-s2 max-w-none md:hidden"><p class="m-0 text-title2 font-bold">${hiring}</p></div>
            <div class="toon-bubble toon-bubble-left toon-pop hidden max-w-none md:block"><p class="m-0 text-title2 font-bold">${hiring}</p></div>
            <p class="mb-0 mt-s6 max-w-[60ch]">${esc(site.background)}</p>
            <div class="mt-s6 flex flex-col gap-s4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-s6">
              <a class="toon-btn toon-btn-yellow toon-wiggle w-full text-center sm:w-auto" href="${site.linkedin}">Hire me: message on LinkedIn</a>
              <a class="toon-link" href="${site.github}">Find me on GitHub</a>
            </div>
          </div>
        </div>
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
          <div id="study-tags" class="toon-nav toon-nav-wrap" role="group" aria-labelledby="study-tags-label" data-toon-toggle>
            <button type="button" data-tag="" aria-pressed="true">All</button>${tags.map((g) => `<button type="button" data-tag="${esc(g)}" aria-pressed="false">${esc(g)}</button>`).join('')}
          </div>
        </div>
      </div>
      <p id="study-status" class="sr-only" role="status" aria-live="polite"></p>
      <div id="study-list" class="mt-s8 grid gap-s6 sm:grid-cols-2 lg:grid-cols-3">${studies.map((s, i) => studyCard(s, i, '', 'h2', 240)).join('')}
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

/** An id from a heading: lower case, hyphens between runs of letters and digits. */
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';

/** One id per heading, unique on the page. `reserved` holds ids the page already uses, so a heading never takes one. */
export const sectionIds = (headings: string[], reserved: string[] = ['main', 'hire-h', 'contents']): string[] => {
  const used = new Set(reserved);
  return headings.map((h) => {
    const base = slugify(h);
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  });
};

/** The result section is the one light block in the page's text: a heading that starts with Result or Outcome. */
export const isResultHeading = (h: string) => /^(result|outcome)/i.test(h.trim());

const partNo = (i: number) => String(i + 1).padStart(2, '0');

/** The contents list, shared by the desktop rail and the phone disclosure. `onPaper` picks the text colours. */
const contents = (items: { id: string; heading: string }[], onPaper: boolean) =>
  `<ol class="m-0 grid list-none gap-s3 p-0">${items
    .map((x, i) => `<li class="flex items-baseline gap-s3"><span class="font-mono text-footnote font-bold ${onPaper ? 'text-toon-muted' : 'text-toon-yellow'}">${partNo(i)}</span><a class="toon-link" href="#${x.id}">${esc(x.heading)}</a></li>`)
    .join('')}</ol>`;

/** The stack on the home page, as rows of the kit's list: a short category, the tool, and what it is for. */
const STACK = [
  { lead: 'Compute', title: 'Proxmox, three nodes', sub: 'built to the shape of AWS' },
  { lead: 'IaC', title: 'Terraform and Ansible', sub: 'deployed by GitOps' },
  { lead: 'Secrets', title: 'Vault', sub: 'reached from CI by OIDC' },
  { lead: 'Runtime', title: 'Bun and TypeScript', sub: 'for services and bots' },
  { lead: 'AI', title: 'Claude and local Qwen models', sub: 'for the agents' },
];

/** The closing panel: why the work fits a hiring team, the skills, and the call to action. */
const closing = (s: CaseStudy) => `
      <aside class="toon-panel mt-16" style="--toon-shadow:${HEX[s.accent]}" aria-label="Why it matters, and the next step">
        <div class="grid gap-s8 lg:grid-cols-2 lg:gap-16">
          <div class="min-w-0">
            ${fit[s.slug] ? `<h2 class="mb-s3 mt-0 text-title2 font-bold">Why it matters for hiring teams</h2>
            <p class="mb-s6 mt-0">${md(fit[s.slug])}</p>` : ''}
            <h2 class="mb-s3 mt-0 text-title2 font-bold">Skills shown</h2>
            <ul class="m-0 flex list-none flex-wrap gap-s2 p-0">${s.skills.map((k) => `<li class="toon-badge toon-badge-violet">${esc(k)}</li>`).join('')}</ul>
          </div>
          <div class="min-w-0 border-t-toon border-toon-ink pt-s6 lg:border-l-toon lg:border-t-0 lg:pl-16 lg:pt-0">
            <h2 id="hire-h" class="mb-s3 mt-0 text-title2 font-bold">Hiring for AI automation or forward-deployed engineering?</h2>
            <p class="mb-s4 mt-0">I build agents and automations with the limits and checks that keep them safe, and I run them on my own platform every day. Send me the role and I will tell you how my work fits it.</p>
            <p class="m-0 flex flex-col gap-s4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-s6"><a class="toon-btn toon-btn-yellow w-full text-center sm:w-auto" href="${site.linkedin}">Message me on LinkedIn</a><a class="toon-link" href="${site.github}">See my code on GitHub</a></p>
          </div>
        </div>
      </aside>`;

export function study(s: CaseStudy): string {
  const i = studies.indexOf(s);
  const next = studies[(i + 1) % studies.length];
  const prev = studies[(i + studies.length - 1) % studies.length];
  const ids = sectionIds(s.sections.map((x) => x.heading));
  const toc = s.sections.map((x, k) => ({ id: ids[k], heading: x.heading }));
  const section = (sec: CaseStudy['sections'][number], k: number) => {
    const panel = isResultHeading(sec.heading);
    const shots = sec.shots ?? [];
    return `
        <section id="${ids[k]}" class="scroll-mt-s8 min-w-0 md:grid md:grid-cols-[3.5rem_minmax(0,1fr)] md:gap-x-s6${panel ? ' relative toon-panel' : ''}"${panel ? ` style="--toon-shadow:${HEX[s.accent]}"` : ''}>${panel ? `
          ${sfx('SHIP!', 'red', { size: 'sm', corner: true, cls: 'md:text-[2.5rem]' })}` : ''}
          <div class="toon-kicker mb-s3 max-w-[7rem] md:mb-0 md:max-w-none md:self-start md:pt-s2"><span class="toon-kicker-num">${partNo(k)}</span><span class="toon-kicker-rule md:hidden" aria-hidden="true"></span></div>
          <div class="min-w-0 md:col-start-2 md:max-w-[68ch]">
            <h2 class="mb-s4 mt-0 font-display text-title1 font-normal${panel ? ' text-toon-ink' : ''}"${panel ? '' : ` style="color:${HEX[s.accent]}"`}>${esc(sec.heading)}</h2>
            ${sec.paragraphs.map((p, n) => `<p class="mb-s3 mt-0${k === 0 && n === 0 ? ' text-title3' : ''}">${md(p)}</p>`).join('\n            ')}
            ${sec.table ? dataTable(sec.table) : ''}
          </div>${shots.length ? `
          <div class="mt-s6 grid min-w-0 gap-s8 md:col-start-2 lg:col-span-2 lg:col-start-1">
            ${shots.map((h, n) => shot({ src: `/studies/${s.slug}/${h.file}`, alt: h.alt, width: h.width, height: h.height, caption: h.caption, badge: h.badge, transcript: h.transcript, accent: s.accent, href: `/studies/${s.slug}/${h.file}`, hrefLabel: `Open the full-size picture: ${h.alt}`, hint: 'Tap to enlarge', corner: shots.length > 1 ? `${n + 1} / ${shots.length}` : undefined, cls: `min-w-0 max-w-full ${n % 2 ? 'lg:-rotate-1' : 'lg:rotate-1'}` })).join('\n            ')}
          </div>` : ''}
        </section>`;
  };
  const body = `
    <article class="py-s8">
      <a class="toon-link" href="/work.html">All case studies</a>
      <header class="mt-s6 grid gap-s8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end lg:gap-x-12">
        <div class="min-w-0">
          <p class="m-0 flex flex-wrap items-center gap-s2"><span class="toon-badge ${BADGE[s.accent]}">${esc(s.tag)}</span><time class="text-footnote" datetime="${s.date}">${month(s.date)}</time></p>
          <h1 class="mt-s4 leading-none">${letters(s.title, s.accent, { flat: true, cls: 'text-display2 leading-[1.05]' })}</h1>
          <p class="mt-s4 max-w-[60ch] text-title3">${md(s.summary)}</p>
        </div>
        <aside class="toon-panel relative z-10 mt-s3 w-full max-w-sm p-s5 text-center lg:-mb-s6 lg:mt-0 lg:max-w-none lg:rotate-2" style="--toon-shadow:${HEX[PAIR[s.accent]]}" aria-label="Key result">
          <span class="toon-caption absolute -top-s3 left-s4">The result</span>
          <div class="pt-s2">${figure(s.stat.value, s.accent, 72, 190)}</div>
          <span class="mt-s2 block text-footnote">${esc(s.stat.label)}</span>
        </aside>
      </header>
      ${s.facts ? `<div class="toon-stats mt-s8 lg:mt-12" role="group" aria-label="Key figures">${s.facts.map((f) => stat(f.label, f.value, f.detail)).join('')}</div>` : ''}
      <details class="mt-s8 rounded-toon border-toon border-toon-ink bg-toon-paper px-s4 py-s3 text-toon-ink lg:hidden">
        <summary class="cursor-pointer font-bold">In this study (${toc.length} parts)</summary>
        <div class="mt-s3">${contents(toc, true)}</div>
      </details>
      <div class="mt-s8 grid gap-s8 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-x-12">
        <div class="grid min-w-0 gap-12 md:gap-16">${s.sections.map(section).join('')}
        </div>
        <nav id="contents" class="hidden lg:sticky lg:top-s6 lg:block lg:self-start" aria-label="In this study">
          <p class="mb-s3 mt-0 font-mono text-footnote font-bold uppercase tracking-wider">In this study</p>
          <div class="border-l-toon border-toon-mist pl-s4">${contents(toc, false)}</div>
        </nav>
      </div>
      ${closing(s)}
      ${pager({ label: 'Case studies', cls: 'mt-16', prev: { href: `/work/${prev.slug}.html`, title: prev.title }, next: { href: `/work/${next.slug}.html`, title: next.title } })}
    </article>`;
  return layout({ title: s.title, path: `/work/${s.slug}.html`, current: 'Work', description: s.summary.replace(/`/g, ''), body });
}

export function kit(): string {
  const swatch = (name: string, cls: string, text = 'text-toon-ink') =>
    `<div class="grid h-16 w-full place-items-end justify-start rounded-toon border-toon border-toon-ink ${cls} p-s2 text-caption1 font-bold ${text}">${name}</div>`;
  const body = `
    <section class="py-s8">
      <h1 class="sr-only">toonish-ui</h1>
      <div class="text-hero leading-[.9]">${letters('toonish-ui', 'yellow', { live: true })}</div>
      <p class="mt-s4 max-w-[60ch] text-title3">The component kit this site is built on. Calm comic-book panels: thin ink outlines, short hard shadows and a gentle lift on hover, in blue, red, yellow and violet on deep navy. Every animation stops when you ask your system for reduced motion.</p>
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
        <div class="toon-card relative"><span class="toon-corner" aria-hidden="true">01</span><span class="toon-badge">Badge</span><p>A paper card lifts a little when you point at it. A <code>toon-corner</code> labels or numbers it.</p><a class="toon-link" href="/ui.html">A link</a></div>
        <div class="toon-card"><span class="toon-badge toon-badge-blue">Blue</span><p>Its shadow color comes from <code>--toon-shadow</code>.</p></div>
        <div class="toon-card"><span class="toon-badge toon-badge-yellow">Yellow</span> <span class="toon-badge toon-badge-violet">Violet</span><p>Badges sit on any surface.</p></div>
      </div>
    </section>

    <section class="py-s6" aria-labelledby="k-comic"><h2 id="k-comic" class="toon-heading mb-s6 text-display2">Panels, captions, bursts</h2>
      <div class="grid gap-s8 sm:grid-cols-[1fr_auto] items-start">
        <div class="relative">${speedLines('toon-speed-hero')}<div class="toon-frame p-s6 text-toon-ink"><span class="toon-caption absolute left-s3 top-s3">Caption</span><p class="mb-0 mt-s8">A <code>toon-frame</code> is a comic panel: off-white, ink border, short hard shadow. <code>toon-speed</code> fans speed lines behind it, and a <code>toon-caption</code> is the yellow box a narrator speaks from.</p></div></div>
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
      <p class="mb-s6 max-w-[60ch]">Headings and figures are set in IBM Plex Sans bold, in the accent colour. Badges, chips and labels use IBM Plex Mono. <code>toon-type-comic</code> switches to Bangers with an ink outline and a short shadow in the paired colour, for the logo and the hero, and tilts every other letter a little. <code>toon-type-flat</code> sets them straight.</p>
      <div class="grid gap-s3 text-display2 leading-none">
        <div>${letters('ABCDEFGHIJKLM', 'blue', { live: true })}</div>
        <div>${letters('NOPQRSTUVWXYZ', 'yellow')}</div>
        <div>${letters('0123456789 &?! +~%/', 'violet')}</div>
      </div>
      <p class="mb-s6 mt-s4 max-w-[60ch]">A figure on a card is the same sans, so a number reads as part of the card.</p>
      <div class="grid gap-s8 sm:grid-cols-3">
        <div class="toon-card" style="--toon-shadow:#f2c94c">${figure('214', 'blue', 52, 200)}<span class="mt-s1 block text-footnote">a count</span></div>
        <div class="toon-card" style="--toon-shadow:#5f8dff">${figure('60 min', 'yellow', 52, 200)}<span class="mt-s1 block text-footnote">a duration</span></div>
        <div class="toon-card" style="--toon-shadow:#f2706a">${figure('~70%', 'violet', 52, 200)}<span class="mt-s1 block text-footnote">an estimate</span></div>
      </div>
    </section>

    <section class="py-s6" aria-labelledby="k-data"><h2 id="k-data" class="toon-heading mb-s6 text-display2">Figures, rows, bars and tables</h2>
      <p class="mb-s6 max-w-[60ch]">For dashboards and case studies. Every figure below is made-up sample data. The helpers in <code>toonish-ui/markup</code> escape every string they render.</p>
      <div class="toon-stats">${stat('Orders', '12', 'Monday to Thursday')}${stat('On time', '94%', 'sample figure')}${stat('Busiest day', 'Tue')}</div>
      <p class="mb-0 mt-s6 flex flex-wrap items-center gap-s2">${badge('Open', 'blue', 12)}${badge('Held', 'yellow', 3)}${badge('Shipped', 'violet', 40)}${badge('Late', 'red', 2)}${badge('Archived', 'mist', 9)}${badge('Draft', 'paper')}${chip('A chip')}</p>
      <div class="toon-list mt-s6">${row({ lead: 'Nov 10', title: 'Order 1042', sub: 'Pending', aside: 'Web', dot: 'blue' })}${row({ lead: 'Nov 11', title: 'Order 1041', aside: 'Phone', dot: 'red' })}${row({ title: 'A row with no lead', aside: 'Store', dot: 'violet' })}</div>
      <div class="toon-card mt-s8">${bars({ label: 'Sample orders by day, stacked by channel, against a target of 5', target: 5, columns: [
        { label: 'Mon', sub: '9', segments: [{ value: 3, tone: 'blue', label: 'Web' }, { value: 1, tone: 'hatch', label: 'Returned' }] },
        { label: 'Tue', sub: '10', current: true, segments: [{ value: 4, tone: 'blue', label: 'Web' }, { value: 2, tone: 'red', label: 'Phone' }] },
        { label: 'Wed', sub: '11', segments: [{ value: 2, tone: 'red', label: 'Phone' }] },
        { label: 'Thu', sub: '12', segments: [] }] })}
        <ul class="toon-bars-key mt-s4"><li><i></i>Web</li><li><i style="--toon-dot:#f2706a"></i>Phone</li><li><i style="background:repeating-linear-gradient(135deg,#0a0a1f 0 2px,#eceff3 2px 6px)"></i>Returned</li></ul></div>
      <div class="toon-table-wrap mt-s8"><table class="toon-table"><caption class="sr-only">Sample orders by channel</caption><thead><tr><th scope="col">Day</th><th scope="col">Web</th><th scope="col">Phone</th><th scope="col">Returned</th></tr></thead><tbody><tr><td>Mon</td><td>3</td><td>0</td><td>1</td></tr><tr aria-current="date"><td>Tue</td><td>4</td><td>2</td><td>0</td></tr><tr><td>Wed</td><td>0</td><td>2</td><td>0</td></tr><tr><td>Thu</td><td>0</td><td>0</td><td>0</td></tr></tbody><tfoot><tr><td>Total</td><td>7</td><td>4</td><td>1</td></tr></tfoot></table></div>
      <p class="mt-s4 max-w-[60ch]">Add <code>toon-table-text</code> for cells that hold words, as the case studies do.</p>
    </section>

    <section class="py-s6" aria-labelledby="k-page"><h2 id="k-page" class="toon-heading mb-s6 text-display2">Page structure</h2>
      <p class="mb-s6 max-w-[60ch]">Parts for a page that reads in order, as the home page does. The figures and words below are made-up samples.</p>
      <h3 class="mb-s3 mt-0 text-title2 font-bold">Kicker</h3>
      <p class="mb-s4 mt-0 max-w-[60ch]"><code>toon-kicker</code> opens a section: a number chip, a short label, a rule to the right edge and an optional link. It takes the text colour, so it works on the ground and inside a <code>toon-panel</code>. The <code>kicker()</code> helper writes it.</p>
      ${kicker('01', 'Sample section', { link: { href: '/ui.html#k-page', text: 'A link' } })}
      <div class="toon-panel mt-s6">${kicker('02', 'Inside a panel')}<p class="mb-0 mt-s4">A <code>toon-panel</code> is a large paper section with an ink border, a hard shadow and generous padding. Set <code>--toon-shadow</code> to change the shadow colour.</p></div>
      <h3 class="mb-s3 mt-s8 text-title2 font-bold">Strip</h3>
      <p class="mb-s4 mt-0 max-w-[60ch]"><code>toon-strip</code> holds figure cells in one panel: four across from <code>sm</code>, two by two below. A cell with an <code>href</code> is one link. The <code>strip()</code> helper writes it.</p>
      ${strip([{ value: '12', label: 'sample count', href: '/ui.html#k-page' }, { value: 'Same day', label: 'sample duration', href: '/ui.html#k-page' }, { value: '~594', label: 'sample estimate' }, { value: '3', label: 'sample plain cell' }], { label: 'Sample figures' })}
      <h3 class="mb-s3 mt-s8 text-title2 font-bold">Steps</h3>
      <p class="mb-s4 mt-0 max-w-[60ch]"><code>toon-steps</code> is an ordered list of panels with an arrow between them: right in a row from <code>md</code>, down when stacked. The arrows are decoration. The <code>steps()</code> helper writes it.</p>
      ${steps([{ title: 'First step.', body: 'A sample line about the first step.' }, { title: 'Second step.', body: 'A sample line about the second step.' }, { title: 'Third step.', body: 'A sample line about the third step.' }], { label: 'Sample steps' })}
      <h3 class="mb-s3 mt-s8 text-title2 font-bold">Bubble tails and tilt</h3>
      <p class="mb-s6 mt-0 max-w-[60ch]"><code>toon-bubble-left</code> puts the tail on the left edge and <code>toon-bubble-up</code> on the top edge, so a bubble can point at a speaker beside or above it. <code>toon-tilt-l</code> and <code>toon-tilt-r</code> turn a block 2 degrees from <code>sm</code> up.</p>
      <div class="grid items-start gap-s8 sm:grid-cols-2">
        <div class="flex items-center gap-s8 pl-s6"><div class="toon-bubble toon-bubble-left max-w-none"><p class="m-0 font-bold">A tail on the left.</p></div></div>
        <div class="pt-s6"><div class="toon-bubble toon-bubble-up max-w-none"><p class="m-0 font-bold">A tail on top.</p></div></div>
        <div class="toon-frame toon-tilt-l p-s6 text-toon-ink"><span class="toon-caption">toon-tilt-l</span></div>
        <div class="toon-frame toon-tilt-r p-s6 text-toon-ink"><span class="toon-caption">toon-tilt-r</span></div>
      </div>
      <h3 class="mb-s3 mt-s8 text-title2 font-bold">Deck</h3>
      <p class="mb-s4 mt-0 max-w-[60ch]"><code>toon-deck</code> turns a row of cards into a pile you flip through on a phone, and a grid from <code>md</code>. Narrow the window, or open this page on a phone, to see the pile: swipe sideways, or use the buttons or the arrow keys. A vertical drag still scrolls the page, and a tap on a link in the top card still follows it. Without script the cards are a plain list. <code>data-toon-deck="always"</code> keeps the pile at every width. The <code>deck()</code> helper writes it. It does not escape the card HTML you pass it, so escape any text you put in a card.</p>
      ${deck(
        [
          { n: 'One', t: 'A sample card in the pile.' },
          { n: 'Two', t: 'The cards under the top one peek out behind it.' },
          { n: 'Three', t: 'Next on the last card returns to the first.' },
        ].map((c, k) => `<article class="toon-card flex flex-col" style="--toon-shadow:${[HEX.yellow, HEX.violet, HEX.blue][k]}"><h4 class="m-0 text-title3 font-bold">Sample card ${c.n}</h4><p class="mb-s4 mt-s3">${c.t}</p><a class="toon-link mt-auto self-start" href="/ui.html#k-page">A link in the card</a></article>`),
        { label: 'Sample cards, flip through them' },
      )}
      <h3 class="mb-s3 mt-s8 text-title2 font-bold">Pager</h3>
      <p class="mb-s4 mt-0 max-w-[60ch]"><code>toon-pager</code> is a pair of previous and next links in the shape of the deck's switcher. The title under each direction says where the link goes.</p>
      ${pager({ label: 'Sample pages', prev: { href: '/ui.html', title: 'A sample page before this one' }, next: { href: '/ui.html', title: 'A sample page after this one, with a longer title that is cut at two lines' } })}
      <h3 class="mb-s3 mt-s8 text-title2 font-bold">Sound effects</h3>
      <p class="mb-s4 mt-0 max-w-[60ch]"><code>toon-sfx</code> is a sound-effect word in the comic face. Each letter has its own turn, rise and size, set from its index by the <code>sfx()</code> helper, and drifts in turn. It is decoration: the helper hides it from readers and it takes no pointer. You position it, usually <code>absolute</code> in a <code>relative</code> parent. <code>toon-sfx-sm</code>, <code>toon-sfx-lg</code> and <code>toon-sfx-ghost</code> change the size or make it an outline for sitting behind content. <code>toon-sfx-corner</code> pins the word to the top right corner of a <code>relative</code> parent at every width. Latin letters only.</p>
      <div class="relative flex min-h-[9rem] flex-wrap items-center gap-x-s8 gap-y-s6 pl-s2">${sfx('POW!', 'red')}${sfx('click', 'yellow', { size: 'sm' })}${sfx('WHAM', 'violet', { size: 'lg' })}${sfx('SHIP!', 'blue', { size: 'lg', ghost: true })}</div>
    </section>

    <section class="py-s6" aria-labelledby="k-tok"><h2 id="k-tok" class="toon-heading mb-s6 text-display2">Colors</h2>
      <div class="grid grid-cols-3 gap-s3 sm:grid-cols-5 lg:grid-cols-10">
        ${swatch('ground', 'bg-toon-ground', 'text-toon-paper')}${swatch('blue', 'bg-toon-blue')}${swatch('red', 'bg-toon-red')}${swatch('yellow', 'bg-toon-yellow')}${swatch('violet', 'bg-toon-violet')}${swatch('paper', 'bg-toon-paper')}${swatch('muted', 'bg-toon-muted', 'text-toon-paper')}${swatch('mist', 'bg-toon-mist')}${swatch('rule', 'bg-toon-rule')}
      </div>
      <p class="mt-s4 max-w-[60ch]">Text on every fill is ink, at 5.1:1 or better. Paper text on the ground is 15.5:1. <code>muted</code> is secondary text on paper, <code>mist</code> is secondary text on the ground and the quiet fill for a closed state, and <code>rule</code> draws grid lines on paper.</p>
    </section>`;
  return layout({ title: 'toonish-ui', path: '/ui.html', current: 'UI kit', noindex: true, description: 'toonish-ui, the original cartoon component kit behind this site.', body });
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
    sameAs: [site.github, site.org, site.linkedin],
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
