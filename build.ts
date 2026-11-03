// Builds the static site into dist/: renders every page, then compiles Tailwind over the
// page sources. Exits non-zero when any step fails or a page is missing from the output.
import { mkdir, rm } from 'node:fs/promises';
import { home, kit, notFound, study } from './src/pages.ts';
import { studies } from './src/content.ts';
import { toonWord } from './ui/lettering/toonletter.ts';

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
  if (html.includes('data-missing=')) throw new Error(`${path}: lettering has a character with no glyph`);
  await Bun.write(`${out}/${path}`, html);
}

// Favicon: a single lettered P.
await Bun.write(`${out}/favicon.svg`, toonWord('P', { bounce: 0 }));

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
