# Nebula MUD - TypeScript Multi-User Dungeon Engine

A real-time text-based multiplayer game server built with **TypeScript**, **Node.js**, and **Socket.io**. Explore a shared fantasy world, interact with other players, and experience an immersive day-night cycle system.

## Features

- **Real-time Multiplayer**: Multiple players can connect and interact simultaneously using WebSocket technology
- **Room-based Navigation**: Explore interconnected rooms with directional commands (nord, sud, est, ovest, su, giu)
- **Player Communication**: Chat with other players in the same room
- **Inventory System**: Pick up, drop, and examine items
- **Realistic Day-Night Cycle**: 6-phase cycle (00:00-24:00) that completes every 10 minutes with dynamic time tracking
- **Interactive World**: Doors, hidden exits, triggers, and interactable objects
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
- `guarda` - Look around and see the current room description
- `parla <message>` - Say something to other players in the room
- `tempo` / `ora` - Check the current time and day phase
- `prendi <item>` - Pick up an item
- `rilascia <item>` - Drop an item from your inventory
- `inventario` - View your inventory
- `esamina <object>` - Examine an interactive object
- `aiuto` - Display available commands

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
├── models/                # TypeScript interfaces (Room, Player, etc.)
├── data/                  # World data (world.ts - room definitions)
├── engine/                # Game logic
│   ├── gameTime.ts        # Day-night cycle system
│   ├── parser.ts          # Command parser
│   ├── gameLogic.ts       # Command execution logic
│   ├── commands/          # Command handlers
│   ├── items.ts           # Item system
│   ├── doors.ts           # Door mechanics
│   ├── triggers.ts        # World events
│   └── utils.ts           # Utility functions
```

## Architecture

### Socket.io Rooms
The engine uses Socket.io's native room system for efficient message broadcasting. When a player moves between game rooms, they are moved between Socket.io rooms to ensure messages only reach players in the same location.

### Game Loop
The game runs a tick system that executes every second to manage time progression and day-night cycle transitions.

## Contributing

Feel free to extend the game with new features, rooms, items, and mechanics!

## License

MIT
