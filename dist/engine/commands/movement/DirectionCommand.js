"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectionCommand = void 0;
const world_1 = require("../../../data/world");
const utils_1 = require("../../utils");
const DIRECTION_MAP = {
    nord: 'north',
    north: 'north',
    sud: 'south',
    south: 'south',
    est: 'east',
    east: 'east',
    ovest: 'west',
    west: 'west',
};
class DirectionCommand {
    constructor(italianDirection, englishDirection) {
        this.requiresArg = false;
        this.italianDirection = italianDirection;
        this.englishDirection = englishDirection;
        this.name = italianDirection;
        this.aliases = [englishDirection];
        this.description = `Muoviti verso ${italianDirection}`;
        this.usage = italianDirection;
    }
    execute(arg, context) {
        const currentRoom = (0, world_1.getRoomById)(context.currentRoomId);
        if (!currentRoom) {
            return {
                type: 'error',
                message: 'Stanza attuale non trovata.',
            };
        }
        const nextRoomId = currentRoom.exits[this.englishDirection];
        if (!nextRoomId) {
            return {
                type: 'error',
                message: `Non puoi andare a ${this.italianDirection}.`,
            };
        }
        const nextRoom = (0, world_1.getRoomById)(nextRoomId);
        if (!nextRoom) {
            return {
                type: 'error',
                message: 'La stanza di destinazione non esiste.',
            };
        }
        return {
            type: 'move',
            message: `Sei entrato in:\n\n${(0, utils_1.getRoomDescription)(nextRoomId)}`,
            newRoomId: nextRoomId,
        };
    }
}
exports.DirectionCommand = DirectionCommand;
//# sourceMappingURL=DirectionCommand.js.map