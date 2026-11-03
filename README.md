# pdlabs-portfolio

The pdlab.dev portfolio site.

## PR statistics

`data/pr-stats.json` holds merged-PR counts across the PeteDio-Labs repositories in scope, by repository, by week and by author group. To regenerate it, run `bun run scripts/pr-stats.ts`. The script needs `gh` signed in to an account that can search those repositories. It exits non-zero and writes nothing when a repository cannot be read or a count does not add up.
