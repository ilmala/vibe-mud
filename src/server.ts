import { v4 as uuidv4 } from 'uuid';
import { Player, Room, NPC, Monster } from './models';
import { STARTING_ROOM } from './data/world';
import { NPCS } from './data/npcs';
import { MONSTERS } from './data/monsters';
import { parseCommand } from './engine/parser';
import { handleCommand } from './engine/gameLogic';
import { initGameTime, tick, getPhaseChangeMessage } from './engine/gameTime';
import { initNPCTracking } from './engine/npcs';
import { initMonsterTracking } from './engine/monsters';
import { registerItemPickup, consumeItem } from './engine/items';
import { generateStatusBar } from './engine/utils';

const PORT = process.env.PORT || 3000;

// Type for WebSocket data attached to each connection
type PlayerWebSocketData = {
  playerId: string;
};

// Use Bun's ServerWebSocket type with our data type
type BunWebSocket = any;  // Bun.ServerWebSocket<PlayerWebSocketData> - type definitions incomplete, use any for now

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

// Map WebSocket to Player ID for quick lookup
const wsToPlayerId: Map<BunWebSocket, string> = new Map();

// Map Player ID to WebSocket for sending messages
const playerIdToWs: Map<string, BunWebSocket> = new Map();

// Store NPC locations (runtime tracking)
const npcLocations: Map<string, string> = new Map();

// Store Monster locations and HP (runtime tracking)
const monsterLocations: Map<string, string> = new Map();
const monsterHp: Map<string, number> = new Map();

const MOTD = `
╔════════════════════════════════════╗
║   Benvenuto a Nebula MUD           ║
╚════════════════════════════════════╝

Un mondo di avventure ti aspetta...
`;

// Helper: Send message to a single player
function sendToPlayer(playerId: string, message: string): void {
  const ws = playerIdToWs.get(playerId);
  if (ws && ws.readyState === 1) { // 1 = OPEN
    ws.send(JSON.stringify({ type: 'message', data: message }));
  }
}

// Helper: Send message to a player with status bar (level + HP)
function sendToPlayerWithStatus(playerId: string, message: string): void {
  const player = players.get(playerId);
  if (!player) return;

  const currentHp = player.currentHp ?? player.maxHp;
  const statusBar = generateStatusBar(player.level, currentHp, player.maxHp);
  const fullMessage = message + statusBar;

  sendToPlayer(playerId, fullMessage);
}

// Helper: Broadcast to all players in a room (excluding sender if specified)
function broadcastToRoom(roomId: string, message: string, excludePlayerId?: string): void {
  for (const [playerId, player] of players.entries()) {
    if (player.roomId === roomId && playerId !== excludePlayerId) {
      sendToPlayer(playerId, message);
    }
  }
}

// Helper: Send to all connected players
function broadcastToAll(message: string): void {
  for (const [playerId] of players.entries()) {
    sendToPlayer(playerId, message);
  }
}

// Initialize game data
function initializeNPCs(): void {
  NPCS.forEach(npc => {
    npcLocations.set(npc.id, npc.roomId);
  });
  console.log(`🤖 Initialized ${NPCS.length} NPCs`);
}

function initializeMonsters(): void {
  MONSTERS.forEach(monster => {
    monsterLocations.set(monster.id, monster.roomId);
    monsterHp.set(monster.id, monster.maxHp);
  });
  console.log(`👹 Initialized ${MONSTERS.length} Monsters`);
}

