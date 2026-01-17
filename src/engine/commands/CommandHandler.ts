export interface CommandContext {
  playerId: string;
  playerName: string;
  currentRoomId: string;
  otherPlayersInRoom?: string[];
}

export interface CommandResult {
  type: string;
  message?: string;
  newRoomId?: string;
}

export interface CommandHandler {
  name: string;
  aliases?: string[];
  requiresArg: boolean;
  description: string;
  usage: string;
  execute(arg: string, context: CommandContext): CommandResult;
}
