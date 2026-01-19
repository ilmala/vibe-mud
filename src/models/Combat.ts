export type CombatTurn = 'attacker' | 'defender';

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
}

export interface CombatResult {
  damage: number;
  killed: boolean;
  remainingHp: number;
  maxHp: number;
  wasCritical?: boolean; // Per futuri critici
  wasBlocked?: boolean; // Per future meccaniche
}
