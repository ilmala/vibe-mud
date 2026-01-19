import { CommandHandler, CommandContext, CommandResult } from '../CommandHandler';
import { getNPCsInRoom } from '../../npcs';
import { getNPCByName } from '../../../data/npcs';

export class ParlaCommand implements CommandHandler {
  name = 'parla';
  aliases = ['dialoga', 'talk'];
  requiresArg = false;
  description = 'Parla con un personaggio';
  usage = 'parla [personaggio]';

  execute(arg: string, context: CommandContext): CommandResult {
    const npcsInRoom = getNPCsInRoom(context.currentRoomId);

    // If no argument, list available NPCs to talk to
    if (!arg) {
      if (npcsInRoom.length === 0) {
        return {
          type: 'info',
          message: 'Non c\'è nessuno con cui parlare qui.',
        };
      }

      const npcList = npcsInRoom
        .map(npc => {
          const emoji = npc.emoji || '👤';
          return `  ${emoji} ${npc.name}`;
        })
        .join('\n');

      return {
        type: 'info',
        message: `Persone con cui puoi parlare:\n${npcList}\n\nUsa: parla <nome>`,
      };
    }

    // Find NPC by name
    const targetName = arg.toLowerCase();
    const npcMatch = npcsInRoom.find(npc => npc.name.toLowerCase().includes(targetName));

    if (!npcMatch) {
      return {
        type: 'error',
        message: `Non vedi nessuno chiamato "${arg}" qui.`,
      };
    }

    // Get full NPC data
    const fullNPC = getNPCByName(npcMatch.name);
    if (!fullNPC || !fullNPC.dialogues || fullNPC.dialogues.length === 0) {
      return {
        type: 'info',
        message: `${fullNPC?.name || 'Il personaggio'} non ha nulla da dire al momento.`,
      };
    }

    // Select random dialogue
    const randomIndex = Math.floor(Math.random() * fullNPC.dialogues.length);
    const dialogue = fullNPC.dialogues[randomIndex];

    const emoji = fullNPC.emoji || '👤';

    return {
      type: 'info',
      message: `${emoji} ${fullNPC.name} dice:\n\n"${dialogue.response}"`,
    };
  }
}
