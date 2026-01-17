// Global trigger state management
const activatedTriggers = new Set<string>();

export function isTriggered(triggerId: string): boolean {
  return activatedTriggers.has(triggerId);
}

export function activateTrigger(triggerId: string): void {
  activatedTriggers.add(triggerId);
}

export function getAllActivatedTriggers(): string[] {
  return Array.from(activatedTriggers);
}

export function resetTriggers(): void {
  activatedTriggers.clear();
}
