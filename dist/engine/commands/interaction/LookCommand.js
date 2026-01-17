"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookCommand = void 0;
const utils_1 = require("../../utils");
class LookCommand {
    constructor() {
        this.name = 'guarda';
        this.aliases = ['look'];
        this.requiresArg = false;
        this.description = 'Guarda la stanza attuale';
        this.usage = 'guarda';
    }
    execute(arg, context) {
        return {
            type: 'look',
            message: (0, utils_1.getRoomDescription)(context.currentRoomId, context.otherPlayersInRoom),
        };
    }
}
exports.LookCommand = LookCommand;
//# sourceMappingURL=LookCommand.js.map