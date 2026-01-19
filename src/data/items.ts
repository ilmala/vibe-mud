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
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Pozione di Guarigione',
    description: 'Una fiala di liquido rosso brillante che sembra pulsare di energia vitale.',
    type: 'potion',
    takeable: true,
    weight: 0.3,
    consumable: true,
    effect: {
      type: 'heal',
      value: 20,
      message: 'Un calore rigenerante si diffonde nel tuo corpo. Ti senti molto meglio! (+20 HP)',
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Pane Raffermo',
    description: 'Un pezzo di pane duro come una pietra, ma ancora commestibile.',
    type: 'food',
    takeable: true,
    weight: 0.2,
    consumable: true,
    effect: {
      type: 'heal',
      value: 5,
      message: 'Non è granché, ma riempie lo stomaco. (+5 HP)',
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'Pergamena della Conoscenza',
    description: 'Una pergamena ingiallita coperta di antiche rune.',
    type: 'scroll',
    takeable: true,
    weight: 0.1,
    consumable: true,
    effect: {
      type: 'knowledge',
      message: 'Le rune rivelano un segreto: "Il passaggio nascosto si apre solo quando la leva viene tirata."',
    },
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
