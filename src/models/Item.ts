export interface Item {
  id: string;           // Unique UUID
  name: string;         // Display name
  description: string;  // Detailed description
  type?: string;        // Optional category: 'key' | 'weapon' | 'treasure' | etc
  takeable?: boolean;   // Whether it can be picked up (default: true)
  weight?: number;      // Weight in kg (default: 0.5 kg)
}
