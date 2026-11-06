// B. Palettes: every preset and mood palette as an orb, and orbs from newly made palettes (the "no mud" check).
import React, { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { labHex, PEARL, type Hex } from '../../colour';
import { Orb, type OrbHandle } from '../../Orb';
import { fromPickedColour, fromWheelFINAL, meanChroma, PALETTES, randomWheelLab } from '../palettes';
import { Brief, Btn, OrbSlot, Row, styles, Swatches, useLab, useTimers } from '../ui';

type Recipe = 'final' | 'app';
const make = (r: Recipe): Hex[] => {
  const lab = randomWheelLab();
  return r === 'final' ? fromWheelFINAL(lab) : fromPickedColour(labHex(lab));
};

export function PalettesPage() {
  const { reduce } = useLab();
  const orb = useRef<OrbHandle>(null);
  const { later, clear } = useTimers();
  const [name, setName] = useState('Golden Hour');
  const [cols, setCols] = useState<Hex[]>(PALETTES[0].colours);
  const [shown, setShown] = useState<Hex[]>(PALETTES[0].colours);
  const [recipe, setRecipe] = useState<Recipe>('app');
  const [batch, setBatch] = useState<Hex[][]>(() => Array.from({ length: 6 }, () => make('app')));

  const pick = (n: string, c: Hex[]) => { clear(); orb.current?.rest(false); setName(n); setCols(c); setShown(c); };
  const develop = () => {
    clear();
    orb.current?.rest(false);
    setShown(PEARL);
    later(() => orb.current?.longExposure(cols, () => setShown(cols)), 80);
  };
  const presets = PALETTES.filter(p => p.group === 'preset');
  const feelings = PALETTES.filter(p => p.group === 'feeling');
  const regen = (r: Recipe) => { setRecipe(r); setBatch(Array.from({ length: 6 }, () => make(r))); };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      <Text style={styles.h1}>Palettes</Text>
      <Text style={styles.small}>Tap a palette to see it as the Home orb. Then make new ones below.</Text>
      <OrbSlot size={176}><Orb ref={orb} size={176} colours={shown} reduceMotion={reduce} /></OrbSlot>
      <Text style={styles.readout}>{name}  ·  colour richness {meanChroma(cols).toFixed(3)}</Text>
      <View style={{ marginTop: 6 }}><Swatches colours={cols} /></View>
      <Row><Btn label="Develop from pearl (like a check-in)" onPress={develop} /></Row>

      <Text style={styles.label}>Presets (the Library's 8)</Text>
      <Row style={{ marginTop: 2 }}>{presets.map(p => <Btn key={p.name} small on={name === p.name} label={p.name} onPress={() => pick(p.name, p.colours)} />)}</Row>
      <Text style={styles.label}>Mood palettes (the check-in's 25)</Text>
      <Row style={{ marginTop: 2 }}>{feelings.map(p => <Btn key={p.name} small on={name === p.name} label={p.name} onPress={() => pick(p.name, p.colours)} />)}</Row>

      <Text style={[styles.h1, { marginTop: 24 }]}>New palettes</Text>
      <Text style={styles.small}>
        Six random palettes made the way the Light screen makes them from a picked colour. Tap one to look at it big above.
        "Colour richness" is the average chroma of the 8 colours; under about 0.05 will look grey.
      </Text>
      <Row>
        <Btn label="Six new, FINAL's recipe" on={recipe === 'final'} onPress={() => regen('final')} />
        <Btn label="Six new, app recipe (§3.6): the one to build" on={recipe === 'app'} onPress={() => regen('app')} />
      </Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 }}>
        {batch.map((c, i) => (
          <View key={i + c.join('')} style={{ width: '33%', alignItems: 'center', marginBottom: 6 }}>
            <OrbSlot size={84} height={104}><Orb size={84} colours={c} reduceMotion={reduce} clockStart={i * 5} /></OrbSlot>
            <Text style={styles.small} onPress={() => pick('New palette ' + (i + 1), c)}>{meanChroma(c).toFixed(3)}  ·  tap for big</Text>
          </View>
        ))}
      </View>

      <Brief
        check={[
          'Every palette, however pale or dark (Deep Night, Storm Calm, Candy Dream): the orb reads as light blending through its colours, never as grey mush.',
          'The in-between colours stay saturated. Where two colours meet there is a clean blend, not a dirty one (the no-mud rule: OKLab, chroma held).',
          'Compare each orb with the same palette in FINAL: the colours should be the same, in the same positions.',
          'New palettes: look at all six in both recipes. Flag any that look muddy, over-bright, or nearly one colour.',
          'Develop from pearl: the pearl develops into that palette over about 4 s with no flash and no hard edges.',
        ]}
        compare="FINAL_screens.html: L-1 Presets (the 8 preset orbs), C-5 Result (a mood palette), R-4 Light screen (the picker makes new palettes; in FINAL_prototype.html drag the colour orb on the Remote's Light screen)."
      />
    </ScrollView>
  );
}
