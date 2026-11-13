/**
 * Tokens, type scale, spacing, radii, shadows and keyframes come from the toonish-ui preset
 * (https://github.com/PeteDio-Labs/toonish-ui). The content globs here are this site's own, plus the package's
 * sources: its script and markup helpers write class names (`toon-modal`, `toon-burst`, `toon-type`), and Tailwind
 * emits a component class only when it finds the class.
 */
import toonish from 'toonish-ui/preset';

export default {
  presets: [toonish],
  content: ['./src/**/*.ts', './build.ts', './node_modules/toonish-ui/src/behaviour.ts', './node_modules/toonish-ui/src/markup.ts'],
};
