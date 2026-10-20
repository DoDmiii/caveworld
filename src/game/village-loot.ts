import { NORDIC_HOUSES } from './nordic';
import type { Stock } from './harvest';
import type { ItemId } from './progress';

export type VillageLootState = { stock: Stock; berries: number; meat: number; cooked: number; owned: ItemId[]; lootedHouses: string[] };
/** Finite supplies: repeat searches never duplicate rewards or weapons. */
export function lootHouse(state: VillageLootState, id: string): VillageLootState | null {
  const house = NORDIC_HOUSES.find(h => h.id === id);
  if (!house || state.lootedHouses.includes(id)) return null;
  const armory = house.variant === 0;
  const weapon: ItemId = house.village === 'Frostheim' ? 'club' : house.village === 'Gipfelwacht' ? 'spear' : 'axe';
  return {
    stock: { wood: state.stock.wood + 4, stone: state.stock.stone + 3, fiber: state.stock.fiber + 2, flint: state.stock.flint + 1 },
    berries: state.berries + 3, meat: state.meat + 1, cooked: state.cooked + 2,
    owned: armory && !state.owned.includes(weapon) ? [...state.owned, weapon] : [...state.owned],
    lootedHouses: [...state.lootedHouses, id],
  };
}