# ci

Source: `.github/workflows/ci.yml`

| | |
|---|---|
| **Trigger** | `pull_request`, `push` to `main`. |
| **Runner** | GitHub-hosted (`ubuntu-latest`) |
| **Touches** | Nothing outside the checkout. |
| **Vault** | None. |
| **Secrets** | None. |
| **Gates** | Typecheck, `bun test`, build, then Playwright Chromium and `bun run test:a11y` (axe on every built page at 390 and 1280 px). Accessibility is a hard rule: do not skip or relax it. |
| **Run it** | Open a PR. |
