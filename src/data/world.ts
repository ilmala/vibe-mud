import { v4 as uuidv4 } from 'uuid';
import { Room } from '../models';

export const ROOMS: Room[] = [
  {
    id: 'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6',
    title: 'Piazza Centrale',
    description:
      'Ti trovi nella piazza centrale del villaggio. Il sole splende sopra di te.\nUna taverna si trova a est. A nord vedi il tempio.',
    exits: {
      north: 'b5c6d7e8-f9g0-47h1-i2j3-k4l5m6n7o8p9',
      east: 'c8d9e0f1-g2h3-47i4-j5k6-l7m8n9o0p1q2',
    },
    doors: {
      east: {
        initialState: 'closed',
        name: 'porta della taverna',
        openMessage: 'La porta della taverna cigola aprendosi.',
        closeMessage: 'La porta della taverna si chiude con un tonfo.',
      },
    },
  },
  {
    id: 'b5c6d7e8-f9g0-47h1-i2j3-k4l5m6n7o8p9',
    title: 'Tempio Antico',
    description:
      'Dentro il tempio antico. Le pareti di pietra brillano alla luce delle candele.\nNel mezzo della stanza, una leva di ferro spunta dal pavimento.\nLa piazza centrale è a sud.\nA nord si vede una porta dorata.',
    exits: {
      south: 'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6',
      north: 'e2f3g4h5-i6j7-47k8-l9m0-n1o2p3q4r5s6',
    },
    interactables: {
      leva: {
        description: 'Tiri la leva di ferro. Un meccanismo antico si attiva con un rumore sordo...',
        triggerId: 'e8f0c3a1-d4b2-4f7e-9c5d-1a8b6e3f0d2c',
        command: 'tira', // Only 'tira leva' works, not 'premi leva' or 'usa leva'
      },
    },
    doors: {
      north: {
        initialState: 'locked',
        keyId: '550e8400-e29b-41d4-a716-446655440001',
        name: 'porta dorata',
        description: 'Una massiccia porta dorata con intricati intarsi.',
        openMessage: 'La porta dorata si apre lentamente, rivelando una stanza brillante.',
        closeMessage: 'La porta dorata si chiude con un suono metallico.',
      },
    },
    hiddenExits: {
      east: {
        roomId: 'd1e2f3g4-h5i6-47j7-k8l9-m0n1o2p3q4r5',
        requiredTrigger: 'e8f0c3a1-d4b2-4f7e-9c5d-1a8b6e3f0d2c',
        revealMessage: 'La leva scatta e il muro a est si ritrae! Un passaggio segreto si apre verso est!',
      },
    },
    items: ['550e8400-e29b-41d4-a716-446655440004'],
  },
  {
    id: 'c8d9e0f1-g2h3-47i4-j5k6-l7m8n9o0p1q2',
    title: 'La Taverna del Viandante',
    description:
      'Una taverna accogliente e piena di avventurieri. Il profumo di birra e cibo riempie l\'aria.\nLa piazza centrale è a ovest.',
    exits: {
      west: 'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6',
    },
    doors: {
      west: {
        initialState: 'open',
        name: 'porta della taverna',
      },
    },
  },
  {
    id: 'd1e2f3g4-h5i6-47j7-k8l9-m0n1o2p3q4r5',
    title: 'Cripta Segreta',
    description:
      'Una cripta ancestrale nascosta sotto il tempio. L\'aria è fredda e umida.\nAncichi simboli misteriosi ricoprono le pareti di pietra.\nIl Tempio Antico è a ovest.',
    exits: {
      west: 'b5c6d7e8-f9g0-47h1-i2j3-k4l5m6n7o8p9',
    },
    items: ['550e8400-e29b-41d4-a716-446655440002'],
  },
  {
    id: 'e2f3g4h5-i6j7-47k8-l9m0-n1o2p3q4r5s6',
    title: 'Stanza del Tesoro',
    description:
      'Una stanza brillante e ricca di tesori. Cofani d\'oro e argento sono sparsi sul pavimento.\nL\'aria splende di una luce dorata. Il Tempio Antico è a sud.',
    exits: {
      south: 'b5c6d7e8-f9g0-47h1-i2j3-k4l5m6n7o8p9',
    },
    doors: {
      south: {
        initialState: 'locked',
        keyId: '550e8400-e29b-41d4-a716-446655440001',
        name: 'porta dorata',
        description: 'Una massiccia porta dorata con intricati intarsi.',
        openMessage: 'La porta dorata si apre lentamente, rivelando il tempio.',
        closeMessage: 'La porta dorata si chiude con un suono metallico.',
      },
    },
    items: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'],
  },
];

export const STARTING_ROOM = 'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6';

export function getRoomById(id: string): Room | undefined {
  return ROOMS.find((room) => room.id === id);
}
