import React, {useState} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Slider from '@react-native-community/slider';
import {UI} from '../theme/colors';

interface Props {
  question: string;
  stackIndex: number; // 0=front, 1=mid, 2=back, 3-4=off-screen pre-render
  onAnswer: (score: number) => void;
  exitAnim: Animated.Value;
}

const Y_OFFSETS  = [0, 16, 32];
const SCALES     = [1, 0.955, 0.912];
const OPACITIES  = [1, 0.82, 0.65];

export default function QuestionCard({question, stackIndex, onAnswer, exitAnim}: Props) {
  const [score, setScore] = useState(5);
  const isActive = stackIndex === 0;

  // ── cards at stackIndex >= 3 are pre-rendered completely off-screen ──────
  // Same component instance — no unmount/remount when they slide into view.
  if (stackIndex >= 3) {
    return (
      <View style={styles.offscreen} pointerEvents="none">
        <Text style={styles.question}>{question}</Text>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Not at all</Text>
          <Text style={styles.scoreNumDim}>5</Text>
          <Text style={styles.label}>Absolutely</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1} maximumValue={10} step={1} value={5}
          minimumTrackTintColor={UI.accentLight}
          maximumTrackTintColor={UI.accentLight}
          thumbTintColor={UI.accentLight}
          disabled
        />
        {/* Invisible placeholder keeps height identical to active card */}
        <View style={[styles.nextBtn, {opacity: 0}]}>
          <Text style={styles.nextBtnText}>Next →</Text>
        </View>
      </View>
    );
  }

  // ── visible stack (0, 1, 2) ───────────────────────────────────────────────
  const translateY = exitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isActive
      ? [0, -440]
      : [Y_OFFSETS[stackIndex], Y_OFFSETS[stackIndex - 1]],
  });
  const scale = exitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isActive
      ? [1, 0.94]
      : [SCALES[stackIndex], SCALES[stackIndex - 1]],
  });
  const opacity = exitAnim.interpolate({
    inputRange: isActive ? [0, 0.5, 1] : [0, 1],
    outputRange: isActive
      ? [1, 0.15, 0]
      : [OPACITIES[stackIndex], OPACITIES[stackIndex - 1]],
  });

  return (
    <Animated.View
      pointerEvents={isActive ? 'auto' : 'none'}
      style={[
        styles.card,
        {transform: [{translateY}, {scale}], opacity, zIndex: 10 - stackIndex},
      ]}>
      <Text style={styles.question}>{question}</Text>

      {/* Layout is IDENTICAL for all positions — no reflow when card becomes active */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>Not at all</Text>
        <Text style={[styles.scoreNum, !isActive && styles.scoreNumDim]}>{score}</Text>
        <Text style={styles.label}>Absolutely</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={1} maximumValue={10} step={1}
        value={score}
        onValueChange={isActive ? v => setScore(Math.round(v)) : undefined}
        minimumTrackTintColor={isActive ? UI.accent : UI.accentLight}
        maximumTrackTintColor={UI.accentLight}
        thumbTintColor={isActive ? UI.accent : UI.accentLight}
        disabled={!isActive}
      />

      {/* Always in layout — invisible on non-active so height never shifts */}
      <TouchableOpacity
        style={[styles.nextBtn, !isActive && {opacity: 0}]}
        activeOpacity={0.8}
        onPress={isActive ? () => onAnswer(score) : undefined}>
        <Text style={styles.nextBtnText}>Next →</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: '100%',
    backgroundColor: UI.card,
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: UI.cardBorder,
    shadowColor: '#9c7bb5',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 10,
  },
  // Completely off-screen but fully painted — no opacity 0 trick which causes re-render
  offscreen: {
    position: 'absolute',
    width: '100%',
    top: 9999,
    backgroundColor: UI.card,
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: UI.cardBorder,
  },
  question: {
    fontFamily: 'serif', fontSize: 21, color: UI.text, fontWeight: '600',
    lineHeight: 32, marginBottom: 28,
  },
  labelRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  label: {fontFamily: 'serif', fontSize: 12, color: UI.subtext},
  scoreNum: {fontFamily: 'serif', fontSize: 30, fontWeight: '800', color: UI.accent},
  scoreNumDim: {fontFamily: 'serif', fontSize: 30, fontWeight: '800', color: UI.accentLight},
  slider: {width: '100%', height: 40},
  nextBtn: {
    marginTop: 16, alignSelf: 'flex-end',
    backgroundColor: UI.accent,
    paddingHorizontal: 26, paddingVertical: 13,
    borderRadius: 22,
    shadowColor: UI.accent, shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  nextBtnText: {fontFamily: 'serif', color: '#fff', fontWeight: '700', fontSize: 15},
});
