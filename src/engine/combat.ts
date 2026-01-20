import {
  CombatSession,
  CombatTurn,
  CombatResult,
  ActionType,
  BonusActionType,
  BonusAction,
  QueuedAction,
  CombatTurnResult,
} from '../models';

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
 * Get default action (attack)
 */
function getDefaultAction(): QueuedAction {
  return {
    primaryAction: 'attack',
    timestamp: Date.now(),
  };
}

/**
 * Queue or update player action for next turn
 */
export function queuePlayerAction(
  combatId: string,
  primaryAction?: ActionType,
  bonusAction?: { type: BonusActionType; itemId: string; itemName: string }
): { success: boolean; message: string } {
  const combat = activeCombats.get(combatId);

  if (!combat) {
    return { success: false, message: 'Combattimento non trovato.' };
  }

  // If primary action is provided, replace the main action
  if (primaryAction) {
    combat.playerActionQueue.primaryAction = primaryAction;
  }

  // If bonus action is provided, add or replace it
  if (bonusAction) {
    combat.playerActionQueue.bonusAction = bonusAction;
  }

  const actionName =
    primaryAction === 'defend' ? 'difesa' :
    primaryAction === 'flee' ? 'fuga' :
    'attacco';

  let message = `Eseguirai ${primaryAction ? actionName : 'l\'azione accodata'}`;
  if (bonusAction) {
    message += ` e ${bonusAction.itemName}`;
  }
  message += ' nel prossimo turno!';

  return { success: true, message };
}

/**
 * Consume queued action and return it (resets to default)
 */
export function consumeQueuedAction(combatId: string): QueuedAction {
  const combat = activeCombats.get(combatId);

  if (!combat) {
    return getDefaultAction();
  }

  const action = combat.playerActionQueue;
  combat.playerActionQueue = getDefaultAction();
  return action;
}

/**
 * Check if turn time has expired
 */
export function isTurnExpired(combat: CombatSession): boolean {
  const elapsedTime = Date.now() - combat.turnStartedAt;
  return elapsedTime >= combat.turnDuration;
}

/**
 * Get all active combats that need processing
 */
export function getActiveCombatsForTick(): CombatSession[] {
  return Array.from(activeCombats.values()).filter(combat => isTurnExpired(combat));
}

/**
 * Get remaining time until next turn (in milliseconds)
 */
