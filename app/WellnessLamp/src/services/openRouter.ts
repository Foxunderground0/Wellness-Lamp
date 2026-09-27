import {MoodPalette, QuestionAnswer} from '../types';

// Provider credentials must stay server-side; this client key is intentionally unset.
const API_KEY = '';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-oss-20b:nitro';

// ─── helpers ────────────────────────────────────────────────────────────────

function extractJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch {}
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]);
    } catch {}
  }
  const inline = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (inline) {
    try {
      return JSON.parse(inline[0]);
    } catch {}
  }
  return null;
}

function isValidHex(c: string): boolean {
  return typeof c === 'string' && /^#[0-9A-Fa-f]{6}$/.test(c);
}

function sanitizeColors(colors: any): string[] {
  if (!Array.isArray(colors)) {
    return FALLBACK_PALETTE.colors;
  }
  const valid = colors.filter(isValidHex);
  return valid.length >= 4 ? valid : FALLBACK_PALETTE.colors;
}

const FALLBACK_PALETTE: MoodPalette = {
  colors: [
    '#c9b8e8',
    '#b8d4e8',
    '#e8b8c9',
    '#b8e8d4',
    '#e8d4b8',
    '#d4b8e8',
    '#c8d8e8',
    '#e0c8d8',
  ],
  staticColor: '#c9b8e8',
  mood: 'Softly Present',
  taglines: [
    'Gently here, quietly yours',
    'Colours like a held breath',
    'The light finds a way through',
  ],
  intensity: 'calm',
};

// ─── API call ───────────────────────────────────────────────────────────────

/**
 * @param jsonMode  When true: adds response_format=json_object + response-healing plugin.
 *                  Use for all calls that must return valid JSON.
 */
async function callLLM(
  messages: Array<{role: string; content: string}>,
  jsonMode = false,
  retries = 3,
): Promise<string> {
  const label = messages[0]?.content?.slice(0, 60).replace(/\n/g, ' ');
  console.log(`[LLM] → ${MODEL} | json=${jsonMode} | "${label}"`);

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    reasoning: {effort: 'none'}, // disable reasoning — skip thinking, respond immediately
  };
  if (jsonMode) {
    body.response_format = {type: 'json_object'};
    body.plugins = [{id: 'response-healing'}];
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`[LLM] attempt ${attempt + 1}/${retries}`);
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'WellnessLamp',
        },
        body: JSON.stringify(body),
      });
      console.log(`[LLM] HTTP ${res.status}`);
      if (!res.ok) {
        const errText = await res.text();
        console.log(`[LLM] error body: ${errText}`);
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content ?? '';
      console.log(`[LLM] ✓ ${content.length} chars | "${content.slice(0, 100)}"`);
      if (content) { return content; }
      console.log(`[LLM] empty — full response: ${JSON.stringify(data)}`);
      throw new Error('Empty response');
    } catch (err) {
      console.log(`[LLM] ✗ attempt ${attempt + 1} failed: ${err}`);
      if (attempt < retries - 1) {
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`[LLM] retrying in ${delay}ms…`);
        await new Promise<void>(r => setTimeout(() => r(), delay));
      }
    }
  }
  console.log('[LLM] all attempts exhausted');
  return '';
}

// ─── mood inference ─────────────────────────────────────────────────────────

