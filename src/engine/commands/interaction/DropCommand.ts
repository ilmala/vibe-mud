import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { addItemToRoom } from '../../items';
import { getItemById } from '../../../data/items';

export class DropCommand implements CommandHandler {
  name = 'lascia';
  aliases = ['drop', 'posa'];
  requiresArg = true;
  description = 'Lascia un oggetto dal tuo inventario';
  usage = 'lascia <oggetto>';

  execute(arg: string, context: CommandContext): CommandResult {
    const itemName = arg.toLowerCase();

    if (!context.playerInventory || context.playerInventory.length === 0) {
      return {
        type: 'error',
        message: 'Il tuo inventario è vuoto.',
      };
    }

    // Search in player's inventory
    const itemId = context.playerInventory.find(id => {
      const item = getItemById(id);
      return item?.name.toLowerCase() === itemName;
    });

    if (!itemId) {
      return {
        type: 'error',
        message: `Non hai "${arg}" nel tuo inventario.`,
      };
    }

    const item = getItemById(itemId);
    if (!item) {
      return {
        type: 'error',
        message: 'Errore interno: oggetto non trovato nel registro.',
      };
    }

    // Add to room (runtime state)
    addItemToRoom(context.currentRoomId, itemId);

    return {
      type: 'drop',
      message: `Lasci ${item.name}.`,
      broadcastMessage: `${context.playerName} posa ${item.name}.`,
      itemId: itemId,
    };
  }
}
