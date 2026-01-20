export type CombatTurn = 'attacker' | 'defender';
export type ActionType = 'attack' | 'defend' | 'flee';
export type BonusActionType = 'drink_potion' | 'eat_food';

export interface BonusAction {
  type: BonusActionType;
  itemId: string;
  itemName: string;
}

export interface QueuedAction {
  primaryAction: ActionType;
  bonusAction?: BonusAction;
  timestamp: number;
}

export interface CombatTurnResult {
  combatEnded: boolean;
  endReason?: 'player_died' | 'monster_died' | 'player_fled';
  playerDamage: number;
  monsterDamage: number;
  playerHp: number;
  monsterHp: number;
  messages: string[];           // Messaggi per il giocatore
  broadcastMessages: string[];  // Messaggi per la stanza
}

export interface CombatSession {
  combatId: string; // UUID per questa sessione
  attackerId: string; // Player ID
  defenderId: string; // Monster ID
  defenderIsMonster: boolean; // true per mostri, false per PvP futuro
  currentTurn: CombatTurn;
  startedAt: number; // Timestamp
  roomId: string; // Stanza del combattimento
  attackerDefending: boolean; // Se attacker ha usato "difenditi"
  defenderDefending: boolean; // Se defender ha usato "difenditi"

  // NEW FIELDS FOR NON-BLOCKING COMBAT
  turnStartedAt: number;        // Timestamp inizio turno corrente
  turnDuration: number;         // Durata turno (default 3000ms)
  playerActionQueue: QueuedAction;  // Azione accodata per prossimo turno
  turnNumber: number;           // Contatore turni
}

export interface CombatResult {
  damage: number;
  killed: boolean;
  remainingHp: number;
  maxHp: number;
  wasCritical?: boolean; // Per futuri critici
  wasBlocked?: boolean; // Per future meccaniche
}
