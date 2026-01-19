import { getNPCById } from '../data/npcs';

// Runtime location tracking - initialized by server.ts
let npcLocationMap: Map<string, string>;

/**
 * Initialize NPC tracking with the location map from server.ts
 */
export function initNPCTracking(locationMap: Map<string, string>): void {
  npcLocationMap = locationMap;
}

/**
 * Get all NPCs currently in a specific room
 * Returns array of objects with id, name, and emoji for display purposes
 */
export function getNPCsInRoom(
  roomId: string
): Array<{
  id: string;
  name: string;
  emoji?: string;
}> {
  const npcsInRoom: Array<{
    id: string;
    name: string;
    emoji?: string;
  }> = [];

  if (!npcLocationMap) {
    return npcsInRoom;
  }

  npcLocationMap.forEach((currentRoomId, npcId) => {
    if (currentRoomId === roomId) {
      const npc = getNPCById(npcId);
      if (npc) {
        npcsInRoom.push({
          id: npc.id,
          name: npc.name,
          emoji: npc.emoji,
        });
      }
    }
  });

  return npcsInRoom;
}

/**
 * Move an NPC to a different room
 * Returns true if successful, false if NPC not found
 */
export function moveNPC(npcId: string, newRoomId: string): boolean {
  if (!npcLocationMap || !npcLocationMap.has(npcId)) {
    return false;
  }

  npcLocationMap.set(npcId, newRoomId);
  return true;
}

/**
 * Get an NPC's current room location
 */
export function getNPCLocation(npcId: string): string | undefined {
  if (!npcLocationMap) {
    return undefined;
  }

  return npcLocationMap.get(npcId);
}
