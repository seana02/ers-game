import Deck from './server/Deck.js';
let socket = io('https://seana02-ers-game.herokuapp.com/');
//let socket = io('localhost:3000');

socket.emit('reconnect');

const body = document.querySelector('body');
const bottomMiddle = document.createElement('div');
bottomMiddle.id = 'bottom-middle';
const centerMiddle = document.createElement('div');
centerMiddle.id = 'center-middle';
const topLeft = document.createElement('div');
topLeft.id = 'top-left';
const topRight = document.createElement('div');
topRight.id = 'top-right';
const bottomRight = document.createElement('div');
bottomRight.id = 'bottom-right';
body.append(
    bottomMiddle,
    centerMiddle,
    topLeft,
    topRight,
    bottomRight
);

const formDiv = document.createElement('div');
formDiv.classList.add('form-div');
const loginForm = document.createElement('form');
loginForm.classList.add('login-form');
const nameInput = document.createElement('input');
nameInput.type = 'text';
nameInput.id = 'name-input';
nameInput.placeholder = 'Name';
nameInput.required = true;
const roomInput = document.createElement('input');
roomInput.type = 'number';
roomInput.min = 100000;
roomInput.max = 999999;
roomInput.id = 'room-input';
roomInput.placeholder = 'Room ID (6 Digits)';
roomInput.required = true;
loginForm.append(
    nameInput,
    roomInput
);
const warning = document.createElement('div');
const formSubmit = document.createElement('button');
formSubmit.textContent = 'Join Game';
formSubmit.addEventListener('click', () => {
    if (!nameInput.value || !roomInput.value || roomInput.value < 100000 || roomInput.value > 999999) {
        warning.textContent = 'Please enter a name and 6 digit room ID';
    } else {
        socket.emit('join-game', nameInput.value, `roomID:${roomInput.value}`);
    }
});

formDiv.append(
    loginForm,
    formSubmit,
    warning
);
centerMiddle.append(formDiv);

let roomID;

socket.on('join-fail', () => {
    warning.textContent = 'Game in progress. Please join a different room';
});
socket.on('join-success', (room) => {
    roomID = room;
    joinGame();
});
socket.on('reconnect', joinGame);

function joinGame() {
    //console.log(nameInput.value);
    centerMiddle.innerHTML = '';
    loadWaitingRoom();
}



function loadWaitingRoom() {
    const playerTable = document.createElement('table');
    playerTable.id = 'player-table';
    const tableHeader = document.createElement('tr');
    tableHeader.id = 'table-header';
    const nameHeader = document.createElement('td');
    nameHeader.textContent = 'Players';
    const cardHeader = document.createElement('td');
    cardHeader.textContent = 'Cards';
    tableHeader.append(
        nameHeader,
        cardHeader
    );
    playerTable.append(tableHeader);
    topLeft.append(playerTable);


    const startButton = document.createElement('button');
    startButton.id = 'start-button';
    startButton.textContent = 'Start Game';
    startButton.addEventListener('click', () => {
        socket.emit('game-start', roomID, {
            joker: document.querySelector('#joker').checked,
            double: document.querySelector('#double').checked,
            sandwich: document.querySelector('#sandwich').checked,
            topBottom: document.querySelector('#top-bottom').checked,
            marriage: document.querySelector('#marriage').checked,
            divorce: document.querySelector('#divorce').checked,
            run: document.querySelector('#run').checked,
            runCount: document.querySelector('#run-count-box').textContent,
            sumTen: document.querySelector('#sum-ten').checked,
            hoagie: document.querySelector('#hoagie').checked,
            flush: document.querySelector('#flush').checked,
        });
    });
    centerMiddle.append(startButton);


    const conditionChecklist = document.createElement('form');
    conditionChecklist.id = 'condition-checklist';

    const runCountBox = document.createElement('input');
    runCountBox.type = 'number';
    runCountBox.id = 'run-count-box';
    runCountBox.placeholder = 'Run Count (Default: 3)';

    conditionChecklist.append(
        generateConditionDiv('joker', 'Joker', 'Slap on any Joker'),
        generateConditionDiv('double', 'Double', 'Two identical values in a row'),
        generateConditionDiv('sandwich', 'Sandwich', 'Two identical values have any single card between them'),
        generateConditionDiv('top-bottom', 'Top Bottom', 'The top card\'s value matches the bottom card\'s value'),
        generateConditionDiv('marriage', 'Marriage', 'A Queen and King in a row, in either order'),
        generateConditionDiv('divorce', 'Divorce', 'A King and Queen with any single card between, in either order'),
        generateConditionDiv('run', 'Run', 'Consecutive increasing or decreasing numbers appear in a row. Number of cards specified below'),
        runCountBox,
        generateConditionDiv('sum-ten', 'Sum to Ten', 'Two cards in a row sum to 10, with Ace considered 1'),
        generateConditionDiv('hoagie', 'Hoagie', 'Two identical values have two cards of different values between them'),
        generateConditionDiv('flush', 'Flush', 'Three cards in a row have the same suit')
    );

    bottomRight.append(conditionChecklist);

    document.querySelector('#double').checked = true;
    document.querySelector('#sandwich').checked = true;
    document.querySelector('#top-bottom').checked = true;
    document.querySelector('#marriage').checked = true;
    document.querySelector('#divorce').checked = true;
}

