# pdlabs-portfolio

Pedro Delgadillo's portfolio for `pdlab.dev`: four case studies about building systems with AI,
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
| `src/content.ts` | Case-study text and site details. Edit content here |
| `src/pages.ts` | Page templates: home, case study, kit and 404 |
| `build.ts` | Writes `dist/` and fails when a page or the CSS is missing |
| `serve.ts` | Local preview server |
| `ui/` | toonish-ui: the component CSS. See `ui/README.md` |
| `tailwind.config.js` | The design tokens |

Pages are flat files (`/work/<slug>.html`), so S3 and CloudFront can serve them with no
rewrite function.

## Content rules

The case studies come from draft 2 in the project files. They hold no secrets, internal IP
addresses, hostnames, tokens, account details, tool paths or schedule internals. A test fails
the build when a draft marker or a private-network address appears in a page. Sections the
draft left open are filled only from a named source (the PR statistics in `data/pr-stats.json`,
the agent's own spec, the Vault SSH roles or the model audit), and `src/content.ts` names that
source in a comment.

## Deploy

Deploy is not set up yet. The plan is S3 and CloudFront, built from `petedio-iac` and
deployed by a GitHub Actions job over OIDC.
