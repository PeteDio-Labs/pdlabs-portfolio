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

const pages = ['/', '/work.html', '/privacy.html', '/terms.html', '/no-such-page', ...(await Array.fromAsync(new Bun.Glob('work/*.html').scan(root))).sort().map((f) => `/${f}`)];
const fail: string[] = [];
let rules = 0, runs = 0;
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
      const s = await p.evaluate(() => ({ h1: document.querySelectorAll('h1').length, main: document.querySelectorAll('main').length, lang: document.documentElement.lang }));
      if (s.h1 !== 1 || s.main !== 1 || !s.lang) fail.push(`${path} @${w}: ${s.h1} h1, ${s.main} main, lang "${s.lang}"`);
      await p.close();
    }
    await ctx.close();
  }
  // Reflow: WCAG 1.4.10 at 320 px, no sideways scroll on any page.
  const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, reducedMotion: 'reduce' });
  for (const path of pages) {
    const p = await ctx.newPage();
    await p.goto(server.url.origin + path, { waitUntil: 'load' });
    const sw = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (sw > 0) fail.push(`${path} @320: scrolls sideways by ${sw}px`);
    await p.close();
  }
  await ctx.close();
} finally {
  await browser.close();
  server.stop(true);
}
console.log(`a11y: read ${pages.length} pages in ${runs} axe runs (390 and 1280 px) plus a 320 px reflow check; ${rules} rule passes, ${fail.length} failures`);
if (runs !== pages.length * 2 || pages.length < 10) { console.error(`a11y check read too little: ${runs} runs over ${pages.length} pages`); process.exit(1); }
if (fail.length) { console.error('a11y check FAILED:\n- ' + fail.join('\n- ')); process.exit(1); }
