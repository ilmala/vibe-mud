import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getItemById } from '../../../data/items';

export class BeviCommand implements CommandHandler {
  name = 'bevi';
  aliases = ['drink', 'bere'];
  requiresArg = true;
  description = 'Bevi una pozione';
  usage = 'bevi <pozione>';

  execute(arg: string, context: CommandContext): CommandResult {
    if (!arg) {
      return {
        type: 'error',
        message: 'Cosa vuoi bere? Usa: bevi <pozione>',
      };
    }

    const itemName = arg.toLowerCase();

    // Search for a potion in inventory
    const itemId = context.playerInventory?.find(id => {
      const item = getItemById(id);
      return item?.name.toLowerCase().includes(itemName) && item?.type === 'potion';
    });

    if (!itemId) {
      return {
        type: 'error',
        message: `Non hai nessuna pozione chiamata "${arg}".`,
      };
    }

    const item = getItemById(itemId);
    if (!item) {
      return {
        type: 'error',
        message: 'Errore interno.',
      };
    }

    // Get effect message
    const effectMsg = item.effect?.message || 'Ti senti rinvigorito!';

    return {
      type: 'consume_item',
      message: `Bevi ${item.name}.\n${effectMsg}`,
      broadcastMessage: `${context.playerName} beve una pozione.`,
      consumedItemId: itemId,
    };
  }
}
