<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Game architecture
- Load Phaser dynamically inside the game view's effect; browser-only engine imports must never enter SSR evaluation.
- Use Phaser Arcade physics for movement and collisions, with a deterministic generated pixel world and direct uploaded directional sprite textures.
- Keep the React HUD and touch controls separate from the game engine, communicating through a shared input object and status callback.
- Keep allied camp NPCs in dedicated tribe asset definitions and camper movement modules, separate from wildlife combat targets, so friendly inhabitants cannot be hunted.
- Pack each uploaded tribe template into one directional atlas; preserve original pixels and center smaller frames without rescaling to keep downloads compact and proportions intact.
- Keep world geography (map bounds, river course, biome zones, fords, village zones) in the engine-free biomes module so the HUD maps and Phaser world share one source; the original start region keeps its coordinates and the map grows around it.
- Keep Nordic structures and stable house identities in nordic.ts, finite loot rules in the engine-free village-loot module, and persist searched house IDs in the existing game save so reloads cannot duplicate rewards.
- Keep Nordic villagers in nordic-folk.ts (one packed atlas per template: idle, walk, surrender, bound) and capture rules in the engine-free captives module; captives on the shoulders are saved as bound at the player's feet so reloads never lose them.
- Keep NPC reaction rules (behavior.ts), the interaction registry (interactions.ts), relationship state (relationships.ts) and wheel effects (tribal.ts) engine-free; world.ts only detects targets, applies outcomes and saves relationships in the game save.
- Keep chaser formation rules (ring slots, separation, lunge turns) in the engine-free combat module; world.ts only applies the resulting velocities so future tribe-vs-village battles reuse them.
- Keep fighter health, knockdown recovery and finisher eligibility in combat.ts; save fighter outcomes separately from captive states so defeated guards cannot respawn or become captives on reload.
- Import uploaded Steinkeil and finisher frames through wedge.ts, preserving pixels on a shared player canvas; Phaser resolves finisher impact from the animation frame rather than a timer.
- Keep companion orders and formation rules engine-free in companions.ts, and obstacle navigation in companion-movement.ts using PathFinding.js; override camper/folk wandering only for ordered allies and persist orders separately from captive/fighter states to preserve identities and friendly-fire protection.
- Keep tutorial step rules engine-free in tutorial.ts; world.ts only emits events and saves progress, so steps can change without touching the engine.
- Keep NPC biographies and stable identity mappings in an engine-free profiles module, with mutable trust and skills in the existing local game save; render uploaded atlas portraits separately in the HUD so profiles never change ethnicity or activate gameplay bonuses implicitly.
- Keep profile gameplay bonuses in the engine-free bonuses module; world.ts only asks it for the current party's modifiers, so values can change without touching the engine.
- Keep village warning levels, patrol routes and bark lines engine-free in patrols.ts; world.ts only moves guards and shows bubbles.
- Keep camp dialogue choices, pair bonds and per-game-day resolution rules engine-free in camp-dialogue.ts; world.ts validates nearby camp participants and persists outcomes separately from player trust so camp rivalries cannot unlock captive bonuses implicitly.
