import { test, expect } from 'bun:test';
import { home, kit, notFound, study, workIndex } from './pages.ts';
import { studies, featured, latest } from './content.ts';

const all = () => [home(), workIndex(), kit(), notFound(), ...studies.map(study)];

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
