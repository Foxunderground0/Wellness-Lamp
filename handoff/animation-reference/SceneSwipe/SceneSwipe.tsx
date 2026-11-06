// SceneSwipe.tsx: the Library scene view's sliding strip (MOTION.md, check H; screen L-12 in FINAL_screens.html).
// The scene names run along the top and the live orb sits under them. They move together as one strip,
// 220 dp per scene. Swipe sideways, tap a neighbouring name, or call go(+1 / -1).
// Status: written against FINAL's timings; checked on a phone in the lab (lab/pages/SwipePage.tsx).
//
// How it differs from FINAL's code, and why it looks the same:
//   FINAL keeps one live orb and paints a still of each neighbour, because WebGL contexts are expensive.
//   Here every scene's orb is its own live Orb, keyed by the scene's id. The orb that slides in is the same component
//   instance that ends up in the centre, so nothing jumps when the strip lands.
//   Neighbours are only mounted while dragging or sliding, so at rest there is one orb running.
//
// The screen owns the text below the strip (line, sound, scent, Set the scene). It refills the text in onSwap,
// which fires at 45 % of the slide, and fades it as in FINAL (opacity .22 s out, in).

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Orb, type OrbHandle } from '../Orb';
import type { Hex } from '../colour';

export type SwipeScene = {
  id: string;
  name: string;
  colours: Hex[];
  /** True for the scene that is on the lamp now: its orb sits at 1.10x with the Corona ring, as at rest after Set the scene. */
  on?: boolean;
};

export type SceneSwipeHandle = {
  /** Slide to the next (+1) or previous (-1) scene, like tapping the arrow or a neighbouring name. */
  go: (dir: 1 | -1) => void;
  /** Set the scene on the scene in the centre: its orb plays Light bloom (MOTION.md, check E). */
  bloom: () => void;
  /** Undo: the centre orb returns to a plain orb over 0.7 s. */
  undo: () => void;
  /** Put the centre orb straight into its rested look: on = 1.10x with the Corona ring, off = plain. */
  rest: (on: boolean) => void;
};

export type SceneSwipeProps = {
  scenes: SwipeScene[];
  initialIndex?: number;
  /** FINAL's scene view orb is 176 dp, the same as Home's (L-12). */
  orbSize?: number;
  /** Android's Remove animations: the strip jumps with no slide. Leave unset to follow the phone. */
  reduceMotion?: boolean;
  /** A move has started (swipe released past the threshold, or a name was tapped). The names' emphasis follows. */
  onChange?: (index: number, durationMs: number) => void;
  /** 45 % into the slide: swap the line, sound and scent text now. */
  onSwap?: (index: number) => void;
  /** The strip has landed. */
  onLand?: (index: number) => void;
};

const NBD = 220; // dp between neighbours: the names' width
const NAMES_H = 76;
const slideEase = Easing.bezier(0.2, 0.8, 0.2, 1);
const cssEase = Easing.bezier(0.25, 0.1, 0.25, 1);

