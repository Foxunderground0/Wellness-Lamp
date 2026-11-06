// A. Pearl: the pale palette before any check-in. Same orb, three sizes.
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { PEARL } from '../../colour';
import { Orb } from '../../Orb';
import { Brief, OrbSlot, styles, Swatches, useLab } from '../ui';

export function PearlPage() {
  const { reduce } = useLab();
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <Text style={styles.h1}>Pearl</Text>
      <Text style={styles.small}>
        The orb with nothing set: Home before a check-in, the start of "Reading your answers", the Remote with Nothing on yet or Light off.
        The eight pearl colours, in lamp order:
      </Text>
      <View style={{ marginTop: 8 }}><Swatches colours={PEARL} size={26} /></View>

      <Text style={styles.label}>Home, 176 dp (press and hold it: it sinks, as on Home)</Text>
      <OrbSlot size={176}><Orb size={176} colours={PEARL} pressable reduceMotion={reduce} /></OrbSlot>

      <Text style={styles.label}>Check-in questions, 136 dp</Text>
      <OrbSlot size={136}><Orb size={136} colours={PEARL} reduceMotion={reduce} clockStart={7} /></OrbSlot>

      <Text style={styles.label}>Remote, 100 dp, Light off (pearl at 0.92)</Text>
      <OrbSlot size={100}><Orb size={100} colours={PEARL} opacity={0.92} walk={false} reduceMotion={reduce} clockStart={3} /></OrbSlot>

      <Brief
        check={[
          'Soft pastels: peach, mint, lilac, aqua. Nothing grey, nothing muddy.',
          'A slow drift inside the orb; the leading colour moves on about every 6 s. No ring, no sudden flare.',
          'The glow around the orb is faint and pale, and shows up even on the cream ground.',
          'Home orb: pressing it sinks it slightly and it comes back when you let go (Sink, page C). The 136 dp and 100 dp orbs are not controls and do not sink.',
          'With Remove animations on, the orb is perfectly still.',
        ]}
        compare="FINAL_screens.html: H-1 Home, tonight (176 dp); C-1 Check-in (136 dp); R-1 Remote, nothing playing (100 dp). In FINAL_prototype.html open the Home tab before any check-in."
      />
    </ScrollView>
  );
}