// Handle incoming messages from client
function handleMessage(ws: BunWebSocket, message: string | Buffer): void {
  try {
    const data = typeof message === 'string' ? message : message.toString();
    const parsed = JSON.parse(data);

    const playerId = ws.data.playerId;
    const player = players.get(playerId);

    if (!player) {
      ws.send(JSON.stringify({ type: 'error', data: 'Player not found' }));
      return;
    }

    if (parsed.type === 'setName') {
      const playerName = (parsed.data || '').trim().slice(0, 20);

      if (!playerName) {
        sendToPlayer(playerId, '❌ Il nome non può essere vuoto.');
        ws.send(JSON.stringify({ type: 'requestName' }));
        return;
      }

      // Update player name
      player.name = playerName;
      console.log(`[${playerId}] Ha scelto il nome: ${player.name}`);

      // Subscribe to the starting room
      ws.subscribe(`room:${STARTING_ROOM}`);
      ws.subscribe(`player:${playerId}`);

      // Send welcome message
      sendToPlayer(playerId, `\nBenvenuto ${player.name}!\n`);

      // Show starting room
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
        player.maxWeight,
        player.experience,
        player.level
      );
      sendToPlayerWithStatus(playerId, `${lookResult.message}`);

      // Notify others that a player joined
      broadcastToRoom(STARTING_ROOM, `\n[${player.name} è entrato nella stanza]`, playerId);
    } else if (parsed.type === 'command') {
      const input = parsed.data || '';
      console.log(`[${player.name}] Command: ${input}`);

      const command = parseCommand(input);

      // Get other players in room
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
        player.maxWeight,
        player.experience,
        player.level
      );

      if (result.type === 'move' && result.newRoomId) {
        const oldRoomId = player.roomId;
        const newRoomId = result.newRoomId;
        const direction = result.direction;

        // Notify other players in old room
        if (direction) {
          broadcastToRoom(oldRoomId, `\n[${player.name} è andato a ${direction}]`, playerId);
        } else {
          broadcastToRoom(oldRoomId, `\n[${player.name} se ne è andato]`, playerId);
        }

        // Unsubscribe from old room, subscribe to new room
        ws.unsubscribe(`room:${oldRoomId}`);
        ws.subscribe(`room:${newRoomId}`);

        // Update player's room
        player.roomId = newRoomId;

        // Get other players in new room
        const otherPlayersInNewRoom = Array.from(players.values())
          .filter((p) => p.roomId === newRoomId && p.id !== player.id)
          .map((p) => p.name);

        // Get room description
        const descriptionResult = handleCommand(
          parseCommand('guarda'),
          newRoomId,
          player.id,
          player.name,
          otherPlayersInNewRoom,
          player.inventory,
          player.maxWeight,
          player.experience,
          player.level
        );

        // Send new room to player
        sendToPlayerWithStatus(playerId, `\nSei entrato in:\n\n${descriptionResult.message}`);

        // Notify players in new room
        if (direction) {
          const oppositeDirection = getOppositeDirection(direction);
          broadcastToRoom(newRoomId, `\n[${player.name} è arrivato da ${oppositeDirection}]`, playerId);
        } else {
          broadcastToRoom(newRoomId, `\n[${player.name} è entrato nella stanza]`, playerId);
        }
      } else if (result.type === 'interact') {
        sendToPlayerWithStatus(playerId, `\n${result.message}`);
        if (result.triggerActivated?.globalMessage) {
          broadcastToRoom(player.roomId, `\n🔧 ${result.triggerActivated.globalMessage}`);
        }
      } else if (result.type === 'look') {
        sendToPlayerWithStatus(playerId, `\n${result.message}`);
      } else if (result.type === 'help') {
        sendToPlayerWithStatus(playerId, `\n${result.message}`);
      } else if (result.type === 'say' && result.message) {
        const fullMessage = `${player.name} dice: "${result.message}"`;
        broadcastToRoom(player.roomId, `\n${fullMessage}`);
        console.log(`[${player.name}] Say: ${result.message}`);
      } else if (result.type === 'door' && result.consumedItemId) {
        // Handle key consumption
        const index = player.inventory.indexOf(result.consumedItemId);
        if (index > -1) {
          player.inventory.splice(index, 1);
          consumeItem(result.consumedItemId, { publish: (room: string, msg: string) => broadcastToRoom(room, msg) });
        }

        sendToPlayerWithStatus(playerId, `\n${result.message}`);
        if (result.broadcastMessage) {
          broadcastToRoom(player.roomId, `\n🚪 ${result.broadcastMessage}`, playerId);
        }
      } else if (result.type === 'door') {
        sendToPlayerWithStatus(playerId, `\n${result.message}`);
        if (result.broadcastMessage) {
          broadcastToRoom(player.roomId, `\n🚪 ${result.broadcastMessage}`, playerId);
        }
      } else if (result.type === 'pickup' && result.itemId) {
        player.inventory.push(result.itemId);
        registerItemPickup(result.itemId, player.roomId);

        sendToPlayerWithStatus(playerId, `\n${result.message}`);
        if (result.broadcastMessage) {
          broadcastToRoom(player.roomId, `\n📦 ${result.broadcastMessage}`, playerId);
        }
      } else if (result.type === 'drop' && result.itemId) {
        const index = player.inventory.indexOf(result.itemId);
        if (index > -1) {
          player.inventory.splice(index, 1);
        }

        sendToPlayerWithStatus(playerId, `\n${result.message}`);
        if (result.broadcastMessage) {
          broadcastToRoom(player.roomId, `\n📦 ${result.broadcastMessage}`, playerId);
        }
      } else if (result.consumedItemId && result.type === 'consume_item') {
        // Handle item consumption
        const index = player.inventory.indexOf(result.consumedItemId);
        if (index > -1) {
          player.inventory.splice(index, 1);
          consumeItem(result.consumedItemId, { publish: (room: string, msg: string) => broadcastToRoom(room, msg) });
        }

        sendToPlayerWithStatus(playerId, `\n${result.message}`);
        if (result.broadcastMessage) {
          broadcastToRoom(player.roomId, `\n${result.broadcastMessage}`, playerId);
        }
      } else if (result.type === 'info') {
        sendToPlayerWithStatus(playerId, `\n${result.message}`);
      } else if (result.type === 'error') {
        sendToPlayerWithStatus(playerId, `\n❌ ${result.message}`);
      } else {
        sendToPlayerWithStatus(playerId, `\n❌ Comando sconosciuto.`);
      }
    } else if (parsed.type === 'say') {
      const message = parsed.data || '';
      const fullMessage = `${player.name} dice: "${message}"`;
      broadcastToRoom(player.roomId, `\n${fullMessage}`);
      console.log(`[${player.name}] Say: ${message}`);
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

// Initialize systems
initGameTime();
initializeNPCs();
initNPCTracking(npcLocations);
initializeMonsters();
initMonsterTracking(monsterLocations, monsterHp);

// Game tick
setInterval(() => {
  const tickResult = tick();

  if (tickResult.phaseChanged && tickResult.newPhase) {
    const phaseMessage = getPhaseChangeMessage(tickResult.newPhase);
    broadcastToAll(`\n${phaseMessage}`);
    console.log(`[GAME TIME] Phase changed to: ${tickResult.newPhase}`);
  }
}, 1000);

// Start Bun server
const server: any = Bun.serve({
  port: PORT,
  websocket: {
    open(ws: BunWebSocket): void {
      const playerId = uuidv4();
      ws.data = { playerId };
      wsToPlayerId.set(ws, playerId);
      playerIdToWs.set(playerId, ws);

      console.log(`[${playerId}] Un giocatore si è connesso`);

      // Create new player
      const player: Player = {
        id: playerId,
        name: 'Anonimo',
        roomId: STARTING_ROOM,
        socketId: playerId,
        inventory: [],
        maxWeight: 50,
        experience: 0,
        level: 1,
        maxHp: 100,
        currentHp: 100,
        attack: 10,
        defense: 5,
      };

      players.set(playerId, player);

      // Send MOTD and request name
      ws.send(JSON.stringify({ type: 'message', data: MOTD }));
      ws.send(JSON.stringify({ type: 'requestName' }));
    },

    message(ws: BunWebSocket, message: string | Buffer): void {
      handleMessage(ws, message);
    },

    close(ws: BunWebSocket): void {
      const playerId = ws.data.playerId;
      const player = players.get(playerId);

      if (player) {
        console.log(`[${playerId}] ${player.name} si è disconnesso`);
        broadcastToRoom(player.roomId, `\n[${player.name} se ne è andato]`);
        players.delete(playerId);
      }

      wsToPlayerId.delete(ws);
      playerIdToWs.delete(playerId);
    },
  },

  fetch(req: Request): Response | Promise<Response> {
    // Upgrade WebSocket connections
    if (req.url.endsWith('/ws')) {
      const upgraded: any = server.upgrade(req);
      if (upgraded) return upgraded;
    }

    return new Response('Not found', { status: 404 });
  },
});

// Store server globally for helpers to access
(globalThis as any).bunServer = server;

console.log(`🎮 Server MUD in ascolto su ws://localhost:${PORT}/ws`);
