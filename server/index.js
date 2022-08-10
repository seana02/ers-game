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

let games = {};

// let gameInfo = getNewGame();
// let inGame = false;
// let currentPlayerIndex;
// let numCardsToPlay;
// let slappable = false;
// let challengeStart = false;
// let challengeSuccess = false;
// let decks;
// let center = new Deck([]);
//let burn = new Deck([]);

function resetGame(room) {
    delete games[room];
}

function getNewGame() {
    return {
        playersIdToName: {},
        playerIdList: [],
        inGame: false,
        currentPlayerIndex: 0,
        numCardsToPlay: 0,
        slappable: false,
        challengeStart: false,
        challengeSuccess: false,
        decks: [],
        center: new Deck([]),
        burn: new Deck([])
    };
}

io.on('connect', (socket) => {
    console.log('connected');

    socket.on('join-game', (name, room) => {
        if (!games[room] || !games[room].inGame) {
            if (!games[room]) { games[room] = getNewGame(); }
            socket.emit('join-success', room);
            socket.join(room);
            for (let registeredPlayer in games[room].playersIdToName) {
                socket.emit('new-player', games[room].playersIdToName[registeredPlayer]);
            }
            games[room].playersIdToName[socket.id] = name;
            games[room].playerIdList.push(socket.id);
            io.to(room).emit('new-player', name);
            //console.log(`${name} ${socket.id}`);
            //console.log(JSON.stringify(players));
        } else {
            socket.emit('join-fail');
        }
    });

    socket.on('disconnecting', () => {
        console.log(`${socket.id} disconnected`);
        let room = findRoom(socket);
        if (room) {
            for (let player in games[room].playersIdToName) {
                if (player === socket.id) {
                    if (games[room].inGame) {
                        let nextBurn;
                        while (games[room].decks[games[room].playerIdList.indexOf(socket.id)].size > 0) {
                            nextBurn = games[room].decks[games[room].playerIdList.indexOf(socket.id)].draw();
                            games[room].burn.replaceTop(nextBurn);
                        }
                        socket.emit('bad-slap', nextBurn, games[room].playersIdToName[socket.id], games[room].decks.map(deck => deck.size()));
                    }
                    io.to(room).emit('remove-player', games[room].playersIdToName[player]);
                    delete games[room].playersIdToName[player];
                    games[room].playerIdList.splice(games[room].playerIdList.indexOf(socket.id), 1);
                    if (games[room].playerIdList.length === 0) {
                        resetGame(room);
                    }
                    break;
                }
            }
        }
    });

    socket.on('reconnect', () => {
        let room = findRoom(socket);
        if (room && games[room] && games[room].playerIdList.indexOf(socket.id) !== -1) {
            socket.emit('reconnect');
        }
        //console.log(games);
    });

    socket.on('game-start', (room) => {
        if (!games[room].inGame) {
            games[room].inGame = true;

            games[room].decks = new Deck().shuffle().split(games[room].playerIdList.length);

            for (let i = 0; i < games[room].playerIdList.length; i++) {
                io.to(games[room].playerIdList[i]).emit('game-start', games[room].decks[i].size(), games[room].decks.map(deck => deck.size()));
            }

            games[room].currentPlayerIndex = 0;
            games[room].numCardsToPlay = 1;
            games[room].slappable = true;
        }
    });

    socket.on('play-hand', (room) => {
        if (games[room].numCardsToPlay > 0 && socket.id === games[room].playerIdList[games[room].currentPlayerIndex]) {
            games[room].slappable = true;
            let nextCard = games[room].decks[games[room].currentPlayerIndex].draw();
            socket.emit('card-played-successfully');
            io.to(room).emit('next-card', nextCard, games[room].decks.map(deck => deck.size()));
            games[room].center.replaceTop(nextCard);
            games[room].numCardsToPlay--;
            if (nextCard.val === 11 || nextCard.val === 12 || nextCard.val === 13) {
                games[room].challengeStart = true;
                //console.log(`Value: ${nextCard.val}, played by player ${games[room].currentPlayerIndex}`);
                nextPlayer(room);
                //console.log(`Next player: ${games[room].currentPlayerIndex}`);
                games[room].numCardsToPlay = nextCard.val - 10;
            } else if (nextCard.val === 1) {
                games[room].challengeStart = true;
                nextPlayer(room);
                games[room].numCardsToPlay = 4;
            } else if (games[room].numCardsToPlay == 0) {
                if (games[room].challengeStart) {
                    games[room].challengeSuccess = true;
                    games[room].currentPlayerIndex--;
                    if (games[room].currentPlayerIndex < 0) {
                        games[room].currentPlayerIndex += games[room].playerIdList.length;
                    }
                    games[room].numCardsToPlay = -1;
                } else {
                    nextPlayer(room);
                    games[room].numCardsToPlay = 1;
                }
            } else if (games[room].decks[games[room].currentPlayerIndex].size() === 0) {
                nextPlayer(room);
            }
        }
        console.log(games[room].currentPlayerIndex);
    });

    socket.on('slap', (room) => {
        // console.log(`slapper: ${playerIdList.indexOf(socket.id)}, currentPlayer: ${gameInfo.currentPlayerIndex}, challengeSuccess: `)
        if (socket.id == games[room].playerIdList[games[room].currentPlayerIndex] && games[room].challengeSuccess) {
            socket.emit('slap-count', games[room].center.size() + games[room].burn.size());
            collectCards(room, socket.id);
            io.to(room).emit('slap-successful', games[room].playersIdToName[socket.id], 'Challenge', games[room].decks.map(deck => deck.size()));
            games[room].numCardsToPlay = 1;
        } else if (games[room].slappable) {
            let slap = checkSlap(games[room].center);
            if (slap) {
                games[room].slappable = false;
                socket.emit('slap-count', games[room].center.size() + games[room].burn.size());
                collectCards(room, socket.id);
                io.to(room).emit('slap-successful', games[room].playersIdToName[socket.id], slap, games[room].decks.map(deck => deck.size()));
                games[room].currentPlayerIndex = games[room].playerIdList.indexOf(socket.id);
                games[room].numCardsToPlay = 1;
            } else {
                let nextBurn = games[room].decks[games[room].playerIdList.indexOf(socket.id)].draw();
                games[room].burn.replaceTop(nextBurn);
                socket.emit('slap-count', -1);
                io.to(room).emit('bad-slap', nextBurn, games[room].playersIdToName[socket.id], games[room].decks.map(deck => deck.size()));
            }
        }
    });

});

function findRoom(socket) {
    let out;
    socket.rooms.forEach(r => {
        if (r.startsWith('roomID:')) {
            out = r;
        }
    });
    return out;
}

function nextPlayer(room) {
    games[room].currentPlayerIndex = (games[room].currentPlayerIndex + 1) % games[room].playerIdList.length;
    if (games[room].decks[games[room].currentPlayerIndex].size() === 0) {
        nextPlayer(room);
    }
}

function collectCards(room, id) {
    games[room].decks[games[room].playerIdList.indexOf(id)].replaceBottom(games[room].center.reverse());
    games[room].decks[games[room].playerIdList.indexOf(id)].replaceBottom(games[room].burn.reverse());
    games[room].center = new Deck([]);
    games[room].burn = new Deck([]);
    games[room].challengeStart = false;
}




httpServer.listen(3000, () => {
    console.log('listening on port 3000');
});

