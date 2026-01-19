import { DEFAULT_ITEM_RESPAWN_TIME, DEFAULT_MONSTER_RESPAWN_TIME } from '../data/respawnConfig';
import { getItemById } from '../data/items';
import { getMonsterById } from '../data/monsters';
import { addItemToRoom } from './items';
import { setMonsterHp } from './monsters';

/**
 * Tracks an item that was picked up and needs to respawn
 */
export interface TrackedPickup {
  itemId: string;
  originalRoomId: string;
  pickedUpAt: number; // Timestamp
  respawnTime: number; // Time in milliseconds
}

/**
 * Tracks a monster that was defeated and needs to respawn
 */
export interface TrackedMonsterDefeat {
  monsterId: string;
  monsterName: string;
  originalRoomId: string;
  defeatedAt: number; // Timestamp
  respawnTime: number; // Time in milliseconds
  maxHp: number; // To restore on respawn
}

// Runtime tracking maps
const itemPickups: Map<string, TrackedPickup> = new Map();
const monsterDefeats: Map<string, TrackedMonsterDefeat> = new Map();

/**
 * Track an item pickup for respawn
 */
export function trackItemPickup(
  itemId: string,
  originalRoomId: string
): void {
  const item = getItemById(itemId);
  const respawnTime = item?.respawnTime ?? DEFAULT_ITEM_RESPAWN_TIME;

  const tracked: TrackedPickup = {
    itemId,
    originalRoomId,
    pickedUpAt: Date.now(),
    respawnTime,
  };

  itemPickups.set(itemId, tracked);
  console.log(
    `📍 Item respawn tracked: ${itemId} in ${originalRoomId} (respawn in ${respawnTime / 1000}s)`
  );
}

/**
 * Track a monster defeat for respawn
 */
export function trackMonsterDefeat(
  monsterId: string,
  monsterName: string,
  originalRoomId: string,
  maxHp: number
): void {
  const monster = getMonsterById(monsterId);
  const respawnTime = monster?.respawnTime ?? DEFAULT_MONSTER_RESPAWN_TIME;

  const tracked: TrackedMonsterDefeat = {
    monsterId,
    monsterName,
    originalRoomId,
    defeatedAt: Date.now(),
    respawnTime,
    maxHp,
  };

  monsterDefeats.set(monsterId, tracked);
  console.log(
    `🔄 Monster respawn tracked: ${monsterName} (${monsterId}) in ${originalRoomId} (respawn in ${respawnTime / 1000}s)`
  );
}

/**
 * Get all items ready to respawn
 */
export function getRespawningItems(): TrackedPickup[] {
  const now = Date.now();
  const readyToRespawn: TrackedPickup[] = [];

  for (const [itemId, tracked] of itemPickups.entries()) {
    const elapsedTime = now - tracked.pickedUpAt;
    if (elapsedTime >= tracked.respawnTime) {
      readyToRespawn.push(tracked);
    }
  }

  return readyToRespawn;
}

/**
 * Get all monsters ready to respawn
 */
export function getRespawningMonsters(): TrackedMonsterDefeat[] {
  const now = Date.now();
  const readyToRespawn: TrackedMonsterDefeat[] = [];

  for (const [monsterId, tracked] of monsterDefeats.entries()) {
    const elapsedTime = now - tracked.defeatedAt;
    if (elapsedTime >= tracked.respawnTime) {
      readyToRespawn.push(tracked);
    }
  }

  return readyToRespawn;
}

/**
 * Process all respawns (items and monsters)
 * Returns info about what respawned
 */
export interface RespawnResult {
  respawnedItems: string[]; // Item IDs that respawned
  respawnedMonsters: string[]; // Monster IDs that respawned
}

export function processRespawn(): RespawnResult {
  const result: RespawnResult = {
    respawnedItems: [],
    respawnedMonsters: [],
  };

  // Process item respawns
  const itemsToRespawn = getRespawningItems();
  for (const tracked of itemsToRespawn) {
    const item = getItemById(tracked.itemId);
    if (item) {
      // Add item back to original room
      addItemToRoom(tracked.originalRoomId, tracked.itemId);
      result.respawnedItems.push(tracked.itemId);

      // Remove from tracking
      itemPickups.delete(tracked.itemId);

      console.log(
        `✅ Item respawned: ${item.name} (${tracked.itemId}) in room ${tracked.originalRoomId}`
      );
    }
  }

  // Process monster respawns
  const monstersToRespawn = getRespawningMonsters();
  for (const tracked of monstersToRespawn) {
    // Restore monster's full HP
    setMonsterHp(tracked.monsterId, tracked.maxHp);

    result.respawnedMonsters.push(tracked.monsterId);

    // Remove from tracking
    monsterDefeats.delete(tracked.monsterId);

    console.log(
      `✅ Monster respawned: ${tracked.monsterName} (${tracked.monsterId}) in room ${tracked.originalRoomId}`
    );
  }

  return result;
}

/**
 * Get tracking info (for debug/admin purposes)
 */
export function getRespawnTrackingInfo() {
  const now = Date.now();
  const itemsInfo = Array.from(itemPickups.values()).map(tracked => {
    const elapsedTime = now - tracked.pickedUpAt;
    const remainingTime = tracked.respawnTime - elapsedTime;
    return {
      itemId: tracked.itemId,
      room: tracked.originalRoomId,
      pickedUpAgoSeconds: Math.floor(elapsedTime / 1000),
      respawnInSeconds: Math.ceil(Math.max(0, remainingTime) / 1000),
    };
  });

  const monstersInfo = Array.from(monsterDefeats.values()).map(tracked => {
    const elapsedTime = now - tracked.defeatedAt;
    const remainingTime = tracked.respawnTime - elapsedTime;
    return {
      monsterId: tracked.monsterId,
      monsterName: tracked.monsterName,
      room: tracked.originalRoomId,
      defeatedAgoSeconds: Math.floor(elapsedTime / 1000),
      respawnInSeconds: Math.ceil(Math.max(0, remainingTime) / 1000),
    };
  });

  return { items: itemsInfo, monsters: monstersInfo };
}

/**
 * Clear all respawn tracking (for testing or reset)
 */
export function clearRespawnTracking(): void {
  itemPickups.clear();
  monsterDefeats.clear();
  console.log('🧹 Respawn tracking cleared');
}

/**
 * Get count of tracked items and monsters
 */
export function getRespawnTrackingCount(): { items: number; monsters: number } {
  return {
    items: itemPickups.size,
    monsters: monsterDefeats.size,
  };
}
