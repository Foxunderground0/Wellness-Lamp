# PROPOSED_STRUCTURE.md: the target layout for the rebuilt app

**What this is:** the target `src/` layout for the rebuilt Wellness Lamp app. The stack is React Native 0.85, TypeScript, Skia and Reanimated, with the existing Bluetooth services. It also gives the state-ownership rules, the navigation tree, where each existing file moves, and how the tokens become code.

**What you may change:** you may change the internals (file names inside a folder, how the store is written, helper splits). The boundaries must hold:

- features own screens;
- `domain/` owns the rules as plain TypeScript;
- `services/` alone talks to hardware and storage;
- `app/state/` connects them.

**How to read the paths:** paths are relative to the app root, `app/WellnessLamp/`. What to keep, replace and delete, and why, is in `MIGRATION.md`.

---

## 1. The tree

```text
index.js                  unchanged: registers App
App.tsx                   providers + NavigationContainer only (no state, no effects)
src/
  app/
    navigation/           RootNavigator, Tabs, RemoteStack, route types (Home is the initial route)
    state/                the store: session, saved scenes, check-ins, scents, flags, connection;
                          actions, selectors, liveSync, hydrate / persist. NOT in App.tsx
  features/
    home/                 HomeScreen: H-1 to H-10, and C-4 / C-5 (they play on Home's layout)
    checkin/              CheckInScreen: C-1 to C-3 (the cards, no tab bar)
    remote/               RemoteScreen (R-1 to R-3, R-7), LightScreen (R-4), SoundScreen (R-5), ScentScreen (R-6)
    library/              LibraryScreen (L-1 to L-11, the three heading tabs, the year view),
                          SceneViewScreen (L-12, with the naming sheet L-15), SoundPickerScreen (L-13)
  design-system/
    tokens/               color.ts, typography.ts, layout.ts, motion.ts, index.ts (from tokens.json)
    components/           the shared components from DESIGN_SYSTEM.md
  animations/             copied from the handoff's animation-reference/ (MOTION.md §9)
    Orb/  BackgroundWash/  SceneSwipe/  ColourOrb/
    colour.ts  easing.ts
  domain/
    scene.ts              the scene types + mappers: preset / check-in / scratch → scene parts; edit check
    sound.ts              the sound catalog (folder, file, group, name, length); next / previous; random track
    palette.ts            the wheel's 8-colour recipe, Colour range, the held colour, the Remote's 4 dots
    checkin.ts            rounds of 5, Skip, scoring through moodEngine
    names.ts              the one name rule (1–30 characters, taken, numbering)
    time.ts               bedtime 23:00 / wake 07:00: the night of a check-in, evening reset, Sleep well
    hardware.ts           session → lamp command / speaker command (clamps, speed and volume mapping)
    moodEngine.ts         moved from src/services/ (logic unchanged)
    colorMath.ts          moved from src/utils/ (logic unchanged)
  services/
    ble/                  the one BleManager, permissions, Bluetooth state, connection status, timeouts,
                          latestValueWriter.ts (the throttled writer)
    lamp/                 lampService.ts (moved) + index.ts (the lamp interface)
    sound/                mp3Service.ts (moved) + index.ts (the speaker interface) + the phone's volume buttons
    persistence/          keys.ts (@wl/v1/...), storage.ts (typed load / save, versioned)
  content/
    strings.ts            all UI copy (CONTENT.md)
    sceneCopy.ts          each preset's and mood's line and scent, by ID (CONTENT.md)
  data/
    questions.ts  moodArchetypes.ts  presetThemes.ts  baselinePalettes.ts  types.ts
  dev/
    motion-lab/           the Motion lab (dev builds only; nothing in the app imports it)
  assets/
    fonts/  icons/  textures/      fonts from Google Fonts; the SVGs from handoff design-system/icons/; its grain.png
```

---

## 2. What each folder owns, and what it must not do

