import { esc, md } from './html.ts';
import { HEX, PAIR, BADGE, burst, speedLines, letters, fitSize, figure, shot, stat, badge, chip, row, list, skipLink, bars, kicker, strip, steps, sfx, deck, pager, portrait } from 'toonish-ui/markup';
import { SERVICE_ICONS } from './illustrations/service-icons.ts';
import { thumb } from './illustrations/thumbs.ts';
import { hybridDiagram, hybridDiagramTall } from './illustrations/hybrid.ts';
import { legalPages, legalUpdated } from './legal.ts';
import { site, studies, featured, fit, type Accent, type CaseStudy, type DataTable } from './content.ts';

/** A section heading in the display type. */
const lettered = (id: string, text: string, accent: Accent, cls: string) =>
  `<h2 id="${id}" class="m-0 ${cls}">${letters(text, accent, { cls: 'text-display2' })}</h2>`;

/** A table of words in the kit's paper panel. The first column heads each row. Three or more columns can outgrow a phone and scroll sideways, so that panel is a focusable, labelled region a keyboard can scroll. */
const dataTable = (t: DataTable) => `<div class="toon-table-wrap my-s6"${t.columns.length > 2 ? ` role="region" tabindex="0" aria-label="${esc(t.caption)}"` : ''}><table class="toon-table toon-table-text"><caption class="sr-only">${esc(t.caption)}</caption><thead><tr>${t.columns.map((c) => `<th scope="col">${c.trim() ? esc(c) : '<span class="sr-only">Item</span>'}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row" class="font-bold">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;

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

/** One page of the site: what the head needs, and the body the app puts inside <main>. Both the build and the browser read it. */
export interface Page {
  path: string;
  title: string;
  description: string;
  /** The main-nav item to mark as the current page. */
  current?: 'Home' | 'Work' | 'About';
  /** True for a page whose body the browser fetches from the page's own file instead of carrying it. Reading `body` on such a page builds it, so only the build does. */
  remote?: boolean;
  /** `html` is a string body, `work` is the sortable list (a Preact component), `lost` is the 404 card. */
  kind: 'html' | 'work' | 'lost';
  body: string;
  jsonLd?: object;
  noindex?: boolean;
}

/** The title in the tab and in search results. */
export const fullTitle = (p: Pick<Page, 'path' | 'title'>) => (p.path === '/' ? `${site.name}: systems built with AI` : `${p.title} | ${site.name}`);

/** The analytics token is a public build variable. The client bundle gets the same value through a define. */
export const analytics = analyticsToken;

/** "Oct 2026": the month is enough, and it does not promise a precision the dates do not have. */
export const month = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** A case-study card. The data attributes let the /work sort script order and filter without re-reading the page. */
export const studyCard = (s: CaseStudy, i: number, label = '', h: 'h2' | 'h3' = 'h3', figureWidth = 280) => `
      <article class="toon-card toon-pop relative flex flex-col" data-study data-date="${s.date}" data-tag="${esc(s.tag)}" data-title="${esc(s.title)}" style="--toon-shadow:${HEX[s.accent]}; animation-delay:${120 * i}ms">
        ${label ? `<span class="toon-corner" style="background:${HEX[s.accent]}">${esc(label)}</span>` : ''}
        ${thumb(s.tag, s.accent)}
        <p class="m-0 flex flex-wrap items-center gap-s2"><span class="toon-badge ${BADGE[s.accent]}">${esc(s.tag)}</span><time class="text-footnote" datetime="${s.date}">${month(s.date)}</time></p>
        <${h} class="mb-s2 mt-s3 text-title2 font-bold leading-snug">${esc(s.title)}</${h}>
        <p class="my-0">${md(s.summary)}</p>
        <p class="mt-s4 mb-s4">${figure(s.stat.value, s.accent, 52, figureWidth)}<span class="mt-s1 block text-footnote">${esc(s.stat.label)}</span></p>
        <a class="toon-link inline-flex min-h-[44px] items-center mt-auto self-start" href="/work/${s.slug}.html">Read the case study<span class="sr-only">: ${esc(s.title)}</span></a>
      </article>`;

