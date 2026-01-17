"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SayCommand = void 0;
class SayCommand {
    constructor() {
        this.name = 'dici';
        this.aliases = ['say'];
        this.requiresArg = true;
        this.description = 'Invia un messaggio ai giocatori presenti';
        this.usage = 'dici <messaggio>';
    }
    execute(arg, context) {
        return {
            type: 'say',
            message: arg,
        };
    }
}
exports.SayCommand = SayCommand;
//# sourceMappingURL=SayCommand.js.map