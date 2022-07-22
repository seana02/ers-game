import Deck, { generateDeck } from './Deck.js';
import checkSlap from './Conditions.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

io.on('connect', (socket) => {
    console.log('connected');

});

httpServer.listen(3000, () => {
    console.log('listening on port 3000');
});

