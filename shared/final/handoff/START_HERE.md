# START HERE — Wellness Lamp redesign handoff

This folder is the complete handoff for **v1** of the redesigned Wellness Lamp app. v1 is exactly what the frozen prototype shows; anything else (see *Later versions*) is not part of this build. It is written to be **self-contained**: everything you need to know about the existing app, the hardware, and the new design is in these documents. You need no other files to understand the scope.

## What this project is

A visual and behavioural redesign of an existing React Native Android app that controls a BLE wellness lamp (60-LED colour lamp) and a separate BLE speaker device. The new design is an approved HTML prototype (in `prototype/`). The redesign keeps the app's working hardware integration and offline mood engine, replaces all screens and navigation, and adds scenes, a scene library, and live remote controls.

This is **not** a greenfield app. The coding agent will work inside the existing codebase and must preserve specific working code, listed below.

## The existing app, in brief

For anyone (human or agent) who cannot see the codebase:

- **Stack:** React Native 0.85 (bare, no Expo), TypeScript, Hermes, New Architecture. Skia (`@shopify/react-native-skia`) for the animated orb/background. `react-native-ble-plx` for Bluetooth. AsyncStorage installed but barely used. No navigation library — screens are mounted once and shown/hidden from `App.tsx`.
- **Current screens (all being replaced):** five bottom-nav tabs — Glow (orb preview + mode/speed/brightness sliders + "Send to Lamp"), Feel (mood questionnaire → palette result), Themes (8 preset palettes), Hue (colour wheel), Sound (speaker remote control).
- **Mood engine (keep):** fully offline. 100 fixed questions across 5 dimensions (energy, social, mental, emotional, purpose), answers map to a 5D vector, nearest of 25 mood archetypes wins, palette gets a small personalised hue shift. Deterministic, no network.
- **Lamp hardware (keep):** BLE device named `WellnessLamp`. The app writes one JSON command (mode static/immersive, up to 8 hex colours, speed 0.2–3.0, brightness 0.05–1.0). **Write-only: the lamp never reports state back.** Firmware eases colour changes over ~550 ms.
- **Speaker hardware (keep):** separate BLE device named `MP3Controller` with MP3 files on its own SD card, organised as 6 folders × 5 tracks. The app sends folder/file numbers and volume (0–30). Also write-only. The phone never plays audio — tapping a track plays it on the speaker.
- **Scent:** does not exist in hardware or code. The new design includes scent UI (4 fixed scents, one active at a time) as **UI + data model only** — no hardware commands.

## What must be preserved (exact paths in the app repo)

The coding agent must keep and reuse these, wrapping rather than rewriting:

| Keep | Path | Why |
|---|---|---|
| Lamp BLE service | `app/WellnessLamp/src/services/lampService.ts` | Working scan/connect/write + permissions |
| Speaker BLE service | `app/WellnessLamp/src/services/mp3Service.ts` | Working speaker protocol |
| Mood engine | `app/WellnessLamp/src/services/moodEngine.ts` | The offline inference logic |
| Questions | `app/WellnessLamp/src/data/questions.ts` | 100 questions with dimension/polarity metadata. **16 of them get new wording** (`CONTENT.md` §5): change only their `text` |
| Archetypes | `app/WellnessLamp/src/data/moodArchetypes.ts` | 25 mood archetypes with palettes |
| Preset themes | `app/WellnessLamp/src/theme/presetThemes.ts` | 8 preset palettes (become Library presets) |
| Colour math | `app/WellnessLamp/src/utils/colorMath.ts` | hex/HSL conversion, smoothing |
| Smoothing reference palettes | `app/WellnessLamp/src/theme/baselinePalettes.ts` | Imported by `colorMath.ts`; moves with it |

## What gets replaced

- All five screens and `BottomNav` — replaced by the new design: **Home** (check-in), **Remote**, **Library**.
- `App.tsx` — currently holds all navigation, light state, sound state, and side effects in one component. Replaced by a navigation shell + a proper state layer (see `PROPOSED_STRUCTURE.md`).

