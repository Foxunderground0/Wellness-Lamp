/**
 * Offline mood matching engine.
 *
 * 1. Maps answered questions → 5D mood vector [energy, social, mental, emotional, purpose]
 * 2. Finds the nearest archetype centroid using Euclidean distance (K-means assignment)
 * 3. Applies a small personalised hue shift to the palette colours so each reading
 *    feels unique even when the same archetype is matched
 */

import { QUESTIONS, Question } from '../data/questions';
import { MOOD_ARCHETYPES, MoodArchetype } from '../data/moodArchetypes';
import { MoodPalette } from '../types';
import { hexToHsl, hslToHex } from '../utils/colorMath';

// ─── types ───────────────────────────────────────────────────────────────────

export interface AnswerRecord {
  questionId: string;
  questionText: string;
  score: number; // 1–10 as answered
}

// ─── question lookup ──────────────────────────────────────────────────────────

const QUESTION_MAP = new Map<string, Question>(QUESTIONS.map(q => [q.id, q]));
const QUESTION_BY_TEXT = new Map<string, Question>(QUESTIONS.map(q => [q.text, q]));

function lookupQuestion(idOrText: string): Question | undefined {
  return QUESTION_MAP.get(idOrText) ?? QUESTION_BY_TEXT.get(idOrText);
}

// ─── vector computation ───────────────────────────────────────────────────────

const DIM_ORDER = ['energy', 'social', 'mental', 'emotional', 'purpose'] as const;

/**
 * Convert raw answers to a normalised 5D mood vector (each axis 1–10).
 * Negative-polarity questions are inverted: normalised = 11 – score.
 * Dimensions without any answers default to 5.5 (neutral).
 */
function computeMoodVector(answers: AnswerRecord[]): number[] {
  const sums = [0, 0, 0, 0, 0];
  const counts = [0, 0, 0, 0, 0];

  for (const { questionId, questionText, score } of answers) {
    const q = lookupQuestion(questionId) ?? lookupQuestion(questionText);
    if (!q) { continue; }
    const dimIdx = DIM_ORDER.indexOf(q.dimension as typeof DIM_ORDER[number]);
    if (dimIdx === -1) { continue; }
    const normalised = q.polarity === 'positive' ? score : 11 - score;
    sums[dimIdx] += normalised;
    counts[dimIdx]++;
  }

  return sums.map((sum, i) => (counts[i] > 0 ? sum / counts[i] : 5.5));
}

// ─── K-means nearest-centroid matching ───────────────────────────────────────

function euclidean(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0));
}

function findNearestArchetype(vector: number[]): MoodArchetype {
  let best = MOOD_ARCHETYPES[0];
  let bestDist = Infinity;
  for (const arch of MOOD_ARCHETYPES) {
    const d = euclidean(vector, arch.centroid);
    if (d < bestDist) { bestDist = d; best = arch; }
  }
  return best;
}

// ─── palette personalisation ──────────────────────────────────────────────────

/**
 * Shift every palette colour by a small hue offset derived from the answer
 * signature.  Range: ±12°.  Keeps saturation / lightness intact.
 * Two people who get the same archetype will see subtly different hues.
 */
function personaliseColors(colors: string[], answers: AnswerRecord[]): string[] {
  const scoreSum = answers.reduce((s, a) => s + a.score, 0);
  const hueShift = ((scoreSum % 25) - 12); // –12 … +12 degrees

  return colors.map(hex => {
    const [h, s, l] = hexToHsl(hex);
    const newHue = ((h + hueShift) + 360) % 360;
    return hslToHex(newHue, s, l);
  });
}

/**
 * Personalise the static colour with a slightly larger shift (gives a stronger
 * identity to the "single colour" mode).
 */
function personaliseStaticColor(staticColor: string, answers: AnswerRecord[]): string {
  const scoreSum = answers.reduce((s, a) => s + a.score, 0);
  const hueShift = ((scoreSum % 30) - 15); // –15 … +14 degrees
  const [h, s, l] = hexToHsl(staticColor);
  return hslToHex(((h + hueShift) + 360) % 360, s, l);
}

// ─── public API ───────────────────────────────────────────────────────────────

export interface InferenceResult {
  palette: MoodPalette;
  archetype: MoodArchetype;
  vector: number[]; // the 5D score for debugging / display
}

/**
 * Main inference function.  Fully offline — no network calls.
 */
export function inferMoodOffline(answers: AnswerRecord[]): InferenceResult {
  const vector = computeMoodVector(answers);
  const archetype = findNearestArchetype(vector);

  const colours = personaliseColors(archetype.colors, answers);
  const staticColor = personaliseStaticColor(archetype.staticColor, answers);

  const palette: MoodPalette = {
    colors: colours,
    staticColor,
    mood: archetype.name,
    taglines: archetype.taglines,
    intensity: archetype.intensity,
    isInferred: true,
  };

  return { palette, archetype, vector };
}

/**
 * Dimension-level breakdown for debug / progress display.
 * Returns the current partial vector based on answered questions so far.
 */
export function partialVector(answers: AnswerRecord[]): number[] {
  return computeMoodVector(answers);
}
