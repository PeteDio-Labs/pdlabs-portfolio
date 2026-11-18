# pdlabs-portfolio (agent context)

The portfolio at pdlab.dev, built with Bun and the `toonish-ui` kit. `README.md` covers commands, routes and the staging flow.

- **Accessibility is a hard rule.** Semantic HTML first, ARIA roles where HTML has no word for it, and WCAG 2.2 AA. Nothing ships that fails `bun run test:a11y`, which runs axe on every built page at 390 and 1280 px, checks the skip link and a 320 px reflow, and prints what it read. CI runs it. Do not skip, relax or quarantine it to merge. Fix the page.
- **Layout is checked too.** `bun run test:layout` reads every built page at 390 and 1280 px for clipped svg icons, cut text and overlapping text, under hover on the home, work and about pages, and compares their first screens with `test/snapshots/`. It costs no tokens and CI runs it. Do not relax it to merge. Baselines come from the CI runner, because pixels depend on the browser build. To accept a deliberate visual change, push a change to `test/update-snapshots.request`; the `update-snapshots` workflow commits the new images, and you read them in the diff. `test/layout-audit.ts` is a copy of the kit's: change the kit first.
- **Fix a component in the kit, not on the page.** A defect in a `toon-*` component goes to `toonish-ui` (its `docs/principles.md` holds the same rule and its `docs/components.md` the contract per component). Then bump the pin in `package.json`.
- **Use the kit's helpers for structure:** `list()` and `row()` for rows, `skipLink()` for the skip link, `figure()` and `strip()` for figures on paper, `shot()` and `portrait()` with real alt text. Decoration (`sfx()`, `burst()`) stays `aria-hidden`.
- **Every standalone link and button is 44 px tall.** A link inside a sentence is exempt. Use `inline-flex min-h-[44px] items-center` for a link that stands alone.
- **One `h1`, headings never skip a level,** and a comic word used as a heading keeps its text in an `sr-only` span.
- **Check by hand what a tool cannot:** tab through the change, and listen to it in VoiceOver, before you open the pull request.
- **Mobile first.** Check at 390 px before 1280 px. See `README.md`.
- **UI changes go through `staging`, by pull request.** Branch off `main`, open the pull request into `staging`, and let `ci` pass, including `bun run test:layout`. Pedro reviews on a phone and says "send it" to promote. Case studies skip `staging` and go to `main`.
- Write prose in Google developer documentation style: second person, active voice, no time-anchored words.
