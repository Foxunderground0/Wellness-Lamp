# CONTENT

Every piece of user-facing copy in v1: preset and mood text, scents, check-in copy, every label per screen, message bars, connection lines, sound names, and time and date formats. Screens are described in `SCREENS_AND_FLOWS.md`; data rules are in `DATA_AND_RULES.md`. If this file and `SCREENS_AND_FLOWS.md` ever disagree, `SCREENS_AND_FLOWS.md` wins (see `START_HERE.md`, *Document priority*).

---

## 1. How to use this file

- **Strings are exact.** Ship them as written: same capitals, same punctuation, no full stop unless one is shown. Strings are set in code style, like `Check in`.
- **`[name]` marks a variable**, for example `For [scene] · now [track]`. The text around it is fixed.
- **`·` is part of the string** where it sits between two parts on one line (for example `Can’t connect · Try again`). It is a middle dot with a space on each side.
- **Apostrophes and quotes are typographic:** `’` and `“ ”`, as FINAL uses them (`Can’t`, `evening’s`, `“Golden Hour”`). The other docs sometimes type a straight `'`; ship `’`.
- **`…` is one character** (the ellipsis), not three dots.
- **`(placeholder)`** marks copy that ships in v1 but may be replaced later. Build it like any other string.
- **Type, size and colour** are in `DESIGN_SYSTEM.md`, never here.
- **Keep every string in one place**, for example `src/content/strings.ts`, and the preset, mood and scent text in data files keyed by ID. Nothing in a component should hard-code copy.
- Screen IDs link to `prototype/FINAL_screens.html`. The live prototype is `prototype/FINAL_prototype.html`.

---

## 2. Presets

All 8 presets ship (`src/theme/presetThemes.ts`; keep the IDs and colours). FINAL’s Library shows only 6 as sample data, with older lines; the lines and scents below replace them.

| ID | Name | Line (scene view only; preset tiles show no line) | Scent |
|---|---|---|---|
| `golden-hour` | `Golden Hour` | `Warm, low sun, and no rush.` | Warm Apple Crumble |
| `deep-night` | `Deep Night` | `Late, and the house has finally gone quiet.` | Vanilla and Caramel |
| `ocean-drift` | `Ocean Drift` | `Cool blues that move like slow water.` | Malibu |
| `rose-garden` | `Rose Garden` | `Soft pink, like early morning air.` | Vanilla and Caramel |
| `storm-calm` | `Storm Calm` | `Grey and still, like the hour after rain.` | Cosy Cottage |
| `forest-floor` | `Forest Floor` | `Deep greens, low and steady.` | Cosy Cottage |
| `candy-dream` | `Candy Dream` | `Sugar-rush colours with nowhere to be.` | Vanilla and Caramel |
| `ember-glow` | `Ember Glow` | `The last red of a fire, still warm.` | Warm Apple Crumble |

**Sound:** a preset has no fixed track yet. For now its sound is a random track, like a mood’s (`DATA_AND_RULES.md` §3.10). FINAL’s per-preset tracks are samples.

---

## 3. Moods (check-in results)

The 25 archetypes in `src/data/moodArchetypes.ts`. **Store moods by ID** and look the name, line and scent up when shown, so a rename is a data change and old check-ins follow it.

The names are the ones in the code today; the line and scent ship as listed.

