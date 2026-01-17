# Progetto: TypeScript MUD Engine

Questo documento definisce le specifiche per lo sviluppo di un motore MUD (Multi-User Dungeon) testuale.

## 1. Stack Tecnologico Richiesto
- **Runtime:** Node.js
- **Linguaggio:** TypeScript
- **Comunicazione:** Socket.io
- **Development:** ts-node-dev per il live-reload

## 2. Configurazione Iniziale (Setup)

### package.json
```json
{
  "name": "nebula-mud",
  "version": "0.1.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc"
  },
  "dependencies": {
    "socket.io": "^4.7.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "ts-node-dev": "^2.0.0"
  }
}
```

## 3. Struttura del Codice (Milestone 1)

**Directory Layout**
- `/src/server.ts` - Entry point e gestione Socket.io
- `/src/models/` - Interfacce e Tipi (Room, Player)
- `/src/data/` - Definizione della mappa (world.ts)
- `/src/engine/` - Parser dei comandi e logica di movimento

**Logica del Parser**
Il parser deve gestire stringhe semplici e dividerle in comando e argomento. Esempio: "vai nord" -> cmd: "vai", arg: "nord".

## 4. Requisiti Funzionali MVP
1. **Connessione**: L'utente si connette e riceve il "Messaggio del Giorno" (MOTD).
2. **Navigazione**: Comandi "nord", "sud", "est", "ovest" o "vai \<dir\>".
3. **Interazione Sociale**: Messaggi inviati a tutti i presenti nella stessa stanza ("broadcast").
4. **Ispezione**: Comando "guarda" per descrivere la stanza attuale.

## 5. Istruzioni per Claude Code
1. Inizializza il progetto npm e installa le dipendenze fornite.
2. Configura `tsconfig.json` per output in `/dist`.
3. Crea un sistema di gestione delle stanze basato su ID stringa.
4. Implementa la logica di movimento assicurandoti che i giocatori cambino "socket.io room" quando cambiano stanza nel gioco.

## 6. Client di Sviluppo
- Creare un file `src/client.ts` che utilizzi `socket.io-client`.
- Deve leggere l'input da `process.stdin` per inviare comandi.
- Deve stampare a video ogni messaggio ricevuto dal server.

---

### Prossimi Passi
1.  **Crea la cartella** del progetto sul tuo PC.
2.  **Crea il file** `mud-spec.md` e incolla il testo sopra.
3.  **Lancia Claude Code** nella cartella e scrivi:
    > *"Usa `mud-spec.md` come riferimento per inizializzare il progetto, creare la struttura delle cartelle e scrivere il codice per il server base con movimento tra stanze."*
    > 
