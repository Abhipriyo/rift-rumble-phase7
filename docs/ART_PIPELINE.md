# Rift Rumble art pipeline

## Roster (locked to the Rift Rumble art sheet)

Only the 12 heroes and 8 enemies on the art sheet exist in the game.

**Heroes**

| Universe | Hero | Role |
|---|---|---|
| Ki Fighters | Kenji Kaboom | Brawler |
| Ki Fighters | Lila Thunderfist | Speedster |
| Ki Fighters | Mochi Monk | Heavy hitter |
| Shinobi Clan | Nyanja | Agile ninja |
| Shinobi Clan | Rokuro Ink | Swordsman |
| Shinobi Clan | Hana Bloom | Sword sorcerer |
| Caped League | Captain Comet | Flying fighter |
| Caped League | Midnight Raccoon | Gadget fighter |
| Caped League | Skate Surge | Speedster |
| Mighty Vanguard | Tin Titan | Armored blaster |
| Mighty Vanguard | Grandma Gravity | Gravity sorcerer |
| Mighty Vanguard | Jaguar Jinx | Claws fighter |

**Enemy slots**

Each slot keeps the hitbox, flight and stats it had before the redesign. Only the identity changed.

| Universe (arena) | Grunt | Shooter | Heavy | Boss |
|---|---|---|---|---|
| Ki Fighters (Mountain Dojo) | Rift Grunt 34×78 | Rift Caster 32×76 | Rift Beast 46×100 | Oni Brute 86×130 |
| Shinobi Clan (Shinobi Rooftops) | Shadow Assassin 34×78 | Rift Caster 32×76 | Oni Brute 46×100 | Rift Beast 86×130 |
| Caped League (Neon Metropolis) | Rift Grunt 34×78 | Rift Caster 32×76 | Mecha Sentinel 46×100 | Rift Beast 86×130 |
| Mighty Vanguard (Cosmic Outpost) | Void Stalker 34×78 | Rift Caster, levitating 50×44, flies | Rift Beast, prowling 64×74 | Mecha Sentinel 86×110 |

The **Shadow Clone** (waves 5, 15, ...) is a void-tinted copy of the hero you picked, driven by the clone neural network.

- Slot data lives in `UNIS[u].enemies[role] = [name, enemyId, {w, h, fly, art}]`.
- Projectile look per enemy is set in `ENEMY_SHOT`. It is visual only: damage and speed still come from the role.

## How a character is drawn

```
gameplay (physics, hitboxes, AI)  ->  poseFor(f)  ->  f.pose  ->  drawBodyAt(c, f, t)
                                          |                          |
                                   PZ(f, name)                 ART.draw(c, f, t)
                            (per-character pose                    | returns false?
                             overrides, render-only)               v
                                                              drawRig(...)  (fallback costume)
```

- Hitboxes come from `MOVES[*].box` and `rect(f)`. The renderer never reads or writes them.
- `ART.draw` only writes render caches on the fighter: `f._art`, `f._hand`, `f._foot`, `f._artSlash`.
- Coordinates are in world units, with the origin at the fighter's feet, facing +x. A limb angle of 0 points down; positive angles swing forward.
- **Scaling.** A definition with `baseH` is authored at that height and scaled to the fighter's hitbox height. For example, Oni Brute is authored at 100 and drawn at ×1.3 as a boss.
- **Variants.** A definition with `texOf` reuses another definition's parts and textures, with its own poses or hip height. `rift_caster_float` and `rift_beast_prowl` work this way.
- **Shared helpers.** `rig()` gives every character the same draw order. Unarmed fighters set `f._hand` and let the game draw its own fist and kick trails.

## Assets

- `assets/manifest.json` maps every part to `assets/<characterId>/<part>.png`, with its pivot and size.
- There are 19 texture sets (259 PNGs) at 4 px per world unit.
- Loading order:
  1. Built-in textures are baked in memory at startup.
  2. The PNGs load in the background and replace them when every part of a character loads.
  3. If a part is missing, that character keeps the built-in textures.
  4. If drawing throws, the character switches to the classic fallback costume.
- The title screen shows how many character sets loaded from PNGs.
- To swap in painted art, overwrite a PNG and keep its pivot (or edit the pivot in the manifest).

## Arenas

`ARENAS` has one entry per universe: `ki` (Mountain Dojo), `sh` (Shinobi Rooftops), `cape` (Neon Metropolis) and `mighty` (Cosmic Outpost).

- Static layers are baked once per resize and drawn with parallax.
- Platform sprites are drawn at the physics `plats` positions, so walkable surfaces stay exact.
- Live effects are small: falling leaves or petals, lantern and neon flicker, passing cars or ships, shooting stars.
- If an arena throws an error, that universe falls back to the classic background.

## Adding or changing a character

1. Edit or add a definition in `art_*.js`. It needs `len`, `parts` (each with bounds `b` and a draw function `d(c)`), `poses`, `idle`, `run` and `render`.
2. Map it in `heroArt` or `enemyArt`.
3. Rebuild, then run `tools/export-assets.js` (or `ART.exportAll()`) to write the PNGs and manifest.
4. Run `tools/browser-tests.js`.

## Known limits

- The art is vector cel-shading authored to match the concept sheet. It is not the painted concept art itself.
- KO and defeat use the existing effects rather than dedicated animation frames.
