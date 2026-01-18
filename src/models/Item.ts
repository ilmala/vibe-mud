export interface Item {
  id: string;           // UUID univoco
  name: string;         // Nome visualizzato
  description: string;  // Descrizione dettagliata
  type?: string;        // Categoria opzionale: 'key' | 'weapon' | 'treasure' | etc
  takeable?: boolean;   // Se può essere raccolto (default: true)
}
