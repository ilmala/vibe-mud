export enum TimeOfDay {
  DEEP_NIGHT = 'deepNight',   // Notte profonda (00:00-05:00) - 125 secondi
  DAWN = 'dawn',               // Alba (05:00-07:00) - 50 secondi
  MORNING = 'morning',         // Mattina (07:00-12:00) - 125 secondi
  AFTERNOON = 'afternoon',     // Pomeriggio (12:00-17:00) - 125 secondi
  DUSK = 'dusk',               // Tramonto (17:00-19:00) - 50 secondi
  NIGHT = 'night'              // Notte (19:00-00:00) - 125 secondi
}

interface GameTimeState {
  totalSeconds: number;
  currentPhase: TimeOfDay;
  secondsInPhase: number;
}

interface PhaseConfig {
  phase: TimeOfDay;
  seconds: number;
}

// Configuration: realistic 24-hour cycle in 10 minutes (600 seconds)
// 1 hour virtual = 25 seconds real
const SECONDS_PER_CYCLE = 600; // 10 minutes = 24 hours virtual
const PHASES_CONFIG: PhaseConfig[] = [
  { phase: TimeOfDay.DEEP_NIGHT, seconds: 125 },  // 00:00-05:00 (5 hours)
  { phase: TimeOfDay.DAWN, seconds: 50 },         // 05:00-07:00 (2 hours)
  { phase: TimeOfDay.MORNING, seconds: 125 },     // 07:00-12:00 (5 hours)
  { phase: TimeOfDay.AFTERNOON, seconds: 125 },   // 12:00-17:00 (5 hours)
  { phase: TimeOfDay.DUSK, seconds: 50 },         // 17:00-19:00 (2 hours)
  { phase: TimeOfDay.NIGHT, seconds: 125 }        // 19:00-00:00 (5 hours)
];

// Global state
let gameTimeState: GameTimeState = {
  totalSeconds: 0,
  currentPhase: TimeOfDay.DEEP_NIGHT,
  secondsInPhase: 0,
};

export function initGameTime(): void {
  gameTimeState = {
    totalSeconds: 0,
    currentPhase: TimeOfDay.DEEP_NIGHT,
    secondsInPhase: 0,
  };
  console.log('[GAME TIME] Initialized: Notte Profonda (00:00)');
}

export function tick(): { phaseChanged: boolean; newPhase?: TimeOfDay } {
  gameTimeState.totalSeconds++;
  gameTimeState.secondsInPhase++;

  // Calculate phase based on position in cycle
  const positionInCycle = gameTimeState.totalSeconds % SECONDS_PER_CYCLE;
  let accumulatedSeconds = 0;
  let newPhaseIndex = 0;

  for (let i = 0; i < PHASES_CONFIG.length; i++) {
    accumulatedSeconds += PHASES_CONFIG[i].seconds;
    if (positionInCycle < accumulatedSeconds) {
      newPhaseIndex = i;
      break;
    }
  }

  const newPhase = PHASES_CONFIG[newPhaseIndex].phase;
  const phaseChanged = newPhase !== gameTimeState.currentPhase;

  if (phaseChanged) {
    gameTimeState.currentPhase = newPhase;
    gameTimeState.secondsInPhase = 0;
    return { phaseChanged: true, newPhase };
  }

  return { phaseChanged: false };
}

export function getCurrentPhase(): TimeOfDay {
  return gameTimeState.currentPhase;
}

export function getDayTimeString(): string {
  // Convert real time to virtual 24-hour format
  // 10 minutes real time = 24 hours virtual time
  const positionInCycle = gameTimeState.totalSeconds % SECONDS_PER_CYCLE;
  const virtualSeconds = (positionInCycle / SECONDS_PER_CYCLE) * 86400; // 86400 seconds = 24 hours
  const hours = Math.floor(virtualSeconds / 3600);
  const minutes = Math.floor((virtualSeconds % 3600) / 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}`;
}

export function getPhaseDisplayName(phase: TimeOfDay): string {
  const names: Record<TimeOfDay, string> = {
    [TimeOfDay.DEEP_NIGHT]: 'Notte Profonda',
    [TimeOfDay.DAWN]: 'Alba',
    [TimeOfDay.MORNING]: 'Mattina',
    [TimeOfDay.AFTERNOON]: 'Pomeriggio',
    [TimeOfDay.DUSK]: 'Tramonto',
    [TimeOfDay.NIGHT]: 'Notte',
  };
  return names[phase];
}

export function getPhaseIcon(phase: TimeOfDay): string {
  const icons: Record<TimeOfDay, string> = {
    [TimeOfDay.DEEP_NIGHT]: '🌙',
    [TimeOfDay.DAWN]: '🌅',
    [TimeOfDay.MORNING]: '🌞',
    [TimeOfDay.AFTERNOON]: '☀️',
    [TimeOfDay.DUSK]: '🌇',
    [TimeOfDay.NIGHT]: '🌙',
  };
  return icons[phase];
}

export function getPhaseChangeMessage(phase: TimeOfDay): string {
  const messages: Record<TimeOfDay, string> = {
    [TimeOfDay.DEEP_NIGHT]: '🌙 La notte profonda avvolge il mondo...',
    [TimeOfDay.DAWN]: '🌅 L\'alba sta sorgendo all\'orizzonte...',
    [TimeOfDay.MORNING]: '🌞 Il sole sorge radioso nel cielo.',
    [TimeOfDay.AFTERNOON]: '☀️  Il sole splende alto nel cielo.',
    [TimeOfDay.DUSK]: '🌇 Il tramonto tinge il cielo di arancione...',
    [TimeOfDay.NIGHT]: '🌙 La notte avvolge il mondo nell\'oscurità.',
  };
  return messages[phase];
}
