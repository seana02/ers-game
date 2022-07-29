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
let cardsToPlay;
let slappable = false;
let challengeStart = false;
let challengeSuccess = false;

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
            cardsToPlay = 1;
            slappable = true;
        }
    });

    socket.on('play-hand', () => {
        if (cardsToPlay > 0 && socket.id === playerList[currentPlayer]) {
            slappable = true;
            let nextCard = decks[currentPlayer].draw();
            socket.emit('card-played-successfully');
            io.emit('next-card', nextCard, decks.map(deck => deck.size()));
            center.replaceTop(nextCard);
            cardsToPlay--;
            if (nextCard.val === 11 || nextCard.val === 12 || nextCard.val === 13) {
                challengeStart = true;
                console.log(`Value: ${nextCard.val}, played by player ${currentPlayer}`);
                nextPlayer();
                console.log(`Next player: ${currentPlayer}`);
                cardsToPlay = nextCard.val - 10;
            } else if (nextCard.val === 1) {
                challengeStart = true;
                nextPlayer();
                cardsToPlay = 4;
            } else if (cardsToPlay == 0) {
                if (challengeStart) {
                    challengeSuccess = true;
                    currentPlayer--;
                    if (currentPlayer < 0) {
                        currentPlayer += playerList.length;
                    }
                    cardsToPlay = -1;
                } else {
                    nextPlayer();
                    cardsToPlay = 1;
                }
            } else if (decks[currentPlayer].size() === 0) {
                nextPlayer();
            }
        }
        console.log(currentPlayer);
    });

    socket.on('slap', () => {
        console.log(`slapper: ${playerList.indexOf(socket.id)}, currentPlayer: ${currentPlayer}, challengeSuccess: `)
        if (socket.id == playerList[currentPlayer] && challengeSuccess) {
            socket.emit('slap-count', center.size() + burn.size());
            collectCards(socket.id);
            io.emit('slap-successful', players[socket.id], 'Challenge', decks.map(deck => deck.size()));
            cardsToPlay = 1;
        } else if (slappable) {
            let slap = checkSlap(center);
            if (slap) {
                slappable = false;
                socket.emit('slap-count', center.size() + burn.size());
                collectCards(socket.id);
                io.emit('slap-successful', players[socket.id], slap, decks.map(deck => deck.size()));
                currentPlayer = playerList.indexOf(socket.id);
                cardsToPlay = 1;
            } else {
                let nextBurn = decks[playerList.indexOf(socket.id)].draw();
                burn.replaceTop(nextBurn);
                socket.emit('bad-slap', nextBurn, players[socket.id], decks.map(deck => deck.size()));
            }
        }
    });

});

function nextPlayer() {
    currentPlayer = (currentPlayer + 1) % playerList.length;
    if (decks[currentPlayer].size() === 0) {
        nextPlayer();
    }
}

function collectCards(id) {
    decks[playerList.indexOf(id)].replaceBottom(center.reverse());
    decks[playerList.indexOf(id)].replaceBottom(burn.reverse());
    center = new Deck([]);
    burn = new Deck([]);
    challengeStart = false;
}




httpServer.listen(3000, () => {
    console.log('listening on port 3000');
});

