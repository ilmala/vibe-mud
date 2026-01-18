import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getRoomItems, removeItemFromRoom } from '../../items';
import { getItemById, canCarryItem, calculateTotalWeight, formatWeight } from '../../../data/items';

export class PickupCommand implements CommandHandler {
  name = 'prendi';
  aliases = ['raccogli', 'take', 'get'];
  requiresArg = true;
  description = 'Raccogli un oggetto dalla stanza';
  usage = 'prendi <oggetto>';

  execute(arg: string, context: CommandContext): CommandResult {
    const itemName = arg.toLowerCase();
    const roomItemIds = getRoomItems(context.currentRoomId);

    // Find the item by name
    const itemId = roomItemIds.find(id => {
      const item = getItemById(id);
      return item?.name.toLowerCase() === itemName;
    });

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

    if (item.takeable === false) {
      return {
        type: 'error',
        message: `Non puoi prendere ${item.name}.`,
      };
    }

    // Weight validation
    if (!canCarryItem(context.playerInventory || [], itemId, context.maxWeight!)) {
      const currentWeight = calculateTotalWeight(context.playerInventory || []);
      const itemWeight = item.weight ?? 0.5;
      return {
        type: 'error',
        message: `${item.name} is too heavy! You are currently carrying ${formatWeight(currentWeight)} and this item weighs ${formatWeight(itemWeight)}. Your limit is ${formatWeight(context.maxWeight!)}.`,
      };
    }

    // Remove from room (runtime state)
    removeItemFromRoom(context.currentRoomId, itemId);

    // NOTE: Do NOT modify player.inventory here
    // The server.ts will do it based on result.itemId

    return {
      type: 'pickup',
      message: `Prendi ${item.name}.`,
      broadcastMessage: `${context.playerName} raccoglie ${item.name}.`,
      itemId: itemId,
    };
  }
}
