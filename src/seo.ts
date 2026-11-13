import { site, studies } from './content.ts';

const origin = `https://${site.domain}`;
const urlOf = (file: string) => (file === 'index.html' ? `${origin}/` : `${origin}/${file}`);

/** Allows every crawler, including the AI ones, and points them at the sitemap and llms.txt. */
export const robotsTxt = () =>
  `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;

/** `dates` maps a file to its own lastmod (a study's finish date); other files get `lastmod`. */
export const sitemapXml = (files: string[], lastmod = new Date().toISOString().slice(0, 10), dates: Record<string, string> = {}) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files
    .sort()
    .map((f) => `  <url><loc>${urlOf(f)}</loc><lastmod>${dates[f] ?? lastmod}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`;

/** llms.txt: a plain summary for language models, written from the same content as the pages. */
export const llmsTxt = () => `# ${site.name} (pdlab.dev)

> ${site.role} ${site.tagline}

${site.intro}

${site.background}

Pedro is looking for a role building systems with AI: infrastructure, agent workflows and review gates.

## Case studies

${studies.map((s) => `- [${s.title}](${origin}/work/${s.slug}.html): ${s.summary.replace(/[`*]/g, '')}`).join('\n')}

- [All case studies, sortable](${origin}/work.html)
- [studies.json](${origin}/studies.json): the same list as data (slug, date, tag, title, summary, headline figure, url)

## Links

- [LinkedIn](${site.linkedin}): the way to reach Pedro about a role
- [GitHub](${site.github})
- [PeteDio-Labs on GitHub](${site.org})
- [Privacy](${origin}/privacy.html)
- [Terms](${origin}/terms.html)
`;
