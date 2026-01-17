import { getRoomById } from '../data/world';
import { isTriggered } from './triggers';

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

  return `${room.title}\n\n${room.description}${exitsText}${interactablesText}${playersText}`;
}
