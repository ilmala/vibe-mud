import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getSlotName } from '../../equipment';
import { getItemById } from '../../../data/items';
import type { EquipmentSlot } from '../../../models';

export class UnequipCommand implements CommandHandler {
  name = 'rimuovi';
  aliases = ['unequip', 'remove', 'togli'];
  requiresArg = true;
  description = 'Rimuovi un equipaggiamento';
  usage = 'rimuovi <slot o nome oggetto>';

  execute(arg: string, context: CommandContext): CommandResult {
    const input = arg.toLowerCase();
    const equipment = context.playerEquipment || {};

    // Map of slot names to slot keys
    const slotMap: Record<string, EquipmentSlot> = {
      'mano destra': 'rightHand',
      'mano sinistra': 'leftHand',
      'destra': 'rightHand',
      'sinistra': 'leftHand',
      'armatura': 'armor',
      'elmo': 'helmet',
      'stivali': 'boots',
      'guanti': 'gloves',
      'anello 1': 'ring1',
      'anello 2': 'ring2',
      'anello': 'ring1', // Default to first ring
      'amuleto': 'amulet',
    };

    // Try to match slot name
    for (const [slotName, slotKey] of Object.entries(slotMap)) {
      if (input.includes(slotName)) {
        return {
          type: 'unequip',
          slot: slotKey,
          message: `Rimuovi ${getSlotName(slotKey)}...`,
        };
      }
    }

    // Try to match item name
    for (const [slotKey, itemId] of Object.entries(equipment)) {
      if (itemId) {
        const item = getItemById(itemId);
        if (item?.name.toLowerCase().includes(input)) {
          return {
            type: 'unequip_by_name',
            itemName: item.name,
            message: `Rimuovi ${item.name}...`,
          };
        }
      }
    }

    return {
      type: 'error',
      message: `Non hai "${arg}" equipaggiato o non è uno slot valido.`,
    };
  }
}
