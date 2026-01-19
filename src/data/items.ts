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
    equipable: true,
    slot: 'rightHand',
    stats: { attack: 4 },
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
  // WEAPONS
  {
    id: 'weapon-spada-lunga-001',
    name: 'spada lunga',
    description: 'Una lama affilata e ben mantenuta. Perfetta per il combattimento.',
    type: 'weapon',
    takeable: true,
    weight: 1.2,
    equipable: true,
    slot: 'rightHand',
    stats: { attack: 8 },
  },
  {
    id: 'weapon-pugnale-001',
    name: 'pugnale affilato',
    description: 'Un pugnale perfetto per colpire rapidamente da una sola mano.',
    type: 'weapon',
    takeable: true,
    weight: 0.4,
    equipable: true,
    slot: 'leftHand',
    stats: { attack: 3 },
  },
  {
    id: 'weapon-ascia-001',
    name: 'ascia da guerra',
    description: 'Una massiccia ascia a due mani con una lama di acciaio mortale.',
    type: 'weapon',
    takeable: true,
    weight: 3.5,
    equipable: true,
    slot: 'rightHand',
    stats: { attack: 15 },
    twoHanded: true,
  },
  // SHIELDS
  {
    id: 'armor-scudo-legno-001',
    name: 'scudo di legno',
    description: 'Uno scudo robusto fatto di legno rinforzato. Offre una buona protezione.',
    type: 'shield',
    takeable: true,
    weight: 2.0,
    equipable: true,
    slot: 'leftHand',
    stats: { defense: 5 },
  },
  {
    id: 'armor-scudo-torre-001',
    name: 'scudo torre',
    description: 'Un grande scudo a torre che copre la maggior parte del corpo. Molto protettivo.',
    type: 'shield',
    takeable: true,
    weight: 4.0,
    equipable: true,
    slot: 'leftHand',
    stats: { defense: 10 },
  },
  // ARMOR
  {
    id: 'armor-tunica-cuoio-001',
    name: 'tunica di cuoio',
    description: 'Un\'armatura di cuoio scuro ben conservata. Offre una protezione decente.',
    type: 'armor',
    takeable: true,
    weight: 2.5,
    equipable: true,
    slot: 'armor',
    stats: { defense: 4 },
  },
  {
    id: 'armor-cotta-maglia-001',
    name: 'cotta di maglia',
    description: 'Una pesante cotta di maglia intrecciata. Protegge efficacemente da molti attacchi.',
    type: 'armor',
    takeable: true,
    weight: 8.0,
    equipable: true,
    slot: 'armor',
    stats: { defense: 8 },
  },
  // HELMET
  {
    id: 'armor-elmo-ferro-001',
    name: 'elmo di ferro',
    description: 'Un semplice elmo di ferro che protegge la testa.',
    type: 'helmet',
    takeable: true,
    weight: 1.5,
    equipable: true,
    slot: 'helmet',
    stats: { defense: 3 },
  },
  // BOOTS
  {
    id: 'armor-stivali-rinforzati-001',
    name: 'stivali rinforzati',
    description: 'Stivali resistenti con rinforzi di metallo. Proteggono i piedi in battaglia.',
    type: 'boots',
    takeable: true,
    weight: 1.0,
    equipable: true,
    slot: 'boots',
    stats: { defense: 2 },
  },
  // GLOVES
  {
    id: 'armor-guanti-pelle-001',
    name: 'guanti di pelle',
    description: 'Guanti di pelle morbida che proteggono le mani.',
    type: 'gloves',
    takeable: true,
    weight: 0.3,
    equipable: true,
    slot: 'gloves',
    stats: { defense: 1 },
  },
  // RINGS
  {
    id: 'accessory-anello-forza-001',
    name: 'anello della forza',
    description: 'Un anello di metallo lucido che irrada potenza. Aumenta sia l\'attacco che la difesa.',
    type: 'ring',
    takeable: true,
    weight: 0.1,
    equipable: true,
    slot: 'ring1',
    stats: { attack: 2, defense: 2 },
  },
  {
    id: 'accessory-anello-vitalita-001',
    name: 'anello della vitalità',
    description: 'Un anello che brilla di luce verde. Aumenta notevolmente la resistenza del corpo.',
    type: 'ring',
    takeable: true,
    weight: 0.1,
    equipable: true,
    slot: 'ring1',
    stats: { maxHp: 20 },
  },
  // AMULET
  {
    id: 'accessory-amuleto-guerriero-001',
    name: 'amuleto del guerriero',
    description: 'Un potente amuleto che protegge chi lo porta e aumenta il suo potere in battaglia.',
    type: 'amulet',
    takeable: true,
    weight: 0.2,
    equipable: true,
    slot: 'amulet',
    stats: { attack: 3, defense: 3 },
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
