"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRegistry = void 0;
class CommandRegistry {
    constructor() {
        this.commands = new Map();
    }
    register(handler) {
        this.commands.set(handler.name, handler);
        if (handler.aliases) {
            for (const alias of handler.aliases) {
                this.commands.set(alias, handler);
            }
        }
    }
    registerAll(handlers) {
        for (const handler of handlers) {
            this.register(handler);
        }
    }
    execute(commandName, arg, context) {
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
    getAllHandlers() {
        const uniqueHandlers = new Set();
        for (const handler of this.commands.values()) {
            uniqueHandlers.add(handler);
        }
        return Array.from(uniqueHandlers);
    }
}
exports.CommandRegistry = CommandRegistry;
//# sourceMappingURL=CommandRegistry.js.map