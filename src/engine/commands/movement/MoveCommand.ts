import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getRoomById } from '../../../data/world';
import { getRoomDescription } from '../../utils';
import { isTriggered } from '../../triggers';
import { getDoorState, getRequiredKey } from '../../doors';

const DIRECTION_MAP: Record<string, string> = {
  nord: 'north',
  north: 'north',
  sud: 'south',
  south: 'south',
  est: 'east',
  east: 'east',
  ovest: 'west',
  west: 'west',
  su: 'up',
  up: 'up',
  giu: 'down',
  down: 'down',
};

const ENGLISH_TO_ITALIAN: Record<string, string> = {
  north: 'nord',
  south: 'sud',
  east: 'est',
  west: 'ovest',
  up: 'su',
  down: 'giu',
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

    let nextRoomId = currentRoom.exits[normalizedDirection as keyof typeof currentRoom.exits];

    // Check for hidden exits if regular exit doesn't exist
    if (!nextRoomId && currentRoom.hiddenExits) {
      const hiddenExit = currentRoom.hiddenExits[normalizedDirection];
      if (hiddenExit) {
        // Check if the required trigger is activated
        if (isTriggered(hiddenExit.requiredTrigger)) {
          nextRoomId = hiddenExit.roomId;
        } else {
          return {
            type: 'error',
            message: `Non puoi andare a ${arg}.`,
          };
        }
      }
    }

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

    // Check if there's a door blocking passage
    const doorState = getDoorState(context.currentRoomId, normalizedDirection);
    if (doorState && doorState !== 'open') {
      const stateName = doorState === 'locked' ? 'chiusa a chiave' : 'chiusa';
      return {
        type: 'error',
        message: `La porta a ${arg} è ${stateName}.`,
      };
    }

    const italianDirection = ENGLISH_TO_ITALIAN[normalizedDirection] || arg.toLowerCase();
    return {
      type: 'move',
      message: `Sei entrato in:\n\n${getRoomDescription(nextRoomId)}`,
      newRoomId: nextRoomId,
      direction: italianDirection,
    };
  }
}
