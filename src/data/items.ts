import { Item } from '../models';

export const ITEMS: Item[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'chiave dorata',
    description: 'Una chiave dorata ornata con simboli antichi. Sembra aprire qualcosa di importante.',
    type: 'key',
    takeable: true,
    weight: 0.2,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'spada arrugginita',
    description: 'Una vecchia spada da combattimento. La lama è coperta di ruggine ma sembra ancora solida.',
    type: 'weapon',
    takeable: true,
    weight: 1.5,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'pergamena antica',
    description: 'Una pergamena ingiallita con scritture misteriose in una lingua sconosciuta.',
    type: 'treasure',
    takeable: true,
    weight: 0.1,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'altare di pietra',
    description: 'Un massiccio altare di pietra inciso con rune antiche. È troppo pesante per essere spostato.',
    type: 'furniture',
    takeable: false,
  },
];

export function getItemById(id: string): Item | undefined {
  return ITEMS.find(item => item.id === id);
}

export function getItemByName(name: string): Item | undefined {
  const normalizedName = name.toLowerCase();
  return ITEMS.find(item => item.name.toLowerCase() === normalizedName);
}

/**
 * Calculates the total weight of an array of item IDs
 */
export function calculateTotalWeight(itemIds: string[]): number {
  return itemIds.reduce((total, itemId) => {
    const item = getItemById(itemId);
    const weight = item?.weight ?? 0.5; // Default 0.5 kg
    return total + weight;
  }, 0);
}

/**
 * Checks if an item can be added without exceeding the weight limit
 */
export function canCarryItem(
  playerInventory: string[],
  newItemId: string,
  maxWeight: number
): boolean {
  const currentWeight = calculateTotalWeight(playerInventory);
  const newItem = getItemById(newItemId);
  const newItemWeight = newItem?.weight ?? 0.5;
  return (currentWeight + newItemWeight) <= maxWeight;
}

/**
 * Formats weight for display (1 decimal place)
 */
export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} kg`;
}
