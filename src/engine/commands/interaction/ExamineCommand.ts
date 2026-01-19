import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getRoomItems } from '../../items';
import { getItemById } from '../../../data/items';
import { getNPCsInRoom } from '../../npcs';
import { getNPCByName } from '../../../data/npcs';
import { getMonstersInRoom } from '../../monsters';
import { getMonsterByName } from '../../../data/monsters';

export class ExamineCommand implements CommandHandler {
  name = 'esamina';
  aliases = ['examine', 'inspect', 'guarda oggetto'];
  requiresArg = true;
  description = 'Esamina un oggetto in dettaglio';
  usage = 'esamina <oggetto>';

  execute(arg: string, context: CommandContext): CommandResult {
    const targetName = arg.toLowerCase();

    // Check for MONSTERS first (priority 1)
    const monstersInRoom = getMonstersInRoom(context.currentRoomId);
    const monsterMatch = monstersInRoom.find(m => m.name.toLowerCase().includes(targetName));

    if (monsterMatch) {
      const fullMonster = getMonsterByName(monsterMatch.name);
      if (fullMonster) {
        const emoji = fullMonster.emoji || '👹';
        const currentHp = monsterMatch.currentHp;
        const maxHp = monsterMatch.maxHp;

        // Health bar
        const hpPercent = (currentHp / maxHp) * 100;
        const hpBar = this.generateHealthBar(hpPercent);

        // Loot display
        let lootText = '';
        if (fullMonster.inventory.length > 0) {
          const lootItems = fullMonster.inventory
            .map(id => getItemById(id)?.name)
            .filter(name => name);
          if (lootItems.length > 0) {
            lootText = `\n💰 Possibile bottino: ${lootItems.join(', ')}`;
          }
        }

        return {
          type: 'info',
          message:
            `${emoji} ${fullMonster.name}\n\n` +
            `${fullMonster.description}\n\n` +
            `❤️  Vita: ${currentHp}/${maxHp} ${hpBar}\n` +
            `⚔️  Attacco: ${fullMonster.attack}\n` +
            `🛡️  Difesa: ${fullMonster.defense}\n` +
            `⭐ Esperienza: ${fullMonster.experienceDrop} XP` +
            lootText,
        };
      }
    }

    // Check for NPCs (priority 2)
    const npcsInRoom = getNPCsInRoom(context.currentRoomId);
    const npcMatch = npcsInRoom.find(npc => npc.name.toLowerCase().includes(targetName));

    if (npcMatch) {
      const fullNPC = getNPCByName(npcMatch.name);
      if (fullNPC) {
        const emoji = fullNPC.emoji || '👤';
        return {
          type: 'info',
          message: `${emoji} ${fullNPC.name}\n\n${fullNPC.description}`,
        };
      }
    }

    // Search first in inventory
    let itemId = context.playerInventory?.find(id => {
      const item = getItemById(id);
      return item?.name.toLowerCase() === targetName;
    });

    let location = 'inventario';

    // If not found in inventory, search in room
    if (!itemId) {
      const roomItemIds = getRoomItems(context.currentRoomId);
      itemId = roomItemIds.find(id => {
        const item = getItemById(id);
        return item?.name.toLowerCase() === targetName;
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

  private generateHealthBar(hpPercent: number): string {
    const barLength = 10;
    const filledBars = Math.round((hpPercent / 100) * barLength);
    const filled = '█'.repeat(filledBars);
    const empty = '░'.repeat(barLength - filledBars);
    return `[${filled}${empty}]`;
  }
}
