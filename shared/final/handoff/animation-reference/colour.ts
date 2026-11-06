// colour.ts: the colour maths every animation shares (OKLab), ported 1:1 from FINAL_prototype.html.
// Lives next to Orb/ and BackgroundWash/. Both import it. It has no React, so screens never need to.
// Status: production-ready (plain TypeScript, no platform APIs).

export type Hex = string; // "#rrggbb"
export type Lab = [number, number, number]; // OKLab: L, a, b

/** Before a check-in, during "Reading your answers", with Light off: the pearl palette (MOTION.md, The orb). */
export const PEARL: Hex[] = ['#E9D6BE', '#D3E2D1', '#D9D8EE', '#CDE5E4', '#EED8C9', '#E7E2C4', '#D4DEEC', '#E0D5E3'];
export const GROUND: Hex = '#f7f3ea';

const hex = (h: Hex): [number, number, number] => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
function toLin(v: number) {
  'worklet';
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function toLab(h: Hex): Lab {
  const c = hex(h).map(toLin);
  const l = Math.cbrt(0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2]);
  const m = Math.cbrt(0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2]);
  const s = Math.cbrt(0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2]);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function labHex(L: Lab): Hex {
  const l_ = L[0] + 0.3963377774 * L[1] + 0.2158037573 * L[2];
  const m_ = L[0] - 0.1055613458 * L[1] - 0.0638541728 * L[2];
  const s_ = L[0] - 0.0894841775 * L[1] - 1.291485548 * L[2];
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return '#' + lin.map(v => { v = Math.min(1, Math.max(0, v)); v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; return Math.round(v * 255).toString(16).padStart(2, '0'); }).join('');
}

/** Straight sRGB mix (used only for the Reduce-motion check-in blend and the wash's legacy tints). */
export function mixHex(a: Hex, b: Hex, t: number): Hex {
  const A = hex(a), B = hex(b);
  return '#' + A.map((x, i) => Math.round((x * (1 - t) + B[i] * t) * 255).toString(16).padStart(2, '0')).join('');
}

/** Any palette to exactly 8 colours in lamp order: 1 colour repeats, 4 colours repeat as 1 2 3 4 1 2 3 4 (FINAL's Remote). */
export function toEight(cols: Hex[]): Hex[] {
  if (!cols.length) return PEARL;
  return Array.from({ length: 8 }, (_, k) => cols[k % cols.length]);
}

/** The orb's uniforms for a palette: 8 OKLab colours, flattened, and each one's chroma. */
export function orbLab(cols: Hex[]): { lab: number[]; chr: number[] } {
  const L = toEight(cols).map(toLab);
  return { lab: L.flat(), chr: L.map(v => Math.hypot(v[1], v[2])) };
}

/** 8 colours as sRGB 0..1, 24 numbers. The Reduce-motion check-in blends these (mixHex), not OKLab. */
export function srgb8(cols: Hex[]): number[] {
  return toEight(cols).flatMap(hex);
}

/** OKLab + chroma from 24 sRGB numbers. A worklet, so the quick check-in blend can run on the UI thread. */
export function labFromSrgb(rgb: number[]): { lab: number[]; chr: number[] } {
  'worklet';
  const lab: number[] = [];
  const chr: number[] = [];
  for (let i = 0; i < 8; i++) {
    const c = [rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]].map(toLin);
    const l = Math.cbrt(0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2]);
    const m = Math.cbrt(0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2]);
    const s = Math.cbrt(0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2]);
    const L = [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ];
    lab.push(L[0], L[1], L[2]);
    chr.push(Math.hypot(L[1], L[2]));
  }
  return { lab, chr };
}

/** The wash's uniforms: 4 colours as OKLab + chroma (L, a, b, C). FINAL feeds it palette colours 1, 3, 5, 7. */
export function washLab(cols: Hex[]): number[] {
  const four = cols.length >= 8 ? [cols[0], cols[2], cols[4], cols[6]] : Array.from({ length: 4 }, (_, k) => cols[k % cols.length]);
  return four.map(toLab).flatMap(L => [L[0], L[1], L[2], Math.hypot(L[1], L[2])]);
}