## What gets deleted (dead code)

- `src/services/openRouter.ts`, `src/services/questionFetcher.ts`, `src/services/questionBank.ts` — an abandoned AI question-generation path, not connected to any active screen, API key intentionally blank.
- `src/components/QuestionCard.tsx` — superseded, unused.

## What is new in the redesign

- **Home / check-in first:** Home is the check-in; the Remote and the Library work without one.
- **Scenes:** a scene = its 8 colours (+ Colour range and the held colour), a track and a scent. Brightness, Cycle and its speed, volume and the on/off switches are the person's own settings, not part of a scene (`DATA_AND_RULES.md` §2). Scenes come from check-ins, presets, saved scenes, or built from scratch.
- **Set the scene → live controls:** nothing touches hardware until the user explicitly taps "Set the scene" (a single tap, not press-and-hold). After that, Remote adjustments (colour dot, brightness, speed, volume) send live with throttled writes. Track taps play immediately on the speaker.
- **Library:** three tabs — Presets, Saved, Check-ins (a month calendar, one orb per night, plus a year view). Open a scene → a full-screen scene view (swipe between scenes) → "Set the scene". Saved scenes can be edited in the row (name, sound, scent), renamed and deleted (with Undo).
- **Save:** scenes persist locally (AsyncStorage). Save appears on the Remote when a scene's own parts change (its palette, track or scent) or it was never saved. Your own scene saves in place (tap its name to rename); an edited preset or check-in saves a copy ("[name] 2"); a scene from scratch starts as "My scene". Switches, brightness, volume, Cycle and its speed, and choosing a dot never count as edits.
- **Scent UI:** four scents (Warm Apple Crumble, Malibu, Cosy Cottage, Vanilla and Caramel), one active at a time, rename supported. UI and data model only: no hardware commands. The UI treats scent like the other parts (no "coming soon" state); the code just never sends a scent command.
- **Some check-in questions have new wording.** The 100 questions, their IDs, dimensions and polarity are unchanged (scoring depends on them), but 16 questions are reworded: e01, e02, e03, e06, e08, e10, e12, e17, e18, s11, m02, m05, o10, o20, p02, p11. The old and new text of each is in `CONTENT.md` §5; replace the `text` of those IDs in `src/data/questions.ts` and leave the other 84 as they are. Or copy `questions/questions.ts` over it: the app's file with exactly those 16 texts replaced. `questions/QUESTIONS_ALL.md` lists all 100. The prototype's 10 sample questions are not the real ones.
- **Partial connection states:** "Light unavailable · Try again" / "Sound unavailable · Try again"; lamp and speaker succeed or fail independently.

## Out of scope — do not design or build

- Phone audio playback of any kind (track previews in the Library play on the speaker too)
- Accessibility work: no screen-reader labels, roles or announcements, no touch-target polish. v1 keeps only what's specified: 200% text, Android's Remove animations and the visible focus ring
- Automated tests / test plans
- Backend, accounts, sign-up, profiles
- Scent hardware commands or firmware
- iOS polish (Android is the target)
- Onboarding screens
- Settings: the Me button (a plain person icon) is shown but opens nothing in v1
- In-app setup screens, the System sheet, trusted phones / multiple devices (the connection is automatic; see `SCREENS_AND_FLOWS.md`)

## Hardware rules every document must respect

