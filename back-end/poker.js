
const valeur = {
    flush: 8,
    carre: 7,
    full: 6,
    couleur: 5,
    suite: 4,
    brelan: 3,
    double_paire: 2,
    paire: 1,
};

const colors = ['C','D','H','S'];
const face = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];


const createDeck = () => {
    const deck = [];
    colors.map((s) => face.map((f) => deck.push({suit: s, face: f})));
    return deck;
};

const dealCard = (deck) => {
    const numRandom = Math.floor(Math.random() * deck.length);
    const choiceCard = deck[numRandom];
    deck.splice(numRandom, 1);
    return choiceCard;
};

const deck = (deckArray, tableName) => deckArray.filter(elt => elt.tableName === tableName)[0].deck;
const dealerHand = (deckArray, tableName) => deckArray.filter(elt => elt.tableName === tableName)[0].dealerHand;
const dealerHandFlop = (deckArray, tableName) => deckArray.filter(elt => elt.tableName === tableName)[0].dealerHand[0];
const dealerHandTurn = (deckArray, tableName) => deckArray.filter(elt => elt.tableName === tableName)[0].dealerHand[1];
const dealerHandRiver = (deckArray, tableName) => deckArray.filter(elt => elt.tableName === tableName)[0].dealerHand[2];
const playersHand = (deckArray, tableName) => deckArray.filter(elt => elt.tableName === tableName)[0].playersHand;
const getPlayerHand = (playersHand, id) => playersHand.filter(hand => hand.id === id)[0];
const playerOrder = (deckArray, tableName) => deckArray.filter(elt => elt.tableName === tableName)[0].turnOrder;
const initBlackJack = (deckArray, tableName) => deckArray.filter(elt => elt.tableName === tableName)[0].init;

const createGame = (playerNumber) => {
    const deck = createDeck();
    const hands = Array(playerNumber).fill(undefined).map(() => [dealCard(deck), dealCard(deck)]);
    const flop = Array(3).fill(undefined).map(() => dealCard(deck));
    const gameCards = [flop, dealCard(deck), dealCard(deck)];
    return {hands, gameCards};
};

function cardValue (face) {
    switch(face) {
        case 'A': return 11;
        case 'K':
        case 'Q':
        case 'J':
        case 'T': return 10;
        default: return Number(face);
    }
}

const cardTransformValue = (face) => {
    switch (face){
        case 'A': return 14;
        case 'K' : return 13;
        case 'Q' : return 12;
        case 'J' : return 11;
        case 'T' : return 10;
        default : return Number(face);
    }
};

const sumValueCards = (cards) => cards.map(card => cardValue(card.face)).reduce((total,faceValue) => total + faceValue);

const dealTableCards = (deck) => {
    const flop = Array(3).fill(undefined).map(() => dealCard(deck));
    return [flop, dealCard(deck), dealCard(deck)];
};

const getNextCardBoard =(statePoker, deckArray, tableName) => statePoker === "PreFlop"
    ? dealerHandFlop(deckArray, tableName)
    : statePoker === "Flop"
        ? dealerHandTurn(deckArray, tableName)
        : dealerHandRiver(deckArray, tableName);

const cardFaceCompare = (card1, card2) => card1.face === card2.face;
const cardSuitCompare = (card1, card2) => card1.suit === card2.suit;
const fixedCompare = (f,[h1, ...r], a) => [f(a,h1),...(r.length >= 1 ? fixedCompare(f,r,a) : [])];
const dynamicCompare = (f,[h1,h2, ...r]) => [f(h1,h2),...(r.length >= 2 ? dynamicCompare(f,r) : [])];
const add2termes = ([h1,h2,...r]) => [h1 + h2, ...((r.length >= 2) ? add2termes(r) : [])];
const colorCount = (color,data) => data.filter(elt => elt.suit === color).length;
const faceCount = (face, data) => data.filter(elt => elt.face === face).length;

const recupColor = (arrayRes) => arrayRes.filter(elt =>
    elt.suit === colors[colors.map(color => colorCount(color,arrayRes)).indexOf(5)]);

