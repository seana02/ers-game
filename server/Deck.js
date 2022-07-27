import Card from './Card.js';

export default class Deck {

    // Implemented like a Stack, index 0 is bottom of stack

    constructor(cards = generateDeck(1)) {
        this.cards = cards;
    }

    size() { return this.cards.length; }
    peek(n = 1) { return this.cards[this.size() - n]; }
    peekBottom() { return this.cards[0]; };
    draw() { return this.cards.pop(); }
    drawBottom() { return this.cards.shift(); }
    replaceTop(pile) {
        if (pile.cards) {
            this.cards = [...this.cards, ...pile.cards];
        } else if (pile instanceof Array) {
            this.cards = [...this.cards, ...pile];
        } else if (pile.isCard()) {
            this.cards = [...this.cards, pile];
        }
        return this;
    }
    replaceBottom(pile) {
        if (pile.cards) {
            this.cards = [...pile.cards, ...this.cards];
        } else if (pile instanceof Array) {
            this.cards = [...pile, ...this.cards];
        } else if (pile.isCard()) {
            this.cards = [pile, ...this.cards];
        }
        return this;
    }
    reverse() {
        this.cards = this.cards.reverse();
        return this;
    }
    shuffle() {
        for (let i = this.size() - 1; i > 0; i--) {
            let rand = random(i);
            if (rand == 1) continue;

            let temp = this.cards[i];
            this.cards[i] = this.cards[rand];
            this.cards[rand] = temp;
        }
        return this;
    }

    split(n) {
        let piles = [];
        for (let i = 0; i < n; i++) {
            piles.push([]);
        }
        let i = 0;
        while (this.peek()) {
            piles[i].push(this.draw());
            i = ++i % n;
        }
        return piles.map(pile => new Deck(pile));
    }

    getFrontCardContainer() {
        let cc = document.createElement('div');
        cc.classList.add('card-container');
        cc.appendChild(this.draw().getFrontHTML());

        cc.addEventListener('click', () => {
            cc.innerHTML = '';
            cc.appendChild(this.draw().getFrontHTML());
        });
        return cc;
    }

    getBackCardContainer() {
        let cc = document.createElement('div');
        cc.classList.add('card-container');
        cc.appendChild(this.draw().getBackHTML());

        cc.addEventListener('click', () => {
            cc.innerHTML = '';
            cc.appendChild(this.draw().getBackHTML());
        });
        return cc;
    }



}

export function generateDeck(n = 1) {
    if (n < 1) { n = 1; }
    let suits = ['♠', '♣', '♥', '♦'];
    let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    let cards = [];
    for (let i = 0; i < n; i++) {
        cards.push(new Card(0, '♠')); // JOKER 1
        cards.push(new Card(0, '♥')); // JOKER 2
        cards.push(suits.flatMap(suit => values.flatMap(value => new Card(value, suit))));
    }

    return cards.flatMap(card => card);
}


function random(max) {
    return Math.floor(Math.random() * (max + 1));
}