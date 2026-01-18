import { Item } from '../models';

export const ITEMS: Item[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'golden key',
    description: 'A golden key adorned with ancient symbols. It seems to open something important.',
    type: 'key',
    takeable: true,
    weight: 0.2,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'rusty sword',
    description: 'An old combat sword. The blade is covered with rust but still seems solid.',
    type: 'weapon',
    takeable: true,
    weight: 1.5,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'ancient scroll',
    description: 'A yellowed scroll with mysterious writings in an unknown language.',
    type: 'treasure',
    takeable: true,
    weight: 0.1,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'stone altar',
    description: 'A massive stone altar carved with ancient runes. It is too heavy to be moved.',
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
