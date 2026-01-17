"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const world_1 = require("./data/world");
const parser_1 = require("./engine/parser");
const gameLogic_1 = require("./engine/gameLogic");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
const PORT = process.env.PORT || 3000;
// Store active players
const players = new Map();
const MOTD = `
╔════════════════════════════════════╗
║   Benvenuto a Nebula MUD           ║
╚════════════════════════════════════╝

Un mondo di avventure ti aspetta...
`;
io.on('connection', (socket) => {
    console.log(`[${socket.id}] Un giocatore si è connesso`);
    // Create new player with temporary name
    const player = {
        id: socket.id,
        name: 'Anonimo',
        roomId: world_1.STARTING_ROOM,
        socketId: socket.id,
    };
    players.set(socket.id, player);
    // Send MOTD
    socket.emit('message', MOTD);
    // Request player name
    socket.emit('requestName');
    // Listen for name from client
    socket.once('setName', (playerName) => {
        const trimmedName = playerName.trim().slice(0, 20);
        if (!trimmedName) {
            socket.emit('message', '❌ Il nome non può essere vuoto.');
            socket.emit('requestName');
            return;
        }
        // Update player name
        player.name = trimmedName;
        console.log(`[${socket.id}] Ha scelto il nome: ${player.name}`);
        // Join Socket.io room corresponding to the game room
        socket.join(world_1.STARTING_ROOM);
        // Send welcome message with player name
        socket.emit('message', `\nBenvenuto ${player.name}!\n`);
        // Show starting room with exits
        const otherPlayersInStarting = Array.from(players.values())
            .filter((p) => p.roomId === world_1.STARTING_ROOM && p.id !== player.id)
            .map((p) => p.name);
        const lookResult = (0, gameLogic_1.handleCommand)((0, parser_1.parseCommand)('guarda'), world_1.STARTING_ROOM, player.id, player.name, otherPlayersInStarting);
        socket.emit('message', `${lookResult.message}`);
        // Notify others that a player joined
        socket.to(world_1.STARTING_ROOM).emit('message', `\n[${player.name} è entrato nella stanza]`);
        // Setup command and chat listeners
        setupPlayerListeners(socket, player);
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        const player = players.get(socket.id);
        if (player) {
            console.log(`[${socket.id}] ${player.name} si è disconnesso`);
            io.to(player.roomId).emit('message', `\n[${player.name} se ne è andato]`);
            players.delete(socket.id);
        }
    });
});
function setupPlayerListeners(socket, player) {
    // Handle player commands
    socket.on('command', (input) => {
        console.log(`[${player.name}] Command: ${input}`);
        const command = (0, parser_1.parseCommand)(input);
        // Raccolgo i giocatori nella stanza attuale
        const otherPlayers = Array.from(players.values())
            .filter((p) => p.roomId === player.roomId && p.id !== player.id)
            .map((p) => p.name);
        const result = (0, gameLogic_1.handleCommand)(command, player.roomId, player.id, player.name, otherPlayers);
        if (result.type === 'move' && result.newRoomId) {
            const oldRoomId = player.roomId;
            const newRoomId = result.newRoomId;
            // Notify players in old room
            io.to(oldRoomId).emit('message', `\n[${player.name} se ne è andato]`);
            // Move player to new Socket.io room
            socket.leave(oldRoomId);
            socket.join(newRoomId);
            // Update player's room
            player.roomId = newRoomId;
            // Raccolgo i giocatori nella nuova stanza
            const otherPlayersInNewRoom = Array.from(players.values())
                .filter((p) => p.roomId === newRoomId && p.id !== player.id)
                .map((p) => p.name);
            // Get full description with other players
            const descriptionResult = (0, gameLogic_1.handleCommand)((0, parser_1.parseCommand)('guarda'), newRoomId, player.id, player.name, otherPlayersInNewRoom);
            // Send new room description to player
            socket.emit('message', `\nSei entrato in:\n\n${descriptionResult.message}`);
            // Notify players in new room
            socket.to(newRoomId).emit('message', `\n[${player.name} è entrato nella stanza]`);
        }
        else if (result.type === 'look') {
            socket.emit('message', `\n${result.message}`);
        }
        else if (result.type === 'help') {
            socket.emit('message', `\n${result.message}`);
        }
        else if (result.type === 'say' && result.message) {
            const fullMessage = `${player.name} dice: "${result.message}"`;
            io.to(player.roomId).emit('message', `\n${fullMessage}`);
            console.log(`[${player.name}] Say: ${result.message}`);
        }
        else if (result.type === 'error') {
            socket.emit('message', `\n❌ ${result.message}`);
        }
        else {
            socket.emit('message', `\n❌ Comando sconosciuto.`);
        }
    });
    // Handle chat messages
    socket.on('say', (message) => {
        const fullMessage = `${player.name} dice: "${message}"`;
        io.to(player.roomId).emit('message', `\n${fullMessage}`);
        console.log(`[${player.name}] Say: ${message}`);
    });
}
httpServer.listen(PORT, () => {
    console.log(`🎮 Server MUD in ascolto su http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map