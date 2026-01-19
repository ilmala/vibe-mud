import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getExperienceString, calculateLevel, getExperienceProgress, getNextLevelThreshold } from '../../experience';

export class ExperienceCommand implements CommandHandler {
  name = 'esperienza';
  aliases = ['exp', 'experience'];
  requiresArg = false;
  description = 'Mostra i tuoi punti esperienza e livello';
  usage = 'esperienza';

  execute(arg: string, context: CommandContext): CommandResult {
    const playerExp = context.playerExperience ?? 0;
    const currentLevel = calculateLevel(playerExp);
    const progress = getExperienceProgress(playerExp, currentLevel);
    const nextThreshold = getNextLevelThreshold(currentLevel);

    let message = `⭐ Livello: ${currentLevel}\n`;
    message += `📊 Esperienza: ${playerExp}`;

    if (nextThreshold !== null) {
      message += `\n📈 Progresso al livello ${currentLevel + 1}: ${progress.progressToNext.toFixed(1)}%`;
      message += `\n   (${progress.currentLevelXp} / ${progress.nextLevelXp} XP)`;
    } else {
      message += `\n🏆 Hai raggiunto il livello massimo!`;
    }

    return {
      type: 'info',
      message,
    };
  }
}
