export interface CommandContext {
  playerId: string;
  playerName: string;
  currentRoomId: string;
  otherPlayersInRoom?: string[];
  command?: string; // The actual command used (e.g., 'tira' if user typed 'tira leva')
  playerInventory?: string[]; // Array of item IDs in player's inventory
}

export interface CommandResult {
  type: string;
  message?: string;
  newRoomId?: string;
  triggerActivated?: {
    triggerId: string;
    globalMessage?: string;
  };
  broadcastMessage?: string; // Message to broadcast to other players in the room
  itemId?: string; // For pickup/drop commands to communicate item ID to server
}

export interface CommandHandler {
  name: string;
  aliases?: string[];
  requiresArg: boolean;
  description: string;
  usage: string;
  execute(arg: string, context: CommandContext): CommandResult;
}
