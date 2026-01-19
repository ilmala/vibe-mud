import type {
  Item,
  EquipmentSlot,
  PlayerEquipment,
  EquipmentStats,
} from '../models';
import { getItemById } from '../data/items';

export interface CanEquipResult {
  canEquip: boolean;
  reason?: string;
  slot?: EquipmentSlot;
}

export interface EquipResult {
  success: boolean;
  equipment: PlayerEquipment;
  unequippedItems: string[];
  message: string;
}

export interface UnequipResult {
  success: boolean;
  equipment: PlayerEquipment;
  itemId?: string;
  message: string;
}

export interface EffectiveStats {
  attack: number;
  defense: number;
  maxHp: number;
  breakdown: {
    attack: { base: number; bonus: number };
    defense: { base: number; bonus: number };
    maxHp: { base: number; bonus: number };
  };
}

/**
 * Check if an item can be equipped and determine the target slot
 */
export function canEquipItem(
  itemId: string,
  targetSlot?: EquipmentSlot
): CanEquipResult {
  const item = getItemById(itemId);

  if (!item) {
    return { canEquip: false, reason: 'Item not found' };
  }

  if (!item.equipable) {
    return { canEquip: false, reason: `"${item.name}" cannot be equipped` };
  }

  const slot = targetSlot || item.slot;

  if (!slot) {
    return {
      canEquip: false,
      reason: `"${item.name}" has no valid equipment slot`,
    };
  }

  return { canEquip: true, slot };
}

/**
 * Equip an item, handling conflicts and two-handed weapons
 */
export function equipItem(
  equipment: PlayerEquipment,
  inventory: string[],
  itemId: string,
  targetSlot?: EquipmentSlot
): EquipResult {
  // Check if item exists in inventory
  if (!inventory.includes(itemId)) {
    return {
      success: false,
      equipment,
      unequippedItems: [],
      message: 'Item not in inventory',
    };
  }

  const canEquip = canEquipItem(itemId, targetSlot);
  if (!canEquip.canEquip) {
    return {
      success: false,
      equipment,
      unequippedItems: [],
      message: canEquip.reason || 'Cannot equip this item',
    };
  }

  const item = getItemById(itemId)!;
  const slot = canEquip.slot!;
  const unequippedItems: string[] = [];
  const newEquipment = { ...equipment };

  // Handle left hand exclusivity: shield vs weapon
  if (slot === 'leftHand') {
    if (item.type === 'shield') {
      // Removing weapon from left hand if present
      if (
        newEquipment.leftHand &&
        getItemById(newEquipment.leftHand)?.type !== 'shield'
      ) {
        unequippedItems.push(newEquipment.leftHand);
      }
    } else {
      // Removing shield from left hand if present
      if (
        newEquipment.leftHand &&
        getItemById(newEquipment.leftHand)?.type === 'shield'
      ) {
        unequippedItems.push(newEquipment.leftHand);
      }
    }
  }

  // Handle two-handed weapons
  if (item.twoHanded) {
    if (newEquipment.rightHand) unequippedItems.push(newEquipment.rightHand);
    if (newEquipment.leftHand) unequippedItems.push(newEquipment.leftHand);

    newEquipment.rightHand = itemId;
    newEquipment.leftHand = itemId;
  } else {
    // Handle single-hand equipment conflicts
    const existingItem = newEquipment[slot];
    if (existingItem && existingItem !== itemId) {
      unequippedItems.push(existingItem);
    }

    // If equipping a weapon in right hand and left hand has a shield, keep it
    // If equipping a shield in left hand and right hand has a weapon, keep it
    // But remove conflicting weapons
    newEquipment[slot] = itemId;
  }

  // Remove duplicates from unequippedItems
  const uniqueUnequipped = Array.from(new Set(unequippedItems));

  const itemName = item.name;
  const slotName = getSlotName(slot);

  return {
    success: true,
    equipment: newEquipment,
    unequippedItems: uniqueUnequipped,
    message: `✅ Hai indossato ${itemName} (${slotName})`,
  };
}

/**
 * Unequip an item from a specific slot
 */
