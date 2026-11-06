// ui.tsx: small pieces shared by the Motion lab pages. Test scaffolding only; nothing here belongs in the app.

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GROUND } from '../colour';

export const INK = '#211c17';
export const MUTED = '#605a53';

/** "Remove animations" for the whole lab. Pages pass it to the components as reduceMotion. */
export const LabContext = createContext<{ reduce: boolean }>({ reduce: false });
export const useLab = () => useContext(LabContext);

export function Btn({ label, onPress, on, small }: { label: string; onPress: () => void; on?: boolean; small?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.btn, on && styles.btnOn, small && { paddingVertical: 7, paddingHorizontal: 10 }]}>
      <Text style={[styles.btnText, on && { color: '#fff' }, small && { fontSize: 13 }]}>{label}</Text>
    </Pressable>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

/** "What to check" and "Compare with FINAL": the two things every page says. */
export function Brief({ check, compare }: { check: string[]; compare: string }) {
  return (
    <View style={styles.brief}>
      <Text style={styles.briefHead}>What to check</Text>
      {check.map((c, i) => <Text key={i} style={styles.briefLine}>{'\u2022 ' + c}</Text>)}
      <Text style={[styles.briefHead, { marginTop: 8 }]}>Compare with FINAL</Text>
      <Text style={styles.briefLine}>{compare}</Text>
    </View>
  );
}

/** The same text as Brief, behind a pill, for the full-screen mock pages where it would cover the design. */
export function FloatingBrief({ check, compare }: { check: string[]; compare: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
      {open ? (
        <View style={[styles.brief, { backgroundColor: 'rgba(255,255,255,0.96)', maxHeight: 420, marginBottom: 8 }]}>
          <ScrollView>
            <Text style={styles.briefHead}>What to check</Text>
            {check.map((c, i) => <Text key={i} style={styles.briefLine}>{'\u2022 ' + c}</Text>)}
            <Text style={[styles.briefHead, { marginTop: 8 }]}>Compare with FINAL</Text>
            <Text style={styles.briefLine}>{compare}</Text>
          </ScrollView>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row' }}><Btn small on={open} label={open ? 'Hide notes' : 'What to check'} onPress={() => setOpen(v => !v)} /></View>
    </View>
  );
}

/** A centred orb. The orb's canvas is size / 0.46, much bigger than the orb, so the slot has its own height and the canvas overflows. */
export function OrbSlot({ size, height, children }: { size: number; height?: number; children: React.ReactNode }) {
  return (
    <View style={{ height: height ?? Math.round(size * 1.3), alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}

export function Swatches({ colours, size = 22 }: { colours: string[]; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
      {colours.map((c, i) => <View key={i} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c }} />)}
    </View>
  );
}

/** Seconds since start(), updated every 100 ms. For checking the timings against MOTION.md. */
export function useStopwatch() {
  const [ms, setMs] = useState<number | null>(null);
  const t0 = useRef(0);
  const id = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => { if (id.current) clearInterval(id.current); id.current = null; };
  const start = () => {
    stop();
    t0.current = Date.now();
    setMs(0);
    id.current = setInterval(() => {
      const d = Date.now() - t0.current;
      setMs(d);
      if (d > 14000) stop();
    }, 100);
  };
  useEffect(() => stop, []);
  return { ms, start, stop, label: ms === null ? 'timer: not started' : 'timer: ' + (ms / 1000).toFixed(1) + ' s' };
}

/** An opacity that fades like FINAL's `.fade` (CSS `ease`). to(1, 450) fades in over 0.45 s; to(1, 0) jumps. */
export function useFade(initial: number) {
  const v = useSharedValue(initial);
  const style = useAnimatedStyle(() => ({ opacity: v.value }));
  const to = (x: number, ms: number) => { v.value = ms ? withTiming(x, { duration: ms, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }) : x; };
  return { style, to };
}

/** Timers a page starts together and cancels together. */
export function useTimers() {
  const list = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => { list.current.forEach(clearTimeout); list.current = []; };
  const later = (fn: () => void, ms: number) => { list.current.push(setTimeout(fn, ms)); };
  useEffect(() => clear, []);
  return { later, clear };
}

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GROUND },
  btn: { backgroundColor: 'rgba(33,28,23,0.08)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  btnOn: { backgroundColor: INK },
  btnText: { color: INK, fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, alignItems: 'center' },
  brief: { backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 12, padding: 12, marginTop: 8 },
  briefHead: { fontSize: 12, letterSpacing: 0.4, color: MUTED, marginBottom: 2, textTransform: 'uppercase' },
  briefLine: { fontSize: 13, lineHeight: 19, color: INK },
  h1: { fontSize: 20, color: INK, fontFamily: 'serif' },
  small: { fontSize: 12, color: MUTED, lineHeight: 17 },
  label: { fontSize: 13, color: MUTED, marginTop: 10, marginBottom: 2 },
  readout: { fontSize: 13, color: INK, fontVariant: ['tabular-nums'] },
});
