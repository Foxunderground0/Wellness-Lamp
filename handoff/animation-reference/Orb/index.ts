// Drop this folder in at src/animations/Orb, unchanged, next to colour.ts and easing.ts.
// Home, the check-in, the scene view and the Remote all render this one component.
// A screen owns the scene and calls the timelines. The orb does not.

export { Orb, type OrbHandle, type OrbProps } from './Orb';

// Home, when Set the scene is tapped:
//   orb.current.bloom()
//   0.9 s later, set the wash's `shown`   (0.2 s with Remove animations)
//   1.5 s later, show Home's own controls
//   3 s later, show "Sent to your room · Undo" for 5 s
// Undo calls orb.current.undo() and sets the wash's `shown` to false in the same tap.
// See my mood calls orb.current.longExposure(sceneColours, showResult)  ("Reading your answers…", screen C-4 in FINAL_screens.html).
// Haptics are optional and belong to the screen, not the orb: FINAL buzzes 8 ms on pressing Home's orb and 28 ms on
// Set the scene (MOTION.md section 11). If added: Vibration.vibrate(ms) from the screen, VIBRATE permission in AndroidManifest.xml.
// Pressing Home's orb only sinks it (pass `pressable`). It never sets the scene: the Set the scene button does.
// The Remote never calls these. It only passes size 100 (FINAL draws it at 100, inside the 196 brightness ring),
// colours, walk (= Cycle on), speed and opacity (= brightness; Light off = PEARL at 0.92).