| Folder | Owns | Must not |
|---|---|---|
| `src/app/navigation/` | The navigator tree (§7), route names and params, the custom tab bar hookup, Android Back rules that belong to navigation | Hold scene state; call services |
| `src/app/state/` | The single source of truth for the session and the stored data (§4); the actions screens call; sending live changes to `services/`; loading and saving through `services/persistence/` | Import React Native UI; run UI timers or animations |
| `src/features/*/` | Screens and the components only that area uses (for example `AnswerScale` in `checkin/`, `BrightnessRing` in `remote/`, `CheckInCalendar` in `library/`); the screen's **timers** (0.6 s, 0.9 s, 1.5 s, 3 s, 5 s) | Import `services/`; import another feature; hold stored data in local state |
| `src/design-system/tokens/` | Every colour, type style, space, size, radius and motion value, generated from `tokens.json` (§9) | Contain values that aren't in `tokens.json` |
| `src/design-system/components/` | Components shared by two or more areas (`PageHeader`, `MeButton`, `ConnectionLine`, `TabBar`, `PillButton`, `TextLinkButton`, `RoundIconButton`, `IconButton`, `ToggleSwitch`, `MessageBar`, `PartUnavailableLine`, `PlayingBars`, `SceneNameField`, `LineSlider`, `ColourDot`, `GlobeStill`, …) | Use raw values (tokens only); read app state; decide timers; hardcode copy (take it as props) |
| `src/animations/` | The orb, the washes, the scene strip and the colour wheel, exactly as supplied (`MOTION.md`) | Start themselves on a timer; read app state; take touches (the orb canvas keeps `pointerEvents="none"`); be re-tuned |
| `src/domain/` | Every product rule as plain functions and types: scenes, edits, names, time of day, palettes, the check-in, the sound catalog, the command shapes | Import React, React Native, `services/` or AsyncStorage |
| `src/services/` | Bluetooth (both devices), the throttled writer, connection status and timeouts, AsyncStorage, the phone's volume buttons | Import React components or screens; know about screens or copy |
| `src/content/` | All UI copy from `CONTENT.md`, and the per-scene lines and scents by ID | Contain logic |
| `src/data/` | Read-only source data: questions, archetypes, presets, reference palettes | Contain logic beyond what the files already have |
| `src/dev/motion-lab/` | The Motion lab | Be imported by app code |

**What may import what:**

| From | May import |
|---|---|
| `features/` | `app/state` (hooks and actions), `design-system`, `animations`, `domain` (types and pure helpers), `content` |
| `app/navigation/` | `features`, `design-system` |
| `app/state/` | `domain`, `services`, `data` |
| `services/` | other `services/`, `domain` types |
| `domain/` | `data`, other `domain/` files |
| `design-system/` | its tokens, `animations` (`GlobeStill` draws the orb) |
| `animations/` | its own files only |
| `dev/` | `animations`, `design-system` |

---

## 3. State ownership: the rules

1. **Screens read and change scene state only through `app/state`.** They read with hooks or selectors, and they change it by calling actions such as `setTheScene`, `setBrightness`, `holdColour`, `chooseTrack` or `save`. No screen keeps its own copy of the session.
2. **Only `services/` talks to hardware and storage.** No screen, component or domain file imports `react-native-ble-plx` or AsyncStorage.
3. **`domain/` has no React imports.** It takes data and returns data, so every rule in `DATA_AND_RULES.md` (edits, names, time of day, the wheel recipe, the command shapes) can be read and checked on its own.
4. **Components never decide timers; screens own them** (`MOTION.md` §1, rule 1). A screen tells `<Orb>` to `bloom()` and starts its own 0.9 s, 1.5 s and 3 s timers. The hardware timeouts (connect, Set the scene, Reconnecting…) are not UI timers. They live in `services/ble/`.
5. **`App.tsx` holds no state.** It only nests the providers: `GestureHandlerRootView`, `SafeAreaProvider`, the state provider and `NavigationContainer`.
6. **Lamp and speaker are always separate.** Every service call returns a result for its own part, and `app/state` keeps a status per part (`DATA_AND_RULES.md` §5.3).

---

## 4. The state layer (`src/app/state/`)

