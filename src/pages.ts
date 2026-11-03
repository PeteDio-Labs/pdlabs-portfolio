import { toonWord } from '../ui/lettering/toonletter.ts';
import { esc, md } from './html.ts';
import { site, studies, type Accent, type CaseStudy } from './content.ts';

const HEX: Record<Accent, string> = { cyan: '#19e6ff', orange: '#ff6b1a', yellow: '#ffe81a', violet: '#9b7bff' };
// Shadow paired with each accent, so neighbours never share one colour.
const PAIR: Record<Accent, Accent> = { cyan: 'orange', orange: 'violet', yellow: 'cyan', violet: 'cyan' };
const BADGE: Record<Accent, string> = { cyan: 'toon-badge-cyan', orange: '', yellow: 'toon-badge-yellow', violet: 'toon-badge-violet' };

/** Decorative lettering beside a real heading, sized by its wrapper. */
const letters = (text: string, accent: Accent = 'cyan', bounce = 1) =>
  toonWord(text, { core: HEX[accent], shadow: HEX[PAIR[accent]], bounce, label: false });

/** A figure on a paper card: the same lettering, heavier and flat, with the real text for readers. */
const figure = (value: string, accent: Accent, cls: string) =>
  `<span class="sr-only">${esc(value)}</span><span aria-hidden="true" class="block max-w-full ${cls} [&>svg]:w-auto [&>svg]:max-w-full">${toonWord(value, { core: HEX[accent], shadow: HEX[PAIR[accent]], bounce: 0, weight: 16, label: false })}</span>`;

/** A section heading drawn in the lettering, with the real text for readers and search. */
const lettered = (id: string, text: string, accent: Accent, cls: string) =>
  `<h2 id="${id}" class="m-0 ${cls}"><span class="sr-only">${esc(text)}</span><span aria-hidden="true" class="block [&>svg]:h-auto [&>svg]:w-full">${letters(text, accent, 0.7)}</span></h2>`;

