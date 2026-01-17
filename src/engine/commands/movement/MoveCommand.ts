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

export class MoveCommand implements CommandHandler {
  name = 'vai';
  requiresArg = true;
  description = 'Muoviti verso una direzione specifica';
  usage = 'vai <direzione>';

  execute(arg: string, context: CommandContext): CommandResult {
    const normalizedDirection = DIRECTION_MAP[arg.toLowerCase()];
    if (!normalizedDirection) {
      return {
        type: 'error',
        message: 'Direzione non riconosciuta.',
      };
    }

    const currentRoom = getRoomById(context.currentRoomId);
    if (!currentRoom) {
      return {
        type: 'error',
        message: 'Stanza attuale non trovata.',
      };
    }

    const nextRoomId = currentRoom.exits[normalizedDirection as keyof typeof currentRoom.exits];
    if (!nextRoomId) {
      return {
        type: 'error',
        message: `Non puoi andare a ${arg}.`,
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
