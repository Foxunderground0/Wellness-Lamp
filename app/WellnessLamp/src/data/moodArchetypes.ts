/**
 * 25 mood archetypes — palettes redesigned for physical LED ring visibility.
 * Each palette spans 150°+ of the colour wheel so the ring shows clearly
 * distinct hues as it cycles through the Catmull-Rom spline.
 * Saturation 85-100%, lightness 45-62%.
 */

export interface MoodArchetype {
  id: string;
  name: string;
  centroid: [number, number, number, number, number];
  colors: string[];
  staticColor: string;
  taglines: string[];
  intensity: 'calm' | 'vibrant' | 'muted' | 'warm' | 'cool';
  insight: string;
}

export const MOOD_ARCHETYPES: MoodArchetype[] = [
  // ── HIGH ENERGY / POSITIVE ──────────────────────────────────────────────────
  {
    id: 'alive-reaching',
    name: 'Alive and Reaching',
    centroid: [8.5, 8.5, 7.0, 8.0, 8.5],
    // Orange → Yellow → Hot Red — fire palette
    colors: ['#FF6200','#FFD700','#FF2800','#FF9900','#FFE500','#FF4400','#FFB800','#FF3A00'],
    staticColor: '#FF6200',
    taglines: [
      'The kind of day that moves on its own',
      'Energy with nowhere left to sit',
      'Light finds every corner of the room',
      'Moving like you actually mean it today',
      'Warm all the way down to the heels',
    ],
    intensity: 'vibrant',
    insight: 'These warm, luminous oranges and golds are the visual signature of your energy today — expansive, generous, hard to contain. The brightness in these tones matches the way you\'re moving through the world right now: forward and open.',
  },
  {
    id: 'warm-wide-open',
    name: 'Warm and Wide Open',
    centroid: [7.5, 8.0, 6.0, 8.0, 7.0],
    // Gold → Coral → Amber — warm spread
    colors: ['#FFB300','#FF5500','#FFE000','#FF4400','#FFC800','#FF7700','#FFD800','#FF6800'],
    staticColor: '#FFB300',
    taglines: [
      'Arms out to whatever comes next',
      'The world feels generous today',
      'Golden like a well-lit room',
      'Something good is already on its way',
      'Soft and ready and here',
    ],
    intensity: 'warm',
    insight: 'Amber and warm gold carry the feeling of space — of being at ease with who you are and what today holds. These colours reflect a kind of openness that isn\'t loud, just steady.',
  },
  {
    id: 'grateful-golden-hour',
    name: 'Grateful Golden Hour',
    centroid: [7.0, 8.5, 6.5, 8.5, 8.5],
    // Gold → Fire orange → Electric yellow
    colors: ['#FFD000','#FF4400','#FFE900','#FF8800','#FFB800','#FF2200','#FFC500','#FF6600'],
    staticColor: '#FFD000',
    taglines: [
      'Full in a way that needs no explanation',
      'The kind of day worth remembering',
      'Warm all the way through',
      'Everything you needed was already here',
      'The last hour of light, at its best',
    ],
    intensity: 'warm',
    insight: 'Deep amber and fire gold are the colours of gratitude — not the performative kind, but the quiet kind you feel when things align.',
  },
  {
    id: 'morning-resolve',
    name: 'Morning Resolve',
    centroid: [6.5, 5.0, 6.5, 7.0, 7.5],
    // Coral-red → Hot pink → Amber — sunrise with energy
    colors: ['#FF4433','#FF0066','#FF7722','#FF0044','#FF5500','#FF3399','#FF6600','#FF00BB'],
    staticColor: '#FF4433',
    taglines: [
      'Facing what needs to be faced',
      'The first light before it gets complicated',
      'Quietly sure of your next step',
      'Something steady under the surface',
      'Not loud — just moving forward',
    ],
    intensity: 'warm',
    insight: 'Vivid coral and hot pink reflect a certain kind of clarity — the kind that comes just before you start. These colours carry the feeling of early readiness.',
  },
  {
    id: 'purposeful-drive',
    name: 'Purposeful Drive',
    centroid: [8.0, 5.5, 8.5, 6.5, 9.0],
    // Electric cyan → Deep blue → Vivid blue
    colors: ['#00DDFF','#0055EE','#00FFEE','#0033CC','#00BBDD','#0077FF','#00EEDD','#0044DD'],
    staticColor: '#0055EE',
    taglines: [
      'Moving with intention today',
      'The deep end of focus',
      'Knowing where you are going',
      'Teal is the colour of things that get done',
      'Quiet determination runs deep',
    ],
    intensity: 'cool',
    insight: 'Electric cyan and deep ocean blue carry the weight of purpose. These hues sit at the intersection of clarity and drive — cool enough to think straight, bold enough to act.',
  },

  // ── CALM / PEACEFUL ─────────────────────────────────────────────────────────
  {
    id: 'forest-floor-peace',
    name: 'Forest Floor Peace',
    centroid: [4.5, 5.0, 4.0, 7.5, 7.0],
    // Vivid green → Electric lime → Yellow-green
    colors: ['#00EE44','#88DD00','#00FF55','#AAEE00','#00CC33','#99CC00','#00FF44','#77BB00'],
    staticColor: '#00EE44',
    taglines: [
      'Roots deep, breathing slow',
      'The kind of quiet that means something',
      'Grounded in the way trees are grounded',
      'Not far — just exactly here',
      'Still water, mossy stone, enough',
    ],
    intensity: 'calm',
    insight: 'Vivid greens and electric limes carry the feeling of being grounded — not flat or stuck, but rooted like something living.',
  },
  {
    id: 'deep-night-calm',
    name: 'Deep Night Calm',
    centroid: [3.0, 2.5, 4.0, 7.0, 6.0],
    // Deep indigo → Electric violet → Royal blue
    colors: ['#5500FF','#2200DD','#7700FF','#0033BB','#6600EE','#3311CC','#8800FF','#0044CC'],
    staticColor: '#5500FF',
    taglines: [
      'When the world goes quiet and thoughts go deep',
      'Still and vast as the night sky',
      'The kind of alone that feels like rest',
      'Dark but not heavy — settled',
      'Everything slows down here',
    ],
    intensity: 'muted',
    insight: 'Deep indigo and electric violet hold a particular kind of peace — the peace of being awake when everything else is still.',
  },
  {
    id: 'tender-low-key',
    name: 'Tender and Low Key',
    centroid: [3.5, 7.5, 4.0, 7.0, 6.0],
    // Vivid mint → Sky blue → Teal
    colors: ['#00CC77','#0088EE','#00EE99','#00AAFF','#00BB66','#0099DD','#00FF88','#0077CC'],
    staticColor: '#00CC77',
    taglines: [
      'Soft around the edges today',
      'Close to people, far from effort',
      'Resting in the warmth of small things',
      'Gentle like a good afternoon',
      'Not much required — and that is okay',
    ],
    intensity: 'calm',
    insight: 'Vivid mint and sky blue hold the feeling of being cared for without needing to perform. These colours are low-key in the best way.',
  },
  {
    id: 'healing-quiet',
    name: 'Healing Quiet',
    centroid: [4.0, 5.5, 3.5, 6.5, 6.5],
    // Vivid rose → Electric violet → Teal accent
    colors: ['#FF0077','#9900FF','#FF0055','#7700EE','#FF0088','#00DDAA','#EE0066','#8800FF'],
    staticColor: '#FF0077',
    taglines: [
      'Something is mending that you cannot see',
      'Soft like the day after something hard',
      'Colours of a slow return',
      'Quiet has a texture today — gentle',
      'Letting things settle without rushing them',
    ],
    intensity: 'calm',
    insight: 'Vivid rose and electric violet together carry the feeling of recovery — not dramatic healing, but the slow kind that happens when you give yourself space.',
  },
  {
    id: 'sunday-afternoon-ease',
    name: 'Sunday Afternoon Ease',
    centroid: [4.0, 6.0, 4.0, 7.5, 6.0],
    // Electric purple → Vivid rose → Sky blue
    colors: ['#BB00FF','#FF0066','#9900EE','#0099FF','#CC00FF','#FF0044','#AA00DD','#0088EE'],
    staticColor: '#BB00FF',
    taglines: [
      'The hours that belong to you',
      'Slow and soft and not going anywhere',
      'Lavender is the colour of unbothered',
      'No agenda — just an afternoon',
      'Time moving at the pace you need',
    ],
    intensity: 'calm',
    insight: 'Vivid purple and electric rose are the colours of an unhurried afternoon — when nothing is urgent and the light comes in sideways.',
  },

  // ── INTROSPECTIVE / MELANCHOLIC ─────────────────────────────────────────────
  {
    id: 'quiet-inner-distance',
    name: 'Quiet Inner Distance',
    centroid: [3.0, 3.0, 5.0, 3.0, 4.0],
    // Deep blue → Violet → Blue-indigo
    colors: ['#0044CC','#4400EE','#0066DD','#5500FF','#0033BB','#3300DD','#0055EE','#6600EE'],
    staticColor: '#0044CC',
    taglines: [
      'Something stays just out of reach',
      'Wrapped softly in your own quiet',
      'The room feels a little smaller tonight',
      'Watching from the edge of your own mood',
      'Blue is the colour of things left unsaid',
    ],
    intensity: 'muted',
    insight: 'These deep blues and indigos mirror the feeling of being slightly apart from everything — present but not quite reachable.',
  },
  {
    id: 'missing-someone',
    name: 'Missing Someone Softly',
    centroid: [4.0, 7.0, 4.0, 4.5, 5.0],
    // Deep violet → Magenta → Electric blue
    colors: ['#8800FF','#FF00AA','#6600EE','#0033FF','#AA00FF','#EE00BB','#7700DD','#0055EE'],
    staticColor: '#8800FF',
    taglines: [
      'The space where someone used to be',
      'Longing wrapped in something warm',
      'Half here, half somewhere else',
      'Missing without bitterness — just missing',
      'Violet is the colour of tender absence',
    ],
    intensity: 'calm',
    insight: 'Vivid violet and electric magenta carry a particular kind of longing — tender rather than sharp, the colour of someone on the edge of your thoughts.',
  },
  {
    id: 'bittersweet-still',
    name: 'Bittersweet and Still',
    centroid: [4.0, 5.5, 5.0, 4.5, 5.0],
    // Vivid rose-red → Electric purple → Gold
    colors: ['#FF0044','#9900FF','#FF2266','#6600EE','#FF0033','#FFD700','#EE0055','#7700FF'],
    staticColor: '#FF0044',
    taglines: [
      'Missing something you cannot name',
      'A soft ache sitting in the quiet',
      'Colours blending gently at the edges',
      'The smell of something you used to know',
      'Half the lights on, half the lights off',
    ],
    intensity: 'calm',
    insight: 'Vivid rose and electric purple are the colours of feeling two things at once — the warmth of what was, and the ache of what isn\'t.',
  },
  {
    id: 'nostalgic-haze',
    name: 'Nostalgic Haze',
    centroid: [3.5, 5.0, 4.0, 4.5, 4.5],
    // Deep amber → Magenta → Warm orange
    colors: ['#FF8800','#FF0088','#FFAA00','#EE0077','#FF7700','#FF0066','#FFB800','#DD0055'],
    staticColor: '#FF8800',
    taglines: [
      'Faded gold and old photographs',
      'The feeling of a summer you cannot get back',
      'Warm at the edges, soft in the middle',
      'Memory has this colour everywhere',
      'Sepia is just the past still glowing',
    ],
    intensity: 'muted',
    insight: 'Deep amber and vivid magenta are the colours of memory — the warmth of what was, contrasted against the ache of distance.',
  },
  {
    id: 'introspective-blue',
    name: 'Introspective Blue',
    centroid: [3.0, 3.5, 6.0, 5.5, 5.5],
    // Electric blue → Deep indigo — all vivid
    colors: ['#0055FF','#5500EE','#0033EE','#4400DD','#0044CC','#3300CC','#0066FF','#6600FF'],
    staticColor: '#0055FF',
    taglines: [
      'Going somewhere deep and quiet inside',
      'The kind of thinking that takes all day',
      'Steel blue — clear and heavy at once',
      'Not avoiding — exploring',
      'The mind in its own company',
    ],
    intensity: 'cool',
    insight: 'Electric blues and indigos carry the weight of genuine introspection — not worry, but depth.',
  },

  // ── LOW / HEAVY ──────────────────────────────────────────────────────────────
  {
    id: 'heavy-far-away',
    name: 'Heavy and Far Away',
    centroid: [2.0, 2.0, 3.0, 2.0, 2.0],
    // Dark indigo → Deep teal — vivid but deep
    colors: ['#2200AA','#003388','#3300CC','#004499','#2200BB','#005577','#330099','#003366'],
    staticColor: '#2200AA',
    taglines: [
      'The weight settles in uninvited',
      'Everything feels further than it is',
      'A darkness that asks to be sat with',
      'Even the light feels heavier today',
      'Something needs to rest — maybe you',
    ],
    intensity: 'muted',
    insight: 'Deep indigo and navy hold the particular heaviness of a day when everything costs more than it should.',
  },
  {
    id: 'gently-drifting',
    name: 'Gently Drifting Along',
    centroid: [5.0, 5.0, 4.5, 5.5, 5.0],
    // Electric cyan → Sky blue — flowing
    colors: ['#00EEFF','#0066EE','#00DDDD','#0055DD','#00CCEE','#0077FF','#00BBCC','#0044CC'],
    staticColor: '#00EEFF',
    taglines: [
      'Not quite here, not quite there',
      'The afternoon light on still water',
      'Unhurried and lightly present',
      'Going with it — for now',
      'Teal and calm and neither here nor rushing',
    ],
    intensity: 'cool',
    insight: 'Electric cyan and flowing blues are the colours of a mood that isn\'t anchored anywhere — present but not committed, moving without urgency.',
  },

  // ── HIGH MENTAL / COMPLEX ────────────────────────────────────────────────────
  {
    id: 'sharp-buzzing',
    name: 'Sharp and Buzzing',
    centroid: [7.0, 3.0, 8.5, 3.0, 6.0],
    // Electric cyan ↔ Electric yellow — maximum complementary contrast
    colors: ['#00FFEE','#FFEE00','#00EEDD','#FFCC00','#00FFCC','#FFD700','#00DDCC','#FFB800'],
    staticColor: '#00FFEE',
    taglines: [
      'Too much going on inside right now',
      'The mind runs ahead of the body',
      'Restless like water before it boils',
      'Electric — in every sense',
      'Sharp-edged and wide awake',
    ],
    intensity: 'vibrant',
    insight: 'The extreme contrast between electric cyan and electric yellow reflects a mind running faster than the rest of you can keep up.',
  },
  {
    id: 'creative-fire',
    name: 'Creative Fire',
    centroid: [6.0, 3.0, 9.0, 6.0, 7.5],
    // Electric purple → Cyan → Magenta — triadic
    colors: ['#BB00FF','#00FFDD','#FF00AA','#8800EE','#00DDFF','#FF0088','#CC00FF','#00CCFF'],
    staticColor: '#BB00FF',
    taglines: [
      'The deep purple of ideas burning clean',
      'Something is building inside right now',
      'Electric and making something from it',
      'The kind of focus that closes out the world',
      'In the middle of your own frequency',
    ],
    intensity: 'vibrant',
    insight: 'Electric purple, cyan, and magenta together carry the feeling of creative intensity — when ideas feel urgent and the outside world becomes irrelevant.',
  },
  {
    id: 'anxious-edge',
    name: 'Anxious Edge',
    centroid: [6.0, 3.0, 8.0, 2.5, 4.0],
    // Electric lime ↔ Deep magenta — harsh contrast
    colors: ['#99FF00','#FF0088','#BBEE00','#EE0077','#AAFF00','#FF0066','#88EE00','#DD0055'],
    staticColor: '#99FF00',
    taglines: [
      'Too fast and cannot find the brake',
      'The mind in conflict with itself',
      'Something is winding tighter',
      'Sharp and unsettled and trying to hold on',
      'High contrast inside — just like out',
    ],
    intensity: 'vibrant',
    insight: 'The tension between electric lime and hot magenta reflects an inner conflict — high energy without clear direction.',
  },
  {
    id: 'restless-ember',
    name: 'Restless Ember Energy',
    centroid: [7.5, 3.0, 7.5, 3.5, 5.0],
    // Fire red-orange → Electric gold — same warmth but wide spread
    colors: ['#FF2200','#FFD700','#FF4400','#FFBB00','#EE1100','#FFA800','#FF3300','#FFE000'],
    staticColor: '#FF2200',
    taglines: [
      'Moving fast to outrun the thinking',
      'Burning with nowhere particular to go',
      'The fire that cannot quite settle',
      'Rust and heat and unresolved',
      'Energy looking for something to build',
    ],
    intensity: 'warm',
    insight: 'Fire red and electric gold carry the feeling of energy that has nowhere to land — the heat of someone who wants to do something but hasn\'t found the right thing yet.',
  },
  {
    id: 'scattered-energy',
    name: 'Scattered Energy',
    centroid: [7.0, 2.5, 7.0, 3.0, 3.5],
    // Pure red ↔ Electric blue ↔ Yellow — maximum triadic contrast
    colors: ['#FF0000','#0055FF','#FFE000','#EE0000','#0044EE','#FFCC00','#FF1100','#0066FF'],
    staticColor: '#FF0000',
    taglines: [
      'Everything at once and none of it clearly',
      'The colours that do not agree with each other',
      'High energy, low landing',
      'Pulled in too many directions',
      'Something needs to be switched off',
    ],
    intensity: 'vibrant',
    insight: 'Red, electric blue, and yellow in tension reflect a state of genuine scatter — plenty of energy, no clear channel for it.',
  },

  // ── SOCIAL / WARM ────────────────────────────────────────────────────────────
  {
    id: 'social-warmth',
    name: 'Social Warmth',
    centroid: [5.5, 8.5, 4.5, 7.5, 6.5],
    // Hot coral → Warm orange — vivid warmth
    colors: ['#FF0055','#FF7700','#FF0077','#FF8800','#EE0044','#FF6600','#FF0066','#FF9900'],
    staticColor: '#FF0055',
    taglines: [
      'Warmth that comes from being with people',
      'The colour of a good conversation',
      'Open — specifically toward other people',
      'Coral like connection, like care',
      'Full of the people you love',
    ],
    intensity: 'warm',
    insight: 'Hot coral and vivid orange reflect the specific glow of someone who is well-connected today — to their people, their warmth, their care.',
  },
  {
    id: 'cozy-shelter',
    name: 'Cozy Shelter',
    centroid: [3.5, 7.5, 3.0, 7.5, 6.0],
    // Vivid amber → Warm red — fireplace palette
    colors: ['#FF8C00','#CC3300','#FFAA00','#BB2200','#FF9900','#DD4400','#FFB800','#EE5500'],
    staticColor: '#FF8C00',
    taglines: [
      'Warm inside, quiet outside',
      'The colour of something you did not want to leave',
      'Honey-amber and staying exactly here',
      'Protected and not alone',
      'Small world, complete world',
    ],
    intensity: 'warm',
    insight: 'Deep amber and fire red are the colours of shelter — the feeling of being in the right place with the right people.',
  },

  // ── NEUTRAL / BALANCED ───────────────────────────────────────────────────────
  {
    id: 'quietly-between',
    name: 'Quietly In Between',
    centroid: [5.0, 5.0, 5.0, 5.0, 5.0],
    // Teal-cyan → Deep purple — contrast within calm
    colors: ['#0099CC','#6600AA','#00AABB','#7700BB','#0088BB','#5500AA','#00BBCC','#8800CC'],
    staticColor: '#0099CC',
    taglines: [
      'Neither here nor pulling away',
      'A pause between two feelings',
      'The grey that is actually quite soft',
      'In the middle, which is a real place',
      'Still water — not stagnant, just still',
    ],
    intensity: 'calm',
    insight: 'Vivid teal-cyan and deep purple carry the feeling of being genuinely in between — not much of anything in particular, which is its own kind of state.',
  },
];
