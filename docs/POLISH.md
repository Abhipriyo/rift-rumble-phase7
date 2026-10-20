# Rift Rumble polish and validation (Phase 6)

## How to run

- **Play:** open `rift-rumble.html` from a local web server, with the `assets/` folder beside it. For example, run `python3 -m http.server` and visit `http://localhost:8000/rift-rumble.html`.
  - Opened as a plain file, it still runs, but uses the built-in renderer instead of the PNG sprites.
- **Debug view:** add `?debug` to the URL, or press <kbd>`</kbd> during play.
- **Rebuild from source:**
  1. Run `src/build.sh` (Python 3 + Node + Playwright).
  2. It applies `integrate.py → roster.py → final.py → phase4.py → phase5.py → phase6.py` to the base file.
  3. It then syntax-checks the result and re-exports the 259 PNG sprites.
- **Tests:** run `node tools/browser-tests-phase6.js` (and the phase 1–5 suites) with a local server on port 8765.

## Settings

The Settings screen opens from the title screen and the pause menu.

**How settings are stored:**
- In `localStorage` under the key `rrSettings1`, in this browser only.
- Every field is validated on load:
  - Volumes are clamped to 0–100.
  - Unknown modes revert to their defaults.
  - Reserved or duplicate keys are dropped.
- Unreadable data falls back to the defaults, and the screen says so.
- If storage is blocked, settings last for the current visit only.

| Setting | What it actually changes |
|---|---|
| Master / Effects / Ambience volume | The gains of three real Web Audio buses: master → effects, master → ambience. The SFX button still mutes everything. |
| Screen shake: Full / Reduced / Off | Multiplies every shake by 1 / 0.4 / 0 |
| Screen flashes: Full / Reduced | Multiplies the white flash overlay by 1 / 0.15 |
| Difficulty: Easy / Normal / Hard | Enemy damage ×0.7 / ×1 / ×1.25. Enemy reaction time +0.08 s / 0 / −0.04 s (Hard never goes below 0.2 s). Boss telegraphs ×1.25 / ×1 / ×0.9 (never under 0.4 s; the Counter stays at least 0.3 s). Changing difficulty mid-run applies to enemies that spawn afterwards. |
| Keyboard | Every action can be rebound. See below. |

**Comfort defaults:** shake and flash follow the device's reduce-motion setting (Off and Reduced when reduce-motion is on).

**Key rebinding:**
- Press "Change", then press a key. The new key replaces that action's first key; alternate keys are kept.
- If the key already belongs to another action, it is removed from that action. If that action had only that key, the two actions swap.
- Esc, P, Tab, Enter, `, modifier keys and F-keys are reserved.
- Esc cancels a pending change.
- "Reset keys to default" restores every binding.
- The Controls screen and the tutorial hints show the current keys.
- Touch and controller layouts are fixed.

**Browser shortcuts:** key presses with Ctrl, Cmd or Alt held are never intercepted, so browser shortcuts keep working during play.

## Audio

All sound is generated with Web Audio. No audio files were added.

**New sound effects:**
- Separate sounds for jabs, kicks, heavy swings, launchers and meteor spikes.
- Blocks.
- Combo milestones at 10, 20, 35 and 50 hits.
- One accent per special-move type (9 types).
- Boss intro, boss phase roar, and a warning beep when a boss starts a telegraph.
- Victory, defeat and medal unlocks.

**Limiter:**
- The same sound cannot retrigger within 35 ms.
- At most 24 voices play at once.
- The old cap of 15 sounds per frame stays.
- Fixed a bug: that per-frame counter used to reset only during gameplay, so menus fell silent after 15 clicks. It now resets every frame.

**Ambience:**
- A small generative soundscape for each universe, scheduled ahead on the audio clock:
  - Ki: drone, wind and bells.
  - Shinobi: wind and koto-like plucks.
  - Cape: city hum and synth arpeggios.
  - Mighty: space pad and sparkles.
