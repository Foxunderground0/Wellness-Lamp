/**
 * Curated reference palettes used for smoothing LLM-generated palettes.
 * Each palette is 8 colours chosen for harmonic hue, good saturation variety,
 * and pleasing lightness distribution.
 */
export const BASELINE_PALETTES: string[][] = [
  // Warm Ember — orange, coral, amber
  ['#e87040','#f09060','#f8b080','#d05828','#e88050','#f0a870','#f8c898','#c84820'],
  // Ocean Teal — teal, cyan, seafoam
  ['#40a8b8','#58c0c8','#78d8d8','#289090','#50b8c8','#80d0d8','#a0e0e8','#306878'],
  // Rose Blush — pink, rose, mauve
  ['#d87898','#e898b0','#f0b0c0','#c06080','#e08898','#f0a8b8','#f8c8d0','#b85070'],
  // Violet Dream — purple, violet, lilac
  ['#7860b8','#9878c8','#b098d8','#6050a8','#8870c0','#b0a0d8','#c8b8e8','#584898'],
  // Forest Floor — green, sage, moss
  ['#487848','#609860','#78b878','#307030','#589058','#80b080','#a0c8a0','#285828'],
  // Cool Slate — blue-grey, steel, ice
  ['#688090','#8098b0','#98b0c8','#507080','#7890a8','#a0b8c8','#b8c8d8','#486078'],
  // Honey Gold — gold, amber, warm yellow
  ['#d89840','#e8b058','#f0c878','#c07828','#e0a048','#e8b868','#f0cc90','#b87020'],
  // Midnight — navy, indigo, deep blue
  ['#283868','#384880','#485898','#202858','#304070','#506090','#6878a8','#182048'],
  // Mint Fresh — mint green, teal, sage
  ['#58b890','#70c8a0','#88d8b0','#409870','#68b890','#88c8a8','#a8d8c0','#308868'],
  // Dusty Rose — muted rose, blush, warm mauve
  ['#c09090','#d0a8a8','#e0c0c0','#a87878','#c8a098','#d8b8b0','#e8c8c8','#906878'],
];

// Flattened pool of all 80 reference colours for per-colour nearest-neighbour lookup
export const ALL_REFERENCE_COLORS: string[] = BASELINE_PALETTES.flat();
