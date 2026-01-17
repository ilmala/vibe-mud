import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
export declare class DirectionCommand implements CommandHandler {
    name: string;
    aliases?: string[];
    requiresArg: boolean;
    description: string;
    usage: string;
    private italianDirection;
    private englishDirection;
    constructor(italianDirection: string, englishDirection: string);
    execute(arg: string, context: CommandContext): CommandResult;
}
//# sourceMappingURL=DirectionCommand.d.ts.map