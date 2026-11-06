// F. Remote: the orb inside the brightness ring. Brightness, Cycle on/off, Cycle speed, Light off.
// The Remote never calls bloom or undo. It only passes colours, walk, speed and opacity to Orb (MOTION.md, check F).
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Circle } from 'react-native-svg';
import { PEARL, type Hex } from '../../colour';
import { Orb } from '../../Orb';
import { byName } from '../palettes';
import { Brief, Btn, INK, OrbSlot, Row, styles, useLab } from '../ui';

const SCENES = ['Quietly In Between', 'Warm and Wide Open', 'Golden Hour', 'Candy Dream', 'Deep Night'];
const R = 78, C = 2 * Math.PI * R, SPAN = (290 / 360) * C; // a 290 degree ring, open at the bottom

function Ring({ v, off }: { v: number; off: boolean }) {
  const col = off ? '#cfc6b6' : INK;
  return (
    <Svg width={196} height={196} viewBox="0 0 196 196" style={{ position: 'absolute' }}>
      <Circle cx={98} cy={98} r={R} stroke="#dcd5c6" strokeWidth={4} strokeLinecap="round" fill="none" strokeDasharray={[SPAN, C]} rotation={125} origin="98, 98" />
      <Circle cx={98} cy={98} r={R} stroke={col} strokeWidth={4} strokeLinecap="round" fill="none" strokeDasharray={[Math.max(0.001, v) * SPAN, C]} rotation={125} origin="98, 98" />
    </Svg>
  );
}

export function RemotePage() {
  const { reduce } = useLab();
  const [scene, setScene] = useState(SCENES[0]);
  const [lightOn, setLightOn] = useState(true);
  const [cycle, setCycle] = useState(true);
  const [bright, setBright] = useState(0.7);
  const [speedP, setSpeedP] = useState(0.4);
  const [held, setHeld] = useState(0);
  const start = useMemo(() => Math.random() * 20, []);

  const eight = byName(scene).colours;
  const spd = cycle ? 0.2 + speedP * 2.8 : 1; // the prototype's mapping
  const cols: Hex[] = !lightOn ? PEARL : cycle ? eight : Array(8).fill(eight[held]);
  const opacity = !lightOn ? 0.92 : 0.35 + 0.65 * Math.max(0.01, bright);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      <Text style={styles.h1}>Remote</Text>
      <Text style={styles.small}>The Remote's Light part: the orb sits inside the brightness ring. Ring and switches here are only stand-ins; the orb is what matters.</Text>
      <Row>{SCENES.map(n => <Btn key={n} small on={scene === n} label={n} onPress={() => setScene(n)} />)}</Row>

      <View style={{ alignItems: 'center', marginTop: 10 }}>
        <View style={{ width: 196, height: 196, alignItems: 'center', justifyContent: 'center' }}>
          <Ring v={bright} off={!lightOn} />
          <OrbSlot size={100} height={100}>
            <Orb size={100} colours={cols} walk={cycle} speed={spd} opacity={opacity} reduceMotion={reduce} clockStart={start} />
          </OrbSlot>
        </View>
      </View>

      <Row style={{ justifyContent: 'center' }}>
        {eight.slice(0, 4).map((c, i) => (
          <Pressable key={i} onPress={() => setHeld(i)} style={{ padding: 6 }} accessibilityLabel={'Colour ' + (i + 1)}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c, borderWidth: !cycle && held === i ? 3 : 0, borderColor: INK }} />
          </Pressable>
        ))}
      </Row>
      <Text style={[styles.small, { textAlign: 'center' }]}>The 4 dots. With Cycle off the orb holds the ringed one; with Cycle on it moves through all 8.</Text>

      <Row style={{ justifyContent: 'space-between', marginTop: 14 }}>
        <Text style={{ fontSize: 15 }}>Light</Text><Switch value={lightOn} onValueChange={setLightOn} trackColor={{ true: INK, false: '#cfc6b6' }} thumbColor="#fff" />
        <Text style={{ fontSize: 15 }}>Cycle</Text><Switch value={cycle} onValueChange={setCycle} trackColor={{ true: INK, false: '#cfc6b6' }} thumbColor="#fff" />
      </Row>
      <Text style={styles.label}>Brightness {Math.round(bright * 100)} %  (orb opacity {opacity.toFixed(2)})</Text>
      <Slider minimumValue={0.01} maximumValue={1} value={bright} onValueChange={setBright} minimumTrackTintColor={INK} thumbTintColor={INK} />
      <Text style={styles.label}>Cycle speed {cycle ? spd.toFixed(1) + 'x  (one colour every ' + (6 / spd).toFixed(1) + ' s)' : '(Cycle is off)'}</Text>
      <Slider minimumValue={0} maximumValue={1} value={speedP} onValueChange={setSpeedP} disabled={!cycle} minimumTrackTintColor={INK} thumbTintColor={INK} />

      <Brief
        check={[
          'Brightness: dragging dims and brightens the whole orb and its halo smoothly; the full range runs from 35 % (dim, still clearly an orb) to 100 %. Each change eases over 0.4 s, so it trails the finger a little.',
          'Cycle on: the orb moves through all 8 of the scene\'s colours, one every 6 s at the middle speed; the speed slider makes it 0.2 x (very slow) to 3 x (fast). The inner movement speeds up with the square root of the speed, so it changes less than the colour walk.',
          'The speed slider is live: while Cycle is on, dragging it changes how fast the orb moves through the colours, immediately and without a jump (the label shows the seconds per colour). It only exists while Cycle is on; with Cycle off it is disabled.',
          'Cycle off: the orb holds one colour (the ringed dot): a single-colour orb with its shading and halo. Tap another dot to change it. The inner movement continues slowly.',
          'Light off: the orb turns into the pearl orb at 0.92 opacity (not grey, not dimmed).',
          'The halo around the 100 dp orb should look like FINAL\'s: faint, round, inside the ring.',
          'Remove animations: the orb is completely still, with no colour walk.',
          'The orb is 100 dp inside the 196 dp ring, as in FINAL.',
        ]}
        compare="FINAL_screens.html: R-3 Remote, a scene playing; R-3c Cycling; R-3d Brightness, while dragging; R-1 nothing playing (pearl). In FINAL_prototype.html: Remote tab, drag the brightness ring, switch Cycle, drag the speed slider, turn Light off."
      />
    </ScrollView>
  );
}
