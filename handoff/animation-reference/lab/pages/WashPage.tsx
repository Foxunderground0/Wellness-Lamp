// G. Wash: the soft coloured background. Home's wash (bleeds in from the edges after Set the scene, recedes on Undo / All off)
// and the scene view's wash (always on, cross-fades between scenes, brightens after Set the scene).
import React, { useEffect, useRef, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { BackgroundWash, HOME_WASH_OPACITY, SceneWash } from '../../BackgroundWash';
import { Orb, type OrbHandle } from '../../Orb';
import { byName } from '../palettes';
import { Btn, FloatingBrief, OrbSlot, Row, styles, useLab, useStopwatch, useTimers } from '../ui';

const SCENES = ['Warm and Wide Open', 'Quietly In Between', 'Golden Hour', 'Deep Night', 'Candy Dream', 'Forest Floor'];

export function WashPage() {
  const { reduce } = useLab();
  const { width, height } = useWindowDimensions();
  const orb = useRef<OrbHandle>(null);
  const sw = useStopwatch();
  const { later, clear } = useTimers();
  const [kind, setKind] = useState<'home' | 'scene'>('home');
  const [scene, setScene] = useState(SCENES[0]);
  const [shown, setShown] = useState(false);
  const [lit, setLit] = useState(false);
  const cols = byName(scene).colours;
  useEffect(() => { orb.current?.rest(false); }, []);
  const muted = shown || kind === 'scene' ? '#4A443E' : '#605a53';

  // Home: the screen starts the wash 0.9 s after Set the scene, while the orb blooms. Undo and All off recede it.
  const homeSet = () => { clear(); orb.current?.bloom(); sw.start(); later(() => setShown(true), reduce ? 0 : 900); };
  const homeUndo = () => { clear(); orb.current?.undo(); setShown(false); sw.start(); };

  return (
    <View style={{ flex: 1 }}>
      {kind === 'home'
        ? <BackgroundWash width={width} height={height} colours={cols} opacity={HOME_WASH_OPACITY} shown={shown} reduceMotion={reduce} />
        : <SceneWash width={width} height={height} colours={cols} lit={lit} reduceMotion={reduce} />}
      <View style={{ flex: 1, padding: 16 }} pointerEvents="box-none">
        <Row style={{ marginTop: 0 }}>
          <Btn small on={kind === 'home'} label="Home's wash" onPress={() => { clear(); orb.current?.rest(false); setKind('home'); setShown(false); setLit(false); sw.stop(); }} />
          <Btn small on={kind === 'scene'} label="Scene view's wash" onPress={() => { clear(); orb.current?.rest(false); setKind('scene'); setLit(false); sw.stop(); }} />
        </Row>
        <Row>{SCENES.map(n => <Btn key={n} small on={scene === n} label={n} onPress={() => { setScene(n); if (kind === 'scene') sw.start(); }} />)}</Row>
        {kind === 'home' ? (
          <>
            <Row>
              <Btn label="Set the scene (bloom + wash)" onPress={homeSet} />
              <Btn label="Undo / All off" onPress={homeUndo} />
            </Row>
            <Row>
              <Btn small label="Wash only: bleed in (4.5 s)" onPress={() => { clear(); setShown(true); sw.start(); }} />
              <Btn small label="Wash only: recede (3 s)" onPress={() => { clear(); setShown(false); sw.start(); }} />
            </Row>
          </>
        ) : (
          <Row>
            <Btn label="Set the scene: brighten" onPress={() => { orb.current?.bloom(); setLit(true); sw.start(); }} />
            <Btn label="Undo: back to 0.40" onPress={() => { orb.current?.undo(); setLit(false); sw.start(); }} />
          </Row>
        )}
        <Text style={{ fontSize: 12, color: muted, marginTop: 6 }}>
          {sw.label}  ·  {kind === 'home' ? (shown ? 'wash on (strength ' + HOME_WASH_OPACITY + ')' : 'wash off') : (lit ? 'lit (0.50)' : 'normal (0.40)')}
        </Text>
        <OrbSlot size={176} height={260}><Orb ref={orb} size={176} colours={cols} reduceMotion={reduce} /></OrbSlot>
        <Text style={{ fontSize: 22, fontFamily: 'serif', color: '#211c17', textAlign: 'center' }}>{scene}</Text>
        <Text style={{ fontSize: 14, color: muted, textAlign: 'center', marginTop: 4 }}>Muted text: darkened to #4A443E while a wash is on</Text>
      </View>
      <FloatingBrief
        check={[
          'Home: press "Set the scene". The orb blooms; 0.9 s later the wash starts to bleed in from the OUTER EDGES of the screen toward the middle (4.5 s: fast at first, then slowly settling). Undo / All off closes it slowly back to the edges over 3 s (it never just disappears). No hard edge anywhere: everything is soft.',
          'Home strength is 0.46 (HOME_WASH_OPACITY): a little more colour than the scene view\'s resting 0.40, but clearly softer than the scene view once lit (0.50). Compare the two modes with the same scene: Home should read as clearly coloured, never saturated or bright.',
          'The wash is one slowly moving form: soft ruffled lobes of the scene\'s colours on cream. Over 30 to 60 s it drifts; in a few seconds you should see it breathing a little.',
          'Colours blend cleanly: where two colours meet the blend stays saturated and goes lighter, never grey or brown. Dark palettes (Deep Night) stay pastel and airy.',
          'The orb sits clearly on top. Its halo and the wash should look as in FINAL: the halo is a tight pale glow, the wash a broad one.',
          'Scene view: the wash is already fully on when you open it (no bleed). Tapping another scene cross-fades the wash over 1.2 s. Set the scene brightens it from 0.40 to 0.50 over 1.2 s; Undo dims it back.',
          'Remove animations: the wash is a single still frame; it fades in and out over 0.8 s instead of bleeding; cross-fades are instant.',
        ]}
        compare="FINAL_screens.html: H-2 A scene set (wash on Home), H-6 All off, L-12 Scene view (the scene view's wash). In FINAL_prototype.html: Home tab, Set the scene, then the All switch; Library tab, open a scene and swipe."
      />
    </View>
  );
}
