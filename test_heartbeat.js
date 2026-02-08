import { WebSocket } from 'ws';

const url = 'ws://localhost:8000/ws';
const pingInterval = 5000; // 5 seconds for faster testing

console.log('Connecting to', url);

const ws = new WebSocket(url);

ws.on('open', () => {
    console.log('Connected to server');
});

ws.on('message', (data) => {
    console.log('Received message:', data.toString());
});

ws.on('ping', () => {
    console.log('Received ping from server. Simulating inactivity: NOT responding to ping');
});

// To truly disable auto-pong in 'ws' client, we can override the pong method
ws.pong = () => {
    console.log('Auto-pong suppressed');
};

ws.on('close', (code, reason) => {
    console.log(`Connection closed: ${code} ${reason}`);
    process.exit(0);
});

ws.on('error', (err) => {
    console.error('WebSocket error:', err);
});

// Monkey patch _receiver.onping if necessary, but actually 'ws' handles it in the receiver.
// A better way is to just use a raw socket or a client that doesn't auto-pong.
// Or we can just use the fact that we are logging.