1. Lamp and speaker are **two separate BLE devices**; a command to one can succeed while the other fails. Always report their results independently.
2. **No readback.** The UI may say "sent", never claim confirmed hardware state.
3. Continuous controls (brightness, Cycle speed, Colour range, volume) need throttled, latest-value-wins writes — at most one BLE write in flight, ~150–250 ms interval, final value sent on release.
4. A dropped connection during live control must fail fast into a "Reconnecting…" state, never a silent 12-second rescan.
5. Brightness runs 5–100% (the lamp's floor). **Light off / All off send a Bluetooth off command**, so off is fully dark. The developer says it's a simple command, but the code audit found none in today's firmware: confirm it or add it (`DATA_AND_RULES.md` §5.1). The explicit Set the scene start is what defines "something playing".
6. **No other firmware changes in v1:** the lamp and speaker commands stay as they are; live controls send the existing command more often (throttled).

## The prototype

`prototype/` holds the frozen, approved prototype. Open either file in a browser (Chrome or Edge).

- `FINAL_prototype.html`: the app itself, live, starting with nothing set. Tap through it.
- `FINAL_screens.html`: every screen and state, each opened in place and still live, tagged with its screen ID (H-1, R-3, X-2d…). Link straight to one with `FINAL_screens.html#ID`. `SCREENS_AND_FLOWS.md` §1 lists what is on each one.

It is the **visual** authority: layout, colours, typography, component look and animation feel. The written behaviour is in `SCREENS_AND_FLOWS.md` and `DATA_AND_RULES.md`; the prototype does the same things, with the lamp and the speaker simulated. Its code is a reference, not something to port: some prototype-only code is still in it, and its sample data (track names, sample lines, the Library's 6 presets) is replaced by `CONTENT.md`.

## What else is in this folder

1. **Animation code** in `animation-reference/`: the orb, the background wash, the scene view's swipe and the Light screen's colour orb, written for React Native Skia and Reanimated and checked on an Android phone against the prototype. Use it as is. `lab/` is the Motion lab: one page per animation, with the ten checks that are the acceptance test. `MOTION.md` §9 lists every file, its inputs and where it is used.
2. **Design tokens** in `design-system/tokens.json` (W3C format: colours, type, spacing, radii, motion).
3. **The component gallery**, `design-system/component-gallery.html`: every component in `DESIGN_SYSTEM.md` in each of its states, as pictures cut from the prototype (in `design-system/gallery/`), plus the tokens and the icons. Each picture links to its spec and to its screen, where it can be seen live.
4. **Icons and the paper grain** in `design-system/icons/` (every icon the app draws, one SVG each; `icons.json` gives each one's size and where it is used) and `design-system/grain.png`.
5. **Fonts are not bundled.** Both are free on Google Fonts (`MIGRATION.md` §8).

Do not generate a second set of ordinary React screens or components from the HTML. Build them directly in the target architecture from the specs and the prototype; generated duplicates would be another conflicting source.

The existing BLE, mood engine, question, archetype, preset and colour code already lives in the app repository and is not copied here. `MIGRATION.md` says which files to keep and how they fit the redesign.

## How to build it (suggested order)

Build bottom-up, so every screen is assembled from finished parts and nothing is styled twice:

1. **Design tokens** (`design-system/tokens.json` → `src/design-system/tokens/`): colours, type styles, spacing, radii, motion durations and easings.
2. **Components** (`design-system/component-gallery.html`, `DESIGN_SYSTEM.md`): every component in every state, using tokens only. Check each against the gallery before moving on.
3. **The app shell:** navigation (tabs, Home first, focused steps without the tab bar) and the state layer (the active scene, the session), with the existing BLE services wrapped behind interfaces (`MIGRATION.md`, `PROPOSED_STRUCTURE.md`).
4. **Screens and flows** (`SCREENS_AND_FLOWS.md`), one area at a time: Home + check-in → Remote → Library and scenes. Compare each screen with its figure in `prototype/FINAL_screens.html` (same IDs and order).
5. **Motion** (`MOTION.md`): the orb, the wash, the transitions; the still versions for Remove animations.
6. **States and polish:** every connection, empty and error state in SCREENS_AND_FLOWS §1.5–1.6, long names, 200% text.

`MIGRATION.md` §11 has the same order step by step, with the files to move and delete at each step.

## Document priority

When documents conflict, higher wins:

1. `SCREENS_AND_FLOWS.md` — screens, navigation, every flow
2. `DATA_AND_RULES.md` — data models, persistence, product rules, hardware constraints, sound catalog
3. `CONTENT.md` — every string the app shows: preset and mood copy, questions, labels, messages
4. `MOTION.md` — animations and the animation code
5. `DESIGN_SYSTEM.md` — tokens and components
6. The HTML prototype
7. The existing app's behaviour

`MIGRATION.md` and `PROPOSED_STRUCTURE.md` are about the code (what to keep, where things go), not about what the app does. If something is missing from all of them, ask; don't invent it.

## Developer tasks (do not guess these)

Everything about the design is decided. These are the facts only the hardware and the code can answer (`DATA_AND_RULES.md` §7, `MIGRATION.md` §10):

- **Name every track.** All track names in the prototype are placeholders, and today's app has none (only folder labels and file numbers). The one change is that tracks are now split into `Ambient` and `Music`. Read the speaker's SD card (6 folders × 5 tracks) and fill in the sound catalog (`DATA_AND_RULES.md` §6, `CONTENT.md` §9).
- **The off command:** confirm the lamp has one, or add it (`DATA_AND_RULES.md` §5.1).
- **The speaker's commands:** its firmware isn't in the repository; confirm them on the device.
- **The timeouts:** connect (~10 s per attempt), Set the scene (~8 s) and "Reconnecting…" (~5 s before "Partly connected" / "Can't connect"). Set them to what Bluetooth allows and note the values.
- **Another phone vs out of range:** whether a lamp in use by another phone can be told apart from one out of range. Until then, both show "Can't connect".

Settled: check-in history is kept indefinitely (no limit in v1); the Me button is a plain person icon (no name, opens nothing); v1 ships the mood names in the code; 16 questions get new wording (`CONTENT.md` §5); haptics are optional (`MOTION.md` §11).

## Later versions (not v1 — do not build)

Onboarding and "Finish your profile"; Settings (editable Bedtime and wake time, the evening reminder, "Play sound with scenes", Delete my data; v1 uses Bedtime 23:00 and wake time 07:00, fixed); the name in "Sleep well, [name]" (v1 says "Sleep well"); in-app setup and the System sheet; trusted phones and multiple devices (including the "ESP connected by touch" pairing idea); a multi-lamp (group) UI; "Recently set" in the Library; scent hardware; the Spotify version; firmware features (the lamp storing the last scene, an on/off state report, a sleep timer on the device). None of them are designed for v1.

## Folder contents

| Item | Purpose |
|---|---|
| `START_HERE.md` | This file: scope, context, priorities |
| `SCREENS_AND_FLOWS.md` | Screen inventory with IDs, navigation map, every flow step by step |
| `DATA_AND_RULES.md` | Scene model, persistence, naming rules, hardware constraints, sound catalog |
| `CONTENT.md` | Every string: preset and mood copy, the reworded questions, labels, messages, formats |
| `DESIGN_SYSTEM.md` | Colour, type and spacing tokens; every component with its final design and states |
| `MOTION.md` | Every animation, the ten checks, the animation code inventory |
| `MIGRATION.md` | Keep / replace / delete lists with paths; bugs to fix; dependencies; build order |
| `PROPOSED_STRUCTURE.md` | Target folder layout and state-ownership rules for the rebuilt app |
| `prototype/` | `FINAL_prototype.html` (the live app) and `FINAL_screens.html` (every screen and state, by ID) |
| `design-system/` | `tokens.json`, `component-gallery.html` (its pictures in `gallery/`), `icons/` and `grain.png` |
| `questions/` | `questions.ts` (the app's file with the 16 reworded questions; drop-in) and `QUESTIONS_ALL.md` (all 100, the 16 marked) |
| `animation-reference/` | The orb, wash, swipe and colour-orb code for React Native, and the Motion lab (`lab/`) |
