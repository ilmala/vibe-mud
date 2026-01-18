import { getRoomById } from '../data/world';
import { isTriggered } from './triggers';
import { getDoorState } from './doors';

function directionToItalian(direction: string): string {
  const map: { [key: string]: string } = {
    north: 'nord',
    south: 'sud',
    east: 'est',
    west: 'ovest',
  };
  return map[direction] || direction;
}

export function getRoomDescription(roomId: string, otherPlayers?: string[]): string {
  const room = getRoomById(roomId);
  if (!room) {
    return 'Stanza non trovata.';
  }

  const exitList: string[] = [];
  if (room.exits.north) exitList.push('nord');
  if (room.exits.south) exitList.push('sud');
  if (room.exits.east) exitList.push('est');
  if (room.exits.west) exitList.push('ovest');

  // Add revealed hidden exits
  if (room.hiddenExits) {
    for (const [direction, hiddenExit] of Object.entries(room.hiddenExits)) {
      if (isTriggered(hiddenExit.requiredTrigger)) {
        if (direction === 'north') exitList.push('nord');
        else if (direction === 'south') exitList.push('sud');
        else if (direction === 'east') exitList.push('est');
        else if (direction === 'west') exitList.push('ovest');
      }
    }
  }

  const exitsText = exitList.length > 0 ? `\n[Uscite: ${exitList.join(', ')}]` : '\n[Nessuna uscita]';

  // Add doors info
  let doorsText = '';
  if (room.doors) {
    const doorDescs: string[] = [];
    for (const [dir, doorDef] of Object.entries(room.doors)) {
      if (doorDef) {
        const state = getDoorState(roomId, dir);
        const dirIT = directionToItalian(dir);
        const emoji = state === 'open' ? '🚪' : state === 'locked' ? '🔒' : '🚪';
        const stateName = state === 'open' ? 'aperta' : state === 'locked' ? 'chiusa a chiave' : 'chiusa';
        const doorName = doorDef.name || 'porta';
        doorDescs.push(`${emoji} ${doorName} ${dirIT} (${stateName})`);
      }
    }
    if (doorDescs.length > 0) {
      doorsText = `\n[Porte: ${doorDescs.join(', ')}]`;
    }
  }

  let playersText = '';
  if (otherPlayers && otherPlayers.length > 0) {
    playersText = `\n[Presenti: ${otherPlayers.join(', ')}]`;
  }

  // Add interactables info
  let interactablesText = '';
  if (room.interactables && Object.keys(room.interactables).length > 0) {
    const objectNames = Object.keys(room.interactables);
    interactablesText = `\n[Oggetti: ${objectNames.join(', ')}]`;
  }

  return `${room.title}\n\n${room.description}${exitsText}${doorsText}${interactablesText}${playersText}`;
}
