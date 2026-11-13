import { test, expect } from 'bun:test';
import { home, kit, legal, notFound, personJsonLd, study, workIndex } from './pages.ts';
import { llmsTxt, robotsTxt, sitemapXml } from './seo.ts';
import { siteScript, motionScript } from './script.ts';
import { site, studies, featured, latest, fit } from './content.ts';

const all = () => [home(), workIndex(), kit(), notFound(), legal('privacy'), legal('terms'), ...studies.map(study)];

test('every page has one h1, a title, and a description', () => {
  for (const html of all()) {
    expect(html.match(/<h1[ >]/g)?.length).toBe(1);
    expect(html).toMatch(/<title>[^<]+<\/title>/);
    expect(html).toMatch(/<meta name="description" content="[^"]+">/);
  }
});

test('case studies carry no draft markers or private details', () => {
  const text = all().join('\n');
  expect(text).not.toContain('[TODO');
  expect(text).not.toMatch(/192\.168\.|\.internal|petedio-ops|ghp_|hvs\./);
});

test('every case study links to the previous one, the next one and back', () => {
  studies.forEach((s, i) => {
    const html = study(s);
    const next = studies[(i + 1) % studies.length];
    const prev = studies[(i + studies.length - 1) % studies.length];
    expect(html).toContain('href="/work.html"');
    expect(html).toContain(`href="/work/${next.slug}.html"`);
    expect(html).toContain(`href="/work/${prev.slug}.html"`);
    expect(html).not.toContain(`href="/work/${s.slug}.html"`);
  });
});

test('home nav points at its own sections and the script can mark them', () => {
  const html = home();
  expect(html).toContain('<a href="#work" data-spy="work"');
  expect(html).toContain('<a href="#about" data-spy="about"');
  expect(html).toContain('id="work"');
  expect(html).toContain('id="about"');
});

test('kit sample nav switches in place instead of reloading', () => {
  const html = kit();
  expect(html).toContain('data-toon-toggle');
  expect(html).not.toMatch(/aria-label="Sample"[^>]*>\s*<a /);
});

test('home shows the featured and the latest study and links to /work', () => {
  const html = home();
  expect(html).toContain(`/work/${featured.slug}.html`);
  expect(html).toContain(`/work/${latest!.slug}.html`);
  expect(html.match(/<article[^>]* data-study/g)?.length).toBe(2);
  expect(html).toContain('href="/work.html"');
});

test('studies are newest first, with unique slugs and real dates', () => {
  const dates = studies.map((s) => s.date);
  expect(dates).toEqual([...dates].sort().reverse());
  expect(new Set(studies.map((s) => s.slug)).size).toBe(studies.length);
});

test('/work lists every study without JavaScript, and its controls start hidden', () => {
  const html = workIndex();
  for (const s of studies) expect(html).toContain(`href="/work/${s.slug}.html"`);
  expect(html.match(/<article[^>]* data-study/g)?.length).toBe(studies.length);
  expect(html).toMatch(/id="study-controls"[^>]*hidden/);
  expect(html).toContain('id="study-sort"');
  expect(html).toContain('<script src="/work.js" defer></script>');
  expect(html).not.toMatch(/id="study-list"[\s\S]*<script>[\s\S]*study-list/);
  expect(html).toContain('data-tag=""');
});

test('every page ships the main nav with Work pointing at /work', () => {
  expect(study(studies[0])).toContain('<a href="/work.html" aria-current="page">Work</a>');
  expect(workIndex()).toContain('<a href="/work.html" aria-current="page">Work</a>');
});

test('the privacy page says no cookies, so no page or script sets one or uses web storage beyond the motion setting', () => {
  // The privacy page names these APIs, so it is left out of the scan. The one allowed use is the motion
  // switch's saved choice, which the privacy page states.
  const text = [home(), kit(), notFound(), ...studies.map(study), siteScript].join('\n');
  expect(text).not.toMatch(/document\.cookie|sessionStorage|indexedDB|Set-Cookie/i);
  expect([...(text + motionScript).matchAll(/localStorage\.\w+\('([^']+)'/g)].every((m) => m[1] === 'pd-motion')).toBe(true);
  expect(legal('privacy')).toContain('pd-motion');
  expect(legal('privacy')).toContain('sets no cookies');
});

test('no page carries an inline script, so the CSP needs no hash', () => {
  for (const html of all()) {
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)].filter((m) => !m[1].includes('application/ld+json'));
    expect(inline.length).toBe(0);
  }
});

