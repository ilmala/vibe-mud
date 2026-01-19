import { Monster } from '../models/Monster';

export const MONSTERS: Monster[] = [
  {
    id: 'monster-550e8400-e29b-41d4-a716-446655440001',
    name: 'Scheletro Guerriero',
    roomId: 'b5c6d7e8-f9g0-47h1-i2j3-k4l5m6n7o8p9', // Tempio Antico
    description:
      'Un guerriero non-morto armato di spada arrugginita.\n' +
      'Le sue ossa bianche brillano debolmente nella penombra.\n' +
      'I suoi occhi vuoti e infocati sembrano fissarti con intento malevolo.\n' +
      'Trama il suono inconfondibile di ossa che si sfregano con ogni movimento.',
    shortDescription: 'uno scheletro guerriero minaccioso',
    emoji: '💀',
    type: 'undead',
    maxHp: 50,
    attack: 15,
    defense: 8,
    experienceDrop: 25,
    inventory: ['550e8400-e29b-41d4-a716-446655440002'], // rusted sword
    level: 3,
    aggressive: true,
  },
  {
    id: 'monster-550e8400-e29b-41d4-a716-446655440002',
    name: 'Lupo Feroce',
    roomId: 'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6', // Piazza Centrale (for now)
    description:
      'Un grande lupo dalle zanne affilate e pelliccia nera come la notte.\n' +
      'I suoi occhi gialli ti osservano con una fame primitiva.\n' +
      'Un ringhio basso esce dalla sua gola, un suono che fa gelare il sangue.\n' +
      'Ogni muscolo del suo corpo è teso, pronto a balzare.',
    shortDescription: 'un lupo dalle zanne affilate',
    emoji: '🐺',
    type: 'beast',
    maxHp: 35,
    attack: 12,
    defense: 5,
    experienceDrop: 18,
    inventory: [],
    level: 2,
    aggressive: true,
  },
  {
    id: 'monster-550e8400-e29b-41d4-a716-446655440003',
    name: 'Slime Velenoso',
    roomId: 'e2f3g4h5-i6j7-47k8-l9m0-n1o2p3q4r5s6', // Stanza del Tesoro
    description:
      'Una massa gelatinosa verde che pulsa lentamente con una vita propria.\n' +
      'Gocce di acido corrosivo cadono dal suo corpo informe.\n' +
      'L\'odore nauseante di putrefazione e acido riempie l\'aria.\n' +
      'La creatura si muove strisciando verso di te, lasciando una scia di liquido tossico.',
    shortDescription: 'uno slime che gocciola acido',
    emoji: '🟢',
    type: 'ooze',
    maxHp: 25,
    attack: 8,
    defense: 2,
    experienceDrop: 12,
    inventory: [],
    level: 1,
    aggressive: false,
  },
];

export function getMonsterById(id: string): Monster | undefined {
  return MONSTERS.find(monster => monster.id === id);
}

export function getMonsterByName(name: string): Monster | undefined {
  const normalizedName = name.toLowerCase();
  return MONSTERS.find(monster => monster.name.toLowerCase() === normalizedName);
}

export function getMonstersByRoom(roomId: string): Monster[] {
  return MONSTERS.filter(monster => monster.roomId === roomId);
}
