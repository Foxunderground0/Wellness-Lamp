// E. Sending to the lamp: Set the scene on Home. Light bloom, the wash, Home's controls, the message bar, Undo, All off.
// This page is a rough copy of Home laid over the wash. It shows how a screen drives the components:
// the screen owns the timers (the 0.6 s wait, then 0 / 0.9 s / 1.5 s / 3 s / 8 s); Orb and BackgroundWash only play what they are told (MOTION.md, check E).
import React, { useRef, useState } from 'react';
import { StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { BackgroundWash, HOME_WASH_OPACITY } from '../../BackgroundWash';
import { type Hex } from '../../colour';
import { Orb, type OrbHandle } from '../../Orb';
import { byName } from '../palettes';
import { Btn, FloatingBrief, INK, OrbSlot, Row, useFade, useLab, useStopwatch, useTimers } from '../ui';

const SCENES = ['Warm and Wide Open', 'Quietly In Between', 'Deep Night Calm', 'Social Warmth'];

export function SendingPage() {
  const { reduce } = useLab();
  const { width, height } = useWindowDimensions();
  const orb = useRef<OrbHandle>(null);
  const { later, clear } = useTimers();
  const sw = useStopwatch();
  const [mood, setMood] = useState(SCENES[0]);
  const colours: Hex[] = byName(mood).colours;
  const [shown, setShown] = useState<Hex[]>(colours);
  const [wash, setWash] = useState(false);
  const [all, setAll] = useState(true);
  const [resultOn, setResultOn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState('Result. Waiting for Set the scene.');
  const result = useFade(1);
  const home = useFade(0);
  const snack = useSharedValue(0);
  const snackStyle = useAnimatedStyle(() => ({ opacity: snack.value, transform: [{ translateY: 8 * (1 - snack.value) }] }));
  const fade = reduce ? 0 : 450;

  const reset = (m = mood) => {
    clear(); sw.stop();
    orb.current?.rest(false);
    setShown(byName(m).colours);
    setWash(false); setAll(true);
    result.to(1, 0); home.to(0, 0); snack.value = 0;
    setResultOn(true); setBusy(false);
    setStep('Result. Waiting for Set the scene.');
  };

  const setTheScene = () => {
    if (busy) return;
    clear();
    sw.start();
    setBusy(true);
    setStep('Tap: the button says "Setting the scene…" for 0.6 s.');
    later(send, 600);
  };
  // t = 0 below is the end of the 0.6 s wait, as in MOTION.md check E.
  const send = () => {
    orb.current?.bloom();
    result.to(0, fade);
    setResultOn(false);
    later(() => setBusy(false), fade);
    setStep('0 s (0.6 s after the tap): orb blooms; result buttons fade out.');
    later(() => { setWash(true); setStep('0.9 s: wash bleeds in from the edges (4.5 s).'); }, reduce ? 200 : 900);
    later(() => { home.to(1, fade); setStep('1.5 s: Home controls appear.'); }, 1500);
    later(() => {
      snack.value = withTiming(1, { duration: reduce ? 0 : 250 });
      setStep('3 s: message bar in, for 5 s.');
    }, 3000);
    later(() => { snack.value = withTiming(0, { duration: reduce ? 0 : 250 }); setStep('8 s: Undo window closed.'); }, 8000);
  };

  const undo = () => {
    clear();
    orb.current?.undo();
    snack.value = withTiming(0, { duration: reduce ? 0 : 250 });
    home.to(0, fade);
    setWash(false);
    setAll(true);
    setStep('Undo: orb returns in 0.7 s, wash recedes over 3 s, result buttons back at 0.4 s.');
    later(() => { result.to(1, fade); setResultOn(true); }, 400);
  };

  const allToggle = (on: boolean) => { setAll(on); setWash(on); setStep(on ? 'All on: wash bleeds in.' : 'All off: wash recedes over 3 s.'); };
  const muted = wash ? '#4A443E' : '#605a53';

  return (
    <View style={{ flex: 1 }}>
      <BackgroundWash width={width} height={height} colours={shown} opacity={HOME_WASH_OPACITY} shown={wash} lit={false} reduceMotion={reduce} />
      <View style={{ flex: 1, padding: 16 }} pointerEvents="box-none">
        <Row style={{ marginTop: 0 }}>
          {SCENES.map(m => <Btn key={m} small on={mood === m} label={m} onPress={() => { setMood(m); reset(m); }} />)}
        </Row>
        <Text style={[s.readout, { color: muted }]}>{sw.label}  ·  {step}</Text>

        <OrbSlot size={176} height={250}>
          <Orb ref={orb} size={176} colours={shown} pressable reduceMotion={reduce} />
        </OrbSlot>

        <View style={{ height: 150 }}>
          <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center' }, result.style]} pointerEvents={resultOn ? 'auto' : 'none'}>
            <Text style={{ fontSize: 13, color: muted }}>Tonight</Text>
            <Text style={{ fontSize: 26, fontFamily: 'serif', color: INK }}>{mood}</Text>
            <Row><Btn label={busy ? 'Setting the scene…' : 'Set the scene'} onPress={setTheScene} /><Btn label="Not now" onPress={() => reset()} /></Row>
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center' }, home.style]} pointerEvents={resultOn ? 'none' : 'auto'}>
            <Btn label="Check in again" onPress={() => reset()} />
            <Row style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 14, color: muted }}>{all ? 'Set at 21:42' : 'Off'}</Text>
              <Text style={{ fontSize: 14, color: INK }}>All</Text>
              <Switch value={all} onValueChange={allToggle} trackColor={{ true: INK, false: '#cfc6b6' }} thumbColor="#fff" />
            </Row>
          </Animated.View>
        </View>
      </View>
      <Animated.View style={[s.snack, snackStyle]} pointerEvents="box-none">
        <Text style={{ color: '#fff', fontSize: 14 }}>Sent to your room</Text>
        <Text onPress={undo} style={{ color: '#fff', fontSize: 14, textDecorationLine: 'underline', padding: 8 }}>Undo</Text>
      </Animated.View>
      <FloatingBrief
        check={[
          'Set the scene button, not the orb: the button says "Setting the scene…" for 0.6 s (as in the scene view), then the bloom starts; all times below are from that moment. The orb grows to 1.12 then settles at 1.10 with a calm light glow (Light leak) and thin strands round the rim, which then fade into a thin bright ring just outside the edge (Corona). See MOTION.md, Orb vocabulary.',
          'The halo around the orb should look as in FINAL: soft, round, pale; not coloured streaks.',
          '0.9 s: the wash bleeds in from the screen edges toward the middle over 4.5 s, slowly and softly. Colours are the scene\'s, soft and clean. Text stays readable on it.',
          '1.5 s: Home\'s controls appear. 3 s: the message bar appears for 5 s.',
          'Undo (on the message bar): the orb returns over 0.7 s, the wash recedes over 3 s, the result buttons come back after 0.4 s. The wash must recede slowly, never vanish at once.',
          'All switch off/on: the wash recedes (3 s) / bleeds back in (4.5 s).',
          'Remove animations: the orb jumps to 1.10, the wash fades in over 0.8 s from 0.2 s, controls are instant.',
        ]}
        compare="FINAL_screens.html: C-5 Result, H-2 A scene set, X-1c Message bar on Home, H-6 All off. In FINAL_prototype.html: Home tab, Set the scene."
      />
    </View>
  );
}

const s = StyleSheet.create({
  readout: { fontSize: 12, marginTop: 6 },
  snack: { position: 'absolute', left: 16, right: 16, bottom: 80, minHeight: 48, borderRadius: 12, backgroundColor: INK, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
