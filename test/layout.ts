// Layout and snapshot check of the built site. It serves dist/ and, at 1280 px and 390 px, fails on:
//   - a layout finding from test/layout-audit.ts (clipped svg, cut text, overlapping text) on every built page,
//     and under hover on the pages in HOVER_PAGES
//   - a first screen of SNAPSHOT_PAGES whose pixels differ from its baseline in test/snapshots/
// A missing baseline fails too. To accept a deliberate change, run `bun run test:layout:update`, read the changed
// images. Pixels depend on the browser build and fonts, so the baselines come from the CI runner: push a change to
// test/update-snapshots.request and the update-snapshots workflow commits them. On a failure the actual and diff images go to test/out/layout/ and CI uploads them for one day.
// Run it after `bun run build`. Set CHROMIUM_PATH to use a browser Playwright did not install.
import { mkdir, rm } from 'node:fs/promises';
import { chromium, type Page } from 'playwright-core';
import { audit, diffPngs, type Finding } from './layout-audit.ts';

const root = `${import.meta.dir}/../dist`;
const SNAPSHOTS = `${import.meta.dir}/snapshots`;
const OUT = `${import.meta.dir}/out/layout`;
const TOLERANCE = 10;
const MAX_PIXELS = 24; // pixels allowed to differ beyond the tolerance: one stray glyph is about 60
const HOVER_PAGES = ['/', '/work.html', '/about.html'];
// Pages whose first screen is UI, not content. The work page lists case studies, which land on main without staging.
const SNAPSHOT_PAGES = ['/', '/about.html'];
const update = process.env.UPDATE_SNAPSHOTS === '1';

const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    if (pathname.includes('..')) return new Response('bad', { status: 400 });
    for (const p of [pathname, `${pathname}.html`, `${pathname}/index.html`]) {
      const f = Bun.file(root + p);
      if (!p.endsWith('//') && !(pathname.endsWith('/') && p === pathname) && (await f.exists())) return new Response(f);
    }
    return new Response(Bun.file(`${root}/404.html`), { status: 404, headers: { 'content-type': 'text/html' } });
  },
});

