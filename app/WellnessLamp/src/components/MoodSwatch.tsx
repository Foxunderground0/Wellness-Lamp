import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Canvas, Fill, Shader, Skia} from '@shopify/react-native-skia';
import {DisplayMode, MoodPalette} from '../types';
import {hexToHsl, hslToHex} from '../utils/colorMath';

export interface MoodSwatchHandle {getCurrentT: () => number;}
interface Props {palette: MoodPalette | null; mode: DisplayMode; speed: number; size?: number; swatchRef?: React.RefObject<MoodSwatchHandle | null>;}
const DEFAULT_COLORS = ['#ef2674', '#ffd486', '#5b4abe', '#64cde0', '#f36f83', '#dd358c'];

const fluidShader = Skia.RuntimeEffect.Make(`
uniform float time;
uniform float size;
uniform vec3 c0; uniform vec3 c1; uniform vec3 c2;
uniform vec3 c3; uniform vec3 c4; uniform vec3 c5;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.02 + vec2(17.3, 9.1); a *= 0.5; }
  return v;
}
vec3 palette(float t) {
  t = fract(t) * 5.0;
  if (t < 1.0) return mix(c0, c1, t);
  if (t < 2.0) return mix(c1, c2, t - 1.0);
  if (t < 3.0) return mix(c2, c3, t - 2.0);
  if (t < 4.0) return mix(c3, c4, t - 3.0);
  return mix(c4, c5, t - 4.0);
}
half4 main(float2 p) {
  vec2 uv = (p - vec2(size * 0.5)) / size;
  float radius = length(uv);
  if (radius > 0.5) return half4(0.0);
  vec2 q = uv * 2.45;
  float t = time;
  // Six giant pigment pools drift beneath one stable circular silhouette.
  vec2 p0 = q - vec2(-.56 + sin(t*.13)*.16, -.46 + cos(t*.10)*.14);
  vec2 p1 = q - vec2( .52 + cos(t*.11)*.17, -.42 + sin(t*.08)*.16);
  vec2 p2 = q - vec2(-.54 + sin(t*.09+2.)*.18,  .42 + cos(t*.12)*.17);
  vec2 p3 = q - vec2( .52 + cos(t*.07+1.)*.16,  .42 + sin(t*.10+2.)*.18);
  vec2 p4 = q - vec2( .02 + sin(t*.06+3.)*.14,  .44 + cos(t*.07+1.)*.16);
  vec2 p5 = q - vec2(-.04 + cos(t*.12+2.)*.15, -.05 + sin(t*.06+1.)*.15);
  float w0 = exp(-dot(p0, p0) * 3.45);
  float w1 = exp(-dot(p1, p1) * 3.55);
  float w2 = exp(-dot(p2, p2) * 3.35);
  float w3 = exp(-dot(p3, p3) * 3.45);
  float w4 = exp(-dot(p4, p4) * 3.80);
  float w5 = exp(-dot(p5, p5) * 3.90);
  float sum = w0 + w1 + w2 + w3 + w4 + w5;
  vec3 color = (c0*w0 + c1*w1 + c2*w2 + c3*w3 + c4*w4 + c5*w5) / sum;
  float pigment = fbm(q * .95 + vec2(t*.018, -t*.014)) - .5;
  color += pigment * .035;
  float luminance = dot(color, vec3(.299, .587, .114));
  color = mix(vec3(luminance), color, 1.34);
  // A crisp spherical boundary with a narrow optical feather. Diffusion belongs
  // to the pigments inside the orb; this mask only softens its light-catching rim.
  float edge = smoothstep(.505, .482, radius);
  float rimShadow = smoothstep(.22, .50, radius);
  float light = .78 + .22 * smoothstep(-.45, .55, dot(normalize(vec3(q, .65)), normalize(vec3(-.35, -.45, .8))));
  float highlight = exp(-dot(q - vec2(-.22, -.29), q - vec2(-.22, -.29)) * 10.0);
  color *= light * (1.0 - rimShadow * .23);
  color += vec3(.16, .14, .12) * highlight;
  color += vec3(.045) * smoothstep(.48, .10, radius);
  // Skia expects premultiplied output. This is what lets the circular
  // silhouette dissolve into the shared ambient colour field.
  float alpha = edge * (.96 + highlight * .04);
  return half4(vec4(color * alpha, alpha));
}
`)!;

// A soft, palette-matched field behind the orb. Unlike the former stacked
// views, this is one continuous shader gradient with no visible geometry.
const ambientShader = Skia.RuntimeEffect.Make(`
uniform float size;
uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3;
float glow(vec2 p, vec2 origin, float spread) {
  vec2 delta = p - origin;
  return exp(-dot(delta, delta) / spread);
}
half4 main(float2 p) {
  vec2 q = (p - vec2(size * .5)) / size;
  float g0 = glow(q, vec2(-.22, -.20), .13);
  float g1 = glow(q, vec2(.23, -.18), .15);
  float g2 = glow(q, vec2(-.24, .23), .16);
  float g3 = glow(q, vec2(.22, .25), .14);
  float sum = g0 + g1 + g2 + g3;
  vec3 color = (c0 * g0 + c1 * g1 + c2 * g2 + c3 * g3) / max(sum, .001);
  // Skia shaders expect premultiplied colour. Returning the RGB channels at
  // full strength with a low alpha caused the canvas bounds to read as a flat
  // coloured rectangle on Android. This leaves just a soft radial light field.
  float edgeFade = smoothstep(.52, .13, length(q));
  float alpha = min(.25, sum * .17) * edgeFade;
  return half4(vec4(color * alpha, alpha));
}
`)!;

