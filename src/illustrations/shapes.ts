// Shared colors and shapes for the illustrations. Colors come from the toonish kit.
import { HEX } from 'toonish-ui/markup';

export const INK = '#0a0a1f';
export const PAPER = '#eceff3';
export const GROUND = '#0c1240';
export const BLUE = HEX.blue;
export const RED = HEX.red;
export const YEL = HEX.yellow;
export const VIO = HEX.violet;

/** A panel with a hard offset shadow, the kit's basic shape. */
export const box = (x: number, y: number, w: number, h: number, fill: string, shadow = '', extra = '') =>
  `${shadow ? `<rect x="${x + 7}" y="${y + 7}" width="${w}" height="${h}" fill="${shadow}" stroke="none"/>` : ''}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`;
export const circ = (x: number, y: number, r: number, fill: string) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
export const line = (d: string, w = 6, stroke = INK) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

