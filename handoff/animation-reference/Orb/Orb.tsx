// Orb.tsx: the Globe 39 orb (MOTION.md, sections 3 and 5) for React Native.
// One component for Home (176), the check-in (136), the Library scene view (176) and the Remote (100).
// The shader is orbShader.ts, checked pixel for pixel against FINAL's WebGL orb.
// Status: production-ready, checked on an Android phone (MOTION.md, The orb).
//
// Words used in this folder, and where you see them (MOTION.md, "Orb vocabulary", has the full table):
//   Pearl        the pale palette before any check-in (PEARL in colour.ts). Home idle, "Reading your answers" start, Remote with Light off.
//   Halo         the soft glow around the orb. It is part of the same canvas (that is why the canvas is size / 0.46).
//   Light leak   the calm glow plus rim strands that flare for about 3 s after Set the scene (Light bloom). uLeak, uStr.
//   Corona       the thin bright ring just outside the edge of an orb that is ON NOW. Home after Set the scene, the scene
//                that is on in the Library, 1.10x. uRing. The bloom blends from Light leak into Corona.
//   Strands      the thin arcs that sweep around the rim during Light bloom and Long exposure. uStr.
//   Swirl        the slow movement inside the orb during Light bloom and Long exposure. uSwirl.
//   Sink         pressing Home's orb: it shrinks 4.5 % and the edge sharpens. It never starts anything.

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Canvas, Rect, Shader, Skia } from '@shopify/react-native-skia';
import Animated, { Easing, useAnimatedStyle, useDerivedValue, useFrameCallback, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { labFromSrgb, orbLab, PEARL, srgb8, toEight, type Hex } from '../colour';
import { bloom, longExposure, rest, undo, type OrbMotion } from './orbMotion';
import { LEAK_SCALE, ORB_SKSL, PEAK, REST, REST_FX } from './orbShader';

const effect = Skia.RuntimeEffect.Make(ORB_SKSL);
const PEARL_PACK = orbLab(PEARL);
const PEARL_SRGB = srgb8(PEARL);
// CSS `ease`, which FINAL uses for the Remote orb's brightness (opacity .4s).
const cssEase = Easing.bezier(0.25, 0.1, 0.25, 1);

export type OrbHandle = {
  /** Light bloom (MOTION.md, check E): Home and the scene view, when Set the scene is tapped. */
  bloom: () => void;
  /** Undo the bloom (MOTION.md, check E). */
  undo: () => void;
  /** Jump to the rested state, no animation. on = the scene is on now: 1.10x with the Corona ring. off = plain pearl or scene orb at 1.0x. */
  rest: (on: boolean) => void;
  /**
   * Long exposure (MOTION.md, check D), the "Reading your answers…" animation: the pearl palette develops into `scene`.
   * Set `colours` to `scene` in onDone, not before. onDone fires when the result text should appear (4.15 s, or 1.2 s with Remove animations).
   */
  longExposure: (scene: Hex[], onDone?: () => void) => void;
  pressIn: () => void;
  pressOut: () => void;
};

export type OrbProps = {
  /** The orb's own diameter in dp. Home 176, check-in questions 136, scene view 176, Remote 100. The canvas is larger, so the halo fits. */
  size: number;
  /** The scene's colours, lamp order. One colour repeats (the Remote with Cycle off holds one); four repeat to eight. Pearl until a check-in. */
  colours?: Hex[];
  /** Palette walk, one colour every 6 s. On Home and the scene view always on. Remote: on only while Cycle is on. Off while Remove animations is on. */
  walk?: boolean;
  /** Remote Cycle speed, 0.2 to 3.0 (0.2 + 2.8 x the slider). The clock moves by its square root, the walk by the speed. */
  speed?: number;
  /** Android's Remove animations. Leave unset and the orb follows the phone. Pass a value only to override it. */
  reduceMotion?: boolean;
  /** Remote brightness: 0.35 + 0.65 x the ring, or 0.92 with Light off. Eases over 0.4 s when it changes. */
  opacity?: number;
  /** Home only. Pressing sinks the orb (MOTION.md, check C). There is no onPress: pressing the orb never sets a scene. */
  pressable?: boolean;
  /** Where the clock begins, so two orbs don't move in step. The Remote uses a random 0..20. */
  clockStart?: number;
};

export const Orb = forwardRef<OrbHandle, OrbProps>(function Orb(
  { size, colours = PEARL, walk = true, speed = 1, reduceMotion, opacity = 1, pressable = false, clockStart = 0 },
  ref,
) {
  const reduce = reduceMotion ?? useReducedMotion();
  const box = Math.round(size / 0.46);
  const scale = useSharedValue(1);
  const fxP = useSharedValue(0);
  const rm = useSharedValue(0);
  const str = useSharedValue(0);
  const swirl = useSharedValue(0);
  const prog = useSharedValue(1);
  const sw = useSharedValue(0);
  const mix = useSharedValue(-1);
  const motion = useMemo<OrbMotion>(() => ({ scale, fxP, rm, str, swirl, prog, sw, mix }), [scale, fxP, rm, str, swirl, prog, sw, mix]);

  const clk = useSharedValue(clockStart);
  const pos = useSharedValue(0);
  const spin = useSharedValue(0);
  const press = useSharedValue(0);
  const pressTarget = useSharedValue(0);
  const reduceV = useSharedValue(reduce ? 1 : 0);
  const walkV = useSharedValue(walk ? 1 : 0);
  const speedV = useSharedValue(speed);
  const opacityV = useSharedValue(opacity);
  const sceneSrgb = useSharedValue<number[]>(srgb8(colours));
  const sceneLab = useSharedValue<number[]>(orbLab(toEight(colours)).lab);
  const sceneChr = useSharedValue<number[]>(orbLab(toEight(colours)).chr);

  const key = colours.join(',');
  useEffect(() => {
    const eight = toEight(colours);
    sceneSrgb.value = srgb8(eight);
    const pack = orbLab(eight);
    sceneLab.value = pack.lab;
    sceneChr.value = pack.chr;
    // colours is read through `key` (the joined list), so a new array with the same colours doesn't restart the walk
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => { reduceV.value = reduce ? 1 : 0; }, [reduce, reduceV]);
  useEffect(() => { walkV.value = walk && !reduce ? 1 : 0; }, [walk, reduce, walkV]);
  useEffect(() => { speedV.value = speed; }, [speed, speedV]);
  const opacityMounted = useRef(false);
  useEffect(() => {
    if (!opacityMounted.current) { opacityMounted.current = true; opacityV.value = opacity; return; }
    opacityV.value = withTiming(opacity, { duration: 400, easing: cssEase });
  }, [opacity, opacityV]);

  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;
  const cancelThink = useRef<(() => void) | null>(null);
  const stopThink = () => { cancelThink.current?.(); cancelThink.current = null; };
  useEffect(() => () => stopThink(), []);

  useImperativeHandle(ref, () => ({
    bloom: () => { stopThink(); bloom(motion, reduceRef.current); },
    undo: () => { stopThink(); undo(motion, reduceRef.current); },
    rest: (on: boolean) => { stopThink(); rest(motion, on); },
    longExposure: (scene: Hex[], onDone?: () => void) => {
      stopThink();
      const eight = toEight(scene);
      sceneSrgb.value = srgb8(eight);
      const pack = orbLab(eight);
      sceneLab.value = pack.lab;
      sceneChr.value = pack.chr;
      cancelThink.current = longExposure(motion, reduceRef.current, () => { cancelThink.current = null; onDone?.(); });
    },
    pressIn: () => { pressTarget.value = 1; },
    pressOut: () => { pressTarget.value = 0; },
  }), [motion, sceneSrgb, sceneLab, sceneChr, pressTarget]);

  useFrameCallback(frame => {
    'worklet';
    const dt = Math.min(0.05, Math.max(0, (frame.timeSincePreviousFrame ?? 0) / 1000));
    if (reduceV.value < 0.5) {
      const k = speedV.value;
      clk.value += dt * Math.sqrt(k);
      if (walkV.value > 0.5) pos.value += (dt / 6) * k;
      spin.value += dt * swirl.value * 0.9;
    }
    const target = pressTarget.value;
    press.value += (target - press.value) * Math.min(1, dt * (target > 0.5 ? 14 : 7));
  });

  const uniforms = useDerivedValue(() => {
    const reduce = reduceV.value > 0.5;
    const fp = reduce ? Math.min(fxP.value, REST) : fxP.value;
    const restMix = rm.value;
    const fx = [
      (PEAK.fx[0] * (1 - restMix) + REST_FX.fx[0] * restMix) * fp,
      (PEAK.fx[1] * (1 - restMix) + REST_FX.fx[1] * restMix) * fp,
      (PEAK.fx[2] * (1 - restMix) + REST_FX.fx[2] * restMix) * fp,
      (PEAK.fx[3] * (1 - restMix) + REST_FX.fx[3] * restMix) * fp,
    ];
    let lab = sceneLab.value;
    let chr = sceneChr.value;
    const t = mix.value;
    if (t >= 0) {
      const blended: number[] = [];
      const from = PEARL_SRGB;
      const to = sceneSrgb.value;
      for (let i = 0; i < 24; i++) blended.push(from[i] * (1 - t) + to[i] * t);
      const pack = labFromSrgb(blended);
      lab = pack.lab;
      chr = pack.chr;
    }
    const P = pos.value;
    return {
      uRes: [box, box],
      uT: clk.value,
      uG: P - Math.floor(P),
      uIdx: ((Math.floor(P) % 8) + 8) % 8,
      uPress: press.value,
      uFlat: reduce ? 1 : 0,
      uSpin: spin.value,
      uFx: fx,
      uLeak: PEAK.leak * (1 - restMix) * LEAK_SCALE * fp, // Light leak: strongest at the start of the bloom, gone once Corona has taken over
      uRing: restMix * fp, // Corona: 0 until the bloom hands over, then 0.35 at rest
      uStr: reduce ? 0 : str.value,
      uSw: sw.value > 0.5 ? 1 : 0,
      uProg: prog.value,
      uLab: lab,
      uChr: chr,
      uLabP: PEARL_PACK.lab,
      uChrP: PEARL_PACK.chr,
    };
  });

  const anim = useAnimatedStyle(() => ({
    opacity: opacityV.value,
    transform: [{ scale: scale.value * (reduceV.value > 0.5 ? 1 : 1 - 0.045 * press.value) }],
  }));

  if (!effect) return null;
  const hit = Math.round(size * 1.1); // a press counts within 0.55 x the orb's size of its centre
  return (
    // The canvas (size / 0.46) is much bigger than the orb and overlaps its neighbours, so it must never take touches:
    // pointerEvents none on the picture, box-none on the wrapper. Only the optional Pressable below can be pressed.
    <View pointerEvents="box-none" style={{ width: box, height: box }}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, anim]}>
        <Canvas style={{ width: box, height: box }}>
          <Rect x={0} y={0} width={box} height={box}>
            <Shader source={effect} uniforms={uniforms} />
          </Rect>
        </Canvas>
      </Animated.View>
      {pressable ? (
        <Pressable
          accessible={false}
          onPressIn={() => { pressTarget.value = 1; }}
          onPressOut={() => { pressTarget.value = 0; }}
          style={{ position: 'absolute', width: hit, height: hit, left: (box - hit) / 2, top: (box - hit) / 2, borderRadius: hit / 2 }}
        />
      ) : null}
    </View>
  );
});
