# deploy

Source: `.github/workflows/deploy.yml`

| | |
|---|---|
| **Trigger** | `push` to `main`, `workflow_dispatch`. |
| **Runner** | GitHub-hosted (`ubuntu-latest`), environment `production`. |
| **Touches** | Syncs `dist/` to the S3 bucket, invalidates CloudFront for pdlab.dev, then requests every page. |
| **Vault** | None. |
| **Secrets** | Environment secrets `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (the deploy IAM user), usable only by `main`. Variables: `BUCKET`, `DISTRIBUTION_ID`, `DEPLOY_IDENTITY_ARN`, `CF_ANALYTICS_TOKEN` (a public beacon token). |
| **Gates** | Fails if the secrets are absent. The key reaches the AWS steps only, not install or build. Tests and the build must pass first. `sts get-caller-identity` must equal `DEPLOY_IDENTITY_ARN`. `s3 sync --delete` refuses an empty `dist/`. After the invalidation completes, the job fetches the home page, studies index and each study and fails on any answer but 200. One deploy at a time. The account SCP blocks OIDC (PET-816), hence a stored IAM-user key. |
| **Run it** | Merge to `main`. UI work goes through the `staging` branch first. |
