"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveCommand = void 0;
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
class MoveCommand {
    constructor() {
        this.name = 'vai';
        this.requiresArg = true;
        this.description = 'Muoviti verso una direzione specifica';
        this.usage = 'vai <direzione>';
    }
    execute(arg, context) {
        const normalizedDirection = DIRECTION_MAP[arg.toLowerCase()];
        if (!normalizedDirection) {
            return {
                type: 'error',
                message: 'Direzione non riconosciuta.',
            };
        }
        const currentRoom = (0, world_1.getRoomById)(context.currentRoomId);
        if (!currentRoom) {
            return {
                type: 'error',
                message: 'Stanza attuale non trovata.',
            };
        }
        const nextRoomId = currentRoom.exits[normalizedDirection];
        if (!nextRoomId) {
            return {
                type: 'error',
                message: `Non puoi andare a ${arg}.`,
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
exports.MoveCommand = MoveCommand;
//# sourceMappingURL=MoveCommand.js.map