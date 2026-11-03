import { test, expect } from 'bun:test';
import { toonWord, GLYPHS } from './toonletter';

test('every letter and digit has a glyph', () => {
  for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') expect(GLYPHS[c]).toBeDefined();
});

test('renders three layers per glyph and keeps the text as a label', () => {
  const svg = toonWord('Pedro');
  expect(svg).toContain('aria-label="Pedro"');
  expect(svg.match(/<path /g)?.length).toBe(15);
  expect(svg).not.toContain('data-missing');
});

test('reports characters it cannot draw instead of dropping them silently', () => {
  expect(toonWord('A#B')).toContain('data-missing="#"');
});

test('output is deterministic', () => {
  expect(toonWord('Bounce')).toBe(toonWord('Bounce'));
});

test('escapes the label', () => {
  expect(toonWord('A&B')).toContain('aria-label="A&amp;B"');
});
