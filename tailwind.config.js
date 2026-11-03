/**
 * toonish-ui tokens.
 *
 * Structure (spacing grid, type scale, radii names, spring easing, durations) comes from the
 * PeteDio house tokens: petedio-workspace `.claude/skills/apple-design/references/tokens.md`.
 * Colour is the deliberate break from that set: a comic-book triad of electric blue, red and
 * yellow, plus violet, on deep navy with cream panels (Pedro, 2026-11-03, replacing the cyan
 * and orange pair). Every fill carries `ink` text, which keeps contrast at 5.1:1 or better.
 */
export default {
  content: ['./src/**/*.ts', './ui/**/*.ts', './build.ts'],
  theme: {
    extend: {
      colors: {
        toon: {
          ground: '#0c1240', // page background, deep navy
          ink: '#0a0a1f',    // outlines and text on fills
          paper: '#fff6dc',  // panels, bubbles; text on ground
          blue: '#3d7bff',
          red: '#ff3d3d',
          yellow: '#ffd60a',
          violet: '#9b7bff',
        },
      },
      fontFamily: {
        display: ['"Bowlby One"', '"Arial Black"', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      // House type scale: 11 / 12 / 13 / 15 / 17 / 20 / 22 / 28, plus display sizes.
      fontSize: {
        caption2: '11px', caption1: '12px', footnote: '13px', subhead: '15px',
        body: '17px', title3: '20px', title2: '22px', title1: '28px',
        display2: 'clamp(28px,5vw,44px)', display1: 'clamp(44px,10vw,104px)',
      },
      // House 8pt grid.
      spacing: { s1: '4px', s2: '8px', s3: '12px', s4: '16px', s5: '20px', s6: '24px', s8: '32px' },
      borderRadius: { group: '12px', card: '16px', hero: '24px', sheet: '28px', toon: '10px' },
      borderWidth: { toon: '5px' },
      boxShadow: {
        'toon-blue': '8px 8px 0 #3d7bff',
        'toon-red': '8px 8px 0 #ff3d3d',
        'toon-yellow': '8px 8px 0 #ffd60a',
        'toon-violet': '8px 8px 0 #9b7bff',
        'toon-lift': '11px 12px 0 var(--toon-shadow, #ff3d3d)',
        'toon-press': '0 0 0 var(--toon-shadow, #ff3d3d)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(.175,.885,.32,1.275)', // house spring
        bounce: 'cubic-bezier(.34,1.8,.5,1)',        // toon overshoot
      },
      transitionDuration: { fast: '200ms', normal: '300ms', slow: '500ms' },
      keyframes: {
        bob: { '0%,60%,100%': { transform: 'translateY(0)' }, '30%': { transform: 'translateY(-.12em) rotate(-3deg)' } },
        squash: { '0%,100%': { transform: 'scale(1,1)' }, '20%': { transform: 'scale(1.06,.92)' }, '45%': { transform: 'translateY(-10px) scale(.96,1.06)' } },
        pop: { '0%': { transform: 'scale(.6)', opacity: '0' }, '70%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
      animation: {
        bob: 'bob 2.4s cubic-bezier(.34,1.8,.5,1) infinite',
        squash: 'squash 2.2s cubic-bezier(.34,1.8,.5,1) infinite',
        pop: 'pop .5s cubic-bezier(.34,1.8,.5,1) both',
      },
    },
  },
  plugins: [],
};
