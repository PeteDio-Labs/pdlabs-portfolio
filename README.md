# pdlabs-portfolio

Pedro Delgadillo's portfolio for `pdlab.dev`: case studies about building systems with AI,
on toonish-ui, an original cartoon component kit (`PET-809`, under the `PET-773` epic).
The site is static HTML rendered by TypeScript under Bun and styled with Tailwind CSS.

## Commands

You need Bun 1.4.4 or later, because `bun.lock` uses lockfile version 2. CI pins the same version.

| Command | Does |
|---|---|
| `bun install` | Installs Tailwind, TypeScript and the Bun types |
| `bun run build` | Renders every page and compiles the CSS into `dist/` |
| `bun run dev` | Builds, then serves `dist/` on `http://localhost:8080` |
| `bun test` | Tests the pages |
| `bun run typecheck` | Runs `tsc --noEmit` |

## Layout

| Path | Holds |
|---|---|
| `content/studies/<slug>.json` | One file per case study: text, `date`, `tag`, `accent`, `stat`, `skills`, optional `featured` and `sources`. Add a file to add a study |
| `src/content.ts` | Site details, and the loader that checks every study file and fails the build on a bad one |
| `src/pages.ts` | Page templates: home, `/work`, case study, kit and 404 |
| `build.ts` | Writes `dist/` and fails when a page or the CSS is missing |
| `serve.ts` | Local preview server |
| `ui/` | toonish-ui: the component CSS. See `ui/README.md` |
| `tailwind.config.js` | The design tokens |

The home page shows the featured study and the newest other one. `/work.html` lists every study
newest first and, with JavaScript, sorts by date or title and filters by topic. The query string
keeps the choice (`?sort=oldest&tag=Agents`). Without JavaScript the list stays in date order.
The build also writes `studies.json`, the same list without the bodies.

Pages are flat files (`/work/<slug>.html`), so S3 and CloudFront can serve them with no
rewrite function.

## Content rules

The case studies come from draft 2 in the project files. They hold no secrets, internal IP
addresses, hostnames, tokens, account details, tool paths or schedule internals. A test fails
the build when a draft marker or a private-network address appears in a page. Sections the
draft left open are filled only from a named source (the PR statistics in `data/pr-stats.json`,
the agent's own spec, the Vault SSH roles or the model audit), and a study's `sources` field names that
source.

## Deploy

Deploy is not set up yet. The plan is S3 and CloudFront, built from `petedio-iac` and
deployed by a GitHub Actions job over OIDC.
