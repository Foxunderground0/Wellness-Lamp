// BackgroundWash.tsx: the crochet-form wash (MOTION.md, check G) for React Native.
// Same shader for Home and the Library scene view. It evaluates FINAL's formula per pixel on the GPU,
// snapped to the prototype's 72 x 160 canvas, then blurred 20. The bleed is a soft elliptical mask that opens from the outer edges.
// Status: production-ready once checked on a phone (MOTION.md, The wash).
//
// Undo and All off recede it to the edges over 3 s, as FINAL does.

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Blur, Canvas, Group, Mask, Rect, Shader, Skia } from '@shopify/react-native-skia';
import { Easing, useDerivedValue, useFrameCallback, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { washLab, type Hex } from '../colour';
import { bleedIn, bleedOut } from '../easing';
import { BLEED_MASK_SKSL, HOME_WASH, WASH_SKSL, washBase } from './washShader';

const washEffect = Skia.RuntimeEffect.Make(WASH_SKSL);
const maskEffect = Skia.RuntimeEffect.Make(BLEED_MASK_SKSL);
const cssEase = Easing.bezier(0.25, 0.1, 0.25, 1);

export type BackgroundWashProps = {
  /** The screen the wash covers, in dp. The wash itself is drawn 6% past every edge, so the blur isn't cut off. */
  width: number;
  height: number;
  /** The scene's colours. Eight: the wash takes 1, 3, 5 and 7. Four: it uses all four. */
  colours: Hex[];
  /** Home uses 3. The Library's two slots use 0 and 1, so a swipe cross-fades two different frames. */
  seed?: number;
  /** 1 on Home and in the scene view. */
  speed?: number;
  /** How strong the wash is while it is on (the layer's opacity). Home passes HOME_WASH_OPACITY; the scene view leaves it at 0.40. */
  opacity?: number;
  /** The strength after Set the scene, when lit is true. The scene view brightens to 0.50. */
  litOpacity?: number;
  /** True while the wash should be on screen. False plays the recede. */
  shown?: boolean;
  /** After Set the scene the Library's wash brightens from 0.40 to 0.50 over 1.2 s. */
  lit?: boolean;
  /** Android's Remove animations. Leave unset and the wash follows the phone. Pass a value only to override it. */
  reduceMotion?: boolean;
};

const INSET = 0.06;

/** Home's wash strength. A touch stronger than the scene view's resting 0.40, and still below the scene view's lit 0.50.
 *  Home passes this as opacity. */
export const HOME_WASH_OPACITY = 0.46;

export function BackgroundWash({ width, height, colours, seed = 3, speed = 1, opacity = HOME_WASH.opacity, litOpacity = 0.5, shown = false, lit = false, reduceMotion }: BackgroundWashProps) {
  const reduce = reduceMotion ?? useReducedMotion();
  const boxW = width * (1 + INSET * 2);
  const boxH = height * (1 + INSET * 2);
  const base = useMemoBase(seed);
  const lab = useSharedValue<number[]>(washLab(colours));
  const key = colours.join(',');
  useEffect(() => { lab.value = washLab(colours); }, [key, lab]); // eslint-disable-line react-hooks/exhaustive-deps

  const clock = useSharedValue(0);
  const started = useSharedValue(0);
  const speedV = useSharedValue(speed);
  const reduceV = useSharedValue(reduce ? 1 : 0);
  useEffect(() => { speedV.value = speed; }, [speed, speedV]);
  useEffect(() => { reduceV.value = reduce ? 1 : 0; }, [reduce, reduceV]);

  useFrameCallback(frame => {
    'worklet';
    if (reduceV.value > 0.5) return; // one still frame: the clock stays where it was
    if (started.value === 0) started.value = frame.timestamp;
    clock.value = ((frame.timestamp - started.value) / 1000) * HOME_WASH.clockSpeed * speedV.value;
  });

  const h = useSharedValue(1.15);
  const layer = useSharedValue(0);
  const seen = useRef(false);
  useEffect(() => {
    const cover = opacity;
    if (!seen.current) {
      seen.current = true;
      h.value = shown ? -0.45 : 1.15;
      layer.value = shown ? (lit ? litOpacity : cover) : 0;
      return;
    }
    if (reduce) {
      h.value = -0.45; // the mask stays open; the opacity carries it
      layer.value = withTiming(shown ? (lit ? litOpacity : cover) : 0, { duration: 800, easing: cssEase });
      return;
    }
    // The mask does the work. Coming back on, the layer has to be visible or the bleed shows nothing.
    if (shown) layer.value = lit ? litOpacity : cover;
    h.value = withTiming(shown ? -0.45 : 1.15, { duration: shown ? 4500 : 3000, easing: shown ? bleedIn : bleedOut });
    // `lit` is animated on its own, below; including it here would restart the bleed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, reduce, h, layer]); // opacity / litOpacity are read when the bleed starts; changing them while on is handled by the effect below
  useEffect(() => {
    if (!seen.current || !shown || reduce) return;
    layer.value = withTiming(lit ? litOpacity : opacity, { duration: 1200, easing: cssEase });
  }, [lit, shown, reduce, layer, opacity, litOpacity]);

  const uniforms = useDerivedValue(() => ({
    uSize: [boxW, boxH],
    uT: clock.value,
    uSd: seed,
    uBase: base,
    uLab: lab.value,
    uEdge: HOME_WASH.edge,
    uFaint: HOME_WASH.faint,
    uFloor: 1,
    uGrid: 1,
  }));
  const maskUniforms = useDerivedValue(() => ({ uBox: [boxW, boxH], uH: h.value }));

  if (!washEffect || !maskEffect) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <Canvas style={{ position: 'absolute', left: -width * INSET, top: -height * INSET, width: boxW, height: boxH }}>
        <Mask mask={<Rect x={0} y={0} width={boxW} height={boxH}><Shader source={maskEffect} uniforms={maskUniforms} /></Rect>}>
          <Group opacity={layer}>
            <Blur blur={HOME_WASH.blur} mode="clamp" />
            <Rect x={0} y={0} width={boxW} height={boxH}>
              <Shader source={washEffect} uniforms={uniforms} />
            </Rect>
          </Group>
        </Mask>
      </Canvas>
    </View>
  );
}

function useMemoBase(seed: number): number[] {
  const ref = useRef<{ seed: number; base: number[] } | null>(null);
  if (!ref.current || ref.current.seed !== seed) ref.current = { seed, base: washBase(seed) };
  return ref.current.base;
}
