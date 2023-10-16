import BlackjackHand from "./BlackjackHand";
import "../Styles/Multi.css";
import {useState, useEffect} from "react"

function BetDisplay(props) {
    return (
        <div className={`opponentBet${props.nb}`}>
            <h5 className="betAmountMulti">
                <span className="badge rounded-pill bg-secondary p-3 mx-2">
                    Bet: {props.amount * (10 ** (-3))} ETH
                </span>
                {props.game === 'Poker' &&
                    <span className="badge rounded-pill bg-secondary p-3 mx-2">
                        Total Bet: {props.totalBet * (10 ** (-3))} ETH</span>}
            </h5>
        </div>
    )
}

function CardDisplay(props) {
    const className = [`opponentCard${props.nb}`, `card-length-${props.cards.length}`];
    return (
        <div className="">
            <BlackjackHand hand={props.cards} className={className}/>
        </div>
    )
}

function InfoDisplay(props) {
    const turn = props.turn;
    const name = props.name;

    return (

        <div className={`opponentInfo${props.nb}`}>
            <h5 className="betAmountMulti">
                <span className="badge rounded-pill bg-danger p-3 mx-2">{name}</span>
                {props.game === "Poker" && props.currentTurn === turn &&
                    <span className="badge rounded-pill bg-danger p-2 mx-2"> </span>}
                <span className="badge rounded-pill bg-danger p-3 mx-2">Alive: {props.alive ? "Playing" : "Fold"}</span>
            </h5>
        </div>
    )
}

function OpponentDisplay(props) {
    let [playerStatus, setOwnStatus] = useState(props.playersStatus?.find(el => el.id === props.playerId))

    useEffect(() => {
        setOwnStatus(props.playersStatus?.find(el => el.id === props.playerId))
    }, [props.playersStatus])

    if (props.game === 'Blackjack')  playerStatus = props.playerStatus;

    return (
        <div className={`opponentContainer opponent${props.nb}`}>
                <InfoDisplay game={props.game} turn={playerStatus.turn} alive={playerStatus.alive}
                             name={playerStatus.pseudo} nb={props.nb} nbOpponent={props.nbOpponent} currentTurn={props.currentTurn}/>
                <BetDisplay game={props.game} amount={playerStatus.bet} nb={props.nb} totalBet={playerStatus.totalBet}
                            nbOpponent={props.nbOpponent}/>
                <CardDisplay cards={playerStatus.hand} nb={props.nb} nbOpponent={props.nbOpponent}/>
        </div>
    )
}

export default OpponentDisplay