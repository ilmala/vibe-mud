// Experience system utilities
// Allows adding and subtracting experience from players

export function addExperience(currentExp: number, amount: number): number {
  if (amount < 0) {
    throw new Error('Use subtractExperience for negative amounts');
  }
  return currentExp + amount;
}

export function subtractExperience(currentExp: number, amount: number): number {
  if (amount < 0) {
    throw new Error('Use addExperience for positive amounts');
  }
  // Experience cannot go below 0
  return Math.max(0, currentExp - amount);
}

export function setExperience(amount: number): number {
  // Experience cannot be negative
  return Math.max(0, amount);
}

export function getExperienceString(experience: number): string {
  return `${experience}`;
}
