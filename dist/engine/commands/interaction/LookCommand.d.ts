import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
export declare class LookCommand implements CommandHandler {
    name: string;
    aliases: string[];
    requiresArg: boolean;
    description: string;
    usage: string;
    execute(arg: string, context: CommandContext): CommandResult;
}
//# sourceMappingURL=LookCommand.d.ts.map