const MOOD_SYSTEM = `You are WellnessMind, a colour therapist AI for a wellness lamp app.
You receive mood questionnaire answers (1-10 scale: 5=neutral, 10=very positive/energetic, 1=very negative/low).
Respond with ONLY valid JSON — no explanation, no markdown, no extra text. Raw JSON only.

Format:
{"colors":["#hex1","#hex2","#hex3","#hex4","#hex5","#hex6","#hex7","#hex8"],"staticColor":"#hex","mood":"poetic label 3-5 words","taglines":["phrase1","phrase2","phrase3","phrase4","phrase5"],"intensity":"calm|vibrant|muted|warm|cool"}

Rules:
- colors: exactly 8 hex colours that flow beautifully as a gradient, chosen using colour psychology for the mood
- Low energy/sad → cool blues, steel greys, deep indigo. High energy/happy → warm oranges, golden yellows, bright coral. Anxious → electric purples, sharp cyan, unsettled greens. Nostalgic → dusty rose, faded gold, warm sepia. Peaceful → sage, mineral blue, warm white. Scattered → high-contrast mixed hues. Lonely → muted blue-violet, deep slate. Grateful → amber, soft gold, warm cream.
- staticColor: the single most representative colour
- mood: poetic 3-5 words — specific and evocative, never generic
- taglines: exactly 5 poetic phrases 5-12 words each. Mix styles: sensory ("the smell of rain on warm stone"), observational ("the way you keep checking the window"), metaphorical ("still water with a current underneath"), temporal ("the last hour before everything changes"), physical ("half the lights on, half the lights off")
- intensity: calm|vibrant|muted|warm|cool

Examples:

Input: [{"question":"Would you go cycling right now?","score":2},{"question":"Would you call a loved one?","score":3},{"question":"Is something on your mind?","score":8},{"question":"Do you feel let down?","score":7},{"question":"Would you watch a show?","score":6}]
Output: {"colors":["#4a5580","#5a6090","#6b7aa8","#3d4870","#7080b0","#506090","#8090c0","#4a5880"],"staticColor":"#5a6090","mood":"Quiet Inner Distance","taglines":["Something stays just out of reach","Wrapped softly in your own quiet","The room feels a little smaller tonight","Watching from the edge of your own mood","Blue is the colour of things left unsaid"],"intensity":"muted"}

Input: [{"question":"Would you go cycling right now?","score":9},{"question":"Would you call a loved one?","score":8},{"question":"Is something on your mind?","score":2},{"question":"Do you feel let down?","score":1},{"question":"Would you watch a show?","score":4}]
Output: {"colors":["#ff8c42","#ffb347","#ffd166","#ff6b6b","#f7c59f","#ff9a56","#ffa07a","#ffcc80"],"staticColor":"#ff9a56","mood":"Alive and Reaching","taglines":["The kind of day that moves on its own","Energy with nowhere left to sit","Light finds every corner of the room","Moving like you actually mean it today","Warm all the way down to the heels"],"intensity":"vibrant"}

Input: [{"question":"Would you go cycling right now?","score":4},{"question":"Would you call a loved one?","score":7},{"question":"Is something on your mind?","score":6},{"question":"Do you feel let down?","score":5},{"question":"Would you watch a show?","score":5}]
Output: {"colors":["#c4829a","#d4a0b0","#a87890","#e0b8c8","#c8a0a8","#b890a0","#d8b0c0","#e8c8d8"],"staticColor":"#c4829a","mood":"Bittersweet and Still","taglines":["Missing something you cannot name","A soft ache sitting in the quiet","Colours blending gently at the edges","The smell of something you used to know","Half the lights on, half the lights off"],"intensity":"calm"}

Input: [{"question":"Would you go cycling right now?","score":6},{"question":"Would you call a loved one?","score":5},{"question":"Is something on your mind?","score":4},{"question":"Do you feel let down?","score":3},{"question":"Would you watch a show?","score":7}]
Output: {"colors":["#88c0b8","#a0d4c0","#b8e8d4","#70b0a8","#90c8b8","#c0dcd4","#d8f0e8","#a8d8d0"],"staticColor":"#88c0b8","mood":"Gently Drifting Along","taglines":["Not quite here, not quite there","The afternoon light on still water","Unhurried and lightly present"],"intensity":"cool"}

Input: [{"question":"Would you go cycling right now?","score":8},{"question":"Would you call a loved one?","score":9},{"question":"Is something on your mind?","score":3},{"question":"Do you feel let down?","score":2},{"question":"Would you watch a show?","score":6}]
Output: {"colors":["#f9a84d","#ffc97a","#fde68a","#f87171","#fbbd7a","#fca55d","#fed7aa","#ffb347"],"staticColor":"#f9a84d","mood":"Warm and Wide Open","taglines":["Arms out to whatever comes next","The world feels generous today","Golden like a well-lit room"],"intensity":"warm"}

Input: [{"question":"Would you go cycling right now?","score":3},{"question":"Would you call a loved one?","score":8},{"question":"Is something on your mind?","score":7},{"question":"Do you feel let down?","score":4},{"question":"Would you watch a show?","score":6}]
Output: {"colors":["#9b7fc4","#b89ad8","#8a6ab0","#c8aee8","#7860a0","#d4c0f0","#a890d0","#8870b8"],"staticColor":"#9b7fc4","mood":"Missing Someone Softly","taglines":["The space where someone used to be","Longing wrapped in something warm","Half here, half somewhere else"],"intensity":"calm"}

Input: [{"question":"Would you go cycling right now?","score":7},{"question":"Would you call a loved one?","score":4},{"question":"Is something on your mind?","score":9},{"question":"Do you feel let down?","score":2},{"question":"Would you watch a show?","score":3}]
Output: {"colors":["#6ec6e8","#50b8e0","#38a8d8","#80d0f0","#28a0d0","#a0d8f0","#209090","#60c0e8"],"staticColor":"#50b8e0","mood":"Sharp and Buzzing","taglines":["Too much going on inside right now","The mind runs ahead of the body","Restless like water before it boils"],"intensity":"vibrant"}

Input: [{"question":"Would you go cycling right now?","score":2},{"question":"Would you call a loved one?","score":2},{"question":"Is something on your mind?","score":9},{"question":"Do you feel let down?","score":9},{"question":"Would you watch a show?","score":3}]
Output: {"colors":["#2a2a4a","#383858","#1e2040","#444468","#303050","#4a4a70","#262640","#3a3a58"],"staticColor":"#2a2a4a","mood":"Heavy and Far Away","taglines":["The weight settles in uninvited","Everything feels further than it is","A darkness that asks to be sat with"],"intensity":"muted"}

Input: [{"question":"Would you go cycling right now?","score":5},{"question":"Would you call a loved one?","score":5},{"question":"Is something on your mind?","score":5},{"question":"Do you feel let down?","score":5},{"question":"Would you watch a show?","score":5}]
Output: {"colors":["#b8c8d8","#c0c8d0","#c8d0d8","#b0b8c8","#c8ccd8","#d0d4e0","#b8c0cc","#c4ccd8"],"staticColor":"#b8c8d8","mood":"Quietly In Between","taglines":["Neither here nor pulling away","A pause between two feelings","The grey that is actually quite soft"],"intensity":"calm"}

Input: [{"question":"Would you go cycling right now?","score":8},{"question":"Would you call a loved one?","score":3},{"question":"Is something on your mind?","score":8},{"question":"Do you feel let down?","score":6},{"question":"Would you watch a show?","score":2}]
Output: {"colors":["#d4804a","#e89050","#c86830","#f0a860","#b85828","#e87840","#f0c080","#d06838"],"staticColor":"#d4804a","mood":"Restless Ember Energy","taglines":["Moving fast to outrun the thinking","Burning with nowhere particular to go","The fire that cannot quite settle"],"intensity":"warm"}

Input: [{"question":"Would you go cycling right now?","score":1},{"question":"Would you call a loved one?","score":9},{"question":"Is something on your mind?","score":4},{"question":"Do you feel let down?","score":3},{"question":"Would you watch a show?","score":8}]
Output: {"colors":["#a8c8b8","#b8d8c8","#90b8a8","#c8e0d0","#88a898","#d0e8d8","#80a090","#b0ccc0"],"staticColor":"#a8c8b8","mood":"Tender and Low Key","taglines":["Soft around the edges today","Close to people, far from effort","Resting in the warmth of small things"],"intensity":"calm"}

Input: [{"question":"Would you go cycling right now?","score":6},{"question":"Would you call a loved one?","score":9},{"question":"Is something on your mind?","score":2},{"question":"Do you feel let down?","score":1},{"question":"Would you watch a show?","score":8}]
Output: {"colors":["#f0c8a0","#e8b880","#f8d8b0","#d8a870","#f0cc90","#e0b878","#fce8c0","#d8a060"],"staticColor":"#f0c8a0","mood":"Grateful Golden Hour","taglines":["Full in a way that needs no explanation","The kind of day worth remembering","Warm all the way through"],"intensity":"warm"}`;

