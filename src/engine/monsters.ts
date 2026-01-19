import { getMonsterById } from '../data/monsters';

// Runtime location tracking (initialized by server.ts)
let monsterLocationMap: Map<string, string>;

// Runtime HP tracking (current HP per monster instance)
let monsterHpMap: Map<string, number>;

/**
 * Initialize monster tracking with the location and HP maps from server.ts
 */
export function initMonsterTracking(
  locationMap: Map<string, string>,
  hpMap: Map<string, number>
): void {
  monsterLocationMap = locationMap;
  monsterHpMap = hpMap;
}

/**
 * Get all monsters currently in a specific room
 * Returns array with id, name, emoji, currentHp, maxHp for display purposes
 */
export function getMonstersInRoom(
  roomId: string
): Array<{
  id: string;
  name: string;
  emoji?: string;
  currentHp: number;
  maxHp: number;
}> {
  const monstersInRoom: Array<{
    id: string;
    name: string;
    emoji?: string;
    currentHp: number;
    maxHp: number;
  }> = [];

  if (!monsterLocationMap) {
    return monstersInRoom;
  }

  monsterLocationMap.forEach((currentRoomId, monsterId) => {
    if (currentRoomId === roomId) {
      const monster = getMonsterById(monsterId);
      if (monster) {
        const currentHp = monsterHpMap.get(monsterId) ?? monster.maxHp;
        monstersInRoom.push({
          id: monster.id,
          name: monster.name,
          emoji: monster.emoji,
          currentHp: currentHp,
          maxHp: monster.maxHp,
        });
      }
    }
  });

  return monstersInRoom;
}

/**
 * Move a monster to a different room
 * Returns true if successful, false if monster not found
 */
export function moveMonster(monsterId: string, newRoomId: string): boolean {
  if (!monsterLocationMap || !monsterLocationMap.has(monsterId)) {
    return false;
  }

  monsterLocationMap.set(monsterId, newRoomId);
  return true;
}

/**
 * Get a monster's current room location
 */
export function getMonsterLocation(monsterId: string): string | undefined {
  if (!monsterLocationMap) {
    return undefined;
  }

  return monsterLocationMap.get(monsterId);
}

/**
 * Get a monster's current HP
 */
export function getMonsterCurrentHp(monsterId: string): number | undefined {
  if (!monsterHpMap) {
    return undefined;
  }

  return monsterHpMap.get(monsterId);
}

/**
 * Set a monster's current HP (for damage/healing - future combat)
 * Clamps value between 0 and maxHp
 */
export function setMonsterHp(monsterId: string, newHp: number): boolean {
  if (!monsterHpMap) {
    return false;
  }

  const monster = getMonsterById(monsterId);
  if (!monster) {
    return false;
  }

  // Clamp HP between 0 and maxHp
  const clampedHp = Math.max(0, Math.min(newHp, monster.maxHp));
  monsterHpMap.set(monsterId, clampedHp);
  return true;
}

/**
 * Check if a monster is alive
 */
export function isMonsterAlive(monsterId: string): boolean {
  const currentHp = getMonsterCurrentHp(monsterId);
  return currentHp !== undefined && currentHp > 0;
}
