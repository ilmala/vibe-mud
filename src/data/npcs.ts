import { NPC } from '../models/NPC';

export const NPCS: NPC[] = [
  {
    id: 'npc-550e8400-e29b-41d4-a716-446655440001',
    name: 'Guardia del Tempio',
    roomId: 'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6', // Piazza Centrale
    description:
      'Una guardia in armatura di bronzo, con un elmo decorato da piume rosse.\nPorta una lancia lucida e osserva attentamente chiunque si avvicini al tempio.\nI suoi occhi sembrano seguire ogni movimento nella piazza.',
    shortDescription: 'una guardia vigile',
    emoji: '🛡️',
    type: 'guard',
    dialogues: [
      { response: 'Il mio dovere è proteggere l\'ingresso del tempio. Niente può superare la mia vigilanza.' },
      { response: 'Non ho tempo per chiacchiere oziose. Devo rimanere vigile.' },
      { response: 'Voci dicono che nel tempio ci siano passaggi segreti... ma nessuno ci crede.' },
      { response: 'Il tempio è un luogo sacro. Entra con rispetto.' },
      {
        response: 'Hmm? Un altro avventuriero? Sembra che ultimamente il tempio attiri sempre più gente strana.',
      },
    ],
  },
  {
    id: 'npc-550e8400-e29b-41d4-a716-446655440002',
    name: 'Oste Bartolomeo',
    roomId: 'c8d9e0f1-g2h3-47i4-j5k6-l7m8n9o0p1q2', // Taverna del Viandante
    description:
      'Un uomo robusto con capelli grigi e un grembiule macchiato di vino.\nLe sue mani callose raccontano una vita di lavoro dietro il banco della taverna.\nI suoi occhi brillano di esperienza e saggezza acquisita nel servire innumerevoli avventurieri.\nUna cicatrice corre lungo la sua guancia sinistra.',
    shortDescription: 'l\'oste della taverna',
    emoji: '🍺',
    type: 'merchant',
    dialogues: [
      { response: 'Benvenuto alla Taverna del Viandante! Vuoi qualcosa da bere? Ho il miglior vino della regione.' },
      { response: 'Ho visto molti avventurieri passare di qui. Ognuno con la propria storia, ognuno con il proprio destino.' },
      { response: 'Dicono che il tempio nasconda tesori indicibili. Ma pochi tornano a raccontare la storia...' },
      {
        response: 'Un buon boccale di birra al caldo fuoco della taverna è tutto ciò che serve per dimenticare i problemi del mondo.',
      },
      { response: 'Mi raccontano che hai il coraggio di un vero avventuriero. Questo mi piace.' },
    ],
  },
];

export function getNPCById(id: string): NPC | undefined {
  return NPCS.find(npc => npc.id === id);
}

export function getNPCByName(name: string): NPC | undefined {
  const normalizedName = name.toLowerCase();
  return NPCS.find(npc => npc.name.toLowerCase() === normalizedName);
}

export function getNPCsByRoom(roomId: string): NPC[] {
  return NPCS.filter(npc => npc.roomId === roomId);
}