/** A case study by slug. The proof strip reads its figures from these, so a renamed or deleted study fails the build. */
export const bySlug = (slug: string): CaseStudy => {
  const s = studies.find((x) => x.slug === slug);
  if (!s) throw new Error(`home: the proof strip needs the case study "${slug}", and content/studies has none`);
  return s;
};

/** The merge count has no field of its own: it is one sentence in the merge-gate summary, and a test checks that it still says 1,200. */
const MERGED_PRS = '1,200+';

/** Services I run and maintain, for the landing page. Technology only, with public-safe names: no hostnames, addresses, accounts or internal URLs. */
export const SERVICES = [
  { lead: 'Identity', title: 'Authentik single sign-on', sub: 'one login in front of the lab’s web tools', icon: SERVICE_ICONS.identity, aside: 'no per-app passwords' },
  { lead: 'Secrets', title: 'HashiCorp Vault', sub: 'short-lived credentials that CI and agents request at run time', icon: SERVICE_ICONS.secrets, aside: 'no stored CI secrets' },
  { lead: 'Delivery', title: 'Self-hosted CI runners', sub: 'GitHub Actions jobs that plan, apply and deploy', icon: SERVICE_ICONS.delivery, aside: 'plan on PR, apply on merge' },
  { lead: 'IaC', title: 'Terraform and Ansible', sub: 'every host and service declared, reviewed and applied from git', icon: SERVICE_ICONS.iac, aside: 'rack rebuilt in about 4 h' },
  { lead: 'Monitoring', title: 'Prometheus and Uptime Kuma', sub: 'metrics and uptime checks that feed the alerts', icon: SERVICE_ICONS.monitoring, aside: 'alerts, not dashboards' },
  { lead: 'Agents', title: 'pete-bot and the lab dashboard', sub: 'alerts, the merge desk and a phone dashboard that says what needs me', icon: SERVICE_ICONS.agents, aside: 'merge desk on duty' },
  { lead: 'Tools', title: 'Lab MCP servers and portal', sub: 'read-only tools that let Claude inspect the lab', icon: SERVICE_ICONS.tools, aside: 'no write access' },
  { lead: 'Work', title: 'Plane', sub: 'self-hosted tracker, written to through a queue so agents never hit its rate limit', icon: SERVICE_ICONS.work, aside: '60 calls a minute' },
  { lead: 'Data', title: 'MinIO and Postgres', sub: 'S3-compatible storage for state and backups, and the databases behind the services', icon: SERVICE_ICONS.data, aside: 'versioned state' },
  { lead: 'AI', title: 'Local models on Ollama', sub: 'Qwen for triage and embeddings, on two GPUs', icon: SERVICE_ICONS.ai, aside: '2 GPUs' },
  { lead: 'Cloud', title: 'AWS failover', sub: 'the dashboard and sign-in are being built to run in AWS when the lab is down', icon: SERVICE_ICONS.cloud, aside: 'in progress', dot: 'yellow' as const },
];

/** The closing question, rendered twice because the tail points up on a phone and left beside the headshot from `md`. */
const hiring = 'Hiring for AI automation or agent work?';

/** A compact case-study card for the row under the lead story: tag, date, title, figure and link. No summary. */
const compactCard = (s: CaseStudy, i: number) => `
        <article class="toon-card toon-pop flex flex-col" data-home="card" style="--toon-shadow:${HEX[s.accent]}; animation-delay:${120 * (i + 1)}ms">
          <p class="m-0 flex flex-wrap items-center gap-s2"><span class="toon-badge ${BADGE[s.accent]}">${esc(s.tag)}</span><time class="text-footnote" datetime="${s.date}">${month(s.date)}</time></p>
          <h3 class="mb-s3 mt-s3 text-title3 font-bold leading-snug">${esc(s.title)}</h3>
          <p class="mb-s4 mt-auto">${figure(s.stat.value, s.accent, 40, 200)}</p>
          <a class="toon-link inline-flex min-h-[44px] items-center self-start" href="/work/${s.slug}.html">Read the case study<span class="sr-only">: ${esc(s.title)}</span></a>
        </article>`;

