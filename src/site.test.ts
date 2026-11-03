import { test, expect } from 'bun:test';
import { home, kit, notFound, study } from './pages.ts';
import { studies } from './content.ts';

const all = () => [home(), kit(), notFound(), ...studies.map(study)];

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
    expect(html).toContain('href="/#work"');
    expect(html).toContain(`href="/work/${next.slug}.html"`);
    expect(html).toContain(`href="/work/${prev.slug}.html"`);
    expect(html).not.toContain(`href="/work/${s.slug}.html"`);
  });
});

test('home links every case study', () => {
  const html = home();
  for (const s of studies) expect(html).toContain(`/work/${s.slug}.html`);
});