| Slice | Type (`DATA_AND_RULES.md` §2) | Stored under |
|---|---|---|
| `session` | `Session` (source, parts, baseline, held colour, the person's settings, preview, last action) | `@wl/v1/session` |
| `savedScenes` | `SavedScene[]` | `@wl/v1/savedScenes` |
| `checkIns` | `CheckIn[]` | `@wl/v1/checkIns` |
| `unfinishedCheckIn` | `UnfinishedCheckIn \| null` | `@wl/v1/unfinishedCheckIn` |
| `scents` | the 4 `Scent`s | `@wl/v1/scents` |
| `flags` | swipe hint seen, permission asked, … | `@wl/v1/flags` |
| `connection` | `{ lamp: PartStatus; speaker: PartStatus; bluetooth; permission }` | not stored |
| `remoteHistory` | Undo / Redo steps | not stored. It is cleared when leaving the Remote, on Save and on a new Set the scene. |

The saved device IDs (`@wl/v1/devices`) are owned by `services/ble/`, which stores them through `services/persistence/`.

- **How to build the store:** React context with `useReducer` is enough. A store library is allowed if you prefer one. Add it only if you want it.
- **Hydrate before the first screen:** load every key, then clear an unfinished check-in if this is the first app open after the evening reset (`domain/time.ts`), then show Home. Nothing is sent to the hardware on start (`DATA_AND_RULES.md` §3.11).
- **Persist on change:** debounce writes (the session changes many times during a drag) and flush when the app goes to the background. Put a version in every record (`DATA_AND_RULES.md` §4).
- **`liveSync`:** when a scene is running (`session.preview` is false and something has been set), every change to the light builds a lamp command with `domain/hardware.ts` and hands it to the lamp service's live writer. The same goes for volume and the speaker. Choosing a track is sent on its tap only. In preview nothing is sent.
- **Actions return per-part results** (`sent` / `unavailable` / `bluetoothOff` / `notAllowed`) so the screen can pick the message bar ("Light sent · Sound unavailable") and the fix line. The screen shows the message bar and owns its timer.

---

## 5. The throttled writer (latest value wins)

**Location:** `src/services/ble/latestValueWriter.ts`. There is one instance per device, created in `services/lamp/index.ts` and `services/sound/index.ts`.

**Behaviour** (`DATA_AND_RULES.md` §3.2):

- At most **one write in flight** per device. Writes use the existing write-with-response, so a write is finished when it resolves.
- **The minimum interval between writes is ~150–250 ms.** Choose one value and name it as a constant. The lamp eases each change over 550 ms, so 4–6 writes a second looks continuous.
- **Latest value wins:** a new value replaces any value that is waiting, and the replaced value is never sent. This is safe for the lamp because every lamp command carries the full state.
- **On release** (the finger lifts), call `flush()`. The latest value is sent as soon as the write in flight finishes, without waiting for the interval.
- **Speaker:** volume uses a latest-wins slot. `playFolder`, `pause`, `resume` and `stop` go in an ordered queue and are never dropped or replaced by volume.
- **On a failed write or a disconnect event:**
  - set the part's status to `reconnecting` at once and keep the latest value;
  - send that value when the device is back;
  - after the reconnect timeout (a developer task, ~5 s; `MIGRATION.md` §10), set the status to unavailable;
  - **never scan inside a write.**
- **Set the scene** does not use the live interval. It sends the whole scene at once and waits for each part's result, up to the Set the scene timeout.

**Interfaces** (a sketch; the names are suggestions):

```ts
type PartResult = 'sent' | 'unavailable' | 'bluetoothOff' | 'notAllowed';
type PartStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'unavailable' | 'bluetoothOff' | 'notAllowed';

interface LampPort {
  connect(): Promise<PartStatus>;            // at app open (saved device first), and on Try again
  set(cmd: LampCommand): Promise<PartResult>; // Set the scene: includes startT: 0
  live(cmd: LampCommand): void;               // live controls: throttled, latest wins, no startT
  flush(): void;                              // finger lifted
  off(): Promise<PartResult>;                 // once the firmware has an off command (MIGRATION.md §9)
  onStatus(listener: (s: PartStatus) => void): () => void;
}

interface SpeakerPort {
  connect(): Promise<PartStatus>;
  play(track: TrackRef): Promise<PartResult>; // playFolder; next / previous are worked out in domain/sound.ts
  pause(): Promise<PartResult>;
  resume(): Promise<PartResult>;
  volume(level: number): void;                // 0–30, throttled, latest wins
  flush(): void;
  onStatus(listener: (s: PartStatus) => void): () => void;
}
```

**`domain/hardware.ts` builds the commands.** It handles:

- Cycle on → `immersive` with the 8 colours and the speed;
- Cycle off → `static` with `palette[heldIndex]`;
- Light off → the off command;
- brightness is clamped to 0.05–1.0;
- the Slow–Fast slider maps to 0.2–3.0;
- the volume slider maps to `round(slider × 30)`;
- `startT` is included only when a scene is set.

---

## 6. Domain notes that affect the structure

- **Colour range smooths from the source palette.** That is the wheel's, the engine's or the preset's 8 colours, never colours that are already smoothed (`colorMath.smoothPalette(source, range)`). `SceneParts.palette` in `DATA_AND_RULES.md` §2 holds the colours as shown. Keep the source 8 next to them (for example a `sourcePalette` field; the names there are suggestions) so moving the slider back gives the same colours.
- **Edits are compared by value and ID** (`domain/scene.ts`): the 8 colours, the track's folder and file, the scent ID and Colour range. Never compare by a displayed name.
- **Moods and presets are referenced by ID.** Their names come from `src/data/`, and their lines and scents from `src/content/sceneCopy.ts`, so a rename is a data change only.

---

## 7. Navigation tree

```text
RootStack (native stack, no headers)
├── Tabs (bottom tabs, custom TabBar: Library · Home · Remote)
│   │   initialRouteName: 'Home'; backBehavior: 'initialRoute'; tab switch is instant; each tab keeps its state
│   ├── Library      LibraryScreen: heading tabs Presets · Saved · Check-ins (in-screen, not routes);
│   │                the year view L-7 is an in-screen state (Android Back returns to the month)
│   ├── Home         HomeScreen: H-1 to H-10, plus C-4 (Reading your answers) and C-5 (Result)
│   └── Remote       RemoteStack (native stack inside the tab, so the tab bar STAYS)
│       ├── RemoteMain   R-1, R-2, R-3, R-7 (name in place)
│       ├── Light        R-4   animation: 'slide_from_right'
│       ├── Sound        R-5   animation: 'slide_from_right'
│       └── Scent        R-6   animation: 'slide_from_right'
├── CheckIn          C-1 to C-3; full screen, NO tab bar; opens and closes instantly (animation: 'none')
├── SceneView        L-12; NO tab bar; params: which list (presets / saved / a month's check-ins), the start
│                    index, the tapped tile's position; presentation 'transparentModal', animation 'none',
│                    and the screen plays its own 620 ms reveal from the tile (MOTION.md §6);
│                    the naming sheet L-15 is a sheet inside it, not a route
└── SoundPicker      L-13; NO tab bar; opened from the in-row edit L-4; Choose writes the track into the edit
```

| Screen | Tab bar |
|---|---|
| Home, Library (all three heading tabs and the year view), Remote | yes |
| The Remote's Light, Sound and Scent screens | **yes** (they are inside the Remote tab) |
| The check-in cards (C-1 to C-3) | no |
| Reading your answers and the result (C-4, C-5) | yes (they are Home's layout) |
| Scene view (L-12) and its naming sheet (L-15) | no |
| The Library's Sounds screen (L-13) | no |

**Navigation rules** (SCREENS_AND_FLOWS §2):

- The app always opens on Home.
- `backBehavior: 'initialRoute'` matters. The tab order starts with Library, and the default (`firstRoute`) would send Android Back from the Remote to the Library instead of Home.
- See my mood closes the `CheckIn` route. Home then plays C-4 and C-5.
- The Library's empty-state **Check in** goes to the Home tab and opens `CheckIn`. **Go to Remote** goes to the Remote tab.
- A saved scene's **⋯** in the scene view closes the view and opens Saved with that row's pen and trash, passed as a Library param.
- **Android Back:**
  - check-in card: the previous card; on the first card it leaves, and progress is kept;
  - scene view, Sounds screen: close, nothing changes;
  - year view: back to the month;
  - Light / Sound / Scent: back to the Remote;
  - sheets and name fields: cancel;
  - Remote or Library tab: Home;
  - Home: leaves the app.

---

## 8. Existing files: old path → new path

| Old path | New path | What happens |
|---|---|---|
| `src/services/lampService.ts` | `src/services/lamp/lampService.ts` | Keep. Only the small additive changes in `MIGRATION.md` §2 rule 5. |
| `src/services/mp3Service.ts` | `src/services/sound/mp3Service.ts` | Keep. Same rule. |
| `src/services/moodEngine.ts` | `src/domain/moodEngine.ts` | Keep. Import paths only. |
| `src/utils/colorMath.ts` | `src/domain/colorMath.ts` | Keep. Import paths only. |
| `src/theme/baselinePalettes.ts` | `src/data/baselinePalettes.ts` | Keep (`colorMath.ts` needs it). |
| `src/data/questions.ts` | `src/data/questions.ts` | Stays. The 16 rewordings change `text` only. |
| `src/data/moodArchetypes.ts` | `src/data/moodArchetypes.ts` | Stays. |
| `src/theme/presetThemes.ts` | `src/data/presetThemes.ts` | Keep. Import paths only. |
| `src/types/index.ts` | `src/data/types.ts` | Keep `MoodPalette` and `PresetTheme`; drop the rest. |
| `buildPalette()` in `src/screens/HueScreen.tsx:15-27` | `src/domain/palette.ts` | Copy it, with step 6 changed (`MIGRATION.md` §2 rule 4), then delete the screen. |
| `App.tsx` | `App.tsx` | Rewritten: providers and navigation only. |
| `index.js` | `index.js` | Unchanged. |
| `src/screens/*.tsx` (5), `src/components/*.tsx` (8), `src/theme/colors.ts`, `src/assets/glass-foil-texture.jpg` | — | Deleted once their replacements exist (`MIGRATION.md` §3, §5). |
| `src/services/openRouter.ts`, `questionBank.ts`, `questionFetcher.ts` | — | Deleted first (dead code). |

---

## 9. Tokens: `tokens.json` → `src/design-system/tokens/*.ts`

`design-system/tokens.json` (W3C design-token format) is the source of truth. Convert it once, by hand or with a small script. If a value must change, change `tokens.json` and convert again. Never change a `.ts` value on its own.

| `tokens.json` group | File | Exports |
|---|---|---|
| `color` | `color.ts` | `color` (for example `color.ground`, `color.textMuted`) |
| `font`, `typography` | `typography.ts` | `fontFamily`, and `type`: the 14 text roles as React Native text styles |
| `space`, `size`, `radius`, `opacity` | `layout.ts` | `space`, `size`, `radius`, `opacity` |
| `motion` (`duration`, `easing`, `orb`, `wash`) | `motion.ts` | `duration`, `easing`, `orb`, `wash` |
| — | `index.ts` | re-exports everything |

**Conversion rules:**

- **Values:** take `$value` and drop `$type` and `$description`. Resolve references such as `{font.family.sans}`.
- **Names:** keep the words and write them in camelCase: `text-muted` → `textMuted`, `motion.duration.text-swap` → `duration.textSwap`. That way a name in the docs is easy to find in the code.
- **Units:** sizes are dp and type sizes sp. React Native numbers are already dp, and text follows Android's font size setting. Keep font scaling on, because 200% text must work.
- **Line height:** `lineHeight` is a ratio. Use `Math.round(fontSize × ratio)` (for example body 16 × 1.5 = 24).
- **Fonts:**
  - Bundle Source Serif 4 (400) and Hanken Grotesk (400 / 500 / 600), downloaded from Google Fonts.
  - On Android, map each family and weight to the bundled file's name (for example `HankenGrotesk-Medium` for 500), or register an Android font family. Check on the phone that 500 and 600 really render.
- **Curves:**
  - `cubicBezier` values become `Easing.bezier(x1, y1, x2, y2)` from Reanimated.
  - The named curves (`easeSoft`, `sineIO`, `bleedIn`, `bleedOut`) are the functions in `src/animations/easing.ts`.
- **Durations:** numbers in ms.

Components use tokens only, never raw numbers or colours (`DESIGN_SYSTEM.md`).

---

## 10. Animations and the Motion lab

**Copying the code:**

- Copy `animation-reference/Orb/`, `BackgroundWash/`, `SceneSwipe/`, `ColourOrb/`, `colour.ts` and `easing.ts` into `src/animations/`, unchanged (`MOTION.md` §9).
- Copy `animation-reference/lab/` into `src/dev/motion-lab/`.

**Fix the lab's imports after the copy.** The lab imports its neighbours by relative path:

| File | Today | Change it to |
|---|---|---|
| `MotionLab.tsx`, `ui.tsx`, `palettes.ts` | `'../colour'` | `'../../animations/colour'` |
| `palettes.ts` | `'../ColourOrb'` | `'../../animations/ColourOrb'` |
| `pages/*.tsx` | `'../../Orb'` | `'../../../animations/Orb'` |
| `pages/*.tsx` | `'../../colour'`, `'../../BackgroundWash'`, `'../../SceneSwipe'`, `'../../ColourOrb'` | the same pattern (`'../../../animations/…'`) |

Leave `'../palettes'` and `'../ui'` as they are.

**Keeping the lab out of the app:**

- Point the dev entry at the lab as `MOTION.md` §10 describes.
- Nothing in the app imports `src/dev/`, so the lab is never in the app's bundle.
- Don't edit the lab to make a check pass (`MOTION.md` §1, rule 8).

**Rules for every animation component:**

- Every component takes `reduceMotion` and otherwise follows Android's Remove animations through `useReducedMotion()` (`MOTION.md` §7).
- Screens call the components' methods (`bloom`, `undo`, `rest`, `longExposure`). They never copy the shaders or the timelines (`MOTION.md` §1, rule 1).
