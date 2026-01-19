import type { PlayerEquipment } from './Player';

export interface Monster {
  id: string; // Unique UUID (generated, not socket-based)
  name: string; // Display name
  roomId: string; // Current location (can change at runtime)
  description: string; // Full description shown when examined
  shortDescription?: string; // Brief description shown in room list

  // Combat stats (for future combat system)
  maxHp: number; // Maximum hit points
  currentHp?: number; // Current hit points (defaults to maxHp if not set)
  attack: number; // Base attack damage
  defense: number; // Damage reduction/armor value
  experienceDrop: number; // XP awarded when defeated

  // Loot system
  inventory: string[]; // Array of item IDs to drop when killed

  // Equipment system
  equipment?: PlayerEquipment;

  // Respawn system
  respawnTime?: number; // Time in milliseconds before monster respawns (uses default if not set)

  // Classification
  type?: string; // Optional category (undead, beast, demon, ooze, etc.)
  level?: number; // Monster difficulty level
  emoji?: string; // Visual identifier (e.g., "💀" for skeleton)
  aggressive?: boolean; // Whether monster attacks on sight (for future AI)
}
