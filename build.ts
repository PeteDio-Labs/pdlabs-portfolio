// Builds the static site into dist/: renders every page, then compiles Tailwind over the
// page sources. Exits non-zero when any step fails or a page is missing from the output.
import { mkdir, rm } from 'node:fs/promises';
import { home, kit, legal, notFound, study, workIndex, workScript } from './src/pages.ts';
import { site, studies, fit } from './src/content.ts';
import { apiFiles } from './src/api.ts';
import { siteScript, motionScript } from './src/script.ts';
import { robotsTxt, sitemapFiles, sitemapXml, llmsTxt } from './src/seo.ts';

const out = 'dist';
await rm(out, { recursive: true, force: true });
await mkdir(`${out}/work`, { recursive: true });

const pages: Record<string, string> = {
  'index.html': home(),
  'work.html': workIndex(),
  'ui.html': kit(),
  'privacy.html': legal('privacy'),
  'terms.html': legal('terms'),
  '404.html': notFound(),
  ...Object.fromEntries(studies.map((s) => [`work/${s.slug}.html`, study(s)])),
};

if (!process.env.CF_ANALYTICS_TOKEN) console.warn('CF_ANALYTICS_TOKEN is unset: building without analytics, and the privacy page says so.');
for (const [path, html] of Object.entries(pages)) {
  await Bun.write(`${out}/${path}`, html);
}

await Bun.write(`${out}/work.js`, workScript + '\n');

// The same data as one file, for anything that wants the list without scraping HTML. Bodies stay out.
await Bun.write(
  `${out}/studies.json`,
  JSON.stringify(studies.map(({ slug, date, tag, title, summary, stat }) => ({ slug, date, tag, title, summary, stat, url: `/work/${slug}.html` })), null, 2) + '\n',
);

// The JSON API: an index and one file per study under api/. CloudFront adds CORS to /api/* only.
for (const [path, text] of Object.entries(apiFiles(studies, fit))) await Bun.write(`${out}/${path}`, text);

// Static assets and machine-readable files. The sitemap lists every page except the 404 and the noindex kit page, and dates each study by its own date.
await Bun.write(`${out}/site.js`, siteScript);
await Bun.write(`${out}/motion.js`, motionScript);
await Bun.write(`${out}/robots.txt`, robotsTxt());
await Bun.write(`${out}/sitemap.xml`, sitemapXml(
  sitemapFiles(Object.keys(pages)),
  undefined,
  Object.fromEntries(studies.map((s) => [`work/${s.slug}.html`, s.date])),
));
await Bun.write(`${out}/llms.txt`, llmsTxt());
await Bun.write(`${out}/og.png`, Bun.file('public/og.png'));

// Favicon: a blue panel with an ink border and a yellow burst, drawn in code.
// The favicon is an animated SVG (public/favicon.svg). The PNGs are static frames for Safari, iOS and older browsers.
await Bun.write(`${out}/favicon.svg`, Bun.file('public/favicon.svg'));
await Bun.write(`${out}/favicon-32.png`, Bun.file('public/favicon-32.png'));
await Bun.write(`${out}/apple-touch-icon.png`, Bun.file('public/apple-touch-icon.png'));

// Self-hosted fonts, so no request leaves for Google.
for (const [pkg, file] of [['bangers', 'bangers-latin-400'], ['dm-sans', 'dm-sans-latin-400'], ['dm-sans', 'dm-sans-latin-700'], ['space-grotesk', 'space-grotesk-latin-500'], ['space-grotesk', 'space-grotesk-latin-700']]) {
  await Bun.write(`${out}/fonts/${file}-normal.woff2`, Bun.file(`node_modules/@fontsource/${pkg}/files/${file}-normal.woff2`));
}
await Bun.write(`${out}/site.webmanifest`, JSON.stringify({
  name: 'pdlab', short_name: 'pdlab', start_url: '/', display: 'standalone', background_color: '#0c1240', theme_color: '#0c1240',
  icons: [{ src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }, { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
}) + '\n');
await Bun.write(`${out}/.well-known/security.txt`, `Contact: mailto:privacy@pdlab.dev\nExpires: ${new Date(Date.now() + 365 * 86400000).toISOString()}\nPreferred-Languages: en\nCanonical: https://pdlab.dev/.well-known/security.txt\n`);

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

// Size guard: a large image or font should fail the build, not ship. dist/ is about 0.7 MB today.
const MAX_DIST_BYTES = 1_500_000;
let total = 0;
for (const f of new Bun.Glob('**/*').scanSync({ cwd: out, dot: true })) total += Bun.file(`${out}/${f}`).size;
if (total > MAX_DIST_BYTES) throw new Error(`dist/ is ${total} bytes, over the ${MAX_DIST_BYTES} byte budget`);
console.log(`dist/ is ${total} bytes (budget ${MAX_DIST_BYTES})`);