export async function inferMood(answers: QuestionAnswer[]): Promise<MoodPalette> {
  try {
    const content = await callLLM([
      {role: 'system', content: MOOD_SYSTEM},
      {role: 'user', content: JSON.stringify(answers)},
    ], true);
    const parsed = extractJSON(content);
    if (!parsed) {
      return FALLBACK_PALETTE;
    }
    return {
      colors: sanitizeColors(parsed.colors),
      staticColor: isValidHex(parsed.staticColor)
        ? parsed.staticColor
        : FALLBACK_PALETTE.staticColor,
      mood:
        typeof parsed.mood === 'string' ? parsed.mood : FALLBACK_PALETTE.mood,
      taglines:
        Array.isArray(parsed.taglines) && parsed.taglines.length >= 1
          ? parsed.taglines.filter((t: any) => typeof t === 'string')
          : FALLBACK_PALETTE.taglines,
      intensity: ['calm', 'vibrant', 'muted', 'warm', 'cool'].includes(
        parsed.intensity,
      )
        ? parsed.intensity
        : 'calm',
    };
  } catch {
    return FALLBACK_PALETTE;
  }
}

// ─── question generation ─────────────────────────────────────────────────────

// ─── question generation — 4 independent themed variants ─────────────────────
// Each fires as a fresh independent call (no shared history).
// Running all 4 in parallel yields ~80 diverse questions per batch.

