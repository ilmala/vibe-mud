import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';

export class SayCommand implements CommandHandler {
  name = 'dici';
  aliases = ['say'];
  requiresArg = true;
  description = 'Invia un messaggio ai giocatori presenti';
  usage = 'dici <messaggio>';

  execute(arg: string, context: CommandContext): CommandResult {
    return {
      type: 'say',
      message: arg,
    };
  }
}
