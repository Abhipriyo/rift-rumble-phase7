# Rift Rumble AI systems (Phase 4)

Everything runs in the browser. No gameplay data leaves the page, except optional announcer recaps when the player explicitly switches the language-model announcer on.

## 1. Enemy tactics (conventional game AI)

Regular enemies use **utility AI**:
- Each decision scores a few candidate actions and takes the highest score.
- Enemies only react to a player action after they have perceived it for their **reaction time**: 0.20–0.38 s, getting shorter with the wave number. The perception log is `OBS`.

| Personality | Used by | Behaviour | Weakness |
|---|---|---|---|
| Berserker | Rift Grunt | Rushes in, chains 2–3 hits, never blocks or dodges | Stands open for 0.75 s after a combo ("OPEN") |
| Guardian | Oni Brute, Mecha Sentinel (heavy slots) | Raises a guard against attacks it sees coming, counters a blocked hit, blocks projectiles | Guard stamina runs out ("GUARD DOWN" for 1.6 s); heavy hits go through |
| Trickster | Shadow Assassin, Void Stalker | Keeps mid range, sidesteps attacks it perceives, blinks behind you | The blink is telegraphed by smoke at the destination 0.38 s before it arrives, then a 0.32 s wind-up |
| Hunter | Rift Beast (heavy), some grunts from wave 4 | Takes a stance against the move predictor's top guess (p ≥ 0.34), then punishes that move when it sees it; guard-breaks if it expects you to guard | Only works when you are predictable |
| Zoner | Rift Caster | Keeps 230–420 px away, fires talismans (a 3-shot volley every third shot from wave 5), blinks across the stage when cornered | Weak up close once the blink is on cooldown |
| Mimic | Some grunts from wave 6 | Samples its actions from your observed action mix and keeps your observed preferred spacing | Copies your habits, including the bad ones |

**Hunter evaluation.** Every stance a Hunter takes is logged as a prediction and scored against the player's **next** action. The AI Lab reports the result as "Hunter reads scored: X of N".

## 2. Bosses

The bosses are Oni Brute (Ki Fighters), Rift Beast (Shinobi Clan, Caped League) and Mecha Sentinel (Mighty Vanguard).

- **Three phases.** Phase 2 starts at 60% damage and phase 3 at 120%. Each phase adds a move, announced in a banner, and shortens telegraphs by 10–20%. The minimum telegraph is 0.4 s.
- **Every attack follows the same cycle:** telegraph → active → recovery.
  - The telegraph shows a danger zone, landing marker, aim line or floor band, and the attack name appears in the boss bar.
  - The recovery has no armour and is your opening. The boss bar shows "OPENING!" and the boss gets a cyan outline.
- **Poise.** Light hits during the telegraph or active part land on poise armour. Heavy hits, or enough damage, interrupt the attack.
- **Adaptation, based only on observed play:**
  - 4 or more hits of one move category within 6 s → for 9 s it counters that category when it perceives it (0.3 s perception + 0.3 s telegraph).
  - Guarding more than 45% of the last ~6 s → it prefers melee attacks and makes them guard breaks. A perfect guard still works.
- **Intro and defeat.** An intro card shows the name and Japanese title when the boss lands. Defeat plays a slow-motion sequence with a banner and announcer line.

| Boss | Phase 1 | Phase 2 adds | Phase 3 adds |
|---|---|---|---|
| Oni Brute | Kanabo Smash, Meteor Stomp, Rampage | Spin Sweep | Earth Quake (ground waves) |
| Rift Beast | Pounce, Rift Claws, Rift Howl (orb volley) | Frenzy | Triple Pounce |
| Mecha Sentinel | Sentinel Laser (aim line locks 0.22 s before firing), Meteor Stomp, Rampage | Floor Sweep (jump over it) | Rocket Barrage (marked landing spots) |

## 3. Move predictor

The predictor is an n-gram model with interpolated backoff and recency decay, over 7 player actions.

