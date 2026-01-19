import * as readline from 'readline';

const SERVER_URL = process.env.SERVER_URL || 'ws://localhost:3000/ws';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let ws: WebSocket | null = null;
let isConnected = false;
let nameChosen = false;

// Message types for communication
interface Message {
  type: string;
  data?: string;
  excludePlayerId?: string;
}

// Connect to WebSocket server
function connect(): void {
  console.log(`🎮 Connessione al server MUD su ${SERVER_URL}...`);

  ws = new WebSocket(SERVER_URL);

  ws.onopen = () => {
    isConnected = true;
    console.log('✓ Connesso al server\n');
  };

  ws.onmessage = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data) as Message;

      if (message.type === 'message') {
        console.log(message.data || '');
        if (isConnected && nameChosen) {
          promptInput();
        }
      } else if (message.type === 'requestName') {
        promptForName();
      } else if (message.type === 'error') {
        console.error('❌ Errore:', message.data);
      }
    } catch (error) {
      console.error('Errore nel parsing del messaggio:', error);
    }
  };

  ws.onerror = (error: Event) => {
    console.error('Errore WebSocket:', error);
  };

  ws.onclose = () => {
    isConnected = false;
    console.log('\n✗ Disconnesso dal server');
    rl.close();
    process.exit(0);
  };
}

function promptForName(): void {
  rl.question('Inserisci il tuo nome di giocatore: ', (input: string) => {
    const trimmed = input.trim();

    if (!trimmed) {
      console.log('Il nome non può essere vuoto.\n');
      promptForName();
      return;
    }

    nameChosen = true;
    sendMessage('setName', trimmed);
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
      if (ws) {
        ws.close();
      }
      rl.close();
      process.exit(0);
    }

    // Send command to server
    sendMessage('command', trimmed);
  });
}

function sendMessage(type: string, data: string): void {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error('❌ Non connesso al server');
    return;
  }

  const message: Message = { type, data };
  ws.send(JSON.stringify(message));
}

// Start the client
connect();