| ID | Name | Line | Scent |
|---|---|---|---|
| `alive-reaching` | `Alive and Reaching` | `Bright and forward. The day’s moving on its own.` | Malibu |
| `warm-wide-open` | `Warm and Wide Open` | `Open and easy, whatever comes next.` | Malibu |
| `grateful-golden-hour` | `Grateful Golden Hour` | `The good kind of full. No reason needed.` | Warm Apple Crumble |
| `morning-resolve` | `Morning Resolve` | `Clear-headed, and ready for what’s next.` | Malibu |
| `purposeful-drive` | `Purposeful Drive` | `Clear on what matters, and moving towards it.` | Malibu |
| `forest-floor-peace` | `Forest Floor Peace` | `Rooted, slow and steady.` | Cosy Cottage |
| `deep-night-calm` | `Deep Night Calm` | `Awake and still while the world goes quiet.` | Vanilla and Caramel |
| `tender-low-key` | `Tender and Low Key` | `Soft around the edges.` | Malibu |
| `healing-quiet` | `Healing Quiet` | `Something is mending, slowly.` | Vanilla and Caramel |
| `sunday-afternoon-ease` | `Sunday Afternoon Ease` | `Nothing urgent, nowhere to be.` | Vanilla and Caramel |
| `quiet-inner-distance` | `Quiet Inner Distance` | `A little apart from everything.` | Cosy Cottage |
| `missing-someone` | `Missing Someone Softly` | `Someone is on the edge of your thoughts.` | Vanilla and Caramel |
| `bittersweet-still` | `Bittersweet and Still` | `Warm and a little sore, both at once.` | Vanilla and Caramel |
| `nostalgic-haze` | `Nostalgic Haze` | `Faded gold and old photographs.` | Warm Apple Crumble |
| `introspective-blue` | `Introspective Blue` | `Turned inward, deep and quiet.` | Cosy Cottage |
| `heavy-far-away` | `Heavy and Far Away` | `Everything cost a bit more today.` | Cosy Cottage |
| `gently-drifting` | `Gently Drifting Along` | `Not quite here, not quite there.` | Malibu |
| `sharp-buzzing` | `Sharp and Buzzing` | `A lot going on inside at once.` | Malibu |
| `creative-fire` | `Creative Fire` | `Ideas coming faster than you can catch them.` | Warm Apple Crumble |
| `anxious-edge` | `Anxious Edge` | `Running fast, and the brake is hard to find.` | Cosy Cottage |
| `restless-ember` | `Restless Ember Energy` | `Wanting to do something, not sure what yet.` | Warm Apple Crumble |
| `scattered-energy` | `Scattered Energy` | `Everything at once, and none of it clearly.` | Cosy Cottage |
| `social-warmth` | `Social Warmth` | `The good kind of tired, from good company.` | Warm Apple Crumble |
| `cozy-shelter` | `Cozy Shelter` | `Right people, right room.` | Cosy Cottage |
| `quietly-between` | `Quietly In Between` | `Neither here nor pulling away.` | Vanilla and Caramel |

FINAL’s sample lines for some moods (for example Cozy Shelter, Heavy and Far Away) are older; the lines above replace them.


**Sound:** the result’s sound is a random track for now (`DATA_AND_RULES.md` §3.9).

---

## 4. Scents

Four scents with fixed IDs. Scenes store the **ID**, never the name.

| ID | Name |
|---|---|
| 1 | `Warm Apple Crumble` |
| 2 | `Malibu` |
| 3 | `Cosy Cottage` |
| 4 | `Vanilla and Caramel` |

A user can rename a scent on the Remote; the rename is stored as a custom name and shows everywhere, and `Use original name` clears it. Rules: `DATA_AND_RULES.md` §3.4 (name rule) and §3.7 (scents).

---

## 5. Check-in

**Questions:** the 100 questions in `src/data/questions.ts` ship, with their IDs, dimensions and polarity unchanged (scoring depends on them). **16 of them get new wording**, below: change only their `text`. The other 84 keep the wording they have today. `questions/questions.ts` is the app's file with exactly these 16 replaced (copy it over), and `questions/QUESTIONS_ALL.md` lists all 100. FINAL’s 10 sample questions (for example "How much energy do you have right now?") are prototype data and do not ship.

