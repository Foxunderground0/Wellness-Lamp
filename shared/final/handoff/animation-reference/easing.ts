// easing.ts: the easing curves the motion spec names (MOTION.md, Easing), as Reanimated worklets.
// Status: production-ready. FINAL defines the same functions in JS; values are identical.

/** easeSoft: sine(x^0.75). Starts from rest, no jump, lands softly. Used for every "grow" in the orb. */
export const easeSoft = (x: number) => {
  'worklet';
  const c = Math.max(0, Math.min(1, x));
  return (1 - Math.cos(Math.PI * Math.pow(c, 0.75))) / 2;
};

/** sine (sineInOut in FINAL): (1 - cos(pi x)) / 2. Used for every "settle" in the orb. */
export const sineIO = (x: number) => {
  'worklet';
  const c = Math.max(0, Math.min(1, x));
  return (1 - Math.cos(Math.PI * c)) / 2;
};

/** expo out: 1 - 2^(-10x). */
export const expoOut = (x: number) => {
  'worklet';
  return x >= 1 ? 1 : 1 - Math.pow(2, -10 * Math.max(0, x));
};

/** The wash bleeding in: 1 - (1 - x)^3.2 over 4.5 s. */
export const bleedIn = (x: number) => {
  'worklet';
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3.2);
};

/** The wash receding: quadratic ease-in-out over 3.0 s. */
export const bleedOut = (x: number) => {
  'worklet';
  const c = Math.max(0, Math.min(1, x));
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
};
