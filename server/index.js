import Deck, { generateDeck } from './Deck.js';
import checkSlap from './Conditions.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { SocketAddress } from 'net';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

let players = {};
let playerList = [];

let inGame = false;
let currentPlayer;
let slappable = false;

let decks;
let center = new Deck([]);
let burn = new Deck([]);

io.on('connect', (socket) => {
    console.log('connected');

    socket.on('join-game', (name) => {
        for (let registeredPlayer in players) {
            socket.emit('new-player', players[registeredPlayer]);
        }
        players[socket.id] = name;
        playerList.push(socket.id);
        io.emit('new-player', name);
        //console.log(`${name} ${socket.id}`);
        //console.log(JSON.stringify(players));
    });

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`)
        for (let player in players) {
            if (!inGame && player === socket.id) {
                delete players[player];
                io.emit('remove-player', player);
                playerList.splice(playerList.indexOf(socket.id), 1);
                break;
            }
        }
    });

    socket.on('reconnect', () => {
        if (playerList.indexOf(socket.id) !== -1) {
            socket.emit('reconnect');
        }
    });

    socket.on('game-start', () => {
        if (!inGame) {
            inGame = true;

            decks = new Deck().shuffle().split(playerList.length);

            for (let i = 0; i < playerList.length; i++) {
                io.to(playerList[i]).emit('game-start', decks[i].size(), decks.map(deck => deck.size()));
            }

            currentPlayer = 0;
            slappable = true;
        }
    });

    socket.on('play-hand', () => {
        if (socket.id === playerList[currentPlayer]) {
            slappable = true;
            let nextCard = decks[currentPlayer].draw();
            socket.emit('card-played-successfully');
            io.emit('next-card', nextCard, decks.map(deck => deck.size()));
            center.replaceTop(nextCard);
            currentPlayer = (currentPlayer + 1) % playerList.length;
        }
    });

    socket.on('slap', () => {
        if (slappable) {
            let slap = checkSlap(center);
            if (slap) {
                slappable = false;
                socket.emit('slap-count', center.size() + burn.size());
                decks[playerList.indexOf(socket.id)].replaceBottom(center.reverse());
                decks[playerList.indexOf(socket.id)].replaceBottom(burn.reverse());
                center = new Deck([]);
                io.emit('slap-successful', players[socket.id], slap, decks.map(deck => deck.size()));
                currentPlayer = playerList.indexOf(socket.id);
            } else {
                let nextBurn = decks[playerList.indexOf(socket.id)].draw();
                burn.replaceTop(nextBurn);
                io.emit('bad-slap', nextBurn, players[socket.id], decks.map(deck => deck.size()));
            }
        }
    });

});




httpServer.listen(3000, () => {
    console.log('listening on port 3000');
});

