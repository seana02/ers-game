
let joker = true;
let double = true;
let sandwich = true;
let topBottom = true;
let marriage = true;
let divorce = true;

let run = false;
let runCount = 3;
let sumTen = false;
let hoagie = false;
let flush = false;

export default function checkSlap(deck) {
    return (joker && checkJoker(deck) && 'Joker')
        || (double && checkDouble(deck) && 'Double')
        || (sandwich && checkSandwich(deck) && 'Sandwich')
        || (topBottom && checkTopBottom(deck) && 'Top Bottom')
        || (marriage && checkMarriage(deck) && 'Marriage')
        || (divorce && checkDivorce(deck) && 'Divorce')
        || (run && checkRun(deck, runCount) && `Run of ${runCount}`)
        || (sumTen && checkSumTen(deck) && 'Sum to Ten')
        || (hoagie && checkHoagie(deck) && 'Hoagie')
        || (flush && checkFlush(deck) && 'Flush');
}

// true if top card is joker
function checkJoker(deck) {
    return (deck.size() >= 1)
        && (deck.peek().getVal() === 0);
}

// true if top value equals the next card's value
function checkDouble(deck) {
    return (deck.size() >= 2)
        && (deck.peek(1).getVal() === deck.peek(2).getVal());
}

// true if the top value equals the third card's value
function checkSandwich(deck) {
    return (deck.size() >= 3)
        && (deck.peek(1).getVal() === deck.peek(3).getVal());
}

// true if the top value equals the bottom value
function checkTopBottom(deck) {
    return (deck.size() >= 2)
        && (deck.peek().getVal() === deck.peekBottom().getVal());
}

// true if the top value and the next card's value are a Queen and King; order does not matter
function checkMarriage(deck) {
    return (deck.size() >= 2)
        && (deck.peek(1).getVal() === 12 || deck.peek(1).getVal() === 13)
        && (deck.peek(2).getVal() === 12 || deck.peek(2).getVal() === 13);
}

// true if the top value and the third card's value are a Queen and a King; order does not matter
function checkDivorce(deck) {
    return (deck.size() >= 3)
        && (deck.peek(1).getVal() === 12 || deck.peek(1).getVal() === 13)
        && (deck.peek(3).getVal() === 12 || deck.peek(3).getVal() === 13);
}

// true if *count* cards from the top are all ascending by 1 or descending by 1
function checkRun(deck, count) {
    if (count <= 1) return false;
    if (deck.size() >= count) {
        return checkAscending() || checkDescending();

        function checkAscending() {
            for (let i = 1; i < count; i++) {
                if (deck.peek(i + 1).getVal() - deck.peek(i).getVal() !== 1) {
                    return false;
                }
            }
            return true;
        }

        function checkDescending() {
            for (let i = 1; i < count; i++) {
                if (deck.peek(i).getVal() - deck.peek(i + 1).getVal() !== 1) {
                    return false;
                }
            }
            return true;
        }
    }
}

// true if the top value and the next card's value sum to 10
function checkSumTen() {
    return deck.peek(1).getVal() + deck.peek(2).getVal() === 10;
}

// true if the top value and the fourth card's value are equal, as long as the cards in between are not equal
function checkHoagie() {
    return (deck.peek(1).getVal() === deck.peek(4).getVal())
        && (deck.peek(2).getVal() !== deck.peek(3).getVal());
}

// true if the top card, next card, and the third card all have the same suit
function checkFlush() {
    return (deck.peek(1).getSuit() === deck.peek(2).getSuit())
        && (deck.peek(2).getSuit() === deck.peek(3).getSuit());
}
