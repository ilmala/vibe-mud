"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCommand = exports.SayCommand = exports.LookCommand = exports.MoveCommand = exports.DirectionCommand = exports.CommandRegistry = void 0;
exports.initializeCommands = initializeCommands;
var CommandRegistry_1 = require("./CommandRegistry");
Object.defineProperty(exports, "CommandRegistry", { enumerable: true, get: function () { return CommandRegistry_1.CommandRegistry; } });
var movement_1 = require("./movement");
Object.defineProperty(exports, "DirectionCommand", { enumerable: true, get: function () { return movement_1.DirectionCommand; } });
Object.defineProperty(exports, "MoveCommand", { enumerable: true, get: function () { return movement_1.MoveCommand; } });
var interaction_1 = require("./interaction");
Object.defineProperty(exports, "LookCommand", { enumerable: true, get: function () { return interaction_1.LookCommand; } });
Object.defineProperty(exports, "SayCommand", { enumerable: true, get: function () { return interaction_1.SayCommand; } });
var system_1 = require("./system");
Object.defineProperty(exports, "HelpCommand", { enumerable: true, get: function () { return system_1.HelpCommand; } });
const CommandRegistry_2 = require("./CommandRegistry");
const movement_2 = require("./movement");
const interaction_2 = require("./interaction");
const system_2 = require("./system");
function initializeCommands() {
    const registry = new CommandRegistry_2.CommandRegistry();
    // Create direction commands for all four directions
    const directions = [
        { italian: 'nord', english: 'north' },
        { italian: 'sud', english: 'south' },
        { italian: 'est', english: 'east' },
        { italian: 'ovest', english: 'west' },
    ];
    const directionalHandlers = directions.map((dir) => new movement_2.DirectionCommand(dir.italian, dir.english));
    // Create other commands
    const moveHandler = new movement_2.MoveCommand();
    const lookHandler = new interaction_2.LookCommand();
    const sayHandler = new interaction_2.SayCommand();
    // Register non-help commands first
    registry.registerAll([...directionalHandlers, moveHandler, lookHandler, sayHandler]);
    // Create and register help command (it needs the registry)
    const helpHandler = new system_2.HelpCommand(registry);
    registry.register(helpHandler);
    return registry;
}
//# sourceMappingURL=index.js.map