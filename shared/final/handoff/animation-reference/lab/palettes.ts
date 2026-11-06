// palettes.ts: palettes for the Motion lab. Test-only: the app builds its own palettes (DATA_AND_RULES.md §3.6).
// - PALETTES: the 33 palettes (8 presets, 25 mood palettes), from palettes.data.ts.
// - fromWheelFINAL: what FINAL's Light screen does when you drag the colour orb (kept only to compare with FINAL).
// - fromPickedColour: the app's recipe from DATA_AND_RULES.md §3.6 (the old Hue screen's 8 steps, one contrasting colour,
//   and step 6, the close colour that replaces +150 degrees: hue +45, saturation -5, lightness +2). This is the one to build.
// - random generators, to check that NEW palettes also give clean, not muddy, orbs.

import { labHex, toLab, type Hex, type Lab } from '../colour';
import { wheelLab } from '../ColourOrb';
import { PALETTES } from './palettes.data';

export { PALETTES };
export type { NamedPalette } from './palettes.data';

export const byName = (name: string) => PALETTES.find(p => p.name === name)!;

/** FINAL's Light screen (`.gwo`): the 8 dots from one wheel position. Hue turns 0.18 rad per dot, chroma x1.15, a little darker. */
export function fromWheelFINAL(lab: Lab): Hex[] {
  return Array.from({ length: 8 }, (_, i) => {
    const t = (i - 3.5) * 0.18, cs = Math.cos(t), sn = Math.sin(t);
    return labHex([lab[0] - 0.03 * (i % 3) - 0.04, (lab[1] * cs - lab[2] * sn) * 1.15, (lab[1] * sn + lab[2] * cs) * 1.15]);
  });
}

// ---- the app's recipe (DATA_AND_RULES.md §3.6) ----
function hexToHsl(h: Hex): [number, number, number] {
  const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (d === 0) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1));
  const hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [((hh * 60) % 360 + 360) % 360, s * 100, l * 100];
}
function hslToHex(h: number, s: number, l: number): Hex {
  h = ((h % 360) + 360) % 360; s = Math.min(100, Math.max(0, s)) / 100; l = Math.min(100, Math.max(0, l)) / 100;
  const k = (n: number) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}
const clampS = (s: number) => Math.min(100, Math.max(15, s)); // lab-only clamps: the app uses the old colorMath.ts ones
const clampL = (l: number) => Math.min(85, Math.max(20, l));

/** The app's 8 colours from one picked colour (H, S, L), DATA_AND_RULES.md §3.6. */
export function fromPickedColour(picked: Hex): Hex[] {
  const [H, S, L0] = hexToHsl(picked);
  const L = 55; // the wheel has no lightness control; the old picker's default is [dev: use it]
  void L0;
  const step = (dh: number, ds: number, dl: number) => hslToHex(H + dh, clampS(S + ds), clampL(L + dl));
  return [
    step(0, 0, 0),
    step(15, 0, 6),
    step(-15, 0, 10),
    step(30, -8, 0),
    step(180, -18, 8), // the one contrasting colour
    step(45, -5, 2), // the close colour that replaces +150
    step(-30, 0, 5),
    step(0, -28, 18),
  ];
}

/** A random point on the colour orb (uniform over the disc), as an OKLab colour. */
export function randomWheelLab(): Lab {
  const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
  return wheelLab(Math.cos(a) * r, Math.sin(a) * r);
}

/** Mean OKLab chroma of a palette. Under about 0.05 it will read as grey; the presets run roughly 0.06 to 0.20. */
export function meanChroma(cols: Hex[]): number {
  return cols.reduce((s, c) => { const L = toLab(c); return s + Math.hypot(L[1], L[2]); }, 0) / cols.length;
}
