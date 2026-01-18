import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getItemById, calculateTotalWeight, formatWeight } from '../../../data/items';

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
        message: `🎒 Your inventory is empty.\n⚖️  Weight: 0.0 kg / ${formatWeight(context.maxWeight!)}`,
      };
    }

    const itemDescriptions = context.playerInventory
      .map(id => {
        const item = getItemById(id);
        if (!item) return null;
        const weight = item.weight ?? 0.5;
        return `  📦 ${item.name} (${formatWeight(weight)})`;
      })
      .filter(desc => desc !== null);

    const currentWeight = calculateTotalWeight(context.playerInventory);
    const header = `🎒 Inventory (${context.playerInventory.length} items):`;
    const items = itemDescriptions.join('\n');
    const weightInfo = `\n⚖️  Total weight: ${formatWeight(currentWeight)} / ${formatWeight(context.maxWeight!)}`;

    return {
      type: 'info',
      message: `${header}\n${items}${weightInfo}`,
    };
  }
}
