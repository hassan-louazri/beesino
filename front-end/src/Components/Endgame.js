import { sendL2toL2FromBank} from "../scripts/Metamask";
import { sumValueCards } from "./CardGame";
import {useEffect} from "react";
import "../Styles/Multi.css";


function Endgame(props) {

    const playerScore = sumValueCards(props.playerHand);
    const dealerScore = sumValueCards(props.dealerHand);
    const end = props.end;
    const setEnd = props.setEnd;
    const betAmount = props.amount;
    const transaction = props.transaction;
    const setTransaction = props.setTransaction;

    const renderEndSentence = (end) => {
        const res = ["You win!","Dealer wins!","Tie game!","Such a looser ..."]
        return res[end];
    }

    let whowin = () => {
        if(transaction === true) return
        (playerScore >= dealerScore)
            ? (playerScore === dealerScore)
                ? setEnd(4)
                : setEnd(2)
            : setEnd(3);
        setTransaction(true);
    }

    const  gain = () => {
        // Relance la partie avec appel metamask
        (end === 2)
            ? sendL2toL2FromBank(props.addr, betAmount * 2).then()
            : (end === 4)
                ? sendL2toL2FromBank(props.addr, betAmount).then()
                : sendL2toL2FromBank(props.addr, betAmount/2).then();
    }

    const lose= () => {}

    useEffect(() => {
        const res = [whowin, gain, lose, gain, gain];
        res[end -1]();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[end])


    return (
        <div className={`end opponent-length-${props.nbOpponent}`}>
            <h2 className="winner text-color"> {renderEndSentence(end - 2)} </h2>
            {props.multi && !props.allStand && <h4 className="endWait text-color">
                Wait until the others finish their game </h4>
            }
            <button className="btn btn-light btn-lg buttonReset buttonShadow"
                    onClick={props.newGame} disabled={props.multi && !props.allStand}>
                {props.multi ? "Leave Table" : "Play Again"} </button>
        </div>
    );
}
export default Endgame;