- It plays from the hero select screen onward, ducks to 40% while paused, and stops at 0% volume or when muted.
- **Limitation:** it is ambience, not composed music.

## Timing, pausing, performance

**Fixed timestep:**
- Gameplay now advances in fixed 1/120 s steps from an accumulator.
- At most 8 steps run per frame. A frame longer than 0.1 s is clamped, so a very slow device runs the game slower rather than skipping through collisions.
- A test runs the same 2 s of input at 30, 60 and 144 Hz. All three give identical position and game time, each from exactly 240 steps.

**Pausing:**
- Switching tabs or hiding the window pauses the game, suspends the audio context and releases held keys. Coming back resumes audio, but the game stays paused until you choose Resume.
- Losing window focus already paused the game.
- While paused, game time does not advance (tested).

**Caps:** projectiles 140, effects 160, score pop-ups 40, particles 500 (unchanged).

**Debug view:** shows the measured update and render time per frame, fps, and simulation steps per frame.

### Profiling (before deciding on optimisations)

Measured in headless Chromium with 7 enemies on wave 12, specials firing (`tools/perf6.js`, `tools/prof6.js`):

| Setup | Game update (ms/frame) | Game render calls (ms/frame) | Frame rate seen |
|---|---|---|---|
| Desktop 1280×720, no throttling | 0.98 | 2.57 | 35 fps |
| Desktop, CPU ÷4 | 6.9 | 16.3 | 6.5 fps |
| Phone 844×390 @2x, CPU ÷6 | 10.3 | 27.0 | 3.3 fps |

**What the CPU profile shows:**
- About 90% of main-thread time is native work outside the game's JavaScript ("(program)"): headless Chromium rasterises the canvas in software, without a GPU.
- The game's own JavaScript (update plus draw calls) is a few milliseconds per frame on desktop.
- So the low headless frame rates are not evidence about real devices, and no rendering rewrite was made on that basis.
- Real-GPU and real-phone frame rates are **not measured**.

## Accessibility

- All new controls are real buttons, range inputs and labelled groups.
- Toggle states use `aria-pressed`, and the key-change result is announced through `aria-live`.
- Focus moves to Done when Settings opens, Esc closes it, and focus returns to Resume (or the Settings button).
- The focus outline is a 3 px solid ring (tested).
- **Phone layout:** at 390 px wide there is no sideways scrolling, and every control is at least 32 px tall (tested).
- **Limitation:** focus is not trapped inside the Settings panel, so Tab can leave the game box and reach the AI Lab below it.

## Tests

The Phase 6 suite (`tools/browser-tests-phase6.js`) has 31 checks, all passing in Chromium:
- defaults and reduced-motion defaults
- sliders driving the real gain nodes
- shake and flash multipliers
- persistence across a reload
- difficulty effects on spawned enemies and boss telegraphs, including the 0.2 s floor
- rebinding, swapping, reserved keys, the Esc flow, a remapped key working in play, hints updating, Ctrl shortcuts not intercepted, reset
- voice limiter and retrigger cooldown
- ambience start, duck, stop and mute
- fixed-timestep equivalence
- pause and hidden-tab behaviour
- effect caps
- perf counters
- corrupt and invalid settings
- phone layout
- keyboard focus
- no page errors

**Regression:** the phase 1–3 (24/24), phase 4 (24/24) and phase 5 (26/26) suites pass, and both headless simulations (12 heroes, bosses) report 0 errors.

## Not verified

- **Safari / WebKit:** only Chromium is installed in this environment. Web Audio scheduling and `visibilitychange` behaviour on iOS Safari are untested.
- **Real phones and real GPUs:** only Chromium mobile emulation was used.
- **Gamepads:** no physical controller was available. Gamepad input code is unchanged in this phase.
- **Sound quality:** buses, gains and voice counts are tested, but no one has listened to the mix on speakers or headphones. Volume balance may need tuning by ear.
- **Difficulty balance:** the multipliers are applied and tested, but the feel of Easy and Hard has only been checked by bot runs, not by human players.
