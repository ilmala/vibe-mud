import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getRoomDescription } from '../../utils';

export class LookCommand implements CommandHandler {
  name = 'guarda';
  aliases = ['look'];
  requiresArg = false;
  description = 'Guarda la stanza attuale';
  usage = 'guarda';

  execute(arg: string, context: CommandContext): CommandResult {
    return {
      type: 'look',
      message: getRoomDescription(context.currentRoomId, context.otherPlayersInRoom, context.npcsInRoom, context.monstersInRoom),
    };
  }
}
