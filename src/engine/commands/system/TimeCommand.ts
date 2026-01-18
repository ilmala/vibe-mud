import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getCurrentPhase, getPhaseDisplayName, getDayTimeString } from '../../gameTime';

export class TimeCommand implements CommandHandler {
  name = 'tempo';
  aliases = ['ora', 'time'];
  requiresArg = false;
  description = 'Mostra l\'ora attuale del gioco';
  usage = 'tempo';

  execute(arg: string, context: CommandContext): CommandResult {
    const phase = getCurrentPhase();
    const phaseName = getPhaseDisplayName(phase);
    const timeString = getDayTimeString();

    return {
      type: 'info',
      message: `🕐 ${phaseName} - ${timeString}`,
    };
  }
}
