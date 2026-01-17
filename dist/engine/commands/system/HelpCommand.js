"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCommand = void 0;
class HelpCommand {
    constructor(registry) {
        this.name = 'aiuto';
        this.aliases = ['help'];
        this.requiresArg = false;
        this.description = 'Mostra l\'aiuto disponibile';
        this.usage = 'aiuto';
        this.registry = registry;
    }
    execute(arg, context) {
        const handlers = this.registry.getAllHandlers();
        // Group handlers by category based on their name/description
        const movement = [];
        const interaction = [];
        const system = [];
        for (const handler of handlers) {
            if (handler.description.toLowerCase().includes('muov')) {
                movement.push(handler);
            }
            else if (handler.description.toLowerCase().includes('messag') || handler.description.toLowerCase().includes('guarda')) {
                interaction.push(handler);
            }
            else {
                system.push(handler);
            }
        }
        let helpText = `
╔════════════════════════════════════════════╗
║            COMANDI DISPONIBILI             ║
╚════════════════════════════════════════════╝
`;
        if (movement.length > 0) {
            helpText += '\nMOVIMENTO:\n';
            for (const handler of movement) {
                const aliases = handler.aliases ? `, ${handler.aliases.join(', ')}` : '';
                helpText += `  ${handler.name}${aliases}    ${handler.description}\n`;
            }
        }
        if (interaction.length > 0) {
            helpText += '\nINTERAZIONE:\n';
            for (const handler of interaction) {
                const aliases = handler.aliases ? `, ${handler.aliases.join(', ')}` : '';
                helpText += `  ${handler.name}${aliases}    ${handler.description}\n`;
            }
        }
        if (system.length > 0) {
            helpText += '\nINFORMAZIONI:\n';
            for (const handler of system) {
                const aliases = handler.aliases ? `, ${handler.aliases.join(', ')}` : '';
                helpText += `  ${handler.name}${aliases}    ${handler.description}\n`;
            }
        }
        helpText += '\nCONNESSIONE:\n';
        helpText += '  exit, quit               Esci dal gioco (nel client)\n';
        return {
            type: 'help',
            message: helpText,
        };
    }
}
exports.HelpCommand = HelpCommand;
//# sourceMappingURL=HelpCommand.js.map