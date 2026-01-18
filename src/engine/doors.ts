import { getRoomById } from '../data/world';

type DoorState = 'open' | 'closed' | 'locked';

// Global door state storage
const doorStates = new Map<string, DoorState>();

// Helper to create door state key
function makeDoorKey(roomId: string, direction: string): string {
  return `${roomId}:${direction}`;
}

// Get opposite direction
function getOppositeDirection(direction: string): string {
  const opposites: { [key: string]: string } = {
    north: 'south',
    south: 'north',
    east: 'west',
    west: 'east',
  };
  return opposites[direction] || direction;
}

// Normalize direction to lowercase
function normalizeDirection(dir: string): string {
  return dir.toLowerCase();
}

/**
 * Get the current state of a door, initializing from room definition if needed
 */
export function getDoorState(roomId: string, direction: string): DoorState | null {
  direction = normalizeDirection(direction);
  const key = makeDoorKey(roomId, direction);

  // Return cached state if available
  if (doorStates.has(key)) {
    return doorStates.get(key)!;
  }

  // Lazy initialize from room definition
  const room = getRoomById(roomId);
  if (room?.doors?.[direction as keyof typeof room.doors]) {
    const doorDef = room.doors[direction as keyof typeof room.doors];
    if (doorDef) {
      const initialState = doorDef.initialState;
      doorStates.set(key, initialState);
      return initialState;
    }
  }

  // No door exists in this direction
  return null;
}

/**
 * Set the state of a door (handles bidirectional updates automatically)
 */
export function setDoorState(roomId: string, direction: string, state: DoorState): void {
  direction = normalizeDirection(direction);
  const key = makeDoorKey(roomId, direction);
  doorStates.set(key, state);

  // Update opposite side bidirectionally
  const room = getRoomById(roomId);
  if (room && room.exits && room.exits[direction as keyof typeof room.exits]) {
    const nextRoomId = room.exits[direction as keyof typeof room.exits];
    if (nextRoomId) {
      const oppositeDir = getOppositeDirection(direction);
      const oppositeKey = makeDoorKey(nextRoomId, oppositeDir);
      doorStates.set(oppositeKey, state);
    }
  }
}

/**
 * Check if a door exists at the given location
 */
export function doorExists(roomId: string, direction: string): boolean {
  direction = normalizeDirection(direction);
  const room = getRoomById(roomId);
  return !!(room?.doors?.[direction as keyof typeof room.doors]);
}

/**
 * Check if a door is open (can pass through)
 */
export function isDoorOpen(roomId: string, direction: string): boolean {
  const state = getDoorState(roomId, direction);
  return state === 'open';
}

/**
 * Check if a door is closed (can't pass through)
 */
export function isDoorClosed(roomId: string, direction: string): boolean {
  const state = getDoorState(roomId, direction);
  return state === 'closed';
}

/**
 * Check if a door is locked (can't pass through)
 */
export function isDoorLocked(roomId: string, direction: string): boolean {
  const state = getDoorState(roomId, direction);
  return state === 'locked';
}

/**
 * Get the key required to open a locked door (if any)
 */
export function getRequiredKey(roomId: string, direction: string): string | null {
  direction = normalizeDirection(direction);
  const room = getRoomById(roomId);
  const doorDef = room?.doors?.[direction as keyof typeof room.doors];
  return doorDef?.keyId || null;
}

/**
 * Get door definition for display purposes
 */
export function getDoorDef(roomId: string, direction: string) {
  direction = normalizeDirection(direction);
  const room = getRoomById(roomId);
  return room?.doors?.[direction as keyof typeof room.doors] || null;
}

/**
 * Reset all door states (for testing/restart)
 */
export function resetDoors(): void {
  doorStates.clear();
}

/**
 * Get all door states (for debugging)
 */
export function getAllDoorStates(): Record<string, DoorState> {
  const result: Record<string, DoorState> = {};
  doorStates.forEach((state, key) => {
    result[key] = state;
  });
  return result;
}
