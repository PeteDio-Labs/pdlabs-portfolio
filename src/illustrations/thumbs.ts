// One illustration per case-study tag, shown at the top of each card. Thumbnails are decorative
// (aria-hidden): the card text says what the study is. Inline SVG keeps the CSP (img-src 'self') and
// the dist budget unaffected.
import { HEX, type Accent } from 'toonish-ui/markup';
import { INK, PAPER, GROUND, BLUE, RED, YEL, VIO, box, circ, line } from './shapes.ts';

const SCENES: Record<string, (s: string) => string> = {
  // A branch that passes through a gate before it reaches main.
  GitOps: (s) =>
    line('M50 120H350') + line('M110 120V60H200') + line('M200 60H300V120', 6) +
    circ(50, 120, 13, BLUE) + circ(110, 60, 13, YEL) + circ(350, 120, 13, RED) +
    box(215, 38, 70, 44, PAPER, s) + line('M232 62l12 12l24-26', 8, BLUE),
  // Five steps up, a flag on top.
  Adoption: (s) =>
    [0, 1, 2, 3, 4].map((i) => box(40 + i * 62, 130 - i * 20, 52, 24 + i * 20, [BLUE, VIO, YEL, RED, PAPER][i], i === 4 ? s : '')).join('') +
    line('M332 36V10', 5) + `<path d="M334 10h38l-10 12l10 12h-38z" fill="${RED}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`,
  // A padlock with a key beside it.
  Security: (s) =>
    line('M160 70V56a32 32 0 0 1 64 0v14', 10) + box(140, 70, 104, 76, YEL, s) + circ(192, 100, 10, INK) + line('M192 104v22', 8) +
    line('M270 110h70M320 110v22M340 110v16', 7) + circ(264, 110, 14, PAPER),
  // A server stack with a recovery arrow around it.
  Resilience: (s) =>
    [0, 1, 2].map((i) => box(150, 30 + i * 38, 100, 30, i === 1 ? PAPER : BLUE, i === 0 ? s : '') + circ(168, 45 + i * 38, 5, i === 1 ? RED : YEL)).join('') +
    line('M300 60a64 64 0 0 1-8 76', 7, RED) + `<path d="M280 134l14 14l8-20z" fill="${RED}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` +
    line('M100 110a64 64 0 0 1 8-76', 7, YEL) + `<path d="M120 36l-14-14l-8 20z" fill="${YEL}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
  // Two meshing gears and a power switch.
  Operations: (s) => {
    const gear = (cx: number, cy: number, r: number, fill: string) => {
      const teeth = Array.from({ length: 8 }, (_, i) => `<rect x="${cx - 9}" y="${cy - r - 10}" width="18" height="20" fill="${fill}" transform="rotate(${i * 45} ${cx} ${cy})"/>`).join('');
      return teeth + circ(cx, cy, r, fill) + circ(cx, cy, r / 3, GROUND);
    };
    return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">${gear(150, 85, 34, BLUE)}${gear(236, 100, 26, YEL)}</g>` + box(300, 62, 54, 60, PAPER, s) + line('M327 74v22', 8, RED);
  },
  // Stacked blocks, a wall under construction.
  Infrastructure: (s) =>
    box(60, 120, 90, 30, BLUE) + box(160, 120, 90, 30, VIO) + box(260, 120, 90, 30, BLUE) + box(110, 82, 90, 30, YEL) + box(210, 82, 90, 30, RED) + box(160, 44, 90, 30, PAPER, s),
  // A table, a bar chart and a database drum.
  Data: (s) =>
    box(40, 40, 140, 100, PAPER, s) + line('M40 70H180M40 100H180M100 40V140', 4) +
    [0, 1, 2].map((i) => box(222 + i * 36, 120 - (i + 1) * 28 + 8, 26, (i + 1) * 28 + 12, [BLUE, RED, YEL][i])).join(''),
  // Three stations on a loop: a conveyor of work.
  Automation: (s) =>
    line('M70 90H330', 6) + box(40, 66, 56, 48, BLUE, s) + box(172, 66, 56, 48, YEL) + box(304, 66, 56, 48, RED) +
    `<path d="M108 76l20 14l-20 14z" fill="${PAPER}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M240 76l20 14l-20 14z" fill="${PAPER}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` +
    line('M60 130a150 40 0 0 0 280 0', 5, VIO),
  // A friendly robot head.
  Agents: (s) =>
    line('M200 36V54', 6) + circ(200, 30, 9, RED) + box(135, 54, 130, 92, BLUE, s) + circ(172, 92, 16, PAPER) + circ(228, 92, 16, PAPER) + circ(176, 94, 6, INK) + circ(224, 94, 6, INK) + box(172, 120, 56, 14, YEL),
  // A small neural network: three layers, one path lit up.
  'AI infra': (s) => {
    const cols = [[35, 85, 135], [28, 69, 110, 151], [60, 110]].map((ys, c) => ys.map((y) => [70 + c * 95, y]));
    const edges = cols[0].flatMap((a) => cols[1].map((b) => line(`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`, 3))).concat(cols[1].flatMap((a) => cols[2].map((b) => line(`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`, 3))));
    const lit = line(`M${cols[0][1][0]} ${cols[0][1][1]}L${cols[1][2][0]} ${cols[1][2][1]}L${cols[2][0][0]} ${cols[2][0][1]}`, 9, YEL);
    const nodes = cols.flatMap((c, ci) => c.map(([x, y]) => circ(x, y, 14, ci === 0 ? BLUE : ci === 1 ? VIO : RED)));
    return edges.join('') + lit + nodes.join('') + box(328, 66, 56, 52, PAPER, s) + line('M342 92l10 10l20-22', 7, BLUE);
  },
};

const FALLBACK = (s: string) => box(110, 40, 180, 90, PAPER, s) + line('M130 70h140M130 90h100M130 110h120', 6, BLUE);

/** One illustration per case-study tag, shadowed in the study's accent color. */
export function thumb(tag: string, accent: Accent): string {
  const scene = (SCENES[tag] ?? FALLBACK)(HEX[accent]);
  return `<div class="mb-s4 overflow-hidden rounded-toon border-toon border-toon-ink leading-[0] [&>svg]:block [&>svg]:h-auto [&>svg]:w-full" aria-hidden="true"><svg viewBox="0 0 400 170" focusable="false"><rect width="400" height="170" fill="${GROUND}"/><g fill="#fff" opacity=".07"><circle cx="24" cy="24" r="3"/><circle cx="48" cy="24" r="3"/><circle cx="72" cy="24" r="3"/><circle cx="352" cy="148" r="3"/><circle cx="376" cy="148" r="3"/></g><g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${scene}</g></svg></div>`;
}

