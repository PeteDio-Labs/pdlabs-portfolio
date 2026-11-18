# live-check

Source: `.github/workflows/live-check.yml`

| | |
|---|---|
| **Trigger** | `schedule` at minutes 17 and 47 each hour, `workflow_dispatch`. |
| **Runner** | GitHub-hosted (`ubuntu-latest`) |
| **Touches** | Reads the public site only. |
| **Vault** | None. |
| **Secrets** | None. |
| **Gates** | Fails the run (GitHub emails) when the site is down or a hardening header is missing. Catches faults between deploys: DNS, certificate, CloudFront. |
| **Run it** | `gh workflow run live-check.yml`. |
