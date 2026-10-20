# Rift Rumble Phase 7: hero identity, arenas, new enemies, modes and visual polish

All designs come from the user's art pack. The five extra enemies use the pack's `enemy_references` 09–13 (Aerial Drone, Elite Ronin, Corrupted Hero, Rift Minion and Rift Lord). They are drawn as new vector characters in the same cel-shaded pipeline, baked to PNGs (`assets/<id>/`), with no copied pixels.

## Signature hero mechanics

Each hero now has one signature mechanic, one strength and one weakness. They appear in three places:
- on the select screen
- in the pause move list
- as a gauge under the hero panel during play

| Hero | Signature | Strength | Weakness |
|---|---|---|---|
| Kenji Kaboom | Heat | Hits build Heat. At full Heat, the next 4 strikes explode for +4 damage and 40% more knockback. | Takes 10% more damage while Heat is above half |
| Lila Thunderfist | Static | Running or dashing charges Static. A full charge chains lightning into 2 more enemies. | Launched 12% farther |
| Mochi Monk | Iron Body | Super armour while attacking or casting. He doesn't flinch until 14 damage breaks it, and it reforms after 4 s. | No air dash, and dashes are 30% shorter |
| Nyanja | Nine Lives | Dashing through an attack slows time and arms a 1.6× critical hit. | Takes 15% more damage |
| Rokuro Ink | Ink Marks | Strikes leave up to 5 marks. Finishers detonate them for +3 damage and +8% knockback each. | Hits that don't detonate deal 10% less. Marks fade after 4 s. |
| Hana Bloom | Bloom | A full Bloom heals 2.2% per second for 5 s, and petals cut nearby enemies. | Her hits knock back 10% less |
| Captain Comet | Flight | After his jumps, hold jump to fly and steer for 2.4 s. Air attacks deal +15%. | Ground attacks deal 10% less |
| Midnight Raccoon | Scrap Turret | Every 8 hits builds a turret that fires for 6 s. | Blocked hits chip twice as much damage |
| Skate Surge | Momentum | Rolling one way builds up to +40% speed, +30% damage and +25% knockback. | 15% slower with no Momentum, and turning or getting hit loses it |
| Tin Titan | Overheat | Plating blocks one hit every 6 s. Every 4th special vents a steam blast. | Specials lock for 1.5 s after a vent |
| Grandma Gravity | Gravity Control | A 200 px field halves enemy gravity and slows enemies by 30%. Launched enemies float. Hold guard in the air to hover. Airborne enemies take +15%. | Slowest runner, and launched 10% farther |
| Jaguar Jinx | Frenzy | Quick hits stack up to 5, each making her attacks 8% faster. Claw strikes make enemies bleed. | Takes 12% more damage at 3+ Frenzy |

## Arena mechanics

| Universe | Mechanic |
|---|---|
| Ki Fighters | **Energy zones.** Two glowing rings. Inside one, you deal +15% damage and your super meter fills by 12 per second. Enemies inside also hit harder. Every 12 s one zone moves, with a 1.5 s flicker warning. |
| Shinobi Clan | **Shadow zones**, at both ends of the roof. Inside one, you are hidden: enemies react 0.25 s slower, casters hold fire, and ground enemies more than 110 px away lose track of you. Your first melee strike from the shadows is a 1.5× ambush. |
| Caped League | **Destructibles:** two crates and a hazard barrel. Attacks and projectiles damage them, and enemies launched into them smash them. When one breaks it bursts into nearby enemies (the barrel bigger, and it can catch you). It may drop a health (−15%) or meter (+50) pickup, and it rebuilds after 12 s. |
| Mighty Vanguard | **Low gravity:** two columns at 40% gravity for everyone, including the hero, enemies and launched bodies. |

## The five new enemies

| Enemy | Role | What is different |
|---|---|---|
| Rift Minion | grunt, from wave 3 | Small (54 tall), 30% faster, fragile (60% damage). Arrives in pairs. |
| Elite Ronin | grunt, from wave 6 | Hits 35% harder and is heavier. Its katana reaches 26 px farther. It parries close attacks (35%, at most every 1.4 s). |
| Aerial Drone | shooter, from wave 4 | A flying cube that fires red lasers. Drawn directly, because a rigid machine needs no skeleton. |
| Corrupted Hero | heavy, from wave 7 | 1.7× speed. Telegraphs for 0.38 s, then rift-dashes through you. |
| **Rift Lord** | final boss | Appears in endless waves 20 and 40, the Boss Rush finale and the Giant Slayer challenge. It has 3 phases and 5 attacks: Rift Slash, Void Rain, Rift Summon (brings minions), Rift Beam and Rift Descent. All are telegraphed, and all of the boss systems from Phase 4 still apply. |

## Modes

**Boss Rush**
- Four bosses in a row: your universe's boss, the other two bosses, then the Rift Lord.
- Between bosses, your damage is halved and you pick a power-up (rare or better).
- Clear time is recorded.

**Challenges** (six, with fixed rules and no power-ups):
- **Perfect Defence:** only Counter Bursts from perfect guards deal damage. Clear 3 waves.
- **Fists Only:** specials, supers and awakening are off. Clear 5 waves.
- **One Life:** clear 6 waves with a single life.
- **Sky Fighter:** only airborne hits count. Clear 4 waves.
- **Blitz:** clear 4 waves within 100 s.
- **Giant Slayer:** face the Rift Lord with one life.

