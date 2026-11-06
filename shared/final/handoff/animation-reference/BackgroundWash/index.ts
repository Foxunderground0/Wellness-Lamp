// Drop this folder in at src/animations/BackgroundWash, unchanged.
// Home renders <BackgroundWash opacity={HOME_WASH_OPACITY} shown={sceneIsSet} />: on 0.9 s after Set the scene (it bleeds in from the edges over 4.5 s), off on Undo or All off (3 s).
// The Library scene view renders SceneWash: always on, cross-fades between scenes over 1.2 s, `lit` after Set the scene (0.40 -> 0.50).
// The Remote has no wash.
//
// "Wash" = the soft, slowly moving coloured background behind Home after a scene is set, and behind the Library scene view.
// FINAL calls it the crochet form (MOTION.md, check G). "Halo" is a different thing: the glow drawn around the orb itself (Orb/).

export { BackgroundWash, HOME_WASH_OPACITY, type BackgroundWashProps } from './BackgroundWash';
export { SceneWash, type SceneWashProps } from './SceneWash';
