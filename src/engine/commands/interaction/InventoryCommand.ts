import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getItemById } from '../../../data/items';

export class InventoryCommand implements CommandHandler {
  name = 'inventario';
  aliases = ['inv', 'inventory'];
  requiresArg = false;
  description = 'Mostra il contenuto del tuo inventario';
  usage = 'inventario';

  execute(arg: string, context: CommandContext): CommandResult {
    if (!context.playerInventory || context.playerInventory.length === 0) {
      return {
        type: 'info',
        message: '🎒 Il tuo inventario è vuoto.',
      };
    }

    const itemDescriptions = context.playerInventory
      .map(id => {
        const item = getItemById(id);
        return item ? `  📦 ${item.name}` : null;
      })
      .filter(desc => desc !== null);

    const header = `🎒 Inventario (${context.playerInventory.length} oggetti):`;
    const items = itemDescriptions.join('\n');

    return {
      type: 'info',
      message: `${header}\n${items}`,
    };
  }
}
