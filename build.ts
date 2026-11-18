// Builds the static site into dist/: renders every page, then compiles Tailwind over the
// page sources. Exits non-zero when any step fails or a page is missing from the output.
import { mkdir, rm } from 'node:fs/promises';
import { aboutPage, kitMoved, landingPage, legalPage, notFoundPage, studyPage, workPage, analytics } from './src/pages.ts';
import { document as render } from './src/document.tsx';
import { site, studies, fit } from './src/content.ts';
import { apiFiles } from './src/api.ts';
import { motionScript } from './src/script.ts';
import { robotsTxt, sitemapFiles, sitemapXml, llmsTxt } from './src/seo.ts';

const out = 'dist';
await rm(out, { recursive: true, force: true });
await mkdir(`${out}/work`, { recursive: true });

// Every route is a real file, so a deep link and a refresh work on S3 and CloudFront with no rewrite, and a crawler reads
// the page without running a script. The app hydrates the same markup and routes on the client from there.
const pages: Record<string, string> = {
  'index.html': render(landingPage()),
  'about.html': render(aboutPage()),
  'work.html': render(workPage()),
  'ui.html': kitMoved(),
  'privacy.html': render(legalPage('privacy')),
  'terms.html': render(legalPage('terms')),
  '404.html': render(notFoundPage()),
  ...Object.fromEntries(studies.map((s) => [`work/${s.slug}.html`, render(studyPage(s))])),
};

if (!process.env.CF_ANALYTICS_TOKEN) console.warn('CF_ANALYTICS_TOKEN is unset: building without analytics, and the privacy page says so.');
for (const [path, html] of Object.entries(pages)) {
  await Bun.write(`${out}/${path}`, html);
}

// The client bundle. It runs the same page code as the build, so content.ts (which reads files) is swapped for a module that
// embeds each study's card fields only: the text of a study stays in its own page, which the app fetches on demand.
const clientData = JSON.stringify({ studies: studies.map(({ sources: _s, sections: _a, facts: _f, skills: _k, ...rest }) => rest), fit: {} });
const app = await Bun.build({
  entrypoints: ['src/client.tsx'],
  outdir: out,
  naming: 'app.js',
  target: 'browser',
  format: 'iife',
  minify: true,
  define: { 'process.env.CF_ANALYTICS_TOKEN': JSON.stringify(analytics) },
  plugins: [{
    name: 'embedded-content',
    setup(b) {
      b.onResolve({ filter: /(^|\/)content\.ts$/ }, () => ({ path: 'embedded-content', namespace: 'content' }));
      b.onLoad({ filter: /.*/, namespace: 'content' }, () => ({
        loader: 'js',
        contents: `import { derive } from ${JSON.stringify(`${import.meta.dir}/src/content-core.ts`)};
export * from ${JSON.stringify(`${import.meta.dir}/src/content-core.ts`)};
const data = ${clientData};
export const studies = data.studies;
export const fit = data.fit;
const d = derive(studies);
export const featured = d.featured, latest = d.latest, tags = d.tags;`,
      }));
    },
  }],
});
if (!app.success) { for (const m of app.logs) console.error(m); throw new Error('Bun.build failed for the client bundle'); }
console.log(`built app.js (${(await Bun.file(`${out}/app.js`).text()).length} bytes)`);

// The same data as one file, for anything that wants the list without scraping HTML. Bodies stay out.
await Bun.write(
  `${out}/studies.json`,
  JSON.stringify(studies.map(({ slug, date, tag, title, summary, stat }) => ({ slug, date, tag, title, summary, stat, url: `/work/${slug}.html` })), null, 2) + '\n',
);

// The JSON API: an index and one file per study under api/. CloudFront adds CORS to /api/* only.
for (const [path, text] of Object.entries(apiFiles(studies, fit))) await Bun.write(`${out}/${path}`, text);

