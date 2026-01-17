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
  },
  {
    id: 'b5c6d7e8-f9g0-47h1-i2j3-k4l5m6n7o8p9',
    title: 'Tempio Antico',
    description:
      'Dentro il tempio antico. Le pareti di pietra brillano alla luce delle candele.\nLa piazza centrale è a sud.',
    exits: {
      south: 'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6',
    },
  },
  {
    id: 'c8d9e0f1-g2h3-47i4-j5k6-l7m8n9o0p1q2',
    title: 'La Taverna del Viandante',
    description:
      'Una taverna accogliente e piena di avventurieri. Il profumo di birra e cibo riempie l\'aria.\nLa piazza centrale è a ovest.',
    exits: {
      west: 'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6',
    },
  },
];

export const STARTING_ROOM = 'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6';

export function getRoomById(id: string): Room | undefined {
  return ROOMS.find((room) => room.id === id);
}
