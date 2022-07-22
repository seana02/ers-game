import Deck, { generateDeck } from './server/Deck.js';
import checkSlap from './server/Conditions.js';

let socket = io('http://localhost:3000');

const body = document.querySelector('body');
const bottomMiddle = document.createElement('div');
bottomMiddle.classList.add('bottom-middle');
body.appendChild(bottomMiddle);
const centerMiddle = document.createElement('div');
centerMiddle.classList.add('center-middle');
body.appendChild(centerMiddle);


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