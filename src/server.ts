import { v4 as uuidv4 } from 'uuid';
import { Player, Room, NPC, Monster } from './models';
import { STARTING_ROOM } from './data/world';
import { NPCS } from './data/npcs';
import { MONSTERS, getMonsterById } from './data/monsters';
import { parseCommand } from './engine/parser';
import { handleCommand } from './engine/gameLogic';
import { initGameTime, tick, getPhaseChangeMessage } from './engine/gameTime';
import { initNPCTracking } from './engine/npcs';
import { initMonsterTracking, getMonsterCurrentHp, setMonsterHp } from './engine/monsters';
import { registerItemPickup, consumeItem } from './engine/items';
import { generateStatusBar } from './engine/utils';
import {
  equipItem,
  unequipItem,
  calculateEffectiveStats,
  isItemEquipped,
  getEquippedSlot,
  getSlotName,
  getSlotEmoji,
} from './engine/equipment';
import { getItemById } from './data/items';
import {
  trackItemPickup,
  trackMonsterDefeat,
  processRespawn,
} from './engine/respawn';
import {
  startCombat,
  getPlayerCombat,
  getCombatSession,
  executeCombatAction,
  endCombat,
  calculateDamage,
  isPlayerTurn,
  isOpponentDefending,
  switchTurn,
  queuePlayerAction,
  processCombatTurn,
  isTurnExpired,
  getActiveCombatsForTick,
  getRemainingTurnTime,
} from './engine/combat';
import { addItemToRoom } from './engine/items';

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

