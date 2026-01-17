import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { CommandRegistry } from '../CommandRegistry';
export declare class HelpCommand implements CommandHandler {
    name: string;
    aliases: string[];
    requiresArg: boolean;
    description: string;
    usage: string;
    private registry;
    constructor(registry: CommandRegistry);
    execute(arg: string, context: CommandContext): CommandResult;
}
//# sourceMappingURL=HelpCommand.d.ts.map