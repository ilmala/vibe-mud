import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { canEquipItem } from '../../equipment';
import { getItemById } from '../../../data/items';

export class EquipCommand implements CommandHandler {
  name = 'indossa';
  aliases = ['equip', 'equipaggia', 'impugna', 'wear', 'wield'];
  requiresArg = true;
  description = 'Indossa un oggetto dal tuo inventario';
  usage = 'indossa <oggetto>';

  execute(arg: string, context: CommandContext): CommandResult {
    const itemName = arg.toLowerCase();
    const inventory = context.playerInventory || [];

    // Find the item by name in inventory
    const itemId = inventory.find((id) => {
      const item = getItemById(id);
      return item?.name.toLowerCase().includes(itemName);
    });

    if (!itemId) {
      return {
        type: 'error',
        message: `Non hai "${arg}" nell'inventario.`,
      };
    }

    const item = getItemById(itemId);
    if (!item) {
      return {
        type: 'error',
        message: 'Errore interno: oggetto non trovato nel registro.',
      };
    }

    // Check if item can be equipped
    const canEquip = canEquipItem(itemId);
    if (!canEquip.canEquip) {
      return {
        type: 'error',
        message: canEquip.reason || `Non puoi indossare "${item.name}".`,
      };
    }

    // Return success - server will handle equipment logic
    return {
      type: 'equip',
      itemId: itemId,
      message: `Indossi ${item.name}...`,
    };
  }
}
