import { Item } from '../models';

export const ITEMS: Item[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'chiave dorata',
    description: 'Una chiave dorata ornata con simboli antichi. Sembra aprire qualcosa di importante.',
    type: 'key',
    takeable: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'spada arrugginita',
    description: 'Una vecchia spada da combattimento. La lama è coperta di ruggine ma sembra ancora solida.',
    type: 'weapon',
    takeable: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'pergamena antica',
    description: 'Una pergamena ingiallita con scritture misteriose in una lingua sconosciuta.',
    type: 'treasure',
    takeable: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'altare di pietra',
    description: 'Un massiccio altare di pietra inciso con rune antiche. È troppo pesante per essere spostato.',
    type: 'furniture',
    takeable: false,
  },
];

export function getItemById(id: string): Item | undefined {
  return ITEMS.find(item => item.id === id);
}

export function getItemByName(name: string): Item | undefined {
  const normalizedName = name.toLowerCase();
  return ITEMS.find(item => item.name.toLowerCase() === normalizedName);
}
