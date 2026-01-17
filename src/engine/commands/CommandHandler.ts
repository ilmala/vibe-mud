export interface CommandContext {
  playerId: string;
  playerName: string;
  currentRoomId: string;
  otherPlayersInRoom?: string[];
  command?: string; // The actual command used (e.g., 'tira' if user typed 'tira leva')
}

export interface CommandResult {
  type: string;
  message?: string;
  newRoomId?: string;
  triggerActivated?: {
    triggerId: string;
    globalMessage?: string;
  };
}

export interface CommandHandler {
  name: string;
  aliases?: string[];
  requiresArg: boolean;
  description: string;
  usage: string;
  execute(arg: string, context: CommandContext): CommandResult;
}
