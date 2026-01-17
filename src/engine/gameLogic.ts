import { Command } from './parser';
import { initializeCommands, CommandContext } from './commands';
import { getRoomDescription } from './utils';

const registry = initializeCommands();

export { getRoomDescription };

export function handleCommand(
  command: Command,
  currentRoomId: string,
  playerId: string = '',
  playerName: string = '',
  otherPlayersInRoom?: string[]
) {
  const context: CommandContext = {
    playerId,
    playerName,
    currentRoomId,
    otherPlayersInRoom,
    command: command.cmd, // Pass the actual command used
  };
  return registry.execute(command.cmd, command.arg, context);
}
