// Builds the static site into dist/: renders every page, then compiles Tailwind over the
// page sources. Exits non-zero when any step fails or a page is missing from the output.
import { mkdir, rm } from 'node:fs/promises';
import { home, kit, notFound, study } from './src/pages.ts';
import { studies } from './src/content.ts';

const out = 'dist';
await rm(out, { recursive: true, force: true });
await mkdir(`${out}/work`, { recursive: true });

const pages: Record<string, string> = {
  'index.html': home(),
  'ui.html': kit(),
  '404.html': notFound(),
  ...Object.fromEntries(studies.map((s) => [`work/${s.slug}.html`, study(s)])),
};

for (const [path, html] of Object.entries(pages)) {
  await Bun.write(`${out}/${path}`, html);
}

// Favicon: a blue panel with an ink border and a yellow burst, drawn in code.
const burst = Array.from({ length: 16 }, (_, i) => {
  const r = i % 2 ? 16 : 24;
  const a = (i / 16) * Math.PI * 2;
  return `${(32 + r * Math.cos(a)).toFixed(1)},${(32 + r * Math.sin(a)).toFixed(1)}`;
}).join(' ');
await Bun.write(
  `${out}/favicon.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="3" y="3" width="58" height="58" rx="12" fill="#3d7bff" stroke="#0a0a1f" stroke-width="5"/><polygon points="${burst}" fill="#ffd60a" stroke="#0a0a1f" stroke-width="4" stroke-linejoin="round"/></svg>`,
);

const tw = Bun.spawnSync(['bunx', 'tailwindcss', '-i', 'ui/toonish.css', '-o', `${out}/toonish.css`, '--minify'], {
  stderr: 'pipe',
});
if (tw.exitCode !== 0) {
  console.error(tw.stderr.toString());
  throw new Error(`tailwindcss exited ${tw.exitCode}`);
}

const css = await Bun.file(`${out}/toonish.css`).text();
if (!css.includes('.toon-btn')) throw new Error('toonish.css has no components: the Tailwind content globs matched nothing');

console.log(`built ${Object.keys(pages).length} pages and toonish.css (${css.length} bytes) into ${out}/`);
