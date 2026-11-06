// orbShader.ts: the Globe 39 orb as a Skia runtime shader (SkSL).
// Ported from FINAL_prototype.html's WebGL fragment shader (identical in the Home, Library and Remote tabs).
// Only the locked product paths are kept; the prototype's switches are fixed at their locked values:
//   uB39 = 1 (the board's Globe 39 look), strands = "Light bloom", peak effect = Light leak, rest = Corona,
//   press = Sink (the ripple, the dev overlay and the old critique look are gone).
// With uB39 = 1 the palette's hue spread (uRot) no longer affects anything, so it is not an input.
// Status: production-ready once checked on a device (MOTION.md, The orb; the lab in lab/MotionLab.tsx).
//
// Coordinates: Skia's fragment y runs down, WebGL's runs up, so p.y is flipped to keep the light from the upper left.
// Output is premultiplied, as the WebGL canvas was (premultipliedAlpha: true).

export const ORB_SKSL = `
uniform float2 uRes;
uniform float uT;      // the orb's clock, seconds x sqrt(speed)
uniform float uG;      // palette walk: fraction between two colours
uniform float uIdx;    // palette walk: current colour index 0..7
uniform float uPress;  // Sink: 0..1
uniform float uFlat;   // 1 = Remove animations (no motion, no hue walk)
uniform float uSpin;   // swirl phase (accumulates while swirl > 0)
uniform float4 uFx;    // effect: rim, glow width, glow strength, edge softness
uniform float uLeak;   // Light leak push (bloom only)
uniform float uRing;   // Corona's thin ring
uniform float uStr;    // rim strands strength
uniform float uSw;     // 1 = Long exposure running (pearl -> scene colours)
uniform float uProg;   // Long exposure progress 0..1
uniform float3 uLab[8];  uniform float uChr[8];   // the scene's 8 colours, OKLab + chroma
uniform float3 uLabP[8]; uniform float uChrP[8];  // the pearl palette, OKLab + chroma

const float R = 0.46;

float3 lab2rgb(float3 c) {
  float l_ = c.x + 0.3963377774*c.y + 0.2158037573*c.z;
  float m_ = c.x - 0.1055613458*c.y - 0.0638541728*c.z;
  float s_ = c.x - 0.0894841775*c.y - 1.2914855480*c.z;
  float l = l_*l_*l_, m = m_*m_*m_, s = s_*s_*s_;
  float3 lin = clamp(float3(4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
                            -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
                            -0.0041960863*l - 0.7034186147*m + 1.7076147010*s), 0.0, 1.0);
  return mix(lin*12.92, 1.055*pow(lin, float3(1.0/2.4)) - 0.055, step(0.0031308, lin));
}

// the scene palette at position x (0..8, wraps): smooth weights between neighbours, chroma held, +22% chroma at mid-blends
float3 palLab(float x) {
  float3 acc = float3(0.0); float cw = 0.0, ws = 0.0, wm = 0.0;
  for (int k = 0; k < 8; k++) {
    float d = abs(mod(x - float(k) + 4.0, 8.0) - 4.0); float w = max(0.0, 1.0 - d); w = w*w*(3.0 - 2.0*w);
    acc += uLab[k]*w; cw += uChr[k]*w; ws += w; wm = max(wm, w);
  }
  acc /= max(ws, 1e-4); cw /= max(ws, 1e-4);
  float mid = clamp(2.0*(1.0 - wm/max(ws, 1e-4)), 0.0, 1.0);
  float c = length(acc.yz); if (c > 1e-4) acc.yz *= cw*(1.0 + 0.22*mid)/c;
  acc.x -= 0.05*mid; return acc;
}

float3 palLabP(float x) {
  float3 acc = float3(0.0); float cw = 0.0, ws = 0.0;
  for (int k = 0; k < 8; k++) {
    float d = abs(mod(x - float(k) + 4.0, 8.0) - 4.0); float w = max(0.0, 1.0 - d); w = w*w*(3.0 - 2.0*w);
    acc += uLabP[k]*w; cw += uChrP[k]*w; ws += w;
  }
  acc /= max(ws, 1e-4); cw /= max(ws, 1e-4); float c = length(acc.yz); if (c > 1e-4) acc.yz *= cw/c; return acc;
}

// Long exposure: each pixel's colour = mix(pearl, scene, b); a slow swirl field nudges b ahead or behind mid-blend only
float3 col(float x, float ns) {
  float3 tgt = palLab(x);
  if (uSw < 0.5) return tgt;
  float pr = uProg;
  float b = clamp(pr + 0.42*sin(3.14159*pr)*(ns*2.0 - 1.0), 0.0, 1.0); b = b*b*(3.0 - 2.0*b);
  return mix(palLabP(x), tgt, b);
}

float3 hueRot(float3 c, float a) { float s = sin(a), k = cos(a); return float3(c.x, k*c.y - s*c.z, s*c.y + k*c.z); }
float3 atLeastL(float3 c, float L) { float d = max(L - c.x, 0.0); return float3(c.x + d, c.yz*(1.0 + d*0.6)); }
float fieldF(float2 p, float t) {
  float2 q = p/R; float a = 0.5 + t*0.045; float ca = cos(a), sa = sin(a);
  float2 r2 = float2(ca*q.x + sa*q.y, -sa*q.x + ca*q.y);   // GLSL mat2(c,-s,s,c)*q, column-major
  return smoothstep(-1.55, 1.55, r2.y + 0.22*sin(r2.x*1.1 + t*0.12));
}

half4 main(float2 fc) {
  float2 p = (fc - 0.5*uRes)/(0.5*min(uRes.x, uRes.y)); p.y = -p.y;
  float r = length(p); float an = atan(p.y, p.x);
  float mo = 1.0 - uFlat; float t = (uT*0.8 + uSpin)*mo; float T = (uT + uSpin)*mo;
  float2 dir = r > 0.0001 ? p/r : float2(1.0, 0.0);
  float ns = 0.5;
  if (uSw > 0.5) {
    float2 q = p/R; float tt = uT*0.2;
    float2 w = q + 0.32*float2(sin(q.y*1.5 + tt), sin(q.x*1.3 - tt*0.8));
    ns = 0.5 + 0.25*sin(w.x*1.7 + tt*0.7) + 0.25*sin(w.y*1.4 - tt*0.6 + 1.2*sin(length(q)*1.8 + tt*0.5));
  }
  float base = uIdx + uG;
  const float CA = 0.02; const float SPAN = 1.6; const float HUE = 0.7; const float FR = 14.0; const float FS = 1.6; const float GLOBE = 0.55;
  const float LIT = 0.3; const float DARK = 0.3;
  float RIM = min(0.85*(1.0 + uFx.x), 1.0);
  float2 off = dir*CA;
  float fR = fieldF(p + off, t), fG = fieldF(p, t), fB = fieldF(p - off, t);
  float3 lR = hueRot(col(base + fR*SPAN, ns), (fR - 0.5)*HUE + CA*FR);
  float3 lG = hueRot(col(base + fG*SPAN, ns), (fG - 0.5)*HUE);
  float3 lB = hueRot(col(base + fB*SPAN, ns), (fB - 0.5)*HUE - CA*FR);
  float l = dot(p/R, normalize(float2(-0.6, 0.7)));
  float shade = smoothstep(0.15, -1.0, l)*DARK;
  float light = smoothstep(0.0, 1.0, l)*LIT*(1.0 - smoothstep(0.0, R, r)*0.5);
  float rimm = smoothstep(R*(0.68 - 0.12*uFx.x), R*0.99, r)*RIM;
  float rx = base + 0.8 + 0.7*sin(an + T*0.05);
  float3 rimLab = atLeastL(hueRot(col(rx, ns), 0.9*sin(an + 1.3 + T*0.04)), 0.7);
  float3 nrm = float3(p/R, sqrt(max(0.0, 1.0 - dot(p/R, p/R))));
  float diff = dot(nrm, normalize(float3(-0.45, 0.55, 0.7)));
  float gsh = smoothstep(0.7, -0.45, diff)*GLOBE; float ghl = pow(max(diff, 0.0), 3.0)*GLOBE*0.55;
  float3 outc = float3(0.0);
  for (int k = 0; k < 3; k++) {
    float3 L = k == 0 ? lR : (k == 1 ? lG : lB);
    L.x -= 0.22*shade; L.yz *= 1.0 + 0.35*shade; L.x += 0.12*light; L.x -= 0.28*gsh; L.yz *= 1.0 + 0.45*gsh; L.x += 0.13*ghl; L = mix(L, rimLab, rimm);
    float3 rgb = lab2rgb(L); if (k == 0) outc.r = rgb.r; else if (k == 1) outc.g = rgb.g; else outc.b = rgb.b;
  }
  float e = 0.05*(1.0 - 0.45*uPress)*(1.0 + uFx.w)*(1.0 + 1.2*uLeak);
  float3 ins = float3(1.0 - smoothstep(R - e, R + e, r*(1.0 - CA*FS)), 1.0 - smoothstep(R - e, R + e, r), 1.0 - smoothstep(R - e, R + e, r*(1.0 + CA*FS)));
  float d = max(r - R, 0.0);
  float kk = 5.0/(1.0 + uFx.y);
  kk *= 1.0 - uLeak*0.55*(0.5 + 0.5*sin(an*3.0 + T*0.45)*sin(an*5.0 - T*0.32));
  float lk = clamp(uLeak*3.0, 0.0, 1.0);
  float wOld = 1.0 - smoothstep(0.26 + 0.08*uFx.y, 0.54, d);
  float wNew = 1.0 - smoothstep(0.0, 0.5, d); wNew *= wNew;
  float halo = exp(-d*kk)*(0.266 + 0.08*uPress)*(1.0 + uFx.z)*mix(wOld, wNew, lk);
  float dr = (d - 0.03)/0.02;
  halo += uRing*0.55*exp(-dr*dr);   // pow(x, 2.0) with a negative x is undefined on mobile GPUs: square instead
  float hx = base + 0.9*sin(an + T*0.02) + 0.6;
  float3 hl = hueRot(col(hx, ns), 0.8*sin(an + 0.6 + T*0.03) + 0.4*cos(2.0*an - T*0.02));
  float3 lc = lab2rgb(atLeastL(hl, 0.68));
  lc = mix(lc, float3(1.0, 0.42, 0.24), 0.1);   // the board's warm tint in the halo
  float grey = dot(lc, float3(0.299, 0.587, 0.114));
  lc = mix(lc, mix(float3(grey), float3(1.0), 0.5), 0.85*0.7*clamp(uLeak*2.0, 0.0, 1.0)*step(0.001, uStr));   // bloom: the glow reads as light
  float h = clamp(halo, 0.0, 1.0);
  float3 rgb = outc*ins + lc*h*(1.0 - ins); float a = (ins.r + ins.g + ins.b)/3.0; a = a + h*(1.0 - a);
  // rim strands, Light bloom: 4 strands, width x0.9, brightness 0.7, half-circle arcs, speed x0.9, out-of-round x0.8, 40% toward white
  float st = 0.0;
  for (int k = 0; k < 4; k++) {
    float fk = float(k);
    float ang = an - (uSpin*(1.5 + 0.5*mod(fk, 4.0)) + uT*mo*0.03*(1.0 + fk))*0.9;
    float rk = R*(1.0 + 0.8*(0.026*sin(2.0*ang + fk*1.7) + 0.016*sin(3.0*ang - fk*2.3)) + 0.010*(fk - 1.5)*0.8*0.75);
    float wd = (0.008 + 0.003*mod(fk, 4.0))*0.9;
    float b1 = (r - rk)/wd, b2 = b1/3.5;
    float band = 0.65*exp(-b1*b1) + 0.4*exp(-b2*b2);
    float arc = smoothstep(0.0, 1.0, sin(ang + fk*2.1));
    st += band*arc*(0.8 - 0.08*fk);
  }
  st = clamp(st*uStr*0.7, 0.0, 1.0);
  float3 sc = mix(lc, float3(1.0), 0.4);
  float sa = st*0.85; rgb = rgb*(1.0 - sa) + sc*sa; a = a*(1.0 - sa) + sa;
  // the pale bloom that opens with the strands: light, not colour
  float sg = uStr*0.24*exp(-d*3.0)*(1.0 - smoothstep(0.1, 0.72, d))*(1.0 - ins.g);
  float3 gc = mix(mix(lc, float3(dot(lc, float3(0.299, 0.587, 0.114))), 0.65), float3(0.98, 0.96, 0.93), 0.15 + 0.3*0.65);
  rgb += gc*sg*(1.0 - a); a += sg*(1.0 - a);
  return half4(half3(rgb), half(a));
}
`;

/** The effect table (FINAL's VARS): the peak is Light leak, the rest is Corona at 35%. */
export const PEAK = { fx: [0.4, 0.9, 0.6, 0.4], leak: 1, ring: 0 };
export const REST_FX = { fx: [0.6, 0.1, 0.25, 0.0], leak: 0, ring: 1 };
export const REST = 0.35;
/** Light bloom scales the Light-leak push by 0.3 so it stays a calm, round glow. */
export const LEAK_SCALE = 0.3;