| ID | Today’s text | New text |
|---|---|---|
| e01 | Would you go for a run or cycle right now? | `Does your body feel ready to move right now?` |
| e02 | Could you walk for an hour without stopping? | `Do you feel like you have a lot left in you tonight?` |
| e03 | Would you cook a full meal from scratch tonight? | `Would cooking a proper meal tonight feel easy?` |
| e06 | Could you take the stairs without thinking about it? | `Would a flight of stairs feel easy right now?` |
| e08 | Would you stretch or do yoga right now? | `Would a slow stretch feel good right now?` |
| e10 | Would you eat something nourishing right now? | `Do you feel awake and alert right now?` |
| e12 | Would you go swimming if there was a pool nearby? | `Do you feel like you’ve got some spark left tonight?` |
| e17 | Do you feel exhausted before the day is done? | `Do you feel worn out tonight?` |
| e18 | Do you feel restless like you cannot sit still? | `Do you feel restless, like you can’t sit still?` |
| s11 | Would you forgive someone who hurt you recently? | `Do you feel generous towards the people around you?` |
| m02 | Would you start a new creative project today? | `Would starting something new feel exciting right now?` |
| m05 | Would you read something challenging for pleasure? | `Would a hard book feel like a pleasure right now?` |
| o10 | Could you receive good news without feeling suspicious of it? | `Could good news land easily for you right now?` |
| o20 | Do you feel like something is about to break or give way? | `Do you feel close to your limit right now?` |
| p02 | Would you say your life feels purposeful lately? | `Does your life feel purposeful lately?` |
| p11 | Would you choose to be present in this moment right now? | `Could you give tonight your full attention?` |

If a question’s text in the code doesn’t match the “Today’s text” column, the ID decides: replace the text of that ID. A question is at most 70 characters (3 lines on the card at 200% text); the longest above is 53.