const nav = (current: string) => {
  const items = [
    ['Work', '/#work'],
    ['About', '/#about'],
    ['UI kit', '/ui.html'],
  ];
  return `<nav class="toon-nav" aria-label="Main">${items
    .map(([label, href]) => `<a href="${href}"${label === current ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('')}</nav>`;
};

export function layout(opts: { title: string; description: string; path: string; current?: string; body: string }): string {
  const fullTitle = opts.path === '/' ? `${site.name}: systems built with AI` : `${opts.title} | ${site.name}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#12062a">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(opts.description)}">
<link rel="canonical" href="https://${site.domain}${opts.path}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(opts.description)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bowlby+One&family=DM+Sans:wght@400;700&display=swap">
<link rel="stylesheet" href="/toonish.css">
</head>
<body class="toon-dots">
<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 toon-btn toon-btn-paper">Skip to content</a>
<div class="mx-auto max-w-5xl px-s4 pb-16">
  <header class="flex flex-wrap items-center justify-between gap-s4 py-s5">
    <a href="/" class="block h-14 [&>svg]:h-full [&>svg]:w-auto" aria-label="pdlab home">${letters('pdlab', 'cyan', 0.6)}</a>
    ${nav(opts.current ?? '')}
  </header>
  <main id="main">
${opts.body}
  </main>
  <footer class="toon-footer">
    <span class="block h-9 [&>svg]:h-full [&>svg]:w-auto">${letters('pdlab', 'yellow', 0.4)}</span>
    <p class="m-0 text-subhead">Built with Bun, TypeScript and Tailwind on <a class="toon-link" href="/ui.html">toonish-ui</a>, an original kit. <a class="toon-link" href="${site.github}">GitHub</a></p>
  </footer>
</div>
</body>
</html>
`;
}

const studyCard = (s: CaseStudy, i: number) => `
      <article class="toon-card toon-pop relative flex flex-col" style="--toon-shadow:${HEX[s.accent]}; --toon-tilt:${i % 2 ? '1deg' : '-1.5deg'}; animation-delay:${120 * i}ms">
        <span class="toon-corner" style="background:${HEX[s.accent]}" aria-hidden="true">0${i + 1}</span>
        <span class="toon-badge ${BADGE[s.accent]} self-start">${esc(s.tag)}</span>
        <h3 class="mb-s2 mt-s3 text-title2 font-bold leading-snug">${esc(s.title)}</h3>
        <p class="my-0">${md(s.summary)}</p>
        <p class="mt-s4 mb-s4">${figure(s.stat.value, s.accent, '[&>svg]:h-14')}<span class="mt-s1 block text-footnote">${esc(s.stat.label)}</span></p>
        <a class="toon-link mt-auto self-start" href="/work/${s.slug}.html">Read the case study<span class="sr-only">: ${esc(s.title)}</span></a>
      </article>`;

export function home(): string {
  const body = `
    <section class="grid items-center gap-s8 py-s8 md:grid-cols-[1.5fr_1fr]">
      <div class="min-w-0">
        <h1 class="sr-only">${esc(site.name)}. ${esc(site.role)}</h1>
        <div class="w-full [&>svg]:h-auto [&>svg]:w-full">${letters('I build', 'cyan')}</div>
        <div class="w-full [&>svg]:h-auto [&>svg]:w-full">${letters('systems', 'yellow')}</div>
        <div class="w-3/4 [&>svg]:h-auto [&>svg]:w-full">${letters('with AI!', 'orange')}</div>
        <p class="mt-s6 flex flex-wrap items-baseline gap-x-s3 gap-y-s1"><span class="font-display text-title1 text-toon-yellow">${esc(site.name)}</span><span class="text-subhead text-toon-paper/80">${esc(site.tagline)}</span></p>
        <p class="mt-s4 max-w-[38ch] text-title3">${esc(site.intro)}</p>
        <div class="mt-s6 flex flex-wrap gap-s4">
          <a class="toon-btn" href="#work">See the work</a>
          <a class="toon-btn toon-btn-orange" href="${site.org}">Browse the repos</a>
        </div>
      </div>
      <figure class="toon-frame m-0 rotate-[1.5deg] transition duration-normal ease-bounce hover:rotate-0">
        <svg viewBox="0 0 320 236" role="img" aria-label="A terminal: terraform plan reports no changes, and the lab check passes">
          <rect width="320" height="236" fill="#12062a"/>
          <rect width="320" height="34" fill="#9b7bff"/>
          <circle cx="22" cy="17" r="7" fill="#ff6b1a"/><circle cx="44" cy="17" r="7" fill="#ffe81a"/><circle cx="66" cy="17" r="7" fill="#19e6ff"/>
          <g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="15">
            <text x="18" y="70" fill="#19e6ff">$ terraform plan</text>
            <text x="18" y="96" fill="#fff6e6">No changes. Your infrastructure</text>
            <text x="18" y="116" fill="#fff6e6">matches the configuration.</text>
            <text x="18" y="152" fill="#ffe81a">$ gh pr merge --squash</text>
            <text x="18" y="178" fill="#fff6e6">Merged after CI and review.</text>
            <text x="18" y="212" fill="#ff6b1a">$ _</text>
          </g>
        </svg>
      </figure>
    </section>

    <section id="work" class="scroll-mt-8 py-s8" aria-labelledby="work-h">
      ${lettered('work-h', 'Case studies', 'yellow', 'mb-s8 max-w-md')}
      <div class="grid gap-s8 sm:grid-cols-2">${studies.map(studyCard).join('')}
      </div>
    </section>

    <section id="about" class="scroll-mt-8 grid gap-s8 py-s8 md:grid-cols-[1fr_1fr]" aria-labelledby="about-h">
      <div class="min-w-0">
        ${lettered('about-h', 'How I work', 'cyan', 'mb-s6 max-w-sm')}
        <p class="mb-s4 mt-0 max-w-[60ch]">I treat AI agents like a team, not a tool. Each task gets its own session and its own branch. Nothing merges without a review, and no session approves its own work.</p>
        <p class="m-0 max-w-[60ch]">The infrastructure is declared, not hand-run: Terraform builds it, Ansible configures it, and a repair is a config change before it is ever a script. When a check reports success, it also says what it examined.</p>
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
        <div class="toon-bubble"><h2 id="contact-h" class="m-0 text-title2 font-bold">Want to talk systems?</h2></div>
        <a class="toon-btn toon-btn-yellow" href="${site.github}">Find me on GitHub</a>
      </div>
    </section>`;
  return layout({ title: 'Home', path: '/', current: 'Work', description: `${site.name}. ${site.role} ${site.intro}`, body });
}

export function study(s: CaseStudy): string {
  const i = studies.indexOf(s);
  const next = studies[(i + 1) % studies.length];
  const prev = studies[(i + studies.length - 1) % studies.length];
  const body = `
    <article class="py-s8">
      <a class="toon-link" href="/#work">All case studies</a>
      <header class="mb-s8 mt-s6 grid items-end gap-s6 md:grid-cols-[1fr_auto]">
        <div class="min-w-0">
          <span class="toon-badge ${BADGE[s.accent]}">${esc(s.tag)}</span>
          <h1 class="toon-heading mt-s4 text-display2" style="color:${HEX[s.accent]}; --toon-shade:${HEX[PAIR[s.accent]]}">${esc(s.title)}</h1>
          <p class="mt-s4 max-w-[60ch] text-title3">${md(s.summary)}</p>
        </div>
        <div class="toon-card m-0 w-full max-w-[18rem] text-center md:w-[16rem]" style="--toon-shadow:${HEX[PAIR[s.accent]]}">
          ${figure(s.stat.value, s.accent, 'flex justify-center [&>svg]:h-20')}
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
      <div class="w-full max-w-2xl [&>svg]:h-auto [&>svg]:w-full">${letters('toonish-ui', 'yellow')}</div>
      <p class="mt-s4 max-w-[60ch] text-title3">The component kit this site is built on. Ink outlines, hard offset shadows and a bounce, in four neon colors on deep violet. Every animation stops when you ask your system for reduced motion.</p>
    </section>

    <section class="py-s6" aria-labelledby="k-btn"><h2 id="k-btn" class="toon-heading mb-s6 text-display2">Buttons</h2>
      <div class="flex flex-wrap gap-s4">
        <button class="toon-btn" type="button">Cyan</button>
        <button class="toon-btn toon-btn-orange" type="button">Orange</button>
        <button class="toon-btn toon-btn-yellow" type="button">Yellow</button>
        <button class="toon-btn toon-btn-paper" type="button">Paper</button>
      </div>
    </section>

    <section class="py-s6" aria-labelledby="k-card"><h2 id="k-card" class="toon-heading mb-s6 text-display2">Cards, badges and links</h2>
      <div class="grid gap-s8 sm:grid-cols-3">
        <div class="toon-card relative"><span class="toon-corner" aria-hidden="true">01</span><span class="toon-badge">Badge</span><p>A paper card tilts a little and straightens when you point at it. A <code>toon-corner</code> numbers it.</p><a class="toon-link" href="/ui.html">A link</a></div>
        <div class="toon-card"><span class="toon-badge toon-badge-cyan">Cyan</span><p>Its shadow color comes from <code>--toon-shadow</code>.</p></div>
        <div class="toon-card"><span class="toon-badge toon-badge-yellow">Yellow</span> <span class="toon-badge toon-badge-violet">Violet</span><p>Badges sit on any surface.</p></div>
      </div>
    </section>

    <section class="py-s6" aria-labelledby="k-misc"><h2 id="k-misc" class="toon-heading mb-s6 text-display2">Nav, bubble, callout</h2>
      <div class="flex flex-wrap items-start gap-s8">
        <nav class="toon-nav" aria-label="Sample"><a href="/ui.html" aria-current="page">Current</a><a href="/ui.html">Other</a><a href="/ui.html">Third</a></nav>
        <div class="toon-bubble">A speech bubble with a tail.</div>
      </div>
      <div class="toon-callout mt-s8"><strong>Callout:</strong> violet by default, yellow with <code>toon-callout-yellow</code>.</div>
    </section>

    <section class="py-s6" aria-labelledby="k-let"><h2 id="k-let" class="toon-heading mb-s6 text-display2">Lettering</h2>
      <p class="max-w-[60ch]">Every display letter is an original centerline path, drawn as a shadow, an ink outline and a neon core. Each letter gets its own fixed tilt and lift. The pages render it at build time, so the lettering needs no font file and no script.</p>
      <div class="[&>svg]:h-auto [&>svg]:w-full">${letters('ABCDEFGHIJKLM', 'cyan')}</div>
      <div class="[&>svg]:h-auto [&>svg]:w-full">${letters('NOPQRSTUVWXYZ', 'yellow')}</div>
      <div class="w-4/5 [&>svg]:h-auto [&>svg]:w-full">${letters("0123456789 &?!", 'violet')}</div>
      <div class="w-3/5 [&>svg]:h-auto [&>svg]:w-full">${letters("+ ~ % / : , . ' -", 'orange')}</div>
      <p class="max-w-[60ch]">A figure on a card uses the same paths, heavier and flat, so a number reads as part of the drawing instead of a font.</p>
      <div class="grid gap-s8 sm:grid-cols-3">
        <div class="toon-card" style="--toon-shadow:#ff6b1a">${figure('214', 'cyan', '[&>svg]:h-14')}<span class="mt-s1 block text-footnote">a count</span></div>
        <div class="toon-card" style="--toon-shadow:#19e6ff">${figure('60 min', 'yellow', '[&>svg]:h-14')}<span class="mt-s1 block text-footnote">a duration</span></div>
        <div class="toon-card" style="--toon-shadow:#19e6ff">${figure('~70%', 'violet', '[&>svg]:h-14')}<span class="mt-s1 block text-footnote">an estimate</span></div>
      </div>
    </section>

    <section class="py-s6" aria-labelledby="k-tok"><h2 id="k-tok" class="toon-heading mb-s6 text-display2">Colors</h2>
      <div class="flex flex-wrap gap-s3">
        ${swatch('ground', 'bg-toon-ground', 'text-toon-paper')}${swatch('cyan', 'bg-toon-cyan')}${swatch('orange', 'bg-toon-orange')}${swatch('yellow', 'bg-toon-yellow')}${swatch('violet', 'bg-toon-violet')}${swatch('paper', 'bg-toon-paper')}
      </div>
      <p class="max-w-[60ch]">Text on every neon fill is ink, at 6.4:1 or better. Paper text on the ground is 18:1.</p>
    </section>`;
  return layout({ title: 'toonish-ui', path: '/ui.html', current: 'UI kit', description: 'toonish-ui, the original cartoon component kit behind this site.', body });
}

export function notFound(): string {
  const body = `
    <section class="py-16">
      <h1 class="sr-only">Page not found</h1>
      <div class="max-w-md [&>svg]:h-auto [&>svg]:w-full">${letters('404!', 'orange')}</div>
      <p class="text-title3">That page doesn't exist. It may have moved when the site was rebuilt.</p>
      <a class="toon-btn" href="/">Go to the home page</a>
    </section>`;
  return layout({ title: 'Page not found', path: '/404.html', description: 'Page not found.', body });
}
