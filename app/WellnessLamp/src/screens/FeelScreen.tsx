import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import VerticalCarousel from '../components/VerticalCarousel';
import PaletteReveal from '../components/PaletteReveal';
import {generateSessionQueue, Question} from '../data/questions';
import {inferMoodOffline, AnswerRecord} from '../services/moodEngine';
import {smoothPalette} from '../utils/colorMath';
import {MoodPalette} from '../types';
import {MoodArchetype} from '../data/moodArchetypes';
import {UI} from '../theme/colors';
import FrostedTexture from '../components/FrostedTexture';

interface Props {
  onMoodInferred: (palette: MoodPalette, answers: AnswerRecord[]) => void;
}

type Phase = 'questions' | 'revealing' | 'result';

export default function FeelScreen({onMoodInferred}: Props) {
  const [queue]      = useState<Question[]>(() => generateSessionQueue(8));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers]       = useState<AnswerRecord[]>([]);
  const [phase, setPhase]           = useState<Phase>('questions');
  const [result, setResult]         = useState<{palette: MoodPalette; archetype: MoodArchetype} | null>(null);
  const [smoothing, setSmoothing]   = useState(0.28);

  // Reveal fades out, result fades in simultaneously
  const revealFade   = useRef(new Animated.Value(1)).current;
  const resultFade   = useRef(new Animated.Value(0)).current;

  const smoothedColors = useMemo(
    () => (result ? smoothPalette(result.palette.colors, smoothing) : []),
    [result, smoothing],
  );

  const handleAnswer = useCallback(
    (question: {id: string; text: string}, score: number) => {
      setAnswers(prev => [...prev, {questionId: question.id, questionText: question.text, score}]);
      // Don't touch currentIdx — carousel manages its own position internally
    },
    [],
  );

  function handleInfer() {
    if (answers.length === 0) { return; }
    const {palette, archetype} = inferMoodOffline(answers);
    revealFade.setValue(1);
    resultFade.setValue(0);
    setResult({palette, archetype});
    setPhase('revealing');
  }

  function handleRevealComplete() {
    // Fade reveal to nothing first, then softly fade result in
    Animated.sequence([
      Animated.timing(revealFade, {toValue: 0, duration: 700, useNativeDriver: true}),
      Animated.delay(80),
      Animated.timing(resultFade, {toValue: 1, duration: 650, useNativeDriver: true}),
    ]).start(() => setPhase('result'));
  }

  function handleApply() {
    if (!result) { return; }
    onMoodInferred(
      {...result.palette, colors: smoothedColors, staticColor: smoothedColors[0] ?? result.palette.staticColor, isInferred: true},
      answers,
    );
  }

  function handleReset() {
    setAnswers([]);
    setCurrentIdx(0);
    setResult(null);
    setPhase('questions');
    setSmoothing(0.28);
    revealFade.setValue(1);
    resultFade.setValue(0);
  }

  // ── revealing + result (overlaid crossfade) ────────────────────────────────
  if ((phase === 'revealing' || phase === 'result') && result) {
    return (
      <View style={styles.flex}>
        {/* Result view sits underneath — always rendered during this phase */}
        <Animated.View style={[styles.flex, {opacity: resultFade}]} pointerEvents={phase === 'result' ? 'auto' : 'none'}>
          <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.resultMood}>{result.palette.mood}</Text>
            <Text style={styles.resultTagline}>{result.palette.taglines[0]}</Text>

            <View style={styles.palette}>
              {smoothedColors.map((color, i) => (
                <View key={i} style={[styles.dot, {
                  backgroundColor: color,
                  width: 28 + (i === 0 ? 14 : 0),
                  height: 28 + (i === 0 ? 14 : 0),
                  borderRadius: 28,
                }]} />
              ))}
            </View>

            <View style={styles.sliderBox}>
              <FrostedTexture />
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>Palette smoothing</Text>
                <Text style={styles.sliderVal}>{Math.round(smoothing * 100)}%</Text>
              </View>
              <Slider
                style={styles.sliderCtrl}
                minimumValue={0} maximumValue={1}
                value={smoothing} onValueChange={setSmoothing}
                minimumTrackTintColor={UI.accent}
                maximumTrackTintColor={UI.accentLight}
                thumbTintColor={UI.accent}
              />
              <View style={styles.sliderEnds}>
                <Text style={styles.sliderEnd}>Raw</Text>
                <Text style={styles.sliderEnd}>Refined</Text>
              </View>
            </View>

            <Text style={styles.resultSub}>{answers.length} moments considered</Text>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
                <Text style={styles.applyBtnText}>Apply to Lamp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
                <Text style={styles.resetBtnText}>Feel Again</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.insightBox}>
              <FrostedTexture />
              <Text style={styles.insightText}>{result.archetype.insight}</Text>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Reveal overlay — fades out over the result */}
        {phase === 'revealing' && (
          <Animated.View
            style={[StyleSheet.absoluteFill, {opacity: revealFade}]}
            pointerEvents="auto">
            <PaletteReveal
              palette={result.palette}
              archetype={result.archetype}
              onComplete={handleRevealComplete}
            />
          </Animated.View>
        )}
      </View>
    );
  }

  // ── questions ──────────────────────────────────────────────────────────────
  if (currentIdx >= queue.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.exhaustedText}>{answers.length} questions answered</Text>
        <TouchableOpacity style={[styles.inferBtn, {marginTop: 24}]} onPress={handleInfer} activeOpacity={0.8}>
          <Text style={styles.inferBtnText}>Read My Mood</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render cards 0-4 in ONE loop, keyed by question ID only.
  return (
    <View style={styles.container}>
      <Text style={styles.header}>How do I feel?</Text>

      <View style={styles.progressRow}>
        <View style={styles.pill}><Text style={styles.pillText}>{answers.length} answered</Text></View>
        <View style={styles.pill}><Text style={styles.pillText}>{queue.length - answers.length} left</Text></View>
      </View>

      <View style={styles.stack}>
        {/* Pass the FULL queue — carousel tracks its own position internally */}
        <VerticalCarousel
          questions={queue}
          onAnswer={handleAnswer}
        />
      </View>

      {answers.length >= 5 && (
        <TouchableOpacity style={styles.inferBtn} onPress={handleInfer} activeOpacity={0.8}>
          <Text style={styles.inferBtnText}>Read My Mood</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {flex: 1, paddingHorizontal: 20, paddingTop: 8},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32},

  header: {fontFamily: 'serif', fontSize: 26, fontWeight: '800', color: UI.text, marginBottom: 8},
  progressRow: {flexDirection: 'row', gap: 8, marginBottom: 20, alignItems: 'center'},
  pill: {backgroundColor: 'rgba(244,239,229,0.09)', borderWidth: 1, borderColor: UI.cardBorder, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10},
  pillText: {fontFamily: 'serif', fontSize: 12, color: UI.subtext, fontWeight: '600'},
  stack: {flex: 1, position: 'relative'},

  inferBtn: {
    backgroundColor: UI.accent, paddingVertical: 16, paddingHorizontal: 44,
    borderRadius: 30, alignSelf: 'center', marginBottom: 18,
    shadowColor: UI.accent, shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  inferBtnText: {fontFamily: 'serif', color: UI.accentText, fontWeight: '700', fontSize: 16},
  exhaustedText: {fontFamily: 'serif', fontSize: 18, color: UI.text, textAlign: 'center', fontWeight: '600'},

  // result
  resultScroll: {alignItems: 'center', paddingTop: 28, paddingHorizontal: 20, paddingBottom: 40},
  resultMood: {fontFamily: 'serif', fontSize: 26, fontWeight: '800', color: UI.text, textAlign: 'center', marginBottom: 10},
  resultTagline: {
    fontFamily: 'serif', fontSize: 15, color: UI.subtext, fontStyle: 'italic',
    textAlign: 'center', paddingHorizontal: 20, lineHeight: 22, marginBottom: 24,
  },
  palette: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 9, flexWrap: 'wrap', paddingHorizontal: 20, marginBottom: 20,
  },
  dot: {shadowColor: '#000', shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.14, shadowRadius: 7, elevation: 4},

  sliderBox: {
    width: '100%', backgroundColor: UI.card, borderWidth: 1, borderColor: UI.cardBorder, position: 'relative', overflow: 'hidden',
    borderRadius: 18, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10, marginBottom: 16,
  },
  sliderRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2},
  sliderLabel: {fontFamily: 'serif', fontSize: 13, fontWeight: '700', color: UI.text, textTransform: 'uppercase', letterSpacing: 0.8},
  sliderVal: {fontFamily: 'serif', fontSize: 13, fontWeight: '700', color: UI.accent},
  sliderCtrl: {width: '100%', height: 36},
  sliderEnds: {flexDirection: 'row', justifyContent: 'space-between', marginTop: -4},
  sliderEnd: {fontFamily: 'serif', fontSize: 11, color: UI.subtext},

  resultSub: {fontFamily: 'serif', fontSize: 13, color: UI.subtext, marginBottom: 24},
  actions: {gap: 12, alignItems: 'center', marginBottom: 20},
  applyBtn: {
    backgroundColor: UI.accent, paddingVertical: 15, paddingHorizontal: 40,
    borderRadius: 28, shadowColor: UI.accent, shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  applyBtnText: {fontFamily: 'serif', color: UI.accentText, fontWeight: '700', fontSize: 16},
  resetBtn: {borderWidth: 1.5, borderColor: UI.accent, paddingVertical: 13, paddingHorizontal: 36, borderRadius: 24},
  resetBtnText: {fontFamily: 'serif', color: UI.accent, fontWeight: '600', fontSize: 15},
  insightBox: {
    width: '100%', backgroundColor: UI.card, borderWidth: 1, borderColor: UI.cardBorder, position: 'relative', overflow: 'hidden',
    borderRadius: 18, padding: 20, alignItems: 'center',
  },
  insightText: {fontFamily: 'serif', fontSize: 14, color: UI.text, lineHeight: 22, textAlign: 'center', fontStyle: 'italic'},
});
