import { existsSync, readdirSync, readFileSync } from 'node:fs';
// Portfolio content. Site details live here. Each case study is one JSON file in
// content/studies/, loaded and checked below, so adding a study means adding a file.
// Source: /mnt/project-files/portfolio/case-studies-draft.md (draft 2, with the
// 2026-11-03 correction). Study 1's counts come from data/pr-stats.json (scripts/pr-stats.ts).
// Public-safe rule from that draft: no secrets, internal IPs, hostnames, tokens, account
// details, tool paths or schedule internals. Sections the draft marks [TODO] are left out
// until Pedro supplies the fact. Nothing here is invented: a study's `sources` field names
// where a fact came from when it did not come from the draft.

export * from './content-core.ts';
import { derive, type CaseStudy } from './content-core.ts';

const ACCENTS = ['blue', 'red', 'yellow', 'violet'];

/** Fails the build, with the file name, when a study file is missing a field the templates need. */
function check(file: string, s: any): CaseStudy {
  const bad = (why: string): never => {
    throw new Error(`content/studies/${file}: ${why}`);
  };
  for (const k of ['slug', 'title', 'tag', 'summary'] as const) if (typeof s[k] !== 'string' || !s[k]) bad(`"${k}" must be a non-empty string`);
  if (`${s.slug}.json` !== file) bad(`slug "${s.slug}" must match the file name`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date) || Number.isNaN(Date.parse(s.date))) bad('"date" must be a real YYYY-MM-DD date');
  if (!ACCENTS.includes(s.accent)) bad(`"accent" must be one of ${ACCENTS.join(', ')}`);
  if (!s.stat?.value || !s.stat?.label) bad('"stat" needs a value and a label');
  if (!Array.isArray(s.sections) || !s.sections.length) bad('"sections" must be a non-empty list');
  if (!Array.isArray(s.skills)) bad('"skills" must be a list');
  const text = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';
  if (s.facts !== undefined) {
    if (!Array.isArray(s.facts) || s.facts.length < 2 || s.facts.length > 4) bad('"facts" needs 2 to 4 entries');
    for (const f of s.facts) {
      if (!text(f?.label) || !text(f?.value)) bad('each fact needs a text label and a text value');
      if (f.detail !== undefined && !text(f.detail)) bad(`fact "${f.label}": "detail" must be text when present`);
    }
  }
  for (const sec of s.sections) {
    if (!sec || typeof sec !== 'object') bad('every section must be an object');
    const t = sec.table;
    if (t === undefined) continue;
    const where = `the table in "${sec.heading}"`;
    if (!text(t?.caption) || !Array.isArray(t.columns) || t.columns.length < 2 || !Array.isArray(t.rows) || !t.rows.length) bad(`${where} needs a caption, 2 or more columns and rows`);
    // The first column heads each row, so only its header may be empty. The page gives it a hidden label.
    if (t.columns.some((c: unknown, i: number) => typeof c !== 'string' || (i > 0 && !text(c)))) bad(`${where} needs a text header on every column but the first`);
    for (const r of t.rows) if (!Array.isArray(r) || r.length !== t.columns.length || !r.every(text)) bad(`every row of ${where} needs ${t.columns.length} non-empty text cells`);
  }
  for (const sec of s.sections) for (const sh of sec.shots ?? []) {
    if (!sh.alt?.trim() || !sh.caption?.trim()) bad(`shot "${sh.file}" needs alt text and a caption`);
    if (!existsSync(`${import.meta.dir}/../public/studies/${s.slug}/${sh.file}`)) bad(`shot "${sh.file}" is missing from public/studies/${s.slug}/`);
  }
  return s as CaseStudy;
}

/** Per-study note on which kinds of role the work speaks to, keyed by slug. Rendered on the study page. */
export const fit: Record<string, string> = JSON.parse(readFileSync(`${import.meta.dir}/../content/fit.json`, 'utf8'));

const dir = `${import.meta.dir}/../content/studies`;

/** Every study, newest first. Ties break on slug so the order never depends on the file system. */
export const studies: CaseStudy[] = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => check(f, JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'))))
  .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

for (const k of Object.keys(fit)) if (!studies.some((s) => s.slug === k)) throw new Error(`content/fit.json: no study with slug "${k}"`);
if (new Set(studies.map((s) => s.slug)).size !== studies.length) throw new Error('content/studies: duplicate slug');
if (studies.filter((s) => s.featured).length > 1) throw new Error('content/studies: more than one featured study');

const derived = derive(studies);
export const featured: CaseStudy = derived.featured;
export const latest: CaseStudy | undefined = derived.latest;
export const tags: string[] = derived.tags;