const pages = ['/', '/about.html', '/work.html', '/privacy.html', '/terms.html', ...(await Array.fromAsync(new Bun.Glob('work/*.html').scan(root))).sort().map((f) => `/${f}`)];
const fail: string[] = [];
const seenFiles: string[] = [];
let checks = 0, textBoxes = 0, svgs = 0, hovers = 0, shots = 0, runs = 0;
const key = (f: Finding) => `${f.rule}|${f.what}|${f.detail}`;

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await mkdir(SNAPSHOTS, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const diffPage = await (await browser.newContext()).newPage();
  const compare = async (actual: Buffer, file: string, what: string) => {
    checks++;
    seenFiles.push(file);
    const base = Bun.file(`${SNAPSHOTS}/${file}`);
    if (update) { await Bun.write(`${SNAPSHOTS}/${file}`, actual); return; }
    if (!(await base.exists())) { fail.push(`${what}: no baseline test/snapshots/${file}. Push a change to test/update-snapshots.request so the update-snapshots workflow builds it.`); return; }
    const png = (b: Uint8Array | Buffer) => `data:image/png;base64,${Buffer.from(b).toString('base64')}`;
    const r = await diffPage.evaluate(diffPngs, { a: png(Buffer.from(await base.arrayBuffer())), b: png(actual), tolerance: TOLERANCE });
    const px = Math.round(r.ratio * r.w * r.h);
    if (r.sizeMismatch || px > MAX_PIXELS) {
      await Bun.write(`${OUT}/${file}.actual.png`, actual);
      await Bun.write(`${OUT}/${file}.diff.png`, Buffer.from(r.diff.split(',')[1]!, 'base64'));
      fail.push(`${what}: ${r.sizeMismatch ? 'the size changed' : `${px} pixels differ (limit ${MAX_PIXELS})`}. See test/out/layout/${file}.diff.png`);
    }
  };
  const run = async (page: Page, label: string, known: Set<string>) => {
    const r = await page.evaluate(audit);
    textBoxes += r.textBoxes; svgs += r.svgs;
    for (const f of r.findings) if (!known.has(key(f))) { fail.push(`${label}: ${f.rule}: ${f.what}: ${f.detail}`); known.add(key(f)); }
    return r;
  };

  // A known-bad page: the audit must flag each rule, so a green run proves it can see.
  const cp = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await cp.setContent(`<!doctype html><html lang="en"><body style="margin:0;font:20px sans-serif"><div style="width:120px"><svg viewBox="0 0 20 20" width="40" height="40"><path d="M2 10h22" stroke="black" stroke-width="3" fill="none"/></svg></div>
<div style="position:relative;width:200px;margin-top:20px"><h2 style="margin:0">Heading text<span style="position:absolute;left:30px;top:6px;background:#ff0">FIXED!</span></h2></div>
<div style="width:100px;height:20px;overflow:hidden;margin-top:20px"><p style="margin:0 0 0 60px;width:200px">Cut off text here</p></div></body></html>`);
  checks++;
  const caught = (await cp.evaluate(audit)).findings.map((f) => f.rule).sort().join();
  if (caught !== 'svg-clipped,text-cut,text-overlap') fail.push(`canary: the audit should flag svg-clipped, text-cut and text-overlap on the known-bad page, and flagged "${caught}"`);
  await cp.context().close();

  for (const [name, width, height] of [['desktop', 1280, 900], ['phone', 390, 844]] as const) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    for (const path of pages) {
      const page = await ctx.newPage();
      const res = await page.goto(server.url.origin + path, { waitUntil: 'networkidle' });
      // A 404 page has text and svgs too, so a page that did not load would pass the audit unless the status is read.
      if (res?.status() !== 200) { fail.push(`${path} @${name}: served status ${res?.status()}, not 200`); await page.close(); continue; }
      await page.evaluate(() => document.fonts.ready);
      const known = new Set<string>();
      runs++; checks++;
      const rest = await run(page, `${path} @${name}`, known);
      if (rest.textBoxes < 10) fail.push(`${path} @${name}: the audit read only ${rest.textBoxes} text boxes, so it did not examine the page`);
      await page.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true; }));
      await run(page, `${path} @${name} (details open)`, known);
      await page.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = false; }));

      if (width >= 1024 && HOVER_PAGES.includes(path)) {
        const targets = await page.evaluate(() => {
          const out: string[] = []; const done = new Set<Element>();
          ['.toon-card', 'a[href]', '.toon-btn', 'tr', '.toon-row', '.toon-strip-cell', 'summary'].forEach((s, i) => document.querySelectorAll(s).forEach((e, j) => {
            if (j >= 12 || done.has(e) || !e.getClientRects().length || e.closest('.toon-skip')) return;
            done.add(e); e.setAttribute('data-hover-probe', `${i}-${j}`); out.push(`[data-hover-probe="${i}-${j}"]`);
          }));
          return out;
        });
        for (const t of targets) {
          const el = page.locator(t);
          await el.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => undefined);
          const hovered = await el.hover({ timeout: 2000 }).then(() => true, () => false);
          await page.waitForTimeout(60);
          if (!hovered) { fail.push(`${path} @${name}: hover on ${t} did not land`); continue; }
          hovers++; checks++;
          await run(page, `${path} @${name} hover ${t}`, known);
        }
        await page.mouse.move(0, 0);
        await page.evaluate(() => document.querySelectorAll('[data-hover-probe]').forEach((e) => e.removeAttribute('data-hover-probe')));
      }
      if (SNAPSHOT_PAGES.includes(path)) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(100);
        shots++;
        await compare(await page.screenshot({ animations: 'disabled', caret: 'hide' }), `${path === '/' ? 'home' : path.slice(1).replace('.html', '').replace(/\//g, '-')}-${width}.png`, `${path} @${name}: first screen`);
      }
      await page.close();
    }
    await ctx.close();
  }
  await diffPage.context().close();
} finally {
  await browser.close();
  server.stop(true);
}

if (!update) {
  const orphans = [...new Bun.Glob('*.png').scanSync(SNAPSHOTS)].filter((f) => !seenFiles.includes(f));
  if (orphans.length) fail.push(`${orphans.length} baselines match no page: ${orphans.join(', ')}. Delete them.`);
}
if (hovers < 20) fail.push(`only ${hovers} hover states ran, so the hover pass did not examine the pages`);
if (update) {
  // Update mode rebuilds the baselines and still prints every layout finding, so a bug is never hidden by an update.
  // The ci job fails on the same findings.
  if (fail.length) console.warn(`update mode: ${fail.length} layout findings left unfixed, and ci will fail on them:\n- ${fail.join('\n- ')}`);
  console.log(`baselines ${seenFiles.length} written`);
  process.exit(0);
}
if (fail.length) {
  console.error(`layout check FAILED, ${fail.length} problems in ${checks} checks:\n- ${fail.join('\n- ')}`);
  process.exit(1);
}
console.log(`layout check passed: ${checks} checks; ${runs} page loads, ${textBoxes} text boxes and ${svgs} svgs read for clipping and overlap, ${hovers} hover states, ${shots} first-screen snapshots ${update ? 'WRITTEN' : 'compared'} at 1280 px and 390 px`);
