export { CommandHandler, CommandContext, CommandResult } from './CommandHandler';
export { CommandRegistry } from './CommandRegistry';
export { DirectionCommand, MoveCommand } from './movement';
export { LookCommand, SayCommand, InteractCommand } from './interaction';
export { HelpCommand } from './system';

import { CommandRegistry } from './CommandRegistry';
import { DirectionCommand, MoveCommand } from './movement';
import { LookCommand, SayCommand, InteractCommand } from './interaction';
import { HelpCommand } from './system';

export function initializeCommands(): CommandRegistry {
  const registry = new CommandRegistry();

  // Create direction commands for all four directions
  const directions = [
    { italian: 'nord', english: 'north' },
    { italian: 'sud', english: 'south' },
    { italian: 'est', english: 'east' },
    { italian: 'ovest', english: 'west' },
  ];

  const directionalHandlers = directions.map(
    (dir) => new DirectionCommand(dir.italian, dir.english)
  );

  // Create other commands
  const moveHandler = new MoveCommand();
  const lookHandler = new LookCommand();
  const sayHandler = new SayCommand();
  const interactHandler = new InteractCommand();

  // Register non-help commands first
  registry.registerAll([...directionalHandlers, moveHandler, lookHandler, sayHandler, interactHandler]);

  // Create and register help command (it needs the registry)
  const helpHandler = new HelpCommand(registry);
  registry.register(helpHandler);

  return registry;
}
