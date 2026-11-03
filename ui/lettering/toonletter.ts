/**
 * toonletter: the original toonish-ui display lettering.
 *
 * Each glyph is a hand-built centerline path on a 0-80 tall grid. A word renders as three
 * stacked strokes of the same paths: an offset shadow, a thick ink outline, and a neon core.
 * Letters sit on a bouncy baseline: each one gets its own small rotation and lift.
 * No font file and no traced artwork. The site renders it at build time, so pages ship static SVG.
 */

// [advance width, path]
export const GLYPHS: Record<string, [number, string]> = {
  A: [50, 'M4 80L25 0L46 80M12 52H38'],
  B: [54, 'M6 80V0H28Q46 0 46 19Q46 38 28 38H6M28 38Q50 38 50 59Q50 80 28 80H6'],
  C: [52, 'M48 14Q40 0 26 0Q4 0 4 40Q4 80 26 80Q40 80 48 66'],
  D: [52, 'M6 0V80H22Q48 80 48 40Q48 0 22 0Z'],
  E: [48, 'M44 0H6V80H44M6 40H36'],
  F: [48, 'M44 0H6V80M6 40H36'],
  G: [52, 'M48 14Q40 0 26 0Q4 0 4 40Q4 80 26 80Q48 80 48 50H28'],
  H: [52, 'M6 0V80M46 0V80M6 40H46'],
  I: [44, 'M8 0H36M22 0V80M8 80H36'],
  J: [50, 'M44 0V56Q44 80 24 80Q6 80 4 64'],
  K: [50, 'M6 0V80M44 0L8 46M20 34L46 80'],
  L: [46, 'M6 0V80H42'],
  M: [58, 'M4 80V0L28 50L52 0V80'],
  N: [52, 'M6 80V0L46 80V0'],
  O: [52, 'M26 0Q48 0 48 40Q48 80 26 80Q4 80 4 40Q4 0 26 0Z'],
  P: [52, 'M6 80V0H28Q48 0 48 21Q48 42 28 42H6'],
  Q: [54, 'M26 0Q48 0 48 40Q48 80 26 80Q4 80 4 40Q4 0 26 0ZM30 58L50 82'],
  R: [52, 'M6 80V0H28Q48 0 48 21Q48 42 28 42H6M26 42L46 80'],
  S: [52, 'M46 12Q38 0 24 0Q6 0 6 20Q6 38 26 40Q48 42 48 60Q48 80 26 80Q10 80 4 66'],
  T: [52, 'M2 0H50M26 0V80'],
  U: [52, 'M6 0V54Q6 80 26 80Q46 80 46 54V0'],
  V: [50, 'M4 0L25 80L46 0'],
  W: [58, 'M2 0L14 80L28 30L42 80L54 0'],
  X: [52, 'M6 0L46 80M46 0L6 80'],
  Y: [50, 'M4 0L25 40L46 0M25 40V80'],
  Z: [52, 'M6 0H46L6 80H46'],
  0: [52, 'M26 0Q48 0 48 40Q48 80 26 80Q4 80 4 40Q4 0 26 0ZM16 62L36 18'],
  1: [40, 'M8 14L22 0V80M8 80H36'],
  2: [52, 'M6 16Q12 0 26 0Q46 0 46 22Q46 42 6 80H46'],
  3: [52, 'M6 10Q14 0 26 0Q46 0 46 20Q46 38 24 38Q48 38 48 60Q48 80 26 80Q10 80 4 68'],
  4: [52, 'M36 80V0L4 56H48'],
  5: [52, 'M44 0H10L6 36Q14 30 26 30Q48 30 48 55Q48 80 26 80Q10 80 4 68'],
  6: [52, 'M42 6Q36 0 26 0Q4 0 4 46Q4 80 26 80Q48 80 48 58Q48 36 26 36Q10 36 4 48'],
  7: [50, 'M4 0H46L18 80'],
  8: [52, 'M26 38Q8 38 8 19Q8 0 26 0Q44 0 44 19Q44 38 26 38Q48 38 48 59Q48 80 26 80Q4 80 4 59Q4 38 26 38Z'],
  9: [52, 'M10 74Q16 80 26 80Q48 80 48 34Q48 0 26 0Q4 0 4 22Q4 44 26 44Q42 44 48 32'],
  '!': [30, 'M15 0V54M15 79V80'],
  '?': [48, 'M6 14Q12 0 24 0Q44 0 44 20Q44 36 24 44V56M24 79V80'],
  '.': [28, 'M14 79V80'],
  ',': [28, 'M16 76L10 90'],
  "'": [24, 'M12 0V18'],
  '-': [40, 'M6 44H34'],
  '&': [56, 'M50 80L12 30Q6 20 12 10Q18 0 28 0Q40 0 40 14Q40 30 14 48Q4 56 4 66Q4 80 22 80Q38 80 50 52'],
  ' ': [26, ''],
};

const DEFAULTS = {
  core: '#19e6ff',   // neon fill
  ink: '#0a0314',    // outline
  shadow: '#ff6b1a', // offset shadow
  weight: 10,        // core stroke width; the outline is weight + 12
  tracking: 14,
  bounce: 1,         // 0 sets every letter flat on the baseline
};

// Deterministic jitter, so a word renders the same on every build.
function jitter(i: number, seed: number): number {
  const x = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5; // -0.5..0.5
}

const XML: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => XML[c]);
}

/** Render text as an SVG string. Unknown characters are dropped and reported in data-missing. */
export type ToonOptions = Partial<typeof DEFAULTS> & { label?: boolean };

export function toonWord(text: string, opts: ToonOptions = {}): string {
  const o = { ...DEFAULTS, ...opts };
  const outline = o.weight + 12;
  const pad = outline / 2 + 8;
  const missing = new Set<string>();
  const parts: string[] = [];
  let x = pad;
  const seed = [...text].reduce((a, c) => a + c.charCodeAt(0), 0);
  [...text.toUpperCase()].forEach((ch, i) => {
    const g = GLYPHS[ch];
    if (!g) { missing.add(ch); return; }
    const [w, d] = g;
    if (d) {
      const rot = (jitter(i, seed) * 10 * o.bounce).toFixed(2);
      const lift = (jitter(i + 7, seed) * 8 * o.bounce).toFixed(2);
      parts.push(`<path d="${d}" transform="translate(${x} ${pad + Number(lift)}) rotate(${rot} ${w / 2} 40)"/>`);
    }
    x += w + o.tracking;
  });
  const width = Math.ceil(x - o.tracking + pad + 6);
  const height = Math.ceil(80 + pad * 2 + 16);
  const glyphs = parts.join('');
  const label = escapeXml(text);
  // label: false renders decorative lettering for use beside a real heading.
  const a11y = o.label === false ? 'aria-hidden="true" focusable="false"' : `role="img" aria-label="${label}"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ${a11y}` +
    (missing.size ? ` data-missing="${escapeXml([...missing].join(''))}"` : '') +
    `><g fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<g transform="translate(6 6)" stroke="${o.shadow}" stroke-width="${outline}">${glyphs}</g>` +
    `<g stroke="${o.ink}" stroke-width="${outline}">${glyphs}</g>` +
    `<g stroke="${o.core}" stroke-width="${o.weight}">${glyphs}</g>` +
    `</g></svg>`;
}
