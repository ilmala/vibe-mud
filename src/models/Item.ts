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
}
