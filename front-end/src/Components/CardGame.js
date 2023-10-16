import {Card, CardStyles} from "./CasinoComponents";

export const dealCard = (card, setCard) => {
    const numRandom = Math.floor(Math.random() * card.length);
    const choiceCard = card[numRandom];
    card.splice(numRandom, 1);
    setCard(card);
    return choiceCard;
}
export function cardValue (face) {
    switch(face) {
        case 'A': return 11; // or 1
        case 'K':
        case 'Q':
        case 'J':
        case 'T': return 10;
        default: return Number(face);
    }
}

export const sumValueCards = (cards) => cards.map(card =>
    cardValue(card.face)).reduce((total,faceValue) => total + faceValue);

function CardGame(props){
    return(
        <div>
            <CardStyles/>
            <Card suit={props.suit} face={props.face}/>
        </div>
    );
}

export default CardGame;