# MOTION.md: every animation, the orb and the wash

Wellness Lamp v1 · the developer handoff for motion · status: **ready to build against; the ten checks in section 2 are the acceptance test**

> **Read this first**
> - This file is **the** motion spec: every timing, curve and size the app needs is here or in `design-system/tokens.json` (group `motion`). It also says **where each animation shows up in the app**, **which file plays it**, and **how to check it**.
> - The **look** is `prototype/FINAL_prototype.html` (live) and `prototype/FINAL_screens.html` (every state, with IDs like H-2). FINAL and this file agree everywhere: build what FINAL does.
> - The **code** is in `animation-reference/`. It is real React Native (Skia + Reanimated) and was run on an Android phone. Copy it into `src/animations/` (section 9).
> - **Test it** with the Motion lab (section 10): ten pages, A to J, one per check in section 2.

---

## 1. For AI agents and developers: how to use this file

Rules that apply to every animation task:

1. **One component per thing, and screens only call it.** The orb is `<Orb>`, the Home wash is `<BackgroundWash>`, the Library scene view's wash is `<SceneWash>`, the sliding strip is `<SceneSwipe>`, the Light screen's wheel is `<ColourOrb>`. A screen owns the scene, the text, the buttons and the **timers** (0.9 s, 1.5 s, 3 s, 5 s). A component never decides when to start; it plays what it is told. Do not copy the shader or the timelines into a screen.
2. **Do not re-tune numbers.** Every duration, curve and size in the code is FINAL's. If something looks wrong, check it against FINAL before changing it, and say which FINAL screen you compared with.
3. **Names mean states.** "Pearl", "Light leak" and "Corona" are not decoration. Section 3 maps each word to the screens and states where you see it. Use those exact words in code comments and PR text.
4. **Remove animations.** Every component takes `reduceMotion` and, when it is not passed, follows Android's setting through `useReducedMotion()`. Behaviour per animation is in the tables. Never add an animation that has no reduced-motion rule.
5. **Pressing the orb never sets a scene.** The orb has no `onPress`. Only the **Set the scene** button sends anything to the lamp. (Home's orb sinks when pressed, nothing more.)
6. **Do not mix roles in a per-orb opacity.** In `SceneSwipe` every orb owns its own opacity and the strip only tells it to fade or jump. This is what stopped the white flash on landing (section 5, check H). Keep it that way.
7. **Touches.** The orb's canvas is bigger than the orb (size / 0.46) and overlaps its neighbours, so it must never take touches (`pointerEvents="none"`). Do not remove that. Without it the buttons above or below an orb stop responding.
8. **Do not edit the lab to make it pass.** The lab is the test. If a page's "What to check" fails, fix the component.

Where things are:

| I need to... | Go to |
|---|---|
| Know what a word like Corona or Light leak means | Section 3 |
| Build or test one animation (Pearl, Sink, Finding, Sending, Remote, Wash, Sliding orb, Resting, Colour picker) | Section 2 (the table), then its subsection in section 5 |
| Wire a screen to a component (which prop, which call, which timer) | Section 4 |
| See every other UI animation (switch, message bar, fades, knob) | Section 6 |
| Know what Remove animations does | Section 7 |
| Find durations, curves and sizes as tokens | Section 8 and `design-system/tokens.json` |
| Know what each file in `animation-reference/` is | Section 9 |
| Run the test screen on a phone | Section 10 |
| Add the optional haptics, or compare Set the scene across tabs | Section 11 |

---

## 2. The ten checks (the acceptance test)

Each row is one thing to check on a phone, with the lab page that plays it, the FINAL screens to compare with, and the code that does it. **In all ten, the halo (the soft glow around the orb) and the wash must match FINAL**, not only the orb.

Links go to `prototype/FINAL_screens.html#ID` (as in `SCREENS_AND_FLOWS.md`).

| Check | What it is | Lab page | Compare with in FINAL_screens | Code |
|---|---|---|---|---|
| **A. Pearl** | The pale palette before any check-in; also the Remote with Light off. Home's pearl orb sinks when pressed. | `PearlPage` | [H-1](prototype/FINAL_screens.html#H-1), [C-1](prototype/FINAL_screens.html#C-1), [R-1](prototype/FINAL_screens.html#R-1) | `<Orb colours={PEARL}>` |
| **B. Palettes and new palettes** | All 33 palettes as orbs; orbs made from **newly generated** palettes (the Light screen's wheel) are clean, not muddy. | `PalettesPage` | [L-1](prototype/FINAL_screens.html#L-1), [C-5](prototype/FINAL_screens.html#C-5), [R-4](prototype/FINAL_screens.html#R-4) | `<Orb colours={eight}>`, `palettes.ts` (test only) |
| **C. Press (Sink)** | Pressing Home's orb: it sinks and sharpens. **It does not send to the lamp.** Home only: not the scene view, not the Remote. | `PressPage` (also A and I) | [H-1](prototype/FINAL_screens.html#H-1), [H-2](prototype/FINAL_screens.html#H-2) | `<Orb pressable>` |
| **D. Finding your palette** | "Reading your answers…" after a check-in: the pearl develops into the mood's colours (Long exposure). | `FindingPage` | [C-3](prototype/FINAL_screens.html#C-3), [C-4](prototype/FINAL_screens.html#C-4), [C-5](prototype/FINAL_screens.html#C-5) | `orb.longExposure(colours, onDone)` |
| **E. Sending to the lamp** | Set the scene on Home: bloom, wash, Home's controls, the message bar, Undo, All off. | `SendingPage` | [H-2](prototype/FINAL_screens.html#H-2), [X-1c](prototype/FINAL_screens.html#X-1c), [H-6](prototype/FINAL_screens.html#H-6) | `orb.bloom()`, `<BackgroundWash shown>` |
| **F. Remote: brightness, speed, Cycle** | The orb in the brightness ring: its brightness, the Cycle on/off behaviour, the speed slider, Light off. | `RemotePage` | [R-3](prototype/FINAL_screens.html#R-3), [R-3c](prototype/FINAL_screens.html#R-3c), [R-3d](prototype/FINAL_screens.html#R-3d), [R-1](prototype/FINAL_screens.html#R-1) | `<Orb size={100} walk speed opacity>` |
| **G. Wash** | Home's wash (bleeds in from the **outer edges**, recedes) and the scene view's wash (always on, cross-fades, brightens). | `WashPage` | [H-2](prototype/FINAL_screens.html#H-2), [H-6](prototype/FINAL_screens.html#H-6), [L-12](prototype/FINAL_screens.html#L-12) | `<BackgroundWash>`, `<SceneWash>` |
| **H. Sliding orb in the scene view** | Swipe between scenes: the names and orbs move as one strip; no flash on landing. | `SwipePage` | [L-12](prototype/FINAL_screens.html#L-12), [L-11](prototype/FINAL_screens.html#L-11) | `<SceneSwipe>` |
| **I. Resting after the scene is set** | The 5 s settle after Set the scene and what "at rest" looks like: 1.10x with the Corona ring. Still moves; still sinks on Home. | `RestingPage` | [H-2](prototype/FINAL_screens.html#H-2), [L-11](prototype/FINAL_screens.html#L-11) | `orb.bloom()`, `orb.rest(true)` |
| **J. Colour picker orb** | The Light screen's round colour wheel. **Not an animation**: a still image with a soft halo; only the knob moves. Its pick makes the scene's 8 colours (app recipe, `DATA_AND_RULES.md` §3.6). | `ColourOrbPage` | [R-4](prototype/FINAL_screens.html#R-4) | `<ColourOrb onChange>` |

How an agent should use this table: pick the row, open the lab page named in it, read the "What to check" list at the bottom of that page (it is the acceptance test for the row), read the subsection in section 5, and make the lab page pass on a phone.

---

## 3. Orb vocabulary: what each word means, and where you see it

These words are used in code comments, in the lab and in this file. The orb has a few separate visual parts; each has one name.

| Word | What it is (what you see) | Where it shows (states and screens) | In the shader / code |
|---|---|---|---|
| **Orb** | The glass-like sphere of blended colour. Always the one component `<Orb>`. | Home [H-1](prototype/FINAL_screens.html#H-1) / [H-2](prototype/FINAL_screens.html#H-2) (176 dp), check-in cards [C-1](prototype/FINAL_screens.html#C-1) (136 dp), the Library scene view [L-12](prototype/FINAL_screens.html#L-12) (176 dp), the Remote [R-3](prototype/FINAL_screens.html#R-3) (100 dp), Library tiles are stills of it. | `Orb/Orb.tsx`, `orbShader.ts` (Globe 39) |
| **Pearl** | The pale default palette: peach, mint, lilac, aqua, in that lamp order (`PEARL` in `colour.ts`). The orb has no colours of its own yet. | Home before any check-in ([H-1](prototype/FINAL_screens.html#H-1), [H-5](prototype/FINAL_screens.html#H-5)); the **start** of Reading your answers ([C-4](prototype/FINAL_screens.html#C-4)); the check-in cards; the Remote with nothing on ([R-1](prototype/FINAL_screens.html#R-1)) and with Light off (pearl at 0.92 opacity). | `colours={PEARL}` (the default) |
| **Halo** | The soft, round glow around the orb's edge. It is **part of the same canvas** as the orb (that is why the canvas is size / 0.46, much bigger than the orb). It is tight and pale. It is **not** the wash. | Everywhere the orb is. It develops with the same curve as the orb's colours (never an old and a new ring at once). | Inside `ORB_SKSL` |
| **Wash** | The broad, soft coloured background behind the orb: ruffled lobes of the scene's colours on cream, moving very slowly. FINAL calls the form "crochet". It is **not** the halo. | Home after Set the scene ([H-2](prototype/FINAL_screens.html#H-2)); gone on All off ([H-6](prototype/FINAL_screens.html#H-6)); always on behind the Library scene view ([L-12](prototype/FINAL_screens.html#L-12)). The Remote has no wash. | `BackgroundWash/` |
| **Light bloom** | The animation that plays on the orb when a scene is **set**: it grows, glows, flares strands, then settles at rest. Sections 5E and 5I. | Home after Set the scene; the scene view after Set the scene ([L-12](prototype/FINAL_screens.html#L-12)). | `orb.bloom()`, `orbMotion.ts` |
| **Light leak** | The **first half** of the bloom: a calm glow around the orb plus thin strands that flare around the rim. Peaks at about 1 s and is gone by about 3 s. | The 3 s right after Set the scene, in H-2 and L-12. | `uLeak`, `uStr`; `rm` = 0 |
| **Corona** | The **resting** look of an orb that is **on now**: a thin bright ring just outside the edge, in the halo's own turning colours, and the orb 10 % bigger. The bloom hands over from Light leak to Corona. Strength at rest is 0.35. | Home after a scene is set ([H-2](prototype/FINAL_screens.html#H-2)); in the Library the scene that is on ([L-11](prototype/FINAL_screens.html#L-11), the scene view of that scene). Never on pearl, never on a plain orb. | `uRing`; `rm` = 1; `REST` = 0.35; `rest(on = true)` |
| **Strands** | Thin arcs that sweep around the rim for a moment. Part of Light leak and of Long exposure. | During the bloom and during Reading your answers. | `uStr` |
| **Swirl** | The slow movement of colour inside the orb; it speeds up in the bloom and Long exposure, then drops to a resting drift. | Same moments as Strands, then always (slowly). | `uSpin`, `swirl` |
| **Long exposure** | The "Reading your answers…" animation: the pearl develops into the mood's colours over 3.7 s, with strands and swirl. | [C-4](prototype/FINAL_screens.html#C-4) after See my mood. | `orb.longExposure(...)` |
| **Sink** | The press feel: the orb shrinks 4.5 % and its edge sharpens while a finger is on it. Home only. | Pressing Home's orb in H-1 (pearl) and in every state after a check-in or a set scene. | `pressable`; `pressIn` / `pressOut`; `uPress` |
| **Rest** | The state with nothing playing: `rest(false)` = plain orb at 1.0x; `rest(true)` = on now, 1.10x with Corona. | Plain: Home before Set; the scene view's other scenes. On now: H-2, L-11. | `orb.rest(on)` |
| **Cycle** | The Remote's colour walk: the orb moves through the scene's 8 colours (one every 6 s at the middle speed). Not a Home or scene-view word: there the orb always walks. | [R-3c](prototype/FINAL_screens.html#R-3c). | `walk`, `speed` |
| **Strip** | The row of scene names and orbs in the scene view that slides as one piece, 220 dp per scene. | [L-12](prototype/FINAL_screens.html#L-12). | `SceneSwipe` |
| **Colour wheel** / colour picker orb | The Light screen's round picker. Not the orb above. A still image, drawn once. | [R-4](prototype/FINAL_screens.html#R-4). | `ColourOrb/` |

Quick answers an agent will need:

- "Is the glow I see the halo or the wash?" The tight pale glow hugging the orb is the **halo** (inside the orb's canvas). The big soft background colour is the **wash** (its own component).
- "When does Light leak turn into Corona?" It is one continuous blend inside `bloom()`, from about 0.7 s to 2.9 s. You never switch between them by hand.
- "Which state shows Corona in the Library?" Only the scene that is on now. Other scenes' orbs are plain.

---

## 4. Wiring recipes: which screen calls what

The screens below only call component methods. Paste these patterns; keep the timers in the screen.

### Home ([H-1](prototype/FINAL_screens.html#H-1) to [H-6](prototype/FINAL_screens.html#H-6), [C-4](prototype/FINAL_screens.html#C-4), [C-5](prototype/FINAL_screens.html#C-5))

```tsx
const orb = useRef<OrbHandle>(null);
// Home's orb: 176 dp, pressable (Sink), colours = PEARL until a check-in, then the mood's 8.
<BackgroundWash width={w} height={h} colours={mood} opacity={HOME_WASH_OPACITY} shown={washOn} />
<Orb ref={orb} size={176} colours={shown} pressable />

// See my mood (C-3 -> C-4 -> C-5): the screen shows "Reading your answers…" (fade in 0.45 s), then
orb.current?.longExposure(moodColours, () => { setShown(moodColours); showResultText(); }); // onDone at 4.15 s

// Set the scene (C-5 -> H-2): as in the scene view, the button first says "Setting the scene…" (busy) for 0.6 s, then
orb.current?.bloom();                      // t = 0: also fade out the result buttons (0.45 s); the button gets its label back once hidden
later(() => setWashOn(true), 900);         // 0.9 s (0.2 s with Remove animations): the wash bleeds in
later(showHomeControls, 1500);             // 1.5 s: "Check in again", "Set at 21:42" + All
later(showMessageBar, 3000);               // 3 s: "Sent to your room · Undo", hide after 5 s
// Undo / Not now / All off
orb.current?.undo(); setWashOn(false);     // orb 0.7 s; wash recedes 3 s; result buttons back at 0.4 s
// A scene set from the Library or the Remote: orb.current?.rest(true) at once, then setWashOn(true)
```

### Library scene view ([L-12](prototype/FINAL_screens.html#L-12), [L-11](prototype/FINAL_screens.html#L-11))

```tsx
const strip = useRef<SceneSwipeHandle>(null);
<SceneWash width={w} height={h} colours={scenes[cur].colours} lit={cur === onNowIndex} />
<SceneSwipe ref={strip} scenes={scenes /* {id, name, colours, on} */}
  onChange={(i) => fadeTextOut(i)}   // slide started: the text fades out (0.22 s)
  onSwap={(i) => refillText(i)}      // 45 % into the slide: swap the line, sound, scent, fade back in
  onLand={(i) => {}} />
// Set the scene (scene view): the button says "Setting the scene…" for 0.6 s, then
strip.current?.bloom();  setLit(true);   // wash 0.40 -> 0.50 over 1.2 s; "On now" appears 1.5 s later; message bar 3 s later, for 5 s
// Undo: strip.current?.undo(); setLit(false);
```

No Sink in the scene view: the orbs there are not `pressable`.

### Remote ([R-1](prototype/FINAL_screens.html#R-1), [R-3](prototype/FINAL_screens.html#R-3), [R-3c](prototype/FINAL_screens.html#R-3c), [R-3d](prototype/FINAL_screens.html#R-3d))

```tsx
// The orb never gets bloom() / undo() here. Only these props:
const colours = !lightOn ? PEARL : cycleOn ? sceneEight : Array(8).fill(sceneEight[heldIndex]);
const speed   = cycleOn ? 0.2 + 2.8 * speedSlider : 1;            // speedSlider 0..1
const opacity = !lightOn ? 0.92 : 0.35 + 0.65 * brightness;       // brightness 0.05..1 (the ring)
<Orb size={100} colours={colours} walk={cycleOn} speed={speed} opacity={opacity} clockStart={random 0..20} />
```

The speed slider only exists while Cycle is on (it takes the Cycle label's place); dragging it changes the orb's colour walk **live**, without a jump.

### Light screen ([R-4](prototype/FINAL_screens.html#R-4))

```tsx
<ColourOrb onChange={(hex, lab) => setEight(fromPickedColour(hex))} />   // fromPickedColour: DATA_AND_RULES.md section 3.6
```

---

## 5. The ten checks in detail

Each subsection: what, where, how it plays, Remove animations, how to check, pitfalls. Numbers are dp or ms unless said.

### A. Pearl

- **What:** the orb in the pale default palette. Pearl colours, lamp order: `#E9D6BE #D3E2D1 #D9D8EE #CDE5E4 #EED8C9 #E7E2C4 #D4DEEC #E0D5E3`.
- **Where:** Home before a check-in ([H-1](prototype/FINAL_screens.html#H-1), 176 dp, **Sink on**); the check-in cards ([C-1](prototype/FINAL_screens.html#C-1), 136 dp, not pressable); the start of Reading your answers ([C-4](prototype/FINAL_screens.html#C-4)); the Remote with nothing on ([R-1](prototype/FINAL_screens.html#R-1)) and with Light off (pearl at **0.92** opacity, 100 dp, not dimmed, not grey).
- **Plays:** slow drift inside (the leading colour moves on about every 6 s). No ring, no flare, no pulse.
- **Remove animations:** completely still.
- **Check:** soft pastels, nothing grey or muddy; the halo is faint and pale and still visible on the cream ground; pressing the **Home** orb sinks it; the 136 and 100 dp ones do not.

### B. Palettes and new palettes

- **What:** the same orb for any palette. 33 palettes: the Library's 8 presets and the check-in's 25 mood palettes (all in `lab/palettes.data.ts`). Four colours repeat to eight; one colour (Remote, Cycle off) fills all eight.
- **No-mud rule:** colours are blended in OKLab with chroma held, so a blend of two saturated colours stays clean and goes lighter, never grey or brown. Example: blue next to orange must give a clean blue-to-peach blend, not a brown middle. Pale or dark palettes (Deep Night, Storm Calm, Candy Dream) still read as light blending through colours.
- **New palettes:** the Light screen's wheel creates a new palette from any picked colour. The lab makes six random ones with each recipe, with a "colour richness" number (mean OKLab chroma; under about 0.05 will look grey). **The app recipe (DATA_AND_RULES.md §3.6) is the one to build**, including its step 6, the close colour: hue +45 degrees, saturation -5, lightness +2. The lab's `fromPickedColour` is exactly that recipe. (FINAL's own wheel uses a simpler approximation; the lab keeps it only for comparison.)
- **Measured (in the browser, random picks across the wheel):** orb chroma against palette chroma, mean 1.19, lowest 0.90, with one flagged, which was a palette that is already nearly grey. FINAL's wheel recipe: mean 1.14. The shipped palettes: mean 1.07. The app recipe gives somewhat more colourful orbs because of its +180 degrees contrast step: that is intended.
- **Check:** every preset and mood palette, then both batches of six new ones, then **Develop from pearl** on a few: no flash, no hard edges, no mud halfway.

### C. Press (Sink)

- **What:** pressing Home's orb. `scale = 1 - 0.045 * press`; `press` follows the finger at rate **14 per second** going in and **7 per second** coming out (exponential). The edge gets crisper and the halo slightly brighter (`uPress`).
- **Where:** Home's orb only, in every state: pearl ([H-1](prototype/FINAL_screens.html#H-1)), the result, and at rest after Set the scene ([H-2](prototype/FINAL_screens.html#H-2)). **Not** the check-in orb, **not** the scene view ([L-12](prototype/FINAL_screens.html#L-12): the orb there isn't a control), **not** the Remote.
- **Never starts anything.** Letting go does not bloom, set a scene, show a wash or a message. (Earlier versions sent the scene on press; that was removed.)
- **Hit area:** within 0.55 x the orb's size of its centre (a touch just outside the edge also counts).
- **Remove animations:** no size change.
- **Haptic (optional):** 8 ms on press, from the screen (section 11).
- **Pitfall:** on the 1.10x resting orb, Sink multiplies the resting scale, so it returns to 1.10, not 1.0.

### D. Finding your palette ("Reading your answers…", Long exposure)

- **What:** after See my mood the orb is the pearl and the 8 colours develop into the mood palette, with strands and swirl. One curve for all 8 colours (no left-to-right sweep); in each moment some swirls arrive earlier than others.
- **Where:** [C-3](prototype/FINAL_screens.html#C-3) (See my mood), [C-4](prototype/FINAL_screens.html#C-4) (Reading your answers), [C-5](prototype/FINAL_screens.html#C-5) (the result). Home's layout is back during C-4 (date, Me, tab bar).
- **Timeline (normal):**

| t | Event |
|---|---|
| 0 | "Reading your answers…" fades in (450 ms). The orb is the pearl. |
| 0.6 s | Strands and swirl begin to lift. |
| 0.75 to 3.6 s | All 8 colours develop together (`easeSoft`, 2850 ms). |
| 2.4 s | Strands and swirl have settled. |
| 3.7 s | The orb is fully the mood palette. |
| 4.15 s | `onDone`: 3.7 s plus a 450 ms pause. The status text fades out (450 ms) and the result fades in (450 ms). |

- **Remove animations:** a plain blend of about 1.2 s (150 ms delay, 900 ms in code), then `onDone` at once; text fades are instant, no 450 ms pause.
- **Rules:** set `colours` to the new palette **in `onDone`**, not before (the orb already shows it internally). The halo develops with the same curve.
- **Check:** pale (Healing Quiet) and dark (Deep Night Calm) moods are not muddy halfway; the "See my mood" button works; the timer reads about 4.2 s at the result.

### E. Sending to the lamp (Set the scene on Home)

- **What:** the sequence after the Set the scene button: Light bloom on the orb, the wash, Home's own controls, the message bar, Undo.
- **Where:** [C-5](prototype/FINAL_screens.html#C-5) becomes [H-2](prototype/FINAL_screens.html#H-2), with [X-1c](prototype/FINAL_screens.html#X-1c) (message bar) and [H-6](prototype/FINAL_screens.html#H-6) (All off).
- **Before it starts:** tapping Set the scene turns the button into "Setting the scene…" (busy look: DESIGN_SYSTEM's busy rule) for **0.6 s**, exactly as in the scene view. The scene is sent at the end of that wait, and t = 0 below is that moment (0.6 s after the tap).
- **Timeline:**

| t | Event | Owner |
|---|---|---|
| 0 | Result buttons fade out (450 ms), the busy button with them; it gets its label back once hidden. The bloom starts. (Optional haptic 28 ms.) | screen + `orb.bloom()` |
| 0 to 0.95 s | Orb grows to **1.12x** (`easeSoft`), then eases to **1.10x** by about 2 s (`sine`). | Orb |
| 0 to 0.7 s | Effect strength rises to 1: **Light leak** (glow plus strands) at its peak at about 1 s. | Orb |
| 0.7 to 2.9 s | Light leak blends into **Corona**; strands fade out by about 3 s. | Orb |
| 0.9 s | The **wash bleeds in from the outer edges of the screen toward the middle**, over 4.5 s (0.2 s with Remove animations). Muted text darkens to `#4A443E`. | screen sets `shown` |
| 1.5 s | Home's controls fade in (450 ms): "Check in again", "Set at 21:42", the All switch. | screen |
| 3 s | Message bar "Sent to your room · Undo" in (250 ms), visible 5 s. | screen |
| about 5 s | The swirl has slowed to its resting drift. The orb is at rest: 1.10x with Corona. | Orb |

- **Undo** (message bar): orb returns to 1.0x over 0.7 s, effect over 0.7 s, strands and swirl over 0.3 s (`sine`); the wash **recedes slowly to the edges over 3 s** (it never vanishes at once); the message bar hides; result buttons are back at 0.4 s.
- **All off** ([H-6](prototype/FINAL_screens.html#H-6)): the wash recedes (3 s), bottom row reads "Off". All on bleeds it back in (4.5 s).
- **Set from Library or Remote:** Home's state shows at once with the orb already at 1.10x (`rest(true)`, no tween), then the wash bleeds in.
- **Remove animations:** the 0.6 s wait stays; then the orb jumps to 1.10x with Corona; the wash fades in over 800 ms starting at 0.2 s; controls and message bar are instant (same timings).
- **Check:** the bloom starts from the button, **not** from pressing the orb; Light leak and Corona look like FINAL's, not like a white outline; the halo is pale and tight, not coloured streaks; the wash starts at the screen's edges.

### F. Remote: brightness, speed, Cycle

- **What:** the orb inside the brightness ring on the Remote. Orb **100 dp** inside a **196 dp** ring.
- **Where:** [R-3](prototype/FINAL_screens.html#R-3) a scene playing; [R-3c](prototype/FINAL_screens.html#R-3c) Cycling; [R-3d](prototype/FINAL_screens.html#R-3d) dragging the brightness ring; [R-1](prototype/FINAL_screens.html#R-1) nothing playing (pearl).
- **Rules:**

| Control | Orb behaviour |
|---|---|
| **Brightness** (the ring, 5 to 100 %) | Orb opacity = `0.35 + 0.65 * brightness`. Eased over **0.4 s** (CSS `ease`) so it trails the finger. Dim is still clearly an orb. The halo dims with it. |
| **Cycle on** | The orb walks through all 8 scene colours: one every 6 s at the middle speed. |
| **Speed slider** (only while Cycle is on) | Speed = `0.2 + 2.8 * slider`, 0.2x (very slow) to 3x. The colour walk moves by the speed; the inner movement by its square root. **Changing the slider changes the walk live, with no jump.** |
| **Cycle off** | One colour held (the ringed dot of the 4 shown); orb is single-colour with its shading and halo. Tapping a dot changes it. The inner movement continues slowly. |
| **Light off** | Pearl orb at **0.92** opacity. Not grey, not dimmed. |

- **No bloom, no Undo, no wash, no Sink** on the Remote.
- **Remove animations:** completely still, no colour walk.
- **Check:** the ring and orb feel connected while dragging; the speed slider visibly changes how fast the colours move (the lab label says seconds per colour); the halo around the 100 dp orb looks like FINAL's: faint, round, inside the ring.

### G. Wash

- **What:** one slowly moving form of soft ruffled lobes in the scene's colours (the scene's colours 1, 3, 5, 7, or all 4) on cream, blurred 20. Drawn 6 % past every screen edge so the blur is not cut off. One shader, evaluated per pixel on the GPU.
- **Where:** Home after Set the scene (H-2), off on All off (H-6); behind the Library scene view (L-12); **never** on the Remote or the check-in.
- **Strength (layer opacity):**

| Use | Opacity | Note |
|---|---|---|
| **Home** | **0.46** (`HOME_WASH_OPACITY`) | A little more colour than the scene view at rest, still softer than the lit scene view. |
| Scene view, resting | 0.40 | |
| Scene view, after Set the scene (`lit`) | 0.50 | 1.2 s ease. Undo returns to 0.40. |

- **Home bleed (the shape of it):** the wash appears **from the outer edges toward the middle**. A mask clears an ellipse (72 % x 68 % of the box, centred 50 % / 46 %); the clear radius runs 1.15 to -0.45 on bleed-in, **4.5 s**, `1 - (1 - x)^3.2` (fast at first, then slowly settling). **Undo and All off recede it slowly**: the reverse, back out to the edges, over **3.0 s**, quadratic in-out. The wash never just disappears (only with Remove animations does it fade, over 800 ms). No hard edge: the mask ramp is soft.
- **Scene view:** always fully on when opened (no bleed). Changing scene cross-fades two wash layers over **1.2 s**, CSS ease-in-out `(.42, 0, .58, 1)`. The two layers use different seeds (0 and 1) so the two frames differ.
- **Always:** the form drifts (clock speed 1.6); you should see it breathe within a few seconds. Colours blend cleanly (no grey, no brown); dark palettes stay pastel and airy; muted text on the wash is `#4A443E` and the orb sits clearly on top.
- **Remove animations:** one still frame (no clock); Home fades in and out over 800 ms instead of bleeding; scene cross-fades are instant.
- **Check:** in the lab, press **Set the scene (bloom + wash)** on Home's page and watch it arrive from the edges; **Undo / All off** closes it to the edges; **Wash only** buttons play the bleed alone. Compare Home with the scene view for the same scene.

### H. Sliding orb in the scene view

- **What:** the scene names run along the top and the live orb sits under them; they move as **one strip**, 220 dp per scene. Swipe sideways, tap a neighbouring name, or call `go(+1 / -1)`.
- **Where:** [L-12](prototype/FINAL_screens.html#L-12) (scene view), [L-11](prototype/FINAL_screens.html#L-11) (the scene that is on arrives at 1.10x with Corona; the others at 1.0x).
- **Timings:**

| Thing | Value |
|---|---|
| Slide duration | `clamp(300, 520 - abs(velocity) * 160, 460)` ms (taps: 460) |
| Slide curve | `cubic-bezier(.2, .8, .2, 1)` |
| Swipe threshold | past 60 dp, or 14 dp with speed |
| Edge with no scene | resistance x0.3 |
| Snap-back (released short) | 300 ms, same curve |
| Text under the orb | fades out as the slide starts (220 ms), **refills at 45 % of the slide**, fades back in |
| Leaving orb | fades out over the first **60 %** of the slide, so nothing is left at the screen edge |
| Neighbour orbs while dragging | fade in 120 ms (ease-out); after a short drag they fade out over 450 ms (300 ms after release) |
| Current name | opacity .48 to 1, scale .78 to 1, 420 ms, same curve |
| Wash behind | cross-fades over 1.2 s |

- **Landing (no flashes):** FINAL keeps one live orb and paints stills of neighbours; the code keeps **one live `<Orb>` per scene, keyed by the scene's id**, so the orb that slides in is the same instance that ends up in the centre. On landing everything else (the leaving orb and the other neighbour) goes away **instantly, in the same commit**, and the centre orb is never touched. **Each orb owns its own opacity**; the strip only calls `fade` or `set` on it. Never choose an orb's opacity from its role (centre or neighbour): the role changes one frame after the strip lands, which flashes the new centre white and shows the new neighbours for a moment.
- **Neighbours exist only while dragging or sliding**, so at rest one orb runs.
- **No Sink** here.
- **Set the scene here:** "Setting the scene…" 0.6 s, then `strip.bloom()` and the wash brightens; "On now" 1.5 s later; message bar 3 s later, 5 s long.
- **Remove animations:** the strip jumps with no slide; the wash changes instantly.
- **Check:** swipe slowly and quickly, tap names, drag short and release, hit the first and last scene: the new centre orb never flashes white, and the orbs on either side never flash as they go.

### I. Resting after the scene is set

- **What:** the end state of Light bloom, and what "at rest" looks like: orb at **1.10x**, **Corona** (thin bright ring, strength 0.35, hairline, in the halo's own turning colours, edge crisp), slow drift. Never still (unless Remove animations), never pulsing.
- **Where:** Home after Set the scene ([H-2](prototype/FINAL_screens.html#H-2)); the scene that is on in the Library ([L-11](prototype/FINAL_screens.html#L-11)).
- **Timeline:** see section 5E (orb column). By about 3 s the Light leak has turned into Corona and the strands are gone; by about 5 s the swirl is at its resting drift.
- **Sink still works** on Home's resting orb.
- **Undo:** size and glow return over 0.7 s, strands and swirl over 0.3 s.
- **Remove animations:** jumps to 1.10x with the ring and does not move.
- **Check:** it must look like FINAL's H-2, not like a white outline; the lab page shows a plain and a rested orb side by side.

### J. Colour picker orb (not an animation)

- **What:** the round colour wheel on the Light screen ([R-4](prototype/FINAL_screens.html#R-4)). Round = hue; toward the centre = whiter. A **still** image with a soft pale halo and a slight shading from the upper left, no hard edge. Only the knob moves (26 dp, white 3 px border); it follows the finger, stays inside the wheel, and the colour under it is the colour picked.
- **Size:** 290 dp box; the wheel radius is 0.62 of half the box (`WHEEL_R`), an OKLab wheel (`wheelLab`).
- **What it makes:** a picked colour becomes the scene's 8 colours with the **app recipe** (`DATA_AND_RULES.md` §3.6; the lab has it as `fromPickedColour`). Colour range then smooths those 8 (not in the lab).
- **Check:** the same colours at the same angles as FINAL; a new palette from any spot gives a clean orb, especially pale spots near the centre and the dull yellow-green region.

---

## 6. Every other UI animation (live in FINAL)

These are small transitions, not the orb or the wash. Where a row says "reduced: none" the animation is removed under Remove animations. Everything not listed is instant.

**Global defaults:** a CSS transition with no curve is `ease` = `cubic-bezier(.25, .1, .25, 1)`. Sizes in dp. RN: use `withTiming` with `Easing.bezier`.

### Home

| Name | Trigger | Duration | Curve | What changes | Reduced |
|---|---|---|---|---|---|
| Switch thumb (All) | toggle | 200 | `(.65, 0, .35, 1)` | thumb 22 dp across and scale .667 to 1; colour 200 ease | none |
| Message bar in / out | show / hide | 250 | opacity `ease`; translate `(.16, 1, .3, 1)` | opacity 0 to 1, up from 8 dp | none |
| Group cross-fade (`.fade`) | any group shown / hidden: title, "Reading your answers…", result, set-state controls | 450 | `ease` | opacity; out and in at the same time | none |
| Set the scene button | press | 120 | `(.16, 1, .3, 1)` | scale .97 while pressed; opacity 450 ms | none |
| Answer knob glide | release on the check-in line | 180 | `(.16, 1, .3, 1)` | `left` snaps to the nearest step | none |
| Answer knob grow | dragging | 150 | `(.16, 1, .3, 1)` | scale 1.3 | none |
| Answer knob land | first tap on an empty line | 220 | `(.16, 1, .3, 1)` | scale .35 and opacity .2 to rest | none |
| Not now | tap | 450 | `ease` | result out, "Not set yet" in | instant |
| **Check-in question change** | Next, Skip, Back, Keep going ([C-1](prototype/FINAL_screens.html#C-1) to [C-3](prototype/FINAL_screens.html#C-3)) | 220 out, then 220 in | `ease` | The question, its hint and the answer line fade out, the next question is filled in (progress dots and buttons update at that moment), then they fade back in. Taps on the answer line do not trigger it. Same timing as the scene view's text swap (`motion.duration.text-swap`). | instant |
| Check-in open / close | Check in, Continue, × | instant | | full-screen layer shows / hides | same |

### Library

| Name | Trigger | Duration | Curve | What changes | Reduced |
|---|---|---|---|---|---|
| Scene view open | tap a scene | 620 | circle reveal (`(.2, 0, 0, 1)`) | opens from the tapped tile | 200 ms fade |
| Scene view close | x / Back | 220 | `ease-in` | opacity 1 to 0 | instant |
| Swipe slide, snap-back, neighbours | section 5H | 300 to 460 | `(.2, .8, .2, 1)` | | instant |
| Scene text swap | during the slide | 220 | `ease` | out, refill, in | instant |
| Wash cross-fade | scene changes | 1200 | ease-in-out | | instant |
| Wash brightens | Set the scene | 1200 | `ease` | 0.40 to 0.50 | instant |
| Playing bars ("On now") | scene on now: tiles, rows, scene view sub-line | 1100 per cycle | ease-in-out | scaleY .35 to 1; bars 2 and 3 start -350 / -700 ms; infinite | still bars |
| Play-preview bars | tap the sound line | 1100 per cycle | ease-in-out | the same bars as "On now" (one component) | still bars |
| Check-ins month / year zoom | tap | 360 | `(.2, 0, 0, 1)` | year scale 1.08 to 1; month .6 to 1; opacity | skipped |
| Message bar | list actions | 250 in; stays 5000 | as Home | | none |

### Remote

| Name | Trigger | Duration | Curve | What changes | Reduced |
|---|---|---|---|---|---|
| Switch thumb | toggle | 200 | `(.65, 0, .35, 1)` | as Home; thumb colour snaps | instant |
| Part dims when off | Light / Sound off | 300 | `ease` | opacity to .45 (Light) / .35 (Sound row) | instant |
| Transport button press | press | 200 | `ease` | background | instant |
| Orb brightness / Light off | ring drag, switch | 400 | `ease` | opacity, saturation | instant |
| Cycle icon turning | Cycle on | 6000 per turn | linear | rotate 0 to 360, infinite | stops |
| Playing bars | the playing track row | 1100 per cycle | ease-in-out | as "On now" bars | still |
| Value labels (brightness %, volume %) | drag | show on capture; hide **700 ms** after release | | instant swaps | same |
| **Light / Sound / Scent open** | tap Light ›, Sound › or Scent › ([R-4](prototype/FINAL_screens.html#R-4), [R-5](prototype/FINAL_screens.html#R-5), [R-6](prototype/FINAL_screens.html#R-6)) | 300 | `(.2, 0, 0, 1)` | the screen slides in from the right edge over the Remote, which stays still underneath (Android's standard screen transition). With React Navigation's native stack: `animation: 'slide_from_right'`. | instant |
| **Back** from Light / Sound / Scent | Back arrow, Android Back | 300 | `(.3, 0, 1, 1)` | the screen slides out to the right, uncovering the Remote | instant |

### Tabs

| Name | Trigger | Duration | Curve | What changes | Reduced |
|---|---|---|---|---|---|
| Tab switch (Library, Home, Remote) | tap the tab bar | instant | | the new tab shows at once, as Android's tab bars do; each tab keeps its own state | same |

### Timers the screens own (not components)

| Timer | Value |
|---|---|
| Set the scene on Home: wait / wash / controls / message bar | 0.6 s / +0.9 s (+0.2 s reduced) / +1.5 s / +3 s |
| Set the scene in the scene view: wait / "On now" / message bar | 0.6 s / +1.5 s / +3 s |
| Undo window (Home, Library) | 5 s (the message bar's life) |
| Remote Undo / Redo | no time limit |
| Connecting / reconnecting texts | 1.6 s / 2 s or 5 s |

---

## 7. Remove animations (Android's setting)

Components read the phone's setting with `useReducedMotion()` unless `reduceMotion` is passed (the lab passes it from its "Remove animations" button). When it is on:

| Thing | Becomes |
|---|---|
| Orb | flat, no swirl or strands; no colour walk; no Sink; Light bloom skipped (jumps to 1.10x with Corona); Long exposure is a plain blend of about 1.2 s |
| Home wash | one still frame; fades in and out over 800 ms (starts at 0.2 s instead of 0.9 s); no bleed |
| Scene view wash | still frame; cross-fades instant |
| Scene strip | jumps, no slide |
| Home fades, message bar, knob glide, scale | instant |
| Library transitions | all removed |
| Playing bars, Cycle icon | still |

**Every** animation honours Remove animations, including the Remote's switch thumb, brightness fade, part dims and button press, and Home's Undo (the orb jumps straight back to 1.0x; the wash fades out over 800 ms). FINAL does the same.

---

## 8. Motion tokens

In `design-system/tokens.json`, group `motion` (durations in ms; curves as cubic-bezier or as a named function in `animation-reference/easing.ts`). Use these names in components, never raw numbers. This table is generated from the file.

| Token | Value | Used for |
|---|---|---|
| `motion.duration.tap` | 120 ms | Set the scene press; neighbour orbs fade in during a drag |
| `motion.duration.knob` | 180 ms | Check-in knob glide (grow 150, land 220) |
| `motion.duration.bar` | 250 ms | Message bar in / out |
| `motion.duration.switch` | 200 ms | Switch thumb and track |
| `motion.duration.fade` | 450 ms | Screen-group cross-fades, Not now, the pause after Reading your answers |
| `motion.duration.slide` | 460 ms | Scene strip slide: clamp(300, 520 - abs(velocity) * 160, 460); taps use 460 |
| `motion.duration.slide-min` | 300 ms | Fastest scene strip slide |
| `motion.duration.slide-snap` | 300 ms | Snap-back when a drag is released short |
| `motion.duration.text-swap` | 220 ms | Scene text out and in during a slide |
| `motion.duration.wash-cross` | 1200 ms | Scene view wash cross-fade between scenes, and brighten 0.40 to 0.50 |
| `motion.duration.wash-in` | 4500 ms | Home wash bleeds in from the outer edges |
| `motion.duration.wash-out` | 3000 ms | Home wash recedes |
| `motion.duration.wash-reduced` | 800 ms | Home wash fade with Remove animations |
| `motion.duration.wash-start` | 900 ms | Home wash starts this long after Set the scene (200 with Remove animations) |
| `motion.duration.bloom-grow` | 950 ms | Orb grows to 1.12x |
| `motion.duration.bloom-settle` | 1100 ms | Orb eases from 1.12x to 1.10x |
| `motion.duration.undo-orb` | 700 ms | Undo: orb size and glow |
| `motion.duration.undo-fx` | 300 ms | Undo: strands and swirl |
| `motion.duration.long-exposure` | 3700 ms | Reading your answers: pearl develops into the mood palette |
| `motion.duration.long-exposure-done` | 4150 ms | 3700 plus the 450 pause: the result appears |
| `motion.duration.long-exposure-reduced` | 1200 ms | Plain colour blend with Remove animations |
| `motion.duration.brightness` | 400 ms | Remote orb opacity easing (CSS ease) |
| `motion.duration.cycle-colour` | 6000 ms | One colour of the orb walk at speed 1 |
| `motion.duration.bars-cycle` | 1100 ms | Playing bars, one cycle |
| `motion.duration.value-hide` | 700 ms | Brightness / volume % label stays this long after release |
| `motion.duration.undo-window` | 5000 ms | Message bar visible; Undo live (Home, Library) |
| `motion.duration.set-wait` | 600 ms | Set the scene: "Setting the scene…" before the scene is sent (Home and the scene view) |
| `motion.duration.screen-push` | 300 ms | The Remote's Light / Sound / Scent screens slide in from the right, and out on Back |
| `motion.easing.ease` | cubic-bezier(0.25, 0.1, 0.25, 1) | CSS ease: the default |
| `motion.easing.out` | cubic-bezier(0.16, 1, 0.3, 1) | Knob, press, message bar translate |
| `motion.easing.strip` | cubic-bezier(0.2, 0.8, 0.2, 1) | Scene strip slide, snap-back, name emphasis |
| `motion.easing.in-out` | cubic-bezier(0.42, 0, 0.58, 1) | Scene wash cross-fade (CSS ease-in-out) |
| `motion.easing.switch` | cubic-bezier(0.65, 0, 0.35, 1) | Switch thumb |
| `motion.easing.open` | cubic-bezier(0.2, 0, 0, 1) | Scene view open, month / year zoom, a Remote screen sliding in |
| `motion.easing.push-out` | cubic-bezier(0.3, 0, 1, 1) | A Remote screen sliding out on Back |
| `motion.easing.soft` | easeSoft | easing.ts: (1 - cos(pi * x^0.75)) / 2. Every orb grow |
| `motion.easing.sine` | sineIO | easing.ts: (1 - cos(pi * x)) / 2. Every orb settle |
| `motion.easing.bleed-in` | bleedIn | easing.ts: 1 - (1 - x)^3.2 |
| `motion.easing.bleed-out` | bleedOut | easing.ts: quadratic in-out |
| `motion.orb.size-home` | 176 | Home, and the scene view (L-12) |
| `motion.orb.size-checkin` | 136 | Check-in cards |
| `motion.orb.size-remote` | 100 | Remote, inside the 196 brightness ring |
| `motion.orb.canvas-ratio` | 0.46 | Orb diameter / canvas side: the canvas holds the halo |
| `motion.orb.scale-peak` | 1.12 | Light bloom peak |
| `motion.orb.scale-rest` | 1.1 | On now: at rest after Set the scene |
| `motion.orb.corona-rest` | 0.35 | REST: Corona strength at rest |
| `motion.orb.sink-depth` | 0.045 | Press: scale = 1 - 0.045 * press |
| `motion.orb.sink-rate-in` | 14 | Press follow rate, per second |
| `motion.orb.sink-rate-out` | 7 | Release rate, per second |
| `motion.orb.hit-radius` | 0.55 | A press counts within this x the orb size of its centre |
| `motion.orb.remote-opacity-min` | 0.35 | opacity = 0.35 + 0.65 * brightness |
| `motion.orb.remote-opacity-off` | 0.92 | Light off: pearl at this opacity |
| `motion.orb.cycle-speed-min` | 0.2 | speed = 0.2 + 2.8 * slider |
| `motion.orb.cycle-speed-range` | 2.8 | speed = 0.2 + 2.8 * slider |
| `motion.wash.opacity-home` | 0.46 | Home wash strength: a little more colour than the scene view at rest (0.40) |
| `motion.wash.opacity-scene` | 0.4 | Scene view wash, resting |
| `motion.wash.opacity-scene-lit` | 0.5 | Scene view wash after Set the scene |
| `motion.wash.blur` | 20 | Blur radius |
| `motion.wash.inset` | 0.06 | The wash is drawn this fraction past every screen edge |
| `motion.wash.text-on-wash` | #4a443e | Muted text while a wash is on (same as color.text-muted-strong) |

---

## 9. What is in `animation-reference/` (inventory)

Copy the folders into `src/animations/` as shown. Every file is labelled:

- **production-ready:** run on an Android phone and checked against FINAL; use as is.
- **algorithmic-reference:** a faithful port of FINAL's algorithm; use as is, but it is shader or maths code that is hard to change safely (change only to match a new FINAL).
- **test only:** the Motion lab and its helpers; not copied into `src/`.

Dependencies: React Native 0.85, `@shopify/react-native-skia` 2.x, `react-native-reanimated` 4.x with `react-native-worklets`, `@react-native-community/slider` and `react-native-svg` (lab only).

| File or folder | Label | What it is | Inputs and outputs | Used by |
|---|---|---|---|---|
| `Orb/Orb.tsx` | production-ready | The orb component. `forwardRef`; handle `{ bloom, undo, rest(on), longExposure(scene, onDone), pressIn, pressOut }`. | props `size`, `colours`, `walk`, `speed`, `opacity`, `pressable`, `reduceMotion`, `clockStart` | Home, check-in, scene view (`SceneSwipe`), Remote |
| `Orb/orbMotion.ts` | production-ready | The timelines (bloom, undo, rest, longExposure) on Reanimated. Numbers as in checks C, D, E and I. | writes shared values; returns a cancel function | `Orb.tsx` |
| `Orb/orbShader.ts` | algorithmic-reference | The orb's SkSL (Globe 39) and its constants (`REST`, `PEAK`, `LEAK_SCALE`). Pixel-identical to FINAL's WebGL in every state. | uniforms: `uT`, `uG`, `uIdx`, `uPress`, `uFlat`, `uSpin`, `uFx`, `uLeak`, `uRing`, `uStr`, `uProg`, `uLab`, `uChr`, ... | `Orb.tsx` |
| `Orb/index.ts` | production-ready | Public exports, plus the call patterns for each screen in comments. | | |
| `BackgroundWash/index.ts`, `SceneSwipe/index.ts`, `ColourOrb/index.ts` | production-ready | Public exports of each folder. | | |
| `BackgroundWash/BackgroundWash.tsx` | production-ready | The Home wash with the bleed. Props `width`, `height`, `colours`, `shown`, `lit`, `opacity`, `litOpacity`, `seed`, `speed`, `reduceMotion`. Exports `HOME_WASH_OPACITY` (0.46). | | Home, `SceneWash` |
| `BackgroundWash/SceneWash.tsx` | production-ready | The scene view's wash: always on, cross-fade over 1.2 s, `lit`. | | Library scene view |
| `BackgroundWash/washShader.ts` | algorithmic-reference | The wash SkSL (within 1 level of FINAL's per pixel), the bleed mask, `HOME_WASH` constants. | | `BackgroundWash.tsx` |
| `SceneSwipe/SceneSwipe.tsx` | production-ready | The sliding strip (names plus orbs). Handle `{ go, bloom, undo, rest }`; props `scenes`, `initialIndex`, `orbSize`, `onChange`, `onSwap`, `onLand`, `reduceMotion`. | | Library scene view |
| `ColourOrb/ColourOrb.tsx`, `colourOrbShader.ts` | production-ready | The Light screen's wheel and knob. `onChange(hex, lab)`. | | Remote's Light screen |
| `colour.ts` | production-ready | OKLab helpers, `PEARL`, `washLab`, `orbLab`, `labHex`, `toLab`. | | all |
| `easing.ts` | production-ready | `easeSoft`, `sineIO`, `expoOut`, `bleedIn`, `bleedOut` as worklets. | | `orbMotion.ts`, `BackgroundWash.tsx` |
| `lab/` (`MotionLab.tsx`, `ui.tsx`, `palettes.ts`, `palettes.data.ts`, `pages/*`) | test only | The Motion lab: ten pages A to J. Also the worked example of how screens drive the components. `palettes.ts` has FINAL's wheel recipe and the app recipe (test code; the app builds its own from DATA_AND_RULES.md §3.6). | | nothing in the app |

Suggested layout in the app:

```
src/animations/
  Orb/          BackgroundWash/   SceneSwipe/   ColourOrb/
  colour.ts     easing.ts
src/dev/motion-lab/   (lab/, dev builds only)
```

---

## 10. Testing the animations

### On an Android phone (the Motion lab)

The lab is one screen with a menu of ten pages. Each page shows the component on its own, has buttons to play the animation, a timer, a **What to check** list and the FINAL screen to compare with. **Remove animations** (top right) switches the whole lab to what the Android setting does.

1. Turn on Developer options and USB debugging, connect the phone by USB (File transfer mode), allow the debugging prompt.
2. Start Metro for the project, then link the phone to it: `adb reverse tcp:8081 tcp:8081`.
3. Point the dev entry at the lab, for example a dev-only `index.js`:

```js
import React from 'react';
import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MotionLab } from './src/dev/motion-lab/MotionLab';
AppRegistry.registerComponent('WellnessLamp', () => () => <SafeAreaProvider><MotionLab /></SafeAreaProvider>);
```

4. **A debug build with a bundled copy of the app always starts with that copy.** If `debuggableVariants = []` is set in `android/app/build.gradle`, the debug APK contains the JS bundle and shows it first. Reload from Metro (shake > Reload, or `http://localhost:8081/reload` in a browser on the computer) to get the lab. To avoid it, build debug with `debuggableVariants = ["debug"]`.
5. **Unplugging and replugging the cable drops `adb reverse`.** Run it again.
6. The banner "Open debugger to view warnings" means a `console.warn` or `console.error` happened. On this React Native version the details only show in the debugger: press `j` in the Metro terminal, or run `adb logcat 'ReactNativeJS:W' '*:S'`.
7. Frame rate matters most in checks D, E and H. Judge on a release build (debug builds are slower).

### What every page checks

Section 5 lists the checks per page; they are the same as the "What to check" lists in `lab/pages/*.tsx`. Keep both in step.

---

## 11. Haptics, and Set the scene on each tab

**Haptics are optional.** FINAL buzzes at these moments. If you add them, use these durations, call `Vibration.vibrate(ms)` from the screen (never from a component) and add the `VIBRATE` permission to the manifest:

| When | Buzz |
|---|---|
| Pressing Home's orb (Sink) | 8 ms |
| Set the scene, when its 0.6 s wait ends (Home and the scene view) | 28 ms |
| Each step of the check-in's answer line | 6 ms |

**Set the scene, tab by tab** (times from the tap; Home and the scene view run the same way):

| Tab | Start | Then |
|---|---|---|
| Home | "Setting the scene…" for 0.6 s, always | Bloom at 0.6 s; wash at 1.5 s; Home's controls at 2.1 s; message bar at 3.6 s for 5 s. |
| Library scene view | "Setting the scene…" for 0.6 s, always | Bloom and wash brighten at 0.6 s; "On now" at 2.1 s; message bar at 3.6 s for 5 s. |
| Remote | At once (when connected) | The bottom button changes; no bloom, no wash, no message bar (the Remote has Undo / Redo). |
| Any tab, not connected | "Setting the scene…" until the connection settles (about 1.6 s on a retry), or a fix line above the button | Then as above. |
