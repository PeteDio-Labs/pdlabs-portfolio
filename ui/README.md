# toonish-ui

An original cartoon component kit for the pdlab.dev portfolio: thin ink outlines, short hard
shadows and a gentle lift on hover, like a calm comic-book page: blue, red, yellow and violet
on deep navy, with off-white panels.
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
| `toon-paper` | `#f3efe6` | Panels and bubbles; text on the ground |
| `toon-blue` | `#5f8dff` | Fill and shadow |
| `toon-red` | `#f2706a` | Fill and shadow |
| `toon-yellow` | `#f2c94c` | Fill and shadow |
| `toon-violet` | `#a995f0` | Fill and shadow |

Ink on the darkest fill (blue) measures 5.1:1, and paper on the ground measures 16:1.
Both pass WCAG AA.

## Components

`toon-btn` (plus `-red`, `-yellow`, `-paper`, and `toon-wiggle` for squash and stretch on hover),
`toon-card` (plus `toon-corner` for a number disc and `toon-pop` for a staggered pop-in),
`toon-heading` (plus `-xl`), `toon-link`, `toon-badge` (plus `-blue`, `-yellow`, `-violet`),
`toon-nav`, `toon-callout`, `toon-footer`, `toon-modal`, `toon-frame` (a comic panel for an image or SVG, with
`toon-panel-tilt`), `toon-bubble`, `toon-caption` (a narrator's box), `toon-burst` (a starburst,
`-spin` or `-hero`) and `toon-speed` (speed lines). The kit owns its keyframes in `toonish.css`,
because Tailwind writes a theme keyframe only for an `animate-*` utility.
`toon-dots` is kept as an empty class; the halftone ground is gone. Every animation and transition stops
under `prefers-reduced-motion`.

## Modal

`toon-modal` is a native `<dialog>`, so the browser traps focus, closes it on `Esc` and makes the
page behind it inert. `src/script.ts` adds the rest: a tap on the backdrop closes it, the page stops
scrolling, and focus returns to the opener. Two ways to open one:

- **Inline:** put a `<dialog class="toon-modal">` in the page, with `toon-modal-box`, `toon-modal-head`
  and `toon-modal-body` inside, and a `data-toon-modal-open="<dialog id>"` button. Any
  `data-toon-modal-close` button inside closes it. `/ui.html` has a working example.
- **From a page:** a link with `data-toon-modal` fetches its own `href`, takes the `<article>` and shows
  it in a shared modal. The footer does this for `/privacy.html` and `/terms.html`. Without
  JavaScript, or if the fetch fails, the link navigates to the real page, so crawlers, the sitemap
  and no-JS visitors still get it.

The pop-in stops under `prefers-reduced-motion`, like every kit animation.

## Display type

Headings and figures are set in Space Grotesk in the accent colour. `toon-type` wraps each
letter in a span (the templates do this in `src/pages.ts`). `toon-type-comic` switches to Bangers
with an ink outline and a short shadow in the paired colour, for the logo and the hero, and
tilts every other letter a little. `toon-type-flat` sets them straight. `--toon-fill` and `--toon-shade` set the colours. The text stays real text.

The hand-drawn lettering engine that came before it was removed on 2026-11-03, when Pedro
said he hated the lettering. It is in the history before that date.

## Fonts

Body text uses DM Sans and display text uses Space Grotesk, with Bangers for the logo and hero. Both come from Google Fonts under the
SIL Open Font License 1.1. No Cuphead art, fonts or traced shapes are used.
