// D. Finding your palette: "Reading your answers…" after a check-in. Long exposure, then the result.
// The screen owns the text and the timers; the orb only does the colour (orb.longExposure). Timings: MOTION.md, check D.
import React, { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { PEARL, type Hex } from '../../colour';
import { Orb, type OrbHandle } from '../../Orb';
import { byName } from '../palettes';
import { Brief, Btn, OrbSlot, Row, styles, useLab, useStopwatch, useTimers } from '../ui';

const MOODS = ['Warm and Wide Open', 'Quietly In Between', 'Deep Night Calm', 'Healing Quiet', 'Anxious Edge', 'Social Warmth', 'Introspective Blue'];

export function FindingPage() {
  const { reduce } = useLab();
  const orb = useRef<OrbHandle>(null);
  const { later, clear } = useTimers();
  const sw = useStopwatch();
  const [mood, setMood] = useState(MOODS[0]);
  const [shown, setShown] = useState<Hex[]>(PEARL);
  const [phase, setPhase] = useState<'idle' | 'reading' | 'result'>('idle');
  const status = useSharedValue(0);
  const result = useSharedValue(0);
  const statusStyle = useAnimatedStyle(() => ({ opacity: status.value }));
  const resultStyle = useAnimatedStyle(() => ({ opacity: result.value }));

  const reset = () => {
    clear();
    orb.current?.rest(false);
    setShown(PEARL);
    setPhase('idle');
    status.value = 0; result.value = 0;
  };
  const run = () => {
    reset();
    const colours = byName(mood).colours;
    sw.start();
    setPhase('reading');
    // text: "Reading your answers…" fades in 0.45 s. Remove animations: instant, and no 0.45 s text lag.
    status.value = withTiming(1, { duration: reduce ? 0 : 450 });
    later(() => {
      orb.current?.longExposure(colours, () => {
        // onDone is at 4.15 s (3.7 s + the 0.45 s text lag); Remove animations: right after the 1.2 s blend
        setShown(colours);
        status.value = withTiming(0, { duration: reduce ? 0 : 450 });
        result.value = withTiming(1, { duration: reduce ? 0 : 450 });
        setPhase('result');
      });
    }, 80); // one beat, so the pearl is on screen before the orb starts
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      <Text style={styles.h1}>Finding your palette</Text>
      <Text style={styles.small}>After "See my mood": the orb starts as the pearl and the colours develop into the mood palette (Long exposure).</Text>
      <Row>{MOODS.map(m => <Btn key={m} small on={mood === m} label={m} onPress={() => { setMood(m); reset(); }} />)}</Row>
      <Row><Btn label="See my mood" onPress={run} /><Btn label="Back to pearl" onPress={reset} /><Text style={styles.readout}>{sw.label}</Text></Row>

      <OrbSlot size={176} height={250}><Orb ref={orb} size={176} colours={shown} reduceMotion={reduce} /></OrbSlot>

      <View style={{ height: 120, alignItems: 'center' }}>
        <Animated.View style={[{ position: 'absolute' }, statusStyle]}>
          <Text style={{ fontSize: 17, color: '#605a53', fontFamily: 'serif' }}>Reading your answers…</Text>
        </Animated.View>
        <Animated.View style={[{ position: 'absolute', alignItems: 'center' }, resultStyle]}>
          <Text style={styles.small}>Tonight</Text>
          <Text style={{ fontSize: 26, color: '#211c17', fontFamily: 'serif' }}>{mood}</Text>
          <Text style={[styles.small, { marginTop: 4 }]}>(result text; Set the scene · Not now)</Text>
        </Animated.View>
      </View>
      <Text style={styles.readout}>{phase === 'idle' ? 'Pearl. Waiting.' : phase === 'reading' ? 'Reading…' : 'Result is up.'}</Text>

      <Brief
        check={[
          '0 s: "Reading your answers…" fades in; the orb is the pearl.',
          '0.6 s: thin strands and a slow swirl lift around the rim. 0.75 s to 3.6 s: all 8 colours develop together; the colour arrives a little earlier in some swirls than others (most in the middle), with no hard edges and no left-to-right sweep.',
          '2.4 s: strands and swirl settle. 3.7 s: the orb is fully the new palette.',
          '4.15 s (3.7 s + a 0.45 s pause): "Reading your answers…" fades out and the result fades in. Watch the timer.',
          'The halo around the orb develops with the same curve: it should never show the old and new palettes as two separate rings.',
          'Try a pale mood (Healing Quiet) and a dark one (Deep Night Calm): neither should go muddy halfway.',
          'Remove animations: a plain 1.2 s colour blend, then the text straight away.',
        ]}
        compare="FINAL_screens.html: C-3 After the 5th answer, C-4 Reading your answers, C-5 Result. In FINAL_prototype.html: Home tab, Check in, answer, See my mood."
      />
    </ScrollView>
  );
}
