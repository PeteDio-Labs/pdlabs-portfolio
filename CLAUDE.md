# pdlabs-portfolio (agent context)

Pedro's public portfolio at `pdlab.dev`: static HTML rendered by TypeScript under Bun, with
Tailwind and the toonish-ui kit. `README.md` covers the commands, layout and production
signals; this file holds only the rules.

- **Bun only,** with native `fetch`. Before you push, run `bun run typecheck`, `bun test` and
  `bun run build`; the `ci.yml` workflow runs them.
- **The site is public.** A case study holds no secret, internal IP address, hostname, token,
  account detail, tool path or schedule internal. A test fails the build on a draft marker or
  a private-network address; do not weaken it. Fill a figure only from a named source and list
  that source in the study's `sources` field.
- **No cookies and no web storage.** A test enforces it. Add a consent banner only with the
  first cookie.
- **Add a study as one file** in `content/studies/<slug>.json`. The loader fails the build on a
  bad file; fix the file, not the loader.
- **Pages are flat files** (`/work/<slug>.html`) so S3 and CloudFront serve them with no rewrite
  function. Keep scripts out of the page body, because the CSP allows scripts from `self` and the
  analytics host only.
- **Deploy runs on push to `main`** through `deploy.yml`: S3 sync and a CloudFront invalidation,
  using the `production` environment. A push to `main` is a production release, so review the
  rendered output of a visual change before you open the PR.
- **Infrastructure lives in `petedio-iac`** (`modules/portfolio-site`, `environments/portfolio`).
  CSP, HSTS and the bucket policy change there, not here. Do not run `terraform apply` by hand.
- **README drift:** the README's Deploy section predates `deploy.yml`. Fix it when you edit that file.
- **Merges follow the gate** in the vault's working agreement, section 5. A thread opens a PR and
  follows the workspace `full-send` skill. Write prose in Google developer documentation style.