const Q_BASE = `You are WellnessMind. Output ONLY a valid JSON array of question strings. No markdown, no text outside the array.
Rules: each question under 12 words, behavioral (what the person would DO), answerable on a 1-10 scale.`;

// 8 questions per call — fast response, top up more frequently
const Q_VARIANTS = [
  {
    system: `${Q_BASE} Focus on physical energy, movement, and the body.`,
    user: 'Generate 8 questions about physical energy. JSON array only.',
    example: '["Would you go for a run outside right now?","Could you walk for an hour without stopping?","Would you cook a full meal from scratch?","Do you feel well-rested when you wake up?","Could you dance if a good song came on?","Would you go outside just to feel the air?","Do you feel heavy or light on your feet?","Would you eat something nourishing right now?"]',
  },
  {
    system: `${Q_BASE} Focus on social connection: reaching out, being with others, sharing feelings.`,
    user: 'Generate 8 questions about social connection. JSON array only.',
    example: '["Would you call someone just to hear their voice?","Could you sit with a friend in comfortable silence?","Would you tell someone close how you really feel?","Could you ask for help if you needed it?","Would you want company right now?","Do you feel connected to the people around you?","Would you reach out to someone you have not spoken to?","Could you be vulnerable with someone you trust?"]',
  },
  {
    system: `${Q_BASE} Focus on mental clarity: concentration, decisions, creativity, learning.`,
    user: 'Generate 8 questions about mental clarity. JSON array only.',
    example: '["Could you focus on a complex task right now?","Would you start a new creative project today?","Could you make an important decision without overthinking?","Would you read something challenging for pleasure?","Do you feel mentally sharp today?","Could you concentrate without your mind wandering?","Would you enjoy a puzzle or brain teaser?","Could you articulate exactly how you feel right now?"]',
  },
  {
    system: `${Q_BASE} Focus on emotional state: purpose, acceptance, hope, gratitude, inner peace.`,
    user: 'Generate 8 questions about emotional depth and meaning. JSON array only.',
    example: '["Do you feel like today had any meaning?","Could you sit alone with your thoughts comfortably?","Do you feel hopeful about something in your life?","Would you let yourself rest without feeling guilty?","Do you feel grateful for something right now?","Could you let go of something weighing on you?","Would you trust your own instincts right now?","Could you be fully honest with yourself right now?"]',
  },
];

/** Fire one themed variant. Each call is fully independent — no shared history. */
export async function generateQuestionsVariant(variantIdx: number): Promise<string[]> {
  const v = Q_VARIANTS[variantIdx % Q_VARIANTS.length];
  const content = await callLLM([
    {role: 'system', content: v.system},
    {role: 'user',   content: `Example of correct output format:\n${v.example}\n\nNow: ${v.user}`},
  ], true);
  const parsed = extractJSON(content);
  if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((q: any) => typeof q === 'string')) {
    return parsed as string[];
  }
  return [];
}

/** Fire all 4 variants in parallel — ~80 diverse questions at once. */
export async function generateQuestionsBatch(): Promise<string[]> {
  const results = await Promise.allSettled(
    Q_VARIANTS.map((_, i) => generateQuestionsVariant(i)),
  );
  const all: string[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') { all.push(...r.value); }
  }
  return all;
}

/** Single fast call — used for quick top-ups when pool is low. */
export async function generateQuestions(urgent = false): Promise<string[]> {
  const idx = urgent ? Math.floor(Math.random() * Q_VARIANTS.length) : 0;
  return generateQuestionsVariant(idx);
}