// Helper: Send message to a player with status bar (level + HP + stats)
function sendToPlayerWithStatus(playerId: string, message: string): void {
  const player = players.get(playerId);
  if (!player) return;

  const currentHp = player.currentHp ?? player.maxHp;
  const statusBar = generateStatusBar(player.level, currentHp, player.maxHp, player.attack, player.defense);
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

// Helper: Handle combat turn result
function handleCombatTurnResult(
  result: any, // CombatTurnResult
  combat: any, // CombatSession
  player: any, // Player
  monster: any // Monster
): void {
  // Update HP
  player.currentHp = result.playerHp;
  setMonsterHp(combat.defenderId, result.monsterHp);

  // Send messages to player
  if (result.messages.length > 0) {
    const message = result.messages.join('\n');
    sendToPlayerWithStatus(player.id, `\n${message}`);
  }

  // Send broadcast messages to room
  if (result.broadcastMessages.length > 0) {
    result.broadcastMessages.forEach((msg: string) => {
      broadcastToRoom(combat.roomId, `\n${msg}`, player.id);
    });
  }

  // Handle combat end
  if (result.combatEnded) {
    if (result.endReason === 'player_died') {
      // Drop all inventory as loot in death room
      const deathRoomId = combat.roomId;
      if (player.inventory && player.inventory.length > 0) {
        player.inventory.forEach((itemId: string) => addItemToRoom(deathRoomId, itemId));
        broadcastToRoom(deathRoomId, `\n💀 ${player.name} è morto e ha lasciato il suo inventario!`, player.id);
      }

      // Respawn player with 2 HP
      player.currentHp = 2;
      player.roomId = STARTING_ROOM;
      player.inventory = []; // Clear inventory

      // Send death message
      const deathMessage = `
💀 Sei morto! Un'entità oscura ti strappa dalla morte...

✨ Ti ritrovi improvvisamente nella piazza centrale, con appena 2 HP rimasti.
💔 Tutto ciò che avevi è stato lasciato nel luogo della tua morte...
`;
      sendToPlayer(player.id, deathMessage);

      // Show starting room description
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
        player.level,
        player.equipment
      );
      sendToPlayerWithStatus(player.id, `\n${lookResult.message}`);

      broadcastToRoom(STARTING_ROOM, `\n💀 ${player.name} respawna qui con 2 HP rimanenti!`, player.id);
    } else if (result.endReason === 'monster_died') {
      // Award XP and loot
      player.experience += monster.experienceDrop;
      monster.inventory.forEach((itemId: string) => addItemToRoom(combat.roomId, itemId));
      trackMonsterDefeat(combat.defenderId, monster.name, combat.roomId, monster.maxHp);
    }

    // End combat
    endCombat(combat.combatId, result.endReason || 'unknown');
    player.activeCombatId = undefined;
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
        player.level,
        player.equipment
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
        player.level,
        player.equipment
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
          player.level,
          player.equipment
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
        trackItemPickup(result.itemId, player.roomId);

        sendToPlayerWithStatus(playerId, `\n${result.message}`);
        if (result.broadcastMessage) {
          broadcastToRoom(player.roomId, `\n📦 ${result.broadcastMessage}`, playerId);
        }
      } else if (result.type === 'drop' && result.itemId) {
        // Auto-unequip if equipped
        if (isItemEquipped(player.equipment, result.itemId)) {
          const slot = getEquippedSlot(player.equipment, result.itemId);
          if (slot) {
            const unequipResult = unequipItem(player.equipment, slot);
            player.equipment = unequipResult.equipment;

            const effectiveStats = calculateEffectiveStats(10, 5, 100, player.equipment);
            player.maxHp = effectiveStats.maxHp;
            player.attack = effectiveStats.attack;
            player.defense = effectiveStats.defense;
            player.currentHp = Math.min(player.currentHp ?? 100, player.maxHp);
          }
        }

        const index = player.inventory.indexOf(result.itemId);
        if (index > -1) {
          player.inventory.splice(index, 1);
        }

        sendToPlayerWithStatus(playerId, `\n${result.message}`);
        if (result.broadcastMessage) {
          broadcastToRoom(player.roomId, `\n📦 ${result.broadcastMessage}`, playerId);
        }
      } else if (result.type === 'equip' && result.itemId) {
        const equipResult = equipItem(
          player.equipment,
          player.inventory,
          result.itemId
        );

        if (!equipResult.success) {
          sendToPlayerWithStatus(playerId, `\n❌ ${equipResult.message}`);
        } else {
          player.equipment = equipResult.equipment;

          // Recalcola stats effettive
          const effectiveStats = calculateEffectiveStats(
            10,
            5,
            100,
            player.equipment
          );

          // Aumenta HP se maxHp è aumentato
          if (player.maxHp < effectiveStats.maxHp) {
            const hpGain = effectiveStats.maxHp - player.maxHp;
            player.currentHp = (player.currentHp ?? player.maxHp) + hpGain;
          }

          player.maxHp = effectiveStats.maxHp;
          player.attack = effectiveStats.attack;
          player.defense = effectiveStats.defense;

          sendToPlayerWithStatus(playerId, `\n✅ ${equipResult.message}`);
        }
      } else if (result.type === 'unequip' && result.slot) {
        const unequipResult = unequipItem(player.equipment, result.slot);

        if (!unequipResult.success) {
          sendToPlayerWithStatus(playerId, `\n❌ ${unequipResult.message}`);
        } else {
          player.equipment = unequipResult.equipment;

          // Recalcola stats
          const effectiveStats = calculateEffectiveStats(10, 5, 100, player.equipment);
          player.maxHp = effectiveStats.maxHp;
          player.attack = effectiveStats.attack;
          player.defense = effectiveStats.defense;

          // Clamp HP se maxHp diminuito
          player.currentHp = Math.min(player.currentHp ?? 100, player.maxHp);

          sendToPlayerWithStatus(playerId, `\n✅ ${unequipResult.message}`);
        }
      } else if (result.type === 'unequip_by_name' && result.itemName) {
        const itemName = result.itemName.toLowerCase();

        // Cerca item equipaggiato per nome
        let found = false;
        for (const [slotKey, itemId] of Object.entries(player.equipment)) {
          if (!itemId) continue;
          const item = getItemById(itemId);
          if (item?.name.toLowerCase().includes(itemName)) {
            const slot = slotKey as any;
            const unequipResult = unequipItem(player.equipment, slot);

            player.equipment = unequipResult.equipment;
            const effectiveStats = calculateEffectiveStats(10, 5, 100, player.equipment);
            player.maxHp = effectiveStats.maxHp;
            player.attack = effectiveStats.attack;
            player.defense = effectiveStats.defense;
            player.currentHp = Math.min(player.currentHp ?? 100, player.maxHp);

            sendToPlayerWithStatus(playerId, `\n✅ ${unequipResult.message}`);
            found = true;
            break;
          }
        }

        if (!found) {
          sendToPlayerWithStatus(playerId, `\n❌ Non hai "${result.itemName}" equipaggiato.`);
        }
      } else if (result.type === 'show_stats') {
        const effectiveStats = calculateEffectiveStats(10, 5, 100, player.equipment);

        let msg = `📊 Statistiche di ${player.name}\n\n`;
        msg += `⭐ Livello: ${player.level}\n`;
        msg += `❤️  Vita: ${player.currentHp}/${effectiveStats.maxHp}`;
        if (effectiveStats.breakdown.maxHp.bonus > 0) {
          msg += ` (+${effectiveStats.breakdown.maxHp.bonus})`;
        }
        msg += `\n⚔️  Attacco: ${effectiveStats.attack}`;
        if (effectiveStats.breakdown.attack.bonus > 0) {
          msg += ` (+${effectiveStats.breakdown.attack.bonus})`;
        }
        msg += `\n🛡️  Difesa: ${effectiveStats.defense}`;
        if (effectiveStats.breakdown.defense.bonus > 0) {
          msg += ` (+${effectiveStats.breakdown.defense.bonus})`;
        }

        msg += `\n\n⚔️ Equipaggiamento:\n`;
        const slots: (keyof typeof player.equipment)[] = [
          'rightHand',
          'leftHand',
          'armor',
          'helmet',
          'boots',
          'gloves',
          'ring1',
          'ring2',
          'amulet',
        ];

        slots.forEach(slot => {
          const itemId = player.equipment[slot];
          const emoji = getSlotEmoji(slot as any);
          const slotName = getSlotName(slot as any);

          if (itemId) {
            const item = getItemById(itemId);
            msg += `  ${emoji} ${slotName}: ${item?.name || '?'}\n`;
          } else {
            msg += `  ${emoji} ${slotName}: -\n`;
          }
        });

        sendToPlayerWithStatus(playerId, `\n${msg}`);
      } else if (result.consumedItemId && result.type === 'consume_item') {
        // Handle item consumption
        const index = player.inventory.indexOf(result.consumedItemId);
        if (index > -1) {
          player.inventory.splice(index, 1);
          consumeItem(result.consumedItemId, { publish: (room: string, msg: string) => broadcastToRoom(room, msg) });
        }

        // Apply healing effect if item has heal effect
        const item = getItemById(result.consumedItemId);
        if (item?.effect?.type === 'heal' && item.effect.value) {
          const healAmount = item.effect.value;
          const oldHp = player.currentHp ?? player.maxHp;
          player.currentHp = Math.min(oldHp + healAmount, player.maxHp);
        }

        // If in combat, add combat status info
        let message = result.message || '';
        if (player.activeCombatId) {
          const combat = getCombatSession(player.activeCombatId);
          if (combat) {
            const monster = getMonsterById(combat.defenderId);
            const monsterHp = getMonsterCurrentHp(combat.defenderId) || 0;
            if (monster) {
              message += `\n\n💀 ${monster.name}: ${monsterHp}/${monster.maxHp} HP`;
              message += `\n❤️ Tu: ${player.currentHp}/${player.maxHp} HP`;
              message += `\n\n🎯 È il tuo turno! Usa: attacca, difenditi, fuggi, bevi`;
            }
          }
        }

        sendToPlayerWithStatus(playerId, `\n${message}`);
        if (result.broadcastMessage) {
          broadcastToRoom(player.roomId, `\n${result.broadcastMessage}`, playerId);
        }
      } else if (result.type === 'combat_queue_action') {
        // Queue an action for next combat turn
        const combat = getPlayerCombat(playerId);

        if (!combat) {
          sendToPlayerWithStatus(playerId, '\n❌ Non sei in combattimento.');
          return;
        }

        const queueResult = queuePlayerAction(
          combat.combatId,
          result.combatAction,
          result.bonusAction
        );

        if (queueResult.success) {
          const remainingTime = Math.ceil(getRemainingTurnTime(combat) / 1000);
          sendToPlayerWithStatus(
            playerId,
            `\n✅ ${queueResult.message}\n⏱️ Esecuzione tra ${remainingTime}s...`
          );
        } else {
          sendToPlayerWithStatus(playerId, `\n❌ ${queueResult.message}`);
        }
      } else if (result.type === 'combat_start' && result.targetId && result.targetIsMonster) {
        // Start combat with a monster
        const monster = getMonsterById(result.targetId);
        const monsterHp = getMonsterCurrentHp(result.targetId);

        if (!monster || !monsterHp || monsterHp <= 0) {
          sendToPlayerWithStatus(playerId, `\n❌ ${result.targetName || 'Il mostro'} non è più qui.`);
        } else {
          // Start combat
          const startResult = startCombat(
            playerId,
            result.targetId,
            true,
            player.roomId
          );

          if (startResult.success && startResult.combatId) {
            player.activeCombatId = startResult.combatId;
            const combat = getCombatSession(startResult.combatId);

            const msg = `⚔️ Inizia il combattimento con ${result.targetName}!\n` +
                        `💀 ${result.targetName}: ${monsterHp}/${monster.maxHp} HP\n` +
                        `\n⏱️ Combattimento a turni automatici (3s per turno)\n` +
                        `🎯 Comandi disponibili:\n` +
                        `  • difenditi - Riduci danno del 50%\n` +
                        `  • fuggi - Scappa dal combattimento\n` +
                        `  • bevi <pozione> - Cura HP (azione bonus)\n` +
                        `  • mangia <cibo> - Cura HP (azione bonus)\n` +
                        `\n💡 Attacco automatico ogni turno se non specifichi altro!\n` +
                        `⏳ Primo turno tra 3 secondi...`;

            sendToPlayerWithStatus(playerId, `\n${msg}`);
            broadcastToRoom(
              player.roomId,
              `\n⚔️ ${player.name} attacca ${result.targetName}!`,
              playerId
            );
          } else {
            sendToPlayerWithStatus(playerId, `\n❌ ${startResult.message}`);
          }
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

// Combat tick - process all active combats every 500ms
setInterval(() => {
  const combatsToProcess = getActiveCombatsForTick();

  for (const combat of combatsToProcess) {
    const player = players.get(combat.attackerId);
    const monster = getMonsterById(combat.defenderId);

    if (!player || !monster) {
      endCombat(combat.combatId, 'entity missing');
      continue;
    }

    // Check if monster is still alive (HP > 0)
    const monsterHp = getMonsterCurrentHp(combat.defenderId);
    if (!monsterHp || monsterHp <= 0) {
      endCombat(combat.combatId, 'monster disappeared');
      player.activeCombatId = undefined;
      continue;
    }

    // Process the turn
    const result = processCombatTurn(
      combat,
      player,
      monster,
      getItemById,
      (monsterId: string) => getMonsterCurrentHp(monsterId) || 0,
      setMonsterHp
    );

    // Handle results
    handleCombatTurnResult(result, combat, player, monster);
  }
}, 500); // Check every 500ms

// Respawn tick - process item and monster respawns every 5 seconds
setInterval(() => {
  const respawnResult = processRespawn();

  // Notify all players if items or monsters respawned
  if (respawnResult.respawnedItems.length > 0) {
    for (const itemId of respawnResult.respawnedItems) {
      const item = getItemById(itemId);
      if (item) {
        console.log(`🔄 Item respawned: ${item.name}`);
      }
    }
  }

  if (respawnResult.respawnedMonsters.length > 0) {
    console.log(`🔄 ${respawnResult.respawnedMonsters.length} monster(s) respawned`);
  }
}, 5000);

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
        equipment: {},
        activeCombatId: undefined,
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

        // End any active combat session
        if (player.activeCombatId) {
          endCombat(player.activeCombatId, 'player disconnected');
        }

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
