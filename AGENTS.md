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
