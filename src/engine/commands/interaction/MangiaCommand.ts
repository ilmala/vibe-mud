import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getItemById } from '../../../data/items';
import { getPlayerCombat } from '../../combat';

export class MangiaCommand implements CommandHandler {
  name = 'mangia';
  aliases = ['eat', 'mangiare'];
  requiresArg = true;
  description = 'Mangia del cibo';
  usage = 'mangia <cibo>';

  execute(arg: string, context: CommandContext): CommandResult {
    if (!arg) {
      return {
        type: 'error',
        message: 'Cosa vuoi mangiare? Usa: mangia <cibo>',
      };
    }

    const itemName = arg.toLowerCase();

    // Search for food in inventory
    const itemId = context.playerInventory?.find(id => {
      const item = getItemById(id);
      return item?.name.toLowerCase().includes(itemName) && item?.type === 'food';
    });

    if (!itemId) {
      return {
        type: 'error',
        message: `Non hai del cibo chiamato "${arg}".`,
      };
    }

    const item = getItemById(itemId);
    if (!item) {
      return {
        type: 'error',
        message: 'Errore interno.',
      };
    }

    // Check if in combat - queue as bonus action
    const combat = getPlayerCombat(context.playerId);
    if (combat) {
      return {
        type: 'combat_queue_action',
        bonusAction: {
          type: 'eat_food',
          itemId,
          itemName: item.name,
        },
        message: `Mangerai ${item.name} nel prossimo turno!`,
      };
    }

    // Out of combat - execute immediately
    const effectMsg = item.effect?.message || 'Delizioso!';

    return {
      type: 'consume_item',
      message: `Mangi ${item.name}.\n${effectMsg}`,
      broadcastMessage: `${context.playerName} mangia qualcosa.`,
      consumedItemId: itemId,
    };
  }
}
