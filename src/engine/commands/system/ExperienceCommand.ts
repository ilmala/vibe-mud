import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getExperienceString } from '../../experience';

export class ExperienceCommand implements CommandHandler {
  name = 'esperienza';
  aliases = ['exp', 'experience'];
  requiresArg = false;
  description = 'Mostra i tuoi punti esperienza';
  usage = 'esperienza';

  execute(arg: string, context: CommandContext): CommandResult {
    const playerExp = context.playerExperience ?? 0;
    const expString = getExperienceString(playerExp);

    return {
      type: 'info',
      message: `⭐ Esperienza: ${expString}`,
    };
  }
}
