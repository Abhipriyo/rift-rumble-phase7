# Rift Rumble progression (Phase 5)

## Power-ups

19 power-ups across 6 categories: Offense, Defense, Mobility, Meter, Special and Utility.

- **Rarity weights:** common 60, rare 30, epic 10.
- **Stack caps** stop any single power-up from making later waves trivial. For example, Power Gloves caps at 3 and Tough Cookie at 2. Snack Break and Second Wind are repeatable (lives cap at 5).
- **Each offer** shows 3 different power-ups from 3 different categories, so you never get three versions of the same thing. Maxed power-ups are never offered, and epics start appearing from wave 4.
- **When you pick:** after wave 1, then after every even wave. On other waves the banner says when the next pick is.
- **Rerolls** come from bounties and milestones. The reroll button appears on the power-up screen when you have one.

**New in Phase 5:**

| Power-up | Rarity | Effect |
|---|---|---|
| Combo Fuel | rare | +15% damage while your combo is 5+ hits |
| Afterimage | rare, up to 2 | Dashes 25% longer, +0.08 s invulnerability |
| Air Drift | rare | One extra air dash |
| Signature Mastery | epic, up to 2 | Your hero's special recharges 30% faster per stack |
| Iron Guard | common, up to 2 | Perfect-guard window +0.06 s, half chip damage while guarding |
| Quick Recovery | rare, up to 2 | You recover from hits 25% sooner |
| Rift Aegis | epic | Every wave starts with a shield that blocks the first hit |
| Rift Siphon | rare, up to 2 | Every knockout removes 6% of your damage |

**Balance changes** (gameplay, documented separately from art):
- Every power-up now has a stack cap. Before, Power Gloves could stack without limit.
- Picks come every other wave instead of every wave.

## Bounties

From wave 2, each endless wave has one bounty, shown under the score box. Clone waves have none. On boss waves, Blitz and Untouchable are excluded.

| Bounty | Condition |
|---|---|
| Untouchable | Clear the wave without taking damage |
| Combo Artist | Land a 15-hit combo |
| Iron Wall | Land 2 perfect guards |
| Air Show | Land 10 hits while airborne |
| Triple Threat | Knock out 3 enemies in a quick chain |
| Blitz | Clear the wave within a time limit of 14 s + 4 s per enemy in the wave |

**Reward:** +1 reroll and bonus score.

## Other rewards

- **Milestones:** every 5th wave cleared gives +1 reroll, +1 super bar and bonus score.
- **Boss defeated:** +1 life (up to 5), and the next power-ups are rare or better.

## Medals (persistent)

There are 12 medals. Each one unlocks from a real event:
- clear wave 1, 10 or 20
- defeat a boss, or all three boss types
- land a 25-hit combo
- land a perfect guard
- complete 10 bounties
- defeat your Shadow Clone
- win an Echo Duel
- play a run in all four universes
- play a run with all 12 heroes

## Run summary

The game-over screen lists:
- final result
- highest wave and score
- enemies defeated
- best combo
- damage dealt and received (measured as the actual change in damage percent)
- bosses defeated
- bounties completed, out of those attempted
- survival time
- power-ups selected
- medals unlocked
- "NEW BEST" next to any personal record

## Player profile

The Profile button is on the title screen and the game-over screen. The profile is stored in `localStorage` under the key `rrProfile1`, in this browser only, and the screen says so.

**What it shows:**
- matches played
- enemies defeated
- highest wave, combo, score and survival time
- favourite hero
- bosses defeated
- bounties completed
- Echo Duels won
- medals
- the last 10 matches (date, hero, wave, KOs, combo, result)

**How runs are recorded:**
- Each endless run is recorded once, when it ends.
- Quitting mid-run is recorded as "Quit on wave N".
- Echo Duels are recorded separately.

**Robustness:**
- Every field is validated on load: unknown heroes or medals are dropped, negative or invalid numbers are reset, and the list is capped at 10 entries.
- Corrupted data is reset, and the player is told.
- If storage is blocked, the game keeps working and says that stats will not be saved.
- "Reset statistics" needs two taps.

## Tests (`tools/browser-tests-phase5.js`, 26/26 passing)

- 600 real offer rolls: always 3 distinct power-ups and categories, no maxed ones, no epics before wave 4, boss rewards rare or better. The observed rarity mix is about 54% common, 42% rare and 4% epic; caps and category spreading shift it away from the raw weights.
- Pick schedule: after waves 1 and 2, none after wave 3.
- Bounties exist from wave 2; completion grants a reroll; Untouchable fails on damage; reroll spends a token.
- Each new power-up's effect is measured in game. For example, dash time goes from 0.170 s to 0.213 s with Afterimage.
- The run summary matches the game's counters; each run is recorded once; medals unlock.
- The profile survives a reload; the profile screen shows correct values; reset needs a second tap.
- A new run resets all run state; quitting is recorded.
- Corrupted data, invalid fields and blocked storage are all handled without crashing.

Regression: the Phase 1–3 suite (24/24) and the Phase 4 suite (24/24) still pass. Three tests were updated for intended behaviour changes:
- The boss-wave check now accepts the new pick schedule.
- The attack test pins the target so a Trickster cannot sidestep it.
- The personality check verifies the enemy-to-personality mapping instead of requiring a Rift Caster to spawn by chance.
