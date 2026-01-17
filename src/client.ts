import { io } from 'socket.io-client';
import * as readline from 'readline';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

const socket = io(SERVER_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let isConnected = false;
let nameChosen = false;

socket.on('connect', () => {
  isConnected = true;
  console.log('✓ Connesso al server\n');
});

socket.on('disconnect', () => {
  isConnected = false;
  console.log('\n✗ Disconnesso dal server');
  rl.close();
  process.exit(0);
});

socket.on('message', (msg: string) => {
  console.log(msg);
  if (isConnected && nameChosen) {
    promptInput();
  }
});

socket.on('requestName', () => {
  promptForName();
});

socket.on('error', (error: any) => {
  console.error('Errore:', error);
});

function promptForName(): void {
  rl.question('Inserisci il tuo nome di giocatore: ', (input: string) => {
    const trimmed = input.trim();

    if (!trimmed) {
      console.log('Il nome non può essere vuoto.\n');
      promptForName();
      return;
    }

    nameChosen = true;
    socket.emit('setName', trimmed);
  });
}

function promptInput(): void {
  rl.question('> ', (input: string) => {
    const trimmed = input.trim();

    if (!trimmed) {
      promptInput();
      return;
    }

    if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
      console.log('Arrivederci!');
      socket.disconnect();
      rl.close();
      process.exit(0);
    }

    // Send command to server
    socket.emit('command', trimmed);
  });
}

console.log(`🎮 Connessione al server MUD su ${SERVER_URL}...`);
