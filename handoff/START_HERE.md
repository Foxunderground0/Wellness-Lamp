# START HERE — Wellness Lamp redesign handoff

This folder is the complete handoff for redesigning the Wellness Lamp app. It is written to be **self-contained**: everything you need to know about the existing app, the hardware, and the new design is in these documents. You do not need access to any other repository to write these docs or to understand the scope.

## What this project is

A visual and behavioural redesign of an existing React Native Android app that controls a BLE wellness lamp (60-LED colour lamp) and a separate BLE speaker device. The new design is an approved HTML prototype (in `prototype/`). The redesign keeps the app's working hardware integration and offline mood engine, replaces all screens and navigation, and adds scenes, a scene library, and live remote controls.

This is **not** a greenfield app. The coding agent will work inside the existing codebase and must preserve specific working code, listed below.

## The existing app, in brief

For anyone (human or agent) who cannot see the codebase:

- **Stack:** React Native 0.85 (bare, no Expo), TypeScript, Hermes, New Architecture. Skia (`@shopify/react-native-skia`) for the animated orb/background. `react-native-ble-plx` for Bluetooth. AsyncStorage installed but barely used. No navigation library — screens are mounted once and shown/hidden from `App.tsx`.
- **Current screens (all being replaced):** five bottom-nav tabs — Glow (orb preview + mode/speed/brightness sliders + "Send to Lamp"), Feel (mood questionnaire → palette result), Themes (8 preset palettes), Hue (colour wheel), Sound (speaker remote control).
- **Mood engine (keep):** fully offline. 100 fixed questions across 5 dimensions (energy, social, mental, emotional, purpose), answers map to a 5D vector, nearest of 26 mood archetypes wins, palette gets a small personalised hue shift. Deterministic, no network.
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
| Questions | `app/WellnessLamp/src/data/questions.ts` | 100 questions with dimension/polarity metadata |
| Archetypes | `app/WellnessLamp/src/data/moodArchetypes.ts` | 26 mood archetypes with palettes |
| Preset themes | `app/WellnessLamp/src/theme/presetThemes.ts` | 8 preset palettes (become Library presets) |
| Colour math | `app/WellnessLamp/src/utils/colorMath.ts` | hex/HSL conversion, smoothing |

## What gets replaced

- All five screens and `BottomNav` — replaced by the new design: **Home** (check-in), **Remote**, **Library**.
- `App.tsx` — currently holds all navigation, light state, sound state, and side effects in one component. Replaced by a navigation shell + a proper state layer (see `PROPOSED_STRUCTURE.md`).

## What gets deleted (dead code)

- `src/services/openRouter.ts`, `src/services/questionFetcher.ts`, `src/services/questionBank.ts` — an abandoned AI question-generation path, not connected to any active screen, API key intentionally blank.
- `src/components/QuestionCard.tsx` — superseded, unused.

## What is new in the redesign

- **Home / check-in first:** the questionnaire is the default experience; skippable while keeping Home useful.
- **Scenes:** a scene = colours + mode + speed + brightness + sound selection + scent selection + per-part on/off. Scenes come from check-ins, presets, saved scenes, or built from scratch.
- **Set the scene → live controls:** nothing touches hardware until the user explicitly presses "Set the scene". After that, Remote adjustments (colour dot, brightness, speed, volume) send live with throttled writes. Track taps play immediately on the speaker.
- **Library:** three tabs — Presets, Saved, Check-ins (with a calendar of past check-ins). Open a scene → "Set the scene" / "Save as a scene".
- **Save / update / save-as-new:** scenes persist locally (AsyncStorage). Editing a saved scene shows "· Edited" and offers Update or Save as new. Only colours, track, and scent count as edits — brightness/volume/speed do not.
- **Scent UI:** four scents, one active at a time, rename supported. UI and data model only.
- **Partial connection states:** "Light unavailable → Try again" style rows; lamp and speaker succeed or fail independently.

## Out of scope — do not design or build

- Phone audio playback of any kind (no previews; sound plays on the speaker only)
- Accessibility work beyond what the prototype already does
- Automated tests / test plans
- Backend, accounts, sign-up, profiles
- Scent hardware commands or firmware
- iOS polish (Android is the target)
- Onboarding screens

## Hardware rules every document must respect

