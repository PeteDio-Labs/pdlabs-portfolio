# sync-staging

Source: `.github/workflows/sync-staging.yml`

| | |
|---|---|
| **Trigger** | `push` to `main`, `workflow_dispatch`. |
| **Runner** | GitHub-hosted (`ubuntu-latest`) |
| **Touches** | Merges `main` into `staging` with a merge commit (no rebase, no force). |
| **Vault** | None. |
| **Secrets** | `github.token` with `contents: write`. |
| **Gates** | Keeps staging's own `.github` directory, because the token cannot push workflow changes. On a conflict it opens a PR from `main` into `staging` and fails the run. The push starts no workflow. The log prints the `main` commit and the `staging` commit before and after. |
| **Run it** | Runs on each push to `main`. |
