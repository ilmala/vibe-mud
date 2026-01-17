export interface Room {
  id: string;
  title: string;
  description: string;
  exits: {
    north?: string;
    south?: string;
    east?: string;
    west?: string;
  };
  interactables?: {
    [key: string]: {
      description: string;
      triggerId: string;
      command?: string; // Required command to interact (e.g., 'tira', 'premi', 'apri')
    };
  };
  hiddenExits?: {
    [direction: string]: {
      roomId: string;
      requiredTrigger: string;
      revealMessage?: string;
    };
  };
}
