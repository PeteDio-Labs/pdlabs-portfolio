# pdlabs-portfolio

Pedro Delgadillo's portfolio for `pdlab.dev`: case studies about building systems with AI,
on [toonish-ui](https://github.com/PeteDio-Labs/toonish-ui), an original cartoon component kit (`PET-809`, under the `PET-773` epic). The kit's tokens, CSS, script and fonts install from a tagged release (`bun add github:PeteDio-Labs/toonish-ui#vX.Y.Z`). The kit page left the site. `/ui.html` is a small page that redirects to the kit's case study.
The site is a Preact single-page app on the kit, built with Bun and styled with Tailwind CSS. Each nav tab is a page: Home (`/`), Work (`/work.html`, with a page per case study) and About (`/about.html`). A click on the nav swaps the content under a header and footer that stay put, and a short fade shows the change. The kit turns the fade off for a visitor who asked for less motion, or who turned the motion switch off.

## Commands

You need Bun 1.4.4 or later, because `bun.lock` uses lockfile version 2. CI pins the same version.

| Command | Does |
|---|---|
| `bun install` | Installs Tailwind, TypeScript and the Bun types |
| `bun run build` | Renders every page and compiles the CSS into `dist/` |
| `bun run dev` | Builds, then serves `dist/` on `http://localhost:8080` |
| `bun test` | Tests the pages |
| `bun run test:scroll` | Drives the home page's scroll film at desktop, phone and reduced motion |
| `bun run typecheck` | Runs `tsc --noEmit` |

## Layout

| Path | Holds |
|---|---|
| `content/studies/<slug>.json` | One file per case study: text, `date`, `tag`, `accent`, `stat`, `skills`, optional `featured` and `sources`. Add a file to add a study |
| `src/content.ts` | Site details, and the loader that checks every study file and fails the build on a bad one |
| `src/pages.ts` | Page content as strings, one `Page` per route: landing, about, work, case study, legal, kit and 404. `pageFor(path)` is the route table |
| `src/app.tsx` | The Preact shell (header, nav, footer, motion switch) and the sortable case-study list |
| `src/document.tsx` | The build's page writer: the head, then the shell rendered to HTML |
| `src/client.tsx` | The browser entry: hydrates the page, routes on the client, keeps the title and meta tags current, moves focus and scroll |
| `build.ts` | Writes `dist/`, bundles `app.js`, and fails when a page or the CSS is missing |
| `serve.ts` | Local preview server |
| `src/site.css` | This site's Tailwind v4 entry: the toonish-ui full entry plus one extra source |

The landing page shows the hero, the proof strip, the featured study and the newest others, and the services Pedro maintains (`SERVICES` in `src/pages.ts`: technology only, no media services, no hostnames or addresses). The About page holds the portrait, how Pedro works, the stack and the review. `/work.html` lists every study newest first and, with JavaScript, sorts by date or title and filters by topic. The query string keeps the choice (`?sort=oldest&tag=Agents`). Without JavaScript the list stays in date order.
The build also writes `studies.json`, the same list without the bodies.
It also writes a read-only JSON API: `/api/studies.json` lists the studies and `/api/studies/<slug>.json` returns one study with its sections. CloudFront sends `Access-Control-Allow-Origin: *` on `/api/*` only.

## How routing works

Every route is also a real file, so a deep link, a refresh and a crawler get the page with no script and no CloudFront rewrite. The app hydrates that markup, then handles clicks on internal links itself with the History API. A missing path gets `404.html` with a 404 status, and the app shows the 404 card. `/about` and `/work/<slug>` work too, because CloudFront already maps an extensionless path to its `.html` file, and the router accepts both.

`app.js` carries the pages, the sortable list and each study's card fields. It does not carry a study's text: the app fetches the study's own page the first time you open it and keeps the content in memory, and a failed fetch falls back to a normal page load. A link to `/#about`, `/#how` or `/#review` moves to `/about.html`.

Pages are flat files (`/work/<slug>.html`), so S3 and CloudFront can serve them with no
rewrite function.

## Production signals

| Signal | Where |
|---|---|
| Analytics | Cloudflare Web Analytics, cookieless. The build adds the beacon only when `CF_ANALYTICS_TOKEN` is set, and the privacy page text follows that setting. Case-study opens show as page views of `/work/<slug>.html`, with the referrer. Set the token as a public build variable, not a secret |
| Cookies | None, so there is no banner. A test fails the build if a page or `app.js` sets a cookie or uses web storage. Add a consent banner only with the first cookie |
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

## Mobile first

Design, build and check every page at 390 px before any wider width. Most visitors open the site on a phone.

- **Write the phone layout as the base styles.** Add `sm:`, `md:` and `lg:` classes for wider screens.
- **Check 390 px first, then 1280 px.** The page must not scroll sideways: `scrollWidth` equals the viewport width.
- **Never trap a scroll.** Don't put a sideways scroll container on a phone page. A swipe target sets
  `touch-action: pan-y`, so a vertical drag always scrolls the page.
- **Make touch targets at least 44 px.** Don't rely on hover to show anything.
- **Show decoration on a phone.** Sound effects, tilts and bursts appear at every width. Scale or move
  one for a phone; don't hide it below `md`. A test fails when a sound effect hides on a phone.

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

## Scroll film

The home hero is a scroll-driven film in the manner of the scrollcraft skill, written by hand with no dependency. `src/scroll.ts` sets `--sc-p` (0 to 1) on each `[data-sc]` element, and the rules in `src/site.css` read it: the title shrinks, the terminal rises and prints its lines, and the proof strip fades up. From 768 px wide and 760 px tall the hero pins for 220% of the screen height; below that it only reacts to scroll. The engine adds `.sc-on` to `<html>` only while motion is on, so reduced motion and the motion switch get the plain page. `bun run test:scroll` checks progress, pinning and reduced motion.
