// SceneWash.tsx: the Library scene view's wash (MOTION.md, check G): Home's wash, always on (no bleed), which cross-fades
// between scenes over 1.2 s ease-in-out when the scene changes, and brightens 0.40 -> 0.50 over 1.2 s after Set the scene (`lit`).
// FINAL keeps two wash canvases ("slots") and swaps their opacity. This does the same with two BackgroundWash layers, using
// seeds 0 and 1 so the two frames differ. The second layer only exists during the cross-fade.
// Status: production-ready once checked on a phone (lab/pages/WashPage.tsx, SwipePage.tsx).

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import type { Hex } from '../colour';
import { BackgroundWash } from './BackgroundWash';

const easeInOut = Easing.bezier(0.42, 0, 0.58, 1); // CSS ease-in-out
const FADE_MS = 1200;

type Slot = { id: number; colours: Hex[]; seed: number; leaving: boolean };

export type SceneWashProps = {
  width: number;
  height: number;
  /** The current scene's colours (8). A change cross-fades. */
  colours: Hex[];
  /** After Set the scene on this scene: 0.40 -> 0.50. */
  lit?: boolean;
  /** Android's Remove animations (crossfades only in FINAL: instant here). Leave unset to follow the phone. */
  reduceMotion?: boolean;
};

export function SceneWash({ width, height, colours, lit = false, reduceMotion }: SceneWashProps) {
  const reduce = reduceMotion ?? useReducedMotion();
  const [slots, setSlots] = useState<Slot[]>([{ id: 0, colours, seed: 0, leaving: false }]);
  const lastKey = useRef(colours.join(','));
  const nextId = useRef(1);
  const key = colours.join(',');

  useEffect(() => {
    if (key === lastKey.current) return;
    lastKey.current = key;
    const id = nextId.current++;
    setSlots(prev => {
      const live = prev.filter(s => !s.leaving);
      const seed = live.length && live[live.length - 1].seed === 0 ? 1 : 0;
      return [...prev.map(s => ({ ...s, leaving: true })), { id, colours, seed, leaving: false }];
    });
    const t = setTimeout(() => setSlots(prev => prev.filter(s => s.id === id || !s.leaving)), reduce ? 0 : FADE_MS + 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <>
      {slots.map(s => (
        <FadeSlot key={s.id} leaving={s.leaving} first={s.id === 0} reduce={reduce}>
          <BackgroundWash width={width} height={height} colours={s.colours} seed={s.seed} shown lit={lit} reduceMotion={reduce} />
        </FadeSlot>
      ))}
    </>
  );
}

function FadeSlot({ leaving, first, reduce, children }: { leaving: boolean; first: boolean; reduce: boolean; children: React.ReactNode }) {
  const op = useSharedValue(first ? 1 : reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) { op.value = leaving ? 0 : 1; return; }
    op.value = withTiming(leaving ? 0 : 1, { duration: FADE_MS, easing: easeInOut });
  }, [leaving, reduce, op]);
  const st = useAnimatedStyle(() => ({ opacity: op.value }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, st]}>{children}</Animated.View>;
}
