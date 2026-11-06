export type Dimension = 'energy' | 'social' | 'mental' | 'emotional' | 'purpose';
export type Polarity = 'positive' | 'negative';

export interface Question {
  id: string;
  text: string;
  dimension: Dimension;
  polarity: Polarity; // positive: score 10 = high on dimension. negative: inverted
}

// 20 per dimension, 100 total
export const QUESTIONS: Question[] = [
  // ── ENERGY (physical, body, vitality) ──────────────────────────────────────
  { id: 'e01', text: 'Does your body feel ready to move right now?', dimension: 'energy', polarity: 'positive' },
  { id: 'e02', text: 'Do you feel like you have a lot left in you tonight?', dimension: 'energy', polarity: 'positive' },
  { id: 'e03', text: 'Would cooking a proper meal tonight feel easy?', dimension: 'energy', polarity: 'positive' },
  { id: 'e04', text: 'Do you feel well-rested right now?', dimension: 'energy', polarity: 'positive' },
  { id: 'e05', text: 'Would you go outside just to feel the air?', dimension: 'energy', polarity: 'positive' },
  { id: 'e06', text: 'Would a flight of stairs feel easy right now?', dimension: 'energy', polarity: 'positive' },
  { id: 'e07', text: 'Do you feel like your body is working with you today?', dimension: 'energy', polarity: 'positive' },
  { id: 'e08', text: 'Would a slow stretch feel good right now?', dimension: 'energy', polarity: 'positive' },
  { id: 'e09', text: 'Could you dance if a good song came on?', dimension: 'energy', polarity: 'positive' },
  { id: 'e10', text: 'Do you feel awake and alert right now?', dimension: 'energy', polarity: 'positive' },
  { id: 'e11', text: 'Could you push through something physically hard right now?', dimension: 'energy', polarity: 'positive' },
  { id: 'e12', text: 'Do you feel like you’ve got some spark left tonight?', dimension: 'energy', polarity: 'positive' },
  { id: 'e13', text: 'Do you feel light on your feet today?', dimension: 'energy', polarity: 'positive' },
  { id: 'e14', text: 'Could you wake up early tomorrow without dreading it?', dimension: 'energy', polarity: 'positive' },
  { id: 'e15', text: 'Do you feel tension or heaviness in your body right now?', dimension: 'energy', polarity: 'negative' },
  { id: 'e16', text: 'Do you feel sluggish and slow today?', dimension: 'energy', polarity: 'negative' },
  { id: 'e17', text: 'Do you feel worn out tonight?', dimension: 'energy', polarity: 'negative' },
  { id: 'e18', text: 'Do you feel restless, like you can’t sit still?', dimension: 'energy', polarity: 'negative' },
  { id: 'e19', text: 'Does your body feel like it is dragging you down?', dimension: 'energy', polarity: 'negative' },
  { id: 'e20', text: 'Do you feel like staying in bed and not moving?', dimension: 'energy', polarity: 'negative' },

  // ── SOCIAL (connection, relationships, belonging) ───────────────────────────
  { id: 's01', text: 'Would you call someone just to hear their voice?', dimension: 'social', polarity: 'positive' },
  { id: 's02', text: 'Could you sit with a friend in comfortable silence?', dimension: 'social', polarity: 'positive' },
  { id: 's03', text: 'Would you tell someone close how you really feel?', dimension: 'social', polarity: 'positive' },
  { id: 's04', text: 'Do you feel like people understand you today?', dimension: 'social', polarity: 'positive' },
  { id: 's05', text: 'Could you ask for help from someone right now?', dimension: 'social', polarity: 'positive' },
  { id: 's06', text: 'Would you want company right now?', dimension: 'social', polarity: 'positive' },
  { id: 's07', text: 'Do you feel connected to the people in your life?', dimension: 'social', polarity: 'positive' },
  { id: 's08', text: 'Would you reach out to someone you have not spoken to lately?', dimension: 'social', polarity: 'positive' },
  { id: 's09', text: 'Do you feel like you matter to someone today?', dimension: 'social', polarity: 'positive' },
  { id: 's10', text: 'Could you be vulnerable with someone you trust right now?', dimension: 'social', polarity: 'positive' },
  { id: 's11', text: 'Do you feel generous towards the people around you?', dimension: 'social', polarity: 'positive' },
  { id: 's12', text: 'Do you feel like sharing good news with someone?', dimension: 'social', polarity: 'positive' },
  { id: 's13', text: 'Would you make plans to see a friend this week?', dimension: 'social', polarity: 'positive' },
  { id: 's14', text: 'Do you feel like you belong somewhere right now?', dimension: 'social', polarity: 'positive' },
  { id: 's15', text: 'Would you let someone look after you a little?', dimension: 'social', polarity: 'positive' },
  { id: 's16', text: 'Do you feel alone even when people are around?', dimension: 'social', polarity: 'negative' },
  { id: 's17', text: 'Would you rather be completely alone right now?', dimension: 'social', polarity: 'negative' },
  { id: 's18', text: 'Do you feel like no one quite gets what you are going through?', dimension: 'social', polarity: 'negative' },
  { id: 's19', text: 'Does being around people feel draining right now?', dimension: 'social', polarity: 'negative' },
  { id: 's20', text: 'Do you feel invisible or overlooked today?', dimension: 'social', polarity: 'negative' },

  // ── MENTAL (clarity, focus, creativity, cognition) ─────────────────────────
  { id: 'm01', text: 'Could you focus on a complex task right now?', dimension: 'mental', polarity: 'positive' },
  { id: 'm02', text: 'Would starting something new feel exciting right now?', dimension: 'mental', polarity: 'positive' },
  { id: 'm03', text: 'Do you feel like your mind is clear right now?', dimension: 'mental', polarity: 'positive' },
  { id: 'm04', text: 'Could you make an important decision without overthinking?', dimension: 'mental', polarity: 'positive' },
  { id: 'm05', text: 'Would a hard book feel like a pleasure right now?', dimension: 'mental', polarity: 'positive' },
  { id: 'm06', text: 'Do you feel like you can solve problems today?', dimension: 'mental', polarity: 'positive' },
  { id: 'm07', text: 'Could you plan your week out clearly right now?', dimension: 'mental', polarity: 'positive' },
  { id: 'm08', text: 'Do you feel mentally sharp today?', dimension: 'mental', polarity: 'positive' },
  { id: 'm09', text: 'Would you enjoy a puzzle or brain teaser right now?', dimension: 'mental', polarity: 'positive' },
  { id: 'm10', text: 'Do you feel creative right now?', dimension: 'mental', polarity: 'positive' },
  { id: 'm11', text: 'Could you learn something new in the next hour?', dimension: 'mental', polarity: 'positive' },
  { id: 'm12', text: 'Do you feel like your ideas are flowing freely?', dimension: 'mental', polarity: 'positive' },
  { id: 'm13', text: 'Could you write something meaningful right now?', dimension: 'mental', polarity: 'positive' },
  { id: 'm14', text: 'Would you work on something that requires patience?', dimension: 'mental', polarity: 'positive' },
  { id: 'm15', text: 'Could you concentrate without your mind wandering?', dimension: 'mental', polarity: 'positive' },
  { id: 'm16', text: 'Do you find your thoughts scattered or hard to follow?', dimension: 'mental', polarity: 'negative' },
  { id: 'm17', text: 'Do you feel mentally foggy or slow today?', dimension: 'mental', polarity: 'negative' },
  { id: 'm18', text: 'Is your mind racing and hard to quiet right now?', dimension: 'mental', polarity: 'negative' },
  { id: 'm19', text: 'Do you find it hard to start or finish things today?', dimension: 'mental', polarity: 'negative' },
  { id: 'm20', text: 'Do you feel overwhelmed by how much is in your head?', dimension: 'mental', polarity: 'negative' },

  // ── EMOTIONAL (inner state, feelings, regulation) ──────────────────────────
  { id: 'o01', text: 'Do you feel at ease with how you are feeling right now?', dimension: 'emotional', polarity: 'positive' },
  { id: 'o02', text: 'Could you sit alone with your thoughts comfortably?', dimension: 'emotional', polarity: 'positive' },
  { id: 'o03', text: 'Do you feel hopeful about something in your life?', dimension: 'emotional', polarity: 'positive' },
  { id: 'o04', text: 'Could you accept something you cannot change today?', dimension: 'emotional', polarity: 'positive' },
  { id: 'o05', text: 'Do you feel grateful for something right now?', dimension: 'emotional', polarity: 'positive' },
  { id: 'o06', text: 'Could you be kind to yourself about a mistake?', dimension: 'emotional', polarity: 'positive' },
  { id: 'o07', text: 'Do you feel settled and calm inside right now?', dimension: 'emotional', polarity: 'positive' },
  { id: 'o08', text: 'Could you let go of something that has been weighing on you?', dimension: 'emotional', polarity: 'positive' },
  { id: 'o09', text: 'Do you feel emotionally open and available right now?', dimension: 'emotional', polarity: 'positive' },
  { id: 'o10', text: 'Could good news land easily for you right now?', dimension: 'emotional', polarity: 'positive' },
  { id: 'o11', text: 'Do you feel a quiet sense of peace right now?', dimension: 'emotional', polarity: 'positive' },
  { id: 'o12', text: 'Would you let yourself feel something difficult if it came up?', dimension: 'emotional', polarity: 'positive' },
  { id: 'o13', text: 'Could you find one small thing to appreciate today?', dimension: 'emotional', polarity: 'positive' },
  { id: 'o14', text: 'Is something sitting heavy on your mind right now?', dimension: 'emotional', polarity: 'negative' },
  { id: 'o15', text: 'Do you feel let down by something or someone today?', dimension: 'emotional', polarity: 'negative' },
  { id: 'o16', text: 'Do you feel like you are carrying something unspoken?', dimension: 'emotional', polarity: 'negative' },
  { id: 'o17', text: 'Is there something from today you are still replaying?', dimension: 'emotional', polarity: 'negative' },
  { id: 'o18', text: 'Do you feel a quiet heaviness you cannot name?', dimension: 'emotional', polarity: 'negative' },
  { id: 'o19', text: 'Do you feel like your emotions are under pressure?', dimension: 'emotional', polarity: 'negative' },
  { id: 'o20', text: 'Do you feel close to your limit right now?', dimension: 'emotional', polarity: 'negative' },

  // ── PURPOSE (meaning, direction, identity, growth) ─────────────────────────
  { id: 'p01', text: 'Do you feel like today had any meaning?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p02', text: 'Does your life feel purposeful lately?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p03', text: 'Do you feel like you are moving in the right direction?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p04', text: 'Could you trust your own instincts right now?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p05', text: 'Do you feel ready to take on tomorrow?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p06', text: 'Do you feel like your efforts are paying off?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p07', text: 'Could you give yourself credit for something small today?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p08', text: 'Do you feel like you are growing as a person?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p09', text: 'Could you face something you have been avoiding?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p10', text: 'Do you feel like things will be okay eventually?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p11', text: 'Could you give tonight your full attention?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p12', text: 'Do you feel like you are where you are supposed to be?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p13', text: 'Could you be fully honest with yourself right now?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p14', text: 'Do you feel a sense of momentum in your life?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p15', text: 'Could you imagine a future you are genuinely excited about?', dimension: 'purpose', polarity: 'positive' },
  { id: 'p16', text: 'Do you feel lost or without direction right now?', dimension: 'purpose', polarity: 'negative' },
  { id: 'p17', text: 'Do you feel like you are just going through the motions?', dimension: 'purpose', polarity: 'negative' },
  { id: 'p18', text: 'Does your effort feel pointless or invisible right now?', dimension: 'purpose', polarity: 'negative' },
  { id: 'p19', text: 'Do you feel like you are falling behind in some way?', dimension: 'purpose', polarity: 'negative' },
  { id: 'p20', text: 'Do you feel disconnected from what matters to you?', dimension: 'purpose', polarity: 'negative' },
];

// Shuffle helper
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate a balanced session queue: questions interleaved across all 5 dimensions.
 * Produces a varied, natural-feeling sequence.
 */
export function generateSessionQueue(perDimension = 8): Question[] {
  const dims: Dimension[] = ['energy', 'social', 'mental', 'emotional', 'purpose'];
  const pools = dims.map(d => shuffle(QUESTIONS.filter(q => q.dimension === d)));
  const queue: Question[] = [];
  for (let round = 0; round < perDimension; round++) {
    const roundSlice = shuffle(dims.map(d => pools[dims.indexOf(d)][round]).filter(Boolean));
    queue.push(...roundSlice);
  }
  return queue;
}
