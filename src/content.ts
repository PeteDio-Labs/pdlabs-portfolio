import { existsSync, readdirSync, readFileSync } from 'node:fs';
// Portfolio content. Site details live here. Each case study is one JSON file in
// content/studies/, loaded and checked below, so adding a study means adding a file.
// Source: /mnt/project-files/portfolio/case-studies-draft.md (draft 2, with the
// 2026-11-03 correction). Study 1's counts come from data/pr-stats.json (scripts/pr-stats.ts).
// Public-safe rule from that draft: no secrets, internal IPs, hostnames, tokens, account
// details, tool paths or schedule internals. Sections the draft marks [TODO] are left out
// until Pedro supplies the fact. Nothing here is invented: a study's `sources` field names
// where a fact came from when it did not come from the draft.

export type Accent = 'blue' | 'red' | 'yellow' | 'violet';

/** A screenshot under a section's paragraphs. `file` names a file in public/studies/<slug>/. */
export interface Shot {
  file: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  badge?: string;
  transcript?: string;
}

/** One figure tile: a value, what it counts and an optional line of detail. */
export interface Fact {
  label: string;
  value: string;
  detail?: string;
}

/** A table of words under a section's paragraphs. The first column names each row. */
export interface DataTable {
  caption: string;
  columns: string[];
  rows: string[][];
}

export interface Section {
  heading: string;
  paragraphs: string[];
  shots?: Shot[];
  table?: DataTable;
}

export interface CaseStudy {
  slug: string;
  /** ISO date (YYYY-MM-DD) the work finished. Drives the sort order. */
  date: string;
  /** The home page leads with the featured study. */
  featured?: boolean;
  /** Where the facts came from. Never rendered. */
  sources?: string[];
  title: string;
  tag: string;
  accent: Accent;
  summary: string;
  stat: { value: string; label: string };
  /** Two to four figures, shown as tiles above the sections. Each must come from the study's own text. */
  facts?: Fact[];
  sections: Section[];
  skills: string[];
}

export const site = {
  name: 'Pedro Delgadillo',
  domain: 'pdlab.dev',
  role: 'I build systems with AI.',
  tagline: 'Infrastructure, agents and the gates between them.',
  intro:
    'I run a homelab platform shaped like AWS, on three Proxmox nodes, and I run it with a team of AI agents. Every change goes through a pull request, a review and a gate that decides what merges on its own.',
  background:
    'I hold a degree in web development and a master\'s in computer science, and I worked for one year at Apple as a full-stack engineer.',
  github: 'https://github.com/petedillo',
  linkedin: 'https://www.linkedin.com/in/petedillo',
  org: 'https://github.com/PeteDio-Labs',
};


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
  if (s.facts !== undefined) {
    if (!Array.isArray(s.facts) || s.facts.length < 2 || s.facts.length > 4) bad('"facts" needs 2 to 4 entries');
    for (const f of s.facts) if (!f?.label?.trim() || !f?.value?.trim()) bad('each fact needs a label and a value');
  }
  for (const sec of s.sections) {
    const t = sec.table;
    if (!t) continue;
    if (!t.caption?.trim() || !Array.isArray(t.columns) || t.columns.length < 2 || !Array.isArray(t.rows) || !t.rows.length) bad(`table in "${sec.heading}" needs a caption, 2 or more columns and rows`);
    for (const r of t.rows) if (!Array.isArray(r) || r.length !== t.columns.length || r.some((c: unknown) => typeof c !== 'string' || !c.trim())) bad(`every row of the table in "${sec.heading}" needs ${t.columns.length} non-empty cells`);
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

/** The home page shows the featured study (or the newest, when none is flagged) and the newest of the rest. */
export const featured: CaseStudy = studies.find((s) => s.featured) ?? studies[0];
export const latest: CaseStudy | undefined = studies.find((s) => s !== featured);

export const tags: string[] = [...new Set(studies.map((s) => s.tag))].sort();
