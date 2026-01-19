export interface Player {
  id: string; // Socket.io connection ID
  name: string;
  roomId: string; // Current room ID
  socketId: string;
  inventory: string[]; // Array of item IDs
  maxWeight: number; // Maximum weight the player can carry in kg
  experience: number; // Player experience points

  // Combat stats (for future combat system)
  maxHp: number; // Maximum hit points
  currentHp?: number; // Current hit points (defaults to maxHp if not set)
  attack: number; // Base attack damage
  defense: number; // Damage reduction/armor value
}
