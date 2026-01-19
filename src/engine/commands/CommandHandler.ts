export interface CommandContext {
  playerId: string;
  playerName: string;
  currentRoomId: string;
  otherPlayersInRoom?: string[];
  npcsInRoom?: Array<{id: string; name: string; emoji?: string}>; // NPCs in current room
  monstersInRoom?: Array<{id: string; name: string; emoji?: string; currentHp: number; maxHp: number}>; // Monsters in current room
  command?: string; // The actual command used (e.g., 'pull' if user typed 'pull lever')
  playerInventory?: string[]; // Array of item IDs in player's inventory
  maxWeight?: number; // Maximum weight the player can carry in kg
  playerExperience?: number; // Player experience points
}

export interface CommandResult {
  type: string;
  message?: string;
  newRoomId?: string;
  direction?: string; // Direction of movement (nord, sud, est, ovest)
  triggerActivated?: {
    triggerId: string;
    globalMessage?: string;
  };
  broadcastMessage?: string; // Message to broadcast to other players in the room
  itemId?: string; // For pickup/drop commands to communicate item ID to server
  consumedItemId?: string; // For consumable items (potions, food, etc) to signal removal and respawn
}

export interface CommandHandler {
  name: string;
  aliases?: string[];
  requiresArg: boolean;
  description: string;
  usage: string;
  execute(arg: string, context: CommandContext): CommandResult;
}
