/**
 * Pure module-level question pool — no LLM imports.
 * Questions are persisted to AsyncStorage so they survive app restarts.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@wellness_question_pool';

// Load persisted questions from storage on startup (fire-and-forget)
async function loadPersistedPool() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved: string[] = JSON.parse(raw);
      let added = 0;
      for (const q of saved) {
        if (q && !useCounts.has(q)) {
          useCounts.set(q, 0);
          added++;
        }
      }
      if (added > 0) {
        console.log(`[QuestionBank] restored ${added} questions from storage (total: ${useCounts.size})`);
      }
    }
  } catch (e) {
    console.log('[QuestionBank] load error:', e);
  }
}

async function persistPool() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...useCounts.keys()]));
  } catch (e) {
    console.log('[QuestionBank] save error:', e);
  }
}

const SEED: string[] = [
  'Would you go for a cycle or walk right now?',
  'Would you speak to a loved one right now?',
  'Would you watch a TV show right now?',
  'Is something sitting heavy on your mind?',
  'Do you feel let down by something today?',
  'Could you concentrate on a task right now?',
  'Would you want to be around people right now?',
  'Do you feel like your day had any meaning?',
  'Could you easily fall asleep right now?',
  'Would you pick up a hobby or creative thing?',
];

// question → lifetime show count
const useCounts = new Map<string, number>(SEED.map(q => [q, 0]));

// Hydrate from storage immediately
loadPersistedPool();

// ── add questions ─────────────────────────────────────────────────────────────

/** Add new questions. Returns how many were genuinely new. */
export function addToPool(questions: string[]): number {
  let added = 0;
  for (const q of questions) {
    const trimmed = q.trim();
    if (trimmed && !useCounts.has(trimmed)) {
      useCounts.set(trimmed, 0);
      added++;
    }
  }
  if (added > 0) {
    console.log(`[QuestionBank] added ${added} questions (total: ${useCounts.size})`);
    persistPool(); // fire-and-forget save
  }
  return added;
}

// ── retrieve questions ────────────────────────────────────────────────────────

/**
 * Returns the full pool shuffled, least-used first within each tier.
 * Call this at the start of a Feel session or when appending to a queue.
 */
export function getOrderedPool(): string[] {
  const groups = new Map<number, string[]>();
  for (const [q, n] of useCounts.entries()) {
    if (!groups.has(n)) { groups.set(n, []); }
    groups.get(n)!.push(q);
  }
  const result: string[] = [];
  for (const [, qs] of [...groups.entries()].sort((a, b) => a[0] - b[0])) {
    shuffle(qs);
    result.push(...qs);
  }
  return result;
}

/**
 * Insert new questions at random positions after `afterIdx` in an existing queue.
 * This mixes fresh questions in rather than appending them at the end.
 */
export function insertRandom(
  queue: string[],
  newQuestions: string[],
  afterIdx: number,
): string[] {
  const result = [...queue];
  const insertRange = result.length - afterIdx;
  for (const q of newQuestions) {
    const pos = afterIdx + 1 + Math.floor(Math.random() * Math.max(1, insertRange));
    result.splice(pos, 0, q);
  }
  return result;
}

export function markUsed(question: string) {
  useCounts.set(question, (useCounts.get(question) ?? 0) + 1);
}

export function poolSize(): number {
  return useCounts.size;
}

// ── utils ─────────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
