// MotionLab.tsx: a test screen for every animation in the app, on a real phone. Not part of the app and not copied into src/.
// It is also the developer's worked example of how screens drive Orb, BackgroundWash, SceneWash, SceneSwipe and ColourOrb:
// each page in pages/ owns its scene, its text and its timers, and only calls the components.
// How to run it: MOTION.md, "Testing the animations".

import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GROUND } from '../colour';
import { ColourOrbPage } from './pages/ColourOrbPage';
import { FindingPage } from './pages/FindingPage';
import { PalettesPage } from './pages/PalettesPage';
import { PearlPage } from './pages/PearlPage';
import { PressPage } from './pages/PressPage';
import { RemotePage } from './pages/RemotePage';
import { RestingPage } from './pages/RestingPage';
import { SendingPage } from './pages/SendingPage';
import { SwipePage } from './pages/SwipePage';
import { WashPage } from './pages/WashPage';
import { Btn, INK, LabContext, MUTED } from './ui';

type Test = { letter: string; title: string; where: string; Page: React.ComponentType };

const TESTS: Test[] = [
  { letter: 'A', title: 'Pearl', where: 'Home before a check-in, Remote with nothing on · H-1, C-1, R-1', Page: PearlPage },
  { letter: 'B', title: 'Palettes and new palettes', where: 'All 33 palettes, plus orbs from newly made ones · L-1, C-5, R-4', Page: PalettesPage },
  { letter: 'C', title: 'Press (Sink)', where: 'Pressing Home\'s orb · H-1', Page: PressPage },
  { letter: 'D', title: 'Finding your palette', where: '"Reading your answers…" after a check-in · C-3, C-4, C-5', Page: FindingPage },
  { letter: 'E', title: 'Sending to the lamp', where: 'Set the scene on Home: bloom, wash, controls, message bar, Undo · H-2, X-1c, H-6', Page: SendingPage },
  { letter: 'F', title: 'Remote: brightness, speed, Cycle', where: 'The orb in the brightness ring · R-3, R-3c, R-3d', Page: RemotePage },
  { letter: 'G', title: 'Wash', where: 'Home\'s wash and the scene view\'s wash · H-2, H-6, L-12', Page: WashPage },
  { letter: 'H', title: 'Sliding orb in the scene view', where: 'Swipe between scenes, Set the scene there · L-12, L-11', Page: SwipePage },
  { letter: 'I', title: 'Resting after the scene is set', where: 'The settle and the 1.10x Corona rest · H-2, L-11', Page: RestingPage },
  { letter: 'J', title: 'Colour picker orb', where: 'The Light screen\'s wheel (not an animation) · R-4', Page: ColourOrbPage },
];

export function MotionLab() {
  const [open, setOpen] = useState<Test | null>(null);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (open) { setOpen(null); return true; }
      return false;
    });
    return () => sub.remove();
  }, [open]);

  return (
    <LabContext.Provider value={{ reduce }}>
      <SafeAreaView style={s.root} edges={['top', 'bottom']}>
        <View style={s.header}>
          {open ? <Btn small label="‹ Tests" onPress={() => setOpen(null)} /> : null}
          <Text style={s.title} numberOfLines={1}>{open ? open.letter + ' · ' + open.title : 'Motion lab'}</Text>
          <Btn small on={reduce} label={reduce ? 'Animations: removed' : 'Remove animations'} onPress={() => setReduce(v => !v)} />
        </View>
        {open ? (
          <View style={{ flex: 1 }} key={open.letter}><open.Page /></View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
            <Text style={s.intro}>
              Ten checks, one per animation. Each page says what to look at and which screen in FINAL_screens.html to hold it up against.
              "Remove animations" (top right) switches the whole lab to what Android's setting does.
            </Text>
            {TESTS.map(t => (
              <Pressable key={t.letter} onPress={() => setOpen(t)} style={s.item}>
                <Text style={s.letter}>{t.letter}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemTitle}>{t.title}</Text>
                  <Text style={s.itemWhere}>{t.where}</Text>
                </View>
              </Pressable>
            ))}
            <Text style={[s.intro, { marginTop: 16 }]}>H-1, C-4 and so on are the screen numbers in FINAL_screens.html.</Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </LabContext.Provider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: GROUND },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  title: { flex: 1, fontSize: 17, color: INK, fontFamily: 'serif' },
  intro: { fontSize: 13, color: MUTED, lineHeight: 19, marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(33,28,23,0.06)', borderRadius: 14, padding: 14, marginTop: 8 },
  letter: { width: 30, fontSize: 24, color: INK, fontFamily: 'serif', textAlign: 'center' },
  itemTitle: { fontSize: 16, color: INK },
  itemWhere: { fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 17 },
});
