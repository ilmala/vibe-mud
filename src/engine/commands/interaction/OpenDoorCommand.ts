import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getDoorState, setDoorState, doorExists, getRequiredKey } from '../../doors';

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

function directionToItalian(direction: string): string {
  const map: { [key: string]: string } = {
    north: 'nord',
    south: 'sud',
    east: 'est',
    west: 'ovest',
  };
  return map[direction] || direction;
}

export class OpenDoorCommand implements CommandHandler {
  name = 'apri porta';
  requiresArg = true;
  description = 'Apri una porta in una direzione';
  usage = 'apri porta <direzione>';

  execute(arg: string, context: CommandContext): CommandResult {
    // Normalize direction
    const normalizedDirection = DIRECTION_MAP[arg.toLowerCase()];
    if (!normalizedDirection) {
      return {
        type: 'error',
        message: 'Direzione non riconosciuta.',
      };
    }

    // Check if door exists
    if (!doorExists(context.currentRoomId, normalizedDirection)) {
      return {
        type: 'error',
        message: `Non c'è nessuna porta a ${arg.toLowerCase()}.`,
      };
    }

    // Get current door state
    const currentState = getDoorState(context.currentRoomId, normalizedDirection);
    if (!currentState) {
      return {
        type: 'error',
        message: `Non c'è nessuna porta a ${arg.toLowerCase()}.`,
      };
    }

    // Check if door is already open
    if (currentState === 'open') {
      return {
        type: 'error',
        message: 'La porta è già aperta.',
      };
    }

    // If door is locked, check for key
    if (currentState === 'locked') {
      const requiredKey = getRequiredKey(context.currentRoomId, normalizedDirection);
      if (!requiredKey) {
        return {
          type: 'error',
          message: 'La porta è chiusa a chiave.',
        };
      }

      if (!context.playerInventory || !context.playerInventory.includes(requiredKey)) {
        return {
          type: 'error',
          message: `La porta è chiusa a chiave. Ti serve: ${requiredKey}`,
        };
      }
    }

    // Open the door
    setDoorState(context.currentRoomId, normalizedDirection, 'open');

    const dirIT = directionToItalian(normalizedDirection);
    const playerMessage = `Apri la porta a ${dirIT}.`;
    const broadcastMessage = `${context.playerName} apre la porta a ${dirIT}.`;

    return {
      type: 'door',
      message: playerMessage,
      broadcastMessage: broadcastMessage,
    };
  }
}