const sameValue = (arrayRes) => Math.max(...arrayRes.map( elt =>
    fixedCompare(cardFaceCompare,arrayRes, elt).filter(data => data === true).length - 1));

const flush = (arrayRes) => (colors.map(color => colorCount(color,arrayRes)).filter(elt => elt === 5).length > 0)
    ? suitCheck(recupColor(arrayRes))
    : false;

const couleur = (arrayRes) => colors.map(color => colorCount(color,arrayRes)).filter(elt => elt === 5).length > 0;

const doublePaireCheck = (arrayRes) => face.map(face => faceCount(face,arrayRes)).filter(elt => elt === 2).length === 2;

const indexArray = (valueArray,number) => {
    const indices = [];
    let idx = valueArray.indexOf(number);
    while (idx !== -1) {
        indices.push(idx);
        idx = valueArray.indexOf(number, idx + 1);
    }
    return indices;
}

const range = (start, end) => (new Array(end - start + 1)).fill(undefined).map((_, i) =>
    i + start);

const isEqual = (tableau1, tableau2) => (tableau1.length !== tableau2.length)
    ? false
    : tableau1.every((value, index) => value === tableau2[index]);



const removeCard = (value, valueArray, number) => {
    const indexTab = indexArray(valueArray,number);
    const valueRemove = indexTab.map(index => Number(face[index]));
    [...Array(valueRemove.length).keys()].map(i => value.splice(value.indexOf(valueRemove[i]), number - 1));
    return value;

};
const removeSameCard = (value, valueArray, number) => (valueArray.filter(elt => elt === number).length !== 0)
    ? removeCard(value, valueArray, number)
    : value;

const cardArrayUnique = (data) => {
    let value = data.map(elt => cardTransformValue(elt.face)).sort((a,b) => a - b);
    const valueNb = face.map(face => faceCount(face,data));
    value = removeSameCard(value, valueNb, 2);
    value = removeSameCard(value, valueNb, 3);
    value = removeSameCard(value, valueNb, 4);
    return value;
}

const findSuit = (data) => {
    const value = cardArrayUnique(data);
    let idx = 0;
    let res = [];
    while(idx + 5 <= value.length){
        res.push(isEqual(value.slice(idx, idx + 5), range(value[idx], value[idx] + 4)));
        idx++;
    }
    return res;
}

const suitCheck = (data) => findSuit(data).filter(elt => elt === true).length > 0;

const fullCheck = (arrayRes) => {
    const valueNb = face.map(face =>
        faceCount(face,arrayRes));
    return (valueNb.filter(elt => elt === 3).length > 0 && valueNb.filter(elt => elt === 2).length > 0);
};

const checkValeur = (dealerHand, player) => {
    const arrayRes = [...dealerHand].concat(player.hand);

    const res = {
        player : player,
        score: 0,
    };

    if(flush(arrayRes)){
        res.score = valeur.flush;
    } else if (sameValue(arrayRes) === 3) {
        res.score = valeur.carre;
    }else if (fullCheck(arrayRes)){
        res.score = valeur.full;
    } else if (couleur(arrayRes)){
        res.score = valeur.couleur;
    } else if (suitCheck(arrayRes)){
        res.score = valeur.suite;
    } else if (sameValue(arrayRes) === 2) {
        res.score = valeur.brelan;
    } else if (doublePaireCheck(arrayRes)){
        res.score = valeur.double_paire;
    } else if (sameValue(arrayRes) === 1){
        res.score = valeur.paire;
    } else {
        res.score = 0;
    }
    return res;
};

const facePlayer = (players) => players.map(player => face.map(face => faceCount(face, player.hand)));
const valueCard = (players, cardNumber) => [...Array(players.length).keys()].map(i =>
    face[facePlayer(players).map(player => player.indexOf(cardNumber))[i]]).map(card => cardTransformValue(card));
const recupMaxCard = (players, cardNumber) => valueCard(players, cardNumber).filter(value =>
    value === Math.max(...valueCard(players, cardNumber)));

