export { CommandHandler, CommandContext, CommandResult } from './CommandHandler';
export { CommandRegistry } from './CommandRegistry';
export { DirectionCommand, MoveCommand } from './movement';
export { LookCommand, SayCommand, InteractCommand, OpenDoorCommand, CloseDoorCommand, PickupCommand, DropCommand, InventoryCommand, ExamineCommand } from './interaction';
export { HelpCommand } from './system';

import { CommandRegistry } from './CommandRegistry';
import { DirectionCommand, MoveCommand } from './movement';
import { LookCommand, SayCommand, InteractCommand, OpenDoorCommand, CloseDoorCommand, PickupCommand, DropCommand, InventoryCommand, ExamineCommand } from './interaction';
import { HelpCommand } from './system';

export function initializeCommands(): CommandRegistry {
  const registry = new CommandRegistry();

  // Create direction commands for all six directions
  const directions = [
    { italian: 'nord', english: 'north' },
    { italian: 'sud', english: 'south' },
    { italian: 'est', english: 'east' },
    { italian: 'ovest', english: 'west' },
    { italian: 'su', english: 'up' },
    { italian: 'giu', english: 'down' },
  ];

  const directionalHandlers = directions.map(
    (dir) => new DirectionCommand(dir.italian, dir.english)
  );

  // Create other commands
  const moveHandler = new MoveCommand();
  const lookHandler = new LookCommand();
  const sayHandler = new SayCommand();
  const interactHandler = new InteractCommand();
  const openDoorHandler = new OpenDoorCommand();
  const closeDoorHandler = new CloseDoorCommand();
  const pickupHandler = new PickupCommand();
  const dropHandler = new DropCommand();
  const inventoryHandler = new InventoryCommand();
  const examineHandler = new ExamineCommand();

  // Register non-help commands first
  registry.registerAll([
    ...directionalHandlers,
    moveHandler,
    lookHandler,
    sayHandler,
    interactHandler,
    openDoorHandler,
    closeDoorHandler,
    pickupHandler,
    dropHandler,
    inventoryHandler,
    examineHandler
  ]);

  // Create and register help command (it needs the registry)
  const helpHandler = new HelpCommand(registry);
  registry.register(helpHandler);

  return registry;
}
