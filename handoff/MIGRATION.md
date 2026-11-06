# MIGRATION.md: what happens to the existing app

**What this is:** the list of what to keep, replace and delete in the existing app, the bugs to fix while rebuilding it, what changes in storage, dependencies and Bluetooth, and the build order. The target folder layout and the state rules are in `PROPOSED_STRUCTURE.md`.

**How to read the paths:**

- App paths are relative to the app root, `app/WellnessLamp/` (for example `src/services/lampService.ts`).
- The firmware path `firmware/latest_multi_node/WellnessLamp.cpp` is relative to the repository root.
- `file.ts:12` means line 12 of that file. Every path and line was checked against the committed code.
- Your working copy may have uncommitted changes for a test setup of the Motion lab (see Dependencies). This document describes the committed app. How to point the dev entry at the Motion lab is in `MOTION.md` §10.

---

## 1. The whole picture

- **Keep** the hardware services, the mood engine, the questions, the archetypes, the presets and the colour maths. Wrap them, move them into the new folders and leave their logic unchanged.
- **Replace** the five screens, `App.tsx` and the bottom navigation with the new Home, Remote and Library (`SCREENS_AND_FLOWS.md`).
- **Delete** the abandoned AI question code first. Nothing imports it.
- **Fix** the known bugs listed below. Most of them go away with the old screens, but none of them may come back in the new code.
- **Bluetooth and firmware:** the protocol stays the same. The one possible change is the lamp's off command (§9).

---

## 2. Keep (wrap, don't rewrite)

| File today | What it is | Wrapped by (new module) | Moves to |
|---|---|---|---|
| `src/services/lampService.ts` | Lamp Bluetooth: permissions, scan, connect, JSON + Base64 write | `src/services/lamp/index.ts`: the lamp interface the state layer uses. It connects when the app opens, remembers the device, owns the throttled writer, handles off, and reports the lamp's status on its own. | `src/services/lamp/lampService.ts` |
| `src/services/mp3Service.ts` | Speaker (`MP3Controller`) Bluetooth: same pattern, speaker commands | `src/services/sound/index.ts`: play a track (folder, file), pause, resume, volume (throttled), and the speaker's status on its own | `src/services/sound/mp3Service.ts` |
| `src/services/moodEngine.ts` | Offline scoring: answers to a 5D vector, nearest archetype, small hue shift | `src/domain/checkin.ts`: builds the rounds of 5, turns answers into `AnswerRecord`s (`{ questionId, questionText, score }`), calls `inferMoodOffline`, and returns the mood ID, the 8 colours and the vector | `src/domain/moodEngine.ts` |
| `src/utils/colorMath.ts` | hex / RGB / HSL conversion, `smoothPalette`, `splineColor` | `src/domain/palette.ts`: the wheel's 8-colour recipe and Colour range (`smoothPalette`) | `src/domain/colorMath.ts` |
| `src/data/questions.ts` | The 100 questions (ID, dimension, polarity) | `src/domain/checkin.ts` picks the questions for each round | stays |
| `src/data/moodArchetypes.ts` | The 25 mood archetypes and their palettes | `src/domain/scene.ts` turns a mood into a scene; names are looked up by ID | stays |
| `src/theme/presetThemes.ts` | The 8 presets (IDs `golden-hour` … `ember-glow`) | `src/domain/scene.ts` turns a preset into a scene; Library → Presets | `src/data/presetThemes.ts` |
| `src/theme/baselinePalettes.ts` | The 10 reference palettes behind the smoothing | Used only by `colorMath.ts`, which imports it (`colorMath.ts:1`). It must move with it. | `src/data/baselinePalettes.ts` |

**Rules for the kept files:**

