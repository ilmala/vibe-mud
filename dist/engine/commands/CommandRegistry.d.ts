import { CommandHandler, CommandContext, CommandResult } from './CommandHandler';
export declare class CommandRegistry {
    private commands;
    register(handler: CommandHandler): void;
    registerAll(handlers: CommandHandler[]): void;
    execute(commandName: string, arg: string, context: CommandContext): CommandResult;
    getAllHandlers(): CommandHandler[];
}
//# sourceMappingURL=CommandRegistry.d.ts.map