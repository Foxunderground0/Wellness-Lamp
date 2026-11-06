// Drop this folder in at src/animations/SceneSwipe, unchanged, next to Orb/ and colour.ts.
// The Library's scene view renders it above the scene's text. The screen owns the text and the wash:
//   - the text below fades out and refills in onSwap (45 % of the slide), then fades in (FINAL: opacity .22 s)
//   - the wash cross-fades between the scenes' colours over 1.2 s (see BackgroundWash/SceneWash)
//   - Set the scene calls the orb's bloom for the CURRENT scene's orb: give that scene `on: true` once it is set.
// No Sink in the scene view (MOTION.md, check C): the orbs here are not pressable.

export { SceneSwipe, type SceneSwipeHandle, type SceneSwipeProps, type SwipeScene } from './SceneSwipe';
