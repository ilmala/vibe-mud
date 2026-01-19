import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getItemById } from '../../../data/items';

export class LeggiCommand implements CommandHandler {
  name = 'leggi';
  aliases = ['read', 'leggere'];
  requiresArg = true;
  description = 'Leggi una pergamena o libro';
  usage = 'leggi <pergamena>';

  execute(arg: string, context: CommandContext): CommandResult {
    if (!arg) {
      return {
        type: 'error',
        message: 'Cosa vuoi leggere? Usa: leggi <pergamena>',
      };
    }

    const itemName = arg.toLowerCase();

    // Search for a scroll in inventory
    const itemId = context.playerInventory?.find(id => {
      const item = getItemById(id);
      return item?.name.toLowerCase().includes(itemName) && item?.type === 'scroll';
    });

    if (!itemId) {
      return {
        type: 'error',
        message: `Non hai nessuna pergamena chiamata "${arg}".`,
      };
    }

    const item = getItemById(itemId);
    if (!item) {
      return {
        type: 'error',
        message: 'Errore interno.',
      };
    }

    // Get content from effect message or description
    const content = item.effect?.message || item.description;

    return {
      type: 'consume_item',
      message: `Leggi ${item.name}:\n\n"${content}"\n\nLa pergamena si dissolve in polvere.`,
      broadcastMessage: `${context.playerName} legge una pergamena antica.`,
      consumedItemId: itemId,
    };
  }
}