export function getRemainingTurnTime(combat: CombatSession): number {
  const elapsedTime = Date.now() - combat.turnStartedAt;
  const remaining = Math.max(0, combat.turnDuration - elapsedTime);
  return remaining;
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
  const now = Date.now();
  const combat: CombatSession = {
    combatId,
    attackerId,
    defenderId,
    defenderIsMonster,
    currentTurn: 'attacker',
    startedAt: now,
    roomId,
    attackerDefending: false,
    defenderDefending: false,
    // NEW FIELDS FOR NON-BLOCKING COMBAT
    turnStartedAt: now,
    turnDuration: 3000, // 3 secondi
    playerActionQueue: getDefaultAction(),
    turnNumber: 0,
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
 * Execute bonus action (consume item)
 */
function executeBonusAction(
  bonusAction: BonusAction | undefined,
  player: any, // Player type - we don't import it to avoid circular deps
  getItemById: (id: string) => any
): { healAmount: number; itemRemoved: boolean; message: string } {
  if (!bonusAction) {
    return { healAmount: 0, itemRemoved: false, message: '' };
  }

  const item = getItemById(bonusAction.itemId);
  if (!item || !item.effect || item.effect.type !== 'heal') {
    return { healAmount: 0, itemRemoved: false, message: '❌ L\'oggetto non è più disponibile o non funziona.' };
  }

  const healAmount = item.effect.value || 0;
  return {
    healAmount,
    itemRemoved: true,
    message: `💊 Bevi ${bonusAction.itemName}!\n❤️ +${healAmount} HP`,
  };
}

/**
 * Process a single combat turn
 */
export function processCombatTurn(
  combat: CombatSession,
  player: any, // Player type
  monster: any, // Monster type
  getItemById: (id: string) => any,
  getMonsterHp: (monsterId: string) => number,
  setMonsterHp: (monsterId: string, hp: number) => void
): CombatTurnResult {
  const messages: string[] = [];
  const broadcastMessages: string[] = [];

  let playerDamage = 0;
  let monsterDamage = 0;
  let playerHp = player.currentHp ?? player.maxHp;
  let monsterHp = getMonsterHp(monster.id);
  let combatEnded = false;
  let endReason: 'player_died' | 'monster_died' | 'player_fled' | undefined;

  if (combat.currentTurn === 'attacker') {
    // PLAYER'S TURN
    const action = consumeQueuedAction(combat.combatId);

    if (action.primaryAction === 'attack') {
      // Execute attack
      const playerDefense = player.defense || 5;
      const monsterDefense = monster.defense || 5;

      // Calculate damage with defense calculation
      playerDamage = Math.max(1, player.attack - monsterDefense);

      monsterHp = Math.max(0, monsterHp - playerDamage);
      setMonsterHp(monster.id, monsterHp);

      messages.push(`⚔️ Attacchi ${monster.name}!`);
      messages.push(`💥 Infliggi ${playerDamage} danni`);
      messages.push(`💀 ${monster.name}: ${monsterHp}/${monster.maxHp} HP`);

      if (monsterHp <= 0) {
        combatEnded = true;
        endReason = 'monster_died';
        messages.push(`\n🎉 Hai sconfitto ${monster.name}!`);
        broadcastMessages.push(`🎉 ${player.name} ha sconfitto ${monster.name}!`);
      }
    } else if (action.primaryAction === 'defend') {
      combat.attackerDefending = true;
      messages.push(`🛡️ Ti difendi!`);
    } else if (action.primaryAction === 'flee') {
      combatEnded = true;
      endReason = 'player_fled';
      messages.push(`🏃 Fuggi dal combattimento con ${monster.name}!`);
      broadcastMessages.push(`🏃 ${player.name} fugge dal combattimento!`);
    }

    // Execute bonus action if not fleeing
    if (action.bonusAction && !endReason) {
      const inventoryIndex = player.inventory?.findIndex(
        (itemId: string) => itemId === action.bonusAction!.itemId
      );

      if (inventoryIndex !== undefined && inventoryIndex >= 0) {
        const bonusResult = executeBonusAction(action.bonusAction, player, getItemById);

        if (bonusResult.itemRemoved) {
          player.inventory.splice(inventoryIndex, 1);
          const oldHp = playerHp;
          playerHp = Math.min(playerHp + bonusResult.healAmount, player.maxHp);
          messages.push(bonusResult.message);
        }
      }
    }

    // If combat didn't end, switch to monster turn
    if (!combatEnded) {
      switchTurn(combat);
    }
  } else {
    // MONSTER'S TURN
    const playerDefense = player.defense || 5;

    // Monster always attacks (simple AI)
    monsterDamage = Math.max(1, monster.attack - playerDefense);

    // If player is defending, reduce damage by half
    if (combat.attackerDefending) {
      monsterDamage = Math.floor(monsterDamage / 2);
    }

    playerHp = Math.max(0, playerHp - monsterDamage);

    messages.push(`🔄 ${monster.name} attacca!`);
    messages.push(`💥 Subisci ${monsterDamage} danni${combat.attackerDefending ? ' (dimezzati)' : ''}`);
    messages.push(`💀 ${monster.name}: ${monsterHp}/${monster.maxHp} HP`);

    if (playerHp <= 0) {
      combatEnded = true;
      endReason = 'player_died';
      messages.push(`\n💀 Sei stato sconfitto da ${monster.name}!`);
      broadcastMessages.push(`💀 ${player.name} è stato sconfitto da ${monster.name}!`);
    }

    // Reset defending flag for next turn
    combat.attackerDefending = false;

    // Switch back to player turn if combat continues
    if (!combatEnded) {
      switchTurn(combat);
    }
  }

  // Reset turn timer if combat continues
  if (!combatEnded) {
    combat.turnStartedAt = Date.now();
    combat.turnNumber += 1;
  }

  return {
    combatEnded,
    endReason,
    playerDamage,
    monsterDamage,
    playerHp,
    monsterHp,
    messages,
    broadcastMessages,
  };
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