function generateConditionDiv(boxID, label, tooltip) {
    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.id = boxID;
    checkBox.classList.add('condition-checkbox');
    const checkLabel = document.createElement('label');
    checkLabel.htmlFor = boxID;
    checkLabel.textContent = label;
    checkLabel.classList.add('condition-label');
    const checkHover = document.createElement('span');
    checkHover.classList.add('condition-tooltip');
    checkHover.textContent = tooltip;
    const conditionDiv = document.createElement('div');
    conditionDiv.classList.add('condition-div');
    conditionDiv.append(
        checkLabel,
        checkBox,
        checkHover
    );
    checkBox.addEventListener('click', () => {
        //console.log(`${boxID}-checkbox clicked`);
        socket.emit(`${boxID}-checkbox`, roomID, checkBox.checked);
    });
    return conditionDiv;
}

socket.on('joker-checkbox', (val) => { document.querySelector('#joker').checked = val; });
socket.on('double-checkbox', (val) => { document.querySelector('#double').checked = val; });
socket.on('sandwich-checkbox', (val) => { document.querySelector('#sandwich').checked = val; });
socket.on('top-bottom-checkbox', (val) => { document.querySelector('#top-bottom').checked = val; });
socket.on('marriage-checkbox', (val) => { document.querySelector('#marriage').checked = val; });
socket.on('divorce-checkbox', (val) => { document.querySelector('#divorce').checked = val; });
socket.on('run-checkbox', (val) => { document.querySelector('#run').checked = val; });
socket.on('sum-ten-checkbox', (val) => { document.querySelector('#sum-ten').checked = val; });
socket.on('hoagie-checkbox', (val) => { document.querySelector('#hoagie').checked = val; });
socket.on('flush-checkbox', (val) => { document.querySelector('#flush').checked = val; });

socket.on('disable-checkboxes', () => {
    for (let box of document.querySelectorAll('.condition-checkbox')) {
        box.disabled = true;
    }
});

function addPlayerToList(name) {
    const playerTable = document.querySelector('#player-table');
    const row = document.createElement('tr');
    row.id = name;
    const nameBox = document.createElement('td');
    nameBox.textContent = name;
    nameBox.classList.add('list-name');
    const cardCount = document.createElement('td');
    cardCount.textContent = '-';
    cardCount.classList.add('list-cards');
    row.append(
        nameBox,
        cardCount
    );
    playerTable.append(row);
}

socket.on('new-player', (name) => {
    addPlayerToList(name);
});

socket.on('remove-player', (name) => {
    const row = document.querySelector(`#${name}`);
    const table = document.querySelector('#player-table');
    table.removeChild(row);
});

let cardCount;

socket.on('game-start', (count, countList) => {
    cardCount = count;
    //console.log(cardCount);
    initializeGameBoard();
    updateList(countList);
});


function initializeGameBoard() {
    centerMiddle.innerHTML = '';
    const handContainer = document.createElement('div');
    const discardPile = document.createElement('div');
    const burnPile = document.createElement('div');
    handContainer.classList.add('card-container', 'card-background');
    discardPile.classList.add('card-container', 'discard-pile');
    burnPile.classList.add('card-container', 'burn-pile');
    bottomMiddle.append(handContainer);
    centerMiddle.append(discardPile);
    topRight.append(burnPile);

    handContainer.append(`${cardCount}`);

    handContainer.addEventListener('click', () => {
        socket.emit('play-hand', roomID);
    });
    discardPile.addEventListener('click', () => {
        socket.emit('slap', roomID);
    });
}

