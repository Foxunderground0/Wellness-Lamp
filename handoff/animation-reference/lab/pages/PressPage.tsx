// C. Press / Sink: pressing Home's orb. It sinks and sharpens, and never sets a scene.
import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { PEARL } from '../../colour';
import { Orb } from '../../Orb';
import { byName } from '../palettes';
import { Brief, Btn, OrbSlot, Row, styles, useLab } from '../ui';

export function PressPage() {
  const { reduce } = useLab();
  const [scene, setScene] = useState(false);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <Text style={styles.h1}>Press (Sink)</Text>
      <Text style={styles.small}>Press and hold the orb, then let go. Home's orb is the only one that sinks. Pressing it never sets the scene: the Set the scene button does that.</Text>
      <OrbSlot size={176} height={260}>
        <Orb size={176} colours={scene ? byName('Warm and Wide Open').colours : PEARL} pressable reduceMotion={reduce} />
      </OrbSlot>
      <Text style={styles.readout}>Scene set by pressing the orb: no (it must stay no)</Text>
      <Row>
        <Btn label={scene ? 'Show the pearl orb' : 'Show an orb with a scene'} onPress={() => setScene(v => !v)} />
      </Row>

      <Brief
        check={[
          'Press and hold: the orb shrinks by about 4.5 % and its edge gets crisper; the halo gets slightly brighter.',
          'It follows your finger quickly going in (rate 14 per second) and eases back a little slower coming out (7 per second).',
          'Letting go never starts a bloom, a wash or a message. Nothing else on the screen changes.',
          'A press counts within about 0.55 x the orb\'s size of its centre, so a touch just outside the edge also sinks it.',
          'With Remove animations on: no size change at all.',
          'Haptics (optional): FINAL buzzes 8 ms on press. The lab leaves it out; see MOTION.md section 11.',
        ]}
        compare="FINAL_screens.html: H-1 Home, tonight. In FINAL_prototype.html press and hold Home's orb on the Home tab. The Library's scene view orb does not sink (MOTION.md, check C)."
      />
    </ScrollView>
  );
}
