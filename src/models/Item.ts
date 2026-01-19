export type EquipmentSlot =
  | 'rightHand' | 'leftHand' | 'armor' | 'helmet'
  | 'boots' | 'gloves' | 'ring1' | 'ring2' | 'amulet';

export interface EquipmentStats {
  attack?: number;
  defense?: number;
  maxHp?: number;
}

export interface Item {
  id: string;           // Unique UUID
  name: string;         // Display name
  description: string;  // Detailed description
  type?: string;        // Optional category: 'key' | 'weapon' | 'treasure' | 'potion' | 'food' | 'scroll'
  takeable?: boolean;   // Whether it can be picked up (default: true)
  weight?: number;      // Weight in kg (default: 0.5 kg)
  consumable?: boolean; // Whether the item can be consumed/used
  effect?: {            // Effect when item is consumed
    type: 'heal' | 'buff' | 'key' | 'knowledge';
    value?: number;     // HP healed, buff value, etc.
    message?: string;   // Message displayed when consumed
  };
  equipable?: boolean;  // Whether it can be equipped
  slot?: EquipmentSlot; // Equipment slot it occupies
  stats?: EquipmentStats; // Bonus statistics when equipped
  twoHanded?: boolean;  // Whether it occupies both hands
}
