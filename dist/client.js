"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const readline = __importStar(require("readline"));
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const socket = (0, socket_io_client_1.io)(SERVER_URL, {
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
socket.on('message', (msg) => {
    console.log(msg);
    if (isConnected && nameChosen) {
        promptInput();
    }
});
socket.on('requestName', () => {
    promptForName();
});
socket.on('error', (error) => {
    console.error('Errore:', error);
});
function promptForName() {
    rl.question('Inserisci il tuo nome di giocatore: ', (input) => {
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
function promptInput() {
    rl.question('> ', (input) => {
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
//# sourceMappingURL=client.js.map