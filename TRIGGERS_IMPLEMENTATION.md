# Global Trigger System - Implementation Summary

## Overview
Implemented a global trigger system for revealing hidden exits in the MUD Engine. Triggers are global (all players see the effect) and in-memory only (no persistence).

## Files Created

### 1. `src/engine/triggers.ts` (NEW)
Global trigger state management module.

**Functions:**
- `isTriggered(triggerId: string): boolean` - Check if a trigger is active
- `activateTrigger(triggerId: string): void` - Activate a trigger globally
- `getAllActivatedTriggers(): string[]` - Get list of all active triggers
- `resetTriggers(): void` - Clear all triggers (useful for testing/restart)

## Files Modified

### 1. `src/models/Room.ts`
Extended Room interface with:
```typescript
interactables?: {
  [key: string]: {
    description: string;      // What happens when player interacts
    triggerId: string;        // Trigger ID to activate
    command?: string;         // Required command (e.g., 'tira', 'premi', 'apri')
  };
};

hiddenExits?: {
  [direction: string]: {
    roomId: string;           // Destination room
    requiredTrigger: string;  // Trigger ID required to use this exit
    revealMessage?: string;   // Message shown when revealed
  };
};
```

### 2. `src/engine/commands/CommandHandler.ts`
Extended CommandContext interface:
```typescript
command?: string; // The actual command used (e.g., 'tira' if user typed 'tira leva')
```

Extended CommandResult interface:
```typescript
triggerActivated?: {
  triggerId: string;
  globalMessage?: string;  // Message broadcast to room
};
```

### 3. `src/engine/commands/interaction/InteractCommand.ts` (NEW)
Command handler for interacting with objects.

**Aliases:** `usa`, `tira`, `premi`, `attiva`, `aziona`, `apri`
**Usage:** `usa <object>` or `tira leva`, `premi pulsante`, etc.

**Logic:**
1. Get the command used from context (`context.command`)
2. Validate object exists in room's interactables
3. If object has a required `command`, verify the user used the correct command
   - Example: If leva has `command: 'tira'`, then `tira leva` works but `premi leva` fails with error message
4. Activate the trigger globally
5. Broadcast reveal message to all players in room
6. Return appropriate feedback

### 4. `src/engine/utils.ts` (getRoomDescription)
- Shows interactables: `[Oggetti: leva, pulsante, ...]`
- Shows hidden exits only if their triggers are activated
- Maintains existing exit and player information display

### 5. `src/engine/commands/movement/DirectionCommand.ts`
- Check hidden exits if normal exit not found
- Validate trigger is activated before allowing movement
- Clear error messages for blocked paths

### 6. `src/engine/commands/movement/MoveCommand.ts`
- Same hidden exit logic as DirectionCommand
- Works with `vai` command

### 7. `src/engine/commands/index.ts`
- Import and register InteractCommand
- Added to command registry

### 8. `src/server.ts`
- Handle `interact` result type
- Broadcast trigger activation messages to room
- Global trigger state persists across all connected players

### 9. `src/data/world.ts`
**Test scenario added:**
- **Tempio Antico**: Ancient Temple with "leva" (lever) interactable
  - Contains hidden exit to east (Cripta Segreta)
  - Requires trigger: `e8f0c3a1-d4b2-4f7e-9c5d-1a8b6e3f0d2c` (UUID)

- **Cripta Segreta**: Secret Crypt (new room)
  - Accessible only via revealed hidden exit
  - Connected back to temple via west exit

## How It Works

### For Room Designers

Simply use UUIDs directly in your room definitions:

```typescript
{
  id: 'room-id-uuid',
  title: 'Room Title',
  description: 'Room description',
  exits: {
    south: 'other-room-id-uuid'
  },
  interactables: {
    'object-name': {
      description: 'What happens when player interacts',
      triggerId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  // Any UUID
      command: 'tira'  // OPTIONAL: Required command to interact (tira, premi, apri, usa, etc.)
    }
  },
  hiddenExits: {
    'east': {
      roomId: 'secret-room-id-uuid',
      requiredTrigger: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  // Same UUID as triggerId
      revealMessage: 'A secret door opens to the east!'
    }
  }
}
```

**Key Points:**
- The `triggerId` in interactables must match the `requiredTrigger` in hiddenExits for the trigger to work
- The `command` field is optional. If specified, only that command will activate the trigger
  - `command: 'tira'` → Only `tira object` works, not `premi object` or `usa object`
  - If no command is specified, any interaction command works (backward compatible)

