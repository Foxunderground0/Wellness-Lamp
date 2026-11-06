# Audit: FINAL prototype + screens (3 Nov 2026)

**Method.** Impeccable `audit` (technical, code-level). Impeccable's `detect` was run on the three tab documents the build produces (Home, Library, Remote), then a code-level pass over their HTML/CSS/JS with the hidden scaffolding (`section.lab`, `section.lx`, `#vars`) removed. Each candidate was checked against the rule that actually applies. **Not rendered**: no browser runs in this session, so layout, gestures, focus order and runtime-set values were not exercised. Items that need a visual check are marked *verify*.

## Score (assessable dimensions)

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 3 | Labels, live regions and reduced motion are in place; three live controls sit below 48dp |
| 2 | Performance | n/a | A prototype; the RN build decides this (orb = one reused WebGL canvas) |
| 3 | Theming | 2 | ~570 raw hex values vs ~1,050 `var()` uses; fine for a prototype; `tokens.json` must carry the final values |
| 4 | Platform conformance (Android) | 3 | 3-destination bottom nav, system permission/Bluetooth prompts, Back documented; rejected variant code still in the files |
| 5 | Adaptivity | n/a | Fixed 360 × 800 frame, portrait only (spec §4); 200% text can't be tested in the prototype |

## Findings

**P1: rejected variants are still in the code** (systemic, Conformance / Integrity)
- `build_final.py` hides the variations panel, motion lab and exploration rounds with `display:none` but leaves their markup and CSS. Most raw audit hits came from them (`.lxp`, `.r4`, `.xt`, `.vtile`, `.nv-*`, `[data-tog="label"]`, `.wheel .wl`, `.cap2`, `.irow`).
- A coding agent reading the HTML sees every rejected alternative.
- **Fix:** the stripped copy into `handoff/prototype/` (HANDOFF_CHECKLIST, "Before handing off").

**P2: touch targets below 48dp on live controls** (Accessibility) **Accepted as is (Rida, 3 Nov): no change for v1.**
- Cycle colours chip `.cyb`: 40 px tall (Remote)
- Undo / Redo arrows `.rock button`: 48 × 40 px (Remote, bottom group)
- Sound / scent chips in the Library's in-row edit `.ch5`: 36 px
- *Verify:* `.bscene .savet` (30 px) and `.hrow1 .savet` (34 px). Possibly variant-only; the base Save text button is 48 px.
- **Fix:** 48 px hit area (visual size can stay; pad the hit area). Record as a rule in DESIGN_SYSTEM.

**P2: hard-coded colours** (Theming)
- Raw hex sits next to tokens, e.g. the charcoal `#3B342E` fill applied with `!important` overrides and `#d6cdbe` chip borders.
- **Fix:** no prototype change; extract the final values into `tokens.json` with semantic names so the RN build doesn't copy raw hex.

**P3: small text** (Accessibility)
- Check-ins calendar: weekday letters 11 px, day numbers 12 px; year view months 11 px. Readable at this size; note that they scale with system text in the app (sp).

**P3: slider values** (Accessibility, *verify*)
- Most sliders set `aria-valuenow` at runtime (10 in Home, 11 in Remote). The Cycle speed slider and the colour wheel (`.gwo`) show no value in the static markup.
- Spec §2 asks for band words (slow / medium / fast) as the value text. Confirm at runtime; carry it into the RN spec either way.

**P3: icon-only buttons without a label** (*verify*)
- The Library scene view's `pprev` / `pnext` (hidden; content set by script) and the preset tile `pc7` (canvas inside). Check that they get a name at runtime.

## False positives (checked, no action)

- **Cream background:** a deliberate brand ground (the brief wins).
- **Inactive Library tabs `#8F867B`:** overridden by a later rule to `var(--mut)` `#605A53` (6.15:1).
- **Clipped overflow:** the phone frames clip by design.
- **Glow / radial halo:** the orb.
- **`#ECEBE7` on white:** a hidden dark test frame.
- **Message bar `#F7F3EA` on cream:** its dark fill is set through a variable.
- **Scent row "flush padding":** the row is 60 px, centred.

## What works

- Every icon button in Home has a label.
- Live regions (`aria-live` / `role="status"`) announce Undone/Redone, Saved and connection changes.
- Reduced motion is handled on every tab (19 rules in Home).
- The connection, name and empty states are consistent across tabs.

## Recommended next steps

1. **[P1]** Stripped `handoff/prototype/` copy (building chat)
2. **[P2]** 48 px hit areas for the Cycle chip, Undo/Redo and the edit chips, in the prototype and as a DESIGN_SYSTEM rule
3. **[P2]** Semantic tokens in `tokens.json`
4. **[P3]** Runtime check of slider values and the three unlabelled buttons in a browser
