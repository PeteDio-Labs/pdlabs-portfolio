# toonish-ui brand brief

`PET-809`. This page holds the look of pdlab.dev in one place. The tokens live in
`tailwind.config.js`, and the toonish-ui repo's README lists the components.

## Intent

Calm comic-book panels on deep navy. The layout follows Apple's restraint: one idea per screen,
generous space, one alignment. The character comes from a few cartoon touches, not from a stack of
effects. Pedro chose the palette on 2026-11-03 and rejected the earlier cyan and orange pair, the
cream, red and yellow set, and hand-drawn lettering. Don't reopen those choices.

## Rules

1. Use at most two of these on one element: ink outline, hard shadow, tilt.
2. Keep the outline at 2px and the shadow at a 4px offset.
3. Set body text and headings in a sans. Use Bangers only for the logo and the hero.
4. Use blue as the main accent, yellow for one highlight per screen, and red for links.
5. Put `toon-ink` text on every fill. Put `toon-paper` text on the ground.
6. Keep case-study text still. Motion belongs to the chrome: hover, load-in and the hero.
7. Draw original assets only. Use no Cuphead art, fonts or traced shapes.
8. No mascot. The `toon-frame` and `toon-bubble` components hold an image or a line of speech when a page needs one.
9. Design for a phone first: 390 px before any wider width. Decoration shows on a phone, and nothing traps a vertical scroll. `README.md`, "Mobile first", has the checks.
10. Accessibility is a hard rule, not a polish pass. Write semantic HTML first, use the kit components' built-in ARIA roles and labels, and meet WCAG 2.2 AA. A change that breaks it does not merge.

## Color

| Token | Value | Use |
|---|---|---|
| `toon-ground` | `#0c1240` | Page background |
| `toon-ink` | `#0a0a1f` | Outlines, and text on fills |
| `toon-paper` | `#f3efe6` | Panels; text on the ground |
| `toon-blue` | `#5f8dff` | Main accent |
| `toon-red` | `#f2706a` | Links, shadows |
| `toon-yellow` | `#f2c94c` | One highlight per screen |
| `toon-violet` | `#a995f0` | Secondary accent |

Shadow pairs: blue and red carry yellow, yellow carries blue, violet carries red.
Paper on the ground measures 15.6:1. Ink on the darkest fill (blue) measures 5.1:1. Both pass WCAG AA.

## Type

| Role | Font | License |
|---|---|---|
| Body, headings, figures | IBM Plex Sans | SIL OFL 1.1 |
| Badges, chips, labels | IBM Plex Mono | SIL OFL 1.1 |
| Logo, hero | Bangers | SIL OFL 1.1 |

Sizes follow the PeteDio house scale: 11, 12, 13, 15, 17, 20, 22 and 28px, plus three fluid display
sizes (`display2`, `display1`, `hero`). Spacing uses the 4px grid (`s1` to `s8`).

## Motion

| Name | Effect | Where |
|---|---|---|
| `toon-pop` | Scale-in with overshoot | Cards on load |
| `toon-wiggle` | Squash and stretch | Button hover |
| `toon-bob` | Letter bob | Hero and logo only |
| `toon-modal-in` | Rise and unsquash | Modal |

The easing is `cubic-bezier(.34,1.8,.5,1)`. A `prefers-reduced-motion: reduce` query stops every
animation and transition.

## Components

Button, card, heading, link, badge, nav, callout, footer, modal, frame, bubble, caption, burst and
speed lines. The showcase page left the site; `/ui.html` now redirects to the kit's case study.

## Decisions for Pedro

Approve the brief, the lettering (Bangers on the logo and hero) and the case study that replaced the showcase page.
After approval, link this brief from `PET-774`. A split of the kit into its own public repo is a later item.