**Example with multiple triggers and specific commands:**
```typescript
{
  id: 'complex-room',
  interactables: {
    'lever': {
      description: 'You pull the lever...',
      triggerId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  // Trigger A
      command: 'tira'  // Only 'tira lever' works
    },
    'pulsante': {  // Italian for "button"
      description: 'You press the button...',
      triggerId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',  // Trigger B
      command: 'premi'  // Only 'premi pulsante' works
    },
    'porta':  {  // Italian for "door"
      description: 'You open the door...',
      triggerId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',  // Trigger C
      command: 'apri'  // Only 'apri porta' works
    }
  },
  hiddenExits: {
    'east': {
      roomId: 'secret-room-1',
      requiredTrigger: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      revealMessage: 'The east wall opens!'
    },
    'west': {
      roomId: 'secret-room-2',
      requiredTrigger: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      revealMessage: 'The west wall opens!'
    },
    'north': {
      roomId: 'secret-room-3',
      requiredTrigger: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      revealMessage: 'The north wall opens!'
    }
  }
}
```

**User interaction example:**
- ✅ `tira lever` → activates Trigger A, reveals east exit
- ❌ `premi lever` → error: "Devi tira lever, non premiarlo."
- ✅ `premi pulsante` → activates Trigger B, reveals west exit
- ❌ `tira pulsante` → error: "Devi premi pulsante, non tirarlo."
- ✅ `apri porta` → activates Trigger C, reveals north exit
- ❌ `usa porta` → error: "Devi apri porta, non usarlo."

### For Players
1. Enter a room with interactables: `guarda` shows objects in `[Oggetti: ...]`
2. Interact with object using the correct command:
   - If object has a required `command`, use exactly that command
   - Example: `tira leva` (not `premi leva` or `usa leva`)
   - If no specific command required, any interaction command works: `usa`, `tira`, `premi`, etc.
3. If you use the wrong command, you get a helpful error message
4. When you use the correct command, all players in the room see the trigger reveal message
5. Hidden exits immediately appear: `guarda` now shows them in `[Uscite: ...]`
6. Can now traverse the exit: `est` or `vai est`

### Global State Behavior
- When one player activates a trigger, ALL players see the change
- New players joining see already-revealed exits (global in-memory state)
- Triggers persist until server restart (in-memory only)
- No database persistence required

## Command Validation Examples

When an object has a required `command`, the system validates user input:

| Object | Command | User Input | Result |
|--------|---------|-----------|--------|
| leva (lever) | tira | `tira leva` | ✅ Trigger activated |
| leva | tira | `premi leva` | ❌ Error: "Devi tira leva, non premiarlo." |
| leva | tira | `usa leva` | ❌ Error: "Devi tira leva, non usarlo." |
| pulsante (button) | premi | `premi pulsante` | ✅ Trigger activated |
| pulsante | premi | `tira pulsante` | ❌ Error: "Devi premi pulsante, non tirarlo." |
| porta (door) | apri | `apri porta` | ✅ Trigger activated |
| porta | apri | `usa porta` | ❌ Error: "Devi apri porta, non usarlo." |

Objects without a `command` field accept any interaction command.

## Test Results ✅

**Scenario:** Two players, one room with lever triggering hidden exit

1. Player 1: navigates to temple ✅
2. Player 1: sees "leva" in interactables ✅
3. Player 1: cannot go east (hidden, no trigger) ✅
4. Player 1: pulls lever → global trigger activated ✅
5. Player 1: can now see east exit ✅
6. Player 1: moves to secret crypt ✅
7. Player 2: joins and navigates to temple ✅
8. Player 2: immediately sees east exit (global trigger state) ✅
9. Player 2: can move east without re-activating trigger ✅

## Future Extensions

The system is designed to be extensible:

- **Multiple triggers per room**: Different levers revealing different exits
- **Sequential triggers**: Require Trigger A before activating Trigger B
- **Trigger effects**: Beyond exits - could spawn objects, change room descriptions, etc.
- **Persistent state**: Swap `Set<string>` for database storage
- **Trigger consumption**: One-time use vs. repeatable triggers

## Database Migration Notes

To add persistence, replace the in-memory Set with database calls:

```typescript
// Before: const activatedTriggers = new Set<string>();

// After: Store/retrieve from database
const activatedTriggers = await db.getTriggers();
await db.saveTrigger(triggerId);
```

No code changes needed to command handlers - only the `triggers.ts` module needs updating.