| Where | ID | String |
|---|---|---|
| Home title (before a check-in) | [H-1](prototype/FINAL_screens.html#H-1) | `How are you tonight?` |
| Home line under it | [H-1](prototype/FINAL_screens.html#H-1) | `A few questions, then an atmosphere for your room.` |
| Home button | [H-1](prototype/FINAL_screens.html#H-1) | `Check in` |
| Home button, tonight already has a check-in | [H-2b](prototype/FINAL_screens.html#H-2b) | `Check in again` |
| Home button, unfinished check-in | [H-5](prototype/FINAL_screens.html#H-5) | `Continue` |
| Answer line, left end | [C-1](prototype/FINAL_screens.html#C-1) | `Not at all` |
| Answer line, right end | [C-1](prototype/FINAL_screens.html#C-1) | `Completely` |
| Hint on the first question, first time only (C-2) | [C-1](prototype/FINAL_screens.html#C-1) | `Tap where you’d place yourself` |
| Buttons, questions 1–5 | [C-1](prototype/FINAL_screens.html#C-1) | `Skip` · `Next` |
| Buttons, after the 5th answer and on every later card | [C-3](prototype/FINAL_screens.html#C-3) | `See my mood` · `Keep going for a sharper read` |
| Status line while the orb develops | [C-4](prototype/FINAL_screens.html#C-4) | `Reading your answers…` |
| Result label | [C-5](prototype/FINAL_screens.html#C-5) | `Tonight` |
| Result title and line | [C-5](prototype/FINAL_screens.html#C-5) | the mood’s name and line (§3) |
| Result sound line | [C-5](prototype/FINAL_screens.html#C-5) | `[category] · [track]`, for example `Ambient · Night rain` |
| Result scent line | [C-5](prototype/FINAL_screens.html#C-5) | the scent’s shown name (§4) |
| Result buttons | [C-5](prototype/FINAL_screens.html#C-5) | `Set the scene` · `Not now` |
| After Not now, under the mood name | [H-4](prototype/FINAL_screens.html#H-4) | `Not set yet. You can set it any time.` |
| After Not now, button | [H-4](prototype/FINAL_screens.html#H-4) | `Set the scene` |

The progress circles and × carry no text. No total or count is ever shown.

---

## 6. Screens

The tab bar reads `Library` · `Home` · `Remote` on every tab screen. Me (top right) is an icon with no text.

### 6.1 Home

| State | ID | Element | String |
|---|---|---|---|
| Every Home state | [H-1](prototype/FINAL_screens.html#H-1) | Date, two lines | `[Weekday],` / `[day] [Month]`, for example `Thursday,` / `22 October` |
| A scene set | [H-2](prototype/FINAL_screens.html#H-2) | Label | `Tonight` |
| | [H-2](prototype/FINAL_screens.html#H-2) | Title and line | the scene’s name and line |
| | [H-2](prototype/FINAL_screens.html#H-2) | Bottom row | `Set at [time]`, for example `Set at 21:42`, + the `All` switch |
| Scene made on the Remote | [H-3](prototype/FINAL_screens.html#H-3) | Title, until saved | `New scene` |
| | [H-3](prototype/FINAL_screens.html#H-3) | Line | `Made on the Remote` (placeholder) |
| All off | [H-6](prototype/FINAL_screens.html#H-6) | Bottom row | `Off` |
| All off from 22:00 (not drawn) | H-7 | Title | `Sleep well` (no name in v1) |
| | H-7 | Orb text | `Check in again`, or `Tap to begin` if tonight’s scene didn’t come from a check-in |
| Daytime, 07:00–17:00 (not drawn) | H-8 | Label | `Last night` (last night’s mood, faded) |
| | H-8 | Orb text | `Check in for today` |
| Changed on the Remote after setting (not drawn) | H-9 | Bottom row | `Adjusted at [time]` |

**Label rule** (`DATA_AND_RULES.md` §3.8): a check-in made before the evening reset (17:00) is labelled `Today`, after it `Tonight`. The docs write this as `Today · [mood]` / `Tonight · [mood]`: the label is the first part, and the mood name is the title under it, as in H-2.

### 6.2 Library

| State | ID | Element | String |
|---|---|---|---|
| Every Library tab | [L-1](prototype/FINAL_screens.html#L-1) | Page title | `Library` |
| | [L-1](prototype/FINAL_screens.html#L-1) | Tabs | `Presets` · `Saved` · `Check-ins` |
| Presets | [L-1](prototype/FINAL_screens.html#L-1) | Tile | name · sound line (track name only) · scent line (scent name) |
| Saved | [L-2](prototype/FINAL_screens.html#L-2) | Group headings | `Made by you` · `From check-ins` · `Based on presets` |
| | [L-2](prototype/FINAL_screens.html#L-2) | Second line, Made by you | `[track] · [scent]` |
| | [L-2](prototype/FINAL_screens.html#L-2) | Second line, From check-ins | the night, for example `Thu 22 Oct` |
| | [L-2](prototype/FINAL_screens.html#L-2) | Second line, Based on presets | the preset’s name, for example `Ocean Drift` |
| | [L-3](prototype/FINAL_screens.html#L-3) | ⋯ open | pen and trash icons, no text |
| Edit in the row | [L-4](prototype/FINAL_screens.html#L-4) | Headings | `Sound` · `Scent` |
| | [L-4](prototype/FINAL_screens.html#L-4) | Sound row | `[track]` + `[category]` + › |
| | [L-4](prototype/FINAL_screens.html#L-4) | Scent chips | the 4 scents’ shown names |
| | [L-4](prototype/FINAL_screens.html#L-4) | Buttons | `Cancel` · `Save` |
| Saved, empty | [L-5](prototype/FINAL_screens.html#L-5) | Text and button | `Scenes you save live here.` · `Go to Remote` |
| Check-ins | [L-6](prototype/FINAL_screens.html#L-6) | Month control | `[Month] ▾` with ‹ ›, for example `October ▾` |
| | [L-6](prototype/FINAL_screens.html#L-6) | Weekday letters | `M` `T` `W` `T` `F` `S` `S` |
| | [L-6](prototype/FINAL_screens.html#L-6) | Row second line | `Tonight · 21:42`, `Thu 22 Oct · 21:42` (§9) |
| | [L-6](prototype/FINAL_screens.html#L-6) | Night with 2+ check-ins | heading `Wed 21 Oct` (or `Tonight`); its rows show the time only, for example `22:05` |
| Every month | [L-7](prototype/FINAL_screens.html#L-7) | Year headings, months | `2026`; `Jan` … `Dec` (no page title) |
| Check-ins, empty | [L-8](prototype/FINAL_screens.html#L-8) | Text and button | `Each evening’s check-in shows up here.` · `Check in` |
| This month, none yet | [L-9](prototype/FINAL_screens.html#L-9) | Text and button | `No check-ins yet this month.` (placeholder) · `Check in` |
| A past month with none | [L-10](prototype/FINAL_screens.html#L-10) | Text | `No check-ins in [Month].`, for example `No check-ins in September.` |
| Scene view | [L-12](prototype/FINAL_screens.html#L-12) | Subheading, preset | `Preset` |
| | [L-12](prototype/FINAL_screens.html#L-12) | Subheading, saved | `Saved by you` · `From a check-in · [night]` · `Based on [preset]` |
| | [L-12](prototype/FINAL_screens.html#L-12) | Subheading, check-in | `Tonight · 21:42` or `Thu 22 Oct · 21:42` |
| | [L-12](prototype/FINAL_screens.html#L-12) | Subheading, scene on now | `On now · [subheading]`, for example `On now · Tonight · 21:42` |
| | [L-12](prototype/FINAL_screens.html#L-12) | Line | the scene’s line (§2, §3) |
| | [L-12](prototype/FINAL_screens.html#L-12) | Sound line (a button) | `[category] · [track]`, for example `Ambient · Night rain` |
| | [L-12](prototype/FINAL_screens.html#L-12) | Scent line | the scent’s shown name |
| | [L-12](prototype/FINAL_screens.html#L-12) | Main button (goes once the scene is on) | `Set the scene` |
| | [L-12](prototype/FINAL_screens.html#L-12) | Check-in’s view, text button | `Save as a scene` |
| | [L-12](prototype/FINAL_screens.html#L-12) | First time only | `Swipe for the next one` |
| Sounds screen | [L-13](prototype/FINAL_screens.html#L-13) | Title | `Sound` |
| | [L-13](prototype/FINAL_screens.html#L-13) | Line under it | `For [scene] · now [track]` |
| | [L-13](prototype/FINAL_screens.html#L-13) | Search placeholder | `Search sounds` |
| | [L-13](prototype/FINAL_screens.html#L-13) | Tabs | `Ambient` · `Music` |
| | [L-13](prototype/FINAL_screens.html#L-13) | Current track’s status | `In this scene` |
| | [L-13b](prototype/FINAL_screens.html#L-13b) | Chosen track’s status | `Chosen` |
| | [L-13b](prototype/FINAL_screens.html#L-13b) | Button | `Choose [track]` |
| | [L-13c](prototype/FINAL_screens.html#L-13c) | Search result, under the name | `Ambient` or `Music` |
| | [L-13d](prototype/FINAL_screens.html#L-13d) | Nothing found | `Nothing matches “[query]”.` |
| | [L-13e](prototype/FINAL_screens.html#L-13e) | Playing row’s status | `Playing on the lamp` |
| | [L-13f](prototype/FINAL_screens.html#L-13f) | Empty category | `No tracks here yet.` |
| | [L-13g](prototype/FINAL_screens.html#L-13g) | Under the tapped row | `Sound unavailable · Try again` |
| Naming sheet | [L-15](prototype/FINAL_screens.html#L-15) | Title | `Save as a scene` |
| | [L-15](prototype/FINAL_screens.html#L-15) | Field starts with | the mood’s name, numbered if taken (§7) |
| | [L-15](prototype/FINAL_screens.html#L-15) | Buttons | `Cancel` · `Save` |

### 6.3 Remote

| State | ID | Element | String |
|---|---|---|---|
| Every Remote state | [R-1](prototype/FINAL_screens.html#R-1) | Page title | `Remote` |
| | [R-1](prototype/FINAL_screens.html#R-1) | Connection line | always shown (§8.2) |
| Nothing playing | [R-1](prototype/FINAL_screens.html#R-1) | Scene line | `Nothing on yet` + `All` |
| | [R-1](prototype/FINAL_screens.html#R-1) | Part headings | `Light ›` · `Sound ›` · `Scent ›` |
| | [R-1](prototype/FINAL_screens.html#R-1) | Light key | `Cycle` |
| | [R-1](prototype/FINAL_screens.html#R-1) | Sound, empty | `No sound yet` + `Choose` |
| | [R-1](prototype/FINAL_screens.html#R-1) | Scent, empty | `No scent yet` + `Choose` |
| Building | [R-2](prototype/FINAL_screens.html#R-2) | Scene line | `New scene` |
| | [R-2](prototype/FINAL_screens.html#R-2) | Bottom button, not all three parts chosen (disabled) | `Pick light, sound, scent` |
| | [R-2](prototype/FINAL_screens.html#R-2) | Bottom button, all three chosen | `Set the scene` |
| A scene playing | [R-3](prototype/FINAL_screens.html#R-3) | Scene line | the scene’s name |
| | [R-3](prototype/FINAL_screens.html#R-3) | Sound card | `[track]` + `[category]`, for example `Night rain` + `Ambient` |
| | [R-3](prototype/FINAL_screens.html#R-3) | Scent card | the scent’s shown name |
| Something to save | [R-3b](prototype/FINAL_screens.html#R-3b) | Bottom group | `Undo` · `Save` · `Redo` |
| Cycling | [R-3c](prototype/FINAL_screens.html#R-3c) | Light key | `Cycling` |
| | [R-3c](prototype/FINAL_screens.html#R-3c) | Speed slider ends | `Slow` · `Fast` |
| Dragging brightness or volume | [R-3d](prototype/FINAL_screens.html#R-3d) | Value | `[n]%`, for example `72%` (brightness 5–100) or `50%` (volume) |
| Light screen | [R-4](prototype/FINAL_screens.html#R-4) | Title and subtitle | `Light` · the scene’s name |
| | [R-4](prototype/FINAL_screens.html#R-4) | Hint | `Round for the colour, toward the centre for whiter.` |
| | [R-4](prototype/FINAL_screens.html#R-4) | Slider and its ends | `Colour range` · `Varied` · `Close` |
| Sound screen | [R-5](prototype/FINAL_screens.html#R-5) | Title and subtitle | `Sound` · the scene’s name |
| | [R-5](prototype/FINAL_screens.html#R-5) | Tabs | `Ambient` · `Music` |
| | [R-5](prototype/FINAL_screens.html#R-5) | Track row | `[track]` + length, for example `3:02` (lengths come from the SD card, §9) |
| | [R-5c](prototype/FINAL_screens.html#R-5c) | Above the player | `Sound unavailable · Try again` |
| Scent screen | [R-6](prototype/FINAL_screens.html#R-6) | Title and subtitle | `Scent` · the scene’s name |
| | [R-6](prototype/FINAL_screens.html#R-6) | Rows | the 4 scents’ shown names; a renamed scent shows its original name underneath |
| | [R-6](prototype/FINAL_screens.html#R-6) | ⋯ actions | icons only: pen (Rename), return arrow (Use original name) |
| Scent rename | [R-6b](prototype/FINAL_screens.html#R-6b) | Field | the scent’s name, with ✓ and ✕ (the name rule, §7) |
| Save: naming | [R-7a](prototype/FINAL_screens.html#R-7a) | Button | `Done` (disabled while the field is empty) |
| | [R-7a](prototype/FINAL_screens.html#R-7a) | Suggested name | from scratch `My scene`; a preset or check-in `[name] 2` |

The Remote has no message bars. Its switches carry no On or Off words.

---

## 7. Name rule

One rule for every name field: saved scenes (L-4, L-15, R-7) and scent renames (R-6b). Full rule: `DATA_AND_RULES.md` §3.4.

| Case | ID | String |
|---|---|---|
| 25 to 30 characters | [R-7b](prototype/FINAL_screens.html#R-7b) | `[n] of 30`, for example `27 of 30` |
| The name is taken | [R-7c](prototype/FINAL_screens.html#R-7c), [L-4b](prototype/FINAL_screens.html#L-4b) | `“[name]” is taken · saves as “[numbered name]”`, for example `“Golden Hour” is taken · saves as “Golden Hour 2”` (placeholder) |
| Numbering | | `Golden Hour` → `Golden Hour 2`; `Golden Hour 2` → `Golden Hour 3` |

Nothing shows below 25 characters unless the name is taken.

---

## 8. Messages, connection and errors

### 8.1 Message bars (X-1)

One at a time, at the bottom, for 5 s. Only two carry **Undo**. Never on the Remote.

| When | ID | String | Undo |
|---|---|---|---|
| Set the scene, both parts arrived | [X-1c](prototype/FINAL_screens.html#X-1c) | `Sent to your room` | yes |
| Set the scene, light failed | [X-1a](prototype/FINAL_screens.html#X-1a) | `Sound sent · Light unavailable` | no |
| Set the scene, sound failed | [X-1b](prototype/FINAL_screens.html#X-1b) | `Light sent · Sound unavailable` | no |
| A saved scene deleted | [L-3](prototype/FINAL_screens.html#L-3) | `Scene deleted` | yes |
| In-row edit saved, sound or scent changed | [L-4](prototype/FINAL_screens.html#L-4) | `Changes saved` | no |
| In-row edit saved, only the name changed | [L-4](prototype/FINAL_screens.html#L-4) | `Renamed` | no |
| Save as a scene | [L-15](prototype/FINAL_screens.html#L-15) | `Saved` | no |

The Undo button reads `Undo`. Scent is never listed as sent (the app sends nothing for it).

### 8.2 Connection line (X-2)

Top right, beside Me. On the Remote it always shows; on Home and Library only when something is wrong. Where there is an action, the whole line is the button.

| State | Where | String |
|---|---|---|
| Connecting | Remote | `Connecting…` |
| Connected | Remote | `Connected` |
| One part connected | Remote | `Partly connected` |
| Link dropped, retrying | Remote | `Reconnecting…` |
| Can’t reach the lamp (also: in use by another phone) | every tab | `Can’t connect · Try again` |
| Bluetooth off | every tab | `Bluetooth is off · Turn on` |
| Permission refused | every tab | `Allow nearby devices · Open settings` |
| Light failed | Home, Library | `Light unavailable · Try again` |
| Sound failed | Home, Library | `Sound unavailable · Try again` |

Drawn as [X-2a](prototype/FINAL_screens.html#X-2a) to [X-2l](prototype/FINAL_screens.html#X-2l).

### 8.3 A part unavailable on the Remote (X-3)

The part’s controls give way to one row: `Light unavailable` + `Try again` ([X-3b](prototype/FINAL_screens.html#X-3b)) or `Sound unavailable` + `Try again` ([X-3a](prototype/FINAL_screens.html#X-3a)). The connection line reads `Partly connected`.

### 8.4 Set the scene can’t reach the lamp (X-4)

One line right above the button; the button becomes the fix. On the Remote there is no room above the button, so the connection line carries the message and the button reads `Try again` ([X-4e](prototype/FINAL_screens.html#X-4e)).

| Case | ID | Line above the button | Button |
|---|---|---|---|
| Sending (first time: waits under Android’s prompt) | [X-4a](prototype/FINAL_screens.html#X-4a) | | `Setting the scene…` |
| Can’t reach it | [X-4b](prototype/FINAL_screens.html#X-4b) | `Can’t connect. Move closer and try again.` | `Try again` |
| Bluetooth off | [X-4c](prototype/FINAL_screens.html#X-4c) | `Bluetooth is off.` | `Turn on Bluetooth` |
| Permission refused (not drawn) | | `Allow nearby devices to connect.` | `Open settings` |

The Library scene view uses the same lines and buttons ([X-4d](prototype/FINAL_screens.html#X-4d)).

### 8.5 Android’s own dialogs (X-5)

Android writes these; the app doesn’t set their text. Shown here so you can recognise them.

| Dialog | ID | Android’s text | Buttons |
|---|---|---|---|
| Nearby devices permission | [X-5a](prototype/FINAL_screens.html#X-5a) | `Allow Wellness Lamp to find, connect to, and determine the relative position of nearby devices?` | `Allow` · `Don’t allow` |
| Turn on Bluetooth | [X-5b](prototype/FINAL_screens.html#X-5b) | `Wellness Lamp wants to turn on Bluetooth` | `Allow` · `Deny` |

**Developer task:** Android fills in the app’s label, which must read `Wellness Lamp`. Today `android/app/src/main/res/values/strings.xml` sets `app_name` to `WellnessLamp`; change it.

---

## 9. Sound

**Every track name in FINAL is a placeholder, and none of them ship.**

The sounds are the same files as in today’s app: the tracks on the speaker’s SD card, 6 folders × 5 tracks. Today’s app has no track names. It shows only a folder label (Rain, Forest, Ocean, Fire, Night, Music) and file numbers 1 to 5. **The only change in the redesign is that the tracks are split into two categories, `Ambient` and `Music`.** These are the two tabs on L-13 and R-5, and the category shown beside a track. Folders 1 to 5 are Ambient and folder 6 is Music (`DATA_AND_RULES.md` §6).

**Developer task: name every track.** Read the card and give each file a name, its category and its length in the sound catalog (`DATA_AND_RULES.md` §6). Ship that table as data. It is the only source for what the app shows.

FINAL’s 28 names below were made up so the screens could be laid out with realistic text lengths. Replace all of them.

| Category | Placeholder names (do not ship) |
|---|---|
| Ambient (16) | Night rain · Fireplace · Slow waves · Morning garden · Evening birds · Distant thunder · Forest · Rain on a tin roof far away · Wind in the pines · Creek over stones · Snowfall hush · Café murmur · Train at night · Ceiling fan · Harbour bells · Soft static |
| Music (12) | Warm evening · Slow piano · Strings at dusk · Acoustic morning · Lo-fi study · Ambient pads · Low jazz trio · Lullaby guitar · Sitar evening · Rubab by the window · Music box · Cello, slowly |

Track lengths in FINAL (`3:02` and so on) are placeholders too. A length is written `m:ss`.

---

## 10. Time and date formats

Times follow the phone’s 12/24-hour setting (`DATA_AND_RULES.md` §3.8). FINAL shows 24-hour; the examples below do too. Days and months are in English, as on FINAL.

| Use | Format | Example |
|---|---|---|
| Home date, line 1 | `[Weekday],` (full day name + comma) | `Thursday,` |
| Home date, line 2 | `[day] [Month]` (no leading zero, full month) | `22 October` |
| Time of day | `[time]` | `21:42` |
| A night (Saved row, check-in row, night heading, scene view) | `[Wkd] [day] [Mon]`, three-letter day and month | `Thu 22 Oct` |
| A night in another year | `[Wkd] [day] [Mon] [year]` | `Sat 20 Dec 2025` |
| Tonight’s night | `Tonight` in place of the date | `Tonight · 21:42` |
| Check-in row second line | `[night] · [time]` | `Thu 22 Oct · 21:42` |
| Month control (L-6) | `[Month] ▾`; add the year when it isn’t this year | `October ▾`, `December 2025 ▾` |
| Month in the empty state (L-10) | `[Month]` | `No check-ins in September.` |
| Year heading (L-7) | `[year]` | `2026` |
| Weekday letters (L-6), Monday first | | `M T W T F S S` |
| Percent | `[n]%` | `72%` |
| Track length | `m:ss` | `3:02` |

A check-in’s **night** is the evening it belongs to, not the clock date: one made before 07:00 belongs to the night before (`DATA_AND_RULES.md` §3.8).

---

## 11. Screen-reader text

v1 has no screen-reader work: no labels, hints or announcements to write (out of scope, `START_HERE.md`). FINAL’s spoken announcements and `aria-label`s are prototype-only.
