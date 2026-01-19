import { CombatSession, CombatTurn, CombatResult } from '../models';

// Runtime data structures
const activeCombats: Map<string, CombatSession> = new Map();
const playerCombats: Map<string, string> = new Map();
const monsterCombats: Map<string, string> = new Map();

/**
 * Generate a simple UUID-like ID
 */
function generateCombatId(): string {
  return `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Start a new combat session
 */
export function startCombat(
  attackerId: string,
  defenderId: string,
  defenderIsMonster: boolean,
  roomId: string
): { success: boolean; combatId?: string; message: string } {
  // Check if attacker is already in combat
  if (playerCombats.has(attackerId)) {
    return { success: false, message: 'Sei già in combattimento!' };
  }

  // Check if defender is already in combat
  if (defenderIsMonster && monsterCombats.has(defenderId)) {
    return { success: false, message: 'Questo mostro è già impegnato in battaglia!' };
  }

  const combatId = generateCombatId();
  const combat: CombatSession = {
    combatId,
    attackerId,
    defenderId,
    defenderIsMonster,
    currentTurn: 'attacker',
    startedAt: Date.now(),
    roomId,
    attackerDefending: false,
    defenderDefending: false,
  };

  activeCombats.set(combatId, combat);
  playerCombats.set(attackerId, combatId);
  if (defenderIsMonster) {
    monsterCombats.set(defenderId, combatId);
  }

  return { success: true, combatId, message: 'Combat started!' };
}

/**
 * Get a combat session by ID
 */
export function getCombatSession(combatId: string): CombatSession | undefined {
  return activeCombats.get(combatId);
}

/**
 * Get the combat session for a player
 */
export function getPlayerCombat(playerId: string): CombatSession | undefined {
  const combatId = playerCombats.get(playerId);
  if (!combatId) return undefined;
  return activeCombats.get(combatId);
}

/**
 * Check if a player is in combat
 */
export function isPlayerInCombat(playerId: string): boolean {
  return playerCombats.has(playerId);
}

/**
 * Calculate damage based on attack and defense stats
 */
export function calculateDamage(
  attackerAttack: number,
  defenderDefense: number,
  isDefending: boolean
): number {
  let damage = Math.max(1, attackerAttack - defenderDefense);

  if (isDefending) {
    damage = Math.floor(damage / 2);
  }

  return Math.max(1, damage);
}

/**
 * Execute a combat action (attack, defend, flee)
 */
export function executeCombatAction(
  combatId: string,
  actorId: string,
  actionType: 'attack' | 'defend' | 'flee'
): CombatResult {
  const combat = activeCombats.get(combatId);

  if (!combat) {
    throw new Error(`Combat session ${combatId} not found`);
  }

  const isAttacker = actorId === combat.attackerId;
  const isDefender = actorId === combat.defenderId;

  if (!isAttacker && !isDefender) {
    throw new Error(`Actor ${actorId} is not part of this combat`);
  }

  if (actionType === 'attack') {
    // Attack is handled differently in server.ts
    // This just validates it's the right turn
    const isPlayerTurn =
      (isAttacker && combat.currentTurn === 'attacker') ||
      (isDefender && combat.currentTurn === 'defender');

    if (!isPlayerTurn) {
      throw new Error('Not your turn!');
    }

    switchTurn(combat);
    return { damage: 0, killed: false, remainingHp: 0, maxHp: 0 };
  } else if (actionType === 'defend') {
    const isPlayerTurn =
      (isAttacker && combat.currentTurn === 'attacker') ||
      (isDefender && combat.currentTurn === 'defender');

    if (!isPlayerTurn) {
      throw new Error('Not your turn!');
    }

    if (isAttacker) {
      combat.attackerDefending = true;
    } else {
      combat.defenderDefending = true;
    }

    switchTurn(combat);
    return { damage: 0, killed: false, remainingHp: 0, maxHp: 0 };
  } else if (actionType === 'flee') {
    // Flee is handled in server.ts
    return { damage: 0, killed: false, remainingHp: 0, maxHp: 0 };
  }

  throw new Error(`Unknown action type: ${actionType}`);
}

/**
 * End a combat session
 */
export function endCombat(
  combatId: string,
  reason: string
): { success: boolean; message: string } {
  const combat = activeCombats.get(combatId);

  if (!combat) {
    return { success: false, message: `Combat ${combatId} not found` };
  }

  activeCombats.delete(combatId);
  playerCombats.delete(combat.attackerId);
  if (combat.defenderIsMonster) {
    monsterCombats.delete(combat.defenderId);
  }

  console.log(`⚔️ Combat ended: ${reason}`);
  return { success: true, message: 'Combat ended' };
}

/**
 * Switch the current turn
 */
export function switchTurn(combat: CombatSession): void {
  combat.currentTurn = combat.currentTurn === 'attacker' ? 'defender' : 'attacker';

  // Reset defending flags when turn changes
  if (combat.currentTurn === 'attacker') {
    combat.defenderDefending = false;
  } else {
    combat.attackerDefending = false;
  }
}

/**
 * Check if it's a player's turn
 */
export function isPlayerTurn(combat: CombatSession, playerId: string): boolean {
  const isAttacker = playerId === combat.attackerId;
  const isDefender = playerId === combat.defenderId;

  if (isAttacker) {
    return combat.currentTurn === 'attacker';
  } else if (isDefender) {
    return combat.currentTurn === 'defender';
  }

  return false;
}

/**
 * Get the defending flag for an actor
 */
export function isActorDefending(combat: CombatSession, actorId: string): boolean {
  if (actorId === combat.attackerId) {
    return combat.attackerDefending;
  } else if (actorId === combat.defenderId) {
    return combat.defenderDefending;
  }
  return false;
}

/**
 * Get the defending flag for the opponent
 */
export function isOpponentDefending(combat: CombatSession, actorId: string): boolean {
  if (actorId === combat.attackerId) {
    return combat.defenderDefending;
  } else if (actorId === combat.defenderId) {
    return combat.attackerDefending;
  }
  return false;
}
