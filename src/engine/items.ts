import { getRoomById } from '../data/world';

// Global runtime state: which items are present in each room
const roomItems = new Map<string, Set<string>>();

/**
 * Lazy initialization: load items from room definition on first access
 */
export function getRoomItems(roomId: string): string[] {
  if (!roomItems.has(roomId)) {
    const room = getRoomById(roomId);
    const initialItems = room?.items || [];
    roomItems.set(roomId, new Set(initialItems));
  }
  return Array.from(roomItems.get(roomId)!);
}

/**
 * Add an item to the room (when dropping)
 */
export function addItemToRoom(roomId: string, itemId: string): void {
  if (!roomItems.has(roomId)) {
    getRoomItems(roomId); // Initialize if needed
  }
  roomItems.get(roomId)!.add(itemId);
}

/**
 * Remove an item from the room (when picking up)
 * @returns true if the item was removed, false if it didn't exist
 */
export function removeItemFromRoom(roomId: string, itemId: string): boolean {
  if (!roomItems.has(roomId)) {
    getRoomItems(roomId);
  }
  return roomItems.get(roomId)!.delete(itemId);
}

/**
 * Check if an item is present in the room
 */
export function isItemInRoom(roomId: string, itemId: string): boolean {
  return getRoomItems(roomId).includes(itemId);
}

/**
 * Reset all items state (for testing)
 */
export function resetItems(): void {
  roomItems.clear();
}

// Track original room for each item (for respawn after consumption)
const itemOriginalRooms: Map<string, string> = new Map();

// Track active respawn timers for consumed items
const itemRespawnTimers: Map<string, NodeJS.Timeout> = new Map();

/**
 * Register the original position of an item when it's picked up
 * This is used to respawn consumed items back to their starting location
 */
export function registerItemPickup(itemId: string, roomId: string): void {
  if (!itemOriginalRooms.has(itemId)) {
    itemOriginalRooms.set(itemId, roomId);
  }
}

/**
 * Get the original room where an item spawned
 */
export function getItemOriginalRoom(itemId: string): string | undefined {
  return itemOriginalRooms.get(itemId);
}

/**
 * Consume an item and schedule its respawn after 5 minutes
 * @param itemId - The ID of the item being consumed
 * @param io - Socket.io instance for broadcasting respawn notification
 * @returns true if respawn was scheduled, false if original room not found
 */
export function consumeItem(
  itemId: string,
  io: any
): boolean {
  const originalRoom = itemOriginalRooms.get(itemId);

  if (!originalRoom) {
    console.warn(`[ITEM] No original room found for item ${itemId}`);
    return false;
  }

  // Clear any existing timer for this item
  if (itemRespawnTimers.has(itemId)) {
    clearTimeout(itemRespawnTimers.get(itemId)!);
  }

  // Schedule respawn after 5 minutes (300000ms)
  const timer = setTimeout(() => {
    addItemToRoom(originalRoom, itemId);

    // Notify players in that room
    io.to(originalRoom).emit('message', `\n✨ Qualcosa appare in questa stanza...`);

    itemRespawnTimers.delete(itemId);
    console.log(`[ITEM RESPAWN] Item ${itemId} respawned in room ${originalRoom}`);
  }, 300000); // 5 minutes

  itemRespawnTimers.set(itemId, timer);
  return true;
}