// Case-study screenshots: every file under public/studies/ is copied to dist/studies/, and the build says how many.
const shots = [...new Bun.Glob('studies/**/*.png').scanSync('public')];
for (const f of shots) await Bun.write(`${out}/${f}`, Bun.file(`public/${f}`));
console.log(`copied ${shots.length} study screenshot(s)`);

// Static assets and machine-readable files. The sitemap lists every page except the 404 and the moved kit page, and dates each study by its own date.
await Bun.write(`${out}/motion.js`, motionScript);
await Bun.write(`${out}/robots.txt`, robotsTxt());
await Bun.write(`${out}/sitemap.xml`, sitemapXml(
  sitemapFiles(Object.keys(pages)),
  undefined,
  Object.fromEntries(studies.map((s) => [`work/${s.slug}.html`, s.date])),
));
await Bun.write(`${out}/llms.txt`, llmsTxt());
await Bun.write(`${out}/og.png`, Bun.file('public/og.png'));
await Bun.write(`${out}/pedro-cutout.webp`, Bun.file('public/pedro-cutout.webp'));

// Favicon: a blue panel with an ink border and a yellow burst, drawn in code.
// The favicon is an animated SVG (public/favicon.svg). The PNGs are static frames for Safari, iOS and older browsers.
await Bun.write(`${out}/favicon.svg`, Bun.file('public/favicon.svg'));
await Bun.write(`${out}/favicon-32.png`, Bun.file('public/favicon-32.png'));
await Bun.write(`${out}/apple-touch-icon.png`, Bun.file('public/apple-touch-icon.png'));

// Self-hosted fonts from the toonish-ui package, so no request leaves for Google. The package's CSS names them as ./fonts/...
const fontDir = 'node_modules/toonish-ui/dist/fonts';
const fontFiles = [...new Bun.Glob('*.woff2').scanSync({ cwd: fontDir })];
if (fontFiles.length < 4) throw new Error(`expected 4 font files in ${fontDir}, found ${fontFiles.length}`);
for (const f of fontFiles) await Bun.write(`${out}/fonts/${f}`, Bun.file(`${fontDir}/${f}`));
console.log(`copied ${fontFiles.length} kit font(s)`);
await Bun.write(`${out}/site.webmanifest`, JSON.stringify({
  name: 'pdlab', short_name: 'pdlab', start_url: '/', display: 'standalone', background_color: '#0c1240', theme_color: '#0c1240',
  icons: [{ src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }, { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
}) + '\n');
await Bun.write(`${out}/.well-known/security.txt`, `Contact: mailto:privacy@pdlab.dev\nExpires: ${new Date(Date.now() + 365 * 86400000).toISOString()}\nPreferred-Languages: en\nCanonical: https://pdlab.dev/.well-known/security.txt\n`);

const tw = Bun.spawnSync(['bunx', 'tailwindcss', '-i', 'src/site.css', '-o', `${out}/toonish.css`, '--minify'], {
  stderr: 'pipe',
});
if (tw.exitCode !== 0) {
  console.error(tw.stderr.toString());
  throw new Error(`tailwindcss exited ${tw.exitCode}`);
}

const css = await Bun.file(`${out}/toonish.css`).text();
if (!css.includes('font-family:IBM Plex Sans') || !css.includes('font-family:IBM Plex Mono')) throw new Error('toonish.css does not name the kit fonts');
if (!css.includes('.toon-btn')) throw new Error('toonish.css has no components: the Tailwind source scan matched nothing');

console.log(`built ${Object.keys(pages).length} pages and toonish.css (${css.length} bytes) into ${out}/`);

// Size guard: a large image or font should fail the build, not ship. dist/ stays under the budget.
const MAX_DIST_BYTES = 1_800_000;
let total = 0;
for (const f of new Bun.Glob('**/*').scanSync({ cwd: out, dot: true })) total += Bun.file(`${out}/${f}`).size;
if (total > MAX_DIST_BYTES) throw new Error(`dist/ is ${total} bytes, over the ${MAX_DIST_BYTES} byte budget`);
console.log(`dist/ is ${total} bytes (budget ${MAX_DIST_BYTES})`);
