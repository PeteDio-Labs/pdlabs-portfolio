// Scroll film check of the built home page: serves dist/ and drives the hero at 1280x900 (pinned), 390x844 (not pinned) and with
// reduced motion. It fails when progress does not run 0 to 1, when the hero is not pinned where it should be (or is where it should
// not be), when reduced motion still animates, or when the page scrolls sideways. It prints what it measured.
// Run it with `bun run test:scroll` after `bun run build`. Set CHROMIUM_PATH to use a browser Playwright did not install.
import { chromium } from 'playwright-core';

const root = `${import.meta.dir}/../dist`;
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    if (pathname.includes('..')) return new Response('bad', { status: 400 });
    for (const p of [pathname === '/' ? '/index.html' : pathname, `${pathname}.html`]) {
      const f = Bun.file(root + p);
      if (await f.exists()) return new Response(f);
    }
    return new Response(Bun.file(`${root}/404.html`), { status: 404, headers: { 'content-type': 'text/html' } });
  },
});

const fail: string[] = [];
let reads = 0;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const state = (p: import('playwright-core').Page) => p.evaluate(() => {
  const film = document.querySelector<HTMLElement>('[data-sc=film]')!, stage = document.querySelector<HTMLElement>('.sc-stage')!;
  const rise = document.querySelector<HTMLElement>('.sc-rise')!;
  const line = [...document.querySelectorAll<SVGElement>('.sc-line')].pop()!;
  return {
    on: document.documentElement.classList.contains('sc-on'),
    p: parseFloat(film.style.getPropertyValue('--sc-p') || 'NaN'),
    pos: getComputedStyle(stage).position, stageTop: Math.round(stage.getBoundingClientRect().top),
    rise: parseFloat(rise.style.getPropertyValue('--sc-p') || 'NaN'),
    lineOpacity: parseFloat(getComputedStyle(line).opacity),
    sideways: document.documentElement.scrollWidth > innerWidth,
  };
});
try {
  for (const [name, w, h, reduced, pinned] of [['desktop', 1280, 900, false, true], ['phone', 390, 844, false, false], ['desktop, reduced motion', 1280, 900, true, false]] as const) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    const p = await ctx.newPage();
    await p.goto(server.url.origin + '/', { waitUntil: 'load' });
    await p.waitForTimeout(300);
    const top = await state(p); reads++;
    if (reduced) {
      if (top.on || top.pos === 'sticky' || top.lineOpacity !== 1) fail.push(`${name}: reduced motion still animates (${JSON.stringify(top)})`);
    } else {
      if (!top.on) fail.push(`${name}: .sc-on is missing with motion on`);
      if (!(top.p === 0)) fail.push(`${name}: film progress at the top is ${top.p}, not 0`);
      if (pinned && top.lineOpacity !== 0) fail.push(`${name}: the last terminal line shows at progress 0 (opacity ${top.lineOpacity})`);
      const film = await p.evaluate(() => { const f = document.querySelector<HTMLElement>('[data-sc=film]')!; return { h: f.offsetHeight, y: f.getBoundingClientRect().top + scrollY }; });
      if (pinned) {
        await p.evaluate((y) => scrollTo(0, y + 100), film.y); await p.waitForTimeout(150);
        const early = await state(p); reads++;
        if (early.pos !== 'sticky' || early.stageTop !== 0) fail.push(`${name}: the stage is not pinned at the top (${early.pos}, top ${early.stageTop})`);
        await p.evaluate((y) => scrollTo(0, y), film.y + film.h - h - 4); await p.waitForTimeout(150);
        const late = await state(p); reads++;
        if (!(late.p > 0.9) || late.lineOpacity !== 1) fail.push(`${name}: near the end progress is ${late.p} and the last line opacity ${late.lineOpacity}`);
      } else if (top.pos === 'sticky') fail.push(`${name}: the stage is pinned where it must not be`);
      await p.evaluate(() => { const r = document.querySelector('.sc-rise')!.getBoundingClientRect(); scrollTo(0, scrollY + r.top - innerHeight * 0.6); }); await p.waitForTimeout(150);
      const mid = await state(p); reads++;
      if (!(mid.rise > 0 && mid.rise < 1)) fail.push(`${name}: the proof strip progress is ${mid.rise}, not between 0 and 1`);
    }
    if (top.sideways) fail.push(`${name}: the page scrolls sideways`);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.stop();
}
if (fail.length) { console.error(`scroll film FAILED after ${reads} reads:\n- ${fail.join('\n- ')}`); process.exit(1); }
console.log(`scroll film ok: ${reads} reads across desktop, phone and reduced motion; pinned only where the hero fits; reduced motion static`);
