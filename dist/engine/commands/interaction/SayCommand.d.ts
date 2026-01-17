import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
export declare class SayCommand implements CommandHandler {
    name: string;
    aliases: string[];
    requiresArg: boolean;
    description: string;
    usage: string;
    execute(arg: string, context: CommandContext): CommandResult;
}
//# sourceMappingURL=SayCommand.d.ts.map