1. Lamp and speaker are **two separate BLE devices**; a command to one can succeed while the other fails. Always report their results independently.
2. **No readback.** The UI may say "sent", never claim confirmed hardware state.
3. Continuous controls (brightness, speed dragging) need throttled, latest-value-wins writes — at most one BLE write in flight, ~150–250 ms interval, final value sent on release.
4. A dropped connection during live control must fail fast into a "reconnecting" state, never a silent 12-second rescan.
5. Lamp minimum brightness is 5% — there is no true "off"; the explicit scene start/stop boundary is what defines "nothing playing".

## The prototype

- `prototype/` contains the frozen, approved HTML prototype. Open the HTML file in any browser.
- The prototype is the **visual** authority: layout, colours, typography, component look, animation feel.
- It is NOT the behaviour authority — it simulates hardware and contains prototype-only scaffolding. Behaviour comes from `SCREENS_AND_FLOWS.md` and `DATA_AND_RULES.md`.
- <!-- TODO: freeze the prototype before handoff — pick final variants for toggle, slider, card surface, nav; strip the variations panel, motion lab, and rejected Library explorations -->

## Code and assets included in this handoff

Give the developer only the reference material that saves real recreation work:

1. **Frozen HTML prototype** in `prototype/` — visual and interaction reference, not production React Native code.
2. **Orb and background-wash source** in `animation-reference/`.
   - Prefer an isolated React Native Skia implementation if one is available; label it `production-ready`.
   - If the supplied code uses browser Canvas, DOM, CSS, or web React, label it `algorithmic-reference`. The developer must port its colour math, timing, layers, and shader behaviour to React Native Skia rather than copy it directly.
   - Include a 60 fps reference recording and still images showing important animation states.
3. **Final icons, fonts, and textures** in `assets/`, with clear filenames. Include source SVGs where available.
4. **Machine-readable design tokens**, if produced, in `assets/tokens.json`. `DESIGN_SYSTEM.md` remains the human-readable explanation.

Do not generate or supply a second set of ordinary React screen/components from the HTML. The coding agent should build those directly in the target architecture from the prototype and specifications; duplicate generated components would create another conflicting source.

Existing BLE, mood-engine, question, archetype, preset, and colour utility code already lives in the app repository. Do not copy it into this handoff. `MIGRATION.md` tells the coding agent exactly which existing files to retain and how they fit into the redesign.

`MOTION.md` must inventory every file in `animation-reference/`, label its compatibility (`production-ready` or `algorithmic-reference`), list its inputs/outputs, and explain where it is used. `DESIGN_SYSTEM.md` must inventory every supplied icon/font/texture. This prevents the developer from having to guess what any provided file is for.

## Document priority

When documents conflict, higher wins:

1. `SCREENS_AND_FLOWS.md` — screens, navigation, every flow
2. `DATA_AND_RULES.md` — data models, persistence, product rules, hardware constraints, sound catalog
3. `MOTION.md` — animations, orb/wash reference code
4. `DESIGN_SYSTEM.md` — tokens and components
5. The HTML prototype
6. The existing app's behaviour

If something is missing from all of them, it is an open question — ask, don't invent.

## Open questions (do not guess these)

- Final names of the four scents (prototype names are provisional)
- Exact contents of the MP3Controller SD card (needed for the sound catalog table)
- Whether check-in history has a retention limit
- Settings screen contents (not in current scope unless added to SCREENS_AND_FLOWS)
- "ESP connected by touch" pairing concept — undefined, not designed

## Folder contents

| Item | Purpose |
|---|---|
| `START_HERE.md` | This file — scope, context, priorities |
| `SCREENS_AND_FLOWS.md` | Screen inventory, navigation map, every flow step by step |
| `DATA_AND_RULES.md` | Scene model, persistence, naming rules, hardware constraints, sound catalog |
| `DESIGN_SYSTEM.md` | Colour/type/spacing tokens, every component with its final variant and states |
| `MOTION.md` | Every animation; orb + background wash reference implementation notes |
| `CONTENT.md` | Final copy: names, taglines, questions, UI text; provisional items marked |
| `MIGRATION.md` | Keep/replace/delete lists with paths; known bugs to fix; build order |
| `PROPOSED_STRUCTURE.md` | Target folder layout and state-ownership rules for the rebuilt app |
| `prototype/` | Frozen approved HTML prototype |
| `animation-reference/` | Orb/wash code, 60 fps recordings, screenshots |
| `assets/` | Icons, fonts, textures |
