import {ALL_REFERENCE_COLORS, BASELINE_PALETTES} from '../theme/baselinePalettes';

// ─── RGB ↔ hex ────────────────────────────────────────────────────────────────

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

// ─── HSL ↔ hex ────────────────────────────────────────────────────────────────

export function hexToHsl(hex: string): [number, number, number] {
  const [ri, gi, bi] = hexToRgb(hex);
  const r = ri / 255, g = gi / 255, b = bi / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) { return [0, 0, l * 100]; }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r)      { h = ((g - b) / d + (g < b ? 6 : 0)) / 6; }
  else if (max === g) { h = ((b - r) / d + 2) / 6; }
  else                { h = ((r - g) / d + 4) / 6; }
  return [h * 360, s * 100, l * 100];
}

export function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100, ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

// ─── colour distance (perceptual HSL) ─────────────────────────────────────────

function hueDist(h1: number, h2: number): number {
  const d = Math.abs(h1 - h2);
  return Math.min(d, 360 - d);
}

function colorDist(a: string, b: string): number {
  const [h1, s1, l1] = hexToHsl(a);
  const [h2, s2, l2] = hexToHsl(b);
  // Weighted: hue counts most, then lightness, then saturation
  const dh = hueDist(h1, h2) / 180;
  const ds = Math.abs(s1 - s2) / 100;
  const dl = Math.abs(l1 - l2) / 100;
  return Math.sqrt(2.0 * dh * dh + 1.5 * dl * dl + 0.8 * ds * ds);
}

// ─── HSL interpolation (shortest-arc hue) ─────────────────────────────────────

function lerpHsl(hexA: string, hexB: string, t: number): string {
  const [h1, s1, l1] = hexToHsl(hexA);
  const [h2, s2, l2] = hexToHsl(hexB);
  let dh = h2 - h1;
  if (dh >  180) { dh -= 360; }
  if (dh < -180) { dh += 360; }
  return hslToHex(
    ((h1 + dh * t) + 360) % 360,
    s1 + (s2 - s1) * t,
    l1 + (l2 - l1) * t,
  );
}

// ─── palette smoothing ────────────────────────────────────────────────────────

/**
 * For each colour in `palette`:
 *   1. Find the nearest colour across all baseline reference palettes.
 *   2. Also find the same positional colour in the single best-matching
 *      baseline palette (keeps the palette cohesive as a set).
 *   3. Blend original → weighted combo of (nearest, positional) by `factor`.
 *
 * factor = 0 → no change.  factor = 1 → fully pulled to references.
 * A factor of 0.25–0.45 gives a subtle but noticeable improvement.
 */
export function smoothPalette(palette: string[], factor: number): string[] {
  if (factor <= 0) { return palette; }

  // Find the best-matching baseline palette (minimum total colour distance
  // summed across all positional pairs).
  let bestPaletteIdx = 0;
  let bestPaletteDist = Infinity;
  for (let pi = 0; pi < BASELINE_PALETTES.length; pi++) {
    let total = 0;
    const ref = BASELINE_PALETTES[pi];
    for (let i = 0; i < palette.length; i++) {
      total += colorDist(palette[i], ref[i % ref.length]);
    }
    if (total < bestPaletteDist) {
      bestPaletteDist = total;
      bestPaletteIdx = pi;
    }
  }
  const bestPalette = BASELINE_PALETTES[bestPaletteIdx];

  return palette.map((color, i) => {
    // Nearest colour in the full 80-colour pool
    let nearestColor = ALL_REFERENCE_COLORS[0];
    let minDist = Infinity;
    for (const ref of ALL_REFERENCE_COLORS) {
      const d = colorDist(color, ref);
      if (d < minDist) { minDist = d; nearestColor = ref; }
    }

    // Positional colour in the best-matching palette
    const positionalColor = bestPalette[i % bestPalette.length];

    // Blend: 60% toward nearest pool colour, 40% toward positional palette colour
    const target = lerpHsl(nearestColor, positionalColor, 0.4);
    return lerpHsl(color, target, factor);
  });
}

// ─── Catmull-Rom spline (for orb animation) ───────────────────────────────────

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2*p1 + (-p0+p2)*t + (2*p0-5*p1+4*p2-p3)*t2 + (-p0+3*p1-3*p2+p3)*t3);
}

/** Single colour at position `t` along a looping Catmull-Rom spline through `palette`. */
export function splineColor(palette: string[], t: number): string {
  const n = palette.length;
  const pos = ((t % n) + n) % n;
  const i = Math.floor(pos);
  const frac = pos - i;
  const rgb = palette.map(hexToRgb);
  const p0 = rgb[(i - 1 + n) % n];
  const p1 = rgb[i % n];
  const p2 = rgb[(i + 1) % n];
  const p3 = rgb[(i + 2) % n];
  return rgbToHex(
    catmullRom(p0[0],p1[0],p2[0],p3[0],frac),
    catmullRom(p0[1],p1[1],p2[1],p3[1],frac),
    catmullRom(p0[2],p1[2],p2[2],p3[2],frac),
  );
}
