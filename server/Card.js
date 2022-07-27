//import cardBack from './assets/Cards/CARD-BACK.svg';
const blackSymbols = ['♠', '♣', 'S', 'C'];
const redSymbols = ['♥', '♦', 'D', 'H'];

export default class Card {
    constructor(val, suit) {
        this.suit = suit;
        this.val = val;
        if (redSymbols.includes(suit)) {
            this.color = 'red';
        } else {
            this.color = 'black';
        }
    }

    getVal() { return this.val; }

    getSuit() { return this.suit; }
    toString() {
        let num;
        switch (this.val) {
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
                num = `${this.val}`;
        }
        return `${num}${this.suit} `;
    }
    getFrontHTML() {
        //const component = document.createElement('div');
        //component.classList.add('card');
        //component.classList.add(this.color);
        //component.innerText = this;
        //component.dataset.value = this.toString();
        //return component;

        const img = new Image();
        img.draggable = false;
        if (this.val === 0) {
            img.src = `./server/assets/Cards/JOKER-${this.color.toUpperCase()}.svg`;
            return img;
        }
        let suitValue;
        switch (this.suit) {
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
        img.src = `./server/assets/Cards/${suitValue}-${this.val}.svg`;
        return img;
    }
    getBackHTML() {
        const img = new Image();
        img.draggable = false;
        img.src = './server/assets/Cards/CARD-BACK.svg';
        return img;
    }

    isCard() { return true; }
}

function addSampleCard() {
    aceofspades = new Card(1, '♠');
    document.querySelector('body').appendChild(aceofspades.getComponent());
}
