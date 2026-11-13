// The read-only JSON API: the case studies as static files under /api/. build.ts writes them to
// dist/api/, and CloudFront serves them with CORS (petedio-iac, modules/portfolio-site). The
// shapes carry only what the pages already show: a study's `sources` field is never published.
import type { CaseStudy } from './content.ts';

export interface StudySummary {
  slug: string;
  date: string;
  tag: string;
  title: string;
  summary: string;
  stat: CaseStudy['stat'];
  /** The study's own page. */
  url: string;
  /** The study as JSON. */
  api: string;
}

export function summaryOf(s: CaseStudy): StudySummary {
  return { slug: s.slug, date: s.date, tag: s.tag, title: s.title, summary: s.summary, stat: s.stat, url: `/work/${s.slug}.html`, api: `/api/studies/${s.slug}.json` };
}

/** One study with its sections, skills and, when content/fit.json has one, the roles it fits. */
export function detailOf(s: CaseStudy, fit: Record<string, string>) {
  return { ...summaryOf(s), sections: s.sections, skills: s.skills, ...(fit[s.slug] ? { fit: fit[s.slug] } : {}) };
}

/** Path (relative to dist/) to JSON text, for the index and for every study. */
export function apiFiles(studies: CaseStudy[], fit: Record<string, string>): Record<string, string> {
  const json = (v: unknown) => JSON.stringify(v, null, 2) + '\n';
  return {
    'api/studies.json': json(studies.map(summaryOf)),
    ...Object.fromEntries(studies.map((s) => [`api/studies/${s.slug}.json`, json(detailOf(s, fit))])),
  };
}
