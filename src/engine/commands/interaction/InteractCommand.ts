import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getRoomById } from '../../../data/world';
import { isTriggered, activateTrigger } from '../../triggers';

export class InteractCommand implements CommandHandler {
  name = 'usa';
  aliases = ['tira', 'premi', 'attiva', 'aziona', 'apri'];
  requiresArg = true;
  description = 'Interagisci con un oggetto nella stanza';
  usage = 'usa <oggetto> (o: tira, premi, attiva, aziona, apri)';

  execute(arg: string, context: CommandContext): CommandResult {
    const usedCommand = context.command || 'usa';

    const room = getRoomById(context.currentRoomId);
    if (!room) {
      return {
        type: 'error',
        message: 'Stanza attuale non trovata.',
      };
    }

    if (!room.interactables) {
      return {
        type: 'error',
        message: 'Non c\'è niente da interagire in questa stanza.',
      };
    }

    const objectName = arg.toLowerCase();
    const interactable = room.interactables[objectName];

    if (!interactable) {
      return {
        type: 'error',
        message: `Non riesci a trovare "${arg}" qui.`,
      };
    }

    // Check if a specific command is required for this object
    if (interactable.command && usedCommand !== interactable.command) {
      return {
        type: 'error',
        message: `Non puoi ${usedCommand} la ${objectName}.`,
      };
    }

    // Check if this trigger is already activated
    const alreadyTriggered = isTriggered(interactable.triggerId);

    // Activate the trigger
    activateTrigger(interactable.triggerId);

    // Find hidden exits that are revealed by this trigger
    let revealedExits: string[] = [];
    if (room.hiddenExits) {
      for (const [direction, hiddenExit] of Object.entries(room.hiddenExits)) {
        if (hiddenExit.requiredTrigger === interactable.triggerId) {
          revealedExits.push(direction);
        }
      }
    }

    let globalMessage = '';
    if (revealedExits.length > 0 && !alreadyTriggered) {
      const exitDescription = revealedExits.length === 1
        ? `uscita verso ${revealedExits[0]}`
        : `uscite verso ${revealedExits.join(', ')}`;
      globalMessage = room.hiddenExits![revealedExits[0]]?.revealMessage ||
        `Un passaggio segreto si apre! Nuova ${exitDescription}!`;
    } else if (alreadyTriggered) {
      globalMessage = `${interactable.description} non accade nulla di nuovo.`;
    }

    return {
      type: 'interact',
      message: `${interactable.description}`,
      triggerActivated: {
        triggerId: interactable.triggerId,
        globalMessage: globalMessage,
      },
    };
  }
}
