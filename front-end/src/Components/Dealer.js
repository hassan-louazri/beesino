import '../Styles/blackjack.css'
import CardGame from "./CardGame";
import HandValueDisplay from './HandValueDisplay';

function Dealer(props) {
    const dealerHand = props.hand;
    return (
        <div className='dealer'>
            <div className="row dealerHand">
                {dealerHand.map((card, i) =>
                    <div key={i} className='col'>
                        <CardGame key={i} suit={card.suit} face={card.face}/>
                    </div>
                )}
            </div>
            <HandValueDisplay text={"Dealer"} cards={dealerHand} style={props.style}/>
        </div>
    );
}

export default Dealer;