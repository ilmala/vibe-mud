"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomDescription = void 0;
exports.handleCommand = handleCommand;
const commands_1 = require("./commands");
const utils_1 = require("./utils");
Object.defineProperty(exports, "getRoomDescription", { enumerable: true, get: function () { return utils_1.getRoomDescription; } });
const registry = (0, commands_1.initializeCommands)();
function handleCommand(command, currentRoomId, playerId = '', playerName = '', otherPlayersInRoom) {
    const context = {
        playerId,
        playerName,
        currentRoomId,
        otherPlayersInRoom,
    };
    return registry.execute(command.cmd, command.arg, context);
}
//# sourceMappingURL=gameLogic.js.map