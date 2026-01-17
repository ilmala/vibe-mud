# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **TypeScript MUD (Multi-User Dungeon) Engine** - a text-based multiplayer game server. The MVP implements room-based navigation, player communication, and real-time synchronization using Socket.io.

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Communication:** Socket.io (real-time, room-based messaging)
- **Development:** ts-node-dev (live-reload during development)
- **Build:** TypeScript compiler (tsc)

## Development Commands

### Setup
```bash
npm install
```

### Development
```bash
npm run dev
```
Runs the server with live-reload at `src/server.ts`. Auto-restarts on file changes.

### Build
```bash
npm run build
```
Compiles TypeScript to JavaScript in the `dist/` directory.

### Running Production Build
```bash
node dist/server.js
```

## Code Architecture

### Directory Structure
```
src/
├── server.ts          # Entry point, Socket.io setup, connection handling
├── models/            # TypeScript interfaces and types (Room, Player, etc.)
├── data/              # Static world data (world.ts - room definitions and connections)
└── engine/            # Command parser and game logic (movement, interactions)
```

### Core Concepts

**Socket.io Rooms:** The project uses Socket.io's native room system for efficient message broadcasting. When a player moves between game rooms, they must also be moved between Socket.io rooms to ensure messages only reach players in the same location.

**Command Parser:** Simple pattern of "command + argument" (e.g., "vai nord" → cmd: "vai", arg: "nord"). Located in `src/engine/`.

**Player State:** Players are identified by their Socket.io connection ID. Their current room location is stored and used to determine who receives broadcasts.

### MVP Features
1. **Connection:** MOTD (Message of the Day) on connect
2. **Navigation:** Directional commands (nord/sud/est/ovest) or "vai <direction>"
3. **Communication:** Broadcast messages to all players in the same room
4. **Inspection:** "guarda" command to describe current room

## Key Implementation Details

### World Definition (src/data/world.ts)
Define all game rooms with their descriptions and connections. Each room should have:
- A unique string ID
- A description
- Connected exits (connections to adjacent rooms)

### Movement Logic
When a player moves:
1. Validate the direction exists from current room
2. Update player's room location
3. Remove them from the old Socket.io room
4. Add them to the new Socket.io room
5. Notify players in the old room of departure
6. Notify players in the new room of arrival
7. Send the new room description to the player

### Broadcasting
Use Socket.io rooms to broadcast messages:
- `io.to(roomId).emit('message', ...)` for all players in a room
- `socket.emit('message', ...)` for individual player notifications

## TypeScript Configuration

- Output: `dist/` directory
- Module format: CommonJS (Node.js standard)
- Target: ES2020 or compatible with your Node.js version
