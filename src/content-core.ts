// The parts of the content module that run in the browser as well as in the build: the types, the site
// details and the values derived from the studies. The loader that reads content/studies/*.json stays in
// content.ts because it uses the file system. The client bundle swaps content.ts for a module that embeds the same data.

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
    'I hold a B.S. in web development from Full Sail University, where I graduated as salutatorian. I am studying for an M.S. in computer science, and I worked for one year at Apple as a full-stack engineer.',
  github: 'https://github.com/petedillo',
  linkedin: 'https://www.linkedin.com/in/petedillo',
  org: 'https://github.com/PeteDio-Labs',
};

/** The home page shows the featured study (or the newest, when none is flagged) and the newest of the rest. */
export function derive(studies: CaseStudy[]) {
  const featured: CaseStudy = studies.find((s) => s.featured) ?? studies[0]!;
  const latest: CaseStudy | undefined = studies.find((s) => s !== featured);
  const tags: string[] = [...new Set(studies.map((s) => s.tag))].sort();
  return { featured, latest, tags };
}
