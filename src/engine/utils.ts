import { getRoomById } from '../data/world';
import { isTriggered } from './triggers';
import { getDoorState } from './doors';
import { getRoomItems } from './items';
import { getItemById } from '../data/items';
import { getCurrentPhase, getPhaseIcon } from './gameTime';

function directionToItalian(direction: string): string {
  const map: { [key: string]: string } = {
    north: 'nord',
    south: 'sud',
    east: 'est',
    west: 'ovest',
  };
  return map[direction] || direction;
}

export function getRoomDescription(
  roomId: string,
  otherPlayers?: string[],
  npcsInRoom?: Array<{name: string; emoji?: string}>,
  monstersInRoom?: Array<{name: string; emoji?: string; currentHp: number; maxHp: number}>
): string {
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

  let presentiText = '';
  const presenti: string[] = [];

  // Add monsters first (with emoji)
  if (monstersInRoom && monstersInRoom.length > 0) {
    monstersInRoom.forEach(monster => {
      const emoji = monster.emoji || '👹';
      // Show corpse if dead
      if (monster.currentHp <= 0) {
        presenti.push(`💀 Cadavere di ${monster.name}`);
      } else {
        // Show HP only if wounded
        const hpPercent = (monster.currentHp / monster.maxHp) * 100;
        const hpIndicator = hpPercent < 100 ? ` (${monster.currentHp}/${monster.maxHp} HP)` : '';
        presenti.push(`${emoji} ${monster.name}${hpIndicator}`);
      }
    });
  }

  // Add NPCs (with emoji)
  if (npcsInRoom && npcsInRoom.length > 0) {
    npcsInRoom.forEach(npc => {
      const npcDisplay = npc.emoji ? `${npc.emoji} ${npc.name}` : npc.name;
      presenti.push(npcDisplay);
    });
  }

  // Add players (without emoji)
  if (otherPlayers && otherPlayers.length > 0) {
    presenti.push(...otherPlayers);
  }

  if (presenti.length > 0) {
    presentiText = `\n[Presenti: ${presenti.join(', ')}]`;
  }

  // Add interactables info
  let interactablesText = '';
  if (room.interactables && Object.keys(room.interactables).length > 0) {
    const objectNames = Object.keys(room.interactables);
    interactablesText = `\n[Oggetti: ${objectNames.join(', ')}]`;
  }

  // Add items info
  let itemsText = '';
  const roomItemIds = getRoomItems(roomId);
  if (roomItemIds.length > 0) {
    const itemNames = roomItemIds
      .map(id => {
        const item = getItemById(id);
        return item ? `📦 ${item.name}` : null;
      })
      .filter(name => name !== null);

    if (itemNames.length > 0) {
      itemsText = `\n[Oggetti a terra: ${itemNames.join(', ')}]`;
    }
  }

  const phaseIcon = getPhaseIcon(getCurrentPhase());
  return `${phaseIcon} ${room.title}\n\n${room.description}${exitsText}${doorsText}${interactablesText}${itemsText}${presentiText}`;
}

/**
 * Generate a status bar showing player level and HP
 * @param level Player level
 * @param currentHp Current hit points
 * @param maxHp Maximum hit points
 * @param attack Optional attack stat
 * @param defense Optional defense stat
 * @returns Formatted status bar string
 */
export function generateStatusBar(
  level: number,
  currentHp: number,
  maxHp: number,
  attack?: number,
  defense?: number
): string {
  const hpPercent = (currentHp / maxHp) * 100;
  const barLength = 15;
  const filledBars = Math.round((currentHp / maxHp) * barLength);
  const emptyBars = barLength - filledBars;
  const hpBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);

  // Determine HP color indicator based on percentage
  let hpStatus = '✅';
  if (hpPercent <= 25) {
    hpStatus = '🔴'; // Critical
  } else if (hpPercent <= 50) {
    hpStatus = '🟡'; // Warning
  } else if (hpPercent <= 75) {
    hpStatus = '🟢'; // Good
  }

  let statsLine = '';
  if (attack !== undefined && defense !== undefined) {
    statsLine = `\n│ ⚔️  ${attack.toString().padStart(2)} │ 🛡️  ${defense.toString().padStart(2)}`;
  }

  return `\n┌──────────────────────────────────┐\n│ Lvl ${level.toString().padEnd(2)} │ ${hpStatus} HP: [${hpBar}] ${currentHp}/${maxHp}${statsLine}\n└──────────────────────────────────┘`;
}
