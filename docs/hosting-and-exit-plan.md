# Where the case-study data lives, and the April exit plan

## Decision

The case-study data is JSON files in this repository (`content/studies/`). The build reads
them and writes plain HTML, so the deployed site has no data store, no API and no runtime
fetch. The sort and filter on `/work.html` reorder cards that are already in the page.

| Option | Monthly cost | Verdict |
|---|---|---|
| JSON in the repo, baked into HTML at build time | $0 beyond hosting | Chosen. Git is the history, the PR is the review, and the page works without JavaScript |
| JSON served from S3 or CloudFront, fetched by the page | Pennies | Rejected. A failed fetch shows an empty list, and search engines read nothing |
| DynamoDB or an API | Not free of upkeep | Rejected. Nothing here writes at runtime. Revisit only if visitors submit data |

`studies.json` in the build output holds the list without the bodies. It costs nothing and
lets another tool read the list. The page does not depend on it.

## Hosting plan

The site is a `dist/` folder of static files. The planned host is S3 behind CloudFront on the
AWS Free plan, paid from credit (`PET-722`).

- The credit ends **2027-04-20**. `PET-723` reminds you before **2027-04-06**.
- A static site this size costs cents a month at personal traffic. Confirm the real figure in
  Cost Explorer after the first full month, and record it here.

## Exit plan, before 2027-04-06

Decide one of the two paths by that date. Both need no change to the content or the build.

1. **Stay on AWS, paid.** Add a payment method and a budget alert before the credit ends, so
   the first bill is a known number. Expect cents a month.
2. **Move to free static hosting.** Point the `pdlab.dev` DNS record at a free static host,
   publish `dist/` there, then empty and delete the S3 bucket and the CloudFront
   distribution, so nothing bills after the move.

Either way, run `bun run build` and keep a copy of `dist/` as a release asset on the day you
cut over. The repository holds everything else: `content/studies/` is the data, and
`git log` is its history, so there is no export step and no database to back up.

## Deploy key and merge gate

- **Deploy key.** The account's service control policy denies the GitHub OIDC provider
  (`PET-816`), so the deploy uses the access key of `deploy-user`, held in the
  `production` environment secrets. Rotate it every 90 days with
  `petedio-iac/scripts/portfolio-deploy-key.sh`, and keep the user's policy to one bucket and
  one distribution.
- **What gates a deploy.** `deploy.yml` runs typecheck, tests and the build itself, so a red
  build never syncs. The private repository has no branch protection, so `ci` does not block a
  merge. The merge gate in the vault's working agreement, section 5, is the control.
- **Caching.** The deploy syncs everything with `max-age=300`, then re-uploads `fonts/` with a one-year
  `immutable` header and `.png` and `.svg` files with a one-day header. HTML, CSS and JS keep the short header
  because their names carry no hash.
- **Size budget.** `build.ts` fails when `dist/` passes 1.5 MB.
