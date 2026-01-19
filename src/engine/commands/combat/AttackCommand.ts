import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { isPlayerInCombat, getPlayerCombat } from '../../combat';

export class AttackCommand implements CommandHandler {
  name = 'attacca';
  aliases = ['attack', 'colpisci', 'hit'];
  requiresArg = false;
  description = 'Attacca un nemico';
  usage = 'attacca [nemico]';

  execute(arg: string, context: CommandContext): CommandResult {
    // Check if player is already in combat
    if (isPlayerInCombat(context.playerId)) {
      // Continue ongoing combat - attack current target
      return {
        type: 'combat_attack',
        combatAction: 'attack',
      };
    }

    // Start new combat
    if (!arg) {
      return {
        type: 'error',
        message: 'Attacca chi? Specifica il nome del nemico: attacca <nemico>',
      };
    }

    const targetName = arg.toLowerCase();

    // Look for a monster in the room
    const monster = context.monstersInRoom?.find(m => m.name.toLowerCase().includes(targetName));

    if (!monster) {
      return {
        type: 'error',
        message: `Non vedi alcun "${arg}" da attaccare qui.`,
      };
    }

    // Check if monster is alive
    if (monster.currentHp <= 0) {
      return {
        type: 'error',
        message: `${monster.name} è già morto.`,
      };
    }

    return {
      type: 'combat_start',
      targetId: monster.id,
      targetName: monster.name,
      targetIsMonster: true,
      combatAction: 'attack',
    };
  }
}
