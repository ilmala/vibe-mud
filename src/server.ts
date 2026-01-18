import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { Player, Room } from './models';
import { STARTING_ROOM } from './data/world';
import { parseCommand } from './engine/parser';
import { handleCommand } from './engine/gameLogic';
import { initGameTime, tick, getPhaseChangeMessage } from './engine/gameTime';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Helper function to get an opposite direction
function getOppositeDirection(direction: string): string {
  const opposites: Record<string, string> = {
    nord: 'sud',
    sud: 'nord',
    est: 'ovest',
    ovest: 'est',
    su: 'giu',
    giu: 'su',
  };
  return opposites[direction.toLowerCase()] || direction;
}

// Store active players
const players: Map<string, Player> = new Map();

const MOTD = `
╔════════════════════════════════════╗
║   Benvenuto a Nebula MUD           ║
╚════════════════════════════════════╝

Un mondo di avventure ti aspetta...
`;

io.on('connection', (socket) => {
  console.log(`[${socket.id}] Un giocatore si è connesso`);

  // Create new player with temporary name
  const player: Player = {
    id: socket.id,
    name: 'Anonimo',
    roomId: STARTING_ROOM,
    socketId: socket.id,
    inventory: [],
    maxWeight: 50,
  };

  players.set(socket.id, player);

  // Send MOTD
  socket.emit('message', MOTD);

  // Request player name
  socket.emit('requestName');

  // Listen for the name from a client
  socket.once('setName', (playerName: string) => {
    const trimmedName = playerName.trim().slice(0, 20);

    if (!trimmedName) {
      socket.emit('message', '❌ Il nome non può essere vuoto.');
      socket.emit('requestName');
      return;
    }

    // Update player name
    player.name = trimmedName;
    console.log(`[${socket.id}] Ha scelto il nome: ${player.name}`);

    // Join the Socket.io room corresponding to the game room
    socket.join(STARTING_ROOM);

    // Send a welcome message with the player name
    socket.emit('message', `\nBenvenuto ${player.name}!\n`);

    // Show starting room with exits
    const otherPlayersInStarting = Array.from(players.values())
      .filter((p) => p.roomId === STARTING_ROOM && p.id !== player.id)
      .map((p) => p.name);
    const lookResult = handleCommand(
      parseCommand('guarda'),
      STARTING_ROOM,
      player.id,
      player.name,
      otherPlayersInStarting,
      player.inventory,
      player.maxWeight
    );
    socket.emit('message', `${lookResult.message}`);

    // Notify others that a player joined
    socket.to(STARTING_ROOM).emit('message', `\n[${player.name} è entrato nella stanza]`);

    // Set up command and chat listeners
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

function setupPlayerListeners(socket: any, player: Player): void {
  // Handle player commands
  socket.on('command', (input: string) => {
    console.log(`[${player.name}] Command: ${input}`);

    const command = parseCommand(input);

    // Raccolgo i giocatori nella stanza attuale
    const otherPlayers = Array.from(players.values())
      .filter((p) => p.roomId === player.roomId && p.id !== player.id)
      .map((p) => p.name);

    const result = handleCommand(
      command,
      player.roomId,
      player.id,
      player.name,
      otherPlayers,
      player.inventory,
      player.maxWeight
    );

    if (result.type === 'move' && result.newRoomId) {
      const oldRoomId = player.roomId;
      const newRoomId = result.newRoomId;
      const direction = result.direction;

      // Notify other players in the old room (not the player who is leaving)
      if (direction) {
        socket.to(oldRoomId).emit('message', `\n[${player.name} è andato a ${direction}]`);
      } else {
        socket.to(oldRoomId).emit('message', `\n[${player.name} se ne è andato]`);
      }

      // Move player to the new Socket.io room
      socket.leave(oldRoomId);
      socket.join(newRoomId);

      // Update player's room
      player.roomId = newRoomId;

      // Raccolgo i giocatori nella nuova stanza
      const otherPlayersInNewRoom = Array.from(players.values())
        .filter((p) => p.roomId === newRoomId && p.id !== player.id)
        .map((p) => p.name);

      // Get a full description with other players
      const descriptionResult = handleCommand(
        parseCommand('guarda'),
        newRoomId,
        player.id,
        player.name,
        otherPlayersInNewRoom,
        player.inventory,
        player.maxWeight
      );

      // Send new room description to player
      socket.emit('message', `\nSei entrato in:\n\n${descriptionResult.message}`);

      // Notify players in the new room
      if (direction) {
        const oppositeDirection = getOppositeDirection(direction);
        socket.to(newRoomId).emit('message', `\n[${player.name} è arrivato da ${oppositeDirection}]`);
      } else {
        socket.to(newRoomId).emit('message', `\n[${player.name} è entrato nella stanza]`);
      }
    } else if (result.type === 'interact') {
      // Notify player of their action
      socket.emit('message', `\n${result.message}`);

      // If a trigger was activated, notify all players in the room
      if (result.triggerActivated?.globalMessage) {
        io.to(player.roomId).emit('message', `\n🔧 ${result.triggerActivated.globalMessage}`);
      }
    } else if (result.type === 'look') {
      socket.emit('message', `\n${result.message}`);
    } else if (result.type === 'help') {
      socket.emit('message', `\n${result.message}`);
    } else if (result.type === 'say' && result.message) {
      const fullMessage = `${player.name} dice: "${result.message}"`;
      io.to(player.roomId).emit('message', `\n${fullMessage}`);
      console.log(`[${player.name}] Say: ${result.message}`);
    } else if (result.type === 'door') {
      socket.emit('message', `\n${result.message}`);

      if (result.broadcastMessage) {
        io.to(player.roomId).emit('message', `\n🚪 ${result.broadcastMessage}`);
      }
    } else if (result.type === 'pickup' && result.itemId) {
      // Add to player's inventory
      player.inventory.push(result.itemId);

      socket.emit('message', `\n${result.message}`);
      if (result.broadcastMessage) {
        socket.to(player.roomId).emit('message', `\n📦 ${result.broadcastMessage}`);
      }
    } else if (result.type === 'drop' && result.itemId) {
      // Remove from the player's inventory
      const index = player.inventory.indexOf(result.itemId);
      if (index > -1) {
        player.inventory.splice(index, 1);
      }

      socket.emit('message', `\n${result.message}`);
      if (result.broadcastMessage) {
        socket.to(player.roomId).emit('message', `\n📦 ${result.broadcastMessage}`);
      }
    } else if (result.type === 'info') {
      // For inventory and examine commands
      socket.emit('message', `\n${result.message}`);
    } else if (result.type === 'error') {
      socket.emit('message', `\n❌ ${result.message}`);
    } else {
      socket.emit('message', `\n❌ Comando sconosciuto.`);
    }
  });

  // Handle chat messages
  socket.on('say', (message: string) => {
    const fullMessage = `${player.name} dice: "${message}"`;
    io.to(player.roomId).emit('message', `\n${fullMessage}`);
    console.log(`[${player.name}] Say: ${message}`);
  });
}

// Initialize game time system
initGameTime();

// Game tick system - runs every second
setInterval(() => {
  const tickResult = tick();

  if (tickResult.phaseChanged && tickResult.newPhase) {
    // Broadcast phase change to all players
    const phaseMessage = getPhaseChangeMessage(tickResult.newPhase);
    io.emit('message', `\n${phaseMessage}`);

    console.log(`[GAME TIME] Phase changed to: ${tickResult.newPhase}`);
  }
}, 1000); // 1 second tick

httpServer.listen(PORT, () => {
  console.log(`🎮 Server MUD in ascolto su http://localhost:${PORT}`);
});
