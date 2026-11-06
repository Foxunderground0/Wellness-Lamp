// colourOrbShader.ts: the colour picker orb on the Remote's Light screen (screen R-4 in FINAL_screens.html).
// A still, round colour wheel with a soft halo. It is drawn once and never animates; only the knob moves.
// Ported from FINAL_prototype.html (Remote tab, `.gwo`, "colour orb"). It is not the Globe 39 orb.
// Round = hue, toward the centre = whiter (lighter, less chroma). Same OKLab maths as the JS function wheelLab below.
// Status: production-ready (plain SkSL), same check as the orb.

export const COLOUR_ORB_SKSL = `
uniform float2 uRes;

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

float3 wheelLab(float2 q) {
  float rr = min(length(q), 1.0);
  float a = atan(q.y, q.x);
  a += 0.22*sin(2.0*a + 3.1*rr)*rr;
  float s = pow(smoothstep(0.0, 1.0, rr), 0.85);
  float L = mix(0.975, 0.74, s);
  float C = 0.155*s;
  return float3(L, C*cos(a), C*sin(a));
}

half4 main(float2 xy) {
  float2 p = (xy - 0.5*uRes) / (0.5*min(uRes.x, uRes.y));   // y runs down, as FINAL's flipped p
  float R = 0.62, r = length(p);
  float2 q = p / R;
  float3 L = wheelLab(q);
  float3 nrm = float3(q, sqrt(max(0.0, 1.0 - dot(q, q))));
  float diff = dot(nrm, normalize(float3(-0.45, -0.55, 0.7)));
  float gsh = smoothstep(0.7, -0.45, diff)*0.35, ghl = pow(max(diff, 0.0), 3.0)*0.32;
  L.x -= 0.10*gsh; L.yz *= 1.0 + 0.25*gsh; L.x += 0.05*ghl;
  float an = atan(q.y, q.x);
  float3 rim = float3(0.86, 0.06*cos(an + 1.6), 0.06*sin(an + 1.6));
  L = mix(L, rim, smoothstep(0.80, 1.02, length(q))*0.35);
  float3 rgb = lab2rgb(L);
  float e = 0.13;
  float ins = 1.0 - smoothstep(R - e, R + e*0.6, r);   // a very soft edge
  float d = max(r - R*0.92, 0.0);
  float3 hl = lab2rgb(float3(0.90, 0.09*cos(an), 0.09*sin(an)));
  float halo = exp(-d*5.5)*0.36*(1.0 - ins);
  float3 col = rgb*ins + hl*halo;
  float a = ins + halo*(1.0 - ins);
  return half4(half3(col), half(a));
}
`;

/** The picker's wheel position (x, y in -1..1, y down; 1 = the edge of the wheel) to an OKLab colour. FINAL's `wheelLab`. */
export function wheelLab(qx: number, qy: number): [number, number, number] {
  const rr = Math.min(Math.hypot(qx, qy), 1);
  let a = Math.atan2(qy, qx);
  a += 0.22 * Math.sin(2 * a + 3.1 * rr) * rr;
  const t = rr * rr * (3 - 2 * rr);
  const s = Math.pow(t, 0.85);
  const L = 0.975 + (0.74 - 0.975) * s;
  const C = 0.155 * s;
  return [L, C * Math.cos(a), C * Math.sin(a)];
}

/** The wheel's radius as a fraction of the box (0.62 of the half-box). */
export const WHEEL_R = 0.62;