1. Their logic does not change. Moving a file and fixing its import paths is allowed.
2. **Question wording:** 16 questions are reworded (`CONTENT.md`). Change only their `text` values in `src/data/questions.ts` (or copy `questions/questions.ts` from this folder over it: same file, those 16 texts replaced). Never change `id`, `dimension` or `polarity`, because scoring depends on them.
3. **Not used in v1, leave in place:**
   - `generateSessionQueue` (`questions.ts:138`, the old 40 random questions);
   - `staticColor` on presets and archetypes, because the held colour starts at index 0 (`DATA_AND_RULES.md` §3.6);
   - `intensity`, because it no longer picks a sound;
   - `splineColor`;
   - `partialVector`.
4. **The wheel recipe is not in `colorMath.ts`.** It is `buildPalette()` in `src/screens/HueScreen.tsx:15-27`, which is being replaced. Copy it into `src/domain/palette.ts` before you delete the Hue screen. Use `DATA_AND_RULES.md` §3.6 for the new step 6: hue +45°, saturation −5, lightness +2, instead of `HueScreen.tsx:23` (hue +150°). Keep the other steps and their clamps.
5. **Small, additive changes to the two Bluetooth services are allowed.** The protocol code stays exactly as it is: UUIDs, device names, MTU, JSON + Base64 encoding, write with response, the permission logic and the result types. You may only:
   - use one shared `BleManager` from `src/services/ble/` instead of `new BleManager()` (`lampService.ts:33`, `mp3Service.ts:38`);
   - export a `connect()` that can use a saved device ID first, then scan. Today `ensureConnected` is private (`lampService.ts:90-99`, `mp3Service.ts:91-100`). Also export the device ID so it can be stored;
   - export a plain write that does not request permissions or scan. Today every send does both (`lampService.ts:105-113`, `mp3Service.ts:103-110`). Check permissions and Bluetooth state once, in `src/services/ble/`;
   - make the scan timeout a parameter instead of the fixed 12 s (`lampService.ts:19`, `mp3Service.ts:24`);
   - make `startT` optional in `LampCommand` (`lampService.ts:29`; see §9);
   - add the off command once the firmware has it (§9).

---

## 3. Replace

| File today | Replaced by |
|---|---|
| `src/screens/GlowScreen.tsx` | Remote (`src/features/remote/`) |
| `src/screens/FeelScreen.tsx` | Home + check-in (`src/features/home/`, `src/features/checkin/`) |
| `src/screens/ThemesScreen.tsx` | Library → Presets (`src/features/library/`) |
| `src/screens/HueScreen.tsx` | Remote → Light screen (R-4) with `<ColourOrb>`; its recipe moves to `src/domain/palette.ts` first |
| `src/screens/SoundScreen.tsx` | Remote's Sound part and Sound screen (R-5), Library's Sounds screen (L-13) |
| `App.tsx` | Providers and the navigation container only. All state moves to `src/app/state/`, all navigation to `src/app/navigation/`. |
| `src/components/BottomNav.tsx` | `TabBar` (`src/design-system/components/`), the custom tab bar for Library · Home · Remote |

These old files are used only by the screens above, so they go too:

