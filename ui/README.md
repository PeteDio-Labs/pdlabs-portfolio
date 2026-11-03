# toonish-ui

An original cartoon component kit for the pdlab.dev portfolio: thick ink outlines, hard
offset shadows and bouncy motion, in neon cyan, orange, yellow and violet on deep violet.
It uses HTML and Tailwind CSS, compiled with the Tailwind CLI under Bun (`PET-809`).

## Commands

The kit builds with the site from the repository root: `bun run build` compiles
`ui/toonish.css` with the tokens in `tailwind.config.js`, and `bun test` covers the lettering.
The kit page, `/ui.html`, shows every component.

## Tokens

The tokens are in the root `tailwind.config.js`. The spacing grid, type scale, radius names, spring
easing and accessibility floor come from the PeteDio house tokens (petedio-workspace
`.claude/skills/apple-design/references/tokens.md`). The colors break from that set on purpose.

| Token | Value | Use |
|---|---|---|
| `toon-ground` | `#12062a` | Page background |
| `toon-ink` | `#0a0314` | Outlines, and text on every fill |
| `toon-paper` | `#fff6e6` | Cards and bubbles; text on the ground |
| `toon-cyan` | `#19e6ff` | Fill and shadow |
| `toon-orange` | `#ff6b1a` | Fill and shadow |
| `toon-yellow` | `#ffe81a` | Fill and shadow |
| `toon-violet` | `#9b7bff` | Fill and shadow |

Ink on the darkest neon fill (violet) measures 6.4:1, and paper on the ground measures 18:1.
Both pass WCAG AA.

## Components

`toon-btn` (plus `-orange`, `-yellow`, `-paper`), `toon-card`, `toon-heading` (plus `-xl`),
`toon-link`, `toon-badge` (plus `-cyan`, `-yellow`, `-violet`), `toon-nav`, `toon-callout`,
`toon-footer`, `toon-frame` (an art slot for an image or SVG) and `toon-bubble`.
Add `toon-dots` to `<body>` for the halftone ground. Every animation and transition stops
under `prefers-reduced-motion`.

## Lettering

`lettering/toonletter.ts` draws the display type. Each glyph is an original centerline path:
A to Z, 0 to 9 and `! ? . , ' - &`. A word renders as three strokes of the same paths: an
offset shadow, a thick ink outline and a neon core. Each letter gets a small, fixed tilt and
lift, so a word renders the same on every build. No font file and no traced art is involved.

Call `toonWord(text, options)` from TypeScript at build time. It returns an SVG string. Set
`core` and `shadow` for the colors and `bounce: 0` to flatten the baseline. The build fails
when the text has a character with no glyph.

The SVG carries the text as its `aria-label`. For a page heading, keep a real `<h1>` (it can be
`sr-only`) and pass `label: false`, which marks the lettering `aria-hidden`.

## Fonts

Body text uses DM Sans and section headings use Bowlby One. Both come from Google Fonts under
the SIL Open Font License 1.1. No Cuphead art, fonts or traced shapes are used.