export function unequipItem(
  equipment: PlayerEquipment,
  slot: EquipmentSlot
): UnequipResult {
  const newEquipment = { ...equipment };
  const itemId = newEquipment[slot];

  if (!itemId) {
    return {
      success: false,
      equipment,
      message: `Niente da rimuovere da ${getSlotName(slot)}`,
    };
  }

  const item = getItemById(itemId);

  // Handle two-handed weapons: remove from both slots
  if (item?.twoHanded) {
    newEquipment.rightHand = undefined;
    newEquipment.leftHand = undefined;
  } else {
    newEquipment[slot] = undefined;
  }

  const itemName = item?.name || '?';

  return {
    success: true,
    equipment: newEquipment,
    itemId,
    message: `✅ Hai rimosso ${itemName}`,
  };
}

/**
 * Calculate effective stats including all equipment bonuses
 */
export function calculateEffectiveStats(
  baseAttack: number,
  baseDefense: number,
  baseMaxHp: number,
  equipment: PlayerEquipment
): EffectiveStats {
  let attackBonus = 0;
  let defenseBonus = 0;
  let maxHpBonus = 0;

  const processedItems = new Set<string>();

  // Process all slots
  const slots: EquipmentSlot[] = [
    'rightHand',
    'leftHand',
    'armor',
    'helmet',
    'boots',
    'gloves',
    'ring1',
    'ring2',
    'amulet',
  ];

  slots.forEach((slot) => {
    const itemId = equipment[slot];
    if (!itemId || processedItems.has(itemId)) return;

    processedItems.add(itemId);

    const item = getItemById(itemId);
    if (!item || !item.stats) return;

    if (item.stats.attack) attackBonus += item.stats.attack;
    if (item.stats.defense) defenseBonus += item.stats.defense;
    if (item.stats.maxHp) maxHpBonus += item.stats.maxHp;
  });

  return {
    attack: baseAttack + attackBonus,
    defense: baseDefense + defenseBonus,
    maxHp: baseMaxHp + maxHpBonus,
    breakdown: {
      attack: { base: baseAttack, bonus: attackBonus },
      defense: { base: baseDefense, bonus: defenseBonus },
      maxHp: { base: baseMaxHp, bonus: maxHpBonus },
    },
  };
}

/**
 * Get the user-friendly name for an equipment slot
 */
export function getSlotName(slot: EquipmentSlot): string {
  const names: Record<EquipmentSlot, string> = {
    rightHand: 'mano destra',
    leftHand: 'mano sinistra',
    armor: 'armatura',
    helmet: 'elmo',
    boots: 'stivali',
    gloves: 'guanti',
    ring1: 'anello 1',
    ring2: 'anello 2',
    amulet: 'amuleto',
  };
  return names[slot];
}

/**
 * Get emoji for equipment slot
 */
export function getSlotEmoji(slot: EquipmentSlot): string {
  const emojis: Record<EquipmentSlot, string> = {
    rightHand: '⚔️',
    leftHand: '🛡️',
    armor: '🥋',
    helmet: '⛑️',
    boots: '👢',
    gloves: '🧤',
    ring1: '💍',
    ring2: '💍',
    amulet: '🔮',
  };
  return emojis[slot];
}

/**
 * Check if an item is currently equipped
 */
export function isItemEquipped(
  equipment: PlayerEquipment,
  itemId: string
): boolean {
  const slots: EquipmentSlot[] = [
    'rightHand',
    'leftHand',
    'armor',
    'helmet',
    'boots',
    'gloves',
    'ring1',
    'ring2',
    'amulet',
  ];

  return slots.some((slot) => equipment[slot] === itemId);
}

/**
 * Find which slot an item is equipped in
 */
export function getEquippedSlot(
  equipment: PlayerEquipment,
  itemId: string
): EquipmentSlot | null {
  const slots: EquipmentSlot[] = [
    'rightHand',
    'leftHand',
    'armor',
    'helmet',
    'boots',
    'gloves',
    'ring1',
    'ring2',
    'amulet',
  ];

  for (const slot of slots) {
    if (equipment[slot] === itemId) {
      return slot;
    }
  }

  return null;
}
