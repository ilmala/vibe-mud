import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getDoorState, setDoorState, doorExists } from '../../doors';

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

export class CloseDoorCommand implements CommandHandler {
  name = 'chiudi porta';
  requiresArg = true;
  description = 'Chiudi una porta in una direzione';
  usage = 'chiudi porta <direzione>';

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

    // Check if door is already closed or locked
    if (currentState !== 'open') {
      return {
        type: 'error',
        message: 'La porta è già chiusa.',
      };
    }

    // Close the door
    setDoorState(context.currentRoomId, normalizedDirection, 'closed');

    const dirIT = directionToItalian(normalizedDirection);
    const playerMessage = `Chiudi la porta a ${dirIT}.`;
    const broadcastMessage = `${context.playerName} chiude la porta a ${dirIT}.`;

    return {
      type: 'door',
      message: playerMessage,
      broadcastMessage: broadcastMessage,
    };
  }
}
