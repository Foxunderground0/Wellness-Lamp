// I. Resting: how the orb settles after Set the scene, and what "at rest" looks like (1.10x with the Corona ring).
import React, { useEffect, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Orb, type OrbHandle } from '../../Orb';
import { byName } from '../palettes';
import { Brief, Btn, OrbSlot, Row, styles, useLab, useStopwatch } from '../ui';

export function RestingPage() {
  const { reduce } = useLab();
  const main = useRef<OrbHandle>(null);
  const plain = useRef<OrbHandle>(null);
  const rested = useRef<OrbHandle>(null);
  const sw = useStopwatch();
  const cols = byName('Quietly In Between').colours;
  useEffect(() => { plain.current?.rest(false); rested.current?.rest(true); }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      <Text style={styles.h1}>Resting</Text>
      <Text style={styles.small}>After Set the scene the orb blooms for about 5 s, then rests: a little bigger (1.10x), with a thin bright ring just outside its edge.</Text>
      <OrbSlot size={176} height={270}><Orb ref={main} size={176} colours={cols} pressable reduceMotion={reduce} /></OrbSlot>
      <Row>
        <Btn label="Set: bloom, then rest" onPress={() => { main.current?.bloom(); sw.start(); }} />
        <Btn label="Undo" onPress={() => { main.current?.undo(); sw.start(); }} />
        <Btn label="Jump to rest" onPress={() => { main.current?.rest(true); sw.stop(); }} />
        <Text style={styles.readout}>{sw.label}</Text>
      </Row>

      <Text style={[styles.label, { marginTop: 18 }]}>Side by side, 120 dp: plain (left) and at rest (right)</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <OrbSlot size={120} height={190}><Orb ref={plain} size={120} colours={cols} reduceMotion={reduce} clockStart={2} /></OrbSlot>
        <OrbSlot size={120} height={190}><Orb ref={rested} size={120} colours={cols} reduceMotion={reduce} clockStart={2} /></OrbSlot>
      </View>
      <Text style={styles.small}>Left: the orb before Set the scene (1.00x, no ring). Right: the orb that is on now (1.10x, Corona).</Text>

      <Brief
        check={[
          'Timeline, from the tap: 0 to 0.95 s the orb grows to 1.12x, then eases to 1.10x by about 2 s. A soft glow (Light leak) and thin strands round the rim peak at about 1 s.',
          'By about 3 s the glow has turned into a thin bright ring just outside the edge (Corona) and the strands have faded. By about 5 s the inner swirl has slowed to its resting drift.',
          'At rest: always slowly moving (colour drifts, one new leading colour every 6 s), never still, never pulsing.',
          'Corona at rest: a hairline ring in the halo\'s own turning colours, edge crisp. It must look like FINAL\'s, not like a white outline.',
          'Press the big orb while it is at rest: it sinks from its resting size and comes back to 1.10x on release (Home keeps Sink after the scene is set).',
          'Undo: size and glow return over 0.7 s, strands and swirl over 0.3 s.',
          'Remove animations: the orb jumps to 1.10x with the ring and does not move.',
        ]}
        compare="FINAL_screens.html: H-2 A scene set (orb at rest on Home), L-11 A preset on now (the scene view orb at rest). In FINAL_prototype.html: Home tab, Set the scene, then wait 5 s."
      />
    </ScrollView>
  );
}
