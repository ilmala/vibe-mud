import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getMonstersInRoom, setMonsterHp } from '../../monsters';
import { getMonsterById } from '../../../data/monsters';
import { trackMonsterDefeat } from '../../respawn';

/**
 * DEBUG COMMAND: Kill a monster for testing respawn
 * Usage: uccidi <monster name>
 */
export class KillDebugCommand implements CommandHandler {
  name = 'uccidi';
  aliases = ['kill', 'sconfitta'];
  requiresArg = true;
  description = '[DEBUG] Sconfiggi un mostro per testare il respawn';
  usage = 'uccidi <mostro>';

  execute(arg: string, context: CommandContext): CommandResult {
    const monsterName = arg.toLowerCase();
    const monstersInRoom = getMonstersInRoom(context.currentRoomId) || [];

    // Find the monster
    const monsterMatch = monstersInRoom.find(m =>
      m.name.toLowerCase().includes(monsterName)
    );

    if (!monsterMatch) {
      return {
        type: 'error',
        message: `Non riesci a trovare "${arg}" qui.`,
      };
    }

    const monster = getMonsterById(monsterMatch.id);
    if (!monster) {
      return {
        type: 'error',
        message: 'Errore interno: mostro non trovato nel registro.',
      };
    }

    // Kill the monster
    setMonsterHp(monsterMatch.id, 0);

    // Track for respawn
    trackMonsterDefeat(
      monsterMatch.id,
      monster.name,
      context.currentRoomId,
      monster.maxHp
    );

    return {
      type: 'interact',
      message: `💀 Hai sconfitto ${monster.name}!\n⭐ Esperienza: +${monster.experienceDrop} XP\n🔄 Respawn in ${Math.ceil(180 / 1000)} minuti`,
      broadcastMessage: `💀 ${context.playerName} ha sconfitto ${monster.name}!`,
    };
  }
}
