import HandValueDisplay from "./HandValueDisplay";
import BlackjackHand from "./BlackjackHand";
import {useEffect} from "react";
import {sumValueCards} from "./CardGame";

function Player(props){
    const playerHand = props.cards;
    const setEnd = props.setEnd;
    const setStopHit = props.setStopHit;
    const socket = props.socket || undefined;

    useEffect(() => {
        if(sumValueCards(playerHand) === 21){
            setStopHit(true);
        } else if (sumValueCards(playerHand) > 21) {
            setStopHit(true);
            setEnd(3);
            props.setEndPlay(true);
            socket?.emit("standUpdate",props.tableName);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[playerHand,setEnd]);

    return(
        <div className='player'>
            <div className="playerHand">
                <BlackjackHand hand={playerHand}/>
            </div>
            <HandValueDisplay text={"Player"} cards={playerHand} style={props.style}/>
            <div className="betAmount">
                <h5><span className="badge rounded-pill bg-secondary betAmount p-3">
                    Your bet: {props.amount * (10 ** (-3))} ETH
                </span></h5>
            </div>
        </div>
    );
}

export default Player;