export const SceneSwipe = forwardRef<SceneSwipeHandle, SceneSwipeProps>(function SceneSwipe(
  { scenes, initialIndex = 0, orbSize = 176, reduceMotion, onChange, onSwap, onLand },
  ref,
) {
  const reduce = reduceMotion ?? useReducedMotion();
  const { width } = useWindowDimensions();
  const box = Math.round(orbSize / 0.46);
  const [idx, setIdx] = useState(initialIndex); // the scene whose orb is in the centre at rest
  const [target, setTarget] = useState(initialIndex); // the scene the names point at
  const [nbOn, setNbOn] = useState(false); // neighbours mounted
  const stripX = useSharedValue(-initialIndex * NBD);
  // Each orb owns its opacity (see SwipeOrb). The strip only tells them what to do, so no orb ever changes "role" and
  // no frame can show an orb at the wrong opacity (that was the white flash on landing).
  const fades = useRef(new Map<string, OrbFade>());
  const fadeAll = (except: string | null, to: number, ms: number, delay = 0) =>
    fades.current.forEach((f, id) => { if (id !== except) f.fade(to, ms, delay); });
  const setAll = (except: string | null, v: number) =>
    fades.current.forEach((f, id) => { if (id !== except) f.set(v); });

  const idxRef = useRef(idx);
  idxRef.current = idx;
  const sliding = useRef(false);
  const finishRef = useRef<(() => void) | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cb = useRef({ onChange, onSwap, onLand });
  cb.current = { onChange, onSwap, onLand };
  const scenesRef = useRef(scenes);
  scenesRef.current = scenes;
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };
  useEffect(() => () => { clearTimers(); if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const centreId = () => scenesRef.current[idxRef.current]?.id ?? null;

  // Dragging or sliding starts: the neighbours are mounted (they fade in over 120 ms as they mount) and the centre is fully shown.
  const showNb = () => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    setNbOn(true);
    fades.current.forEach(f => f.fade(1, 120, 0));
  };
  // A drag was released without moving on: the neighbours fade away (as FINAL), then unmount.
  const hideNb = (delay: number) => {
    fadeAll(centreId(), 0, 450, delay);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => { if (!sliding.current) setNbOn(false); }, delay + 480);
  };

  // The strip has landed. Like FINAL: the centre orb (the one that slid in, the same instance) stays exactly as it is,
  // and everything else (the leaving orb, the other neighbour) goes away at once, in the same commit.
  const land = (to: number) => {
    sliding.current = false;
    finishRef.current = null;
    clearTimers();
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    stripX.value = -to * NBD;
    const keep = scenesRef.current[to]?.id ?? null;
    fades.current.get(keep ?? '')?.set(1);
    setAll(keep, 0);
    setNbOn(false);
    setIdx(to);
    setTarget(to);
    cb.current.onLand?.(to);
  };

  const slide = (to: number, velocity = 0) => {
    const from = idxRef.current;
    if (to === from || to < 0 || to >= scenesRef.current.length) return;
    if (reduceRef.current) {
      stripX.value = -to * NBD;
      setTarget(to);
      cb.current.onChange?.(to, 0);
      cb.current.onSwap?.(to);
      setIdx(to);
      cb.current.onLand?.(to);
      return;
    }
    const dur = Math.round(Math.max(300, Math.min(460, 520 - Math.abs(velocity) * 160)));
    sliding.current = true;
    showNb();
    setTarget(to);
    cb.current.onChange?.(to, dur);
    stripX.value = withTiming(-to * NBD, { duration: dur, easing: slideEase });
    // the leaving orb fades out over 60 % of the slide, so nothing is left at the screen edge (MOTION.md, check H)
    fades.current.get(scenesRef.current[from]?.id ?? '')?.fade(0, dur * 0.6, 0, 'linear');
    let swapped = false;
    const swap = () => { if (!swapped) { swapped = true; cb.current.onSwap?.(to); } };
    later(swap, Math.round(dur * 0.45));
    later(() => { swap(); land(to); }, dur + 20);
    finishRef.current = () => { cancelAnimation(stripX); swap(); land(to); };
  };

  const handles = useRef(new Map<string, OrbHandle | null>());
  const centre = () => handles.current.get(scenesRef.current[idxRef.current]?.id ?? '');
  useImperativeHandle(ref, () => ({
    go: (dir: 1 | -1) => { if (!sliding.current) { showNb(); slide(idxRef.current + dir); } },
    bloom: () => centre()?.bloom(),
    undo: () => centre()?.undo(),
    rest: (on: boolean) => centre()?.rest(on),
  }));

  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => {
      finishRef.current?.();
      cancelAnimation(stripX);
      showNb();
    },
    onPanResponderMove: (_e, g) => {
      const i = idxRef.current;
      let dx = g.dx;
      if ((dx > 0 && i <= 0) || (dx < 0 && i >= scenesRef.current.length - 1)) dx *= 0.3; // nothing that way: a little give
      stripX.value = -i * NBD + dx;
    },
    onPanResponderRelease: (_e, g) => {
      const d = g.dx, v = g.vx; // dp, dp/ms
      const go = d < -60 || (d < -14 && v < -0.45) ? 1 : d > 60 || (d > 14 && v > 0.45) ? -1 : 0;
      const i = idxRef.current;
      if (go && i + go >= 0 && i + go < scenesRef.current.length) slide(i + go, v);
      else {
        stripX.value = withTiming(-i * NBD, { duration: 300, easing: slideEase });
        hideNb(300);
      }
    },
    onPanResponderTerminate: () => {
      const i = idxRef.current;
      stripX.value = withTiming(-i * NBD, { duration: 300, easing: slideEase });
      hideNb(300);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const namesStyle = useAnimatedStyle(() => ({ transform: [{ translateX: width / 2 - NBD / 2 + stripX.value }] }), [width]);
  const orbsStyle = useAnimatedStyle(() => ({ transform: [{ translateX: width / 2 + stripX.value }] }), [width]);

  const shown = nbOn ? [idx - 1, idx, idx + 1] : [idx];
  return (
    <View style={{ width }} {...pan.panHandlers}>
      <View style={{ height: NAMES_H, overflow: 'hidden' }}>
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0, height: NAMES_H, flexDirection: 'row' }, namesStyle]}>
          {scenes.map((s, j) => (
            <NameItem key={s.id} name={s.name} current={j === target} onPress={() => { if (!sliding.current && Math.abs(j - idxRef.current) === 1) slide(j); }} />
          ))}
        </Animated.View>
      </View>
      <View style={{ height: orbSize + 16 }}>
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, orbsStyle]} pointerEvents="none">
          {shown.filter(i => i >= 0 && i < scenes.length).map(i => (
            <SwipeOrb
              key={scenes[i].id}
              scene={scenes[i]}
              startVisible={i === idx}
              onHandle={(id, h) => { handles.current.set(id, h); }}
              fades={fades.current}
              size={orbSize}
              style={{ position: 'absolute', left: i * NBD - box / 2, top: orbSize / 2 + 8 - box / 2 }}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
});

function NameItem({ name, current, onPress }: { name: string; current: boolean; onPress: () => void }) {
  const k = useSharedValue(current ? 1 : 0);
  useEffect(() => { k.value = withTiming(current ? 1 : 0, { duration: 420, easing: slideEase }); }, [current, k]);
  const st = useAnimatedStyle(() => ({ opacity: 0.48 + 0.52 * k.value, transform: [{ scale: 0.78 + 0.22 * k.value }] }));
  return (
    <Pressable onPress={onPress} style={styles.name} accessibilityRole="button" accessibilityLabel={name}>
      <Animated.View style={st}>
        <Text style={[styles.nameText, name.length > 18 && { fontSize: 22 }]} numberOfLines={2}>{name}</Text>
      </Animated.View>
    </Pressable>
  );
}

/** What the strip can ask of an orb's opacity. */
type OrbFade = {
  /** Jump to this opacity now. */
  set: (v: number) => void;
  /** Animate to this opacity (linear or FINAL's `ease`), after an optional delay. */
  fade: (to: number, ms: number, delay: number, curve?: 'ease' | 'linear') => void;
};

function SwipeOrb({ scene, startVisible, onHandle, fades, size, style }: {
  scene: SwipeScene; startVisible: boolean; onHandle: (id: string, h: OrbHandle | null) => void;
  fades: Map<string, OrbFade>; size: number; style: object;
}) {
  const orb = useRef<OrbHandle | null>(null);
  // This orb's own opacity. The centre orb starts at 1. A neighbour starts at 0 and fades in over 120 ms (the orb is
  // drawn in the state it will rest in before it shows, see the rest() call below).
  const op = useSharedValue(startVisible ? 1 : 0);
  useEffect(() => {
    const api: OrbFade = {
      set: v => { cancelAnimation(op); op.value = v; },
      fade: (to, ms, delay, curve = 'ease') => {
        const t = withTiming(to, { duration: ms, easing: curve === 'linear' ? Easing.linear : cssEase });
        op.value = delay > 0 ? withDelay(delay, t) : t;
      },
    };
    fades.set(scene.id, api);
    if (!startVisible) api.fade(1, 120, 0);
    return () => { if (fades.get(scene.id) === api) fades.delete(scene.id); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Only at mount: an orb that slides in is drawn in the state it will rest in. Changes afterwards go through the handle
  // (bloom / undo / rest), so that setting on can't cut a bloom short.
  useEffect(() => { orb.current?.rest(!!scene.on); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <Animated.View style={[style, st]}>
      <Orb ref={h => { orb.current = h; onHandle(scene.id, h); }} size={size} colours={scene.colours} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  name: { width: NBD, height: NAMES_H, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  nameText: { fontFamily: 'serif', fontSize: 28, lineHeight: 32, color: '#211c17', textAlign: 'center' },
});
