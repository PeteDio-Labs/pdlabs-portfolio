# pdlabs-portfolio

Pedro Delgadillo's portfolio for `pdlab.dev`: case studies about building systems with AI,
on [toonish-ui](https://github.com/PeteDio-Labs/toonish-ui), an original cartoon component kit (`PET-809`, under the `PET-773` epic). The kit's tokens, CSS, script and fonts install from a tagged release (`bun add github:PeteDio-Labs/toonish-ui#vX.Y.Z`). The kit page, `/ui.html`, stays in this repo.
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
| `tailwind.config.js` | This site's Tailwind config: the toonish-ui preset plus the content globs |

The home page shows the featured study and the newest other one. `/work.html` lists every study
newest first and, with JavaScript, sorts by date or title and filters by topic. The query string
keeps the choice (`?sort=oldest&tag=Agents`). Without JavaScript the list stays in date order.
The build also writes `studies.json`, the same list without the bodies.
It also writes a read-only JSON API: `/api/studies.json` lists the studies and `/api/studies/<slug>.json` returns one study with its sections. CloudFront sends `Access-Control-Allow-Origin: *` on `/api/*` only.

Pages are flat files (`/work/<slug>.html`), so S3 and CloudFront can serve them with no
rewrite function.

## Production signals

| Signal | Where |
|---|---|
| Analytics | Cloudflare Web Analytics, cookieless. The build adds the beacon only when `CF_ANALYTICS_TOKEN` is set, and the privacy page text follows that setting. Case-study opens show as page views of `/work/<slug>.html`, with the referrer. Set the token as a public build variable, not a secret |
| Cookies | None, so there is no banner. A test fails the build if a page or `site.js` sets a cookie or uses web storage. Add a consent banner only with the first cookie |
| Legal | `/privacy.html` and `/terms.html`, from `src/legal.ts`, linked in every footer |
| Search and LLMs | `robots.txt` (allows all crawlers), `sitemap.xml`, `llms.txt`, Open Graph and Twitter tags, JSON-LD `ProfilePage` on the home page, and `public/og.png` |
| Headers | CSP and HSTS come from the CloudFront response headers policy in `petedio-iac` (`modules/portfolio-site`). The pages carry no inline script, so the CSP allows scripts from `self` and the analytics host only |

## Content rules

The case studies come from draft 2 in the project files. They hold no secrets, internal IP
addresses, hostnames, tokens, account details, tool paths or schedule internals. A test fails
the build when a draft marker or a private-network address appears in a page. Sections the
draft left open are filled only from a named source (the PR statistics in `data/pr-stats.json`,
the agent's own spec, the Vault SSH roles or the model audit), and a study's `sources` field names that
source.

## Branches

- **Case studies and content go to `main` by pull request.** They skip `staging`.
- **UI changes go to `staging` first.** Push to `staging`, check the result on the staging site, then
  open a pull request from `staging` into `main`.
- **`.github/workflows/sync-staging.yml` merges `main` into `staging` on every push to `main`.**
  It uses a merge commit and never force-pushes, so `staging` keeps the content that landed on
  `main`. The merge keeps `staging`'s own `.github` directory, because the workflow token cannot
  push workflow-file changes. When the merge conflicts, the workflow opens a pull request from
  `main` into `staging` as a flag and fails, so the conflict shows as a red check. To resolve it,
  merge `origin/main` into `staging` locally and push `staging`, then close the pull request. Don't use
  the web conflict editor on that pull request: it commits to `main`.

## Deploy

Deploy is not set up yet. The plan is S3 and CloudFront, built from `petedio-iac` and
deployed by a GitHub Actions job over OIDC.
