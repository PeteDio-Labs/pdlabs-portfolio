# toonish-ui

An original cartoon component kit for the pdlab.dev portfolio: thick ink outlines, hard
offset shadows, halftone and bouncy motion, like a comic-book page: electric blue, red, yellow
and violet on deep navy, with cream panels.
It uses HTML and Tailwind CSS, compiled with the Tailwind CLI under Bun (`PET-809`).

## Commands

The kit builds with the site from the repository root: `bun run build` compiles
`ui/toonish.css` with the tokens in `tailwind.config.js`.
The kit page, `/ui.html`, shows every component.

## Tokens

The tokens are in the root `tailwind.config.js`. The spacing grid, type scale, radius names, spring
easing and accessibility floor come from the PeteDio house tokens (petedio-workspace
`.claude/skills/apple-design/references/tokens.md`). The colors break from that set on purpose.

| Token | Value | Use |
|---|---|---|
| `toon-ground` | `#0c1240` | Page background |
| `toon-ink` | `#0a0a1f` | Outlines, and text on every fill |
| `toon-paper` | `#fff6dc` | Panels and bubbles; text on the ground |
| `toon-blue` | `#3d7bff` | Fill and shadow |
| `toon-red` | `#ff3d3d` | Fill and shadow |
| `toon-yellow` | `#ffd60a` | Fill and shadow |
| `toon-violet` | `#9b7bff` | Fill and shadow |

Ink on the darkest fill (blue) measures 5.1:1, and paper on the ground measures 16:1.
Both pass WCAG AA.

## Components

`toon-btn` (plus `-red`, `-yellow`, `-paper`, and `toon-wiggle` for squash and stretch on hover),
`toon-card` (plus `toon-corner` for a number disc and `toon-pop` for a staggered pop-in),
`toon-heading` (plus `-xl`), `toon-link`, `toon-badge` (plus `-blue`, `-yellow`, `-violet`),
`toon-nav`, `toon-callout`, `toon-footer`, `toon-frame` (a comic panel for an image or SVG, with
`toon-panel-tilt`), `toon-bubble`, `toon-caption` (a narrator's box), `toon-burst` (a starburst,
`-spin` or `-hero`) and `toon-speed` (speed lines). The kit owns its keyframes in `toonish.css`,
because Tailwind writes a theme keyframe only for an `animate-*` utility.
Add `toon-dots` to `<body>` for the halftone ground. Every animation and transition stops
under `prefers-reduced-motion`.

## Display type

Display text is set in Bangers with an ink outline and a hard shadow in the paired colour.
`toon-type` wraps each letter in a span (the templates do this in `src/pages.ts`), so every
other letter tilts a little. `toon-type-live` bobs the letters in turn, with
`animation-delay` from each span's `--i`, and `toon-type-flat` sets them straight for a
figure. `--toon-fill` and `--toon-shade` set the colours. The text stays real text.

The hand-drawn lettering engine that came before it was removed on 2026-11-03, when Pedro
said he hated the lettering. It is in the history before that date.

## Fonts

Body text uses DM Sans and display text uses Bangers. Both come from Google Fonts under the
SIL Open Font License 1.1. No Cuphead art, fonts or traced shapes are used.
