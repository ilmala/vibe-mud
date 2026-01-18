import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getRoomItems } from '../../items';
import { getItemById } from '../../../data/items';

export class ExamineCommand implements CommandHandler {
  name = 'esamina';
  aliases = ['examine', 'inspect', 'guarda oggetto'];
  requiresArg = true;
  description = 'Esamina un oggetto in dettaglio';
  usage = 'esamina <oggetto>';

  execute(arg: string, context: CommandContext): CommandResult {
    const itemName = arg.toLowerCase();

    // Search first in inventory
    let itemId = context.playerInventory?.find(id => {
      const item = getItemById(id);
      return item?.name.toLowerCase() === itemName;
    });

    let location = 'inventario';

    // If not found in inventory, search in room
    if (!itemId) {
      const roomItemIds = getRoomItems(context.currentRoomId);
      itemId = roomItemIds.find(id => {
        const item = getItemById(id);
        return item?.name.toLowerCase() === itemName;
      });
      location = 'stanza';
    }

    if (!itemId) {
      return {
        type: 'error',
        message: `Non riesci a trovare "${arg}" qui.`,
      };
    }

    const item = getItemById(itemId);
    if (!item) {
      return {
        type: 'error',
        message: 'Errore interno: oggetto non trovato nel registro.',
      };
    }

    const locationText = location === 'inventario' ? '(nel tuo inventario)' : '(nella stanza)';

    return {
      type: 'info',
      message: `🔍 ${item.name} ${locationText}\n\n${item.description}`,
    };
  }
}
