// Row alignment check of the built home page: serves dist/ and measures the "Services I maintain" list at 1280 and 390 px.
// Every row must put its icon, its text and its fact on the same edges as every other row, so a list reads as a table.
//   icon column: same left edge in every row. Text column: same left edge in every row, and to the right of the icon.
//   Fact (desktop): same right edge in every row, inside the row. Phone: the fact sits under the text, on the text's left edge.
// It prints what it measured and exits non-zero on any failure. Run it with `bun run test:rows` after `bun run build`.
// Set CHROMIUM_PATH to use a browser Playwright did not install.
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
let rowsRead = 0, edges = 0;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  for (const [w, h] of [[1280, 800], [390, 844]] as const) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(server.url.origin + '/', { waitUntil: 'load' });
    const rows = await p.evaluate(() => [...document.querySelectorAll('[data-home="services"] .toon-row')].map((r) => {
      const box = (sel: string) => { const e = r.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top }; };
      const rb = r.getBoundingClientRect();
      return { name: r.querySelector('b')?.textContent ?? '?', row: { l: rb.left, r: rb.right }, icon: box('.toon-row-icon'), body: box('.toon-row-body'), lead: box('.toon-row-lead'), aside: box('.toon-row-aside') };
    }));
    if (rows.length < 5) fail.push(`${w}px: read only ${rows.length} service rows, so nothing was measured`);
    rowsRead += rows.length;
    const same = (label: string, vals: number[]) => {
      edges += vals.length;
      const spread = Math.max(...vals) - Math.min(...vals);
      if (spread > 1) fail.push(`${w}px: ${label} differs by ${Math.round(spread * 10) / 10}px across rows (${vals.map((v) => Math.round(v)).join(', ')})`);
    };
    const have = <K extends 'icon' | 'body' | 'lead' | 'aside'>(k: K) => rows.map((r) => r[k]).filter((x): x is NonNullable<typeof x> => !!x);
    same('the icon left edge', have('icon').map((b) => b.l));
    same('the text left edge', have('body').map((b) => b.l));
    same('the label left edge', have('lead').map((b) => b.l));
    if (w >= 1024) same('the fact right edge', have('aside').map((b) => b.r));
    else same('the fact left edge', have('aside').map((b) => b.l));
    for (const r of rows) {
      if (r.icon && r.body && r.body.l < r.icon.r) fail.push(`${w}px: "${r.name}" text starts left of its icon's right edge`);
      if (r.aside && r.aside.r > r.row.r + 0.5) fail.push(`${w}px: "${r.name}" fact runs past the row`);
      // The text must start within one gap of the icon, not far to the right: a text column centred in the row fails this.
      if (r.icon && r.body && r.body.l - r.icon.r > 40) fail.push(`${w}px: "${r.name}" text starts ${Math.round(r.body.l - r.icon.r)}px from its icon, so the column is not left-aligned`);
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.stop();
}
console.log(`rows: read ${rowsRead} service rows and compared ${edges} edges at 1280 and 390 px`);
if (!rowsRead) fail.push('read no rows');
if (fail.length) {
  console.error(fail.map((f) => `FAIL ${f}`).join('\n'));
  process.exit(1);
}
