import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {MoodPalette} from '../types';
import {UI} from '../theme/colors';
import {MoodArchetype} from '../data/moodArchetypes';

interface Props {
  palette: MoodPalette;
  archetype: MoodArchetype;
  onComplete: () => void;
}

const LOADING_PHRASES = [
  'Reading your colours…',
  'Sensing your energy…',
  'Mapping the light…',
  'Finding your palette…',
  'Weaving the hues…',
  'Almost there…',
];

const PHRASE_DURATION = 620; // ms per phrase
const DOT_STAGGER = 160;      // ms between each dot appearing
const AFTER_DOTS = 500;       // pause before name appears

export default function PaletteReveal({palette, archetype, onComplete}: Props) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'dots' | 'name' | 'tagline' | 'insight' | 'done'>('loading');

  const phraseAnim = useRef(new Animated.Value(1)).current;
  const dotAnims = useRef(palette.colors.map(() => new Animated.Value(0))).current;
  const nameAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const insightAnim = useRef(new Animated.Value(0)).current;

  // ── phrase cycling ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'loading') { return; }
    if (phraseIdx >= LOADING_PHRASES.length - 1) {
      // transition to dots phase
      setTimeout(() => setPhase('dots'), PHRASE_DURATION);
      return;
    }
    const timer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(phraseAnim, {toValue: 0, duration: 220, useNativeDriver: true}),
        Animated.timing(phraseAnim, {toValue: 1, duration: 220, useNativeDriver: true}),
      ]).start(() => setPhraseIdx(prev => prev + 1));
    }, PHRASE_DURATION);
    return () => clearTimeout(timer);
  }, [phase, phraseIdx, phraseAnim]);

  // ── dot reveal ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'dots') { return; }
    const animations = dotAnims.map((anim, i) =>
      Animated.delay(i * DOT_STAGGER).start
        ? Animated.sequence([
            Animated.delay(i * DOT_STAGGER),
            Animated.spring(anim, {toValue: 1, friction: 5, tension: 80, useNativeDriver: true}),
          ])
        : Animated.timing(anim, {toValue: 1, duration: 300, useNativeDriver: true}),
    );

    Animated.stagger(DOT_STAGGER, dotAnims.map((anim) =>
      Animated.spring(anim, {toValue: 1, friction: 5, tension: 80, useNativeDriver: true}),
    )).start(() => {
      setTimeout(() => setPhase('name'), AFTER_DOTS);
    });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── name ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'name') { return; }
    Animated.timing(nameAnim, {toValue: 1, duration: 500, useNativeDriver: true}).start(() => {
      setTimeout(() => setPhase('tagline'), 400);
    });
  }, [phase, nameAnim]);

  // ── tagline ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'tagline') { return; }
    Animated.timing(taglineAnim, {toValue: 1, duration: 500, useNativeDriver: true}).start(() => {
      setTimeout(() => setPhase('insight'), 400);
    });
  }, [phase, taglineAnim]);

  // ── insight ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'insight') { return; }
    Animated.timing(insightAnim, {toValue: 1, duration: 600, useNativeDriver: true}).start(() => {
      setTimeout(() => { setPhase('done'); onComplete(); }, 600);
    });
  }, [phase, insightAnim, onComplete]);

  return (
    <View style={styles.container}>
      {/* Loading phrase */}
      {phase === 'loading' && (
        <Animated.View style={[styles.loadingWrap, {opacity: phraseAnim}]}>
          <View style={styles.spinnerRow}>
            <View style={styles.spinnerDot} />
            <View style={[styles.spinnerDot, {animationDelay: '0.2s'}]} />
            <View style={[styles.spinnerDot, {animationDelay: '0.4s'}]} />
          </View>
          <Text style={styles.loadingPhrase}>{LOADING_PHRASES[phraseIdx]}</Text>
        </Animated.View>
      )}

      {/* Dot palette reveal */}
      {(phase === 'dots' || phase === 'name' || phase === 'tagline' || phase === 'insight' || phase === 'done') && (
        <>
          <View style={styles.dotsRow}>
            {palette.colors.map((color, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: color,
                    opacity: dotAnims[i],
                    transform: [{scale: dotAnims[i].interpolate({
                      inputRange: [0, 1], outputRange: [0.3, i === 0 ? 1.0 : 0.85],
                    })}],
                    width: i === 0 ? 42 : 28,
                    height: i === 0 ? 42 : 28,
                    borderRadius: i === 0 ? 21 : 14,
                  },
                ]}
              />
            ))}
          </View>

          <Animated.Text style={[styles.moodName, {opacity: nameAnim, transform: [{
            translateY: nameAnim.interpolate({inputRange: [0, 1], outputRange: [12, 0]}),
          }]}]}>
            {palette.mood}
          </Animated.Text>

          <Animated.Text style={[styles.tagline, {opacity: taglineAnim, transform: [{
            translateY: taglineAnim.interpolate({inputRange: [0, 1], outputRange: [10, 0]}),
          }]}]}>
            {palette.taglines[0]}
          </Animated.Text>

          <Animated.View style={[styles.insightBox, {opacity: insightAnim, transform: [{
            translateY: insightAnim.interpolate({inputRange: [0, 1], outputRange: [16, 0]}),
          }]}]}>
            <Text style={styles.insightText}>{archetype.insight}</Text>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  loadingWrap: {alignItems: 'center', gap: 18},
  spinnerRow: {flexDirection: 'row', gap: 8},
  spinnerDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: UI.accent, opacity: 0.7,
  },
  loadingPhrase: {
    fontFamily: 'serif', fontSize: 18, color: UI.subtext, fontStyle: 'italic',
    textAlign: 'center', letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 9, flexWrap: 'wrap', justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dot: {
    shadowColor: '#000', shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15, shadowRadius: 7, elevation: 4,
  },
  moodName: {
    fontFamily: 'serif', fontSize: 26, fontWeight: '800', color: UI.text,
    textAlign: 'center', marginTop: 4,
  },
  tagline: {
    fontFamily: 'serif', fontSize: 15, color: UI.subtext, fontStyle: 'italic',
    textAlign: 'center', paddingHorizontal: 24, lineHeight: 22,
  },
  insightBox: {
    backgroundColor: UI.card,
    borderWidth: 1, borderColor: UI.cardBorder,
    borderRadius: 18, padding: 20, marginTop: 4, width: '100%',
  },
  insightText: {
    fontFamily: 'serif', fontSize: 14, color: UI.text, lineHeight: 22,
    textAlign: 'center', fontStyle: 'italic',
  },
});
