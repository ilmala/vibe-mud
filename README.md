# Nebula MUD - TypeScript Multi-User Dungeon Engine

A real-time text-based multiplayer game server built with **TypeScript**, **Node.js**, and **Socket.io**. Explore a shared fantasy world, interact with other players, and experience an immersive day-night cycle system.

## Features

- **Real-time Multiplayer**: Multiple players can connect and interact simultaneously using WebSocket technology
- **Room-based Navigation**: Explore interconnected rooms with directional commands (nord, sud, est, ovest, su, giu)
- **Player Communication**: Chat with other players in the same room
- **Inventory System**: Pick up, drop, and examine items
- **NPCs (Non-Player Characters)**: Interactive characters scattered throughout the world with dialogue system
- **Monsters (Enemies)**: Combat-ready enemies with stats (HP, Attack, Defense) and loot drops (preparation for future combat system)
- **Realistic Day-Night Cycle**: 6-phase cycle (00:00-24:00) that completes every 10 minutes with dynamic time tracking
- **Interactive World**: Doors, hidden exits, triggers, and interactable objects
- **Experience System**: Gain experience points through interactions and monster encounters
- **Italian Localization**: All game text is in Italian

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Real-time Communication**: Socket.io
- **Development Server**: ts-node-dev (with live-reload)
- **Build**: TypeScript Compiler (tsc)

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mud
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Running the Server

### Development Mode
Start the server with live-reload for development:
```bash
npm run dev
```

The server will start on `http://localhost:3000` and automatically restart when you make changes to the code.

### Production Build
Build the TypeScript to JavaScript:
```bash
npm run build
```

Run the production build:
```bash
node dist/server.js
```

## Game Commands

### Movement
- `nord`, `sud`, `est`, `ovest` - Move in cardinal directions
- `su`, `giu` - Move up or down
- `vai <direction>` - Alternative movement syntax

### Interaction
- `guarda` - Look around and see the current room description (shows NPCs, Monsters, and other players)
- `dici <message>` - Say something to other players in the room
- `parla [npc]` - Talk to an NPC and receive dialogue responses
- `esamina <target>` - Examine a Monsters (shows stats and health), NPC, or object
- `tempo` / `ora` - Check the current time and day phase
- `prendi <item>` - Pick up an item
- `rilascia <item>` - Drop an item from your inventory
- `inventario` - View your inventory
- `aiuto` - Display available commands
- `esperienza` - Check your experience points

### Doors & Puzzles
- `apri <direction>` - Open a door
- `chiudi <direction>` - Close a door

## Day-Night Cycle

The game features a realistic 24-hour cycle that completes every 10 minutes:

| Phase | Time | Duration | Icon |
|-------|------|----------|------|
| Deep Night | 00:00 - 05:00 | 125s | 🌙 |
| Dawn | 05:00 - 07:00 | 50s | 🌅 |
| Morning | 07:00 - 12:00 | 125s | 🌞 |
| Afternoon | 12:00 - 17:00 | 125s | ☀️ |
| Dusk | 17:00 - 19:00 | 50s | 🌇 |
| Night | 19:00 - 00:00 | 125s | 🌙 |

All players receive notifications when the time phase changes, and room descriptions display the current phase icon.

## Project Structure

```
src/
├── server.ts              # Main entry point, Socket.io setup, connection handling
├── models/                # TypeScript interfaces
│   ├── Player.ts          # Player interface
│   ├── Room.ts            # Room interface
│   ├── Item.ts            # Item interface
│   ├── NPC.ts             # NPC character interface
│   └── Monster.ts         # Monster/Enemy interface
├── data/                  # Static world data
│   ├── world.ts           # Room definitions and connections
│   ├── items.ts           # Item definitions
│   ├── npcs.ts            # NPC character definitions
│   └── monsters.ts        # Monster/Enemy definitions
├── engine/                # Game logic
│   ├── gameTime.ts        # Day-night cycle system
│   ├── parser.ts          # Command parser
│   ├── gameLogic.ts       # Command execution logic
│   ├── npcs.ts            # NPC runtime tracking
│   ├── monsters.ts        # Monster runtime tracking and HP system
│   ├── items.ts           # Item system
│   ├── doors.ts           # Door mechanics
│   ├── triggers.ts        # World events
│   ├── experience.ts      # Experience system utilities
│   ├── commands/          # Command handlers
│   │   ├── movement/      # Movement commands
│   │   ├── interaction/   # Interaction commands (look, examine, talk, etc.)
│   │   └── system/        # System commands (help, time, experience)
│   └── utils.ts           # Utility functions
```

## Architecture

### Socket.io Rooms
The engine uses Socket.io's native room system for efficient message broadcasting. When a player moves between game rooms, they are moved between Socket.io rooms to ensure messages only reach players in the same location.

### Game Loop
The game runs a tick system that executes every second to manage time progression and day-night cycle transitions.

### NPCs (Non-Player Characters)
NPCs are stateless characters that populate the world and provide dialogue interactions:

- **Static Definitions**: NPCs are defined in `src/data/npcs.ts` with unique IDs, names, descriptions, and dialogue options
- **Display**: NPCs appear in room descriptions alongside monsters and players in the `[Presenti: ...]` section with emoji identifiers (🛡️, 🍺, etc.)
- **Interactions**: Players can talk to NPCs using the `parla` command to receive random dialogue responses
- **Runtime Tracking**: NPC positions can be tracked and changed dynamically using the `moveNPC()` function
- **Future Enhancement**: NPCs can be extended with AI behaviors, quest systems, or trading mechanics

### Monsters (Enemies)
Monsters are combat-ready enemies with statistics preparing for a future combat system:

- **Combat Stats**: Each monster has maxHP, attack damage, defense armor, and experience drops
- **Dynamic HP**: Current HP is tracked at runtime separately from max HP, allowing damage tracking
- **Display**: Monsters appear with hostile emoji (💀, 🐺, 🟢, etc.) in the `[Presenti: ...]` section, showing health bar when wounded `(35/50 HP)`
- **Loot System**: Monsters can carry items in their inventory that would be dropped when defeated
- **Examination**: Players can use `esamina` to view full monster stats including health bar, attack/defense values, XP drops, and possible loot
- **Future Combat**: The `setMonsterHp()`, `moveMonster()`, and `isMonsterAlive()` functions prepare the architecture for implementing attack commands and combat mechanics

### Present Room Display
When players use the `guarda` command, they see a unified `[Presenti: ...]` section showing all creatures in the room:
```
[Presenti: 💀 Scheletro Guerriero (35/50 HP), 🐺 Lupo Feroce, 🛡️ Guardia del Tempio, Mario, Sofia]
```
- **Monsters**: Listed first with hostile emoji and current HP (if wounded)
- **NPCs**: Listed second with friendly emoji
- **Players**: Listed last without emoji

## Contributing

Feel free to extend the game with:
- New NPCs in `src/data/npcs.ts`
- New Monsters in `src/data/monsters.ts`
- Combat system implementation using `AttackCommand`
- Monster AI behaviors and random movement
- Quest systems with NPC interactions
- Trading mechanics and merchant systems
- New rooms, items, and game mechanics

## License

MIT