**Records**
- Results are saved in the existing `rrProfile1` profile, under `modes`.
- They are cleaned when loaded: unknown challenges are dropped, numbers are validated, and clears are capped at tries.
- They appear in the Profile and on each challenge card.

## Visual polish

**Characters**
- Every fighter gets a per-universe rim light: warm sun for Ki, moonlight for Shinobi, cyan and magenta neon for Caped, blue and violet for Mighty.
- The rim comes from a tinted silhouette drawn one step toward each light, behind the body.
- They also get squash and stretch on landing and jumping, and a soft shadow that follows them into the air.

**Hits and knockouts**
- Hits get impact bursts and shockwaves, and heavy hits add a brief manga-style impact frame (scaled by the flash setting).
- Fast-launched enemies leave a coloured trail.
- Knockouts get a screen-edge blast beam, rings, debris and a short slow-motion.

**Atmosphere**
- Ki: god rays. Shinobi: ground fog. Caped: rain and neon haze. Mighty: nebula glow.
- Foreground bokeh adds depth.

**Smoothness**
- Positions and the camera are interpolated between the fixed 1/120 s simulation steps.
- High-refresh displays get in-between frames instead of repeated ones.

**HUD**
- Slanted panels styled after the art pack's HUD reference.
- An enemy portrait panel (name, damage %, KO-risk bar, personality), like the reference panel.
- A signature-mechanic gauge.
- Mode labels and timers.

**Title and select**
- Laid out like the concept sheet: slanted brush logo with リフトランブル, universe banners with emblems (気 忍 ★ 力), and a 12-hero strip with Japanese names and roles.
- The select screen has slanted universe tabs, signature chips, and a strength / weakness / arena panel.

**Settings**
- A new Graphics setting: Auto (the default), High or Standard. It is saved with the other settings.
- Standard turns off the rim lighting and atmosphere passes.
- Auto starts with them on. If drawing averages more than 12 ms a frame for about 2 s of play, it turns them off for the rest of the session and tells the player.

**Bug fixed:** delayed effect rings (negative start time, used by the boss-defeat effect) could throw a negative-radius canvas error when drawn.

## Profiling and the lighting pass

The first version of the rim light drew every fighter into offscreen canvases, then composited a rim and a shading gradient over it. Profiling a busy wave (7–8 enemies, specials firing, headless Chromium, software rendering) showed it took drawing from about 3 ms to about 20–23 ms a frame, and `drawImage` was 36% of main-thread time. It was replaced with the tinted-silhouette method, which reuses the art pipeline's cached tinted textures.

Measured afterwards, same scene, in paired runs:

| Setup | Graphics: Standard (draw ms/frame) | Graphics: High (draw ms/frame) |
|---|---|---|
| Desktop 1280×720 | 3.5 | 3.6 |
| Desktop, CPU ÷4 | 17.1 | 24.5 |
| Phone emulation 844×390 @2x, CPU ÷6 | 26.6 | 36.0 |

**What this does and doesn't show:**
- The game's own update step stays around 1 ms on desktop.
- These figures come from headless software rendering, not a real GPU or phone.
- Auto mode exists because the cost on weak devices is real but can't be measured here.

## Tests

`tools/browser-tests-phase7.js` has 43 checks, all passing in Chromium:
- **Title and select**
  - title strip and portraits
  - hero-to-select flow
- **Heroes**
  - every hero's mechanic, strength and weakness, measured in game
- **Arenas**
  - all four arena mechanics
- **Enemies**
  - new-enemy art status
  - when each new enemy can first appear
  - each new enemy's stats and behaviour
  - all five Rift Lord attacks running telegraph → attack → recovery
- **Modes**
  - the complete Boss Rush flow
  - all six challenges
  - record persistence and cleaning
- **Visuals**
  - impact and KO effects
  - HUD panels
  - interpolation
  - the Graphics setting, including Auto switching lighting off after sustained slow frames
- **Phone**
  - title layout at 390 px
- no page errors

**Earlier suites**
- They all still run. Three checks were updated for intended Phase 7 changes:
  - The PNG check now expects 25 sprite sets instead of 21, because of the four new rigged enemies.
  - The wave-10 roster check turns off the new-enemy mix, so it still sees each universe's own enemy.
  - The Afterimage dash check now reads the dash time after one fixed 1/120 s step instead of sampling animation frames. The old reading drifted with frame timing.
- The two headless simulation scripts got small DOM-mock additions (`style.setProperty`, `children`, and so on).

## Limits and unverified items

- **Balance:** all numbers were checked by tests and bots, not by human players.
- **Safari/WebKit, real phones, real GPUs and gamepads:** not tested here (only Chromium is installed). The lighting pass costs extra drawing per fighter on weak devices, so Graphics: Auto and Standard exist for them.
- **Visual standard:** this is a 2D canvas game drawn with vector parts. The polish brings it closer to a modern look, but it is not comparable to commercial engines with hand-animated sprites, shaders or 3D lighting. The rim light is an approximation (a tinted, offset silhouette), not real lighting.
- **Rift Lord:** it uses the shared skeleton, so its animation is posed, not hand-animated frame by frame.
