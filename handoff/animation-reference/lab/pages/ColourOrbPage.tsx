// J. Colour picker orb: the Light screen's round colour wheel. Not an animation: drag it, and see the palette it makes.
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { type Hex, type Lab } from '../../colour';
import { ColourOrb } from '../../ColourOrb';
import { Orb } from '../../Orb';
import { fromPickedColour, fromWheelFINAL, meanChroma } from '../palettes';
import { Brief, Btn, OrbSlot, Row, styles, Swatches, useLab } from '../ui';

export function ColourOrbPage() {
  const { reduce } = useLab();
  const [recipe, setRecipe] = useState<'final' | 'app'>('app');
  const [lab, setLab] = useState<Lab>([0.8, 0.1, -0.05]);
  const [picked, setPicked] = useState<Hex>('#cc88bb');
  const cols: Hex[] = recipe === 'final' ? fromWheelFINAL(lab) : fromPickedColour(picked);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }} scrollEnabled>
      <Text style={styles.h1}>Colour picker orb</Text>
      <Text style={styles.small}>The Light screen's wheel: round for the colour, toward the centre for whiter. A still image with a soft halo; only the knob moves.</Text>
      <View style={{ alignItems: 'center', marginTop: 4 }}>
        <ColourOrb start={[-0.8, -0.56]} onChange={(h, l) => { setPicked(h); setLab(l); }} />
      </View>
      <Row style={{ justifyContent: 'center' }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: picked, borderWidth: 1, borderColor: '#cfc6b6' }} />
        <Text style={styles.readout}>{picked}</Text>
      </Row>
      <Text style={styles.label}>The 8 colours made from it, and the orb they give (100 dp, Cycle on)</Text>
      <Row style={{ justifyContent: 'center' }}><Btn small on={recipe === 'final'} label="FINAL's recipe" onPress={() => setRecipe('final')} /><Btn small on={recipe === 'app'} label="App recipe (§3.6): the one to build" onPress={() => setRecipe('app')} /></Row>
      <View style={{ alignItems: 'center', marginTop: 8 }}><Swatches colours={cols} size={30} /></View>
      <OrbSlot size={100} height={150}><Orb size={100} colours={cols} reduceMotion={reduce} clockStart={4} /></OrbSlot>
      <Text style={[styles.small, { textAlign: 'center' }]}>colour richness {meanChroma(cols).toFixed(3)}</Text>

      <Brief
        check={[
          'The wheel: a soft round orb of colour with a faint pale halo. Centre is near-white; the edge is the most saturated. A slight shading from the upper left, no hard edge anywhere.',
          'The knob follows the finger and stays inside the wheel; the colour under it is the colour that is picked.',
          'It must look the same in FINAL: same colours at the same angles, same soft edge.',
          'The 8 colours and the orb below it: check that a new palette from any spot on the wheel gives a clean orb, not a muddy one (especially pale spots near the centre, and the dull yellow-green region).',
          'The app recipe (DATA_AND_RULES.md §3.6) differs from FINAL\'s approximation; the app recipe is the one to build.',
        ]}
        compare="FINAL_screens.html: R-4 Light screen. In FINAL_prototype.html: Remote tab, tap Light, drag the colour orb."
      />
    </ScrollView>
  );
}
