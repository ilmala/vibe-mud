import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getPlayerCombat } from '../../combat';

export class DefendCommand implements CommandHandler {
  name = 'difenditi';
  aliases = ['defend', 'block', 'parata', 'difesa'];
  requiresArg = false;
  description = 'Ti difendi da un attacco';
  usage = 'difenditi';

  execute(arg: string, context: CommandContext): CommandResult {
    // Check if player is in combat
    const combat = getPlayerCombat(context.playerId);

    if (!combat) {
      return {
        type: 'error',
        message: 'Non sei in combattimento. Usa: attacca <nemico>',
      };
    }

    return {
      type: 'combat_defend',
      combatAction: 'defend',
    };
  }
}
