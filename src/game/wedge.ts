// Direction order shared by the player textures: E, SE, S, SW, W, NW, N, NE.
const assets = import.meta.glob('../assets/gear/*.png.asset.json', { eager: true, import: 'default' }) as Record<string, { url: string }>;
function directional(name: string): string[] {
  return Array.from({ length: 8 }, (_, i) => {
    const asset = assets[`../assets/gear/${name}-${i}.png.asset.json`];
    if (!asset) throw new Error(`Missing ${name} direction ${i}`);
    return asset.url;
  });
}
export const WEDGE_IDLE = directional('wedge-idle');
export const WEDGE_WALK = directional('wedge-walk');
export const WEDGE_ATTACK = directional('wedge-attack');
export const FINISHER = directional('finisher');
const icon = assets['../assets/gear/icon-wedge.png.asset.json'];
if (!icon) throw new Error('Missing Steinkeil icon');
export const ICON_WEDGE = icon.url;