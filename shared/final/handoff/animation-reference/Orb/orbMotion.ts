// orbMotion.ts: the orb's timelines (MOTION.md, checks C, D, E and I), on Reanimated.
// The numbers are FINAL's. Call these from the JS thread; they write shared values.
// Status: production-ready (MOTION.md, The orb).

import { cancelAnimation, runOnJS, withDelay, withSequence, withTiming, type SharedValue } from 'react-native-reanimated';
import { easeSoft, sineIO } from '../easing';
import { REST } from './orbShader';

export type OrbMotion = {
  scale: SharedValue<number>;
  fxP: SharedValue<number>; // effect strength, 0..1; rest is REST (0.35)
  rm: SharedValue<number>; // 0 = Light leak (the bloom), 1 = Corona (the rest)
  str: SharedValue<number>; // rim strands
  swirl: SharedValue<number>; // inner swirl; also spins the field
  prog: SharedValue<number>; // Long exposure, 0..1 (one curve for all 8 colours)
  sw: SharedValue<number>; // 1 while Long exposure blends pearl into the scene
  mix: SharedValue<number>; // Remove-animations blend, 0..1; -1 when it isn't running
};

const all = (m: OrbMotion) => [m.scale, m.fxP, m.rm, m.str, m.swirl, m.prog, m.sw, m.mix];

/** Drop anything still running, so a new tap starts clean (FINAL's tween() replaces by key). */
function stop(m: OrbMotion) {
  all(m).forEach(cancelAnimation);
}

/** Where the orb sits with nothing playing. on = after Set the scene: 1.10x, Corona at rest. */
export function rest(m: OrbMotion, on: boolean) {
  stop(m);
  m.scale.value = on ? 1.1 : 1;
  m.fxP.value = on ? REST : 0;
  m.rm.value = on ? 1 : 0;
  m.str.value = 0;
  m.swirl.value = 0;
  m.sw.value = 0;
  m.prog.value = 1;
  m.mix.value = -1;
}

/** Light bloom (MOTION.md, check E). Remove animations: jump straight to the rested size. */
export function bloom(m: OrbMotion, reduce: boolean) {
  stop(m);
  m.sw.value = 0;
  m.mix.value = -1;
  if (reduce) {
    rest(m, true);
    return;
  }
  m.rm.value = 0;
  m.scale.value = withSequence(
    withTiming(1.12, { duration: 950, easing: easeSoft }),
    withTiming(1.1, { duration: 1100, easing: sineIO }),
  );
  m.fxP.value = withSequence(
    withTiming(1, { duration: 700, easing: easeSoft }),
    withTiming(REST, { duration: 2000, easing: sineIO }),
  );
  m.rm.value = withDelay(700, withTiming(1, { duration: 2200, easing: sineIO }));
  m.str.value = withSequence(
    withTiming(1, { duration: 900, easing: easeSoft }),
    withDelay(1100, withTiming(0, { duration: 2600, easing: sineIO })),
  );
  m.swirl.value = withSequence(
    withTiming(1, { duration: 800, easing: easeSoft }),
    withTiming(0.15, { duration: 4000, easing: sineIO }),
  );
}

/** Undo (MOTION.md, check E): size and effect over 0.7 s, strands and swirl over 0.3 s. Remove animations: instant. */
export function undo(m: OrbMotion, reduce = false) {
  stop(m);
  if (reduce) {
    rest(m, false); // Remove animations: straight back to the plain orb
    return;
  }
  m.scale.value = withTiming(1, { duration: 700, easing: sineIO });
  m.fxP.value = withTiming(0, { duration: 700, easing: sineIO });
  m.str.value = withTiming(0, { duration: 300, easing: sineIO });
  m.swirl.value = withTiming(0, { duration: 300, easing: sineIO });
  m.sw.value = 0;
  m.mix.value = -1;
}

/**
 * Long exposure (MOTION.md, check D), from the pearl palette into `scene`.
 * Normal: 3.7 s, then onDone after the 0.45 s text lag (4.15 s).
 * Remove animations: a plain 1.2 s blend, onDone straight after.
 * Returns a cancel function.
 */
export function longExposure(m: OrbMotion, reduce: boolean, onDone?: () => void): () => void {
  stop(m);
  m.scale.value = 1;
  m.fxP.value = 0;
  m.rm.value = 0;
  const done = () => {
    m.sw.value = 0;
    m.mix.value = -1;
    m.str.value = 0;
    m.swirl.value = 0;
    onDone?.();
  };
  if (reduce) {
    m.sw.value = 0;
    m.prog.value = 1;
    m.mix.value = 0;
    m.mix.value = withDelay(150, withTiming(1, { duration: 900 }, finished => {
      if (finished) runOnJS(done)();
    }));
    return () => cancelAnimation(m.mix);
  }
  m.mix.value = -1;
  m.str.value = 0;
  m.swirl.value = 0;
  m.sw.value = 1;
  m.prog.value = 0;
  m.prog.value = withDelay(750, withTiming(1, { duration: 2850, easing: easeSoft }));
  m.str.value = withDelay(600, withSequence(
    withTiming(0.9, { duration: 900, easing: easeSoft }),
    withDelay(900, withTiming(0, { duration: 1100, easing: sineIO })),
  ));
  m.swirl.value = withDelay(600, withSequence(
    withTiming(1, { duration: 900, easing: easeSoft }),
    withDelay(900, withTiming(0, { duration: 1100, easing: sineIO })),
  ));
  const timer = setTimeout(done, 4150);
  return () => {
    clearTimeout(timer);
    cancelAnimation(m.prog);
    cancelAnimation(m.str);
    cancelAnimation(m.swirl);
  };
}
