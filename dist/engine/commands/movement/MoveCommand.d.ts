import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
export declare class MoveCommand implements CommandHandler {
    name: string;
    requiresArg: boolean;
    description: string;
    usage: string;
    execute(arg: string, context: CommandContext): CommandResult;
}
//# sourceMappingURL=MoveCommand.d.ts.map