const liftShadowShader = Skia.RuntimeEffect.Make(`
uniform float width; uniform float height;
uniform float lift;
half4 main(float2 p) {
  vec2 center = vec2(width * .5, height * .30);
  // A wide low-opacity bloom carries the shadow farther under the orb,
  // while the smaller core gives it a believable point of contact.
  vec2 broadQ = (p - center) / vec2(width * .44, height * .25);
  vec2 coreQ = (p - center) / vec2(width * .25, height * .14);
  float broad = exp(-dot(broadQ, broadQ) * 1.22);
  float core = exp(-dot(coreQ, coreQ) * 1.35);
  // The shadow eases lighter as the orb lifts and settles darker as it drops.
  float contact = clamp(1.0 + lift * .035, .82, 1.16);
  float alpha = min(.22, (broad * .10 + core * .10) * contact);
  vec3 shadow = vec3(.26, .22, .20);
  return half4(vec4(shadow * alpha, alpha));
}`)!;

function rgb(hex: string): number[] {
  const [h, s, l] = hexToHsl(hex);
  const normalized = hslToHex(h, s, l).replace('#', '');
  return [parseInt(normalized.slice(0, 2), 16) / 255, parseInt(normalized.slice(2, 4), 16) / 255, parseInt(normalized.slice(4, 6), 16) / 255];
}

export default function MoodSwatch({palette, mode, speed, size = 260, swatchRef}: Props) {
  const colors = palette?.colors ?? DEFAULT_COLORS;
  const phaseRef = useRef(0);
  const speedRef = useRef(speed);
  const modeRef = useRef(mode);
  const floatPhaseRef = useRef(0);
  const [time, setTime] = useState(0);
  const [floatY, setFloatY] = useState(0);
  React.useImperativeHandle(swatchRef, () => ({getCurrentT: () => phaseRef.current}));
  useEffect(() => {speedRef.current = speed;}, [speed]);
  useEffect(() => {modeRef.current = mode;}, [mode]);
  useEffect(() => {phaseRef.current = 0; setTime(0);}, [colors]);
  useEffect(() => {
    const id = setInterval(() => {
      // Integrate the phase rather than calculating time × speed. That means
      // changing the speed adjusts only the future velocity—never the current
      // pigment position or the orb's visual continuity.
      const rate = modeRef.current === 'immersive' ? 4.32 * speedRef.current : .72;
      phaseRef.current += .042 * rate;
      // Keep the physical lift independent from the palette animation speed.
      // The second, quieter wave keeps the motion organic instead of perfectly
      // sinusoidal while staying subtle enough for the orb to remain centred.
      floatPhaseRef.current += .042 * .55;
      const floatWave = Math.sin(floatPhaseRef.current) * 4.8 + Math.sin(floatPhaseRef.current * .52 + 1.1) * .8;
      setTime(phaseRef.current);
      setFloatY(floatWave);
    }, 42);
    return () => clearInterval(id);
  }, []);
  const values = [...colors, ...DEFAULT_COLORS].slice(0, 6).map(rgb);
  const auraSize = size + 128;
  const floatStretch = 1 + Math.abs(floatY) * .0025;
  const directionalStretch = floatY < 0 ? -.8 : .8;
  const shadowDrift = -floatY * .22;
  const shadowScale = 1 - Math.abs(floatY) * .012;
  return (
    <View style={[styles.wrap, {width: size, height: size}]}> 
      <Canvas style={[styles.aura, {width: auraSize, height: auraSize, left: -64, top: -64}]}> 
        <Fill>
          <Shader source={ambientShader} uniforms={{size: auraSize, c0: values[0], c1: values[1], c2: values[3], c3: values[5]}} />
        </Fill>
      </Canvas>
      <Canvas pointerEvents="none" style={[styles.liftShadow, {width: size, height: 80, top: size - 8, transform: [{translateY: shadowDrift}, {scaleX: shadowScale}]}]}> 
        <Fill>
          <Shader source={liftShadowShader} uniforms={{width: size, height: 80, lift: floatY}} />
        </Fill>
      </Canvas>
      <View style={[styles.orb, {width: size, height: size, borderRadius: size / 2, transform: [{translateY: floatY + directionalStretch}, {scaleY: floatStretch}]}]}> 
        <Canvas style={{width: size, height: size}}>
          <Fill>
            <Shader source={fluidShader} uniforms={{size, time, c0: values[0], c1: values[1], c2: values[2], c3: values[3], c4: values[4], c5: values[5]}} />
          </Fill>
        </Canvas>
        <View pointerEvents="none" style={[styles.softOverlay, {borderRadius: size / 2}]} />
        <View pointerEvents="none" style={[styles.edge, {borderRadius: size / 2}]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {position: 'relative', overflow: 'visible'},
  aura: {position: 'absolute'},
  orb: {overflow: 'hidden', shadowColor: '#8d6e5b', shadowOffset: {width: 0, height: 14}, shadowOpacity: .16, shadowRadius: 24, elevation: 10},
  liftShadow: {position: 'absolute'},
  softOverlay: {position: 'absolute', inset: 0, backgroundColor: 'rgba(255,252,246,.07)'},
  edge: {position: 'absolute', inset: 0, borderWidth: 1, borderColor: 'rgba(255,255,255,.24)'},
});
