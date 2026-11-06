// washShader.ts: the crochet-form wash (MOTION.md, check G) as a Skia runtime shader (SkSL), plus the bleed mask.
// Ported 1:1 from the prototype's crochet wash (Form.draw), which FINAL runs per pixel on the CPU.
// Fixed at FINAL's values for a cream ground: no dusk ground, no photo backdrop.
// Draw WASH_SKSL snapped to FINAL's 72 x 160 canvas, then blur 20 and mask it (BackgroundWash.tsx).
// Status: production-ready once checked on a device (MOTION.md, The wash).

export const WASH_W = 72;
export const WASH_H = 160;

export const WASH_SKSL = `
uniform float2 uSize;     // the surface: 72 x 160
uniform float uT;         // clock: seconds x 1.6 x speed
uniform float uSd;        // the wash's seed (Home 3); also sets the petals per lobe: 4 + seed mod 3
uniform float uBase[6];   // each lobe's starting colour position 0..4 (washBase())
uniform float4 uLab[4];   // the 4 wash colours: OKLab L, a, b and chroma
uniform float uEdge;      // edge softness (Home 0.10)
uniform float uFaint;     // lift toward cream (Home 0.30)
uniform float uFloor;     // 1 = the legibility floor (no pixel below luminance 0.30)
uniform float uGrid;      // 1 = sample on FINAL's 72 x 160 grid (the prototype's canvas), then the view blurs 20

const float3 BG = float3(247.0, 243.0, 234.0)/255.0;
const float3 CREAM_LIN = float3(0.9301, 0.8963, 0.8228);

float4 labAt(float i) { return i < 0.5 ? uLab[0] : (i < 1.5 ? uLab[1] : (i < 2.5 ? uLab[2] : uLab[3])); }

float3 labRGB(float L, float a, float b) {
  float l_ = L + 0.3963377774*a + 0.2158037573*b, m_ = L - 0.1055613458*a - 0.0638541728*b, s_ = L - 0.0894841775*a - 1.291485548*b;
  float l = l_*l_*l_, m = m_*m_*m_, s = s_*s_*s_;
  return float3(4.0767416621*l - 3.3077115913*m + 0.2309699292*s, -1.2684380046*l + 2.6097574011*m - 0.3413193965*s, -0.0041960863*l - 0.7034186147*m + 1.707614701*s);
}
float enc(float v) { return v <= 0.0031308 ? 12.92*v : 1.055*pow(v, 1.0/2.4) - 0.055; }
// into gamut by easing chroma (up to 6 steps of x0.86), not by clipping, so the hue holds
float3 labToSRGB(float L, float a, float b) {
  float k = 1.0; float3 c = labRGB(L, a, b);
  for (int n = 0; n < 6; n++) {
    if (min(c.r, min(c.g, c.b)) >= 0.0 && max(c.r, max(c.g, c.b)) <= 1.0) break;
    k *= 0.86; c = labRGB(L, a*k, b*k);
  }
  c = clamp(c, 0.0, 1.0);
  return float3(enc(c.r), enc(c.g), enc(c.b));
}
// cream ground: lift anything darker than luminance 0.30 toward cream, in (gamma 2.2) linear light, so ink keeps 4.5:1
float3 legible(float3 c) {
  float3 l = pow(c, float3(2.2));
  float Y = dot(l, float3(0.2126, 0.7152, 0.0722));
  const float YC = 0.2126*0.9301 + 0.7152*0.8963 + 0.0722*0.8228;
  if (Y >= 0.30) return c;
  float k = (0.30 - Y)/(YC - Y);
  return pow(l + (CREAM_LIN - l)*k, float3(1.0/2.2));
}

half4 main(float2 fc) {
  float W = uSize.x, H = uSize.y;
  if (uGrid > 0.5) {                          // one sample per cell of the 72 x 160 canvas, wherever this is drawn
    float2 cell = uSize/float2(72.0, 160.0);
    fc = (floor(fc/cell) + 0.5)*cell;
  }
  float asp = H/W, t = uT, sd = uSd;
  float u = (fc.x - 0.5)/W - 0.5, v = (fc.y - 0.5)/H*asp;   // FINAL samples pixel corners: x/W, y/H
  float wu = u + 0.08*sin(1.7*v + 0.17*t + sd) + 0.04*sin(3.1*u - 0.13*t);
  float wv = v + 0.07*sin(2.3*u + 0.15*t) + 0.03*sin(3.3*v - 0.11*t);
  float K = 4.0 + mod(sd, 3.0);   // FINAL: 4 + ((i*3 + seed) % 3), the same for every lobe
  float4 Lb[6]; float C[6];
  float F = 0.0, c1 = 0.0, c2 = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float cy = 0.02 + fi*0.43 + 0.09*sin(0.07*t + fi*2.0);
    float cx = 0.26*sin(fi*2.4 + sd + 0.09*t) + 0.08*sin(0.13*t + fi*1.7);
    float r = (0.28 + 0.08*sin(fi*1.7 + sd*3.0))*0.9*(1.0 + 0.16*sin(0.11*t + fi*1.3));
    float rot = 0.10*t*(mod(fi, 2.0) > 0.5 ? 1.0 : -1.0) + fi;
    Lb[i] = float4(cx, cy, r, rot);
    float du = wu - cx, dv = wv - cy;
    float c = r*r/(du*du + dv*dv + 0.004); C[i] = c; F += c;
    if (c > c1) { c2 = c1; c1 = c; } else if (c > c2) { c2 = c; }
  }
  float PET = 0.24 + 0.07*sin(0.17*t + sd);
  float g = 0.0, ws = 0.0, Lm = 0.0, Am = 0.0, Bm = 0.0, Cm = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i); float4 l = Lb[i];
    float A = atan(wv - l.y, wu - l.x) + l.w, w = C[i]*C[i]*C[i];
    g += (2.0*abs(sin(K*A*0.5 + 0.6*sin(3.0*A))) - 1.0)*w; ws += w;
    float q = mod(uBase[i] + 1.1*sin(1.5*wu + 1.1*wv + 0.12*t + fi*1.3) + 0.8*sin(1.9*wv - 1.4*wu + fi*1.9 - 0.09*t), 4.0);
    float i0 = floor(q), f = q - i0;
    float4 a = labAt(i0), b = labAt(mod(i0 + 1.0, 4.0));
    float la = mix(a.y, b.y, f), lb = mix(a.z, b.z, f);
    float ch = mix(a.w, b.w, f)*(1.0 + 0.12*(1.0 - abs(2.0*f - 1.0)));
    float cc = length(float2(la, lb));
    if (cc > 1e-4) { la *= ch/cc; lb *= ch/cc; }
    Lm += mix(a.x, b.x, f)*w; Am += la*w; Bm += lb*w; Cm += ch*w;
  }
  g /= ws; Lm /= ws; Am /= ws; Bm /= ws; Cm /= ws;
  { float cc = length(float2(Am, Bm)); if (cc > 1e-4) { Am *= Cm/cc; Bm *= Cm/cc; } }   // hold chroma across lobes too
  float Lp = log(F) + PET*g;
  float al = clamp(Lp/uEdge, 0.0, 1.0); al = al*al*(3.0 - 2.0*al);
  float rim = pow(clamp(1.0 - Lp/0.7, 0.0, 1.0), 1.5);
  float sm = clamp(1.0 - (c1 - c2)/(c1 + c2 + 1e-6)/0.35, 0.0, 1.0); float seam = sm*sm;
  float depth = (0.5 + 0.5*sin(1.9*wu + 2.6*wv + 0.10*t + sd))*(0.5 + 0.5*sin(3.1*wv - 1.3*wu - 0.07*t));
  float pl = clamp(0.5 + 0.5*sin(2.2*wu + 1.5*wv + 0.07*t + 2.0), 0.0, 1.0); pl *= pl;
  float pale = pl*pl*(1.0 - rim)*(1.0 - seam);
  float up = 0.34*seam + 0.16*rim + 0.22*pale + 0.14*(1.0 - depth);   // folds, rims, highlights: lighter, never darker
  float Lc = Lm + (0.985 - Lm)*min(0.9, up), kc = 1.0 - 0.35*min(1.0, up);
  Lc = Lc + (0.975 - Lc)*uFaint; kc *= 1.0 - 0.42*uFaint;               // the fainter wash: lifted toward cream, same hue
  float3 rgb = labToSRGB(Lc, Am*kc, Bm*kc);
  float3 m = BG*(1.0 - al) + rgb*al;
  if (uFloor > 0.5) m = legible(m);
  return half4(half3(m), 1.0);
}
`;

