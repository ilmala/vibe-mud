import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';

export class StatsCommand implements CommandHandler {
  name = 'stats';
  aliases = ['scheda', 'status', 'statistiche'];
  requiresArg = false;
  description = 'Visualizza le tue statistiche e equipaggiamento';
  usage = 'stats';

  execute(_arg: string, context: CommandContext): CommandResult {
    // Server will handle stats calculation and display
    return {
      type: 'show_stats',
      message: 'Visualizzi le tue statistiche...',
    };
  }
}
