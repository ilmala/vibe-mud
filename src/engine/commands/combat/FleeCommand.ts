import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getPlayerCombat } from '../../combat';

export class FleeCommand implements CommandHandler {
  name = 'fuggi';
  aliases = ['flee', 'run', 'scappa', 'scappi'];
  requiresArg = false;
  description = 'Fuggi da un combattimento';
  usage = 'fuggi';

  execute(arg: string, context: CommandContext): CommandResult {
    // Check if player is in combat
    const combat = getPlayerCombat(context.playerId);

    if (!combat) {
      return {
        type: 'error',
        message: 'Non sei in combattimento.',
      };
    }

    return {
      type: 'combat_flee',
      combatAction: 'flee',
    };
  }
}
