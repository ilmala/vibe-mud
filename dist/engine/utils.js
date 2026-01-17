"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomDescription = getRoomDescription;
const world_1 = require("../data/world");
function getRoomDescription(roomId, otherPlayers) {
    const room = (0, world_1.getRoomById)(roomId);
    if (!room) {
        return 'Stanza non trovata.';
    }
    const exitList = [];
    if (room.exits.north)
        exitList.push('nord');
    if (room.exits.south)
        exitList.push('sud');
    if (room.exits.east)
        exitList.push('est');
    if (room.exits.west)
        exitList.push('ovest');
    const exitsText = exitList.length > 0 ? `\n[Uscite: ${exitList.join(', ')}]` : '\n[Nessuna uscita]';
    let playersText = '';
    if (otherPlayers && otherPlayers.length > 0) {
        playersText = `\n[Presenti: ${otherPlayers.join(', ')}]`;
    }
    return `${room.title}\n\n${room.description}${exitsText}${playersText}`;
}
//# sourceMappingURL=utils.js.map