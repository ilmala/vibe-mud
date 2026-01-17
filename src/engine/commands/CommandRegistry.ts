import { CommandHandler, CommandContext, CommandResult } from './CommandHandler';

export class CommandRegistry {
  private commands: Map<string, CommandHandler> = new Map();

  register(handler: CommandHandler): void {
    this.commands.set(handler.name, handler);
    if (handler.aliases) {
      for (const alias of handler.aliases) {
        this.commands.set(alias, handler);
      }
    }
  }

  registerAll(handlers: CommandHandler[]): void {
    for (const handler of handlers) {
      this.register(handler);
    }
  }

  execute(commandName: string, arg: string, context: CommandContext): CommandResult {
    const handler = this.commands.get(commandName.toLowerCase());

    if (!handler) {
      return {
        type: 'error',
        message: 'Comando non riconosciuto.',
      };
    }

    if (handler.requiresArg && !arg) {
      return {
        type: 'error',
        message: `Devi inserire un argomento. Usa: ${handler.usage}`,
      };
    }

    return handler.execute(arg, context);
  }

  getAllHandlers(): CommandHandler[] {
    const uniqueHandlers = new Set<CommandHandler>();
    for (const handler of this.commands.values()) {
      uniqueHandlers.add(handler);
    }
    return Array.from(uniqueHandlers);
  }
}