/** The bleed: transparent inside an ellipse (72% x 68% of the box, centred 50% / 46%) out to radius h, opaque from h + 0.42.
 *  h runs 1.15 -> -0.45 to bleed in from every edge (4.5 s), and back to recede (3.0 s). Linear ramp, as a CSS radial-gradient. */
export const BLEED_MASK_SKSL = `
uniform float2 uBox;   // the wash box in dp (the screen plus 6% on every side)
uniform float uH;      // clear radius, in ellipse units (1.15 = all clear, -0.45 = all covered)
half4 main(float2 p) {
  float2 d = (p - float2(0.5, 0.46)*uBox)/(float2(0.72, 0.68)*uBox);
  float a = clamp((length(d) - uH)/0.42, 0.0, 1.0);
  return half4(a);
}
`;

/** FINAL's seeded random: an LCG. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

/** Each lobe's starting colour position. FINAL seeds it from the wash's seed and an internal key ("w1" on Home);
 *  any fixed key works, it only decides where each colour starts. */
export function washBase(seed = 3, key = 'w1'): number[] {
  const r = rng(seed * 7 + key.length * 131 + key.charCodeAt(0));
  return [0, 1, 2, 3, 4, 5].map(() => r() * 4);
}

/** The wash's values. Home and the Library's scene view use the same; only the strength differs (MOTION.md, check G). */
export const HOME_WASH = { edge: 0.10, faint: 0.30, opacity: 0.40, blur: 20, clockSpeed: 1.6, fps: 30 };
