import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getRoomById } from '../../../data/world';
import { getRoomDescription } from '../../utils';

const DIRECTION_MAP: Record<string, string> = {
  nord: 'north',
  north: 'north',
  sud: 'south',
  south: 'south',
  est: 'east',
  east: 'east',
  ovest: 'west',
  west: 'west',
};

export class DirectionCommand implements CommandHandler {
  name: string;
  aliases?: string[];
  requiresArg = false;
  description: string;
  usage: string;
  private italianDirection: string;
  private englishDirection: string;

  constructor(italianDirection: string, englishDirection: string) {
    this.italianDirection = italianDirection;
    this.englishDirection = englishDirection;
    this.name = italianDirection;
    this.aliases = [englishDirection];
    this.description = `Muoviti verso ${italianDirection}`;
    this.usage = italianDirection;
  }

  execute(arg: string, context: CommandContext): CommandResult {
    const currentRoom = getRoomById(context.currentRoomId);
    if (!currentRoom) {
      return {
        type: 'error',
        message: 'Stanza attuale non trovata.',
      };
    }

    const nextRoomId = currentRoom.exits[this.englishDirection as keyof typeof currentRoom.exits];
    if (!nextRoomId) {
      return {
        type: 'error',
        message: `Non puoi andare a ${this.italianDirection}.`,
      };
    }

    const nextRoom = getRoomById(nextRoomId);
    if (!nextRoom) {
      return {
        type: 'error',
        message: 'La stanza di destinazione non esiste.',
      };
    }

    return {
      type: 'move',
      message: `Sei entrato in:\n\n${getRoomDescription(nextRoomId)}`,
      newRoomId: nextRoomId,
    };
  }
}
