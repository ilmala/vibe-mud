// Experience system utilities
// Allows adding and subtracting experience from players

// XP thresholds for level progression
// Each level requires a total accumulated XP
const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 1000,
  3: 2500,
  4: 5000,
  5: 9000,
  6: 14000,
  7: 20000,
  8: 27000,
  9: 35000,
  10: 45000,
};

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

/**
 * Calculate the player's level based on total experience
 * @param totalExperience Total accumulated experience points
 * @returns The player's current level
 */
export function calculateLevel(totalExperience: number): number {
  // Find the highest level where totalExperience >= threshold
  let level = 1;
  for (const [lvl, threshold] of Object.entries(XP_THRESHOLDS)) {
    if (totalExperience >= threshold) {
      level = Math.max(level, parseInt(lvl));
    } else {
      break;
    }
  }
  return level;
}

/**
 * Get the XP required to reach the next level
 * @param currentLevel Current player level
 * @returns XP threshold for next level, or null if at max level
 */
export function getNextLevelThreshold(currentLevel: number): number | null {
  const nextLevel = currentLevel + 1;
  return XP_THRESHOLDS[nextLevel] ?? null;
}

/**
 * Get XP progress towards next level
 * @param totalExperience Total accumulated experience
 * @param currentLevel Current level
 * @returns Object with currentLevelXp and nextLevelXp
 */
export function getExperienceProgress(totalExperience: number, currentLevel: number): {
  currentLevelXp: number;
  nextLevelXp: number | null;
  progressToNext: number;
} {
  const currentThreshold = XP_THRESHOLDS[currentLevel] ?? 0;
  const nextThreshold = getNextLevelThreshold(currentLevel);

  const currentLevelXp = totalExperience - currentThreshold;
  const nextLevelXp = nextThreshold ? nextThreshold - currentThreshold : null;
  const progressToNext = nextLevelXp ? (currentLevelXp / nextLevelXp) * 100 : 100;

  return {
    currentLevelXp,
    nextLevelXp,
    progressToNext,
  };
}

export function getExperienceString(experience: number): string {
  return `${experience}`;
}