socket.on('card-played-successfully', () => {
    cardCount--;
    document.querySelector('.card-background').innerHTML = cardCount;
});

socket.on('next-card', (card, countList) => {
    updateList(countList);
    let discardPile = document.querySelector('.discard-pile');
    discardPile.innerHTML = '';
    //console.log(card);
    discardPile.appendChild(getFrontHTML(card));
});

socket.on('slap-count', (total) => {
    cardCount += total;
    document.querySelector('.card-background').innerHTML = cardCount;
});

socket.on('slap-successful', (name, type, countList) => {
    updateList(countList);
    document.querySelector('.discard-pile').innerHTML = '';
    document.querySelector('.burn-pile').innerHTML = '';
    console.log(`${name} slapped a ${type}!`);
    document.querySelector('.card-background').innerHTML = cardCount;
});

socket.on('bad-slap', (card, name, countList) => {
    updateList(countList);
    let burnPile = document.querySelector('.burn-pile');
    burnPile.innerHTML = '';
    burnPile.appendChild(getFrontHTML(card));
    console.log(`Bad slap by ${name} and discarded a ${getCardString(card)}`);
});

function updateList(countList) {
    let tableElems = document.querySelectorAll('.list-cards');
    for (let i = 0; i < countList.length; i++) {
        tableElems[i].textContent = countList[i];
    }
}

function getFrontHTML(cardObject) {
    const img = new Image();
    img.draggable = false;
    if (cardObject.val === 0) {
        img.src = `./server/assets/Cards/JOKER-${cardObject.color.toUpperCase()}.svg`;
        return img;
    }
    let suitValue;
    switch (cardObject.suit) {
        case '♠':
        case 'S':
        case 'SPADE':
            suitValue = 'SPADE';
            break;
        case '♣':
        case 'C':
        case 'CLUB':
            suitValue = 'CLUB';
            break;
        case '♥':
        case 'H':
        case 'HEART':
            suitValue = 'HEART';
            break;
        case '♦':
        case 'D':
        case 'DIAMOND':
            suitValue = 'DIAMOND';
            break;
    }
    img.src = `./server/assets/Cards/${suitValue}-${cardObject.val}.svg`;
    return img;
}

function getCardString(cardObject) {
    let num;
    switch (cardObject.val) {
        case 1:
            num = 'A';
            break;
        case 11:
            num = 'J';
            break;
        case 12:
            num = 'Q';
            break;
        case 13:
            num = 'K';
            break;
        default:
            num = `${cardObject.val}`;
    }
    return `${num}${cardObject.suit} `;
}










function deckload() {
    let deck = new Deck();
    deck.shuffle();
    console.log(deck);
    //bottomMiddle.appendChild(deck.getBackCardContainer());
    //centerMiddle.appendChild(deck.getDiscard());

    const handContainer = document.createElement('div');
    const discardContainer = document.createElement('div');
    bottomMiddle.appendChild(handContainer);
    centerMiddle.appendChild(discardContainer);
    const discardDeck = new Deck([]);

    handContainer.appendChild(deck.peek().getBackHTML());
    handContainer.addEventListener('click', () => {
        const next = deck.draw();
        discardContainer.innerHTML = '';
        discardContainer.appendChild(next.getFrontHTML());
        discardDeck.replaceTop(next);
        //console.log(discardDeck);
        handContainer.innerHTML = '';
        handContainer.appendChild(deck.peek().getBackHTML());
    });

    discardContainer.addEventListener('click', () => {
        // console.log(`Top card: ${discardDeck.peek()}`);
        // console.log(`2nd card: ${discardDeck.peek(2)}`);
        // console.log(`3rd card: ${discardDeck.peek(3)}`);
        // console.log(`Bottom card: ${discardDeck.peekBottom()}`);

        let result = checkSlap(discardDeck);
        if (result) {
            console.log('Successful slap: ', result);
        } else {
            console.log('Bad slap!');
        }
    });

}