| File today | Replaced by |
|---|---|
| `src/components/MoodSwatch.tsx` | `<Orb>` (`src/animations/Orb/`) |
| `src/components/GradientBackground.tsx` and `src/assets/glass-foil-texture.jpg` | `<BackgroundWash>` / `<SceneWash>` and the paper grain (`DESIGN_SYSTEM.md`) |
| `src/components/PaletteReveal.tsx`, `TaglineDisplay.tsx`, `VerticalCarousel.tsx`, `FrostedTexture.tsx` | The new check-in, result and components (`DESIGN_SYSTEM.md`) |
| `src/theme/colors.ts` | `src/design-system/tokens/` |
| `src/types/index.ts` | Keep `MoodPalette` (the engine's output type) and `PresetTheme` in `src/data/types.ts`. Drop `AppScreen`, `DisplayMode` and `QuestionAnswer`. |

`__tests__/App.test.tsx` renders the old `App`. Automated tests are out of scope, so you may delete it or leave it.

---

## 4. Old screen → new screen

| Old tab (file) | What it did | Where it lives now |
|---|---|---|
| Glow (`GlowScreen.tsx`) | Orb preview, Static / Immersive, speed, brightness, **Send to Lamp**, mini player | **Remote** (R-1 to R-3): the brightness ring, **Cycle** with a Slow–Fast slider, the 4 colour dots and the player. **Send to Lamp** becomes **Set the scene**, then changes send live. |
| Feel (`FeelScreen.tsx`) | 40 random questions, reveal, result, Raw–Refined slider, Apply | **Home** and the **check-in** (C-1 to C-5): rounds of 5, Reading your answers, the result, Set the scene / Not now. Raw–Refined becomes **Colour range** on the Light screen (R-4). |
| Themes (`ThemesScreen.tsx`) | 8 preset cards, apply | **Library → Presets** (L-1), then the scene view (L-12) and Set the scene |
| Hue (`HueScreen.tsx`) | Colour wheel, lightness, 8-colour palette, apply | **Remote → Light screen** (R-4): the colour wheel (no lightness control), the scene's 8 colours and Colour range |
| Sound (`SoundScreen.tsx`) | Connect button, 6 folders × 5 tracks, transport, volume | **Remote**: the Sound part and the Sound screen (R-5). The connection is automatic (X-2), so there is no Connect button. |
| (none) | | New: Library → Saved (L-2), Check-ins (L-6), the Scent screen (R-6), All and the part switches, Save and names |

---

## 5. Delete (dead code)

Delete these first. Nothing in the active app imports them (every import in `App.tsx`, `index.js` and `src/` was checked).

| File | Imported by | Why it goes |
|---|---|---|
| `src/services/openRouter.ts` | only `questionFetcher.ts:15` | Abandoned AI question generation; empty API key |
| `src/services/questionBank.ts` | only `questionFetcher.ts:16` | Stores the AI question pool (the only AsyncStorage use) |
| `src/services/questionFetcher.ts` | nothing | Orchestrates the two above |
| `src/components/QuestionCard.tsx` | nothing | Superseded by `VerticalCarousel.tsx`, which is also going |

Never put an API key in the app.

---

## 6. Known bugs to fix during the rebuild

| Bug | Where | Fix |
|---|---|---|
| **The speaker's connection flag is overwritten by every command result.** One failed pause marks the speaker disconnected. | `App.tsx:68-72` (`send` sets `connected: result === 'ok'`), again in `App.tsx:76-79` | Connection status comes only from the Bluetooth layer's connect and disconnect events (`src/services/ble/`). A failed command reports a failed send for that part and never changes the connection status. |
| **Stop is marked as done even when the Bluetooth write fails.** | `App.tsx:102-105` (`onStop` ignores the result). Volume does the same: `App.tsx:116-119`. | Change the play state only after an `ok` result. On a failure, show the part's unavailable line, keep the person's volume value and send it again once the speaker is back. |
| **Stale connect check in the Sound screen.** It shows "MP3Controller not found" after a successful connect. (`DATA_AND_RULES.md` §7, DEV-02) | `src/screens/SoundScreen.tsx:50-51`: it awaits `onConnect()`, then reads the `sound.connected` prop captured before the await | Decide on the result the call returns, or on the status store, never on a prop read after an `await`. |
| Two Bluetooth managers whose scans aren't coordinated (DEV-04) | `lampService.ts:33`, `mp3Service.ts:38` | Use one shared `BleManager` for both devices (`src/services/ble/manager.ts`). |
| The first send scans for up to 12 s, inside the send | `lampService.ts:19`, `:90-99`, `:112-113`; `mp3Service.ts:24`, `:91-100`, `:109-110` | Connect when the app opens and never scan inside a write. A drop shows "Reconnecting…" at once (`DATA_AND_RULES.md` §3.2). |
| Permissions are requested on every send | `lampService.ts:105`, `mp3Service.ts:103` | Ask once, the first time the Remote opens or Set the scene is tapped (SCREENS_AND_FLOWS §4.13). |
| No disconnect listener | neither service subscribes to disconnects | Subscribe to the device's disconnect event in `src/services/ble/` to drive "Reconnecting…". |
| The orb shows 6 colours while the lamp gets 8 (DEV-03) | `src/components/MoodSwatch.tsx:158` (`.slice(0, 6)`) | `<Orb>` takes all 8 colours. |
| 40 random questions (DEV-05) | `FeelScreen.tsx:28` calls `generateSessionQueue(8)` (`questions.ts:138`) | Use rounds of 5, one question per dimension (`DATA_AND_RULES.md` §3.9). |
| The "all answered" state can never be reached (DEV-01) | `FeelScreen.tsx:29`, `:47`, `:164` (`currentIdx` never advances) | The new check-in owns one question index. |
| The answer slider starts at 5 | `src/components/VerticalCarousel.tsx:60` | Nothing is pre-selected. |
| Every preset tries to play the Forest folder | `ThemesScreen.tsx:20` (`intensity: 'calm'`) and `App.tsx:20-26`, `:123-129` | Play the scene's own track, a random one for now (`DATA_AND_RULES.md` §3.10). |
| Android backup is off | `android/app/src/main/AndroidManifest.xml:25` (`allowBackup="false"`) | Set `allowBackup="true"` (`DATA_AND_RULES.md` §4: Auto Backup on). |
| Landscape is allowed | `MainActivity` in `AndroidManifest.xml:29-40` has no orientation | Add `android:screenOrientation="portrait"` (SCREENS_AND_FLOWS §3, rule 8). |

---

## 7. Persistence: today and v1

**Today:** the active app stores nothing. Every value lives in React state in `App.tsx` and resets when the app restarts. The only AsyncStorage key, `@wellness_question_pool` (`questionBank.ts:8`), belongs to the dead code in §5. Don't read it and don't migrate it. There is nothing to carry over.

**v1** (`DATA_AND_RULES.md` §4 has the types and how long each is kept):

| Key | Holds |
|---|---|
| `@wl/v1/savedScenes` | `SavedScene[]` |
| `@wl/v1/checkIns` | `CheckIn[]`, kept indefinitely |
| `@wl/v1/unfinishedCheckIn` | `UnfinishedCheckIn \| null` |
| `@wl/v1/session` | `Session`, including unsaved changes and the baseline |
| `@wl/v1/scents` | the 4 scents and their renames |
| `@wl/v1/devices` | the lamp's and the speaker's saved device IDs |
| `@wl/v1/flags` | for example "swipe hint seen" and "permission asked" |

Never stored: the Undo / Redo history, the connection state, a Library sound preview. All storage code lives in `src/services/persistence/`. Turn Android Auto Backup on (§6).

---

## 8. Dependencies

**Installed today** (committed `package.json`):

| Package | Version | Used for in v1 |
|---|---|---|
| `react-native` / `react` | 0.85.1 / 19.2.3 | the app (New Architecture and Hermes are on) |
| `@shopify/react-native-skia` | ^2.11.0 | the orb, the wash, the colour wheel, Globe stills |
| `react-native-reanimated` + `react-native-worklets` | ^4.5.3 + ^0.11.4 | all motion. The Babel plugin `react-native-worklets/plugin` is already in `babel.config.js`. |
| `react-native-ble-plx` | ^3.5.1 | lamp and speaker |
| `@react-native-async-storage/async-storage` | ^1.23.1 | §7 |
| `react-native-safe-area-context` | ^5.5.2 | safe areas (edge-to-edge) |
| `react-native-svg` | ^15.15.5 | icons (`design-system/icons/`) |
| `@react-native-community/slider` | ^5.2.0 | the Motion lab only (the app's `LineSlider` is custom) |
| `react-native-linear-gradient`, `react-native-wheel-color-picker`, `@react-native/new-app-screen` | ^2.8.3, ^1.3.1, 0.85.1 | Nothing. They are used only by the old screens, or not at all. Remove them once nothing imports them. |

**Add, only if missing:**

| Package | Why |
|---|---|
| `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack` | The tabs and stacks (`PROPOSED_STRUCTURE.md` §7). `MOTION.md` §6 specifies `animation: 'slide_from_right'` on the native stack for Light, Sound and Scent. |
| `react-native-screens` | Required by the native stack |
| `react-native-gesture-handler` | The gestures in `DESIGN_SYSTEM.md` (answer scale, brightness ring, slider, colour wheel). Wrap the root in `GestureHandlerRootView`. |
| `react-native-safe-area-context` | Already installed. Nothing to add. |

**No package needed:**

- **Fonts:** Source Serif 4 (400) and Hanken Grotesk (400, 500, 600). Both are free on Google Fonts (SIL Open Font License). Download the static TTFs and link them as assets. (The prototype embeds web-only subsets, which Android can't use.)
- **Icons and the paper grain:** already in this folder, `design-system/icons/` (one SVG per icon) and `design-system/grain.png`.
- **Phone volume buttons** (`DATA_AND_RULES.md` §5.2): nothing installed handles them. Use a small native module (Android `VolumeProvider`) or a library you choose.
- **Haptics are optional.** If you build them, use React Native's `Vibration` (`MOTION.md` §11) and add the `VIBRATE` permission.

The README specifies pnpm, but the committed lockfile is `package-lock.json`. Pick one package manager and keep one lockfile.

A local, uncommitted `package.json` may pin `react-native-reanimated ~4.5.3` and `react-native-worklets ~0.11.4` and add `@react-native/gradle-plugin`. Those changes belong to the Motion lab test setup.

---

## 9. Bluetooth and firmware

**No protocol changes in v1**, except the lamp's off command. The lamp's two commands and the speaker's commands stay as they are. Live controls send the same lamp command more often, through the throttled writer.

**The off command (a developer task):**

- There is none today:
  - the app's `LampCommand` has only `static` and `immersive` (`lampService.ts:23-30`);
  - the firmware handles only those two (`firmware/latest_multi_node/WellnessLamp.cpp:190-227`);
  - brightness is clamped at 5% (`WellnessLamp.cpp:196`, `:714`).
- Confirm or add it (`DATA_AND_RULES.md` §5.1).
- **Don't send a new command to today's firmware.** It treats any unknown `mode` as static with the default lavender `#c9b8e8` (`WellnessLamp.cpp:203-204`, `:223`), so `{"mode":"off"}` would turn the lamp lavender, not off.

**`startT` restarts the lamp's colour walk.** The firmware resets its animation position whenever `startT` is present (`WellnessLamp.cpp:211-212`). Send `startT: 0` only when a scene is set. Leave it out of live writes (brightness, speed, Colour range), or the lamp jumps back to its first colour about five times a second. `DATA_AND_RULES.md` §5.1 shows `startT: 0` in both commands; that is correct for Set the scene only.

**Limits, checked against the code:**

| Limit | Value | Where |
|---|---|---|
| Lamp | `WellnessLamp`; service `…9abc`; write characteristic `…9abd`; MTU 512 | `lampService.ts:16-18`, `:76` |
| Speaker | `MP3Controller`; same UUIDs; MTU 256 | `mp3Service.ts:21-23`, `:77` |
| Brightness | 0.05–1.0 (app and firmware) | `GlowScreen.tsx:146`; `WellnessLamp.cpp:196` |
| Speed | app 0.2–3.0; firmware 0.1–5.0 | `GlowScreen.tsx:124`; `WellnessLamp.cpp:208` |
| Colours | at most 8; extra colours are ignored | `WellnessLamp.cpp:71`, `:218` |
| Colour ease on the lamp | 550 ms | `WellnessLamp.cpp:49` |
| Sound | folders 1–6 × files 1–5. Next and previous are worked out in the app and sent as `playFolder`. | `SoundScreen.tsx:15-24`; `App.tsx:49`, `:106-115` |
| Speaker commands | `play`, `volume`, `stop`, `pause`, `resume`, `next`, `previous`, `playFolder` | `mp3Service.ts:28-36` |
| Volume | integer 0–30 | `SoundScreen.tsx:182-184`; `mp3Service.ts:9` |
| Writes today | with response, one at a time, no throttle or debounce | `lampService.ts:119`; `mp3Service.ts:115` |
| Firmware command queue | 6 commands; it drops more when full | `WellnessLamp.cpp:742`, `:679-680` |

**New in v1, not in the code today:**

- **The throttle:** at most one write in flight per device, about every 150–250 ms, latest value wins, and a final value on release (`DATA_AND_RULES.md` §3.2; the writer is described in `PROPOSED_STRUCTURE.md` §5). Without it, the 6-command firmware queue fills up and the lamp replays stale values.
- Connect when the app opens.
- A remembered device per part.
- Fail fast on a drop.
- One `BleManager` for both devices.

---

## 10. Developer tasks (unknowns only you can resolve)

These match START_HERE's *Developer tasks* and `DATA_AND_RULES.md` §7. Record each answer in the code, for example as a named constant or a catalog entry.

- **The off command:** confirm it or add it (§9).
- **The track list:** read the speaker's SD card (6 folders × 5 tracks expected). Fill in the sound catalog (`DATA_AND_RULES.md` §6, `src/domain/sound.ts`) and the names the app shows. Every track name in the prototype is a placeholder; give each track a real name (`CONTENT.md` §9).
- **The timeouts:** connect (~10 s per attempt), Set the scene (~8 s) and "Reconnecting…" (~5 s before "Partly connected" / "Can't connect"). Set them to what Bluetooth allows and note the values.
- **The speaker's commands:** its firmware isn't in the repository. Confirm the list in §9 on the device.
- **Another phone vs out of range:** confirm whether a lamp in use by another phone can be told apart from one out of range. Until then, both show "Can't connect".
- **The wheel's fixed lightness:** use the old picker's default. It started at `#a78bd4` (`HueScreen.tsx:30`), HSL lightness about 69%.

---

## 11. Build order

This is the same order as START_HERE's *How to build it*. Build bottom-up, and check each step against the prototype before moving on.

0. **Prepare:**
   - Delete the dead code (§5).
   - Add the dependencies (§8).
   - Copy `animation-reference/` (all but `lab/`) into `src/animations/` and `lab/` into `src/dev/motion-lab/` (`PROPOSED_STRUCTURE.md` §10), so screens use the real orb from the start.
1. **Tokens:** convert `design-system/tokens.json` into `src/design-system/tokens/` (`PROPOSED_STRUCTURE.md` §9).
2. **Components:** build every component in `DESIGN_SYSTEM.md` in every state, using tokens only.
3. **Shell, state and services:**
   - Build the navigation (`PROPOSED_STRUCTURE.md` §7) and the state layer with persistence.
   - Wrap the Bluetooth services with the shared manager and the throttled writer.
   - Move the kept files (`PROPOSED_STRUCTURE.md` §8).
   - Replace `App.tsx`, then delete the old screens and components (§3). Git keeps them for reference.
4. **Home and the check-in:** H-1 to H-10, C-1 to C-5.
5. **Remote:** R-1 to R-7, the Light, Sound and Scent screens, live sending.
6. **Library and scenes:** L-1 to L-15, Save and names.
7. **Motion:** wire the orb, the wash and the transitions as in `MOTION.md` §4, and make the ten checks in the Motion lab pass. Then do the still versions for Remove animations.
8. **States and polish:**
   - every connection, empty and error state (SCREENS_AND_FLOWS §1.5–1.6);
   - long names;
   - 200% text;
   - the developer tasks in §10.
