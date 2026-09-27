/**
 * Horizontal card swiper.
 * Active card exits to the LEFT. Next card is pre-rendered off-screen RIGHT and slides in.
 * Each card owns its posAnim — no shared reset, no glitch.
 *
 * posAnim:  -1 = exited left   0 = active (centre)   1 = waiting right   2 = pre-load far right
 */

import React, {useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {UI} from '../theme/colors';
import FrostedTexture from './FrostedTexture';

const SW = Dimensions.get('window').width;

// ── position → visual mapping ─────────────────────────────────────────────────
const POS_RANGE  = [-1,   0,  1,     2    ];
const TRANS_X    = [-SW,  0,  SW,    SW*2 ];  // horizontal offsets
const SCALE_MAP  = [0.94, 1,  0.97,  0.94 ];  // slight shrink off-centre
const OPAC_MAP   = [0,    1,  1,     1    ];   // off-screen right is pre-painted opaque

// Interactive controls (slider + button) fade in only when centred.
// Question text is ALWAYS visible — it slides in with the card, no fade jump.
const UI_IN  = [-0.7, -0.15, 0, 0.15, 0.7];
const UI_OUT = [ 0,    0,    1,  0,   0  ];

// ── types ─────────────────────────────────────────────────────────────────────

interface Question { id: string; text: string; }

interface LiveCard {
  question: Question;
  posAnim: Animated.Value;
  slot: number;
}

export interface CarouselProps {
  questions: Question[];
  onAnswer: (question: Question, score: number) => void;
}

// ── single card ───────────────────────────────────────────────────────────────

function SingleCard({
  card,
  onAnswer,
}: {
  card: LiveCard;
  onAnswer: (score: number) => void;
}) {
  const [score, setScore] = useState(5);
  const {posAnim, slot} = card;
  const isActive = slot === 0;

  const translateX = posAnim.interpolate({inputRange: POS_RANGE, outputRange: TRANS_X, extrapolate: 'clamp'});
  const scale      = posAnim.interpolate({inputRange: POS_RANGE, outputRange: SCALE_MAP, extrapolate: 'clamp'});
  const opacity    = posAnim.interpolate({inputRange: POS_RANGE, outputRange: OPAC_MAP, extrapolate: 'clamp'});
  const uiOpac     = posAnim.interpolate({inputRange: UI_IN, outputRange: UI_OUT, extrapolate: 'clamp'});

  return (
    <Animated.View
      pointerEvents={isActive ? 'auto' : 'none'}
      style={[
        styles.card,
        {
          zIndex: 10 - Math.max(0, slot),
          opacity,
          shadowOpacity: isActive ? 0.12 : 0.03,
          shadowRadius:  isActive ? 18 : 4,
          elevation:     isActive ? 7 : 1,
          transform: [{translateX}, {scale}],
        },
      ]}>
      <FrostedTexture />
      {/* Text is always fully visible — slides in with the card, no fade jump */}
      <Text style={styles.question}>{card.question.text}</Text>

      {/* Interactive controls fade in/out only when card is centred */}
      <Animated.View style={{opacity: uiOpac}} pointerEvents={isActive ? 'auto' : 'none'}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Not at all</Text>
          <Text style={styles.scoreNum}>{score}</Text>
          <Text style={styles.label}>Absolutely</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1} maximumValue={10} step={1}
          value={score}
          onValueChange={isActive ? v => setScore(Math.round(v)) : undefined}
          minimumTrackTintColor={UI.accent}
          maximumTrackTintColor={UI.accentLight}
          thumbTintColor={UI.accent}
          disabled={!isActive}
        />
        <TouchableOpacity
          style={styles.nextBtn}
          activeOpacity={0.8}
          onPress={isActive ? () => onAnswer(score) : undefined}>
          <Text style={styles.nextBtnText}>Next →</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// ── carousel ──────────────────────────────────────────────────────────────────

function initCards(questions: Question[]): LiveCard[] {
  return questions.slice(0, 3).map((q, i) => ({
    question: q,
    posAnim: new Animated.Value(i),
    slot: i,
  }));
}

export default function VerticalCarousel({questions, onAnswer}: CarouselProps) {
  const cardsRef   = useRef<LiveCard[]>(initCards(questions));
  const nextIdx    = useRef(Math.min(3, questions.length));
  const busy       = useRef(false);
  const [, redraw] = useState(0);

  function handleAnswer(score: number) {
    if (busy.current || cardsRef.current.length === 0) { return; }
    busy.current = true;

    const front = cardsRef.current[0];
    onAnswer(front.question, score);

    // All live cards slide left by 1 slot simultaneously
    Animated.parallel(
      cardsRef.current.map(card =>
        Animated.timing(card.posAnim, {
          toValue: card.slot - 1,
          duration: 320,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ),
    ).start(() => {
      for (const card of cardsRef.current) { card.slot -= 1; }

      // Remove the exited card (slot = -1)
      cardsRef.current = cardsRef.current.filter(c => c.slot >= 0);

      // Add the next question pre-loaded off-screen right
      if (nextIdx.current < questions.length) {
        const newSlot = cardsRef.current.length;
        cardsRef.current.push({
          question: questions[nextIdx.current],
          posAnim:  new Animated.Value(newSlot),
          slot:     newSlot,
        });
        nextIdx.current++;
      }

      busy.current = false;
      redraw(n => n + 1);
    });
  }

  return (
    // overflow:hidden clips the off-screen right cards so they don't bleed outside
    <View style={styles.container}>
      {cardsRef.current.map(card => (
        <SingleCard key={card.question.id} card={card} onAnswer={handleAnswer} />
      ))}
    </View>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  card: {
    position: 'absolute',
    width: '100%',
    // Keep this large, animated card opaque. On Android, a translucent
    // background plus rounded clipping is composited as a second inset plane.
    // This closely matches the shared glass colour while staying one surface.
    backgroundColor: UI.cardSolid,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: UI.cardBorder,
    overflow: 'hidden',
    shadowColor: '#8e7561',
    shadowOffset: {width: 0, height: 8},
  },
  question: {
    fontFamily: 'serif', fontSize: 21, color: UI.text, fontWeight: '600',
    lineHeight: 32, marginBottom: 28,
  },
  questionDim: {color: UI.subtext, fontWeight: '500'},
  labelRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  label: {fontFamily: 'serif', fontSize: 12, color: UI.subtext},
  scoreNum: {fontFamily: 'serif', fontSize: 30, fontWeight: '800', color: UI.accent},
  slider: {width: '100%', height: 40},
  nextBtn: {
    marginTop: 16, alignSelf: 'flex-end',
    backgroundColor: UI.accent,
    paddingHorizontal: 26, paddingVertical: 13,
    borderRadius: 22,
    shadowColor: UI.accent, shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  nextBtnText: {fontFamily: 'serif', color: UI.accentText, fontWeight: '700', fontSize: 15},
});
