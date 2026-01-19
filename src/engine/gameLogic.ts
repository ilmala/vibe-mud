import { Command } from './parser';
import { initializeCommands, CommandContext } from './commands';
import { getRoomDescription } from './utils';
import { getNPCsInRoom } from './npcs';
import { getMonstersInRoom } from './monsters';

const registry = initializeCommands();

export { getRoomDescription };

export function handleCommand(
  command: Command,
  currentRoomId: string,
  playerId: string = '',
  playerName: string = '',
  otherPlayersInRoom?: string[],
  playerInventory?: string[],
  maxWeight?: number,
  playerExperience?: number
) {
  let finalCmd = command.cmd;
  let finalArg = command.arg;

  // Check if there's a multi-word command (e.g., "apri porta")
  const argParts = command.arg.split(/\s+/);
  if (argParts.length > 0) {
    const potentialMultiWordCmd = `${command.cmd} ${argParts[0]}`;
    const allHandlers = registry.getAllHandlers();
    const hasMultiWordCommand = allHandlers.some(h => h.name === potentialMultiWordCmd);

    if (hasMultiWordCommand) {
      finalCmd = potentialMultiWordCmd;
      finalArg = argParts.slice(1).join(' ');
    }
  }

  const npcsInRoom = getNPCsInRoom(currentRoomId);
  const monstersInRoom = getMonstersInRoom(currentRoomId);

  const context: CommandContext = {
    playerId,
    playerName,
    currentRoomId,
    otherPlayersInRoom,
    npcsInRoom,
    monstersInRoom,
    command: finalCmd, // Pass the actual command used
    playerInventory,
    maxWeight,
    playerExperience,
  };
  return registry.execute(finalCmd, finalArg, context);
}