- **Evaluation set:** every action this run after the third, each predicted **before** it happens (prequential evaluation).
- **Reported in the Lab:**
  - number of evaluated predictions
  - top-1 accuracy, for the whole run and for the last 40 predictions
  - **baseline:** "most frequent move so far", evaluated on the same moves
  - random guessing (14%)
  - the last 12 predictions as ✓ / ✗
- Under 30 evaluated predictions, the Lab says it is too few to judge. If the predictor does not beat the baseline, the Lab says so.

## 4. Shadow Clone (behaviour cloning)

- **Model:** a 13-24-10 MLP (tanh, softmax), class-weighted cross-entropy, Adam, written from scratch.
- **Data:** the player's decision is labelled 10 times a second (10 coarse actions) together with 13 situation features.
- **Split:** every 5th example goes to a **held-out validation set**, capped at 600. It is never used for training. A test confirms that no held-out example appears in the training set, and that training does nothing when the training set is empty.
- **Metrics:**
  - training loss (minibatch EMA)
  - validation loss
  - held-out action agreement
  - majority-class baseline
  - random guessing (10%)
  - agreement on training examples, flagged as an "overfitting gap" when it exceeds held-out agreement by more than 15 points
  - The Lab shows "unavailable" until there are at least 30 held-out examples.
- **Duels:**
  - The network is **frozen** while a clone is alive, so the duel measures a fixed model.
  - The player's decisions during the duel are fresh situations, so agreement with them is also reported.
  - Behaviour-mix similarity is 1 − total variation distance between the training labels and the clone's duel decisions.
  - Combat effectiveness (damage dealt and taken, result, duration) is reported **separately** from imitation.
- **Persistence:** the data is saved in `localStorage` (format v2 with the split). Old saved data is migrated with a fresh 1-in-5 split. Corrupted data or blocked storage is ignored without crashing. "Forget my moves" clears everything.

## 5. Echo Duel mode

The mode is on the title screen.
1. Pick a hero.
2. **Training round:** fight normal enemies until 200 new decisions are recorded (at least 35 s, at most 80 s).
3. **Training screen:** 900 real Adam steps with a live progress bar, training and validation loss curves and held-out metrics. It warns if validation loss is rising (overfitting).
4. **Duel** against the frozen clone.
5. **Report:** imitation and combat results side by side, with the limitations stated.

## 6. Developer debug view

Press the backtick key during a match, or open the page with `?debug`. It shows:
- each enemy's personality and state, reaction time, candidate actions with scores, and chosen action
- the boss's state, timer, armour and adaptation log
- the clone's 13 model inputs and top action probabilities
- a summary panel: predictor guess, Hunter reads, habit counts, clone data sizes and the player's last actions

## Tests

| Suite | Checks | Result |
|---|---|---|
| `tools/browser-tests-phase4.js` | AI and boss behaviour (list below) | 24/24 |
| `tools/browser-tests.js` | Phases 1–3 regression | 24/24 |
| Headless simulation, 12 heroes | Runtime errors | 0 |
| Headless boss simulation, 4 universes | Phases 1–3 reached; minimum telegraph 0.42 s (counter 0.3 s after 0.3 s perception); reads, counters and guard breaks observed | Pass |

The Phase 4 browser suite covers:
- personalities assigned
- held-out set disjoint from training
- held-out agreement recomputed independently and matching the Lab display
- predictor counts matching the Lab
- debug toggle
- boss intro card, state cycle and phase 2
- the full Echo Duel flow, with report numbers checked against the duel log
- blocked storage
- old-data migration
- corrupted data

## Known limits

- Enemy behaviour was tuned with scripted bots. It has not yet been play-tested by many people.
- Held-out examples come from the same player and sessions, so they are not a test on new players.
- The clone imitates 10 coarse actions. It does not learn combos, timing within a move or long-term strategy.
- Difficulty settings and the run summary and profile belong to Phases 5–6.