export function landingPage(): Page {
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
            <a class="toon-link inline-flex min-h-[44px] items-center" href="${site.org}">Browse the repos</a>
          </div>
        </div>
        <div class="relative z-10 md:-mt-24 lg:-mt-36">
          ${sfx('MERGE!', 'red', { size: 'sm', cls: 'absolute -bottom-s6 right-s4 z-10 md:text-[3.25rem]' })}
          <figure class="toon-frame toon-tilt-r m-0 bg-toon-ground">
            <span class="toon-caption absolute right-s3 top-s3">The lab</span>
            <svg viewBox="0 0 320 236" role="img" aria-label="A terminal: terraform plan reports no changes, and the merge lands after CI and review">
              <rect width="320" height="236" fill="#0c1240"/>
              <rect width="320" height="34" fill="#a995f0"/>
              <circle cx="22" cy="17" r="7" fill="${HEX.red}"/><circle cx="44" cy="17" r="7" fill="${HEX.yellow}"/><circle cx="66" cy="17" r="7" fill="#5f8dff"/>
              <g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="15">
                <text x="18" y="70" fill="#5f8dff">$ terraform plan</text>
                <text x="18" y="96" fill="#eceff3">No changes. Your infrastructure</text>
                <text x="18" y="116" fill="#eceff3">matches the configuration.</text>
                <text x="18" y="152" fill="${HEX.yellow}">$ gh pr merge --squash</text>
                <text x="18" y="178" fill="#eceff3">Merged after CI and review.</text>
                <text x="18" y="212" fill="${HEX.red}" class="toon-blink">$ _</text>
              </g>
            </svg>
          </figure>
        </div>
      </div>
    </section>

    <div class="mt-s8">${proof}</div>

    <section id="work" class="relative mt-16 scroll-mt-8 md:mt-24" aria-labelledby="work-h">
      ${sfx('SHIP!', 'blue', { size: 'lg', ghost: true, cls: 'absolute -top-[3.5rem] right-s2 text-[3.25rem] md:-top-[5.75rem] md:right-s6 md:text-[5rem]' })}
      ${kicker('01', 'The work', { link: { href: '/work.html', text: `All ${studies.length} case studies`, cls: 'hidden min-h-[44px] items-center sm:inline-flex' } })}
      ${lettered('work-h', 'Case studies', 'yellow', 'mb-s6 mt-s4 max-w-md')}
      <article class="toon-card toon-pop relative grid items-center gap-s6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-s8 md:p-s8" data-home="lead" style="--toon-shadow:${HEX[featured.accent]}">
        <span class="toon-corner" style="background:${HEX[featured.accent]}">Featured</span>
        <div class="min-w-0">${thumb(featured.tag, featured.accent)}</div>
        <div class="min-w-0">
          <p class="m-0 flex flex-wrap items-center gap-s2"><span class="toon-badge ${BADGE[featured.accent]}">${esc(featured.tag)}</span><time class="text-footnote" datetime="${featured.date}">${month(featured.date)}</time></p>
          <h3 class="mb-s3 mt-s3 text-title1 font-bold leading-snug">${esc(featured.title)}</h3>
          <p class="my-0">${md(featured.summary)}</p>
          <p class="mb-s4 mt-s4">${figure(featured.stat.value, featured.accent, 52, 280)}<span class="mt-s1 block text-footnote">${esc(featured.stat.label)}</span></p>
          <a class="toon-link inline-flex min-h-[44px] items-center" href="/work/${featured.slug}.html">Read the case study<span class="sr-only">: ${esc(featured.title)}</span></a>
        </div>
      </article>
      <div class="mt-s6 md:mt-s8">${deck(recent.map(compactCard), { label: 'More recent case studies', cols: 3 })}</div>
      <p class="mt-s6 flex flex-col gap-s4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-s6"><a class="toon-btn toon-btn-yellow w-full text-center sm:w-auto" href="/work.html">All ${studies.length} case studies<span class="sr-only">, sortable by date and topic</span></a><a class="toon-link inline-flex min-h-[44px] items-center" href="/about.html">About me, and how I work</a></p>
    </section>

    <section id="services" class="mt-16 scroll-mt-8 md:mt-24" aria-labelledby="services-h">
      <div class="flex items-center justify-between gap-s4">${kicker('02', 'The upkeep')}${sfx('FIXED!', 'yellow', { size: 'sm', cls: 'md:text-[2.5rem]' })}</div>
      ${lettered('services-h', 'Services I maintain', 'blue', 'mb-s6 mt-s4 max-w-md')}
      <p class="mb-s6 mt-0 max-w-[52ch] text-title3">The platform under the case studies. I run each one, and each one is declared in code.</p>
      ${list(SERVICES.map((r) => row(r)), { label: 'Services I maintain', cls: 'toon-list-stack' }).replace('<div class="toon-list', '<div data-home="services" class="toon-list')}
    </section>`;
  return { path: '/', title: 'Home', current: 'Home', kind: 'html', description: `${site.name}. ${site.role} ${site.intro}`, body, jsonLd: personJsonLd() };
}

export function aboutPage(): Page {
  const body = `
    <section id="about" class="mt-16 scroll-mt-8 md:mt-24" aria-labelledby="about-h">
      <div class="toon-panel">
        <h1 id="about-h" class="sr-only">About ${esc(site.name)}</h1>
        ${kicker('01', 'About')}
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
              <a class="toon-link inline-flex min-h-[44px] items-center" href="${site.github}">Find me on GitHub</a>
            </div>
          </div>
        </div>
      </div>
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
          <h3 class="mb-s4 mt-0 pl-s2 leading-none"><span class="sr-only">The stack</span>${sfx('STACK!', 'yellow')}</h3>
          ${list(STACK.map((r) => row(r)), { label: 'The stack', cls: 'toon-list-stack' }).replace('<div class="toon-list', '<div data-home="stack" class="toon-list')}
        </div>
      </div>
    </section>

    <section id="review" class="mt-16 scroll-mt-8 md:mt-24" aria-labelledby="review-h">
      ${kicker('03', 'The review')}
      ${lettered('review-h', "I work for this guy. Here's my review.", 'red', 'mt-s4 max-w-md')}
      <figure class="toon-panel toon-tilt-l relative m-0 mt-s6 max-w-[34rem]" style="--toon-shadow:${HEX.yellow}">
        <p class="m-0 font-comic text-[2.5rem] leading-[1.05] tracking-wide md:text-[3.25rem]"><span aria-hidden="true">“</span>He decides in three words. I write three hundred to earn them.<span aria-hidden="true">”</span></p>
        <p class="m-0 mt-s4 text-title2 font-bold"><span role="img" aria-label="Four out of five stars">★★★★☆</span> <span class="text-toon-muted">would be five, but he rejected my first font set</span></p>
        <figcaption class="mt-s4"><span class="block font-bold">— Claude, AI model. Works for Pedro. Unpaid.</span><span class="mt-s3 block font-mono text-caption1 text-toon-muted">Written by Claude from notes I take on Pedro.</span></figcaption>
      </figure>
      <p class="mb-0 mt-s8 max-w-[52ch] text-title3 font-bold text-toon-yellow">The long version, with receipts:</p>
      <ol class="m-0 mt-s6 ml-s4 grid gap-s8 border-0 border-l-2 border-solid border-toon-yellow p-0" role="list">
        ${reviewBeat(1, 'Merge all.', 'He hates pasting prompts for jobs that don’t need him. So he built a lab where I do the typing and he does the deciding. “Lock in A” is a complete design meeting.', `${rcpt('/work/ending-prompt-handoffs.html', 'ending the prompts')} · quotes: banter`)}
        ${reviewBeat(2, 'I can’t scroll.', 'He reviews on his phone. My desktop tests passed. His thumb found a sideways scroll trap anyway. The cards are a swipe deck now, and the page scrolls.', 'banter: no public receipt')}
        ${reviewBeat(3, 'Looks AI.', 'Cream paper: rejected. Fancy fonts: rejected. Template grids: rejected. Several font sets died before Bangers and IBM Plex survived. He was right each time, which is annoying.', 'banter: no public receipt')}
        ${reviewBeat(4, 'I’m dramatic.', 'His words, not mine. Then a RAID controller caught fire, and the platform came back from code and backups in about four hours. Some of the drama is earned.', rcpt('/work/rack-loss-recovery.html', 'the rack loss'))}
        ${reviewBeat(5, 'Make it smooth.', 'It was past 2 AM when he said the dashboard sold him because its tabs swap without a hop or a skip. So this site became the same kind of app that night, and he will review it in the morning. I work the night shift.', 'banter: no public receipt')}
      </ol>
      <p class="toon-caption toon-tilt-r mt-s8 normal-case">Verdict: demanding, fast, allergic to templates. Would take the job again. Nobody asked me.</p>
    </section>`;
  return {
    path: '/about.html',
    title: 'About',
    current: 'About',
    kind: 'html',
    description: `About ${site.name}. ${site.background} How I work with AI agents, the stack I run, and a review written by Claude.`,
    body,
  };
}

/** The case-study index. The list is a Preact component (WorkIndex in app.tsx), so there is no string body. */
export const workDescription = () => `${studies.length} case studies on building systems with AI: agents, merge gates, short-lived access, local models and disaster recovery. Sort by date or filter by topic.`;
export const workPage = (): Page => ({ path: '/work.html', title: 'Case studies', current: 'Work', kind: 'work', description: workDescription(), body: '' });

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
  `<ol class="m-0 grid list-none p-0">${items
    .map((x, i) => `<li class="flex items-center gap-s3"><span class="font-mono text-footnote font-bold ${onPaper ? 'text-toon-muted' : 'text-toon-yellow'}">${partNo(i)}</span><a class="toon-link inline-flex min-h-[44px] items-center" href="#${x.id}">${esc(x.heading)}</a></li>`)
    .join('')}</ol>`;

/** The stack on the home page, as rows of the kit's list: a short category, the tool, and what it is for. */
const STACK = [
  { lead: 'Compute', title: 'Proxmox, three nodes', sub: 'built to the shape of AWS' },
  { lead: 'Cloud', title: 'AWS', sub: 'S3 and CloudFront serve this site, and a Lambda watchdog alerts when the lab goes quiet' },
  { lead: 'IaC', title: 'Terraform and Ansible', sub: 'deployed by GitOps' },
  { lead: 'Secrets', title: 'Vault', sub: 'reached from CI by OIDC' },
  { lead: 'Runtime', title: 'Bun and TypeScript', sub: 'for services and bots' },
  { lead: 'AI', title: 'Claude, Codex and local Qwen models', sub: 'for the agents and code review' },
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
          <div class="min-w-0 border-t-2 border-toon-ink pt-s6 lg:border-l-2 lg:border-t-0 lg:pl-16 lg:pt-0">
            <h2 id="hire-h" class="mb-s3 mt-0 text-title2 font-bold">Hiring for AI automation or forward-deployed engineering?</h2>
            <p class="mb-s4 mt-0">I build agents and automations with the limits and checks that keep them safe, and I run them on my own platform every day. Send me the role and I will tell you how my work fits it.</p>
            <p class="m-0 flex flex-col gap-s4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-s6"><a class="toon-btn toon-btn-yellow w-full text-center sm:w-auto" href="${site.linkedin}">Message me on LinkedIn</a><a class="toon-link inline-flex min-h-[44px] items-center" href="${site.github}">See my code on GitHub</a></p>
          </div>
        </div>
      </aside>`;

export function studyPage(s: CaseStudy): Page {
  // The case-study text is most of the bundle, so the browser does not carry it: it fetches the study's own page. Only the build reads `body`.
  return {
    title: s.title,
    path: `/work/${s.slug}.html`,
    current: 'Work',
    kind: 'html',
    remote: true,
    description: s.summary.replace(/`/g, ''),
    get body() {
      return studyBody(s);
    },
  };
}

function studyBody(s: CaseStudy): string {
  const i = studies.indexOf(s);
  const next = studies[(i + 1) % studies.length];
  const prev = studies[(i + studies.length - 1) % studies.length];
  const ids = sectionIds(s.sections.map((x) => x.heading));
  const toc = s.sections.map((x, k) => ({ id: ids[k], heading: x.heading }));
  const section = (sec: CaseStudy['sections'][number], k: number) => {
    const panel = isResultHeading(sec.heading);
    const shots = sec.shots ?? [];
    return `
        <section id="${ids[k]}" class="scroll-mt-s8 min-w-0 md:grid md:grid-cols-[3.5rem_minmax(0,1fr)] md:gap-x-s6 ${panel ? 'relative toon-panel' : ''}"${panel ? ` style="--toon-shadow:${HEX[s.accent]}"` : ''}>${panel ? `
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
      <a class="toon-link inline-flex min-h-[44px] items-center" href="/work.html">All case studies</a>
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
      <details class="mt-s8 rounded-toon border-2 border-toon-ink bg-toon-paper px-s4 text-toon-ink lg:hidden">
        <summary class="cursor-pointer py-[10px] font-bold">In this study (${toc.length} parts)</summary>
        <div class="pb-s2">${contents(toc, true)}</div>
      </details>
      <div class="mt-s8 grid gap-s8 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-x-12">
        <div class="grid min-w-0 gap-12 md:gap-16">${s.sections.map(section).join('')}
        </div>
        <nav id="contents" class="hidden lg:sticky lg:top-s6 lg:block lg:self-start" aria-label="In this study">
          <p class="mb-s3 mt-0 font-mono text-footnote font-bold uppercase tracking-wider">In this study</p>
          <div class="border-l-2 border-toon-mist pl-s4">${contents(toc, false)}</div>
        </nav>
      </div>
      ${closing(s)}
      ${pager({ label: 'Case studies', cls: 'mt-16', prev: { href: `/work/${prev.slug}.html`, title: prev.title }, next: { href: `/work/${next.slug}.html`, title: next.title } })}
    </article>`;
  return body;
}

/**
 * The page at the old kit address. The kit page left the site, so /ui.html is a small noindex page that sends a
 * visitor on to the kit's case study. A meta refresh needs no script and no CloudFront rule.
 */
export function kitMoved(): string {
  const to = '/work/toonish-ui-design-system.html';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moved | pdlab</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${to}">
<link rel="canonical" href="https://pdlab.dev${to}">
</head>
<body>
<p>The kit page moved. Read <a href="${to}">the toonish-ui case study</a> or see <a href="https://github.com/PeteDio-Labs/toonish-ui">the kit on GitHub</a>.</p>
</body>
</html>
`;
}

/**
 * The lines the 404 card shows, one per visit. Each has a sound-effect word (Latin letters only) and a joke
 * about how this site is built. The first is the one a visitor sees with scripts off.
 */
export const LOST: { word: string; accent: Accent; line: string }[] = [
  { word: '404!', accent: 'red', line: 'This page failed review, so it never merged to main.' },
  { word: 'DRIFT!', accent: 'yellow', line: 'The URL says a page lives here. The repo disagrees, and the repo wins.' },
  { word: 'POOF!', accent: 'violet', line: 'Plan: 0 to add, 0 to change, 0 to destroy. This page was never in state.' },
  { word: 'NOPE!', accent: 'blue', line: 'An agent offered to write this page on the spot. The merge gate said no.' },
  { word: 'WHIFF!', accent: 'red', line: 'You swung at a link and hit air. The link is the one that missed.' },
  { word: 'ZZZ', accent: 'violet', line: 'The watchdog checked this address. Nothing here has a heartbeat.' },
  { word: 'HUH?', accent: 'yellow', line: 'Even the local model has no memory of this page, and it makes things up.' },
  { word: 'OOPS!', accent: 'blue', line: 'The rack fire did not take this page. It was never on the rack.' },
];

/** The looks the 404 card comes in. Each borrows one comic or manga device, and each line gets the next look in turn. */
export const LOST_LOOKS = ['panel', 'bubble', 'burst', 'halftone'] as const;
type LostLook = (typeof LOST_LOOKS)[number];
type Lost = (typeof LOST)[number];

const LOST_WORD = 'text-[4.5rem] md:text-[7rem]';
const lostLook: Record<LostLook, (l: Lost) => string> = {
  // A tilted paper panel with the word lettered on it.
  panel: (l) => `
          <div class="toon-panel toon-tilt-l" style="--toon-shadow:${HEX[l.accent]}">
            <div class="pt-s5">${sfx(l.word, l.accent, { cls: LOST_WORD })}</div>
            <p class="mb-0 mt-s5 text-title3 font-bold">${esc(l.line)}</p>
          </div>`,
  // Manga speed lines streak in behind the word, and the line is spoken in a bubble that points up at it.
  bubble: (l) => `
          <div class="relative pt-s6">
            ${speedLines('inset-x-0 top-0 h-[9rem] w-full md:h-[12rem]')}
            <div class="relative pl-s3">${sfx(l.word, l.accent, { cls: LOST_WORD })}</div>
            <div class="toon-bubble toon-bubble-up mt-s8 max-w-none"><p class="m-0 text-title3 font-bold">${esc(l.line)}</p></div>
          </div>`,
  // The word sits on a starburst, with the line in a caption box under it.
  burst: (l) => `
          <div class="text-center">
            <div class="relative mx-auto grid aspect-square w-[min(100%,14rem)] place-items-center md:w-[16rem]">${burst(PAIR[l.accent], 'toon-burst-spin')}<div class="relative">${sfx(l.word, l.accent, { cls: 'text-[2.5rem] md:text-[3rem]' })}</div></div>
            <p class="toon-frame toon-tilt-r mx-auto mb-0 mt-s4 max-w-[28rem] p-s4 text-title3 font-bold text-toon-ink">${esc(l.line)}</p>
          </div>`,
  // A panel with a halftone corner, a narrator's caption box and the word as an outline behind the line.
  halftone: (l) => `
          <div class="toon-frame toon-tilt-r relative overflow-hidden p-s5 pt-s8 text-toon-ink md:p-s6 md:pt-s8">
            <div class="pointer-events-none absolute -right-s6 -top-s6 h-[11rem] w-[11rem] rounded-full bg-[radial-gradient(circle,#0a0a1f_1.6px,transparent_2px)] opacity-40 [background-size:9px_9px]" aria-hidden="true"></div>
            <span class="toon-caption absolute left-s3 top-s3">Meanwhile</span>
            <div class="relative pt-s4">${sfx(l.word, l.accent, { cls: LOST_WORD })}</div>
            <p class="relative mb-0 mt-s5 text-title3 font-bold">${esc(l.line)}</p>
          </div>`,
};

const CHEV = (d: string) => `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function notFoundPage(): Page {
  // Every line is in the page in its own look, and all but the first are hidden. the app shows one at random and
  // wires the button, so the page reads the same with scripts off: one card, one line and the way home.
  const cards = LOST.map((l, i) => {
    const look = LOST_LOOKS[i % LOST_LOOKS.length]!;
    return `
        <div data-lost-line data-lost-look="${look}"${i ? ' hidden' : ''}>${lostLook[look](l)}
        </div>`;
  }).join('');
  const body = `
    <section class="mx-auto max-w-[36rem] py-s8 md:py-16" data-lost>
      <h1 class="sr-only">Page not found</h1>
      <p class="mb-s5 mt-0 font-mono text-small uppercase tracking-wide text-toon-mist">Error 404 · page not found</p>
      <div class="flex min-h-[23rem] flex-col justify-center md:min-h-[24rem]" aria-live="polite">${cards}
      </div>
      <p class="mb-0 mt-s6">There is no page at this address. The link may be mistyped, or the page may have moved.</p>
      <nav class="toon-pager mt-s5" aria-label="Next steps">
        <a class="toon-pager-link toon-pager-prev" href="/"><span class="toon-pager-arrow" aria-hidden="true">${CHEV('M10 3 5 8l5 5')}</span><span class="toon-pager-text"><span class="toon-pager-dir">Go to the home page</span></span></a>
        <button class="toon-pager-link toon-pager-next cursor-pointer font-body" type="button" data-lost-next hidden><span class="toon-pager-arrow" aria-hidden="true">${CHEV('M6 3l5 5-5 5')}</span><span class="toon-pager-text"><span class="toon-pager-dir">Show another one</span></span></button>
      </nav>
    </section>`;
  return { title: 'Page not found', path: '/404.html', kind: 'lost', description: 'Page not found.', noindex: true, body };
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

export function legalPage(slug: 'privacy' | 'terms'): Page {
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
  return { title: page.title, path: `/${slug}.html`, kind: 'html', description: page.description, body };
}


/** Every page the app and the build know, by path. The 404 is not here: it answers any other path. */
export function pageFor(pathname: string): Page | undefined {
  const path = pathname.replace(/\/+$/, '').replace(/\.html$/, '') || '/';
  if (path === '/') return landingPage();
  if (path === '/work') return workPage();
  if (path === '/about') return aboutPage();
  if (path === '/privacy' || path === '/terms') return legalPage(path.slice(1) as 'privacy' | 'terms');
  if (path === '/404') return notFoundPage();
  const m = path.match(/^\/work\/([^/]+)$/);
  const s = m && studies.find((x) => x.slug === m[1]);
  return s ? studyPage(s) : undefined;
}