const paireCompare = (winPlayers) => winPlayers[
    valueCard(winPlayers,2).indexOf(...recupMaxCard(winPlayers, 2))];
const carreCompare = (winPlayers) => winPlayers[
    valueCard(winPlayers,4).indexOf(...recupMaxCard(winPlayers, 4))];
const brelanCompare = (winPlayers) => winPlayers[
    valueCard(winPlayers,3).indexOf(...recupMaxCard(winPlayers, 3))];

const suitCompareWinner = (winPlayers) => {
     const playerMaxSuits = winPlayers.map(player => findSuit(player.hand).lastIndexOf(true));
     const playerSuits = winPlayers.map(player =>
         cardArrayUnique(player.hand).slice(playerMaxSuits[winPlayers.indexOf(player)],
             playerMaxSuits[winPlayers.indexOf(player)] + 5));
     const maxCardSuit = playerSuits.map(cards => Math.max(...cards));
     return winPlayers[maxCardSuit.indexOf(Math.max(...maxCardSuit))];
};

const fullCompare = (winPlayers) => {
    const res = recupMaxCard(winPlayers, 3);
    if(res.length > 1){
       return winPlayers[valueCard(winPlayers,2).indexOf(...recupMaxCard(res,2))] ;
    }
    return winPlayers[valueCard(winPlayers,3).indexOf(...res)];
};

const doubleCompare = (winPlayers) => {
    const res = winPlayers.map(player => face.map(face => faceCount(face, player.hand))).map(elt =>
        indexArray(elt, 2)).map(elt => elt.map(index =>
        cardTransformValue(face[index]))).map(elt => add2termes(elt)[0]);
    return winPlayers[res.indexOf(Math.max(...res))];
};

const couleurCompare = (winPlayers) => {
    const colorPlayer = winPlayers.map(player =>
        Math.max(...recupColor(player.hand).map(card => cardTransformValue(card.face)).sort((a,b) => a - b)));
    return winPlayers[colorPlayer.indexOf(Math.max(...colorPlayer))];
};

const cardCompare = (winPlayers) => winPlayers[
    valueCard(winPlayers,1).indexOf(...recupMaxCard(winPlayers,1))];

const findWinner = (winPlayers) => {
    switch(winPlayers[0].score){
        case valeur.carre:
            return carreCompare(winPlayers.map(elt => elt.player)).id;
        case valeur.brelan:
            return brelanCompare(winPlayers.map(elt => elt.player)).id;
        case valeur.paire:
            return paireCompare(winPlayers.map(elt => elt.player)).id;
        case valeur.suite:
        case valeur.flush:
            return suitCompareWinner(winPlayers.map(elt => elt.player)).id;
        case valeur.couleur:
            return couleurCompare(winPlayers.map(elt => elt.player)).id;
        case valeur.full:
            return fullCompare(winPlayers.map(elt => elt.player)).id
        case valeur.double_paire:
            return doubleCompare(winPlayers.map(elt => elt.player)).id;
        case 0:
            return cardCompare(winPlayers.map(elt => elt.player)).id;
    }
};

const endPoker = (dealerHand, playersHand) => {
    dealerHand = [...dealerHand[0]].concat(dealerHand[1]);
    const scoreArray = playersHand.map(player => checkValeur(dealerHand, player));
    console.log(scoreArray);
    const maxScore = Math.max(...scoreArray.map(res => res.score));
    const winPlayers = scoreArray.filter(elt => elt.score === maxScore);
     winPlayers.forEach(elt => elt.player.hand = elt.player.hand.concat(dealerHand));
    return (winPlayers.length > 1) ? findWinner(winPlayers) : winPlayers[0].player.id;
};

module.exports = {createGame, createDeck, dealCard, deck, dealerHand, sumValueCards, dealTableCards, playersHand,
  getPlayerHand, playerOrder, dealerHandTurn, dealerHandFlop, dealerHandRiver, initBlackJack, endPoker, getNextCardBoard};
