import { useEffect, useState } from "react";
import BlackjackHand from "./BlackjackHand";

function PlayerPoker(props) {
    const [playerStatus, setOwnStatus] = useState(props.playersStatus.find(el => el.id === props.clientID))

    useEffect(() => {
        setOwnStatus(props.playersStatus.find(el => el.id === props.clientID))
    }, [props.playersStatus])
    
    return (
        <div className='player'>
            <div className="playerHand poker">
                <BlackjackHand hand={playerStatus.hand}/>
            </div>
            <div className="betAmount poker">
                <h5>
                    {props.currentTurn === playerStatus.turn &&
                        <span className="badge rounded-pill bg-danger p-2 mx-2"> </span>}
                    <span className="badge rounded-pill bg-secondary p-3 m-2">
                        Your bet: {playerStatus.bet * (10 ** (-3))} ETH
                    </span>
                    <span className="badge rounded-pill bg-secondary  p-3">
                        Your total bet: {playerStatus.totalBet * (10 ** (-3))} ETH
                    </span>
                    <span className="badge rounded-pill bg-danger  p-3">
                        {props.name}
                    </span>
                </h5>
            </div>
        </div>
    );

}

export default PlayerPoker;