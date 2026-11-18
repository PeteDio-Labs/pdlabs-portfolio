// Accessibility check of the built site: serves dist/, runs axe at WCAG 2.2 AA on every page at 390 and 1280 px, and checks
// what axe cannot see: the skip link is the first tab stop, one h1, one main, no sideways scroll at 320 px, and that
// every internal link target exists. It fails on any violation and prints what it examined. Run it with `bun run test:a11y`
// after `bun run build`. Set CHROMIUM_PATH to use a browser Playwright did not install.
import { chromium } from 'playwright-core';

const root = `${import.meta.dir}/../dist`;
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    if (pathname === '/__axe.js') return new Response(Bun.file(`${import.meta.dir}/../node_modules/axe-core/axe.min.js`), { headers: { 'content-type': 'text/javascript' } });
    if (pathname.includes('..')) return new Response('bad', { status: 400 });
    for (const p of [pathname, `${pathname}.html`, `${pathname}/index.html`]) {
      const f = Bun.file(root + p);
      if (p.endsWith('/') ? false : await f.exists()) return new Response(f);
    }
    return new Response(Bun.file(`${root}/404.html`), { status: 404, headers: { 'content-type': 'text/html' } });
  },
});

const pages = ['/', '/about.html', '/work.html', '/privacy.html', '/terms.html', '/no-such-page', ...(await Array.fromAsync(new Bun.Glob('work/*.html').scan(root))).sort().map((f) => `/${f}`)];
const fail: string[] = [];
let rules = 0, runs = 0, links = 0, measured = 0, modalRuns = 0, spaRuns = 0, spaSteps = 0;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  for (const [w, h] of [[390, 844], [1280, 800]] as const) {
    // Motion off: a colour caught mid-animation is not a contrast failure.
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    for (const path of pages) {
      const p = await ctx.newPage();
      await p.goto(server.url.origin + path, { waitUntil: 'load' });
      await p.addScriptTag({ url: '/__axe.js' });
      const r = await p.evaluate(() => (window as any).axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
      runs++; rules += r.passes.length;
      for (const v of r.violations) fail.push(`${path} @${w}: ${v.id} (${v.nodes.length}): ${v.help}; first ${v.nodes[0].target.join(' ')}: ${v.nodes[0].any[0]?.message ?? v.nodes[0].failureSummary ?? ''}`.slice(0, 400));
      await p.keyboard.press('Tab');
      const first = await p.evaluate(() => document.activeElement?.getAttribute('href') + ' ' + document.activeElement?.className);
      if (!first.startsWith('#main toon-skip')) fail.push(`${path} @${w}: the first tab stop is "${first}", not the skip link`);
      // Internal links: every same-site href must resolve to a built file, and every #fragment to an id on its page.
      for (const href of await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')!))].filter((h) => h.startsWith('/') || h.startsWith('#')))) {
        links++;
        const [file, hash] = href.startsWith('#') ? [path, href.slice(1)] : [href.split('#')[0]!, href.split('#')[1] ?? ''];
        const target = file === '/no-such-page' ? '/404.html' : file.endsWith('/') ? `${file}index.html` : file;
        const f = Bun.file(root + target);
        if (!(await f.exists())) { fail.push(`${path} @${w}: the link ${href} has no file in dist/`); continue; }
        if (hash && target.endsWith('.html') && !(await f.text()).includes(` id="${hash}"`)) fail.push(`${path} @${w}: the link ${href} names an id that ${target} does not have`);
      }
      const s = await p.evaluate(() => ({ h1: document.querySelectorAll('h1').length, main: document.querySelectorAll('main').length, lang: document.documentElement.lang }));
      if (s.h1 !== 1 || s.main !== 1 || !s.lang) fail.push(`${path} @${w}: ${s.h1} h1, ${s.main} main, lang "${s.lang}"`);
      // The modal is closed at rest, so the run above never reads it. On the home page, open Privacy and run axe again.
      if (path === '/') {
        await p.click('footer a[href="/privacy.html"]');
        await p.waitForSelector('dialog.toon-modal[open] .toon-modal-body section');
        const m = await p.evaluate(() => (window as any).axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
        modalRuns++;
        for (const v of m.violations) fail.push(`${path} @${w}, modal open: ${v.id} (${v.nodes.length}): ${v.help}; first ${v.nodes[0].target.join(' ')}: ${v.nodes[0].any[0]?.message ?? ''}`.slice(0, 400));
        const x = await p.evaluate(() => Math.round(document.querySelector('dialog[open] .toon-modal-x')!.getBoundingClientRect().height));
        if (x < 44) fail.push(`${path} @${w}, modal open: the Close button is ${x} px tall`);
      }
      await p.close();
    }
    await ctx.close();
  }
  // Client-side navigation: click through the nav and into a case study without a page load, and read each page the app swaps in.
  // The header must be the same node throughout, the title must follow the page, focus must land on the content, and the new
  // page must pass axe too, because it is the same markup reached a different way.
  for (const [w, h] of [[390, 844], [1280, 800]] as const) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => fail.push(`spa @${w}: page error: ${e.message}`));
    let loads = 0;
    p.on('load', () => loads++);
    await p.goto(server.url.origin + '/', { waitUntil: 'load' });
    await p.addScriptTag({ url: '/__axe.js' });
    await p.waitForFunction(() => document.getElementById('root')!.children.length > 0);
    await p.evaluate(() => { (document.querySelector('header') as HTMLElement).dataset.kept = 'yes'; });
    const steps: [string, string, string][] = [['nav a:text-is("About")', '/about.html', 'About'], ['nav[aria-label=Main] a:text-is("Work")', '/work.html', 'Case studies'], ['#study-list a >> nth=0', '', ''], ['nav[aria-label=Main] a:text-is("Home")', '/', 'systems built with AI']];
    for (const [sel, path, title] of steps) {
      await p.click(sel.startsWith('nav a') ? `nav[aria-label=Main] a:text-is("${sel.match(/"(.*)"/)![1]}")` : sel);
      if (path) await p.waitForFunction((x) => location.pathname === x, path); else await p.waitForFunction(() => location.pathname.startsWith('/work/'));
      await p.waitForFunction(() => document.getElementById('route-status')!.textContent!.includes('page loaded'));
      const st = await p.evaluate(() => ({ path: location.pathname, title: document.title, kept: document.querySelector('header')!.dataset.kept, focus: document.activeElement?.id, h1: document.querySelectorAll('h1').length, main: document.querySelectorAll('main').length }));
      spaSteps++;
      if (st.kept !== 'yes') fail.push(`spa @${w} ${st.path}: the header was replaced, not kept`);
      if (title && !st.title.includes(title)) fail.push(`spa @${w} ${st.path}: the title is "${st.title}", expected it to name "${title}"`);
      if (st.focus !== 'main') fail.push(`spa @${w} ${st.path}: focus is on "${st.focus}", not the content`);
      if (st.h1 !== 1 || st.main !== 1) fail.push(`spa @${w} ${st.path}: ${st.h1} h1, ${st.main} main`);
      const r = await p.evaluate(() => (window as any).axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
      spaRuns++; rules += r.passes.length;
      for (const v of r.violations) fail.push(`spa @${w} ${st.path}: ${v.id} (${v.nodes.length}): ${v.help}; first ${v.nodes[0].target.join(' ')}`.slice(0, 400));
    }
    // Back returns to the page before, with no load.
    await p.goBack();
    await p.waitForFunction(() => location.pathname.startsWith('/work/') || location.pathname === '/about.html' || location.pathname === '/work.html');
    if (loads !== 1) fail.push(`spa @${w}: ${loads} page loads, expected 1: a click on the nav must not reload`);
    await ctx.close();
  }
  // Reflow: WCAG 1.4.10 at 320 px, no sideways scroll on any page.
  const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, reducedMotion: 'reduce' });
  for (const path of pages) {
    const p = await ctx.newPage();
    await p.goto(server.url.origin + path, { waitUntil: 'load' });
    const sw = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (sw > 0) fail.push(`${path} @320: scrolls sideways by ${sw}px`);
    // The page wrapper clips sideways overflow, so a cut-off block adds no scroll width and the line above cannot see it.
    // Measure it: no text or control may reach past the screen, unless it sits in a scroll container or is decoration.
    const cut = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const out: string[] = [];
      let n = 0;
      for (const el of document.querySelectorAll<HTMLElement>('main *, header *, footer *')) {
        if (el.closest('[aria-hidden="true"], svg, .sr-only')) continue;
        // Measure the element's own text, not its box: a paragraph with a link inside is not a leaf, and its words can still be cut.
        const texts = [...el.childNodes].filter((t) => t.nodeType === 3 && t.textContent!.trim());
        if (!texts.length && el.children.length) continue;
        let r = el.getBoundingClientRect();
        if (texts.length) {
          const range = document.createRange();
          range.setStartBefore(texts[0]!); range.setEndAfter(texts[texts.length - 1]!);
          const rs = [...range.getClientRects()];
          if (rs.length) r = new DOMRect(Math.min(...rs.map((x) => x.left)), 0, Math.max(...rs.map((x) => x.right)) - Math.min(...rs.map((x) => x.left)), 1);
        }
        if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') continue;
        let scroller = false;
        for (let a = el.parentElement; a; a = a.parentElement) if (/auto|scroll/.test(getComputedStyle(a).overflowX)) { scroller = true; break; }
        if (scroller) continue;
        n++;
        if (r.right > vw + 2 || r.left < -2) out.push(`${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 30)}" spans ${Math.round(r.left)} to ${Math.round(r.right)} of ${vw}`);
      }
      return { n, out };
    });
    measured += cut.n;
    for (const c of cut.out.slice(0, 3)) fail.push(`${path} @320: cut off: ${c}`);
    await p.close();
  }
  await ctx.close();
} finally {
  await browser.close();
  server.stop(true);
}
console.log(`a11y: read ${pages.length} pages in ${runs} axe runs (390 and 1280 px) plus ${modalRuns} with the Privacy modal open, resolved ${links} internal links, routed ${spaSteps} client-side navigations and ran axe on ${spaRuns} of them, and measured ${measured} elements for reflow at 320 px; ${rules} rule passes, ${fail.length} failures`);
if (runs !== pages.length * 2 || pages.length < 10 || modalRuns !== 2 || spaRuns !== 8 || links < pages.length || measured < pages.length * 10) { console.error(`a11y check read too little: ${runs} runs over ${pages.length} pages, ${links} links, ${measured} elements measured`); process.exit(1); }
if (fail.length) { console.error('a11y check FAILED:\n- ' + fail.join('\n- ')); process.exit(1); }