test('every page has Open Graph and Twitter tags, and the 404 is noindex', () => {
  for (const html of all()) {
    expect(html).toContain('property="og:image"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('rel="canonical"');
  }
  expect(notFound()).toContain('name="robots" content="noindex"');
  expect(home()).not.toContain('noindex');
});

test('footer links the privacy and terms pages', () => {
  for (const html of all()) {
    expect(html).toContain('href="/privacy.html"');
    expect(html).toContain('href="/terms.html"');
  }
});

test('sitemap lists given pages, robots points at it and allows all crawlers', () => {
  const xml = sitemapXml(['index.html', 'work/a.html', 'privacy.html'], '2026-01-01');
  expect(xml).toContain('<loc>https://pdlab.dev/</loc>');
  expect(xml).toContain('<loc>https://pdlab.dev/work/a.html</loc>');
  expect(robotsTxt()).toContain('Sitemap: https://pdlab.dev/sitemap.xml');
  expect(robotsTxt()).not.toMatch(/Disallow:\s*\//);
});

test('llms.txt names the person and every case study', () => {
  const txt = llmsTxt();
  expect(txt).toContain(site.name);
  for (const s of studies) expect(txt).toContain(`/work/${s.slug}.html`);
});

test('home carries valid JSON-LD and states the background in About', () => {
  const html = home();
  const m = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  expect(m).not.toBeNull();
  expect(JSON.parse(m![1])).toEqual(JSON.parse(JSON.stringify(personJsonLd())));
  expect(html).toContain('master&#39;s in computer science');
  expect(html).toContain('one year at Apple as a full-stack engineer');
});

test('sitemap source covers the work index, and llms.txt points at the list and its JSON', () => {
  expect(llmsTxt()).toContain('https://pdlab.dev/work.html');
  expect(llmsTxt()).toContain('https://pdlab.dev/studies.json');
});

test('footer links open Privacy and Terms in a modal and stay real links without JavaScript', () => {
  for (const html of all()) {
    expect(html).toContain('href="/privacy.html" data-toon-modal');
    expect(html).toContain('href="/terms.html" data-toon-modal');
    expect(html).toContain('class="toon-link whitespace-nowrap" href="/ui.html"');
  }
  expect(siteScript).toContain('showModal');
  expect(siteScript).not.toMatch(/innerHTML|eval\(|document\.write/);
});

test('the kit page demonstrates an accessible modal', () => {
  const html = kit();
  expect(html).toMatch(/<dialog id="k-modal-demo" class="toon-modal" aria-modal="true" aria-labelledby="k-modal-demo-title">/);
  expect(html).toContain('data-toon-modal-open="k-modal-demo"');
  expect(html).toContain('data-toon-modal-close');
});

test('no page loads a font or stylesheet from Google, because the fonts are self-hosted', () => {
  for (const html of all()) expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
});

test('every case study ends with a hiring call to action, and the fit notes name real studies', () => {
  for (const s of studies) {
    const html = study(s);
    expect(html).toContain('id="hire-h"');
    expect(html).toContain(`href="${site.linkedin}"`);
  }
  for (const slug of Object.keys(fit)) expect(study(studies.find((s) => s.slug === slug)!)).toContain('Why it matters for hiring teams');
  expect(Object.keys(fit).length).toBeGreaterThan(0);
  expect(study(studies[0])).toContain('Hiring for AI automation or forward-deployed engineering?');
  expect(home()).toContain(site.linkedin);
});

test('a stat figure shrinks as its value gets longer, so it fits its card', () => {
  const size = (html: string) => Number(/font-size:(\d+)px/.exec(html.slice(html.indexOf('block max-w-full leading-none')))![1]);
  const short = studies.find((s) => s.stat.value.length <= 4);
  const long = studies.find((s) => s.stat.value.length >= 11);
  if (short && long) expect(size(study(long))).toBeLessThan(size(study(short)));
  for (const s of studies) expect(size(study(s))).toBeLessThanOrEqual(72);
});
