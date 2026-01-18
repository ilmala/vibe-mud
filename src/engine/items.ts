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