// ─── colour insight ───────────────────────────────────────────────────────────

const INSIGHT_SYSTEM = `You are WellnessMind. A user just completed a mood assessment and received a colour palette.
Write exactly 2-3 warm, specific sentences explaining why these colours connect to how they feel.
Be poetic but grounded — reference the actual colours and the actual mood.
Output only the explanation text. No JSON, no headings, no bullet points.

Examples:

Input: {"mood":"Quiet Inner Distance","colors":["#4a5580","#5a6090"],"intensity":"muted","topAnswers":[{"question":"Is something on your mind?","score":8},{"question":"Do you feel let down?","score":7}]}
Output: These cool, receding blues mirror the feeling of being slightly apart from everything — present but not quite reachable. The muted depth of each tone reflects something weighing on you that hasn't fully surfaced yet. Blue at this depth is the colour of things left unsaid.

Input: {"mood":"Alive and Reaching","colors":["#ff8c42","#ffd166"],"intensity":"vibrant","topAnswers":[{"question":"Would you go cycling right now?","score":9},{"question":"Would you call a loved one?","score":8}]}
Output: These warm, luminous oranges and golds are the visual signature of your energy today — expansive, generous, hard to contain. The brightness in these tones matches the way you're moving through the world right now: forward and open. This palette is what joy looks like when it has somewhere to go.

Input: {"mood":"Missing Someone Softly","colors":["#9b7fc4","#c8aee8"],"intensity":"calm","topAnswers":[{"question":"Would you call a loved one?","score":8},{"question":"Is something on your mind?","score":7}]}
Output: Soft violet and lilac carry a particular kind of longing — tender rather than sharp, the colour of someone on the edge of your thoughts. These hues sit between warmth and melancholy, which is exactly where you seem to be. Purple at this softness is the colour of missing without bitterness.`;

// ─── streaming call (for insight text-typing effect) ─────────────────────────

export async function callLLMStream(
  messages: Array<{role: string; content: string}>,
  onChunk: (text: string) => void,
): Promise<string> {
  console.log('[LLM stream] → starting');
  const body = {
    model: MODEL,
    messages,
    stream: true,
    reasoning: {effort: 'none'},
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'WellnessLamp',
        },
        body: JSON.stringify(body),
      });
      console.log(`[LLM stream] HTTP ${res.status}`);
      if (!res.ok) {
        const err = await res.text();
        console.log(`[LLM stream] error: ${err}`);
        throw new Error(`HTTP ${res.status}`);
      }

      // RN types don't expose body/TextDecoder — cast to any
      const reader = (res as any).body?.getReader();
      if (!reader) { throw new Error('No reader'); }
      // eslint-disable-next-line no-undef
      const decoder = new (globalThis as any).TextDecoder();
      let full = '';

      while (true) {
        const {done, value} = await reader.read();
        if (done) { break; }
        const raw = decoder.decode(value, {stream: true});
        for (const line of raw.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) { continue; }
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') { break; }
          try {
            const chunk = JSON.parse(data);
            const text = chunk?.choices?.[0]?.delta?.content ?? '';
            if (text) { full += text; onChunk(text); }
          } catch {}
        }
      }
      console.log(`[LLM stream] ✓ ${full.length} chars total`);
      return full;
    } catch (err) {
      console.log(`[LLM stream] ✗ attempt ${attempt + 1}: ${err}`);
      if (attempt < 2) {
        await new Promise<void>(r => setTimeout(() => r(), 1000 * Math.pow(2, attempt)));
      }
    }
  }
  return '';
}

export async function getColorInsight(
  palette: MoodPalette,
  answers: QuestionAnswer[],
  onChunk: (text: string) => void,
): Promise<string> {
  const topAnswers = [...answers]
    .sort((a, b) => Math.abs(b.score - 5) - Math.abs(a.score - 5))
    .slice(0, 5);
  const input = {mood: palette.mood, colors: palette.colors.slice(0, 3), intensity: palette.intensity, topAnswers};
  const result = await callLLMStream(
    [{role: 'system', content: INSIGHT_SYSTEM}, {role: 'user', content: JSON.stringify(input)}],
    onChunk,
  );
  return result.trim() || 'These colours were chosen to hold the quiet complexity of how you feel right now.';
}
