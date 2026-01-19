export interface NPCDialogue {
  keyword?: string;
  response: string;
  weight?: number;
}

export interface NPC {
  id: string; // Unique UUID (generated, not socket-based)
  name: string; // Display name
  roomId: string; // Current location (can change at runtime)
  description: string; // Full description shown when examined
  shortDescription?: string; // Brief description shown in room list
  dialogues: NPCDialogue[]; // Array of dialogue responses
  type?: string; // Optional category (merchant, guard, etc.)
  emoji?: string; // Visual identifier (e.g., "🧙" for wizard)
}
