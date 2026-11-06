// H. Sliding orb in the scene view: the strip of names and orbs, the wash cross-fade, and Set the scene inside the scene view.
// The screen owns the text under the strip and the message bar; SceneSwipe owns the strip. Timings: MOTION.md, check H.
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SceneWash } from '../../BackgroundWash';
import { SceneSwipe, type SceneSwipeHandle, type SwipeScene } from '../../SceneSwipe';
import { PALETTES } from '../palettes';
import { Btn, FloatingBrief, INK, Row, useLab, useTimers } from '../ui';

const NAMES = ['Golden Hour', 'Deep Night', 'Ocean Drift', 'Rose Garden', 'Storm Calm', 'Forest Floor', 'Candy Dream', 'Ember Glow'];
const LINES: Record<string, string> = {
  'Golden Hour': 'Bathed in the day\'s last gold', 'Deep Night': 'Still and vast as the night sky', 'Ocean Drift': 'Carried softly by the current',
  'Rose Garden': 'Early morning air', 'Storm Calm': 'Holding still through the grey', 'Forest Floor': 'Roots deep, slow breathing',
  'Candy Dream': 'Sugar-rush colours with nowhere to be', 'Ember Glow': 'Warmth that lingers long after',
};

export function SwipePage() {
  const { reduce } = useLab();
  const { width, height } = useWindowDimensions();
  const strip = useRef<SceneSwipeHandle>(null);
  const { later, clear } = useTimers();
  const scenesBase = NAMES.map(n => PALETTES.find(p => p.name === n)!);
  const [onNow, setOnNow] = useState<string | null>('Ocean Drift');
  const scenes: SwipeScene[] = scenesBase.map(p => ({ id: p.name, name: p.name, colours: p.colours, on: p.name === onNow }));
  const [cur, setCur] = useState(0);
  const [lit, setLit] = useState(false);
  const [setting, setSetting] = useState(false);
  const text = useSharedValue(1);
  const textStyle = useAnimatedStyle(() => ({ opacity: text.value }));
  const snack = useSharedValue(0);
  const snackStyle = useAnimatedStyle(() => ({ opacity: snack.value }));
  const [shownText, setShownText] = useState(0);
  const prevOn = useRef<string | null>(null);

  const colours = scenes[cur].colours;
  const isOn = scenes[shownText].id === onNow;

  const setTheScene = () => {
    clear();
    setSetting(true); // "Setting the scene…", disabled, 0.6 s
    later(() => {
      prevOn.current = onNow;
      strip.current?.bloom();
      setOnNow(scenes[shownText].id);
      setLit(true);
      setSetting(false);
    }, 600);
    later(() => { snack.value = withTiming(1, { duration: reduce ? 0 : 250 }); }, 600 + (reduce ? 0 : 3000));
    later(() => { snack.value = withTiming(0, { duration: reduce ? 0 : 250 }); }, 600 + (reduce ? 0 : 3000) + 5000);
  };
  const undo = () => {
    clear();
    strip.current?.undo();
    setOnNow(prevOn.current);
    setLit(false);
    snack.value = withTiming(0, { duration: reduce ? 0 : 250 });
  };

  return (
    <View style={{ flex: 1 }}>
      <SceneWash width={width} height={height} colours={colours} lit={lit} reduceMotion={reduce} />
      <View style={{ paddingTop: 4 }}>
        <SceneSwipe
          ref={strip}
          scenes={scenes}
          initialIndex={0}
          reduceMotion={reduce}
          onChange={i => {
            setCur(i);
            setLit(scenes[i].id === onNow); // the scene that is on keeps its brighter wash
            text.value = withTiming(0, { duration: reduce ? 0 : 220 }); // FINAL: the text fades out as the slide starts (.22 s) ...
          }}
          onSwap={i => {
            setShownText(i); // ... refills at 45 % of the slide ...
            text.value = withTiming(1, { duration: reduce ? 0 : 220 }); // ... and fades back in
          }}
        />
      </View>
      <Animated.View style={[{ alignItems: 'center', paddingHorizontal: 24 }, textStyle]}>
        <Text style={s.sub}>{isOn ? 'Tonight · 21:42 · On now' : scenes[shownText].name}</Text>
        <Text style={s.line}>{LINES[scenes[shownText].name]}</Text>
        <Text style={s.sub}>Ambient · Rain on a window</Text>
      </Animated.View>
      <Row style={{ justifyContent: 'center', marginTop: 12 }}>
        <Btn label="◀" onPress={() => strip.current?.go(-1)} />
        <Btn label={setting ? 'Setting the scene…' : isOn ? 'On now' : 'Set the scene'} onPress={() => { if (!setting && !isOn) setTheScene(); }} />
        <Btn label="▶" onPress={() => strip.current?.go(1)} />
      </Row>
      <Animated.View style={[s.snack, snackStyle]} pointerEvents="box-none">
        <Text style={{ color: '#fff', fontSize: 14 }}>Sent to your room</Text>
        <Text onPress={undo} style={{ color: '#fff', fontSize: 14, textDecorationLine: 'underline', padding: 8 }}>Undo</Text>
      </Animated.View>
      <FloatingBrief
        check={[
          'Swipe the orb sideways (or tap ◀ ▶ or a neighbouring name). The names and the orb move together as one strip. A quick flick slides faster (300 ms), a slow one slower (up to 460 ms). Smooth, no stutter even though the wash is moving behind.',
          'While you drag, the neighbouring orbs fade in beside the one you are holding. Let go short of the threshold (about 60 dp): everything springs back in 0.3 s.',
          'The orb you leave fades out over the first 60 % of the slide; the one arriving is already the real orb in its real state, so nothing blinks or jumps when it lands in the centre.',
          'The name that becomes current grows and brightens; the old one shrinks and fades back (0.42 s). The text under the orb swaps half-way through the slide.',
          'The wash cross-fades to the new scene\'s colours over 1.2 s.',
          'The scene that is On now (Ocean Drift at the start) should arrive at 1.10x with the thin bright ring (Corona); the others are plain at 1.0x.',
          'Set the scene: "Setting the scene…" for 0.6 s, then the bloom on this orb and the wash brightens (0.40 to 0.50 over 1.2 s). 3 s later the message bar shows for 5 s. Undo reverses it.',
          'No Sink here: pressing the orb in the scene view does nothing.',
          'Remove animations: the strip jumps with no slide; the wash changes instantly.',
        ]}
        compare="FINAL_screens.html: L-12 Scene view, L-11 A preset on now. In FINAL_prototype.html: Library tab, tap a preset tile, swipe left and right."
      />
    </View>
  );
}

const s = StyleSheet.create({
  sub: { fontSize: 14, color: '#4A443E', textAlign: 'center' },
  line: { fontSize: 19, fontFamily: 'serif', color: INK, textAlign: 'center', marginVertical: 6 },
  snack: { position: 'absolute', left: 16, right: 16, bottom: 80, minHeight: 48, borderRadius: 12, backgroundColor: INK, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
