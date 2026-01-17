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
}
